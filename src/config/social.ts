// Coordonnées et présence sociale de PRISMA GESTION.
//
// Source unique de vérité pour les liens de contact/réseaux affichés sur le
// site (footer, contact, etc.). Pour activer un réseau, renseigner son URL
// ci-dessous : les composants n'affichent que les liens réellement définis.

/**
 * Les trois lignes du cabinet, **dans l'ordre d'appel voulu**. Cet ordre est
 * repris tel quel partout où les numéros s'affichent — site, chatbot, données
 * structurées, pied de page des documents. C'est la seule liste à modifier.
 *
 * Format compact, sans espace : ces valeurs alimentent directement les liens
 * `tel:` et `wa.me`, où un espace n'a rien à faire. Pour l'affichage, passer
 * par `formatPhone()` ci-dessous.
 */
export const PHONES = [
  '+237694310554',
  '+237676277662',
  '+237656752475',
] as const;

export const CONTACT = {
  email: 'prismagestionsarl@gmail.com',
  phones: PHONES,
  // Dérivés de PHONES pour les appelants qui n'attendent qu'un numéro.
  phone: PHONES[0],
  phoneSecondary: PHONES[1],
  phoneTertiary: PHONES[2],
  whatsapp: PHONES[0],
  addressLine: 'Yaoundé, Cameroun',
} as const;

/**
 * Met un numéro au format lisible « +237 694 310 554 ».
 *
 * La fonction repart des seuls chiffres, ce qui la rend indifférente au format
 * d'entrée : elle accepte aussi bien la constante compacte ci-dessus qu'une
 * valeur saisie depuis l'espace d'administration, où l'utilisateur écrit ce
 * qu'il veut.
 */
export const formatPhone = (raw: string): string => {
  const chiffres = raw.replace(/[^0-9]/g, '');
  const national = chiffres.startsWith('237') ? chiffres.slice(3) : chiffres;
  if (!national) return raw;
  return `+237 ${national.replace(/(\d{3})(?=\d)/g, '$1 ').trim()}`;
};

/** Lien WhatsApp « cliquer pour discuter » (format wa.me sans + ni espaces). */
export const whatsappLink = (message?: string): string => {
  const number = CONTACT.whatsapp.replace(/[^0-9]/g, '');
  const base = `https://wa.me/${number}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
};

// Réseaux sociaux. Laisser une chaîne vide pour masquer le lien.
// TODO PRISMA : renseigner les URLs Facebook / LinkedIn quand les pages
// officielles sont créées (axe 5 de la stratégie commerciale).
export const SOCIAL = {
  whatsapp: whatsappLink('Bonjour PRISMA GESTION, je souhaite un renseignement.'),
  facebook: '',
  linkedin: '',
  instagram: '',
} as const;

export type SocialKey = keyof typeof SOCIAL;
