// Définitions de tables Supabase absentes des types générés (src/integrations/supabase/types.ts)
// mais bien présentes en base. Permet d'utiliser le client typé sans `as any`.
// À fusionner dans le type Database (voir client.ts). Régénérer types.ts rendra
// les entrées correspondantes inutiles.

export type ExtraTables = {
  rapports_mission: {
    Row: {
      id: string;
      task_id: string;
      file_format: string;
      contenu_parse: string | null;
      file_path: string | null;
      statut: string;
      rapport_superviseur_id: string | null;
      rapport_client_id: string | null;
      created_at: string;
      updated_at: string;
    };
    Insert: {
      id?: string;
      task_id: string;
      file_format?: string;
      contenu_parse?: string | null;
      file_path?: string | null;
      statut?: string;
      rapport_superviseur_id?: string | null;
      rapport_client_id?: string | null;
      created_at?: string;
      updated_at?: string;
    };
    Update: {
      id?: string;
      task_id?: string;
      file_format?: string;
      contenu_parse?: string | null;
      file_path?: string | null;
      statut?: string;
      rapport_superviseur_id?: string | null;
      rapport_client_id?: string | null;
      created_at?: string;
      updated_at?: string;
    };
    Relationships: [
      {
        foreignKeyName: "rapports_mission_task_id_fkey";
        columns: ["task_id"];
        isOneToOne: false;
        referencedRelation: "tasks";
        referencedColumns: ["id"];
      },
    ];
  };
  // Identite du cabinet, ligne unique (contrainte id = 1). Toutes les colonnes
  // ont une valeur par defaut en base : un Insert n'a besoin de rien.
  cabinet_config: {
    Row: {
      id: number;
      nom_cabinet: string;
      slogan: string;
      siege: string;
      telephone: string;
      niu: string;
      signataire_nom: string;
      signataire_titre: string;
      signature: string | null;
      cachet: string | null;
      signature_promo: string;
      mode_paiement: string;
      numeros_paiement: string;
      echeance_facture: string;
      updated_at: string;
    };
    Insert: {
      id?: number;
      nom_cabinet?: string;
      slogan?: string;
      siege?: string;
      telephone?: string;
      niu?: string;
      signataire_nom?: string;
      signataire_titre?: string;
      signature?: string | null;
      cachet?: string | null;
      signature_promo?: string;
      mode_paiement?: string;
      numeros_paiement?: string;
      echeance_facture?: string;
      updated_at?: string;
    };
    Update: {
      id?: number;
      nom_cabinet?: string;
      slogan?: string;
      siege?: string;
      telephone?: string;
      niu?: string;
      signataire_nom?: string;
      signataire_titre?: string;
      signature?: string | null;
      cachet?: string | null;
      signature_promo?: string;
      mode_paiement?: string;
      numeros_paiement?: string;
      echeance_facture?: string;
      updated_at?: string;
    };
    Relationships: [];
  };
};
