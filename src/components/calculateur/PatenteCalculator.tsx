import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { HelpCircle } from "lucide-react";
import { toNumber } from "@/utils/numberConversion";
import { calculatePatente } from "@/modules/gestion/lib/spec/fiscal";

const PatenteCalculator = () => {
  const [chiffreAffaires, setChiffreAffaires] = useState("");
  const [calculationResult, setCalculationResult] = useState<{
    montant: number;
    chiffreAffaires: number;
    plancherApplique: boolean;
    plafondApplique: boolean;
  } | null>(null);

  const handleCalculate = () => {
    const caNum = toNumber(chiffreAffaires);
    const res = calculatePatente(caNum);
    
    setCalculationResult({
      montant: res.montant,
      chiffreAffaires: caNum,
      plancherApplique: res.montantCalcule < res.plancher,
      plafondApplique: res.montantCalcule > res.plafond,
    });
  };

  const formatCurrency = (amount: number) => {
    return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " F CFA";
  };

  return (
    <Card className="border shadow-md">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-prisma-purple">
          Calculateur de Contribution des Patentes
        </CardTitle>
        <CardDescription>
          Estimez la Patente annuelle due par les entreprises relevant du régime du Réel (CA ≥ 50 000 000 F CFA).
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="caPatente">Chiffre d'affaires annuel HT (F CFA)</Label>
            <HelpCircle size={16} className="text-muted-foreground cursor-help" />
          </div>
          <Input
            type="text"
            id="caPatente"
            inputMode="numeric"
            placeholder="Ex: 100 000 000"
            value={chiffreAffaires}
            onChange={(e) => setChiffreAffaires(e.target.value)}
            className="text-right"
          />
        </div>

        <Button
          onClick={handleCalculate}
          className="w-full bg-prisma-purple hover:bg-prisma-purple/90"
          disabled={!chiffreAffaires}
        >
          Calculer la Patente
        </Button>

        {calculationResult && (
          <Card className="mt-6 border-2 border-prisma-purple/20 bg-neutral-50">
            <CardContent className="p-4 sm:p-6 space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b pb-3">
                <h3 className="text-lg font-semibold text-prisma-purple">Résultat de la Patente</h3>
                <span className="text-xs text-gray-500">
                  CA de {formatCurrency(calculationResult.chiffreAffaires)}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-white p-3 rounded-lg border">
                  <div className="text-xs text-gray-500 mb-1">Taux Légal</div>
                  <div className="text-base font-bold text-gray-800">0,283 %</div>
                </div>

                <div className="bg-white p-3 rounded-lg border">
                  <div className="text-xs text-gray-500 mb-1">Plancher Légal</div>
                  <div className="text-base font-bold text-gray-800">141 500 F CFA</div>
                </div>

                <div className="bg-white p-3 rounded-lg border">
                  <div className="text-xs text-gray-500 mb-1">Plafond Légal</div>
                  <div className="text-base font-bold text-gray-800">4 500 000 F CFA</div>
                </div>
              </div>

              <div className="bg-green-50 p-4 sm:p-5 rounded-lg border-2 border-green-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <div>
                  <div className="text-sm font-semibold text-green-900">
                    Montant annuel de la Patente
                  </div>
                  {calculationResult.plancherApplique && (
                    <span className="text-xs text-amber-700 block font-medium">
                      ⚠️ Plancher minimal légal de 141 500 F CFA appliqué
                    </span>
                  )}
                  {calculationResult.plafondApplique && (
                    <span className="text-xs text-amber-700 block font-medium">
                      ⚠️ Plafond maximal légal de 4 500 000 F CFA appliqué
                    </span>
                  )}
                </div>
                <div className="text-2xl font-bold text-green-700">
                  {formatCurrency(calculationResult.montant)}
                </div>
              </div>

              <div className="bg-purple-50 p-3.5 rounded-lg border border-purple-200 text-xs text-purple-900 space-y-1">
                <p>
                  📌 <strong>Échéance légale :</strong> La contribution des patentes doit être acquittée au plus tard le <strong>28 Février</strong> de chaque année auprès de votre centre des impôts de rattachement (CIME / CSI / DGE).
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  );
};

export default PatenteCalculator;
