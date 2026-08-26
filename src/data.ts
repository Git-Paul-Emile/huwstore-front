export type Product = {
  id: string;
  name: string;
  collection: string;
  category: string;
  material: string;
  color: string;
  price: number;
  compareAt?: number;
  badge?: "Nouveau" | "Promo" | "Rupture";
  rating: number;
  reviews: number;
  image: string;
  imageAlt: string;
  imageHover: string;
  active?: boolean;
  stock?: { qty: number; threshold: number } | null;
};

export type Category = { id: string; name: string; image: string; _count?: { products: number } };

export type Zone = { id: string; city: string; country: string; fee: number; freeFrom: number; delay: string; relay: boolean };

// Prix en francs CFA (FCFA).
export const fcfa = (n: number) => `${n.toLocaleString("fr-FR")} FCFA`;

export const SHOP_PHONE_DISPLAY = "709666259";
export const SHOP_PHONE_WA = "221709666259"; // format international WhatsApp (Sénégal +221)

// Facettes de filtre boutique — valeurs fixes, non gérées depuis l'admin.
export const materials = ["Cuir pleine fleur", "Cuir grainé", "Toile enduite", "Cuir nappa", "Cuir vieilli"];
export const colorFilters = ["Noir", "Fauve", "Cognac", "Ivoire", "Grège", "Bordeaux", "Vert bouteille", "Gris orage"];
