import { describe, it, expect } from 'vitest';
import { cheminInterneOuDefaut } from '../redirection';

describe('cheminInterneOuDefaut', () => {
  it('conserve un chemin interne', () => {
    expect(cheminInterneOuDefaut('/admin/gestion/clients')).toBe('/admin/gestion/clients');
    expect(cheminInterneOuDefaut('/blog')).toBe('/blog');
  });

  it('retombe sur le défaut quand rien n\'est mémorisé', () => {
    expect(cheminInterneOuDefaut(undefined)).toBe('/admin');
    expect(cheminInterneOuDefaut('')).toBe('/admin');
  });

  it('refuse une URL absolue', () => {
    expect(cheminInterneOuDefaut('https://exemple.test/piege')).toBe('/admin');
    expect(cheminInterneOuDefaut('exemple.test')).toBe('/admin');
  });

  it('refuse les formes réinterprétées en URL absolue par le navigateur', () => {
    // GHSA-wrjc-x8rr-h8h6 : ces deux écritures sortent du site.
    expect(cheminInterneOuDefaut('//exemple.test')).toBe('/admin');
    expect(cheminInterneOuDefaut('/\\exemple.test')).toBe('/admin');
  });
});
