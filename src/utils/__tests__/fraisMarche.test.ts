import { describe, it, expect } from 'vitest';
import { calculerFraisMarche, formatFcfa, type FraisMarcheInput } from '../fraisMarche';
import {
  CNE_FRAIS_OBTENTION,
  FRAIS_ATTESTATIONS_DGI,
  FRAIS_MERCURIALE,
  TIMBRE_PAR_PAGE,
} from '@/constants/baremesEnregistrement';

/**
 * Liquidation des frais d'enregistrement d'un bon de commande administratif
 * (/outils/calculateur-frais-marche).
 *
 * Ce calculateur chiffre des droits réellement dus à l'administration. Les
 * règles vérifiées ici sont celles qui coûtent cher si elles cassent : assiette
 * de la pénalité de retard, bascule de barème CNE selon la date de signature,
 * et refus de chiffrer plutôt que d'estimer au jugé.
 */

const base: FraisMarcheInput = {
  montantHT: 2_000_000,
  nbPagesTimbrees: 3,
  dateSignature: '2026-08-01',
  dateEnregistrement: '2026-08-10', // J+9 : dans les délais, sans alerte
  fraisTresorpay: 5_000,
  inclureCne: false,
  inclureMercuriale: false,
  inclureAttestations: false,
};

const ligne = (lignes: { id: string; montant: number | null }[], id: string) =>
  lignes.find((l) => l.id === id);

describe('part fiscale', () => {
  it('liquide le droit proportionnel à 7 % et les CAC à 5 % de ce droit', () => {
    const r = calculerFraisMarche(base);
    expect(ligne(r.lignesFiscales, 'droit-proportionnel')?.montant).toBe(140_000);
    expect(ligne(r.lignesFiscales, 'cac')?.montant).toBe(7_000);
  });

  it('assoit les CAC sur le droit, pas sur le montant du marché', () => {
    // 5 % de 2 000 000 vaudrait 100 000 : l'erreur classique.
    expect(ligne(calculerFraisMarche(base).lignesFiscales, 'cac')?.montant).not.toBe(100_000);
  });

  it('compte le timbre de dimension par page et l’intègre au total fiscal', () => {
    const r = calculerFraisMarche({ ...base, nbPagesTimbrees: 3 });
    expect(ligne(r.lignesFiscales, 'timbres')?.montant).toBe(3 * TIMBRE_PAR_PAGE);
    expect(r.totalFiscal).toBe(140_000 + 7_000 + 4_500);
    expect(r.fiscalComplet).toBe(true);
  });
});

describe('seuil de 5 000 000 F CFA', () => {
  it('refuse d’extrapoler le taux au-delà du seuil et laisse les droits à déterminer', () => {
    const r = calculerFraisMarche({ ...base, montantHT: 5_000_000 });
    expect(ligne(r.lignesFiscales, 'droit-proportionnel')?.montant).toBeNull();
    expect(ligne(r.lignesFiscales, 'cac')?.montant).toBeNull();
    expect(r.fiscalComplet).toBe(false);
    expect(r.coutTotal).toBeNull();
    expect(r.avertissements.some((a) => a.includes('CGI'))).toBe(true);
  });

  it('le seuil est atteint dès 5 000 000, pas au-delà', () => {
    expect(calculerFraisMarche({ ...base, montantHT: 4_999_999 }).fiscalComplet).toBe(true);
    expect(calculerFraisMarche({ ...base, montantHT: 5_000_000 }).fiscalComplet).toBe(false);
  });

  it('signale l’approche du seuil sans cesser de chiffrer', () => {
    const r = calculerFraisMarche({ ...base, montantHT: 4_600_000 });
    expect(r.fiscalComplet).toBe(true);
    expect(r.avertissements.some((a) => a.includes('proche du seuil'))).toBe(true);
  });
});

describe('délai d’enregistrement et pénalité', () => {
  it('ne pénalise pas un dépôt au 30e jour', () => {
    const r = calculerFraisMarche({ ...base, dateEnregistrement: '2026-08-31' });
    expect(r.joursEcoules).toBe(30);
    expect(r.horsDelai).toBe(false);
    expect(ligne(r.lignesFiscales, 'penalite-retard')).toBeUndefined();
  });

  it('pénalise dès le 31e jour', () => {
    const r = calculerFraisMarche({ ...base, dateEnregistrement: '2026-09-01' });
    expect(r.joursEcoules).toBe(31);
    expect(r.horsDelai).toBe(true);
    expect(ligne(r.lignesFiscales, 'penalite-retard')).toBeDefined();
  });

  it('assoit la pénalité sur les droits augmentés des CAC, timbre exclu', () => {
    const r = calculerFraisMarche({ ...base, dateEnregistrement: '2026-09-05' });
    // 140 000 + 7 000 = 147 000. Y ajouter le timbre (4 500) donnerait 151 500.
    expect(ligne(r.lignesFiscales, 'penalite-retard')?.montant).toBe(147_000);
    expect(ligne(r.lignesFiscales, 'penalite-retard')?.montant).not.toBe(151_500);
  });

  it('laisse la pénalité à déterminer quand les droits eux-mêmes le sont', () => {
    const r = calculerFraisMarche({
      ...base,
      montantHT: 8_000_000,
      dateEnregistrement: '2026-09-05',
    });
    expect(r.horsDelai).toBe(true);
    expect(ligne(r.lignesFiscales, 'penalite-retard')?.montant).toBeNull();
    expect(r.coutTotal).toBeNull();
  });

  it('alerte sur l’échéance imminente sans pénaliser', () => {
    const r = calculerFraisMarche({ ...base, dateEnregistrement: '2026-08-28' });
    expect(r.joursEcoules).toBe(27);
    expect(r.horsDelai).toBe(false);
    expect(r.avertissements.some((a) => a.includes('bientôt expiré'))).toBe(true);
  });

  it('signale des dates incohérentes sans calculer de pénalité', () => {
    const r = calculerFraisMarche({
      ...base,
      dateSignature: '2026-08-10',
      dateEnregistrement: '2026-08-01',
    });
    expect(r.joursEcoules).toBe(-9);
    expect(r.horsDelai).toBe(false);
    expect(ligne(r.lignesFiscales, 'penalite-retard')).toBeUndefined();
    expect(r.avertissements.some((a) => a.includes('antérieure'))).toBe(true);
  });

  it('ne décompte rien si une date manque', () => {
    const r = calculerFraisMarche({ ...base, dateEnregistrement: '' });
    expect(r.joursEcoules).toBeNull();
    expect(r.horsDelai).toBe(false);
  });
});

describe('CNE-ARMP', () => {
  const avecCne = { ...base, inclureCne: true };

  it('applique la grille en vigueur pour une signature du 21 juillet 2026', () => {
    const r = calculerFraisMarche({ ...avecCne, dateSignature: '2026-07-21' });
    expect(r.baremeCneAnterieur).toBe(false);
    expect(r.trancheCne?.droit).toBe(15_000);
  });

  it('applique le barème antérieur pour une signature de la veille', () => {
    const r = calculerFraisMarche({ ...avecCne, dateSignature: '2026-07-20' });
    expect(r.baremeCneAnterieur).toBe(true);
    expect(r.trancheCne?.droit).toBe(10_000);
    expect(r.avertissements.some((a) => a.includes('Barème CNE antérieur'))).toBe(true);
  });

  it('facture le droit ARMP et les frais d’obtention sur deux lignes distinctes', () => {
    // Les agréger masquerait une hausse de tarif au client.
    const r = calculerFraisMarche(avecCne);
    expect(ligne(r.lignesAnnexes, 'cne-droit')?.montant).toBe(15_000);
    expect(ligne(r.lignesAnnexes, 'cne-obtention')?.montant).toBe(CNE_FRAIS_OBTENTION);
  });

  it('refuse de chiffrer sous le plancher de la grille ARMP', () => {
    const r = calculerFraisMarche({ ...avecCne, montantHT: 400_000 });
    expect(r.trancheCne).toBeNull();
    expect(ligne(r.lignesAnnexes, 'cne-droit')?.montant).toBeNull();
    expect(r.annexesCompletes).toBe(false);
    expect(r.coutTotal).toBeNull();
    expect(r.avertissements.some((a) => a.includes('ARMP'))).toBe(true);
  });

  it('refuse de déduire le barème antérieur hors de sa seule tranche documentée', () => {
    const r = calculerFraisMarche({
      ...avecCne,
      dateSignature: '2026-07-20',
      montantHT: 6_000_000,
    });
    expect(r.trancheCne).toBeNull();
    expect(r.avertissements.some((a) => a.includes('21 juillet 2026'))).toBe(true);
  });

  it('n’ajoute aucune ligne CNE lorsqu’il n’est pas retenu', () => {
    const r = calculerFraisMarche(base);
    expect(ligne(r.lignesAnnexes, 'cne-droit')).toBeUndefined();
    expect(r.trancheCne).toBeNull();
  });
});

describe('frais annexes et total', () => {
  it('n’inclut que les postes retenus', () => {
    const r = calculerFraisMarche(base);
    expect(r.lignesAnnexes.map((l) => l.id)).toEqual(['tresorpay']);
    expect(r.totalAnnexes).toBe(5_000);
  });

  it('additionne tous les postes retenus', () => {
    const r = calculerFraisMarche({
      ...base,
      inclureCne: true,
      inclureMercuriale: true,
      inclureAttestations: true,
    });
    const attendu =
      FRAIS_MERCURIALE + 5_000 + 15_000 + CNE_FRAIS_OBTENTION + FRAIS_ATTESTATIONS_DGI;
    expect(r.totalAnnexes).toBe(attendu);
    expect(r.annexesCompletes).toBe(true);
    expect(r.coutTotal).toBe(r.totalFiscal + attendu);
  });

  it('les totaux partiels restent lisibles même quand le coût total est indéterminé', () => {
    // Les postes chiffrés doivent rester affichables : seul le total global se refuse.
    const r = calculerFraisMarche({ ...base, montantHT: 8_000_000 });
    expect(r.coutTotal).toBeNull();
    expect(r.totalFiscal).toBe(3 * TIMBRE_PAR_PAGE); // le timbre reste chiffrable
    expect(r.totalAnnexes).toBe(5_000);
  });
});

describe('formatFcfa', () => {
  it('groupe les milliers avec une espace simple', () => {
    // toLocaleString('fr-FR') insère une espace insécable selon l'environnement ;
    // elle est normalisée pour que l'affichage et les tests soient stables.
    expect(formatFcfa(1_234_567)).toBe('1 234 567 F CFA');
    expect(formatFcfa(1_234_567)).not.toMatch(/[   ]/);
  });

  it('arrondit à l’unité', () => {
    expect(formatFcfa(1_234.6)).toBe('1 235 F CFA');
    expect(formatFcfa(0)).toBe('0 F CFA');
  });
});
