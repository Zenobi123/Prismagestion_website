
import { useQuery } from "@tanstack/react-query";
import { getClients } from "@gestion/services/clientService";
import { formatClientsForSelector } from "@gestion/services/factureFormatService";
import { Client } from "@gestion/types/client";

export const useClientsCommon = () => {
  // Fetch clients using the client service
  const { data: clientsData = [], isLoading, error } = useQuery({
    queryKey: ["clients"],
    queryFn: () => getClients(false),
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 2
  });
  
  // Format clients for selector
  const clients = formatClientsForSelector(clientsData);
  
  return {
    clients,
    isLoading,
    error
  };
};
