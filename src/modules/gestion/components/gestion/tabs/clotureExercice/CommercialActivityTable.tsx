
import React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@gestion/components/ui/table";
import { Input } from "@gestion/components/ui/input";

interface CommercialActivityRow {
  month: string;
  irPrincipal: number;
  irCAC: number;
  irTotal: number;
  caHT: number;
}

interface CommercialActivityTableProps {
  commercialActivityData: CommercialActivityRow[];
  handleIRPrincipalChange: (index: number, value: string) => void;
  formatNumberWithSeparator: (value: number) => string;
}

export const CommercialActivityTable = ({ 
  commercialActivityData,
  handleIRPrincipalChange,
  formatNumberWithSeparator
}: CommercialActivityTableProps) => {
  // Calculate totals
  const totals = commercialActivityData.reduce(
    (acc, curr) => ({
      month: "Total",
      irPrincipal: acc.irPrincipal + curr.irPrincipal,
      irCAC: acc.irCAC + curr.irCAC,
      irTotal: acc.irTotal + curr.irTotal,
      caHT: acc.caHT + curr.caHT
    }),
    { month: "Total", irPrincipal: 0, irCAC: 0, irTotal: 0, caHT: 0 }
  );

  return (
    <>
      {/* Mobile : une fiche par mois. Cinq colonnes dont un champ de saisie ne
          tiennent pas en 375 px — et saisir un montant dans une cellule large
          de quelques dizaines de pixels est intenable. */}
      <div className="space-y-2 sm:hidden">
        {commercialActivityData.map((row, index) => (
          <div key={index} className="rounded-md border bg-white p-3">
            <div className="flex items-center justify-between gap-2">
              <span className="font-medium">{row.month}</span>
              <span className="text-xs text-neutral-500">
                CA HT {formatNumberWithSeparator(row.caHT)}
              </span>
            </div>

            <label className="mt-2 block">
              <span className="text-xs text-neutral-600">Acompte sur IR (Principal)</span>
              <Input
                type="text"
                inputMode="numeric"
                value={row.irPrincipal ? formatNumberWithSeparator(row.irPrincipal) : ''}
                onChange={(e) => handleIRPrincipalChange(index, e.target.value)}
                className="mt-1 h-11 w-full"
              />
            </label>

            <dl className="mt-2 grid grid-cols-2 gap-2 text-xs">
              <div className="flex justify-between gap-2">
                <dt className="text-neutral-500">CAC</dt>
                <dd className="font-medium">{formatNumberWithSeparator(row.irCAC)}</dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-neutral-500">Total</dt>
                <dd className="font-medium">{formatNumberWithSeparator(row.irTotal)}</dd>
              </div>
            </dl>
          </div>
        ))}

        <div className="rounded-md border bg-slate-50 p-3 text-sm font-medium">
          <div className="flex items-center justify-between">
            <span>{totals.month}</span>
            <span>CA HT {formatNumberWithSeparator(totals.caHT)}</span>
          </div>
          <dl className="mt-1 grid grid-cols-3 gap-2 text-xs">
            <div className="flex justify-between gap-1">
              <dt className="text-neutral-500">Principal</dt>
              <dd>{formatNumberWithSeparator(totals.irPrincipal)}</dd>
            </div>
            <div className="flex justify-between gap-1">
              <dt className="text-neutral-500">CAC</dt>
              <dd>{formatNumberWithSeparator(totals.irCAC)}</dd>
            </div>
            <div className="flex justify-between gap-1">
              <dt className="text-neutral-500">Total</dt>
              <dd>{formatNumberWithSeparator(totals.irTotal)}</dd>
            </div>
          </dl>
        </div>
      </div>

      <div className="hidden rounded-md border overflow-x-auto sm:block">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Mois</TableHead>
            <TableHead>Accompte sur IR (Principal)</TableHead>
            <TableHead>Accompte sur IR (CAC)</TableHead>
            <TableHead>Accompte sur IR (Total)</TableHead>
            <TableHead className="w-36 min-w-36">CA HT</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {commercialActivityData.map((row, index) => (
            <TableRow key={index}>
              <TableCell>{row.month}</TableCell>
              <TableCell>
                <Input
                  type="text"
                  value={row.irPrincipal ? formatNumberWithSeparator(row.irPrincipal) : ''}
                  onChange={(e) => handleIRPrincipalChange(index, e.target.value)}
                  className="w-full"
                />
              </TableCell>
              <TableCell>{formatNumberWithSeparator(row.irCAC)}</TableCell>
              <TableCell>{formatNumberWithSeparator(row.irTotal)}</TableCell>
              <TableCell className="min-w-36">{formatNumberWithSeparator(row.caHT)}</TableCell>
            </TableRow>
          ))}
          <TableRow className="font-medium bg-slate-50">
            <TableCell>{totals.month}</TableCell>
            <TableCell>{formatNumberWithSeparator(totals.irPrincipal)}</TableCell>
            <TableCell>{formatNumberWithSeparator(totals.irCAC)}</TableCell>
            <TableCell>{formatNumberWithSeparator(totals.irTotal)}</TableCell>
            <TableCell className="min-w-36">{formatNumberWithSeparator(totals.caHT)}</TableCell>
          </TableRow>
        </TableBody>
      </Table>
      </div>
    </>
  );
};
