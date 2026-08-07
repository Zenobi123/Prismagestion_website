import { describe, it, expect } from 'vitest';
import {
  statutAffiche,
  statutInitial,
  peseSurLaCharge,
  LIBELLES_STATUT_TACHE,
  type TacheDatee,
} from '../statutTache';

// Jeudi 7 août 2026, le jour de référence de tout ce fichier.
const AUJOURDHUI = new Date(2026, 7, 7);

const tache = (t: Partial<TacheDatee>): TacheDatee => ({
  status: 'en_attente',
  start_date: null,
  end_date: null,
  ...t,
});

describe('statutAffiche', () => {
  it('laisse une tâche terminée terminée, même échéance dépassée', () => {
    expect(
      statutAffiche(tache({ status: 'termine', end_date: '2026-01-15' }), AUJOURDHUI),
    ).toBe('termine');
  });

  it('signale le retard dès le lendemain de l’échéance', () => {
    expect(statutAffiche(tache({ status: 'en_cours', end_date: '2026-08-06' }), AUJOURDHUI)).toBe(
      'en_retard',
    );
  });

  it('ne signale pas de retard le jour même de l’échéance', () => {
    expect(statutAffiche(tache({ status: 'en_cours', end_date: '2026-08-07' }), AUJOURDHUI)).toBe(
      'en_cours',
    );
  });

  it('fait primer le retard sur la planification', () => {
    // Dates incohérentes (début après la fin) : la tâche est en retard, pas planifiée.
    expect(
      statutAffiche(
        tache({ status: 'en_attente', start_date: '2026-09-01', end_date: '2026-08-01' }),
        AUJOURDHUI,
      ),
    ).toBe('en_retard');
  });

  it('affiche « planifiée » tant que la date de début est à venir', () => {
    expect(statutAffiche(tache({ status: 'en_attente', start_date: '2026-08-08' }), AUJOURDHUI)).toBe(
      'planifie',
    );
  });

  it('bascule en cours le jour où le début est atteint, sans rien écrire', () => {
    expect(statutAffiche(tache({ status: 'en_attente', start_date: '2026-08-07' }), AUJOURDHUI)).toBe(
      'en_cours',
    );
    expect(statutAffiche(tache({ status: 'en_attente', start_date: '2026-07-01' }), AUJOURDHUI)).toBe(
      'en_cours',
    );
  });

  it('laisse en attente une tâche sans date de début', () => {
    expect(statutAffiche(tache({ status: 'en_attente' }), AUJOURDHUI)).toBe('en_attente');
  });

  it('conserve le statut enregistré quand aucune date ne le contredit', () => {
    expect(statutAffiche(tache({ status: 'en_cours' }), AUJOURDHUI)).toBe('en_cours');
    expect(statutAffiche(tache({ status: 'en_cours', end_date: '2026-12-31' }), AUJOURDHUI)).toBe(
      'en_cours',
    );
  });

  it('ignore une date illisible plutôt que de produire un retard fantôme', () => {
    expect(statutAffiche(tache({ status: 'en_cours', end_date: 'pas une date' }), AUJOURDHUI)).toBe(
      'en_cours',
    );
    expect(
      statutAffiche(tache({ status: 'en_attente', start_date: 'pas une date' }), AUJOURDHUI),
    ).toBe('en_attente');
  });

  it('accepte un horodatage complet comme une date nue', () => {
    // Les tâches issues du générateur fiscal portent « AAAA-MM-JJ », celles
    // saisies à la main peuvent porter un ISO complet.
    expect(
      statutAffiche(tache({ status: 'en_cours', end_date: '2026-08-06T12:00:00.000Z' }), AUJOURDHUI),
    ).toBe('en_retard');
  });

  it('dépend du jour passé en paramètre, pas de l’horloge', () => {
    const t = tache({ status: 'en_cours', end_date: '2026-08-10' });
    expect(statutAffiche(t, new Date(2026, 7, 9))).toBe('en_cours');
    expect(statutAffiche(t, new Date(2026, 7, 11))).toBe('en_retard');
  });
});

describe('statutInitial', () => {
  it('met en attente une tâche sans date de début', () => {
    expect(statutInitial(null)).toBe('en_attente');
    expect(statutInitial(undefined)).toBe('en_attente');
    expect(statutInitial('')).toBe('en_attente');
  });

  it('met en attente une tâche qui démarre plus tard', () => {
    const demain = new Date();
    demain.setDate(demain.getDate() + 1);
    expect(statutInitial(demain.toISOString())).toBe('en_attente');
  });

  it('met en cours une tâche qui démarre aujourd’hui ou avant', () => {
    expect(statutInitial(new Date().toISOString())).toBe('en_cours');
    const hier = new Date();
    hier.setDate(hier.getDate() - 1);
    expect(statutInitial(hier.toISOString())).toBe('en_cours');
  });

  it('ne produit jamais une valeur refusée par tasks_status_check', () => {
    const admis = ['en_attente', 'en_cours', 'termine'];
    for (const jours of [-30, -1, 0, 1, 30]) {
      const d = new Date();
      d.setDate(d.getDate() + jours);
      expect(admis).toContain(statutInitial(d.toISOString()));
    }
  });
});

describe('peseSurLaCharge', () => {
  it('compte une tâche commencée', () => {
    expect(peseSurLaCharge(tache({ status: 'en_cours' }), AUJOURDHUI)).toBe(true);
    expect(peseSurLaCharge(tache({ status: 'en_attente', start_date: '2026-08-01' }), AUJOURDHUI)).toBe(
      true,
    );
  });

  it('compte une tâche en retard : elle reste à faire', () => {
    expect(peseSurLaCharge(tache({ status: 'en_cours', end_date: '2026-07-01' }), AUJOURDHUI)).toBe(
      true,
    );
  });

  it('ne compte ni le terminé, ni le planifié, ni l’attente sans date', () => {
    expect(peseSurLaCharge(tache({ status: 'termine' }), AUJOURDHUI)).toBe(false);
    expect(peseSurLaCharge(tache({ status: 'en_attente', start_date: '2026-09-01' }), AUJOURDHUI)).toBe(
      false,
    );
    expect(peseSurLaCharge(tache({ status: 'en_attente' }), AUJOURDHUI)).toBe(false);
  });
});

describe('LIBELLES_STATUT_TACHE', () => {
  it('couvre les cinq statuts affichables', () => {
    expect(Object.keys(LIBELLES_STATUT_TACHE).sort()).toEqual(
      ['en_attente', 'en_cours', 'en_retard', 'planifie', 'termine'].sort(),
    );
  });
});
