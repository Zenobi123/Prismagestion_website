
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { HelpCircle } from 'lucide-react';
import { toNumber } from '@/utils/numberConversion';
import { calculateTaxClass } from '@/utils/taxCalculations';

export interface IGSFormValues {
  chiffreAffaires: number;
  moisRetard?: number;
}

interface IGSCalculatorFormProps {
  onCalculate: (result: { amount: number; details: string }) => void;
  onSubmit: (values: IGSFormValues) => void;
}

const IGSCalculatorForm = ({ onCalculate, onSubmit }: IGSCalculatorFormProps) => {
  const [chiffreAffaires, setChiffreAffaires] = useState('');
  const [moisRetard, setMoisRetard] = useState('0');

  const handleCalculate = () => {
    const chiffreAffairesNum = toNumber(chiffreAffaires);
    const moisRetardNum = Math.max(0, toNumber(moisRetard) || 0);
    
    // Générer les détails du calcul
    const taxResult = calculateTaxClass(chiffreAffairesNum, moisRetardNum);
    
    onCalculate({
      amount: taxResult.montant,
      details: `Classe: ${taxResult.classe}\nChiffre d'affaires: ${taxResult.chiffreAffaires.toLocaleString()} F CFA\nMontant IGS: ${taxResult.montant.toLocaleString()} F CFA\nPénalités: ${taxResult.penalites.toLocaleString()} F CFA (${moisRetardNum} mois de retard)\nFourchette: ${taxResult.minRange.toLocaleString()} - ${taxResult.maxRange === Number.POSITIVE_INFINITY ? '∞' : taxResult.maxRange.toLocaleString()} F CFA`
    });
    
    const formValues: IGSFormValues = {
      chiffreAffaires: chiffreAffairesNum,
    };
    if (moisRetardNum > 0) {
      formValues.moisRetard = moisRetardNum;
    }
    
    onSubmit(formValues);
  };

  return (
    <Card className="border shadow-md">
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="chiffreAffaires">Chiffre d'affaires annuel (F CFA)</Label>
              <HelpCircle size={16} className="text-muted-foreground cursor-help" />
            </div>
            <Input
              type="text"
              id="chiffreAffaires"
              inputMode="numeric"
              placeholder="Entrez votre chiffre d'affaires"
              value={chiffreAffaires}
              onChange={(e) => setChiffreAffaires(e.target.value)}
              className="text-right"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="moisRetard">Retard de paiement (nombre de mois)</Label>
              <span className="text-xs text-muted-foreground">10 % / mois</span>
            </div>
            <Input
              type="number"
              id="moisRetard"
              min="0"
              placeholder="0 (aucun retard)"
              value={moisRetard}
              onChange={(e) => setMoisRetard(e.target.value)}
              className="text-right"
            />
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          onClick={handleCalculate} 
          className="w-full"
          disabled={!chiffreAffaires}
        >
          Calculer l'IGS
        </Button>
      </CardFooter>
    </Card>
  );
};

export default IGSCalculatorForm;
