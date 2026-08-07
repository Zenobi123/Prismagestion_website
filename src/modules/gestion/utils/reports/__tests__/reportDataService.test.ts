import { describe, it, expect } from 'vitest';
import { ReportDataService } from '../reportDataService';

/**
 * Ces tests figent la distinction la plus facile à perdre du module :
 * ce que le client doit n'est pas ce que le cabinet gagne.
 *
 * Les montants reproduisent la structure réelle d'une facture PRISMA : une
 * ligne d'honoraires modeste et des impôts refacturés bien plus lourds.
 */
describe('calculateFinancialStats — ventilation débours / honoraires', () => {
  const factures = [
    // 167 000 dus, dont 132 000 d'impots encaisses pour le compte du client
    { montant: 167_000, montant_honoraires: 35_000, montant_impots: 132_000, status_paiement: 'payée' },
    // 9 100 dus, dont 2 100 d'ACF
    { montant: 9_100, montant_honoraires: 7_000, montant_impots: 2_100, status_paiement: 'non_payée', echeance: '2030-01-01' },
  ];
  const paiements = [{ montant: 167_000 }];

  it("ne compte que les honoraires dans le chiffre d'affaires", () => {
    const stats = ReportDataService.calculateFinancialStats(factures, paiements);
    expect(stats.chiffreAffaires).toBe(42_000);
  });

  it('isole les impôts refacturés en débours', () => {
    const stats = ReportDataService.calculateFinancialStats(factures, paiements);
    expect(stats.debours).toBe(134_100);
  });

  it('conserve le total dû par les clients, impôts compris', () => {
    const stats = ReportDataService.calculateFinancialStats(factures, paiements);
    expect(stats.totalFactures).toBe(176_100);
    // La ventilation doit toujours reconstituer le total.
    expect(stats.chiffreAffaires + stats.debours).toBe(stats.totalFactures);
  });

  it('assoit le taux de recouvrement sur le total dû, pas sur les honoraires', () => {
    const stats = ReportDataService.calculateFinancialStats(factures, paiements);
    // 167 000 encaissés sur 176 100 dus. Rapporté aux seuls honoraires, le
    // taux dépasserait 300 % — l'erreur que ce test empêche.
    expect(stats.tauxRecouvrement).toBeCloseTo(94.83, 1);
  });

  it('traite une facture sans ventilation comme un chiffre d\'affaires nul', () => {
    // Cas d'une facture sans ligne : la base laisse les colonnes à 0.
    const stats = ReportDataService.calculateFinancialStats(
      [{ montant: 50_000, status_paiement: 'non_payée', echeance: '2030-01-01' }],
      [],
    );
    expect(stats.chiffreAffaires).toBe(0);
    expect(stats.debours).toBe(0);
    expect(stats.totalFactures).toBe(50_000);
  });
});
