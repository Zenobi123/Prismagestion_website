import { describe, it, expect } from 'vitest';
import { validateContactForm, CONTACT_FIELD_LIMITS } from '../validation';
import type { ContactFormData } from '../types';

/**
 * Validation du formulaire de contact public.
 *
 * Cette validation est la première des trois barrières : elle est doublée par
 * la fonction edge puis par les contraintes CHECK de la base (migration
 * `website_harden_input_constraints`). Si les bornes divergent, le visiteur
 * voit un formulaire accepté puis une erreur serveur incompréhensible — d'où
 * les tests d'alignement ci-dessous.
 */

const valide: ContactFormData = {
  firstName: 'Nathan',
  lastName: 'Obiang',
  email: 'nathan@example.cm',
  whatsapp: '+237612345678',
  subject: 'comptabilite',
  message: 'Bonjour, je souhaite un accompagnement fiscal.',
};

describe('formulaire complet', () => {
  it('accepte une saisie correcte sans remonter d’erreur', () => {
    const r = validateContactForm(valide);
    expect(r.isValid).toBe(true);
    expect(r.errors).toBeUndefined();
    expect(r.errorMessage).toBeUndefined();
  });

  it('remonte toutes les erreurs d’un coup, pas la première seulement', () => {
    // Un formulaire vide doit signaler ses cinq champs requis en une passe :
    // les corriger un par un, à chaque soumission, serait pénible.
    const r = validateContactForm({
      firstName: '',
      lastName: '',
      email: '',
      whatsapp: '',
      subject: '',
      message: '',
    });
    expect(r.isValid).toBe(false);
    expect(Object.keys(r.errors!)).toEqual(
      expect.arrayContaining(['firstName', 'lastName', 'email', 'whatsapp', 'message'])
    );
    expect(r.errorMessage).toContain('champs obligatoires');
  });
});

describe('champs requis', () => {
  it.each(['firstName', 'lastName', 'email', 'whatsapp', 'message'] as const)(
    '%s manquant invalide le formulaire',
    (champ) => {
      const r = validateContactForm({ ...valide, [champ]: '' });
      expect(r.isValid).toBe(false);
      expect(r.errors?.[champ]).toBeTruthy();
    }
  );

  it('n’exige pas le sujet, qui provient d’une liste déroulante', () => {
    expect(validateContactForm({ ...valide, subject: '' }).isValid).toBe(true);
  });
});

describe('adresse e-mail', () => {
  it.each([
    'nathan@example.cm',
    'n.obiang+devis@sous.domaine.cm',
    'a@b.co',
  ])('accepte %s', (email) => {
    expect(validateContactForm({ ...valide, email }).isValid).toBe(true);
  });

  it.each([
    'nathan',
    'nathan@',
    '@example.cm',
    'nathan@example',
    'nathan @example.cm',
    'nathan@exa mple.cm',
  ])('refuse %s', (email) => {
    const r = validateContactForm({ ...valide, email });
    expect(r.isValid).toBe(false);
    expect(r.errors?.email).toBeTruthy();
  });
});

describe('numéro WhatsApp', () => {
  it.each([
    ['+237612345678', 'indicatif international'],
    ['612345678', 'neuf chiffres, sans indicatif'],
    ['+237 6 12 34 56 78', 'espaces de lisibilité'],
    ['(237) 612-345-678', 'parenthèses et tirets'],
  ])('accepte %s (%s)', (whatsapp) => {
    expect(validateContactForm({ ...valide, whatsapp }).isValid).toBe(true);
  });

  it.each([
    ['12345678', 'huit chiffres, sous le minimum'],
    ['+2376123456789012', 'seize chiffres, au-delà du maximum'],
    ['six-un-deux', 'lettres'],
    ['+', 'indicatif seul'],
  ])('refuse %s (%s)', (whatsapp) => {
    const r = validateContactForm({ ...valide, whatsapp });
    expect(r.isValid).toBe(false);
    expect(r.errors?.whatsapp).toBeTruthy();
  });
});

describe('bornes alignées sur les contraintes de la base', () => {
  it.each([
    ['firstName', CONTACT_FIELD_LIMITS.firstName],
    ['lastName', CONTACT_FIELD_LIMITS.lastName],
    ['message', CONTACT_FIELD_LIMITS.message],
  ] as const)('%s : accepte la longueur maximale, refuse un caractère de plus', (champ, max) => {
    expect(validateContactForm({ ...valide, [champ]: 'a'.repeat(max) }).isValid).toBe(true);

    const trop = validateContactForm({ ...valide, [champ]: 'a'.repeat(max + 1) });
    expect(trop.isValid).toBe(false);
    expect(trop.errors?.[champ]).toBeTruthy();
  });

  it('refuse une adresse e-mail trop longue tout en restant syntaxiquement valide', () => {
    const local = 'a'.repeat(CONTACT_FIELD_LIMITS.email);
    const r = validateContactForm({ ...valide, email: `${local}@example.cm` });
    expect(r.isValid).toBe(false);
    expect(r.errors?.email).toContain('trop longue');
  });

  it('conserve les bornes attendues par la base', () => {
    // Ces valeurs ne sont pas arbitraires : les changer ici sans migration
    // correspondante fait diverger le front des contraintes CHECK.
    expect(CONTACT_FIELD_LIMITS).toEqual({
      firstName: 200,
      lastName: 200,
      email: 320,
      whatsapp: 50,
      subject: 200,
      message: 5000,
    });
  });
});
