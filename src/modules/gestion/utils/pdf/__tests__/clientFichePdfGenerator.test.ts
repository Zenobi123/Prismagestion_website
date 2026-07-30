import { describe, it, expect, vi } from 'vitest';
import type { Client } from '@gestion/types/client';

// Capture tout le texte écrit dans le PDF (titres + cellules autoTable)
const { written } = vi.hoisted(() => ({ written: [] as string[] }));

vi.mock('jspdf', async (importOriginal) => {
  const mod = await importOriginal<Record<string, unknown>>();
  const Orig = mod.default as new (...a: unknown[]) => Record<string, unknown>;
  function Wrapped(...args: unknown[]) {
    const doc = new Orig(...args);
    const origText = (doc.text as (...a: unknown[]) => unknown).bind(doc);
    doc.text = (...a: unknown[]) => {
      const t = a[0];
      (Array.isArray(t) ? t : [t]).forEach(s => typeof s === 'string' && written.push(s));
      return origText(...a);
    };
    doc.save = () => doc;
    return doc;
  }
  Wrapped.API = (Orig as unknown as { API: unknown }).API;
  return { ...mod, default: Wrapped, jsPDF: Wrapped };
});

const { generateClientFichePDF } = await import('../clientFichePdfGenerator');

const client: Client = {
  id: '1', type: 'morale', raisonsociale: 'ACME SARL',
  regimefiscal: 'igs', niu: 'P123', centrerattachement: 'CIME',
  adresse: { ville: 'Douala', quartier: 'Akwa', lieuDit: 'X' },
  contact: { telephone: '699', email: 'a@b.com' },
  secteuractivite: 'Commerce', interactions: [], statut: 'actif',
  gestionexternalisee: false,
  chiffreaffaires: 30000000,
  situationimmobiliere: { type: 'proprietaire', valeur: 10000000 },
};

describe('fiche client — situation fiscale calculée', () => {
  it('rend les montants avec espaces simples (ex. 10 000 / 10 000 000)', () => {
    written.length = 0;
    generateClientFichePDF(client);
    const all = written.join('\n');
    expect(all).toContain('SITUATION FISCALE CALCULÉE');
    expect(all).toContain('10 000 000 F CFA');   // valeur du bien
    expect(all).toContain('10 000 F CFA');        // TPF (0,1 % de 10 M)
    expect(all).toMatch(/IGS \(classe \d+\)/);
    const montants = written.filter(s => s.includes('F CFA'));
    expect(montants.length).toBeGreaterThan(0);
    for (const m of montants) {
      expect(m).not.toMatch(/\d\/\d/);                                  // pas de « / »
      expect([...m].every(c => c.codePointAt(0)! < 128)).toBe(true);    // ASCII pur
    }
  });

  it('rend le tableau des agences avec impôts par bien', () => {
    written.length = 0;
    generateClientFichePDF({
      ...client,
      agences: [
        { libelle: 'Siège', ville: 'Douala', quartier: 'Akwa', principale: true, chiffreAffaires: 20000000, statutImmo: 'locataire', loyerMensuel: 500000, valeurBien: 0 },
        { libelle: 'Annexe', ville: 'Yaoundé', quartier: 'Bastos', principale: false, chiffreAffaires: 10000000, statutImmo: 'proprietaire', loyerMensuel: 0, valeurBien: 10000000 },
      ],
    });
    const all = written.join('\n');
    expect(all).toContain('AGENCES / ÉTABLISSEMENTS');
    expect(all).toContain('TPF_Yaoundé/Bastos: 10 000 F CFA');
    expect(all).toContain("Chiffre d'affaires cumulé");
  });
});
