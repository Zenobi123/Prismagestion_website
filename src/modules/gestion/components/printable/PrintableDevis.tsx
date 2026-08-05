// Rendu imprimable du DEVIS / PROFORMA — PORT FIDÈLE de devis.html / displayDevis().
import { forwardRef } from 'react';
import type { ClientSpec } from '@gestion/lib/spec/fiscal';
import type { Prestation } from '@gestion/lib/spec/facturePrestations';
import type { CabinetConfig } from '@gestion/lib/spec/cabinetConfig';
import { DEVIS_PRINT_CSS } from '@gestion/lib/spec/printStyles';

export type DevisStatus = 'brouillon' | 'envoye' | 'accepte' | 'refuse' | 'converti';

const STATUS_LABEL: Record<DevisStatus, string> = {
  brouillon: 'brouillon',
  envoye: 'envoyé',
  accepte: 'accepté',
  refuse: 'refusé',
  converti: 'converti',
};
const STATUS_COLORS: Record<DevisStatus, string> = {
  brouillon: 'bg-gray-200 text-gray-800',
  envoye: 'bg-blue-200 text-blue-800',
  accepte: 'bg-green-200 text-green-800',
  refuse: 'bg-red-200 text-red-800',
  converti: 'bg-purple-200 text-purple-800',
};

export interface DevisPrintData {
  number: string;
  date: string;
  status: DevisStatus;
  client: ClientSpec;
  prestations: Prestation[];
  totalImpots: number;
  totalHonoraires: number;
  total: number;
}

interface Props {
  data: DevisPrintData;
  config: CabinetConfig;
}

const fr = (n: number) => Math.round(n || 0).toLocaleString('fr-FR');
const fCFA = (n: number) => `${fr(n)} F CFA`;

const PrintableDevis = forwardRef<HTMLDivElement, Props>(({ data, config }, ref) => {
  const dateStr = new Date(data.date).toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const c = data.client;
  const villeLine = [c.ville, c.quartier].filter(Boolean).join(' - ');

  return (
    <div ref={ref} className="prisma-printable prisma-devis-printable">
      <style dangerouslySetInnerHTML={{ __html: DEVIS_PRINT_CSS }} />
      <div className="prisma-devis-page print-area">
      {/* En-tête */}
      <div className="devis-header">
        <div>
          <h1 className="devis-company-name">{config.nomCabinet}</h1>
          <p className="devis-company-sub">{config.slogan}</p>
          <div className="devis-company-info">
            <p>Siège Social : {config.siege}</p>
            <p>Tél : {config.telephone}</p>
            <p>N.I.U : {config.niu}</p>
          </div>
        </div>
        <div className="devis-title">
          <div className="devis-doc-title">DEVIS / PROFORMA</div>
          <p className="text-xs text-gray-600 mt-1">Date : {dateStr}</p>
          <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-semibold ${STATUS_COLORS[data.status]}`}>
            {STATUS_LABEL[data.status]}
          </span>
        </div>
      </div>

      <div className="devis-divider" />

      {/* Numéro + Destinataire */}
      <div className="devis-summary">
        <div className="devis-number-card">
          <p className="text-xs opacity-90">Numéro de devis</p>
          <p className="text-lg font-bold">{data.number}</p>
        </div>
        <div className="devis-client-card">
          <p className="text-xs font-semibold text-gray-600 uppercase">Destinataire :</p>
          <p className="font-bold text-sm">{c.name}</p>
          {c.niu && <p className="text-xs text-gray-700">NIU : {c.niu}</p>}
          {villeLine && <p className="text-xs text-gray-700">{villeLine}</p>}
          {/* Conditionnelle, comme le devis de référence et la facture. */}
          {c.contact && <p className="text-xs text-gray-700">Contact : {c.contact}</p>}
        </div>
      </div>

      {/* Tableau */}
      <div className="devis-table-wrap">
      <table className="devis-table">
        <thead>
          <tr style={{ backgroundColor: '#1e3a8a', color: 'white' }}>
            <th className="px-2 py-1.5 text-center" style={{ width: '8%' }}>N°</th>
            <th className="px-2 py-1.5 text-left" style={{ width: '47%' }}>Désignation</th>
            <th className="px-2 py-1.5 text-center" style={{ width: '12%' }}>Qté</th>
            <th className="px-2 py-1.5 text-right" style={{ width: '16%' }}>P.U.</th>
            <th className="px-2 py-1.5 text-right" style={{ width: '17%' }}>Montant</th>
          </tr>
        </thead>
        <tbody>
          {data.prestations.map((p, i) => (
            <tr key={i} className="border-b">
              <td className="px-2 py-1 text-center">{i + 1}</td>
              <td className="px-2 py-1">
                <span
                  className={`inline-block px-1 py-0.5 text-xs font-semibold rounded ${
                    p.type === 'Impôt' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                  }`}
                >
                  {p.type}
                </span>
                <span className="ml-1">{p.designation}</span>
              </td>
              <td className="px-2 py-1 text-center">{p.qty}</td>
              <td className="px-2 py-1 text-right">{fr(p.price)}</td>
              <td className="px-2 py-1 text-right font-semibold text-blue-900">{fr(p.total)}</td>
            </tr>
          ))}
          <tr className="devis-total-row total-row" style={{ backgroundColor: '#1e3a8a', color: 'white', fontWeight: 'bold' }}>
            <td colSpan={4} className="px-2 py-1.5 text-right">TOTAL</td>
            <td className="px-2 py-1.5 text-right text-base">{fCFA(data.total)}</td>
          </tr>
        </tbody>
      </table>
      </div>

      {/* Sous-totaux */}
      <div className="devis-totals">
        <div className="devis-impots-card">
          <p className="text-xs text-blue-900 font-semibold">Total Impôts</p>
          <p className="text-lg font-bold text-blue-900">{fCFA(data.totalImpots)}</p>
        </div>
        <div className="devis-honoraires-card">
          <p className="text-xs text-green-900 font-semibold">Total Honoraires</p>
          <p className="text-lg font-bold text-green-900">{fCFA(data.totalHonoraires)}</p>
        </div>
      </div>

      {/* Conditions du devis */}
      <div className="devis-conditions">
        <h3 className="font-bold text-yellow-900 text-sm mb-1">Conditions du devis</h3>
        <div className="text-xs text-yellow-900">
          <p><strong>Validité :</strong> Ce devis est valable 30 jours à compter de sa date d'émission</p>
          <p><strong>Moyen de paiement :</strong> {config.numerosPaiement}</p>
          <p className="mt-1 italic" style={{ fontSize: '0.65rem' }}>
            Ce devis ne constitue pas une facture et n'engage le client qu'après acceptation formelle.
          </p>
        </div>
      </div>

      {/* Bon pour accord + signature */}
      <div className="devis-signatures">
        <div className="text-center">
          <p className="text-xs font-semibold text-gray-700">Bon pour accord</p>
          <p className="text-xs text-gray-500">Date et signature du client</p>
          <div style={{ height: '40px', width: '150px', border: '1px dashed #9ca3af', marginTop: '0.25rem', borderRadius: '4px' }} />
        </div>
        <div className="devis-signature-cabinet">
          {config.cachet && <img src={config.cachet} alt="Cachet" style={{ maxHeight: '60px' }} />}
          <div className="text-center">
            <p className="font-bold text-blue-900 text-sm">Pour {config.nomCabinet}</p>
            {config.signature && (
              <img src={config.signature} alt="Signature" style={{ maxHeight: '40px', margin: '0.25rem auto' }} />
            )}
            <div style={{ borderTop: '1px solid #9ca3af', paddingTop: '0.25rem', marginTop: '0.25rem' }}>
              <p className="font-bold text-sm">{config.signataireNom}</p>
              <p className="text-xs text-gray-600">{config.signataireTitre}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Pied de page */}
      <div className="devis-footer">
        <p style={{ fontSize: '0.7rem', color: '#6b7280', margin: 0 }}>
          <span style={{ fontWeight: 600, color: '#1e3a8a' }}>PRISMA Manager</span> — PRISMA GESTION : L'expertise
          qui sécurise votre gestion.
        </p>
      </div>
      </div>
    </div>
  );
});

PrintableDevis.displayName = 'PrintableDevis';
export default PrintableDevis;
