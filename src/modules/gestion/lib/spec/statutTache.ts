// Statut d'une tâche : ce que la base enregistre, et ce que l'écran affiche.
//
// La table `tasks` ne connaît que trois statuts — c'est ce qu'impose la
// contrainte `tasks_status_check`. « En retard » et « planifiée » n'en font
// pas partie, et ne doivent pas en faire partie : ce ne sont pas des états de
// la tâche mais des relations entre ses dates et le jour courant. Les
// persister obligerait à les rafraîchir tous les jours, ce que `getTasks()`
// faisait en écrivant au milieu d'une lecture.
//
// Tout ici est **pur** : la date du jour est un paramètre, le comportement est
// donc testable à n'importe quelle date.

/** Les trois seules valeurs que la colonne `tasks.status` accepte. */
export type StatutTache = 'en_attente' | 'en_cours' | 'termine';

/**
 * Statut montré à l'utilisateur. Il ajoute deux valeurs dérivées des dates,
 * qui ne sont jamais écrites en base.
 */
export type StatutAffiche = StatutTache | 'planifie' | 'en_retard';

/** Le minimum dont la dérivation a besoin. */
export interface TacheDatee {
  status: StatutTache;
  start_date?: string | null;
  end_date?: string | null;
}

/** Ramène une date (ISO ou `AAAA-MM-JJ`) à son minuit local, ou `null`. */
function auMatin(date: string | null | undefined): Date | null {
  if (!date) return null;
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return null;
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

/**
 * Statut à afficher pour une tâche, à une date donnée.
 *
 * L'ordre des règles est significatif :
 *  1. une tâche terminée le reste, quelles que soient ses dates ;
 *  2. une échéance dépassée l'emporte sur tout le reste — une tâche jamais
 *     démarrée dont la date de fin est passée est en retard, pas planifiée ;
 *  3. une tâche en attente dont le début est à venir est planifiée ;
 *  4. une tâche en attente dont le début est atteint est en cours — c'est la
 *     bascule que l'ancien code écrivait en base à chaque lecture ;
 *  5. sinon, le statut enregistré fait foi.
 */
export function statutAffiche(tache: TacheDatee, aujourdhui: Date): StatutAffiche {
  if (tache.status === 'termine') return 'termine';

  const jour = new Date(aujourdhui.getFullYear(), aujourdhui.getMonth(), aujourdhui.getDate());

  const fin = auMatin(tache.end_date);
  if (fin && fin < jour) return 'en_retard';

  if (tache.status === 'en_attente') {
    const debut = auMatin(tache.start_date);
    if (debut) return debut > jour ? 'planifie' : 'en_cours';
  }

  return tache.status;
}

/**
 * Statut initial d'une tâche à sa création : en attente tant que la date de
 * début n'est pas atteinte, en cours dès qu'elle l'est. Sans date de début,
 * la tâche est en attente.
 */
export function statutInitial(dateDebut: string | null | undefined): StatutTache {
  const debut = auMatin(dateDebut);
  if (!debut) return 'en_attente';
  const jour = new Date();
  return debut > new Date(jour.getFullYear(), jour.getMonth(), jour.getDate())
    ? 'en_attente'
    : 'en_cours';
}

/**
 * La tâche pèse-t-elle sur la charge de son collaborateur ?
 *
 * Oui dès qu'elle est commencée et pas terminée — une tâche en retard reste à
 * faire, elle compte donc. Une tâche encore planifiée ne compte pas.
 * C'est la définition que reprend la vue `collaborateurs_charge`.
 */
export function peseSurLaCharge(tache: TacheDatee, aujourdhui: Date): boolean {
  const statut = statutAffiche(tache, aujourdhui);
  return statut === 'en_cours' || statut === 'en_retard';
}

/** Libellés d'affichage, une seule fois pour toute la console. */
export const LIBELLES_STATUT_TACHE: Record<StatutAffiche, string> = {
  en_attente: 'En attente',
  planifie: 'Planifiée',
  en_cours: 'En cours',
  en_retard: 'En retard',
  termine: 'Terminé',
};
