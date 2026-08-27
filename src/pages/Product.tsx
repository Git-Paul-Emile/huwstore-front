import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useProduct, useProducts } from "../hooks/useProducts";
import { useCartStore } from "../store/useCartStore";
import { cm, dimensionLabels, fcfa, grams, type ProductVariant } from "../data";
import { Stars, ProductCard } from "../components/Shared";
import { Heart, Bag, Truck, Rotate, Plus, Minus, ChevronDown } from "../components/icons";

function Accordion({ title, children, open: initial = false }: { title: string; children: React.ReactNode; open?: boolean }) {
  const [open, setOpen] = useState(initial);
  return (
    <div className="border-b border-taupe/25">
      <button onClick={() => setOpen((o) => !o)} className="flex w-full items-center justify-between py-4">
        <span className="label-lux text-ink">{title}</span>
        <ChevronDown className={`text-taupe transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      <div className={`grid transition-all duration-300 ${open ? "grid-rows-[1fr] pb-5" : "grid-rows-[0fr]"}`}>
        <div className="overflow-hidden text-sm leading-relaxed text-anthracite">{children}</div>
      </div>
    </div>
  );
}

/** Pastille de couleur — dégradé à deux teintes pour les modèles bi-matière. */
function Swatch({ variant, selected, onSelect }: { variant: ProductVariant; selected: boolean; onSelect: () => void }) {
  return (
    <button
      onClick={onSelect}
      title={variant.available ? variant.color : `${variant.color} — épuisé`}
      aria-label={variant.color}
      aria-pressed={selected}
      className={`relative h-9 w-9 rounded-full border transition-all ${
        selected ? "border-gold ring-2 ring-gold ring-offset-2 ring-offset-cream" : "border-taupe/40 hover:border-taupe"
      } ${variant.available ? "" : "opacity-40"}`}
      style={{
        background: variant.hexSecondary ? `linear-gradient(135deg, ${variant.hex} 50%, ${variant.hexSecondary} 50%)` : variant.hex,
      }}
    >
      {!variant.available && <span className="absolute inset-0 grid place-items-center text-xs text-cream">✕</span>}
    </button>
  );
}

export default function Product() {
  const navigate = useNavigate();
  const { id = "" } = useParams<{ id: string }>();
  const { data: product, isLoading } = useProduct(id);
  const addToCart = useCartStore((s) => s.addToCart);
  const wishlist = useCartStore((s) => s.wishlist);
  const toggleWish = useCartStore((s) => s.toggleWish);

  const [variantSlug, setVariantSlug] = useState<string | null>(null);
  const [activeImage, setActiveImage] = useState(0);
  const [qty, setQty] = useState(1);

  // Suggestions : même catégorie, produit courant exclu.
  const { data: related = [] } = useProducts(product ? { category: product.categorySlug, limit: 5 } : {});

  const variant = useMemo(() => {
    if (!product?.variants.length) return null;
    return product.variants.find((v) => v.colorSlug === variantSlug) ?? product.variants.find((v) => v.available) ?? product.variants[0];
  }, [product, variantSlug]);

  // La galerie affiche les photos du coloris choisi, puis les visuels communs.
  const gallery = useMemo(() => {
    if (!product) return [];
    const variantUrls = new Set(product.variants.flatMap((v) => v.images.map((i) => i.url)));
    const shared = product.images.filter((image) => !variantUrls.has(image.url));
    return [...(variant?.images ?? []), ...shared];
  }, [product, variant]);

  if (isLoading) return <div className="mx-auto max-w-[1400px] px-5 py-20 text-center text-taupe">Chargement…</div>;
  if (!product) return null;

  const soldOut = !variant?.available;
  const wished = wishlist.includes(product.id);
  const maxQty = variant?.stock.qty ?? 0;
  const cover = gallery[activeImage] ?? gallery[0];

  const dimensions = dimensionLabels
    .map(({ key, label }) => ({ label, value: cm(product.specs[key] as number | undefined) }))
    .filter((row): row is { label: string; value: string } => row.value !== null);

  const selectVariant = (slug: string) => {
    setVariantSlug(slug);
    setActiveImage(0); // la galerie change de coloris : on repart de la première photo
    setQty(1);
  };

  return (
    <div className="mx-auto max-w-[1400px] px-5 py-8 md:px-10">
      <nav className="label-lux flex items-center gap-2 text-taupe">
        <button onClick={() => navigate("/")} className="hover:text-gold-deep">Accueil</button>
        <span>/</span>
        <button onClick={() => navigate(`/boutique/${encodeURIComponent(product.category)}`)} className="hover:text-gold-deep">
          {product.category}
        </button>
        <span>/</span>
        <span className="text-anthracite">{product.name}</span>
      </nav>

      <div className="mt-6 grid gap-10 lg:grid-cols-2">
        {/* Galerie */}
        <div className="flex flex-col-reverse gap-4 md:flex-row">
          <div className="flex gap-3 overflow-x-auto md:flex-col md:overflow-visible">
            {gallery.map((image, i) => (
              <button
                key={image.url}
                onClick={() => setActiveImage(i)}
                className={`h-20 w-16 shrink-0 overflow-hidden bg-cream-tint transition-all md:h-24 md:w-20 ${
                  activeImage === i ? "ring-2 ring-gold ring-offset-2 ring-offset-cream" : "opacity-70 hover:opacity-100"
                }`}
              >
                <img src={image.url} alt={image.alt} loading="lazy" className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
          <div className="group relative flex-1 overflow-hidden bg-cream-tint">
            <img
              src={cover?.url}
              alt={cover?.alt ?? product.imageAlt}
              className="aspect-[4/5] w-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
            {product.badge && (
              <span
                className={`label-lux absolute left-4 top-4 px-2.5 py-1 ${
                  product.badge === "Nouveau" ? "bg-bordeaux text-cream" : product.badge === "Promo" ? "bg-gold text-ink" : "bg-ink/85 text-cream"
                }`}
              >
                {product.badge}
              </span>
            )}
          </div>
        </div>

        {/* Informations */}
        <div className="lg:pl-6">
          <p className="label-lux text-gold-deep">{product.collection}</p>
          <h1 className="serif mt-2 text-[1.75rem] leading-tight sm:text-3xl md:text-4xl">{product.name}</h1>
          {product.reviews > 0 && (
            <div className="mt-3">
              <Stars n={product.rating} reviews={product.reviews} />
            </div>
          )}

          <div className="mt-5 flex items-baseline gap-3 sm:mt-6">
            <span className="serif text-2xl text-ink sm:text-3xl">{fcfa(product.price)}</span>
            {product.compareAt && <span className="text-lg text-taupe line-through">{fcfa(product.compareAt)}</span>}
            {product.compareAt && (
              <span className="label-lux bg-gold px-2 py-0.5 text-ink">
                −{Math.round((1 - product.price / product.compareAt) * 100)}%
              </span>
            )}
          </div>

          <p className="mt-5 text-sm leading-relaxed text-anthracite">{product.description}</p>

          {/* Coloris */}
          {product.variants.length > 0 && (
            <div className="mt-7">
              <p className="label-lux text-anthracite">
                Coloris — <span className="text-taupe">{variant?.color}</span>
              </p>
              <div className="mt-3 flex flex-wrap gap-3">
                {product.variants.map((v) => (
                  <Swatch key={v.id} variant={v} selected={v.id === variant?.id} onSelect={() => selectVariant(v.colorSlug)} />
                ))}
              </div>
            </div>
          )}

          {/* Quantité + ajout au panier */}
          <div className="mt-8 flex items-stretch gap-3">
            <div className="flex items-center border border-taupe/50">
              <button
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                className="grid h-full w-11 place-items-center transition-colors hover:text-gold-deep"
                aria-label="Diminuer la quantité"
              >
                <Minus />
              </button>
              <span className="w-8 text-center text-sm tabular-nums">{qty}</span>
              <button
                onClick={() => setQty((q) => Math.min(maxQty || q + 1, q + 1))}
                disabled={qty >= maxQty}
                className="grid h-full w-11 place-items-center transition-colors hover:text-gold-deep disabled:opacity-40"
                aria-label="Augmenter la quantité"
              >
                <Plus />
              </button>
            </div>
            <button
              disabled={soldOut}
              onClick={() => variant && addToCart(product, variant, qty)}
              className="group flex flex-1 items-center justify-center gap-2.5 bg-ink py-4 text-cream transition-all hover:bg-anthracite active:scale-[0.99] disabled:cursor-not-allowed disabled:bg-taupe"
            >
              <Bag className="text-base" />
              <span className="label-lux">{soldOut ? "Rupture de stock" : "Ajouter au panier"}</span>
            </button>
            <button
              onClick={() => toggleWish(product.id)}
              aria-label="Ajouter aux favoris"
              className={`grid w-14 place-items-center border text-xl transition-colors ${
                wished ? "border-gold text-gold" : "border-taupe/50 text-ink hover:border-gold hover:text-gold-deep"
              }`}
            >
              <Heart filled={wished} />
            </button>
          </div>

          {variant && variant.available && variant.stock.qty <= variant.stock.threshold && (
            <p className="mt-3 text-sm text-bordeaux">
              Plus que {variant.stock.qty} exemplaire{variant.stock.qty > 1 ? "s" : ""} en {variant.color.toLowerCase()}.
            </p>
          )}

          {/* Réassurance */}
          <div className="mt-6 space-y-2.5 text-sm text-anthracite">
            <p className="flex items-center gap-2.5">
              <Truck className="text-lg text-gold-deep" /> Livraison sous 24 h à 6 jours selon la zone · frais calculés au panier
            </p>
            <p className="flex items-center gap-2.5">
              <Rotate className="text-lg text-gold-deep" /> Retours &amp; échanges gratuits sous 14 jours
            </p>
          </div>

          {/* Accordéons alimentés par les vraies données produit */}
          <div className="mt-8">
            <Accordion title="Caractéristiques" open>
              <dl className="space-y-2">
                <div className="flex justify-between gap-4">
                  <dt className="text-taupe">Matière</dt>
                  <dd className="text-right">{product.material}</dd>
                </div>
                {product.specs.closure && (
                  <div className="flex justify-between gap-4">
                    <dt className="text-taupe">Fermeture</dt>
                    <dd className="text-right">{product.specs.closure}</dd>
                  </div>
                )}
                {product.specs.capacity && (
                  <div className="flex justify-between gap-4">
                    <dt className="text-taupe">Capacité</dt>
                    <dd className="text-right">{product.specs.capacity}</dd>
                  </div>
                )}
                {grams(product.specs.weightGrams) && (
                  <div className="flex justify-between gap-4">
                    <dt className="text-taupe">Poids</dt>
                    <dd className="text-right">{grams(product.specs.weightGrams)}</dd>
                  </div>
                )}
              </dl>
              {product.specs.features.length > 0 && (
                <ul className="mt-4 space-y-1.5">
                  {product.specs.features.map((feature) => (
                    <li key={feature} className="flex gap-2">
                      <span className="text-gold-deep">·</span>
                      {feature}
                    </li>
                  ))}
                </ul>
              )}
            </Accordion>

            {dimensions.length > 0 && (
              <Accordion title="Dimensions">
                <dl className="space-y-2">
                  {dimensions.map((row) => (
                    <div key={row.label} className="flex justify-between gap-4">
                      <dt className="text-taupe">{row.label}</dt>
                      <dd className="text-right tabular-nums">{row.value}</dd>
                    </div>
                  ))}
                </dl>
                <p className="mt-3 text-xs text-taupe">Mesures prises à la main, une légère variation est possible.</p>
              </Accordion>
            )}

            <Accordion title="Conseils d'entretien">{product.care}</Accordion>

            <Accordion title="Livraison &amp; retours">
              Livraison à domicile ou retrait gratuit en point relais / boutique. Livraison offerte dès 75 000 FCFA d'achat.
              Paiement à la livraison, Wave ou Orange Money. Retours et échanges gratuits sous 14 jours.
            </Accordion>
          </div>
        </div>
      </div>

      {product.videoUrl && (
        <section className="mt-16">
          <h2 className="serif mb-6 text-xl sm:text-2xl">Le produit en vidéo</h2>
          <video src={product.videoUrl} controls playsInline preload="metadata" className="max-h-[70vh] w-full bg-cream-tint object-contain" />
        </section>
      )}

      {related.filter((p) => p.id !== product.id).length > 0 && (
        <section className="mt-16 md:mt-24">
          <h2 className="serif mb-6 text-xl sm:text-2xl md:mb-8 md:text-3xl">Vous aimerez aussi</h2>
          <div className="grid grid-cols-2 gap-x-3 gap-y-8 sm:gap-x-4 sm:gap-y-10 md:grid-cols-4">
            {related
              .filter((p) => p.id !== product.id)
              .slice(0, 4)
              .map((p) => (
                <ProductCard key={p.id} p={p} />
              ))}
          </div>
        </section>
      )}
    </div>
  );
}
