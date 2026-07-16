// Stockage des tables dans le localStorage du navigateur.
// Chaque table est un tableau de lignes JSON sous la clé "prisma-local-db:<table>".

import type { RealtimeEvent, RealtimePayload } from './types';

const DB_PREFIX = 'prisma-local-db:';

export type Row = Record<string, unknown>;

type ChangeListener = (payload: RealtimePayload) => void;

const changeListeners = new Set<ChangeListener>();

// Synchronisation entre onglets : les écritures d'un onglet notifient les autres.
const broadcast: BroadcastChannel | null =
  typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel('prisma-local-db') : null;

if (broadcast) {
  broadcast.onmessage = (event: MessageEvent<RealtimePayload>) => {
    changeListeners.forEach((listener) => listener(event.data));
  };
}

export function onTableChange(listener: ChangeListener): () => void {
  changeListeners.add(listener);
  return () => changeListeners.delete(listener);
}

export function emitTableChange(table: string, eventType: RealtimeEvent, newRow: Row | null, oldRow: Row | null) {
  const payload: RealtimePayload = {
    eventType,
    schema: 'public',
    table,
    new: newRow,
    old: oldRow,
    commit_timestamp: new Date().toISOString(),
  };
  changeListeners.forEach((listener) => listener(payload));
  broadcast?.postMessage(payload);
}

export function readTable(table: string): Row[] {
  try {
    const raw = localStorage.getItem(DB_PREFIX + table);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error(`Lecture impossible de la table locale "${table}":`, error);
    return [];
  }
}

export function writeTable(table: string, rows: Row[]): void {
  localStorage.setItem(DB_PREFIX + table, JSON.stringify(rows));
}

export function generateId(table: string, rows: Row[]): string | number {
  // blog_posts utilise un identifiant numérique auto-incrémenté (SERIAL),
  // les autres tables un identifiant de type uuid.
  if (table === 'blog_posts') {
    const maxId = rows.reduce((max, row) => {
      const id = Number(row.id);
      return Number.isFinite(id) && id > max ? id : max;
    }, 0);
    return maxId + 1;
  }
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

// Valeurs par défaut appliquées à l'insertion, équivalentes aux DEFAULT des tables Postgres.
export function applyDefaults(table: string, row: Row): Row {
  const now = new Date().toISOString();
  const withDefaults: Row = { ...row };

  if (table === 'contact_messages') {
    if (withDefaults.date === undefined) withDefaults.date = now;
    if (withDefaults.read === undefined) withDefaults.read = false;
  } else if (table === 'media_files') {
    if (withDefaults.uploaded_at === undefined) withDefaults.uploaded_at = now;
  }

  if (withDefaults.created_at === undefined) {
    withDefaults.created_at = now;
  }

  return withDefaults;
}
