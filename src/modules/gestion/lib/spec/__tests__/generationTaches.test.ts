import { describe, it, expect } from 'vitest';
import {
  planifierPourClient,
  planifierTachesFiscales,
  ecarterDejaGenerees,
  nomClient,
} from '../generationTaches';
import type { Client } from '@gestion/types/client';

/** Client minimal valide — les champs non pertinents sont neutres. */
function client(surcharge: Partial<Client> = {}): Client {
  return {
    id: 'c1',
    type: 'morale',
    raisonsociale: 'ACME SARL',
    regimefiscal: 'igs',
    niu: 'P000',
    centrerattachement: 'CDI',
    adresse: { ville: '', quartier: '', lieuDit: '' },
    contact: { telephone: '', email: '' },
    secteuractivite: '',
    interactions: [],
    statut: 'actif',
    gestionexternalisee: false,
    ...surcharge,
  } as Client;
}

const ANNEE = 2026;

describe('planifierPourClient — découpage selon le mode de paiement', () => {
  it('produit les quatre acomptes trimestriels IGS aux dates légales', () => {
    const taches = planifierPourClient(client({ modepaiementigs: 'trimestriel' }), {
      annee: ANNEE,
      aujourdhui: new Date(2026, 0, 1),
    });

    const igs = taches.filter((t) => t.reference.startsWith('IGS-'));
    expect(igs.map((t) => t.echeance)).toEqual([
      '2026-02-15',
      '2026-05-15',
      '2026-08-15',
      '2026-11-15',
    ]);
  });

  it('produit une seule échéance au 15 juin en paiement annuel', () => {
    const taches = planifierPourClient(client({ modepaiementigs: 'annuel' }), {
      annee: ANNEE,
      aujourdhui: new Date(2026, 0, 1),
    });

    const igs = taches.filter((t) => t.reference.startsWith('IGS-'));
    expect(igs).toHaveLength(1);
    expect(igs[0].echeance).toBe('2026-06-15');
    expect(igs[0].reference).toBe('IGS-2026');
  });

  it('traite un mode de paiement non renseigné comme trimestriel', () => {
    const taches = planifierPourClient(client({ modepaiementigs: undefined }), {
      annee: ANNEE,
      aujourdhui: new Date(2026, 0, 1),
    });
    expect(taches.filter((t) => t.reference.startsWith('IGS-'))).toHaveLength(4);
  });
});

describe('planifierPourClient — assujettissement', () => {
  it('génère la DBEF pour une personne morale, jamais la DARP', () => {
    const taches = planifierPourClient(client({ type: 'morale' }), {
      annee: ANNEE,
      aujourdhui: new Date(2026, 0, 1),
    });
    const refs = taches.map((t) => t.reference);
    expect(refs).toContain('DBEF-2026');
    expect(refs).not.toContain('DARP-2026');
  });

  it('génère la DARP pour une personne physique, jamais la DBEF', () => {
    const taches = planifierPourClient(client({ type: 'physique', nom: 'NDONGO Paul' }), {
      annee: ANNEE,
      aujourdhui: new Date(2026, 0, 1),
    });
    const refs = taches.map((t) => t.reference);
    expect(refs).toContain('DARP-2026');
    expect(refs).not.toContain('DBEF-2026');
  });

  it('génère la Patente au régime réel et l\'IGS au régime IGS, jamais les deux', () => {
    const reel = planifierPourClient(client({ regimefiscal: 'reel' }), {
      annee: ANNEE,
      aujourdhui: new Date(2026, 0, 1),
    }).map((t) => t.reference);

    expect(reel).toContain('PATENTE-2026');
    expect(reel.some((r) => r.startsWith('IGS-'))).toBe(false);

    const igs = planifierPourClient(client({ regimefiscal: 'igs' }), {
      annee: ANNEE,
      aujourdhui: new Date(2026, 0, 1),
    }).map((t) => t.reference);

    expect(igs.some((r) => r.startsWith('IGS-'))).toBe(true);
    expect(igs).not.toContain('PATENTE-2026');
  });

  it('ne génère aucun précompte sur loyer sans loyer renseigné', () => {
    const taches = planifierPourClient(client(), { annee: ANNEE, aujourdhui: new Date(2026, 0, 1) });
    expect(taches.some((t) => t.reference.startsWith('PSL-'))).toBe(false);
  });

  it('génère le précompte sur loyer trimestriel pour un locataire, mais rien en mode annuel', () => {
    const base = { situationimmobiliere: { type: 'locataire' as const, loyer: 200_000 } };

    const trimestriel = planifierPourClient(
      client({ ...base, modepaiementpsl: 'trimestriel' }),
      { annee: ANNEE, aujourdhui: new Date(2026, 0, 1) },
    );
    expect(trimestriel.filter((t) => t.reference.startsWith('PSL-'))).toHaveLength(4);

    // Aucune date légale documentée pour le PSL annuel : ne rien inventer.
    const annuel = planifierPourClient(
      client({ ...base, modepaiementpsl: 'annuel' }),
      { annee: ANNEE, aujourdhui: new Date(2026, 0, 1) },
    );
    expect(annuel.some((t) => t.reference.startsWith('PSL-'))).toBe(false);
  });
});

describe('planifierPourClient — fenêtre d\'anticipation de 30 jours', () => {
  const options = (aujourdhui: Date) => ({ annee: ANNEE, aujourdhui, anticipationJours: 30 });
  const t3 = (aujourdhui: Date) =>
    planifierPourClient(client(), options(aujourdhui)).find((t) => t.reference === 'IGS-2026-T3')!;

  it('ouvre la tâche exactement 30 jours avant l\'échéance', () => {
    // T3 tombe le 15 août : la fenêtre s'ouvre le 16 juillet.
    expect(t3(new Date(2026, 6, 16)).dateDebut).toBe('2026-07-16');
    expect(t3(new Date(2026, 6, 16)).fenetre).toBe('a_faire');
  });

  it('la veille de l\'ouverture, l\'échéance est encore « à venir »', () => {
    expect(t3(new Date(2026, 6, 15)).fenetre).toBe('a_venir');
  });

  it('le jour même de l\'échéance, la tâche reste à faire', () => {
    expect(t3(new Date(2026, 7, 15)).fenetre).toBe('a_faire');
  });

  it('le lendemain de l\'échéance, elle bascule en échue', () => {
    expect(t3(new Date(2026, 7, 16)).fenetre).toBe('echue');
  });
});

describe('planifierTachesFiscales — ensemble de clients', () => {
  it('écarte les clients qui ne sont pas actifs', () => {
    const clients = [
      client({ id: 'actif', statut: 'actif' }),
      client({ id: 'archive', statut: 'archive' }),
      client({ id: 'inactif', statut: 'inactif' }),
    ];
    const taches = planifierTachesFiscales(clients, { annee: ANNEE, aujourdhui: new Date(2026, 0, 1) });
    expect(new Set(taches.map((t) => t.clientId))).toEqual(new Set(['actif']));
  });

  it('trie par échéance croissante', () => {
    const taches = planifierTachesFiscales([client()], { annee: ANNEE, aujourdhui: new Date(2026, 0, 1) });
    const dates = taches.map((t) => t.echeance);
    expect([...dates].sort()).toEqual(dates);
  });
});

describe('ecarterDejaGenerees — idempotence', () => {
  it('retire une échéance déjà transformée en tâche pour ce client', () => {
    const planifiees = planifierTachesFiscales([client()], {
      annee: ANNEE,
      aujourdhui: new Date(2026, 0, 1),
    });
    const restantes = ecarterDejaGenerees(planifiees, [
      { client_id: 'c1', reference_obligation: 'IGS-2026-T3' },
    ]);

    expect(planifiees.some((t) => t.reference === 'IGS-2026-T3')).toBe(true);
    expect(restantes.some((t) => t.reference === 'IGS-2026-T3')).toBe(false);
    expect(restantes).toHaveLength(planifiees.length - 1);
  });

  it('ne confond pas deux clients portant la même référence', () => {
    const planifiees = planifierTachesFiscales(
      [client({ id: 'c1' }), client({ id: 'c2' })],
      { annee: ANNEE, aujourdhui: new Date(2026, 0, 1) },
    );
    const restantes = ecarterDejaGenerees(planifiees, [
      { client_id: 'c1', reference_obligation: 'IGS-2026-T3' },
    ]);
    // Celle de c2 doit survivre.
    expect(restantes.filter((t) => t.reference === 'IGS-2026-T3').map((t) => t.clientId)).toEqual(['c2']);
  });

  it('ignore les tâches saisies à la main, sans référence', () => {
    const planifiees = planifierTachesFiscales([client()], {
      annee: ANNEE,
      aujourdhui: new Date(2026, 0, 1),
    });
    const restantes = ecarterDejaGenerees(planifiees, [
      { client_id: 'c1', reference_obligation: null },
    ]);
    expect(restantes).toHaveLength(planifiees.length);
  });
});

describe('nomClient', () => {
  it('prend la raison sociale pour une personne morale et le nom pour une physique', () => {
    expect(nomClient({ type: 'morale', raisonsociale: 'ACME SARL', nom: 'ignoré' })).toBe('ACME SARL');
    expect(nomClient({ type: 'physique', nom: 'NDONGO Paul' })).toBe('NDONGO Paul');
  });

  it('reste lisible quand aucun nom n\'est renseigné', () => {
    expect(nomClient({ type: 'morale' })).toBe('Client sans nom');
  });
});
