import { supabase } from "@gestion/integrations/supabase/client";

export type AuditAction = "INSERT" | "UPDATE" | "DELETE";

export interface EntreeJournal {
  id: number;
  table_name: string;
  row_id: string | null;
  action: AuditAction;
  acteur: string | null;
  acteur_email: string | null;
  fait_le: string;
  avant: Record<string, unknown> | null;
  apres: Record<string, unknown> | null;
}

/** Une colonne modifiée, telle qu'affichée dans le journal. */
export interface ChangementColonne {
  colonne: string;
  avant: string;
  apres: string;
}

/**
 * Libellés des tables journalisées. Sert aussi de liste de filtre : l'ordre
 * est celui du menu déroulant.
 */
export const TABLES_JOURNALISEES: Record<string, string> = {
  clients: "Clients",
  factures: "Factures",
  facture_prestations: "Lignes de facture",
  paiements: "Paiements",
  devis: "Devis",
  devis_prestations: "Lignes de devis",
  propositions: "Propositions",
  courriers: "Courriers",
  tasks: "Tâches",
  fiscal_obligations: "Obligations fiscales",
  documents_administratifs: "Documents administratifs",
  procedures_administratives: "Procédures administratives",
  collaborateurs: "Collaborateurs",
  employes: "Employés (clients)",
  paie: "Paie",
  conges: "Congés",
  contrats_employes: "Contrats employés",
  rapports_mission: "Rapports de mission",
  cabinet_config: "Identité du cabinet",
  capital_social: "Capital social",
  actionnaires: "Actionnaires",
};

export const LIBELLES_ACTION: Record<AuditAction, string> = {
  INSERT: "Création",
  UPDATE: "Modification",
  DELETE: "Suppression",
};

/**
 * Colonnes techniques que l'utilisateur n'a pas à voir dans le détail d'un
 * changement. `updated_at`/`updated_by` sont déjà écartés côté base par le
 * trigger ; les autres n'apportent rien à la lecture.
 */
const COLONNES_MASQUEES = new Set(["id", "created_at", "created_by", "updated_at", "updated_by"]);

function enTexte(valeur: unknown): string {
  if (valeur === null || valeur === undefined) return "—";
  if (typeof valeur === "boolean") return valeur ? "oui" : "non";
  if (typeof valeur === "object") return JSON.stringify(valeur);
  return String(valeur);
}

/**
 * Réduit une entrée du journal aux colonnes réellement lisibles.
 * Pour une création ou une suppression, la ligne entière est enregistrée :
 * on n'en retient que les champs renseignés, sinon l'affichage est illisible.
 */
export function extraireChangements(entree: EntreeJournal): ChangementColonne[] {
  const clefs = new Set([
    ...Object.keys(entree.avant ?? {}),
    ...Object.keys(entree.apres ?? {}),
  ]);

  const changements: ChangementColonne[] = [];
  for (const colonne of clefs) {
    if (COLONNES_MASQUEES.has(colonne)) continue;

    const avant = entree.avant?.[colonne];
    const apres = entree.apres?.[colonne];

    // Création / suppression : ne montrer que ce qui portait une valeur.
    if (entree.action !== "UPDATE") {
      const valeur = entree.action === "INSERT" ? apres : avant;
      if (valeur === null || valeur === undefined || valeur === "") continue;
    }

    changements.push({
      colonne,
      avant: enTexte(avant),
      apres: enTexte(apres),
    });
  }

  return changements.sort((a, b) => a.colonne.localeCompare(b.colonne, "fr"));
}

export interface FiltresJournal {
  table?: string;
  action?: AuditAction;
  /** Date ISO (AAAA-MM-JJ) à partir de laquelle lire. */
  depuis?: string;
  limite?: number;
  decalage?: number;
}

export interface PageJournal {
  entrees: EntreeJournal[];
  total: number;
}

export async function getJournal(filtres: FiltresJournal = {}): Promise<PageJournal> {
  const limite = filtres.limite ?? 50;
  const decalage = filtres.decalage ?? 0;

  let query = supabase
    .from("audit_log")
    .select("*", { count: "exact" })
    .order("fait_le", { ascending: false })
    .range(decalage, decalage + limite - 1);

  if (filtres.table) query = query.eq("table_name", filtres.table);
  if (filtres.action) query = query.eq("action", filtres.action);
  if (filtres.depuis) query = query.gte("fait_le", `${filtres.depuis}T00:00:00`);

  const { data, error, count } = await query;
  if (error) throw error;

  return {
    entrees: (data ?? []) as unknown as EntreeJournal[],
    total: count ?? 0,
  };
}

/** Historique d'une ligne précise — l'usage le plus utile en cas de litige. */
export async function getHistoriqueLigne(
  tableName: string,
  rowId: string,
): Promise<EntreeJournal[]> {
  const { data, error } = await supabase
    .from("audit_log")
    .select("*")
    .eq("table_name", tableName)
    .eq("row_id", rowId)
    .order("fait_le", { ascending: false });

  if (error) throw error;
  return (data ?? []) as unknown as EntreeJournal[];
}
