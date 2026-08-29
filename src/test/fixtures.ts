import type { Product, ProductVariant, Zone } from "../data";

/** Fabrique une déclinaison de test - surcharge ce dont le test a besoin. */
export function makeVariant(overrides: Partial<ProductVariant> = {}): ProductVariant {
  return {
    id: "var-noir",
    sku: "HUW-TOTE-NOIR",
    color: "Noir",
    colorSlug: "noir",
    hex: "#1a1a1a",
    images: [{ url: "/noir-1.jpg", alt: "Tote noir" }],
    stock: { qty: 10, threshold: 3 },
    available: true,
    ...overrides,
  };
}

export function makeProduct(overrides: Partial<Product> = {}): Product {
  const variants = overrides.variants ?? [makeVariant()];
  return {
    id: "tote-bag-coton",
    slug: "tote-bag-coton",
    name: "Tote bag en coton",
    collection: "HUWSTORE",
    category: "Toile & Coton",
    categorySlug: "toile-coton",
    material: "Toile de coton",
    description: "Un sac de tous les jours.",
    care: "Lavage à froid.",
    price: 6000,
    color: variants[0].color,
    colors: variants.map((v) => v.color),
    image: variants[0].images[0]?.url ?? "",
    imageAlt: variants[0].images[0]?.alt ?? "",
    imageHover: variants[0].images[0]?.url ?? "",
    specs: { features: [] },
    variants,
    images: [],
    ...overrides,
  };
}

export function makeZone(overrides: Partial<Zone> = {}): Zone {
  return {
    id: "zone-dakar",
    city: "Dakar",
    country: "Sénégal",
    fee: 2000,
    freeFrom: 30000,
    delay: "24 h",
    relay: false,
    ...overrides,
  };
}
