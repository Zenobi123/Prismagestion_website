
import React from "react";
import { Card, CardContent } from "@/components/ui/card";

interface TaxResultProps {
  result?: {
    classe: number;
    montant: number;
    tdl?: number;
    penalites?: number;
    moisRetard?: number;
    total?: number;
    montantTrimestriel?: number;
    echeancesTrimestrielles?: string[];
    echeanceAnnuelle?: string;
    chiffreAffaires: number;
    minRange: number;
    maxRange: number;
    message?: string;
  };
  amount?: number;
  details?: string;
}

const TaxResultDisplay = ({ result, amount, details }: TaxResultProps) => {
  // If we have result object (for IGS calculator)
  if (result) {
    // Formatteur pour les nombres en F CFA
    const formatCurrency = (amount: number) => {
      return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " F CFA";
    };

    // Fonction pour afficher la fourchette
    const formatRange = () => {
      if (result.classe === 1) {
        return `Moins de ${formatCurrency(result.maxRange)}`;
      } else {
        return `De ${formatCurrency(result.minRange)} à ${formatCurrency(result.maxRange)}`;
      }
    };

    return (
      <Card className="mt-6 border-2 border-prisma-purple/20">
        <CardContent className="p-4 xs:p-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-4 gap-2">
            <h3 className="text-lg xs:text-xl font-semibold text-prisma-purple">Résultat du calcul</h3>
            <span className="text-gray-500 text-xs xs:text-sm">
              Pour un chiffre d'affaires de {formatCurrency(result.chiffreAffaires)}
            </span>
          </div>

          <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-3 xs:gap-4 mt-4">
            <div className="bg-prisma-light-gray p-3 xs:p-4 rounded-lg">
              <div className="text-xs sm:text-sm text-gray-500 mb-1">Classe</div>
              <div className="text-xl sm:text-2xl font-bold text-prisma-purple">{result.classe}</div>
            </div>
            
            <div className="bg-prisma-light-gray p-3 xs:p-4 rounded-lg">
              <div className="text-xs sm:text-sm text-gray-500 mb-1">Fourchette</div>
              <div className="text-[10px] xs:text-xs sm:text-sm font-medium break-words">{formatRange()}</div>
            </div>
            
            <div className="bg-prisma-light-gray p-3 xs:p-4 rounded-lg">
              <div className="text-xs sm:text-sm text-gray-500 mb-1">IGS (Principal)</div>
              <div className="text-base xs:text-lg sm:text-xl font-bold text-prisma-purple break-all sm:break-normal">{formatCurrency(result.montant)}</div>
            </div>

            {result.tdl !== undefined && (
              <div className="bg-prisma-light-gray p-3 xs:p-4 rounded-lg border-l-4 border-amber-400">
                <div className="text-xs sm:text-sm text-gray-500 mb-1">TDL (Barème 2026)</div>
                <div className="text-base xs:text-lg sm:text-xl font-bold text-amber-600 break-all sm:break-normal">{formatCurrency(result.tdl)}</div>
              </div>
            )}
          </div>

          {result.penalites !== undefined && result.penalites > 0 && (
            <div className="mt-3 bg-red-50 p-3.5 rounded-lg border-l-4 border-red-500 flex justify-between items-center">
              <div>
                <span className="font-semibold text-red-900 text-sm block">Pénalités de retard ({result.moisRetard} mois × 10 %)</span>
                <span className="text-xs text-red-700">10 % par mois sur le principal IGS</span>
              </div>
              <div className="text-lg font-bold text-red-700">{formatCurrency(result.penalites)}</div>
            </div>
          )}

          {result.total !== undefined && (
            <div className="mt-4 bg-green-50 p-4 sm:p-6 rounded-lg border-2 border-green-200">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <div className="text-base sm:text-lg font-semibold text-green-800">
                  Total à payer {result.penalites && result.penalites > 0 ? "(IGS + TDL + Pénalités)" : "(IGS + TDL)"}
                </div>
                <div className="text-2xl sm:text-3xl font-bold text-green-700 break-all">{formatCurrency(result.total)}</div>
              </div>
            </div>
          )}

          {result.total !== undefined && result.total > 0 && (
            <div className="mt-4 bg-purple-50 p-4 rounded-lg border border-purple-200">
              <h4 className="text-sm font-semibold text-prisma-purple mb-2">Échéancier de paiement et déclaration</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 text-xs text-gray-700 mb-3">
                <div className="bg-white p-2.5 rounded border border-purple-100">
                  <span className="font-semibold text-purple-900 block">T1 — Échéance 15 Février</span>
                  <span>Acompte : {formatCurrency(result.montantTrimestriel || Math.round(result.total / 4))}</span>
                </div>
                <div className="bg-white p-2.5 rounded border border-purple-100">
                  <span className="font-semibold text-purple-900 block">T2 — Échéance 15 Mai</span>
                  <span>Acompte : {formatCurrency(result.montantTrimestriel || Math.round(result.total / 4))}</span>
                </div>
                <div className="bg-white p-2.5 rounded border border-purple-100">
                  <span className="font-semibold text-purple-900 block">T3 — Échéance 15 Août</span>
                  <span>Acompte : {formatCurrency(result.montantTrimestriel || Math.round(result.total / 4))}</span>
                </div>
                <div className="bg-white p-2.5 rounded border border-purple-100">
                  <span className="font-semibold text-purple-900 block">T4 — Échéance 15 Novembre</span>
                  <span>Acompte : {formatCurrency(result.montantTrimestriel || Math.round(result.total / 4))}</span>
                </div>
              </div>
              <p className="text-xs text-purple-800">
                📌 <strong>Déclaration annuelle de l'IGS :</strong> Échéance fixée au <strong>15 Juin</strong>.
              </p>
            </div>
          )}

          {result.message && (
            <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-md text-amber-800">
              {result.message}
            </div>
          )}

          <p className="mt-6 text-sm text-gray-500">
            Ce calcul est basé sur les barèmes actuellement en vigueur au Cameroun pour l'Impôt Global Synthétique. Pour des conseils personnalisés en fiscalité, comptabilité ou gestion, PRISMA GESTION se tient à votre disposition. Contactez nos experts pour un accompagnement adapté à votre situation.
          </p>
        </CardContent>
      </Card>
    );
  }
  
  // For other calculators that use amount and details
  if (amount !== undefined && details) {
    return (
      <div className="px-4 py-3 bg-prisma-light-gray rounded-lg">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
          <div>
            <span className="text-sm text-gray-500">Montant calculé:</span>
            <div className="text-xl font-bold text-green-600">
              {Math.round(amount || 0).toLocaleString('fr-FR')} F CFA
            </div>
          </div>
          <button
            type="button"
            className="text-xs text-gray-500 hover:text-prisma-purple mt-2 md:mt-0"
            title="Détail du calcul"
            onClick={() => alert(details)}
          >
            Voir le détail
          </button>
        </div>
      </div>
    );
  }

  return null;
};

export default TaxResultDisplay;
