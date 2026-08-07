// Définitions de tables Supabase absentes des types générés (src/integrations/supabase/types.ts)
// mais bien présentes en base. Permet d'utiliser le client typé sans `as any`.
// À fusionner dans le type Database (voir client.ts). Régénérer types.ts rendra
// les entrées correspondantes inutiles.

import type { Json } from "./types";

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
  // Exercices comptables clotures (migration 20260807160000). Une annee
  // absente de la table est ouverte : seules les clotures y figurent.
  exercices: {
    Row: {
      annee: number;
      statut: string;
      cloture_le: string;
      cloture_par: string | null;
      created_at: string;
      updated_at: string;
    };
    Insert: {
      annee: number;
      statut?: string;
      cloture_le?: string;
      cloture_par?: string | null;
      created_at?: string;
      updated_at?: string;
    };
    Update: {
      annee?: number;
      statut?: string;
      cloture_le?: string;
      cloture_par?: string | null;
      created_at?: string;
      updated_at?: string;
    };
    Relationships: [];
  };
  // Vue de lecture des collaborateurs (migration 20260807102437). Elle reprend
  // les colonnes de la table et y ajoute `tachesencours`, agrege depuis
  // `tasks` : la colonne denormalisee du meme nom a ete supprimee. Vue en
  // lecture seule, d'ou un Insert/Update volontairement vide — les ecritures
  // visent la table `collaborateurs`.
  collaborateurs_charge: {
    Row: {
      id: string;
      nom: string;
      prenom: string;
      email: string;
      poste: string;
      dateentree: string;
      statut: string;
      permissions: Json | null;
      telephone: string;
      niveauetude: string;
      datenaissance: string;
      ville: string;
      quartier: string;
      created_at: string;
      user_id: string | null;
      /** Taches commencees et non terminees. Calcule, jamais stocke. */
      tachesencours: number;
    };
    Insert: Record<string, never>;
    Update: Record<string, never>;
    Relationships: [];
  };
  // Journal des ecritures sur les tables metier (migration 20260807120000).
  // Alimente uniquement par le trigger `journaliser_modification()` : aucune
  // policy d'ecriture n'existe, d'ou un Insert/Update volontairement vide.
  audit_log: {
    Row: {
      id: number;
      table_name: string;
      row_id: string | null;
      action: "INSERT" | "UPDATE" | "DELETE";
      acteur: string | null;
      acteur_email: string | null;
      fait_le: string;
      /** UPDATE : colonnes modifiees avant changement. DELETE : ligne entiere. */
      avant: Record<string, unknown> | null;
      /** UPDATE : colonnes modifiees apres changement. INSERT : ligne entiere. */
      apres: Record<string, unknown> | null;
    };
    Insert: Record<string, never>;
    Update: Record<string, never>;
    Relationships: [];
  };
};
