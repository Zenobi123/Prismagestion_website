
import jsPDF from 'jspdf';
import { formatMontantPdf } from '@gestion/utils/pdf/pdfFormat';
import autoTable from 'jspdf-autotable';
import { ReportDataService } from './reportDataService';

export const generateChiffresAffairesReport = async () => {
  try {
    const data = await ReportDataService.getAllReportData();
    const stats = ReportDataService.calculateFinancialStats(data.factures, data.paiements);
    
    const doc = new jsPDF();

    // En-tête
    doc.setFontSize(18);
    doc.text('Rapport Chiffre d\'Affaires', 14, 22);
    doc.setFontSize(10);
    doc.text(`Généré le ${new Date().toLocaleDateString()}`, 14, 30);

    // Résumé financier
    doc.setFontSize(14);
    doc.text('Résumé Financier', 14, 45);

    // Le chiffre d'affaires du cabinet, ce sont les honoraires. Les impôts
    // refacturés transitent par la facture mais ne lui appartiennent pas.
    const summaryData = [
      ["Chiffre d'affaires (honoraires)", `${formatMontantPdf(stats.chiffreAffaires)}`],
      ['Débours refacturés (impôts)', `${formatMontantPdf(stats.debours)}`],
      ['Total facturé aux clients', `${formatMontantPdf(stats.totalFactures)}`],
      ['Total Paiements', `${formatMontantPdf(stats.totalPaiements)}`],
      ['Taux de Recouvrement', `${stats.tauxRecouvrement.toFixed(1)}%`],
      ['Factures Payées', stats.facuresPayees.toString()],
      ['Factures en Retard', stats.facturesEnRetard.toString()]
    ];

    autoTable(doc, {
      startY: 55,
      head: [['Indicateur', 'Valeur']],
      body: summaryData,
      theme: 'grid'
    });

    // Détail des factures par mois
    const currentY = doc.lastAutoTable.finalY + 20;
    doc.setFontSize(14);
    doc.text('Évolution Mensuelle', 14, currentY);

    // Grouper les factures par mois
    const facturesByMonth = data.factures.reduce((acc, facture) => {
      const month = new Date(facture.date).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long' });
      if (!acc[month]) acc[month] = { count: 0, honoraires: 0, impots: 0, total: 0 };
      acc[month].count++;
      acc[month].honoraires += facture.montant_honoraires || 0;
      acc[month].impots += facture.montant_impots || 0;
      acc[month].total += facture.montant || 0;
      return acc;
    }, {});

    const monthlyData = Object.entries(facturesByMonth).map(
      ([month, data]: [string, { count: number; honoraires: number; impots: number; total: number }]) => [
        month,
        data.count.toString(),
        `${formatMontantPdf(data.honoraires)}`,
        `${formatMontantPdf(data.impots)}`,
        `${formatMontantPdf(data.total)}`
      ]);

    autoTable(doc, {
      startY: currentY + 10,
      head: [['Mois', 'Factures', 'Honoraires', 'Débours', 'Total facturé']],
      body: monthlyData,
      theme: 'grid',
      styles: { fontSize: 8 }
    });
    
    doc.save(`chiffre-affaires-${new Date().toISOString().slice(0, 10)}.pdf`);
  } catch { /* erreur ignoree volontairement */ }
};

export const generateFacturationReport = async () => {
  try {
    const data = await ReportDataService.getAllReportData();
    
    const doc = new jsPDF();
    
    doc.setFontSize(18);
    doc.text('Rapport de Facturation', 14, 22);
    doc.setFontSize(10);
    doc.text(`Généré le ${new Date().toLocaleDateString()}`, 14, 30);
    
    // Tableau des factures
    const facturesData = data.factures.slice(0, 50).map((facture) => [
      facture.id,
      facture.clients?.nom || facture.clients?.raisonsociale || 'Client inconnu',
      new Date(facture.date).toLocaleDateString(),
      `${formatMontantPdf((facture.montant || 0))}`,
      facture.status_paiement || 'Non défini'
    ]);
    
    autoTable(doc, {
      startY: 40,
      head: [['N° Facture', 'Client', 'Date', 'Montant', 'Statut']],
      body: facturesData,
      theme: 'grid',
      styles: { fontSize: 8 }
    });
    
    doc.save(`facturation-${new Date().toISOString().slice(0, 10)}.pdf`);
  } catch { /* erreur ignoree volontairement */ }
};

export const generateCreancesReport = async () => {
  try {
    const data = await ReportDataService.getAllReportData();
    
    // Filtrer les factures impayées
    const facturesImpayees = data.factures.filter((f) => 
      f.status_paiement === 'non_payée' || f.status_paiement === 'partiellement_payée'
    );
    
    const doc = new jsPDF();
    
    doc.setFontSize(18);
    doc.text('Rapport des Créances', 14, 22);
    doc.setFontSize(10);
    doc.text(`Généré le ${new Date().toLocaleDateString()}`, 14, 30);
    
    const creancesData = facturesImpayees.map((facture) => {
      const montantRestant = (facture.montant || 0) - (facture.montant_paye || 0);
      const joursRetard = Math.floor((new Date().getTime() - new Date(facture.echeance).getTime()) / (1000 * 60 * 60 * 24));
      
      return [
        facture.clients?.nom || facture.clients?.raisonsociale || 'Client inconnu',
        facture.id,
        new Date(facture.echeance).toLocaleDateString(),
        `${formatMontantPdf(montantRestant)}`,
        joursRetard > 0 ? `${joursRetard} jours` : 'Non échu'
      ];
    });
    
    autoTable(doc, {
      startY: 40,
      head: [['Client', 'N° Facture', 'Échéance', 'Montant Restant', 'Retard']],
      body: creancesData,
      theme: 'grid',
      styles: { fontSize: 8 }
    });
    
    doc.save(`creances-${new Date().toISOString().slice(0, 10)}.pdf`);
  } catch { /* erreur ignoree volontairement */ }
};
