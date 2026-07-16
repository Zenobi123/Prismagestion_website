// Réimplémentation locale du query builder PostgREST de supabase-js.
// Supporte la surface d'API utilisée par l'application :
// select / insert / update / delete / upsert, eq / neq / in / ilike,
// order / limit / range, single / maybeSingle, count exact et head.

import { applyDefaults, emitTableChange, generateId, readTable, writeTable, Row } from './store';
import type { PostgrestError } from './types';

type Action = 'select' | 'insert' | 'update' | 'delete' | 'upsert';

interface Filter {
  type: 'eq' | 'neq' | 'in' | 'ilike';
  column: string;
  value: unknown;
}

interface QueryResult {
  data: unknown;
  error: PostgrestError | null;
  count: number | null;
  status: number;
  statusText: string;
}

function makeError(message: string, code = 'LOCAL_DB_ERROR'): PostgrestError {
  return { message, code, details: null, hint: null };
}

function ilikeToRegExp(pattern: string): RegExp {
  const escaped = String(pattern).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`^${escaped.replace(/%/g, '.*').replace(/_/g, '.')}$`, 'i');
}

function matchesFilters(row: Row, filters: Filter[]): boolean {
  return filters.every((filter) => {
    const value = row[filter.column];
    switch (filter.type) {
      case 'eq':
        // Tolère les comparaisons nombre/chaîne (ex. id numérique vs paramètre d'URL).
        return value === filter.value || String(value) === String(filter.value);
      case 'neq':
        return value !== filter.value && String(value) !== String(filter.value);
      case 'in':
        return Array.isArray(filter.value) &&
          (filter.value as unknown[]).some((v) => v === value || String(v) === String(value));
      case 'ilike':
        return typeof value === 'string' && ilikeToRegExp(String(filter.value)).test(value);
      default:
        return true;
    }
  });
}

function projectColumns(row: Row, columns: string): Row {
  if (!columns || columns.trim() === '*') return { ...row };
  const projected: Row = {};
  for (const column of columns.split(',').map((c) => c.trim())) {
    if (!column) continue;
    if (column === '*') return { ...row };
    projected[column] = row[column];
  }
  return projected;
}

function compareValues(a: unknown, b: unknown): number {
  if (a === b) return 0;
  if (a === null || a === undefined) return -1;
  if (b === null || b === undefined) return 1;
  if (typeof a === 'number' && typeof b === 'number') return a - b;
  return String(a).localeCompare(String(b));
}

export class LocalQueryBuilder implements PromiseLike<QueryResult> {
  private table: string;
  private action: Action = 'select';
  private columns = '*';
  private countMode: 'exact' | null = null;
  private headOnly = false;
  private filters: Filter[] = [];
  private orderBy: { column: string; ascending: boolean } | null = null;
  private limitCount: number | null = null;
  private rangeBounds: { from: number; to: number } | null = null;
  private payload: Row[] = [];
  private upsertOnConflict = 'id';
  private returning = false;
  private singleMode: 'single' | 'maybeSingle' | null = null;

  constructor(table: string) {
    this.table = table;
  }

  select(columns = '*', options: { count?: 'exact'; head?: boolean } = {}) {
    if (this.action === 'select') {
      this.columns = columns;
      this.countMode = options.count ?? null;
      this.headOnly = options.head ?? false;
    } else {
      // .select() après une mutation : renvoyer les lignes affectées.
      this.returning = true;
      this.columns = columns;
    }
    return this;
  }

  insert(rows: Row | Row[]) {
    this.action = 'insert';
    this.payload = Array.isArray(rows) ? rows : [rows];
    return this;
  }

  update(values: Row) {
    this.action = 'update';
    this.payload = [values];
    return this;
  }

  upsert(rows: Row | Row[], options: { onConflict?: string } = {}) {
    this.action = 'upsert';
    this.payload = Array.isArray(rows) ? rows : [rows];
    this.upsertOnConflict = options.onConflict ?? 'id';
    return this;
  }

  delete() {
    this.action = 'delete';
    return this;
  }

  eq(column: string, value: unknown) {
    this.filters.push({ type: 'eq', column, value });
    return this;
  }

  neq(column: string, value: unknown) {
    this.filters.push({ type: 'neq', column, value });
    return this;
  }

  in(column: string, values: unknown[]) {
    this.filters.push({ type: 'in', column, value: values });
    return this;
  }

  ilike(column: string, pattern: string) {
    this.filters.push({ type: 'ilike', column, value: pattern });
    return this;
  }

  order(column: string, options: { ascending?: boolean } = {}) {
    this.orderBy = { column, ascending: options.ascending ?? true };
    return this;
  }

  limit(count: number) {
    this.limitCount = count;
    return this;
  }

  range(from: number, to: number) {
    this.rangeBounds = { from, to };
    return this;
  }

  single() {
    this.singleMode = 'single';
    return this;
  }

  maybeSingle() {
    this.singleMode = 'maybeSingle';
    return this;
  }

  then<TResult1 = QueryResult, TResult2 = never>(
    onfulfilled?: ((value: QueryResult) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null
  ): PromiseLike<TResult1 | TResult2> {
    return Promise.resolve().then(() => this.execute()).then(onfulfilled, onrejected);
  }

  private execute(): QueryResult {
    try {
      switch (this.action) {
        case 'select':
          return this.executeSelect();
        case 'insert':
          return this.executeInsert();
        case 'update':
          return this.executeUpdate();
        case 'upsert':
          return this.executeUpsert();
        case 'delete':
          return this.executeDelete();
        default:
          return this.failure(makeError(`Opération inconnue sur la table ${this.table}`));
      }
    } catch (error) {
      return this.failure(makeError(error instanceof Error ? error.message : String(error)));
    }
  }

  private executeSelect(): QueryResult {
    const rows = readTable(this.table).filter((row) => matchesFilters(row, this.filters));
    const count = this.countMode ? rows.length : null;

    if (this.headOnly) {
      return { data: null, error: null, count, status: 200, statusText: 'OK' };
    }

    let result = [...rows];
    if (this.orderBy) {
      const { column, ascending } = this.orderBy;
      result.sort((a, b) => (ascending ? 1 : -1) * compareValues(a[column], b[column]));
    }
    if (this.rangeBounds) {
      result = result.slice(this.rangeBounds.from, this.rangeBounds.to + 1);
    }
    if (this.limitCount !== null) {
      result = result.slice(0, this.limitCount);
    }

    const projected = result.map((row) => projectColumns(row, this.columns));
    return this.finalize(projected, count);
  }

  private executeInsert(): QueryResult {
    const rows = readTable(this.table);
    const inserted: Row[] = [];

    for (const item of this.payload) {
      const row = applyDefaults(this.table, { ...item });
      if (row.id === undefined || row.id === null) {
        row.id = generateId(this.table, rows);
      }
      rows.push(row);
      inserted.push(row);
    }

    writeTable(this.table, rows);
    inserted.forEach((row) => emitTableChange(this.table, 'INSERT', row, null));
    return this.finalizeMutation(inserted);
  }

  private executeUpdate(): QueryResult {
    const rows = readTable(this.table);
    const values = this.payload[0] ?? {};
    const updated: Row[] = [];

    const nextRows = rows.map((row) => {
      if (!matchesFilters(row, this.filters)) return row;
      const oldRow = { ...row };
      const newRow = { ...row, ...values };
      updated.push(newRow);
      emitTableChange(this.table, 'UPDATE', newRow, oldRow);
      return newRow;
    });

    writeTable(this.table, nextRows);
    return this.finalizeMutation(updated);
  }

  private executeUpsert(): QueryResult {
    const rows = readTable(this.table);
    const conflictKey = this.upsertOnConflict;
    const affected: Row[] = [];

    for (const item of this.payload) {
      const index = rows.findIndex(
        (row) => String(row[conflictKey]) === String((item as Row)[conflictKey])
      );
      if (index >= 0) {
        const oldRow = { ...rows[index] };
        rows[index] = { ...rows[index], ...item };
        affected.push(rows[index]);
        emitTableChange(this.table, 'UPDATE', rows[index], oldRow);
      } else {
        const row = applyDefaults(this.table, { ...item });
        if (row.id === undefined || row.id === null) {
          row.id = generateId(this.table, rows);
        }
        rows.push(row);
        affected.push(row);
        emitTableChange(this.table, 'INSERT', row, null);
      }
    }

    writeTable(this.table, rows);
    return this.finalizeMutation(affected);
  }

  private executeDelete(): QueryResult {
    const rows = readTable(this.table);
    const deleted = rows.filter((row) => matchesFilters(row, this.filters));
    const remaining = rows.filter((row) => !matchesFilters(row, this.filters));

    writeTable(this.table, remaining);
    deleted.forEach((row) => emitTableChange(this.table, 'DELETE', null, row));
    return this.finalizeMutation(deleted);
  }

  private finalizeMutation(affectedRows: Row[]): QueryResult {
    if (!this.returning && this.singleMode === null) {
      return { data: null, error: null, count: null, status: 204, statusText: 'No Content' };
    }
    const projected = affectedRows.map((row) => projectColumns(row, this.columns));
    return this.finalize(projected, null);
  }

  private finalize(rows: Row[], count: number | null): QueryResult {
    if (this.singleMode === 'single') {
      if (rows.length === 0) {
        return this.failure(
          makeError('JSON object requested, multiple (or no) rows returned', 'PGRST116'),
          406
        );
      }
      return { data: rows[0], error: null, count, status: 200, statusText: 'OK' };
    }
    if (this.singleMode === 'maybeSingle') {
      return { data: rows[0] ?? null, error: null, count, status: 200, statusText: 'OK' };
    }
    return { data: rows, error: null, count, status: 200, statusText: 'OK' };
  }

  private failure(error: PostgrestError, status = 500): QueryResult {
    return { data: null, error, count: null, status, statusText: error.message };
  }
}
