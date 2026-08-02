import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

/**
 * Formulaire de contact public.
 *
 * `validation.test.ts` couvre les règles ; ces tests couvrent le parcours :
 * les erreurs arrivent-elles sous le bon champ, disparaissent-elles à la
 * correction, et le message part-il réellement ? L'accès au réseau est
 * remplacé par un double — on teste le formulaire, pas Supabase.
 */

const saveContactMessage = vi.fn();
const triggerContactMessagesUpdated = vi.fn();
const toast = vi.fn();

vi.mock('@/utils/contact/supabase', () => ({
  saveContactMessage: (...a: unknown[]) => saveContactMessage(...a),
  setupStorageListener: () => () => undefined,
  getContactMessages: async () => [],
  markMessageAsRead: async () => undefined,
  deleteContactMessage: async () => undefined,
}));
vi.mock('@/utils/contact/events', () => ({
  triggerContactMessagesUpdated: (...a: unknown[]) => triggerContactMessagesUpdated(...a),
}));
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({ toast }),
  toast,
}));

const ContactForm = (await import('../ContactForm')).default;

const champs = () => ({
  prenom: screen.getByLabelText(/prénom/i),
  nom: screen.getByLabelText(/^nom/i),
  email: screen.getByLabelText(/email/i),
  whatsapp: screen.getByLabelText(/whatsapp/i),
  message: screen.getByLabelText(/message/i),
  envoyer: screen.getByRole('button', { name: /envoyer le message/i }),
});

const remplir = async () => {
  const c = champs();
  await userEvent.type(c.prenom, 'Nathan');
  await userEvent.type(c.nom, 'Obiang');
  await userEvent.type(c.email, 'nathan@example.cm');
  await userEvent.type(c.whatsapp, '+237612345678');
  await userEvent.type(c.message, 'Je souhaite un accompagnement fiscal.');
  return c;
};

beforeEach(() => {
  saveContactMessage.mockReset().mockResolvedValue({ id: '1' });
  triggerContactMessagesUpdated.mockClear();
  toast.mockClear();
});

describe('rendu', () => {
  it('affiche tous les champs requis et le bouton d’envoi', () => {
    render(<ContactForm />);
    const c = champs();
    Object.values(c).forEach((el) => expect(el).toBeInTheDocument());
    expect(c.envoyer).toBeEnabled();
  });

  it('accepte un titre et une description personnalisés', () => {
    render(<ContactForm formTitle="Demander un rappel" formDescription="Sous 24 h." />);
    expect(screen.getByText('Demander un rappel')).toBeInTheDocument();
    expect(screen.getByText('Sous 24 h.')).toBeInTheDocument();
  });
});

describe('validation à la soumission', () => {
  it('n’envoie rien et affiche les erreurs sous les champs', async () => {
    render(<ContactForm />);
    await userEvent.click(champs().envoyer);

    expect(saveContactMessage).not.toHaveBeenCalled();
    expect(await screen.findByText('Le prénom est requis')).toBeInTheDocument();
    expect(screen.getByText('Le nom est requis')).toBeInTheDocument();
    expect(screen.getByText("L'email est requis")).toBeInTheDocument();
    expect(screen.getByText('Le message est requis')).toBeInTheDocument();
  });

  it('signale une adresse e-mail sans domaine complet', async () => {
    // Le champ est `type="email"` : le navigateur refuse lui-même « nathan-at-example »
    // et la soumission n'a même pas lieu. La validation applicative n'entre en jeu
    // que sur ce que HTML5 laisse passer — « nathan@example » en est le cas type,
    // accepté par le navigateur mais refusé par la regex, qui exige un point.
    render(<ContactForm />);
    const c = await remplir();
    await userEvent.clear(c.email);
    await userEvent.type(c.email, 'nathan@example');
    await userEvent.click(c.envoyer);

    expect(await screen.findByText(/adresse email valide/i)).toBeInTheDocument();
    expect(saveContactMessage).not.toHaveBeenCalled();
  });

  it('laisse le navigateur bloquer une adresse sans arobase', async () => {
    render(<ContactForm />);
    const c = await remplir();
    await userEvent.clear(c.email);
    await userEvent.type(c.email, 'nathan-at-example');
    await userEvent.click(c.envoyer);

    // La contrainte native suffit : rien n'est envoyé, et l'application n'a pas
    // à afficher sa propre erreur puisque la soumission n'a pas eu lieu.
    expect(saveContactMessage).not.toHaveBeenCalled();
    expect(c.email).toBeInvalid();
  });

  it('efface l’erreur d’un champ dès qu’il est corrigé', async () => {
    render(<ContactForm />);
    await userEvent.click(champs().envoyer);
    expect(await screen.findByText('Le prénom est requis')).toBeInTheDocument();

    await userEvent.type(champs().prenom, 'N');
    await waitFor(() =>
      expect(screen.queryByText('Le prénom est requis')).not.toBeInTheDocument()
    );
    // Les autres erreurs restent : seule celle du champ corrigé disparaît.
    expect(screen.getByText('Le nom est requis')).toBeInTheDocument();
  });
});

describe('envoi', () => {
  it('transmet la saisie complète, sujet par défaut compris', async () => {
    render(<ContactForm />);
    const c = await remplir();
    await userEvent.click(c.envoyer);

    await waitFor(() => expect(saveContactMessage).toHaveBeenCalledTimes(1));
    expect(saveContactMessage).toHaveBeenCalledWith({
      firstName: 'Nathan',
      lastName: 'Obiang',
      email: 'nathan@example.cm',
      whatsapp: '+237612345678',
      subject: 'comptabilite',
      message: 'Je souhaite un accompagnement fiscal.',
    });
  });

  it('confirme l’envoi, vide le formulaire et verrouille le bouton', async () => {
    render(<ContactForm />);
    const c = await remplir();
    await userEvent.click(c.envoyer);

    expect(await screen.findByText(/message a été envoyé avec succès/i)).toBeInTheDocument();
    // Le bouton change de libellé après succès : on garde la référence d'origine
    // plutôt que de le rechercher par son nom.
    await waitFor(() => expect(c.prenom).toHaveValue(''));
    expect(c.message).toHaveValue('');
    expect(c.envoyer).toBeDisabled();
    expect(c.envoyer).toHaveTextContent(/envoi réussi/i);
  });

  it('notifie l’espace admin du nouveau message', async () => {
    render(<ContactForm />);
    await userEvent.click((await remplir()).envoyer);
    await waitFor(() => expect(triggerContactMessagesUpdated).toHaveBeenCalled());
  });

  it('en cas d’échec réseau, ne prétend pas que le message est parti', async () => {
    saveContactMessage.mockRejectedValue(new Error('réseau indisponible'));
    render(<ContactForm />);
    const c = await remplir();
    await userEvent.click(c.envoyer);

    await waitFor(() =>
      expect(toast).toHaveBeenCalledWith(expect.objectContaining({ variant: 'destructive' }))
    );
    expect(screen.queryByText(/envoyé avec succès/i)).not.toBeInTheDocument();
    // La saisie est conservée : la reperdre obligerait à tout retaper.
    expect(champs().message).toHaveValue('Je souhaite un accompagnement fiscal.');
  });
});
