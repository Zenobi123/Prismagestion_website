// Rendu de la FACTURE — PORT FIDÈLE de facture-app.html / displayFacture().
//
// Pourquoi displayFacture() et non printFacture() : le module vanilla porte deux
// rendus distincts. `printFacture()` fabrique un document A4 compact réservé à
// l'impression navigateur (classes .fct-*, colonne « Qté », montants suffixés
// « F », bandeau récapitulatif au-dessus du tableau). `downloadPDF()`, lui,
// capture `#printArea` — c'est-à-dire l'aperçu écran peint par displayFacture().
// Le PDF de référence remis par le cabinet est donc celui de l'aperçu : c'est ce
// rendu-là qui fait foi, et il sert ici aux trois usages (aperçu, PDF, impression)
// pour que les trois donnent le même document.
import { forwardRef } from 'react';
import type { ClientSpec } from '@gestion/lib/spec/fiscal';
import type { Prestation } from '@gestion/lib/spec/facturePrestations';
import type { CabinetConfig } from '@gestion/lib/spec/cabinetConfig';
import { PRINT_PAGE_FRAME_CSS } from '@gestion/lib/spec/printStyles';

export interface FacturePrintData {
  number: string;
  date: string;
  client: ClientSpec;
  prestations: Prestation[];
  totalImpots: number;
  totalHonoraires: number;
  total: number;
}

interface Props {
  data: FacturePrintData;
  config: CabinetConfig;
}

// Vanilla : montants de ligne sans unité, totaux et sous-totaux en « F CFA ».
const fr = (n: number) => Math.round(n || 0).toLocaleString('fr-FR');
const fCFA = (n: number) => `${fr(n)} F CFA`;

// Styles répétés du bandeau TOTAL : le vanilla les pose en inline sur la ligne
// ET sur chaque cellule, pour que le fond bleu survive à l'impression.
const TOTAL_CELL: React.CSSProperties = {
  backgroundColor: '#1e3a8a',
  color: 'white',
  WebkitPrintColorAdjust: 'exact',
  printColorAdjust: 'exact',
};

const PrintableFacture = forwardRef<HTMLDivElement, Props>(({ data, config }, ref) => {
  let dateStr = 'N/A';
  try {
    dateStr = new Date(data.date).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  } catch {
    /* noop */
  }

  const c = data.client;

  return (
    <div ref={ref} className="prisma-printable">
      <style dangerouslySetInnerHTML={{ __html: PRINT_PAGE_FRAME_CSS }} />
      {/* Réplique du conteneur vanilla : <div class="max-w-4xl mx-auto bg-white p-8 print-area" id="printArea"> */}
      <div className="prisma-print-page print-area">
        {/* En-tête */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-2xl font-bold text-blue-900">{config.nomCabinet}</h1>
            <p className="text-xs text-gray-600 uppercase tracking-widest">{config.slogan}</p>
            <div className="text-xs mt-2 text-gray-700">
              <p>Siège Social : {config.siege}</p>
              <p>Tél : {config.telephone}</p>
              <p>N.I.U : {config.niu}</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-4xl font-bold text-blue-900">FACTURE</div>
            <p className="text-sm text-gray-600 mt-2">Date : {dateStr}</p>
          </div>
        </div>

        <div style={{ borderBottom: '3px solid #1e3a8a', marginBottom: '2rem' }} />

        {/* Numéro + Facturé à */}
        <div className="grid grid-cols-2 gap-6 mb-6">
          <div
            style={{
              background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
              color: 'white',
              padding: '1rem',
              borderRadius: '8px',
            }}
          >
            <p className="text-sm opacity-90">Numéro de facture</p>
            <p className="text-2xl font-bold">{data.number}</p>
          </div>
          <div
            style={{
              backgroundColor: '#f9fafb',
              padding: '1rem',
              borderRadius: '8px',
              border: '2px solid #e5e7eb',
            }}
          >
            <p className="text-xs font-semibold text-gray-600 uppercase mb-2">Facturé à :</p>
            <p className="font-bold text-lg">{c.name || 'Client'}</p>
            {c.niu && <p className="text-sm text-gray-700">NIU : {c.niu}</p>}
            {/* Vanilla : la ligne n'existe que si la ville est renseignée ; le
                quartier n'apparaît jamais seul. */}
            {c.ville && (
              <p className="text-sm text-gray-700">
                {c.ville}
                {c.quartier ? ` - ${c.quartier}` : ''}
              </p>
            )}
            {c.contact && <p className="text-sm text-gray-700 mt-1">Contact : {c.contact}</p>}
          </div>
        </div>

        {/* Tableau des prestations */}
        <table className="w-full border-collapse mb-6">
          <thead>
            <tr style={{ backgroundColor: '#1e3a8a', color: 'white' }}>
              <th className="px-4 py-3 text-center" style={{ width: '10%' }}>N°</th>
              <th className="px-4 py-3 text-left" style={{ width: '45%' }}>Désignation</th>
              <th className="px-4 py-3 text-center" style={{ width: '15%' }}>Quantité</th>
              <th className="px-4 py-3 text-right" style={{ width: '15%' }}>Prix Unitaire</th>
              <th className="px-4 py-3 text-right" style={{ width: '15%' }}>Montant</th>
            </tr>
          </thead>
          <tbody>
            {data.prestations.map((p, i) => (
              <tr key={i} className="border-b">
                <td className="px-4 py-3 text-center">{i + 1}</td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-block px-2 py-1 text-xs font-semibold rounded ${
                      p.type === 'Impôt' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                    }`}
                  >
                    {p.type}
                  </span>
                  <span className="ml-1">{p.designation}</span>
                </td>
                <td className="px-4 py-3 text-center">{p.qty}</td>
                <td className="px-4 py-3 text-right">{fr(p.price)}</td>
                <td className="px-4 py-3 text-right font-semibold text-blue-900">{fr(p.total)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="total-row" style={{ ...TOTAL_CELL, fontWeight: 'bold', fontSize: '1.1rem' }}>
              <td colSpan={4} className="px-4 py-3 text-right text-lg" style={TOTAL_CELL}>
                TOTAL À PAYER
              </td>
              <td className="px-4 py-3 text-right text-xl" style={TOTAL_CELL}>
                {fCFA(data.total)}
              </td>
            </tr>
          </tfoot>
        </table>

        {/* Sous-totaux */}
        <div className="mt-6 mb-6 grid grid-cols-2 gap-4">
          <div style={{ backgroundColor: '#dbeafe', borderLeft: '4px solid #3b82f6', padding: '1rem' }}>
            <p className="text-sm text-blue-900 font-semibold">Total Impôts</p>
            <p className="text-2xl font-bold text-blue-900">{fCFA(data.totalImpots)}</p>
          </div>
          <div style={{ backgroundColor: '#d1fae5', borderLeft: '4px solid #10b981', padding: '1rem' }}>
            <p className="text-sm text-green-900 font-semibold">Total Honoraires</p>
            <p className="text-2xl font-bold text-green-900">{fCFA(data.totalHonoraires)}</p>
          </div>
        </div>

        {/* Paiement + signature + pied : groupe insécable. La classe est celle que
            documentExport.ts recherche pour repousser le bloc en page suivante
            plutôt que de le couper — d'où les 2 pages du PDF de référence. */}
        <div
          className="invoice-payment-signature-group"
          style={{ display: 'flow-root', pageBreakInside: 'avoid', breakInside: 'avoid' }}
        >
          <div
            style={{
              backgroundColor: '#f0f9ff',
              borderLeft: '4px solid #1e3a8a',
              padding: '1rem',
              marginTop: '2rem',
            }}
          >
            <h3 className="font-bold text-blue-900 mb-2" style={{ fontSize: '0.875rem', lineHeight: '1.25rem' }}>
              Informations de paiement
            </h3>
            <div className="text-sm" style={{ fontSize: '0.8125rem', lineHeight: 1.45 }}>
              <p>
                <strong>Mode de paiement :</strong> {config.modePaiement}
              </p>
              <p>
                <strong>Numéros :</strong> {config.numerosPaiement}
              </p>
              <p>
                <strong>Échéance :</strong> {config.echeanceFacture}
              </p>
            </div>
          </div>

          <div className="mt-8 flex justify-end">
            <div className="flex items-center gap-4">
              {config.cachet && (
                <img src={config.cachet} alt="Cachet" style={{ maxHeight: '70px', display: 'block' }} />
              )}
              <div className="text-center">
                <p
                  className="font-bold text-blue-900"
                  style={{ fontSize: '0.875rem', lineHeight: '1.25rem', margin: 0 }}
                >
                  Pour {config.nomCabinet}
                </p>
                {config.signature && (
                  <img
                    src={config.signature}
                    alt="Signature"
                    style={{ maxHeight: '50px', display: 'block', margin: '0.5rem auto' }}
                  />
                )}
                <div style={{ borderTop: '2px solid #9ca3af', paddingTop: '0.5rem', marginTop: '0.5rem' }}>
                  <p className="font-bold" style={{ fontSize: '0.875rem', lineHeight: '1.25rem', margin: 0 }}>
                    {config.signataireNom}
                  </p>
                  <p
                    className="text-sm text-gray-600"
                    style={{ fontSize: '0.8125rem', lineHeight: '1.2rem', margin: 0 }}
                  >
                    {config.signataireTitre}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div
            style={{
              marginTop: '2rem',
              paddingTop: '0.75rem',
              borderTop: '1px solid #e5e7eb',
              textAlign: 'center',
            }}
          >
            <p style={{ fontSize: '0.75rem', color: '#6b7280', margin: 0 }}>
              <span style={{ fontWeight: 600, color: '#1e3a8a' }}>PRISMA Manager</span> — PRISMA GESTION :
              L'expertise qui sécurise votre gestion.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
});

PrintableFacture.displayName = 'PrintableFacture';
export default PrintableFacture;
