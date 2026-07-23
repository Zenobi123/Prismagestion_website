// Coordonnées et présence sociale de PRISMA GESTION.
//
// Source unique de vérité pour les liens de contact/réseaux affichés sur le
// site (footer, contact, etc.). Pour activer un réseau, renseigner son URL
// ci-dessous : les composants n'affichent que les liens réellement définis.

export const CONTACT = {
  email: 'contact@prismagestion.com',
  phone: '+237656752475',
  whatsapp: '+237694310554',
  addressLine: 'Yaoundé, Cameroun',
} as const;

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
