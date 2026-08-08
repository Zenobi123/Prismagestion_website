
import React from "react";
import { Table, TableBody, TableCell, TableRow } from "@gestion/components/ui/table";
import { ServiceActivityTableHeader } from "./ServiceActivityTableHeader";
import { ServiceActivityTableRowComponent } from "./ServiceActivityTableRow";
import { ServiceActivityTableFooter } from "./ServiceActivityTableFooter";
import { ServiceActivityRow, calculateTotals, formatNumberWithSeparator } from "./types";
import { ServiceActivityCard } from "./ServiceActivityCard";

interface ServiceActivityTableProps {
  rows: ServiceActivityRow[];
  handleCellChange: (id: string, field: keyof ServiceActivityRow, value: string) => void;
  removeRow: (id: string) => void;
}

export const ServiceActivityTable = ({ rows, handleCellChange, removeRow }: ServiceActivityTableProps) => {
  const totals = calculateTotals(rows);

  return (
    <>
      {/* Mobile : une fiche par ligne. Onze colonnes dont quatre champs de
          saisie laissaient une trentaine de pixels par champ en 375 px. */}
      <div className="space-y-2 sm:hidden">
        {rows.map((row) => (
          <ServiceActivityCard
            key={row.id}
            row={row}
            handleCellChange={handleCellChange}
            removeRow={removeRow}
          />
        ))}
        {rows.length === 0 && (
          <p className="rounded-md border-2 border-black/40 py-4 text-center text-muted-foreground">
            Aucune donnée. Cliquez sur « Ajouter » pour commencer.
          </p>
        )}
        {rows.length > 0 && (
          <dl className="rounded-md border-2 border-black bg-slate-50 p-3 text-sm">
            <div className="flex justify-between gap-2 font-semibold">
              <dt>Total TTC</dt>
              <dd>{formatNumberWithSeparator(totals.montantTTC)}</dd>
            </div>
            <div className="mt-1 flex justify-between gap-2 text-xs">
              <dt className="text-neutral-500">Total HT</dt>
              <dd>{formatNumberWithSeparator(totals.montantHT)}</dd>
            </div>
            <div className="flex justify-between gap-2 text-xs">
              <dt className="text-neutral-500">IR principal + CAC</dt>
              <dd>
                {formatNumberWithSeparator(totals.acompteIRPrincipal + totals.acompteIRCAC)}
              </dd>
            </div>
            <div className="flex justify-between gap-2 text-xs">
              <dt className="text-neutral-500">Droits d'enregistrement</dt>
              <dd>{formatNumberWithSeparator(totals.droitEnregistrement)}</dd>
            </div>
          </dl>
        )}
      </div>

      <div className="hidden overflow-x-auto border-2 rounded-md border-black shadow-md sm:block">
      <Table className="border-collapse">
        <ServiceActivityTableHeader />
        <TableBody>
          {rows.map((row) => (
            <ServiceActivityTableRowComponent 
              key={row.id} 
              row={row} 
              handleCellChange={handleCellChange}
              removeRow={removeRow}
            />
          ))}
          {rows.length === 0 && (
            <TableRow>
              <TableCell colSpan={11} className="text-center py-4 text-muted-foreground border-b-2 border-black/40">
                Aucune donnée. Cliquez sur "Ajouter" pour commencer.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
        <ServiceActivityTableFooter totals={totals} />
      </Table>
      </div>
    </>
  );
};
