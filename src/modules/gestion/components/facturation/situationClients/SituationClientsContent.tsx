
import { lazy, Suspense } from "react";
import ClientsList from "./ClientsList";
import { ClientFinancialSummary } from "@gestion/types/clientFinancial";

// recharts (~380 ko) chargé à part : la liste devient interactive sans attendre le graphique
const ClientsChart = lazy(() => import("./ClientsChart"));

interface SituationClientsContentProps {
  clientsSummary: ClientFinancialSummary[];
  isLoading: boolean;
  chartData: Array<{ name: string; total: number }>;
  onViewDetails: (clientId: string) => void;
}

const SituationClientsContent = ({
  clientsSummary,
  isLoading,
  chartData,
  onViewDetails
}: SituationClientsContentProps) => {
  return (
    <div className="flex flex-col gap-6">
      <ClientsList 
        clientsSummary={clientsSummary} 
        isLoading={isLoading} 
        onViewDetails={onViewDetails} 
      />
      
      <Suspense fallback={<div className="h-64 rounded-lg border bg-muted/30 animate-pulse" />}>
        <ClientsChart chartData={chartData} />
      </Suspense>
    </div>
  );
};

export default SituationClientsContent;
