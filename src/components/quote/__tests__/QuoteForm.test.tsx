import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QuoteForm } from '../QuoteForm';
import { SuccessMessage } from '../SuccessMessage';

/**
 * Formulaire de demande de devis.
 *
 * Contrairement au formulaire de contact, celui-ci est entièrement contrôlé :
 * il ne détient aucun état et se contente d'afficher ce qu'on lui passe et de
 * remonter les événements. Les tests portent donc sur ce contrat — affichage
 * des erreurs, remontée des saisies, verrouillage pendant l'envoi — et sur le
 * seul comportement propre au composant : masquer le choix du service quand
 * il est déjà imposé.
 */

const onInputChange = vi.fn();
const onServiceChange = vi.fn();
const onSubmit = vi.fn((e: React.FormEvent) => e.preventDefault());
const onCancel = vi.fn();

const formData = {
  fullName: 'Nathan Obiang',
  email: 'nathan@example.cm',
  phone: '694123456',
  service: 'comptabilite',
  details: 'Tenue de comptabilité annuelle.',
};

const sansErreur = { fullName: '', email: '', phone: '', details: '' };

const poser = (surcharge: Partial<Parameters<typeof QuoteForm>[0]> = {}) =>
  render(
    <QuoteForm
      formData={formData}
      errors={sansErreur}
      loading={false}
      onInputChange={onInputChange}
      onServiceChange={onServiceChange}
      onSubmit={onSubmit}
      onCancel={onCancel}
      {...surcharge}
    />
  );

beforeEach(() => {
  onInputChange.mockClear();
  onServiceChange.mockClear();
  onSubmit.mockClear();
  onCancel.mockClear();
});

describe('rendu', () => {
  it('affiche les champs pré-remplis à partir des props', () => {
    poser();
    expect(screen.getByLabelText(/nom complet/i)).toHaveValue('Nathan Obiang');
    expect(screen.getByLabelText(/email/i)).toHaveValue('nathan@example.cm');
    expect(screen.getByLabelText(/numéro de téléphone/i)).toHaveValue('694123456');
    expect(screen.getByLabelText(/détails du projet/i)).toHaveValue(
      'Tenue de comptabilité annuelle.'
    );
  });

  it('propose le choix du service quand aucun n’est imposé', () => {
    poser();
    expect(screen.getByText(/service souhaité/i)).toBeInTheDocument();
  });

  it('masque le choix du service lorsqu’il est déjà déterminé', () => {
    // Le devis est demandé depuis une offre précise : rouvrir le choix
    // laisserait le visiteur contredire ce sur quoi il vient de cliquer.
    poser({ serviceTitle: 'Comptabilité' });
    expect(screen.queryByText(/service souhaité/i)).not.toBeInTheDocument();
  });
});

describe('erreurs', () => {
  it('affiche chaque message sous son champ', () => {
    poser({
      errors: {
        fullName: 'Le nom est requis',
        email: 'Email invalide',
        phone: 'Téléphone invalide',
        details: 'Précisez votre besoin',
      },
    });
    expect(screen.getByText('Le nom est requis')).toBeInTheDocument();
    expect(screen.getByText('Email invalide')).toBeInTheDocument();
    expect(screen.getByText('Téléphone invalide')).toBeInTheDocument();
    expect(screen.getByText('Précisez votre besoin')).toBeInTheDocument();
  });

  it('n’affiche aucun message quand il n’y a pas d’erreur', () => {
    // Les messages sont des <p> ; les astérisques des champs obligatoires sont
    // des <span> de la même couleur. On ne compte que les premiers.
    const { container } = poser();
    expect(container.querySelectorAll('p.text-red-500')).toHaveLength(0);
  });

  it('n’affiche que les erreurs réellement transmises', () => {
    const { container } = poser({ errors: { ...sansErreur, email: 'Email invalide' } });
    expect(container.querySelectorAll('p.text-red-500')).toHaveLength(1);
    expect(screen.getByText('Email invalide')).toBeInTheDocument();
  });
});

describe('interactions', () => {
  it('remonte chaque frappe au parent', async () => {
    poser();
    await userEvent.type(screen.getByLabelText(/nom complet/i), 'X');
    expect(onInputChange).toHaveBeenCalled();
  });

  it('soumet le formulaire', async () => {
    poser();
    await userEvent.click(screen.getByRole('button', { name: /envoyer la demande/i }));
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  it('annule sans soumettre', async () => {
    poser();
    await userEvent.click(screen.getByRole('button', { name: /annuler/i }));
    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(onSubmit).not.toHaveBeenCalled();
  });
});

describe('pendant l’envoi', () => {
  it('verrouille les deux boutons et annonce l’envoi en cours', () => {
    poser({ loading: true });
    // Un double envoi créerait deux demandes de devis identiques.
    expect(screen.getByRole('button', { name: /envoi en cours/i })).toBeDisabled();
    expect(screen.getByRole('button', { name: /annuler/i })).toBeDisabled();
  });
});

describe('SuccessMessage', () => {
  it('confirme la réception et propose de fermer', async () => {
    const onClose = vi.fn();
    render(<SuccessMessage onClose={onClose} />);

    expect(screen.getByText(/demande envoyée/i)).toBeInTheDocument();
    expect(screen.getByText(/nous reviendrons vers vous/i)).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: /fermer/i }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
