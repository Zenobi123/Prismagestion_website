
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import IGSCalculatorTab from "./igs/IGSCalculatorTab";
import PatenteCalculator from "./PatenteCalculator";

const TaxCalculatorTabs = () => {
  return (
    <Tabs defaultValue="igs">
      <TabsList className="mb-6 w-full h-auto flex flex-row justify-start gap-2 border-b pb-2">
        <TabsTrigger value="igs" className="px-6 py-2 text-sm sm:text-base font-semibold">
          IGS (Impôt Général Synthétique)
        </TabsTrigger>
        <TabsTrigger value="patente" className="px-6 py-2 text-sm sm:text-base font-semibold">
          Patente (Contribution des Patentes)
        </TabsTrigger>
      </TabsList>

      <TabsContent value="igs" className="mt-2">
        <IGSCalculatorTab />
      </TabsContent>

      <TabsContent value="patente" className="mt-2">
        <PatenteCalculator />
      </TabsContent>
    </Tabs>
  );
};

export default TaxCalculatorTabs;
