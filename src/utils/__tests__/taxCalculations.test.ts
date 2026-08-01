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
  it('la TDL vaut 10 % de l’IGS et le total les additionne', () => {
    const r = calculateTaxClass(2_000_000);
    expect(r.montant).toBe(60_000);
    expect(r.tdl).toBe(6_000);
    expect(r.total).toBe(66_000);
  });

  it.each(BAREME)('classe %i : total = IGS + 10 %%', (_classe, min, _max, montant) => {
    const r = calculateTaxClass(min);
    expect(r.tdl).toBe(Math.round(montant * 0.1));
    expect(r.total).toBe(montant + r.tdl!);
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
