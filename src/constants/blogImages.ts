
// Source unique des visuels d'articles de blog.
//
// Chaque article porte normalement son image en base (colonne `image` de
// `blog_posts`). Cette table sert de filet lorsque la valeur est absente ou
// vide : elle est consultée à l'identique par la liste, la page d'article et
// la section blog de l'accueil, afin qu'un même titre n'affiche jamais deux
// visuels différents selon la page.

export const DEFAULT_BLOG_IMAGE = "/placeholder.svg";

type BlogImageRule = {
  matches: (title: string, lowerTitle: string) => boolean;
  image: string;
};

// L'ordre compte : la première règle qui correspond l'emporte.
const BLOG_IMAGE_RULES: readonly BlogImageRule[] = [
  {
    matches: (_t, lower) => lower.includes("veille") && lower.includes("impot"),
    image: "/blog-images/veille-impots.jpg",
  },
  {
    matches: (_t, lower) => lower.includes("veille") && lower.includes("cnps"),
    image: "/blog-images/veille-cnps.jpg",
  },
  {
    matches: (_t, lower) => lower.includes("veille") && lower.includes("legecam"),
    image: "/blog-images/veille-legecam.jpg",
  },
  {
    matches: (_t, lower) => lower.includes("veille") && lower.includes("dgicam"),
    image: "/blog-images/veille-dgicam.jpg",
  },
  {
    matches: (title) => title.includes("Impôt Général Synthétique") || title.includes("IGS"),
    image: "/blog-images/impot-general-synthetique.jpg",
  },
  {
    matches: (title) => title.includes("Les nouvelles normes fiscales"),
    image: "/blog-images/normes-fiscales-2025.jpg",
  },
  {
    matches: (title) => title.includes("Les avantages de la comptabilité"),
    image: "/blog-images/comptabilite-en-ligne.jpg",
  },
  {
    matches: (_t, lower) => lower.includes("environnement fiscal"),
    image: "/blog-images/environnement-fiscal-cameroun.jpg",
  },
  {
    matches: (_t, lower) => lower.includes("réforme fiscale"),
    image: "/blog-images/reforme-fiscale-2026.jpg",
  },
  {
    matches: (_t, lower) => lower.includes("panorama des impôts"),
    image: "/blog-images/panorama-impots-cameroun.jpg",
  },
];

/**
 * Retourne le visuel de repli associé à un titre d'article,
 * ou le placeholder générique si aucune règle ne correspond.
 */
export const getBlogImageForTitle = (title: string): string => {
  if (!title) return DEFAULT_BLOG_IMAGE;
  const lower = title.toLowerCase();
  return BLOG_IMAGE_RULES.find(rule => rule.matches(title, lower))?.image ?? DEFAULT_BLOG_IMAGE;
};
