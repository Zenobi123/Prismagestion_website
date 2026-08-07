
export type CollaborateurRole = "expert-comptable" | "assistant" | "fiscaliste" | "gestionnaire" | "comptable";

export type Permission = "lecture" | "ecriture" | "administration";

export type ModuleAcces = "clients" | "taches" | "facturation" | "rapports" | "planning";

export interface CollaborateurPermissions {
  module: ModuleAcces;
  niveau: Permission;
}

export interface Collaborateur {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  poste: CollaborateurRole;
  dateentree: string;
  statut: "actif" | "inactif";
  /**
   * Charge courante, **calculée** par la vue `collaborateurs_charge` : nombre
   * de tâches commencées et non terminées. Ce n'est plus une colonne — ne
   * jamais l'envoyer en écriture, PostgREST rejetterait la requête entière.
   * Utiliser `NouveauCollaborateur` pour une création ou une mise à jour.
   */
  tachesencours: number;
  permissions: CollaborateurPermissions[];
  telephone: string;
  niveauetude: string;
  datenaissance: string;
  ville: string;
  quartier: string;
  created_at?: string;
}

/** Les seuls champs qu'une écriture sur `collaborateurs` accepte. */
export type NouveauCollaborateur = Omit<
  Collaborateur,
  "id" | "created_at" | "tachesencours"
>;
