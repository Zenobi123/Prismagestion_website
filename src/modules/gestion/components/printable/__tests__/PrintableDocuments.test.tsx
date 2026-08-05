import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import PrintableFacture, { type FacturePrintData } from '../PrintableFacture';
import PrintableRecu, { type RecuPrintData } from '../PrintableRecu';
import PrintableDevis, { type DevisPrintData } from '../PrintableDevis';
import PrintableProposition, { type PropositionPrintData } from '../PrintableProposition';
import PrintableCourrier, { type CourrierPrintData } from '../PrintableCourrier';
import { DEFAULT_CABINET_CONFIG } from '@gestion/lib/spec/cabinetConfig';
import {
  PAGE_STYLE_FACTURE,
  RECU_PRINT_CSS,
  PAGE_STYLE_RECU,
  PAGE_STYLE_DEVIS,
  PAGE_STYLE_PROPOSITION,
  PRINT_PAGE_FRAME_CSS,
  DEVIS_PRINT_CSS,
} from '@gestion/lib/spec/printStyles';
import type { ClientSpec } from '@gestion/lib/spec/fiscal';
import type { ReactElement } from 'react';

// Texte visible normalisé : retire <style>, balises, décode les entités et
// uniformise les espaces (insécables/étroits issus de toLocaleString).
const text = (el: ReactElement): string =>
  renderToStaticMarkup(el)
    .replace(/<style[^>]*>[\s\S]*?<\/style>/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&#x27;|&#39;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim();

const client: ClientSpec = {
  id: 1,
  type: 'Personne morale',
  name: 'ENTREPRISE TEST SARL',
  niu: 'M0000000000A',
  cdi: '',
  ville: 'Yaoundé',
  quartier: 'Bastos',
  phone: '690000000',
  contact: '690000000',
  civilite: 'M.',
  secteur: '',
  externalise: 'Non',
  statut: 'Actif',
  modePaiementIGS: 'annuel',
  modePaiementPSL: 'annuel',
  createdAt: new Date().toISOString(),
};

const cfg = DEFAULT_CABINET_CONFIG;

describe('Rendus imprimables fidèles au vanilla', () => {
  it('Facture : libellés et formats conformes', () => {
    const data: FacturePrintData = {
      number: 'N° 0001/2026/06',
      date: '2026-06-10',
      client,
      prestations: [
        { type: 'Impôt', designation: 'IGS', qty: 1, price: 50000, total: 50000 },
        { type: 'Honoraire', designation: 'Tenue de comptabilité', qty: 1, price: 100000, total: 100000 },
      ],
      totalImpots: 50000,
      totalHonoraires: 100000,
      total: 150000,
    };
    const txt = text(<PrintableFacture data={data} config={cfg} />);

    expect(txt).toContain('FACTURE');
    // Date en toutes lettres (mois long), comme la référence.
    expect(txt).toContain('10 juin 2026');
    expect(txt).toContain('Prix Unitaire');
    expect(txt).toContain('TOTAL À PAYER');
    // Bloc paiement (libellé fidèle, pas « Mode : »).
    expect(txt).toContain('Mode de paiement :');
    // displayFacture() : montants de ligne nus, totaux et sous-totaux en
    // « F CFA ». Le numéro n'apparaît que dans sa carte, pas au-dessus du
    // tableau (ce bandeau n'existe que dans printFacture()).
    expect(txt).not.toContain('Facture N° 0001/2026/06');
    expect(txt).toContain('Numéro de facture N° 0001/2026/06');
    expect(txt).toContain('1 50 000 50 000');
    expect(txt).toContain('150 000 F CFA');
    expect(txt).toContain('50 000 F CFA');
    expect(txt).toContain('Impôt');
    expect(txt).toContain('Honoraire');
  });

  it('Reçu : montant en lettres suffixé « francs CFA »', () => {
    const data: RecuPrintData = {
      number: 'RECU-0001/2026',
      date: '2026-06-10',
      client,
      montant: 150000,
      montantImpots: 50000,
      montantHonoraires: 100000,
      paymentMode: 'Mobile Money',
      motif: 'Règlement facture N° 0001/2026/06',
    };
    const txt = text(<PrintableRecu data={data} config={cfg} />);
    expect(txt).toContain('REÇU DE PAIEMENT');
    expect(txt).toContain('Reçu de :');
    expect(txt).toContain('francs CFA');
    expect(txt).toContain('150 000 F CFA');
  });

  it('Devis : en-tête, conditions et total fidèles', () => {
    const data: DevisPrintData = {
      number: 'DEVIS-0001/2026/06',
      date: '2026-06-10',
      status: 'brouillon',
      client,
      prestations: [{ type: 'Honoraire', designation: 'Mission', qty: 1, price: 200000, total: 200000 }],
      totalImpots: 0,
      totalHonoraires: 200000,
      total: 200000,
    };
    const txt = text(<PrintableDevis data={data} config={cfg} />);
    expect(txt).toContain('DEVIS / PROFORMA');
    expect(txt).toContain('Destinataire :');
    expect(txt).toContain('Conditions du devis');
    expect(txt).toContain('10 juin 2026');
    expect(txt).toContain('200 000 F CFA');
    // Zone destinataire : la ligne contact est rendue dès qu'un contact existe.
    expect(txt).toContain('Contact : 690000000');
  });

  it("Devis : pas de ligne contact quand le contact principal est vide (comme devis.html)", () => {
    const data: DevisPrintData = {
      number: 'DEVIS-0002/2026/06',
      date: '2026-06-10',
      status: 'brouillon',
      client: { ...client, contact: undefined },
      prestations: [{ type: 'Honoraire', designation: 'Mission', qty: 1, price: 200000, total: 200000 }],
      totalImpots: 0,
      totalHonoraires: 200000,
      total: 200000,
    };
    const txt = text(<PrintableDevis data={data} config={cfg} />);
    // Le devis de référence n'affiche la ligne que si clientData.contact existe :
    // pas de repli sur le nom, qui figure déjà juste au-dessus.
    expect(txt).not.toContain('Contact :');
    expect(txt).toContain('ENTREPRISE TEST SARL');
  });

  it('Proposition : titre et colonnes fidèles', () => {
    const data: PropositionPrintData = {
      date: '2026-06-10',
      client,
      lignes: [{ type: 'Impôt', designation: 'IGS', base: 500000, fraction: 25, amount: 125000 }],
      totalImpots: 125000,
      totalHonoraires: 0,
      total: 125000,
    };
    const txt = text(<PrintableProposition data={data} config={cfg} />);
    expect(txt).toContain('PROPOSITION DE PAIEMENT');
    expect(txt).toContain('attention de Monsieur');
    expect(txt).toContain('Base annuelle');
    expect(txt).toContain('125 000 F CFA');
  });

  it('Courrier : structure et styles fidèles à displayCourrier', () => {
    const data: CourrierPrintData = {
      ref: 'CRR-0001/2026/06',
      date: '2026-06-13',
      destinataire: 'ENTREPRISE TEST SARL',
      destinataireAdresse: 'Yaoundé - Bastos',
      civiliteDestinataire: 'Monsieur',
      objet: 'Relance pour pièces manquantes',
      corps: 'Premier paragraphe.\n\nSecond paragraphe.',
      pj: '1. Avis d\'imposition\n2. Quittance',
      statut: 'envoye',
    };
    const el = <PrintableCourrier data={data} config={cfg} />;
    const txt = text(el);
    const html = renderToStaticMarkup(el);

    // Contenu visible
    expect(txt).toContain('Réf : CRR-0001/2026/06');
    expect(txt).toContain('Yaoundé, le 13 juin 2026'); // date format long
    expect(txt).toContain("À l'attention de Monsieur");
    expect(txt).toContain('Objet : Relance pour pièces manquantes');
    expect(txt).toContain('Premier paragraphe.');
    expect(txt).toContain('Second paragraphe.');
    expect(txt).toContain('Pièces jointes :');
    expect(txt).toContain("Avis d'imposition"); // numérotation « 1. » retirée
    expect(txt).toContain('Pour PRISMA GESTION');
    expect(txt).toContain('ENVOYÉ'); // badge statut en majuscules
    expect(txt).toContain('PRISMA Manager');

    // Styles inline fidèles au vanilla
    expect(html).toContain('font-size:1.5rem'); // titre cabinet
    expect(html).toContain('letter-spacing:0.17em'); // slogan
    expect(html).toContain('border-bottom:2px solid #1e3a8a'); // trait de séparation
    expect(html).toContain('font-size:14pt'); // bloc objet
    expect(html).toContain('border-radius:0 6px 6px 0'); // bloc objet
    expect(html).toContain('font-size:13.5pt'); // corps
    expect(html).toContain('line-height:1.65'); // interligne global
    expect(html).toContain('border-radius:999px'); // badge pilule
  });
});

describe('Géométrie des marges (conteneurs « printArea » et @page du vanilla)', () => {
  const factureData: FacturePrintData = {
    number: 'N° 0001/2026/06',
    date: '2026-06-10',
    client,
    prestations: [],
    totalImpots: 0,
    totalHonoraires: 0,
    total: 0,
  };
  const recuData: RecuPrintData = {
    number: 'RECU-0001/2026',
    date: '2026-06-10',
    client,
    montant: 1000,
    montantImpots: 0,
    montantHonoraires: 0,
    paymentMode: 'Espèces',
    motif: 'Test',
  };
  const devisData: DevisPrintData = {
    number: 'DEVIS-0001/2026/06',
    date: '2026-06-10',
    status: 'brouillon',
    client,
    prestations: [{ type: 'Honoraire', designation: 'Mission', qty: 1, price: 1, total: 1 }],
    totalImpots: 0,
    totalHonoraires: 1,
    total: 1,
  };
  const propositionData: PropositionPrintData = {
    date: '2026-06-10',
    client,
    lignes: [{ type: 'Impôt', designation: 'IGS', base: 1, fraction: 25, amount: 1 }],
    totalImpots: 1,
    totalHonoraires: 0,
    total: 1,
  };

  it('Facture : carte max-w-4xl/p-8 (.prisma-print-page print-area) + @page du module', () => {
    const html = renderToStaticMarkup(<PrintableFacture data={factureData} config={cfg} />);
    expect(html).toContain('prisma-print-page print-area');
    // facture-app.html : <div class="max-w-4xl mx-auto bg-white p-8 print-area">
    expect(PRINT_PAGE_FRAME_CSS).toContain('max-width: 56rem');
    expect(PRINT_PAGE_FRAME_CSS).toContain('padding: 2rem');
    // Bloc print du <head> de facture-app.html : 10 mm en première page,
    // 20 mm en haut des suivantes (et non les marges de printFacture()).
    expect(PAGE_STYLE_FACTURE).toContain('@page { size: A4; margin: 20mm 10mm 10mm 10mm; }');
    expect(PAGE_STYLE_FACTURE).toContain('@page :first { margin: 10mm 10mm; }');
    // prisma-print.css : reset .print-area à l'impression.
    expect(PAGE_STYLE_FACTURE).toContain('--print-blue-strong: #c9dcfb');
  });

  it("Facture : rendu de l'aperçu vanilla, pas du document printFacture()", () => {
    const html = renderToStaticMarkup(<PrintableFacture data={factureData} config={cfg} />);
    // displayFacture() : « Quantité » en toutes lettres, montants de ligne sans
    // unité, et aucun des marqueurs propres à printFacture().
    expect(html).toContain('Quantité');
    expect(html).not.toContain('Qté');
    expect(html).not.toContain('fct-');
    expect(html).not.toContain('&nbsp;·&nbsp;');
    // Groupe insécable recherché par documentExport.ts pour éviter la coupure.
    expect(html).toContain('invoice-payment-signature-group');
  });

  it('Reçu : conteneur max-w-3xl p-8 + double bordure + @page 10mm', () => {
    const html = renderToStaticMarkup(<PrintableRecu data={recuData} config={cfg} />);
    expect(html).toContain('print-area');
    expect(html).toContain('max-w-3xl');
    expect(html).toContain('p-8');
    expect(html).toContain('3px double #1e3a8a');
    expect(PAGE_STYLE_RECU).toContain('@page { size: A4; margin: 10mm 10mm; }');
  });

  it('Reçu : le bandeau reste lisible et pleine largeur à l\'impression', () => {
    const html = renderToStaticMarkup(<PrintableRecu data={recuData} config={cfg} />);
    expect(html).toContain('prisma-recu-banner');
    // Sans héritage, le `h1 { color: #1e3a8a }` de prisma-print.css peignait le
    // titre en bleu marine sur le bandeau bleu marine (illisible en Ctrl+P).
    expect(RECU_PRINT_CSS).toContain('color: inherit !important');
    // Padding rendu au conteneur : les marges négatives du bandeau redeviennent
    // cohérentes et il ne déborde plus à droite.
    expect(RECU_PRINT_CSS).toContain('.prisma-printable.print-area { padding: 2rem !important; }');
    // Le correctif vaut aussi pour l'iframe d'impression du dialogue.
    expect(PAGE_STYLE_RECU).toContain('prisma-recu-banner');
  });

  it('Devis : conteneur A4 responsive + ligne total-row + @page 10mm', () => {
    const html = renderToStaticMarkup(<PrintableDevis data={devisData} config={cfg} />);
    expect(html).toContain('print-area');
    expect(html).toContain('prisma-devis-page');
    expect(html).toContain('devis-table-wrap');
    expect(html).toContain('total-row');
    expect(DEVIS_PRINT_CSS).toContain('.devis-table { width: 100%; min-width: 620px;');
    expect(PAGE_STYLE_DEVIS).toContain('@page { size: A4; margin: 10mm 10mm; }');
  });

  it('Devis : géométrie de capture identique à devis.html (max-w-4xl, p-5, sans min-height)', () => {
    // html2canvas capture le nœud tel qu'affiché puis jsPDF l'étire sur 190 mm :
    // une largeur autre que 896 px donnerait un document zoomé, et un
    // min-height A4 ajouterait une seconde page vide sur un devis court.
    expect(DEVIS_PRINT_CSS).toContain('width: 56rem');
    expect(DEVIS_PRINT_CSS).toContain('padding: 1.25rem');
    expect(DEVIS_PRINT_CSS).not.toContain('min-height: 297mm');
    expect(DEVIS_PRINT_CSS).not.toContain('width: min(100%, 210mm)');
  });

  it('Proposition : conteneur max-w-4xl p-8 + sections bg-section + @page 10mm', () => {
    const html = renderToStaticMarkup(<PrintableProposition data={propositionData} config={cfg} />);
    expect(html).toContain('print-area');
    expect(html).toContain('max-w-4xl');
    expect(html).toContain('p-8');
    expect(html).toContain('bg-section');
    expect(PAGE_STYLE_PROPOSITION).toContain('@page { size: A4; margin: 10mm 10mm; }');
  });
});
