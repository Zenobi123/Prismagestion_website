import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@gestion/components/ui/card";
import { Button } from "@gestion/components/ui/button";
import { Input } from "@gestion/components/ui/input";
import { Label } from "@gestion/components/ui/label";
import { Checkbox } from "@gestion/components/ui/checkbox";
import { calculateIGS, calculateTDL } from "@gestion/lib/spec/fiscal";
import { BAREME_IGS } from "@gestion/lib/spec/fiscal-constants";

const formatMoney = (amount: number) =>
  Math.round(amount || 0).toLocaleString("fr-FR") + " F CFA";

/** Convertit la saisie utilisateur ("2 500 000", "2500000,5") en nombre. */
const parseMontant = (value: string): number => {
  const formatted = value.trim().replace(/\s/g, "").replace(",", ".");
  const n = Number(formatted);
  return Number.isNaN(n) ? 0 : n;
};

interface IGSResultState {
  ca: number;
  isCGA: boolean;
  classe: number;
  montantPrincipal: number;
  montant: number;
  tdl: number;
  total: number;
  horsBareme: boolean;
}

const CA_MAX_IGS = BAREME_IGS[BAREME_IGS.length - 1].max;

/**
 * Calculateur IGS repris de l'outil « Outils Pratiques » du site vitrine
 * PRISMA GESTION, branché sur la logique fiscale canonique de l'application
 * (barème officiel, réduction CGA, TDL sur l'IGS principal).
 */
const IGSCalculatorCard = () => {
  const [chiffreAffaires, setChiffreAffaires] = useState("");
  const [isCGA, setIsCGA] = useState(false);
  const [result, setResult] = useState<IGSResultState | null>(null);

  const handleCalculate = () => {
    const ca = parseMontant(chiffreAffaires);
    const igs = calculateIGS(ca, isCGA);
    const tdl = calculateTDL(igs.montantPrincipal);
    setResult({
      ca,
      isCGA,
      classe: igs.classe,
      montantPrincipal: igs.montantPrincipal,
      montant: igs.montant,
      tdl,
      total: igs.montant + tdl,
      horsBareme: igs.horsBareme,
    });
  };

  const bracket = result
    ? BAREME_IGS.find((t) => t.classe === result.classe)
    : undefined;

  const formatRange = () => {
    if (!bracket) return "";
    return bracket.classe === 1
      ? `Moins de ${formatMoney(bracket.max + 1)}`
      : `De ${formatMoney(bracket.min)} à ${formatMoney(bracket.max)}`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Calculer votre IGS</CardTitle>
        <CardDescription>
          Entrez le chiffre d'affaires annuel hors taxes pour calculer le montant de
          l'Impôt Général Synthétique à payer selon le barème camerounais en vigueur.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="outils-igs-ca">Chiffre d'affaires annuel (F CFA)</Label>
          <Input
            id="outils-igs-ca"
            type="text"
            inputMode="numeric"
            placeholder="Entrez le chiffre d'affaires"
            value={chiffreAffaires}
            onChange={(e) => setChiffreAffaires(e.target.value)}
            className="text-right"
          />
        </div>

        <div className="flex items-center gap-2">
          <Checkbox
            id="outils-igs-cga"
            checked={isCGA}
            onCheckedChange={(checked) => setIsCGA(checked === true)}
          />
          <Label htmlFor="outils-igs-cga" className="font-normal cursor-pointer">
            Membre d'un centre de gestion agréé (CGA) — réduction de 50 % de l'IGS
          </Label>
        </div>

        <Button
          onClick={handleCalculate}
          className="w-full"
          disabled={!chiffreAffaires.trim()}
        >
          Calculer l'IGS
        </Button>

        {result && result.horsBareme && (
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-md text-amber-800 text-sm">
            {result.ca > CA_MAX_IGS
              ? "Le chiffre d'affaires atteint ou dépasse 50 000 000 F CFA : le régime de l'IGS ne s'applique plus. Veuillez vous référer au régime du réel (Patente)."
              : "Calcul impossible. Veuillez vérifier le chiffre d'affaires saisi."}
          </div>
        )}

        {result && !result.horsBareme && (
          <div className="border-2 border-primary/20 rounded-lg p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-2">
              <h3 className="text-lg font-semibold text-primary">Résultat du calcul</h3>
              <span className="text-neutral-500 text-xs sm:text-sm">
                Pour un chiffre d'affaires de {formatMoney(result.ca)}
              </span>
            </div>

            <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <div className="bg-neutral-100 p-3 sm:p-4 rounded-lg">
                <div className="text-xs sm:text-sm text-neutral-500 mb-1">Classe</div>
                <div className="text-xl sm:text-2xl font-bold text-primary">{result.classe}</div>
              </div>

              <div className="bg-neutral-100 p-3 sm:p-4 rounded-lg">
                <div className="text-xs sm:text-sm text-neutral-500 mb-1">Fourchette</div>
                <div className="text-xs sm:text-sm font-medium break-words">{formatRange()}</div>
              </div>

              <div className="bg-neutral-100 p-3 sm:p-4 rounded-lg">
                <div className="text-xs sm:text-sm text-neutral-500 mb-1">
                  {result.isCGA ? "IGS (après réduction CGA)" : "IGS (principal)"}
                </div>
                <div className="text-base sm:text-xl font-bold text-primary break-words">
                  {formatMoney(result.montant)}
                </div>
                {result.isCGA && (
                  <div className="text-[11px] text-neutral-500 mt-1">
                    Barème : {formatMoney(result.montantPrincipal)}
                  </div>
                )}
              </div>

              <div className="bg-neutral-100 p-3 sm:p-4 rounded-lg border-l-4 border-amber-400">
                <div className="text-xs sm:text-sm text-neutral-500 mb-1">TDL</div>
                <div className="text-base sm:text-xl font-bold text-amber-600 break-words">
                  {formatMoney(result.tdl)}
                </div>
              </div>
            </div>

            <div className="mt-4 bg-green-50 p-4 sm:p-6 rounded-lg border-2 border-green-200">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <div className="text-base sm:text-lg font-semibold text-green-800">
                  Total à payer (IGS + TDL)
                </div>
                <div className="text-2xl sm:text-3xl font-bold text-green-700 break-words">
                  {formatMoney(result.total)}
                </div>
              </div>
            </div>

            <p className="mt-4 text-xs sm:text-sm text-neutral-500">
              Ce calcul est basé sur le barème actuellement en vigueur au Cameroun pour
              l'Impôt Général Synthétique. La TDL est calculée sur l'IGS principal
              (avant réduction CGA).
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default IGSCalculatorCard;
