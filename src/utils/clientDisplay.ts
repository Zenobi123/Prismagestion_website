export interface ClientDisplayInfo {
  nomCommercial?: string | null;
  email?: string | null;
}

export const getClientSecondaryLabel = (client: ClientDisplayInfo): string => {
  return client.nomCommercial?.trim() || '';
};
