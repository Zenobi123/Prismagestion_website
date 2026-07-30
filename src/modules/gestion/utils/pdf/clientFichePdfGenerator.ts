
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Client } from '@gestion/types/client';
import { PDF_THEME } from './pdfTheme';
import { formatMontantPdf } from './pdfFormat';
import { adaptClient, buildImmoTaxLabel, computeAgencyImmo, getSoldeTaxLabel } from '@gestion/lib/spec/fiscal';

const MARGIN = 14;

const getFormeJuridiqueLabel = (forme: string) => {
  const map: Record<string, string> = {
    sa: "Société Anonyme (SA)",
    sarl: "Société à Responsabilité Limitée (SARL)",
    sas: "Société par Actions Simplifiée (SAS)",
    snc: "Société en Nom Collectif (SNC)",
    association: "Association",
    gie: "Groupement d'Intérêt Économique (GIE)",
    autre: "Autre",
  };
  return map[forme] || forme;
};

const getRegimeFiscalLabel = (regime: string) => {
  const map: Record<string, string> = {
    reel: "Régime Réel",
    igs: "Impôt Général Synthétique (IGS)",
    non_professionnel: "Non Professionnel",
    obnl: "Organisme à But Non Lucratif (OBNL)",
  };
  return map[regime] || regime;
};

export const generateClientFichePDF = (client: Client) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const clientSpec = adaptClient(client);
  const clientName = client.type === 'morale'
    ? (client.raisonsociale || client.nom || 'Client')
    : (client.nom || 'Client');

  // Header bar — vert sauge primary
  doc.setFillColor(...PDF_THEME.primary);
  doc.rect(0, 0, pageWidth, 35, 'F');

  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...PDF_THEME.textWhite);
  doc.text('FICHE CLIENT', pageWidth / 2, 15, { align: 'center' });

  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(clientName, pageWidth / 2, 25, { align: 'center' });

  // Date d'édition
  doc.setFontSize(8);
  doc.setTextColor(...PDF_THEME.primaryLight);
  doc.text(`Éditée le ${new Date().toLocaleDateString('fr-FR')}`, pageWidth / 2, 32, { align: 'center' });

  let currentY = 45;

  /**
   * Dessine une section (titre + tableau clé/valeur) en gérant les sauts de
   * page et en n'affichant rien si le corps est vide — ce qui évite les
   * tableaux vides (ex. adresse/contact non renseignés sur des dossiers
   * importés) et les titres orphelins repoussés dans le pied de page.
   */
  const addSection = (title: string, body: string[][]) => {
    if (body.length === 0) return;

    // Saut de page si le titre n'a plus la place de s'afficher proprement.
    if (currentY > pageHeight - 40) {
      doc.addPage();
      currentY = 20;
    }

    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...PDF_THEME.primary);
    doc.text(title, MARGIN, currentY);
    currentY += 3;

    autoTable(doc, {
      body,
      startY: currentY,
      theme: 'striped',
      styles: { fontSize: 9, cellPadding: 3 },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 55, textColor: PDF_THEME.textBody },
        // La 2e colonne remplit automatiquement la largeur restante :
        // une largeur fixe débordait légèrement de la marge droite.
      },
      alternateRowStyles: { fillColor: PDF_THEME.bgPrimary },
      margin: { left: MARGIN, right: MARGIN },
    });

    currentY = doc.lastAutoTable.finalY + 10;
  };

  // === Section 1: Informations Générales ===
  const generalInfo: string[][] = [];

  generalInfo.push(['Type de client', client.type === 'physique' ? 'Personne Physique' : 'Personne Morale']);
  generalInfo.push(['Statut', client.statut === 'actif' ? 'Actif' : client.statut === 'inactif' ? 'Inactif' : 'Archivé']);

  if (client.type === 'physique') {
    if (client.nom) generalInfo.push(['Nom', client.nom]);
    if (client.sexe) generalInfo.push(['Sexe', client.sexe === 'homme' ? 'Homme' : 'Femme']);
    if (client.etatcivil) generalInfo.push(['État civil', client.etatcivil.charAt(0).toUpperCase() + client.etatcivil.slice(1)]);
  } else {
    if (client.raisonsociale) generalInfo.push(['Raison sociale', client.raisonsociale]);
    if (client.sigle) generalInfo.push(['Sigle', client.sigle]);
    if (client.nomdirigeant) generalInfo.push(['Dirigeant', client.nomdirigeant]);
    if (client.formejuridique) generalInfo.push(['Forme juridique', getFormeJuridiqueLabel(client.formejuridique)]);
    if (client.datecreation) generalInfo.push(['Date de création', new Date(client.datecreation).toLocaleDateString('fr-FR')]);
    if (client.lieucreation) generalInfo.push(['Lieu de création', client.lieucreation]);
    if (client.nomcommercial) generalInfo.push(['Nom commercial', client.nomcommercial]);
    if (client.numerorccm) generalInfo.push(['N° RCCM', client.numerorccm]);
  }

  generalInfo.push(['NIU', client.niu || 'Non renseigné']);
  generalInfo.push(['Régime fiscal', getRegimeFiscalLabel(client.regimefiscal)]);
  generalInfo.push(['Centre de rattachement', client.centrerattachement || 'Non renseigné']);
  generalInfo.push(['Secteur d\'activité', client.secteuractivite || 'Non renseigné']);
  if (client.numerocnps) generalInfo.push(['N° CNPS', client.numerocnps]);
  generalInfo.push(['Gestion de dossiers clients en portefeuille', client.gestionexternalisee ? 'Oui' : 'Non']);

  addSection('INFORMATIONS GÉNÉRALES', generalInfo);

  // === Section 2: Adresse ===
  const addressInfo: string[][] = [];
  if (client.adresse) {
    addressInfo.push(['Ville', client.adresse.ville || 'Non renseigné']);
    addressInfo.push(['Quartier', client.adresse.quartier || 'Non renseigné']);
    addressInfo.push(['Lieu-dit', client.adresse.lieuDit || 'Non renseigné']);
  }
  addSection('ADRESSE', addressInfo);

  // === Section 3: Contact ===
  const contactInfo: string[][] = [];
  if (client.contact) {
    contactInfo.push(['Téléphone', client.contact.telephone || 'Non renseigné']);
    contactInfo.push(['Email', client.contact.email || 'Non renseigné']);
  }
  addSection('CONTACT', contactInfo);

  // === Section 4: Situation fiscale calculée ===
  const hasAgences = !!client.agences && client.agences.length > 0;
  const fiscalInfo: string[][] = [];
  if (clientSpec.chiffreAffaires) {
    fiscalInfo.push([hasAgences ? "Chiffre d'affaires cumulé" : "Chiffre d'affaires", formatMontantPdf(clientSpec.chiffreAffaires)]);
  }
  if (clientSpec.isCGA) fiscalInfo.push(['Adhérent CGA', 'Oui']);
  if (clientSpec.igs) {
    fiscalInfo.push([`IGS${clientSpec.igsClasse ? ` (classe ${clientSpec.igsClasse})` : ''}`, formatMontantPdf(clientSpec.igs)]);
    fiscalInfo.push(['Mode paiement IGS', clientSpec.modePaiementIGS === 'trimestriel' ? 'Trimestriel' : 'Annuel']);
  }
  if (clientSpec.patente) fiscalInfo.push(['Patente', formatMontantPdf(clientSpec.patente)]);
  if (clientSpec.tdl) fiscalInfo.push(['TDL', formatMontantPdf(clientSpec.tdl)]);
  if (clientSpec.soldeIR) fiscalInfo.push([getSoldeTaxLabel(clientSpec), formatMontantPdf(clientSpec.soldeIR)]);
  if (clientSpec.licence) fiscalInfo.push(['Licence boissons', formatMontantPdf(clientSpec.licence)]);
  if (clientSpec.psl) {
    fiscalInfo.push(['PSL total', formatMontantPdf(clientSpec.psl)]);
    fiscalInfo.push(['Mode paiement PSL', clientSpec.modePaiementPSL === 'trimestriel' ? 'Trimestriel' : 'Annuel']);
  }
  if (clientSpec.bail) fiscalInfo.push([`Bail total (${clientSpec.tauxBail}%)`, formatMontantPdf(clientSpec.bail)]);
  if (clientSpec.tf) fiscalInfo.push(['TPF total', formatMontantPdf(clientSpec.tf)]);
  const totalObligations = (clientSpec.igs || 0) + (clientSpec.patente || 0) + (clientSpec.tdl || 0)
    + (clientSpec.soldeIR || 0) + (clientSpec.licence || 0)
    + (clientSpec.psl || 0) + (clientSpec.bail || 0) + (clientSpec.tf || 0);
  if (totalObligations) fiscalInfo.push(['Total obligations calculées', formatMontantPdf(totalObligations)]);
  addSection('SITUATION FISCALE CALCULÉE', fiscalInfo);

  // === Section 5: Situation Immobilière (si renseignée) ===
  if (client.situationimmobiliere) {
    const immoInfo: string[][] = [];
    const formatMontant = formatMontantPdf;

    const immoTypeLabel = client.situationimmobiliere.type === 'proprietaire' ? 'Propriétaire'
      : client.situationimmobiliere.type === 'les_deux' ? 'Locataire & Propriétaire' : 'Locataire';
    immoInfo.push(['Type', immoTypeLabel]);
    if ((client.situationimmobiliere.type === 'proprietaire' || client.situationimmobiliere.type === 'les_deux') && client.situationimmobiliere.valeur) {
      immoInfo.push(['Valeur du bien', formatMontant(client.situationimmobiliere.valeur)]);
    }
    if ((client.situationimmobiliere.type === 'locataire' || client.situationimmobiliere.type === 'les_deux') && client.situationimmobiliere.loyer) {
      immoInfo.push(['Loyer mensuel', formatMontant(client.situationimmobiliere.loyer)]);
      immoInfo.push(['Loyer annuel', formatMontant(client.situationimmobiliere.loyer * 12)]);
    }
    // Impôts immobiliers calculés sur ce bien — en mode multi-agences, les
    // montants de clientSpec agrègent les agences : le détail par bien est
    // alors porté par le tableau AGENCES / ÉTABLISSEMENTS ci-dessous.
    if (!hasAgences) {
      if (clientSpec.psl) immoInfo.push(['PSL calculé', formatMontant(clientSpec.psl)]);
      if (clientSpec.bail) immoInfo.push([`Bail calculé (${clientSpec.tauxBail}%)`, formatMontant(clientSpec.bail)]);
      if (clientSpec.tf) immoInfo.push(['TPF calculée', formatMontant(clientSpec.tf)]);
    }

    addSection('SITUATION IMMOBILIÈRE', immoInfo);
  }

  // === Section 6: Agences / Établissements (si renseignées) ===
  if (client.agences && client.agences.length > 0) {
    const agencesData = client.agences.map((agence) => {
      const taxes = computeAgencyImmo(agence, clientSpec.regimeFiscal);
      const localisation = [agence.ville, agence.quartier].filter(Boolean).join(' / ') || 'Non renseignée';
      const statut = agence.statutImmo === 'proprietaire' ? 'Propriétaire'
        : agence.statutImmo === 'locataire' ? 'Locataire'
        : agence.statutImmo === 'les_deux' ? 'Locataire & Propriétaire'
        : 'Non renseigné';
      const taxesText = [
        taxes.psl ? `${buildImmoTaxLabel('PSL', agence)}: ${formatMontantPdf(taxes.psl)}` : '',
        taxes.bail ? `${buildImmoTaxLabel('Bail', agence)}: ${formatMontantPdf(taxes.bail)}` : '',
        taxes.tf ? `${buildImmoTaxLabel('TPF', agence)}: ${formatMontantPdf(taxes.tf)}` : '',
      ].filter(Boolean).join('\n') || 'Aucun impôt immobilier';

      return [
        agence.principale ? `${agence.libelle || 'Siège'} (principal)` : (agence.libelle || 'Agence'),
        localisation,
        statut,
        formatMontantPdf(agence.chiffreAffaires || 0),
        agence.loyerMensuel ? formatMontantPdf(agence.loyerMensuel) : '-',
        agence.valeurBien ? formatMontantPdf(agence.valeurBien) : '-',
        taxesText,
      ];
    });

    if (currentY > pageHeight - 60) {
      doc.addPage();
      currentY = 20;
    }
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...PDF_THEME.primary);
    doc.text('AGENCES / ÉTABLISSEMENTS', MARGIN, currentY);
    currentY += 3;
    autoTable(doc, {
      head: [['Agence', 'Localisation', 'Statut immo', 'CA', 'Loyer mensuel', 'Valeur bien', 'Impôts']],
      body: agencesData,
      startY: currentY,
      styles: { fontSize: 7, cellPadding: 2, overflow: 'linebreak' },
      headStyles: { fillColor: PDF_THEME.primaryDark, textColor: 255 },
      alternateRowStyles: { fillColor: PDF_THEME.bgLight },
      margin: { left: MARGIN, right: MARGIN },
    });
    currentY = doc.lastAutoTable.finalY + 10;
  }

  // === Section 7: Interactions ===
  if (client.interactions && client.interactions.length > 0) {
    if (currentY > pageHeight - 40) {
      doc.addPage();
      currentY = 20;
    }

    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...PDF_THEME.primary);
    doc.text('HISTORIQUE DES INTERACTIONS', MARGIN, currentY);
    currentY += 3;

    const interactionsData = client.interactions.map(i => [
      new Date(i.date).toLocaleDateString('fr-FR'),
      i.description
    ]);

    autoTable(doc, {
      head: [['Date', 'Description']],
      body: interactionsData,
      startY: currentY,
      styles: { fontSize: 8, cellPadding: 3 },
      headStyles: { fillColor: PDF_THEME.primaryDark, textColor: 255 },
      alternateRowStyles: { fillColor: PDF_THEME.bgLight },
      columnStyles: {
        0: { cellWidth: 30 },
      },
      margin: { left: MARGIN, right: MARGIN },
    });
  }

  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(...PDF_THEME.textMuted);
    doc.text(
      `Page ${i}/${pageCount} — Fiche client générée automatiquement`,
      pageWidth / 2,
      pageHeight - 10,
      { align: 'center' }
    );
  }

  // Save
  const sanitizedName = clientName.replace(/[\u202F\u00A0]/g, '_');
  doc.save(`fiche_client_${sanitizedName}.pdf`);
};
