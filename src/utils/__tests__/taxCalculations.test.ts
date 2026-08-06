import { describe, it, expect } from 'vitest';
import { calculateTaxClass } from '../taxCalculations';

/**
 * Calculateur d'IGS du site public (/outils/calculateur-impots).
 *
 * Ces montants sont affichés à des visiteurs qui s'en servent pour estimer
 * leur imposition : une tranche décalée d'un franc donne un montant faux.
 * Les bornes sont donc testées une à une, des deux côtés.
 */

// Barème de référence : classe, borne basse, borne haute, montant IGS.
const BAREME: Array<[number, number, number, number]> = [
  [1, 0, 499_999, 20_000],
  [2, 500_000, 999_999, 30_000],
  [3, 1_000_000, 1_499_999, 40_000],
  [4, 1_500_000, 1_999_999, 50_000],
  [5, 2_000_000, 2_499_999, 60_000],
  [6, 2_500_000, 4_999_999, 150_000],
  [7, 5_000_000, 9_999_999, 300_000],
  [8, 10_000_000, 19_999_999, 500_000],
  [9, 20_000_000, 29_999_999, 1_000_000],
  [10, 30_000_000, 49_999_999, 2_000_000],
];

describe('calculateTaxClass — barème', () => {
  it.each(BAREME)(
    'classe %i : la borne basse (%i) donne %i F CFA',
    (classe, min, _max, montant) => {
      const r = calculateTaxClass(min);
      expect(r.classe).toBe(classe);
      expect(r.montant).toBe(montant);
    }
  );

  it.each(BAREME)(
    'classe %i : la borne haute reste dans la classe',
    (classe, _min, max, montant) => {
      const r = calculateTaxClass(max);
      expect(r.classe).toBe(classe);
      expect(r.montant).toBe(montant);
    }
  );

  it('un franc de plus fait basculer dans la classe suivante', () => {
    expect(calculateTaxClass(499_999).classe).toBe(1);
    expect(calculateTaxClass(500_000).classe).toBe(2);

    expect(calculateTaxClass(4_999_999).classe).toBe(6);
    expect(calculateTaxClass(5_000_000).classe).toBe(7);
  });

  it('expose les bornes de la tranche retenue', () => {
    const r = calculateTaxClass(2_000_000);
    expect(r.minRange).toBe(2_000_000);
    expect(r.maxRange).toBe(2_499_999);
    expect(r.chiffreAffaires).toBe(2_000_000);
  });
});

describe('calculateTaxClass — TDL', () => {
  it('la TDL suit le barème officiel par tranches (Article C 86 CGI / LF 2026)', () => {
    // Classe 1: IGS 20 000 -> TDL 7 500
    expect(calculateTaxClass(200_000).tdl).toBe(7_500);
    // Classe 5: IGS 60 000 -> TDL 9 000
    expect(calculateTaxClass(2_000_000).tdl).toBe(9_000);
    // Classe 6: IGS 150 000 -> TDL 22 500
    expect(calculateTaxClass(3_000_000).tdl).toBe(22_500);
    // Classe 10: IGS 2 000 000 -> TDL 90 000
    expect(calculateTaxClass(35_000_000).tdl).toBe(90_000);
  });
});

describe('calculateTaxClass — Pénalités de retard', () => {
  it('calcule des pénalités de 10 % par mois de retard sur l’IGS principal', () => {
    // CA 2 000 000 -> IGS 60 000 F CFA. 2 mois de retard -> 20 % = 12 000 F CFA
    const r = calculateTaxClass(2_000_000, 2);
    expect(r.montant).toBe(60_000);
    expect(r.tdl).toBe(9_000);
    expect(r.penalites).toBe(12_000);
    expect(r.total).toBe(81_000);
  });

  it('sans retard (0 mois), les pénalités sont nuls', () => {
    const r = calculateTaxClass(2_000_000, 0);
    expect(r.penalites).toBe(0);
  });
});

describe('calculateTaxClass — hors barème', () => {
  it('au-delà de 49 999 999 F CFA, renvoie le renvoi au régime du réel', () => {
    const r = calculateTaxClass(50_000_000);
    expect(r.classe).toBe(0);
    expect(r.montant).toBe(0);
    expect(r.message).toContain('régime du réel');
    // Pas de tranche : aucune TDL ni total à afficher.
    expect(r.tdl).toBeUndefined();
    expect(r.total).toBeUndefined();
  });

  it('un chiffre d’affaires négatif est signalé comme une erreur de saisie', () => {
    const r = calculateTaxClass(-1);
    expect(r.classe).toBe(0);
    expect(r.montant).toBe(0);
    expect(r.message).toContain('Erreur de calcul');
  });

  it('distingue le dépassement de seuil d’une saisie invalide', () => {
    // Deux cas produisent classe 0 : ils ne doivent pas afficher le même message,
    // sous peine d'orienter à tort un contribuable vers le régime du réel.
    expect(calculateTaxClass(60_000_000).message).not.toBe(
      calculateTaxClass(-500).message
    );
  });
});

describe('calculateTaxClass — Échéances IGS', () => {
  it('renvoie les échéances trimestrielles décalées (15 Fév, 15 Mai, 15 Août, 15 Nov)', () => {
    const r = calculateTaxClass(2_000_000);
    expect(r.echeancesTrimestrielles).toEqual([
      '15 Février',
      '15 Mai',
      '15 Août',
      '15 Novembre',
    ]);
  });

  it('renvoie l’échéance annuelle au 15 Juin', () => {
    const r = calculateTaxClass(2_000_000);
    expect(r.echeanceAnnuelle).toBe('15 Juin');
  });

  it('calcule correctement l’acompte trimestriel (total / 4)', () => {
    const r = calculateTaxClass(2_000_000); // montant: 60 000, tdl: 9 000, total: 69 000
    expect(r.montantTrimestriel).toBe(17_250);
  });
});

