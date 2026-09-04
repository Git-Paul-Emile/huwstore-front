/**
 * Types partagés du domaine boutique.
 *
 * Ils reflètent exactement le DTO renvoyé par l'API (back/src/services/*.service.ts).
 * Le front ne connaît donc jamais la forme des tables : si la base change sans
 * que le contrat change, rien à modifier ici.
 */

/** Une déclinaison couleur : c'est l'unité réellement vendue et stockée. */
export type ProductVariant = {
  id: string;
  sku: string;
  color: string;
  colorSlug: string;
  /** Pastille couleur (couleur principale). */
  hex: string;
  /** Deuxième teinte des modèles bi-matière - pastille en dégradé. */
  hexSecondary?: string;
  images: ProductImage[];
  stock: { qty: number; threshold: number };
  available: boolean;
};

export type ProductImage = { url: string; alt: string };

/** Caractéristiques physiques. Longueurs en millimètres, poids en grammes. */
export type ProductSpecs = {
  closure?: string;
  capacity?: string;
  widthTopMm?: number;
  widthBottomMm?: number;
  heightMm?: number;
  depthMm?: number;
  handleDropMm?: number;
  weightGrams?: number;
  features: string[];
};

export type Product = {
  id: string;
  slug: string;
  name: string;
  collection: string;
  category: string;
  categorySlug: string;
  material: string;
  description: string;
  care: string;
  price: number;
  compareAt?: number;
  badge?: "Nouveau" | "Promo" | "Rupture";
  videoUrl?: string;
  /** Ex. "Livré avec une pochette assortie" - absent si rien n'est inclus. */
  includedAccessory?: string;

  /** Champs de vitrine dérivés de la première déclinaison (cartes produit). */
  color: string;
  colors: string[];
  image: string;
  imageAlt: string;
  imageHover: string;

  specs: ProductSpecs;
  variants: ProductVariant[];
  images: ProductImage[];
  active?: boolean;
  /** Agrégat de toutes les déclinaisons. */
  stock?: { qty: number; threshold: number } | null;
};

export type Category = {
  id: string;
  name: string;
  slug: string;
  /** Visuel de repli saisi au back-office. Utilisé quand la catégorie n'a pas encore de produit. */
  image: string;
  /** Résumé affiché sous le nom sur la page d'accueil. Absent tant qu'il n'a pas été saisi. */
  description?: string | null;
  position?: number;
  _count?: { products: number };
  /** Jusqu'à 4 photos de produits de la catégorie, pour composer la vignette « Nos univers ». */
  preview?: ProductImage[];
};

export type Zone = { id: string; city: string; country: string; fee: number; freeFrom: number; delay: string; relay: boolean; active?: boolean };

/** Métadonnées de pagination renvoyées avec toute collection de l'API. */
export type PageMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
};

export type Paginated<T> = { items: T[]; meta: PageMeta };

/** Facettes de filtre calculées par l'API depuis le catalogue réel. */
export type ProductFacets = {
  materials: string[];
  colors: { name: string; slug: string; hex: string }[];
  /** Bornes réelles du catalogue : elles cadrent le curseur de prix. */
  priceMin: number;
  priceMax: number;
};

// Prix en francs CFA (FCFA).
export const fcfa = (n: number) => `${n.toLocaleString("fr-FR")} FCFA`;

/** Les dimensions sont stockées en millimètres ; on les affiche en centimètres. */
export const cm = (mm?: number) => (mm === undefined ? null : `${(mm / 10).toLocaleString("fr-FR")} cm`);

export const grams = (g?: number) => (g === undefined ? null : g >= 1000 ? `${(g / 1000).toLocaleString("fr-FR")} kg` : `${g} g`);

/** Libellés des dimensions, dans l'ordre où on les présente au client. */
export const dimensionLabels: { key: keyof ProductSpecs; label: string }[] = [
  { key: "widthTopMm", label: "Largeur en haut" },
  { key: "widthBottomMm", label: "Largeur en bas" },
  { key: "heightMm", label: "Hauteur" },
  { key: "depthMm", label: "Profondeur" },
  { key: "handleDropMm", label: "Hauteur des anses" },
];

/**
 * Le numéro de la boutique et ses réseaux sociaux ne sont PLUS écrits ici :
 * ils vivent en base et se modifient depuis Paramètres (voir `useSettings`).
 * Une constante dans le code obligeait à redéployer le site pour changer un
 * numéro de téléphone.
 */
