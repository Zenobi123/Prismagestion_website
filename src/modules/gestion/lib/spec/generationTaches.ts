// Génération des tâches à partir du calendrier fiscal.
//
// Le calendrier (`fiscal-constants.ts`) et les règles d'assujettissement
// (`services/fiscal/defaultObligationRules.ts`) existaient déjà, sans jamais
// se rencontrer : savoir qu'un client est assujetti à l'IGS trimestriel ne
// produisait aucune tâche pour le 15 août. Ce module fait ce lien.
//
// Tout ici est **pur** : aucune lecture, aucune écriture. La date du jour est
// un paramètre, ce qui rend le comportement testable à n'importe quelle date.
// L'écriture en base est la responsabilité de `services/generationTachesService`.

import type { Client } from '@gestion/types/client';
import { shouldClientBeSubjectToObligation } from '@gestion/services/fiscal/defaultObligationRules';
import { ECHEANCES_TRIMESTRIELLES, ECHEANCE_ANNUELLE_IGS, ECHEANCES_ANNUELLES } from './fiscal-constants';

/** Fenêtre d'anticipation par défaut : la tâche s'ouvre 30 jours avant l'échéance. */
export const ANTICIPATION_JOURS = 30;

/**
 * Position d'une échéance par rapport à aujourd'hui.
 * - `a_faire` : la fenêtre d'anticipation est ouverte, l'échéance n'est pas passée
 * - `a_venir` : encore trop tôt
 * - `echue`   : la date est dépassée (rattrapage possible, mais pas proposé par défaut)
 */
export type FenetreEcheance = 'a_faire' | 'a_venir' | 'echue';

export interface TachePlanifiee {
  clientId: string;
  clientNom: string;
  /** Clé d'idempotence, unique par client : « IGS-2026-T3 », « DSF-2026 ». */
  reference: string;
  titre: string;
  /** Date légale de l'échéance, au format AAAA-MM-JJ. */
  echeance: string;
  /** Ouverture de la tâche : échéance moins la fenêtre d'anticipation. */
  dateDebut: string;
  fenetre: FenetreEcheance;
}

/** Nom affichable d'un client, personne physique ou morale. */
export function nomClient(client: Pick<Client, 'type' | 'nom' | 'raisonsociale'>): string {
  const nom = client.type === 'morale' ? client.raisonsociale : client.nom;
  return nom?.trim() || 'Client sans nom';
}

function versISO(d: Date): string {
  const mois = String(d.getMonth() + 1).padStart(2, '0');
  const jour = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${mois}-${jour}`;
}

function auMatin(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function situerFenetre(echeance: Date, debut: Date, aujourdhui: Date): FenetreEcheance {
  const jour = auMatin(aujourdhui);
  if (jour > auMatin(echeance)) return 'echue';
  if (jour >= auMatin(debut)) return 'a_faire';
  return 'a_venir';
}

function construire(
  client: Client,
  reference: string,
  titre: string,
  echeance: Date,
  aujourdhui: Date,
  anticipationJours: number,
): TachePlanifiee {
  const debut = new Date(echeance);
  debut.setDate(debut.getDate() - anticipationJours);

  return {
    clientId: client.id,
    clientNom: nomClient(client),
    reference,
    titre,
    echeance: versISO(echeance),
    dateDebut: versISO(debut),
    fenetre: situerFenetre(echeance, debut, aujourdhui),
  };
}

export interface OptionsPlanification {
  annee: number;
  /** Date de référence — injectée pour rendre la planification testable. */
  aujourdhui?: Date;
  anticipationJours?: number;
}

/**
 * Établit toutes les échéances d'un client pour une année donnée.
 *
 * Le mode de paiement (`modepaiementigs`, `modepaiementpsl`) commande le
 * découpage : quatre acomptes trimestriels, ou un versement annuel. Un client
 * dont le mode n'est pas renseigné est traité comme trimestriel, qui est le
 * régime de droit commun.
 */
export function planifierPourClient(
  client: Client,
  { annee, aujourdhui = new Date(), anticipationJours = ANTICIPATION_JOURS }: OptionsPlanification,
): TachePlanifiee[] {
  const taches: TachePlanifiee[] = [];
  const estAssujetti = (obligation: string) => shouldClientBeSubjectToObligation(client, obligation);

  // --- IGS : trimestriel (4 acomptes) ou annuel (15 juin) ---
  if (estAssujetti('igs')) {
    if (client.modepaiementigs === 'annuel') {
      taches.push(construire(
        client,
        `IGS-${annee}`,
        `IGS ${annee} — paiement annuel`,
        new Date(annee, ECHEANCE_ANNUELLE_IGS.mois, ECHEANCE_ANNUELLE_IGS.jour),
        aujourdhui,
        anticipationJours,
      ));
    } else {
      for (const t of ECHEANCES_TRIMESTRIELLES) {
        taches.push(construire(
          client,
          `IGS-${annee}-T${t.trimestre}`,
          `IGS ${annee} — acompte T${t.trimestre} (${t.label})`,
          new Date(annee, t.mois, t.jour),
          aujourdhui,
          anticipationJours,
        ));
      }
    }
  }

  // --- Précompte sur loyer : seules les échéances trimestrielles sont
  // légalement datées. En paiement annuel, aucune date de référence n'est
  // documentée : on préfère ne rien générer plutôt qu'inventer une échéance.
  if (estAssujetti('precompteLoyer') && client.modepaiementpsl !== 'annuel') {
    for (const t of ECHEANCES_TRIMESTRIELLES) {
      taches.push(construire(
        client,
        `PSL-${annee}-T${t.trimestre}`,
        `Précompte sur loyer ${annee} — T${t.trimestre} (${t.label})`,
        new Date(annee, t.mois, t.jour),
        aujourdhui,
        anticipationJours,
      ));
    }
  }

  // --- Obligations annuelles ---
  const annuelles: Array<{ cle: keyof typeof ECHEANCES_ANNUELLES; obligation: string; titre: string }> = [
    { cle: 'patente', obligation: 'patente', titre: 'Patente' },
    { cle: 'dsf', obligation: 'dsf', titre: 'DSF — déclaration statistique et fiscale' },
    { cle: 'darp', obligation: 'darp', titre: 'DARP — déclaration annuelle des revenus' },
    { cle: 'dbef', obligation: 'dbef', titre: 'DBEF — déclaration des bénéficiaires effectifs' },
  ];

  for (const { cle, obligation, titre } of annuelles) {
    if (!estAssujetti(obligation)) continue;
    const ech = ECHEANCES_ANNUELLES[cle];
    taches.push(construire(
      client,
      `${obligation.toUpperCase()}-${annee}`,
      `${titre} ${annee} (${ech.label})`,
      new Date(annee, ech.mois, ech.jour),
      aujourdhui,
      anticipationJours,
    ));
  }

  return taches;
}

/**
 * Planifie pour un ensemble de clients. Les clients qui ne sont pas actifs
 * sont écartés : générer des échéances pour un dossier archivé n'a pas de sens.
 *
 * Le tri place les échéances les plus proches en tête — c'est l'ordre dans
 * lequel l'écran de génération les présente.
 */
export function planifierTachesFiscales(
  clients: Client[],
  options: OptionsPlanification,
): TachePlanifiee[] {
  return clients
    .filter((c) => c.statut === 'actif')
    .flatMap((c) => planifierPourClient(c, options))
    .sort((a, b) =>
      a.echeance === b.echeance
        ? a.clientNom.localeCompare(b.clientNom, 'fr')
        : a.echeance.localeCompare(b.echeance),
    );
}

/** Retire les échéances déjà transformées en tâches. */
export function ecarterDejaGenerees(
  planifiees: TachePlanifiee[],
  existantes: Array<{ client_id: string | null; reference_obligation: string | null }>,
): TachePlanifiee[] {
  const dejaLa = new Set(
    existantes
      .filter((t) => t.client_id && t.reference_obligation)
      .map((t) => `${t.client_id}::${t.reference_obligation}`),
  );
  return planifiees.filter((t) => !dejaLa.has(`${t.clientId}::${t.reference}`));
}
