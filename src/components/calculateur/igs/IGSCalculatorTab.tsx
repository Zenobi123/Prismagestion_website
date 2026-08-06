
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import IGSCalculatorForm, { IGSFormValues } from "./IGSCalculatorForm";
import TaxResultDisplay from "../TaxResultDisplay";
import { calculateTaxClass } from "@/utils/taxCalculations";
import IGSInformation from "./IGSInformation";

const IGSCalculatorTab = () => {
  const [result, setResult] = useState<{
    classe: number;
    montant: number;
    chiffreAffaires: number;
    minRange: number;
    maxRange: number;
    message?: string;
  } | null>(null);
  
  const [calculationResult, setCalculationResult] = useState<{
    amount: number;
    details: string;
  } | null>(null);

  const handleSubmit = (values: IGSFormValues) => {
    const chiffreAffaires = values.chiffreAffaires;
    const moisRetard = values.moisRetard || 0;
    const taxResult = calculateTaxClass(chiffreAffaires, moisRetard);
    setResult(taxResult);
  };
  
  const handleCalculate = (calcResult: { amount: number; details: string }) => {
    setCalculationResult(calcResult);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Calculer votre IGS</CardTitle>
        <CardDescription>
          Entrez votre chiffre d'affaires annuel pour calculer le montant de l'Impôt Général Synthétique à payer.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <IGSCalculatorForm onCalculate={handleCalculate} onSubmit={handleSubmit} />
        {result && <TaxResultDisplay result={result} />}
        <IGSInformation />
      </CardContent>
    </Card>
  );
};

export default IGSCalculatorTab;
