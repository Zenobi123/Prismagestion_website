import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import TaxResultDisplay from '../TaxResultDisplay';

/**
 * Affichage du résultat des calculateurs publics.
 *
 * Le composant a deux modes et quatre blocs conditionnels : c'est là que se
 * cachent les affichages fantômes (« TDL : 0 F CFA » quand il n'y en a pas)
 * et les blocs muets. Chaque condition est donc testée dans les deux sens.
 */

const resultatClasse5 = {
  classe: 5,
  montant: 60_000,
  tdl: 6_000,
  total: 66_000,
  chiffreAffaires: 2_000_000,
  minRange: 2_000_000,
  maxRange: 2_499_999,
};

describe('mode « résultat IGS »', () => {
  it('affiche la classe, le principal, la TDL et le total', () => {
    render(<TaxResultDisplay result={resultatClasse5} />);
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('60 000 F CFA')).toBeInTheDocument();
    expect(screen.getByText('6 000 F CFA')).toBeInTheDocument();
    expect(screen.getByText('66 000 F CFA')).toBeInTheDocument();
    expect(screen.getByText(/total à payer/i)).toBeInTheDocument();
  });

  it('groupe les milliers par des espaces', () => {
    render(<TaxResultDisplay result={resultatClasse5} />);
    // 60000 affiché brut serait illisible sur un montant d'impôt.
    expect(screen.queryByText('60000 F CFA')).not.toBeInTheDocument();
  });

  it('rappelle le chiffre d’affaires saisi', () => {
    render(<TaxResultDisplay result={resultatClasse5} />);
    // Le montant apparaît aussi dans la fourchette : on vise l'intitulé complet.
    expect(screen.getByText(/Pour un chiffre d'affaires de 2 000 000 F CFA/)).toBeInTheDocument();
  });

  it('libelle la première tranche comme un plafond, pas comme une fourchette', () => {
    render(
      <TaxResultDisplay
        result={{ ...resultatClasse5, classe: 1, minRange: 0, maxRange: 499_999 }}
      />
    );
    expect(screen.getByText('Moins de 499 999 F CFA')).toBeInTheDocument();
  });

  it('libelle les tranches suivantes en fourchette', () => {
    render(<TaxResultDisplay result={resultatClasse5} />);
    expect(screen.getByText('De 2 000 000 F CFA à 2 499 999 F CFA')).toBeInTheDocument();
  });
});

describe('blocs conditionnels', () => {
  it('n’affiche pas la TDL quand elle n’est pas fournie', () => {
    const { tdl: _tdl, ...sansTdl } = resultatClasse5;
    render(<TaxResultDisplay result={sansTdl} />);
    // « TDL » figure aussi dans « Total à payer (IGS + TDL) » : on vise la
    // vignette dédiée, pas toute occurrence du sigle.
    expect(screen.queryByText('TDL (10% IGS)')).not.toBeInTheDocument();
    expect(screen.queryByText('6 000 F CFA')).not.toBeInTheDocument();
  });

  it('n’affiche pas le total quand il n’est pas fourni', () => {
    const { total: _total, ...sansTotal } = resultatClasse5;
    render(<TaxResultDisplay result={sansTotal} />);
    expect(screen.queryByText(/total à payer/i)).not.toBeInTheDocument();
  });

  it('affiche le message d’orientation hors barème', () => {
    render(
      <TaxResultDisplay
        result={{
          classe: 0,
          montant: 0,
          chiffreAffaires: 60_000_000,
          minRange: 0,
          maxRange: 0,
          message: "Vous n'êtes plus éligible au régime de l'IGS.",
        }}
      />
    );
    expect(screen.getByText(/plus éligible au régime de l'IGS/)).toBeInTheDocument();
    // Hors barème : ni TDL ni total ne doivent apparaître.
    expect(screen.queryByText(/total à payer/i)).not.toBeInTheDocument();
  });

  it('accompagne toujours le résultat de sa mise en garde', () => {
    render(<TaxResultDisplay result={resultatClasse5} />);
    expect(screen.getByText(/barèmes actuellement en vigueur au Cameroun/)).toBeInTheDocument();
  });
});

describe('mode « montant et détail »', () => {
  it('affiche le montant calculé et le bouton de détail', () => {
    render(<TaxResultDisplay amount={125_000} details="Détail du calcul" />);
    expect(screen.getByText(/125[  ]000 F CFA/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /voir le détail/i })).toBeInTheDocument();
  });

  it('affiche un montant nul plutôt que de disparaître', () => {
    // `amount === 0` est une valeur légitime : un test de vérité l'effacerait.
    render(<TaxResultDisplay amount={0} details="Aucun droit dû" />);
    expect(screen.getByText(/0 F CFA/)).toBeInTheDocument();
  });
});

describe('sans données', () => {
  it('ne rend rien du tout', () => {
    const { container } = render(<TaxResultDisplay />);
    expect(container).toBeEmptyDOMElement();
  });

  it('ne rend rien si le détail manque', () => {
    const { container } = render(<TaxResultDisplay amount={1_000} />);
    expect(container).toBeEmptyDOMElement();
  });
});
