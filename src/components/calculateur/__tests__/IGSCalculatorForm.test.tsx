import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import IGSCalculatorForm from '../igs/IGSCalculatorForm';

/**
 * Formulaire du calculateur d'IGS public (/outils/calculateur-impots).
 *
 * Les tests de `taxCalculations` couvrent le barème lui-même ; ceux-ci
 * couvrent le chaînage saisie → conversion → calcul → remontée au parent.
 * C'est là que se logent les régressions invisibles : un barème juste dont le
 * résultat n'arrive jamais à l'affichage.
 */

const onCalculate = vi.fn();
const onSubmit = vi.fn();

const poser = () => {
  render(<IGSCalculatorForm onCalculate={onCalculate} onSubmit={onSubmit} />);
  return {
    champ: screen.getByLabelText(/chiffre d'affaires annuel/i),
    bouton: screen.getByRole('button', { name: /calculer l'igs/i }),
  };
};

beforeEach(() => {
  onCalculate.mockClear();
  onSubmit.mockClear();
});

describe('état initial', () => {
  it('affiche un champ vide et un bouton désactivé', () => {
    const { champ, bouton } = poser();
    expect(champ).toHaveValue('');
    expect(bouton).toBeDisabled();
  });

  it('active le bouton dès qu’un montant est saisi', async () => {
    const { champ, bouton } = poser();
    await userEvent.type(champ, '2000000');
    expect(bouton).toBeEnabled();
  });
});

describe('calcul', () => {
  it('remonte le montant d’IGS de la tranche correspondante', async () => {
    const { champ, bouton } = poser();
    await userEvent.type(champ, '2000000');
    await userEvent.click(bouton);

    // 2 000 000 F CFA relève de la classe 5 : 60 000 F CFA.
    expect(onCalculate).toHaveBeenCalledWith(
      expect.objectContaining({ amount: 60_000 })
    );
    expect(onSubmit).toHaveBeenCalledWith({ chiffreAffaires: 2_000_000 });
  });

  it('détaille la classe et la fourchette retenues', async () => {
    const { champ, bouton } = poser();
    await userEvent.type(champ, '2000000');
    await userEvent.click(bouton);

    const { details } = onCalculate.mock.calls[0][0];
    expect(details).toContain('Classe: 5');
    expect(details).toMatch(/Montant IGS/);
  });

  it('accepte les séparateurs de milliers et la virgule décimale', async () => {
    // Le champ est libre : un utilisateur saisira « 2 000 000 » aussi souvent
    // que « 2000000 ». toNumber normalise les deux.
    const { champ, bouton } = poser();
    await userEvent.type(champ, '2 000 000');
    await userEvent.click(bouton);
    expect(onSubmit).toHaveBeenCalledWith({ chiffreAffaires: 2_000_000 });
  });

  it('traite une saisie non numérique comme un chiffre d’affaires nul', async () => {
    const { champ, bouton } = poser();
    await userEvent.type(champ, 'abc');
    await userEvent.click(bouton);
    // Repli sur 0, qui relève de la classe 1 — pas de NaN propagé à l'affichage.
    expect(onSubmit).toHaveBeenCalledWith({ chiffreAffaires: 0 });
    expect(onCalculate).toHaveBeenCalledWith(
      expect.objectContaining({ amount: 20_000 })
    );
  });

  it('remonte un montant nul au-delà du barème, sans planter', async () => {
    const { champ, bouton } = poser();
    await userEvent.type(champ, '60000000');
    await userEvent.click(bouton);
    expect(onCalculate).toHaveBeenCalledWith(
      expect.objectContaining({ amount: 0 })
    );
    expect(onCalculate.mock.calls[0][0].details).toContain('Classe: 0');
  });

  it('peut être recalculé après modification du montant', async () => {
    const { champ, bouton } = poser();
    await userEvent.type(champ, '2000000');
    await userEvent.click(bouton);
    await userEvent.clear(champ);
    await userEvent.type(champ, '10000000');
    await userEvent.click(bouton);

    expect(onCalculate).toHaveBeenCalledTimes(2);
    // 10 000 000 relève de la classe 8 : 500 000 F CFA.
    expect(onCalculate.mock.calls[1][0].amount).toBe(500_000);
  });
});
