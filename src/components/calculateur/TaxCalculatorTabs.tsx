
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import IGSCalculatorTab from "./igs/IGSCalculatorTab";
import IRPPCalculator from "./IRPPCalculator";
import IRCMCalculator from "./IRCMCalculator";
import SuccessionCalculator from "./SuccessionCalculator";
import BailCalculator from "./BailCalculator";
import AbattageCalculator from "./AbattageCalculator";
import TVACalculator from "./TVACalculator";

const TaxCalculatorTabs = () => {
  return (
    <Tabs defaultValue="igs">
      {/* `h-auto` est indispensable : avec la hauteur fixe de TabsList, les onglets
          repliés par `flex-wrap` sortaient de la boîte et devenaient inatteignables
          sur mobile (4 des 7 onglets étaient masqués sous 414 px). */}
      <TabsList className="mb-6 w-full h-auto flex-wrap justify-start gap-1">
        <TabsTrigger value="igs">IGS</TabsTrigger>
        <TabsTrigger value="irpp">IRPP</TabsTrigger>
        <TabsTrigger value="ircm">IRCM (Dividendes)</TabsTrigger>
        <TabsTrigger value="succession">Droits de Succession</TabsTrigger>
        <TabsTrigger value="bail">Droits d'Enregistrement (Baux)</TabsTrigger>
        <TabsTrigger value="abattage">Taxe d'Abattage</TabsTrigger>
        <TabsTrigger value="tva">TVA</TabsTrigger>
      </TabsList>

      <TabsContent value="igs" className="mt-2">
        <IGSCalculatorTab />
      </TabsContent>

      <TabsContent value="irpp" className="mt-2">
        <IRPPCalculator />
      </TabsContent>

      <TabsContent value="ircm" className="mt-2">
        <IRCMCalculator />
      </TabsContent>

      <TabsContent value="succession" className="mt-2">
        <SuccessionCalculator />
      </TabsContent>

      <TabsContent value="bail" className="mt-2">
        <BailCalculator />
      </TabsContent>

      <TabsContent value="abattage" className="mt-2">
        <AbattageCalculator />
      </TabsContent>

      <TabsContent value="tva" className="mt-2">
        <TVACalculator />
      </TabsContent>
    </Tabs>
  );
};

export default TaxCalculatorTabs;
