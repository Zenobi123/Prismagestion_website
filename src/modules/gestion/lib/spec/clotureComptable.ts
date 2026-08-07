// Clôture de l'année comptable (cabinet-wide).
//
// La source de vérité est la table Supabase `exercices` : une année qui y
// figure au statut « clos » est clôturée, une année absente est ouverte.
//
// Elle vivait auparavant dans le `localStorage`, ce qui posait trois problèmes
// résolus le 07/08/2026 : vider le cache rouvrait tous les exercices, un autre
// appareil n'en voyait aucun, et rien n'était réellement verrouillé — le
// trigger `verrouiller_exercice_clos` s'en charge désormais côté base.
import { useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getExercicesClos,
  cloturerExercice,
  rouvrirExercice,
} from '@gestion/services/exerciceService';

export interface ClotureExercice {
  /** Année comptable clôturée (ex: 2024). */
  year: number;
  /** Date ISO de la clôture. */
  closedAt: string;
}

export const CLE_REQUETE_CLOTURES = ['exercices-clos'] as const;

export function getMaxClosedYear(list: ClotureExercice[]): number | null {
  if (!list.length) return null;
  return list.reduce((max, c) => Math.max(max, c.year), Number.NEGATIVE_INFINITY);
}

export function isYearClosed(list: ClotureExercice[], year: number): boolean {
  return list.some((c) => c.year === year);
}

/**
 * Détermine si un élément d'une année donnée doit s'afficher selon l'exercice consulté.
 * - vue "courant" : visible si l'année n'est pas clôturée (année > dernière clôturée).
 *   Les éléments non datés (year null) restent visibles dans la vue courante.
 * - vue d'une année clôturée : visible uniquement pour cette année précise.
 */
export function isExerciceVisible(
  viewYear: number | 'courant',
  maxClosedYear: number | null,
  year: number | null | undefined,
): boolean {
  if (viewYear === 'courant') {
    if (maxClosedYear === null) return true;
    if (year === null || year === undefined) return true;
    return year > maxClosedYear;
  }
  return year === viewYear;
}

/**
 * Hook réactif sur le registre des exercices clôturés.
 *
 * `closeYear` et `reopenYear` sont **asynchrones** : les attendre, sinon un
 * échec d'écriture passe pour une réussite — même précaution que pour
 * `saveCabinetConfig()`.
 */
export function useClotures() {
  const queryClient = useQueryClient();

  const { data: clotures = [], isLoading } = useQuery({
    queryKey: CLE_REQUETE_CLOTURES,
    queryFn: getExercicesClos,
    staleTime: 5 * 60 * 1000,
  });

  const rafraichir = useCallback(
    () => queryClient.invalidateQueries({ queryKey: CLE_REQUETE_CLOTURES }),
    [queryClient],
  );

  const closeYear = useCallback(
    async (year: number) => {
      await cloturerExercice(year);
      await rafraichir();
    },
    [rafraichir],
  );

  const reopenYear = useCallback(
    async (year: number) => {
      await rouvrirExercice(year);
      await rafraichir();
    },
    [rafraichir],
  );

  const maxClosedYear = getMaxClosedYear(clotures);

  return {
    clotures,
    isLoading,
    maxClosedYear,
    isYearClosed: (year: number) => isYearClosed(clotures, year),
    closeYear,
    reopenYear,
  };
}
