// SPEC_LOVABLE.md §3 — Configuration cabinet
//
// La source de verite est la table Supabase `cabinet_config` (ligne unique).
// Le localStorage n'est plus qu'un cache : il rend `loadCabinetConfig()`
// synchrone, ce dont dependent les cinq boutons d'impression et le
// DocumentPreviewProvider — sans lui, un document pourrait etre capture par
// html2canvas avant l'arrivee des donnees et sortir avec un en-tete par defaut.
//
// Avant cette bascule, l'identite du cabinet vivait uniquement dans le
// localStorage : cloisonnee par navigateur et par domaine, elle devait etre
// ressaisie sur chaque appareil et laissait deux postes imprimer deux pieds de
// page differents pour la meme facture.
import { useEffect, useState } from 'react';
import { lireCabinetConfig, ecrireCabinetConfig } from '@gestion/services/cabinetConfigService';

export interface CabinetConfig {
  nomCabinet: string;
  slogan: string;
  siege: string;
  telephone: string;
  niu: string;
  signataireNom: string;
  signataireTitre: string;
  signature?: string; // data URL base64
  cachet?: string;    // data URL base64
  signaturePromo: string;
  // Coordonnées de paiement (SPEC §3.2)
  modePaiement: string;
  numerosPaiement: string;
  echeanceFacture: string;
}

export const DEFAULT_CABINET_CONFIG: CabinetConfig = {
  nomCabinet: 'PRISMA GESTION',
  slogan: 'Comptabilité - Finance - Fiscalité',
  siege: 'Yaoundé - Etoa - Méki',
  telephone: '(237) 694 310 554 / 676 277 662 / 656 752 475',
  niu: 'M052116042979Z',
  signataireNom: 'OBIANG TIME Nathan',
  signataireTitre: 'Directeur Associé',
  signature: undefined,
  cachet: undefined,
  signaturePromo: "PRISMA Manager — PRISMA GESTION : L'expertise qui sécurise votre gestion.",
  modePaiement: 'Mobile Money / Espèces',
  numerosPaiement: '694 31 05 54 / 676 27 76 62 / 656 75 24 75 — OBIANG TIME Nathan',
  echeanceFacture: "30 jours à compter de la date d'émission",
};

const STORAGE_KEY = 'cabinetConfig';
const STORAGE_EVENT = 'cabinet-config-updated';
// Marque la reprise unique de l'ancienne configuration locale vers la base.
const REPRISE_KEY = 'cabinetConfig:repris-en-base';

/**
 * Lecture synchrone, depuis le cache. Ne joint jamais le reseau : c'est ce qui
 * permet aux composants imprimables de rendre un document complet des la
 * premiere image. La synchronisation avec la base se fait a cote, par
 * `synchroniserCabinetConfig()`.
 */
export function loadCabinetConfig(): CabinetConfig {
  if (typeof window === 'undefined') return DEFAULT_CABINET_CONFIG;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_CABINET_CONFIG;
    const parsed = JSON.parse(raw) as Partial<CabinetConfig>;
    return { ...DEFAULT_CABINET_CONFIG, ...parsed };
  } catch {
    return DEFAULT_CABINET_CONFIG;
  }
}

/** Met a jour le cache et previent les composants montes. */
function ecrireCache(cfg: CabinetConfig): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(cfg));
  window.dispatchEvent(new CustomEvent(STORAGE_EVENT, { detail: cfg }));
}

/**
 * Enregistre la configuration.
 *
 * La base est ecrite **avant** le cache, a dessein : si l'ecriture echoue, rien
 * n'est retenu localement et l'appelant voit l'erreur. L'ordre inverse
 * recreerait exactement la divergence entre postes que cette table supprime.
 */
export async function saveCabinetConfig(cfg: CabinetConfig): Promise<void> {
  await ecrireCabinetConfig(cfg);
  ecrireCache(cfg);
}

// Une seule synchronisation par chargement de page, quel que soit le nombre de
// composants qui appellent le hook — ils sont dix.
let synchronisation: Promise<void> | null = null;

/**
 * Aligne le cache sur la base, et reprend au passage une eventuelle
 * configuration locale anterieure.
 *
 * La reprise n'a lieu qu'une fois, et seulement si ce navigateur portait deja
 * une configuration : elle evite de perdre une signature et un cachet
 * televerses avant la bascule. Elle recopie la configuration locale telle
 * quelle — coordonnees comprises, meme si elles sont perimees. Les corriger
 * ensuite depuis l'ecran de parametres vaut alors pour tous les appareils,
 * ce qui est precisement l'objet de cette table.
 */
export async function synchroniserCabinetConfig(): Promise<void> {
  if (typeof window === 'undefined') return;
  if (synchronisation) return synchronisation;

  synchronisation = (async () => {
    const local = window.localStorage.getItem(STORAGE_KEY);
    const dejaRepris = window.localStorage.getItem(REPRISE_KEY) === '1';

    if (local && !dejaRepris) {
      try {
        await ecrireCabinetConfig(loadCabinetConfig());
        window.localStorage.setItem(REPRISE_KEY, '1');
      } catch (e) {
        // Hors ligne ou droits insuffisants : on retentera au prochain
        // chargement plutot que d'abandonner la configuration locale.
        console.warn('Reprise de la configuration cabinet differee :', e);
      }
    }

    const distante = await lireCabinetConfig();
    if (distante) ecrireCache(distante);
  })();

  try {
    await synchronisation;
  } finally {
    synchronisation = null;
  }
}

export function useCabinetConfig(): [CabinetConfig, (cfg: CabinetConfig) => Promise<void>] {
  const [cfg, setCfg] = useState<CabinetConfig>(() => loadCabinetConfig());

  useEffect(() => {
    const onUpdate = () => setCfg(loadCabinetConfig());
    window.addEventListener(STORAGE_EVENT, onUpdate);
    window.addEventListener('storage', (e) => {
      if (e.key === STORAGE_KEY) onUpdate();
    });
    // Le rendu part du cache ; la base le corrige ensuite si besoin.
    void synchroniserCabinetConfig();
    return () => {
      window.removeEventListener(STORAGE_EVENT, onUpdate);
    };
  }, []);

  const update = async (next: CabinetConfig) => {
    await saveCabinetConfig(next);
    setCfg(next);
  };

  return [cfg, update];
}

// Convertit un fichier image en data URL base64
export function fileToDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}
