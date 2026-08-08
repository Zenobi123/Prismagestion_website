import { Button } from "@gestion/components/ui/button";
import { Trash2 } from "lucide-react";
import { ServiceActivityRow, formatNumberWithSeparator } from "./types";

interface ServiceActivityCardProps {
  row: ServiceActivityRow;
  handleCellChange: (id: string, field: keyof ServiceActivityRow, value: string) => void;
  removeRow: (id: string) => void;
}

const champStyle =
  "mt-1 h-11 w-full rounded border-2 border-neutral-300 px-2 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30";

/**
 * Rendu mobile d'une ligne d'activité de service. Le tableau compte onze
 * colonnes, dont quatre champs de saisie : en 375 px, chaque champ recevait
 * une trentaine de pixels — inutilisable. La fiche sépare ce qui se saisit de
 * ce qui se calcule.
 */
export const ServiceActivityCard = ({
  row,
  handleCellChange,
  removeRow,
}: ServiceActivityCardProps) => {
  const calculs: { libelle: string; valeur: number }[] = [
    { libelle: "Arrondi", valeur: row.arrondi },
    { libelle: "IR principal (5 %)", valeur: row.acompteIRPrincipal },
    { libelle: "IR CAC (10 %)", valeur: row.acompteIRCAC },
    { libelle: "Droit d'enregistrement", valeur: row.droitEnregistrement },
  ];

  return (
    <div className="rounded-md border-2 border-black/40 bg-white p-3">
      <div className="flex items-start justify-between gap-2">
        <label className="min-w-0 flex-1">
          <span className="text-xs text-neutral-600">Structure</span>
          <input
            type="text"
            value={row.structure}
            onChange={(e) => handleCellChange(row.id, "structure", e.target.value)}
            className={champStyle}
          />
        </label>
        <Button
          variant="ghost"
          size="sm"
          aria-label="Supprimer la ligne"
          className="cible-tactile mt-5 h-11 shrink-0 px-3 text-red-500 hover:text-red-600"
          onClick={() => removeRow(row.id)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      <div className="mt-2 grid grid-cols-2 gap-2">
        <label>
          <span className="text-xs text-neutral-600">Date</span>
          <input
            type="text"
            value={row.date}
            onChange={(e) => handleCellChange(row.id, "date", e.target.value)}
            className={champStyle}
          />
        </label>
        <label>
          <span className="text-xs text-neutral-600">N° marché</span>
          <input
            type="text"
            value={row.numeroMarche}
            onChange={(e) => handleCellChange(row.id, "numeroMarche", e.target.value)}
            className={champStyle}
          />
        </label>
      </div>

      <label className="mt-2 block">
        <span className="text-xs text-neutral-600">Montant HT</span>
        <input
          type="text"
          inputMode="numeric"
          value={row.montantHT ? formatNumberWithSeparator(row.montantHT) : ""}
          onChange={(e) => handleCellChange(row.id, "montantHT", e.target.value)}
          className={champStyle}
        />
      </label>

      <dl className="mt-2 space-y-0.5 border-t pt-2 text-xs">
        {calculs.map((c) => (
          <div key={c.libelle} className="flex justify-between gap-2">
            <dt className="text-neutral-500">{c.libelle}</dt>
            <dd>{formatNumberWithSeparator(c.valeur)}</dd>
          </div>
        ))}
        <div className="flex justify-between gap-2 pt-1 text-sm font-semibold">
          <dt>Montant TTC</dt>
          <dd>{formatNumberWithSeparator(row.montantTTC)}</dd>
        </div>
      </dl>
    </div>
  );
};

export default ServiceActivityCard;
