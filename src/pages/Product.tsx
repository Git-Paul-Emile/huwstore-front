import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useProduct, useProducts } from "../hooks/useProducts";
import { useCartStore } from "../store/useCartStore";
import { useWishlist } from "../hooks/useWishlist";
import { useSeo } from "../hooks/useSeo";
import { cm, dimensionLabels, fcfa, grams, type ProductVariant } from "../data";
import { ProductCard } from "../components/Shared";
import { Heart, Bag, Truck, Shield, Plus, Minus, ChevronDown, Play } from "../components/icons";

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

/** Pastille de couleur - dégradé à deux teintes pour les modèles bi-matière. */
function Swatch({ variant, selected, onSelect }: { variant: ProductVariant; selected: boolean; onSelect: () => void }) {
  return (
    <button
      onClick={onSelect}
      title={variant.available ? variant.color : `${variant.color} - épuisé`}
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

/**
 * Une case de la galerie. La vidéo en fait partie au même titre qu'une photo :
 * reléguée dans une section à part, plus bas dans la page, elle passait
 * inaperçue alors que c'est le média qui montre le mieux un sac.
 */
type GalleryItem = {
  kind: "photo" | "video";
  url: string;
  alt: string;
  /** Renseigné uniquement pour les photos rattachées à un coloris. */
  colorSlug?: string;
  colorName?: string;
};

export default function Product() {
  const navigate = useNavigate();
  const { id = "" } = useParams<{ id: string }>();
  const { data: product, isLoading } = useProduct(id);
  const addToCart = useCartStore((s) => s.addToCart);
  const { has, toggle: toggleWish } = useWishlist();

  const [variantSlug, setVariantSlug] = useState<string | null>(null);
  const [activeImage, setActiveImage] = useState(0);
  const [qty, setQty] = useState(1);

  // Suggestions : même catégorie, produit courant exclu.
  const { data: related = [] } = useProducts(product ? { category: product.categorySlug, limit: 5 } : {});

  const variant = useMemo(() => {
    if (!product?.variants.length) return null;
    return product.variants.find((v) => v.colorSlug === variantSlug) ?? product.variants.find((v) => v.available) ?? product.variants[0];
  }, [product, variantSlug]);

  /**
   * Galerie complète : TOUT le média du produit y passe, dans un ordre qui
   * garde le coloris choisi devant.
   *
   *   1. les photos du coloris choisi ;
   *   2. les visuels communs (packshots, fiche technique, mises en situation) ;
   *   3. la vidéo, s'il y en a une ;
   *   4. les photos des AUTRES coloris.
   *
   * Le point 4 est ce qui manquait : la galerie s'arrêtait aux deux premiers
   * groupes, si bien qu'un modèle dont chaque couleur n'a qu'une seule photo
   * n'en montrait que deux, et que la moitié des photos fournies par la
   * boutique n'était visible nulle part. Les photos d'un autre coloris restent
   * en fin de liste et annoncent leur couleur sous l'image affichée : la
   * visiteuse voit tout sans jamais croire que c'est la couleur qu'elle a
   * choisie.
   */
  const gallery = useMemo<GalleryItem[]>(() => {
    if (!product) return [];

    const photo = (image: { url: string; alt: string }, color?: { colorSlug: string; color: string }): GalleryItem => ({
      kind: "photo",
      url: image.url,
      alt: image.alt,
      colorSlug: color?.colorSlug,
      colorName: color?.color,
    });

    const variantUrls = new Set(product.variants.flatMap((v) => v.images.map((i) => i.url)));

    return [
      ...(variant ? variant.images.map((image) => photo(image, variant)) : []),
      ...product.images.filter((image) => !variantUrls.has(image.url)).map((image) => photo(image)),
      ...(product.videoUrl
        ? [{ kind: "video" as const, url: product.videoUrl, alt: `${product.name} en vidéo` }]
        : []),
      ...product.variants
        .filter((v) => v.colorSlug !== variant?.colorSlug)
        .flatMap((v) => v.images.map((image) => photo(image, v))),
    ];
  }, [product, variant]);

  // Appelé avant les retours anticipés : un hook ne peut pas être conditionnel.
  useSeo({
    title: product?.name ?? "Chargement",
    description: product
      ? `${product.name}, ${product.material}. ${product.description.slice(0, 130)}`
      : undefined,
    image: product?.image,
    // Fiche produit Schema.org : c'est elle qui permet à Google d'afficher le
    // prix et la disponibilite directement dans ses resultats.
    jsonLd: product
      ? {
          "@context": "https://schema.org",
          "@type": "Product",
          name: product.name,
          description: product.description,
          image: product.images.map((image) => image.url),
          material: product.material,
          category: product.category,
          sku: product.variants?.[0]?.sku,
          brand: { "@type": "Brand", name: "HUWSTORE" },
          offers: {
            "@type": "Offer",
            price: product.price,
            priceCurrency: "XOF",
            availability:
              product.badge === "Rupture"
                ? "https://schema.org/OutOfStock"
                : "https://schema.org/InStock",
            url: window.location.href,
          },
        }
      : undefined,
  });

  if (isLoading) return <div className="mx-auto max-w-[1400px] px-5 py-20 text-center text-taupe">Chargement…</div>;
  if (!product) return null;

  const soldOut = !variant?.available;
  const wished = has(product.id);
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
            {gallery.map((item, i) => (
              <button
                key={item.url}
                onClick={() => setActiveImage(i)}
                aria-label={item.kind === "video" ? "Voir la vidéo du produit" : item.alt}
                className={`relative h-20 w-16 shrink-0 overflow-hidden rounded-lg bg-cream-tint transition-all md:h-24 md:w-20 ${
                  activeImage === i ? "ring-2 ring-gold ring-offset-2 ring-offset-cream" : "opacity-70 hover:opacity-100"
                }`}
              >
                {item.kind === "video" ? (
                  // Pas de vignette extraite de la vidéo : on afficherait une
                  // image que le navigateur doit d'abord télécharger en entier.
                  // Un aplat sombre et un triangle disent la même chose, tout de
                  // suite et sans un octet de plus.
                  <span className="grid h-full w-full place-items-center bg-ink text-cream">
                    <Play className="text-lg" />
                  </span>
                ) : (
                  <img src={item.url} alt="" loading="lazy" className="h-full w-full object-cover" />
                )}
              </button>
            ))}
          </div>

          <div className="flex-1">
            <div className="group relative overflow-hidden rounded-xl bg-cream-tint">
              {cover?.kind === "video" ? (
                /*
                 * Lecture immédiate, son coupé.
                 *
                 * Le son coupé n'est pas un détail de confort : les navigateurs
                 * REFUSENT de lancer seule une vidéo qui a du son, faute de
                 * quoi une page pourrait se mettre à parler sans qu'on lui ait
                 * rien demandé. Une vidéo muette démarre, une vidéo sonore
                 * reste figée sur sa première image - le `muted` est donc ce
                 * qui rend le `autoPlay` possible, pas une option à côté.
                 *
                 * `muted` est posé sur l'élément lui-même et pas seulement en
                 * attribut : React n'écrit pas toujours cet attribut au premier
                 * rendu, et la vidéo partirait alors avec le son.
                 *
                 * Les commandes restent affichées : la visiteuse rétablit le
                 * son quand elle le décide.
                 */
                <video
                  key={cover.url}
                  ref={(element) => {
                    if (element) element.muted = true;
                  }}
                  src={cover.url}
                  autoPlay
                  muted
                  controls
                  playsInline
                  preload="metadata"
                  className="aspect-[4/5] w-full bg-ink object-contain"
                />
              ) : (
                <img
                  src={cover?.url}
                  alt={cover?.alt ?? product.imageAlt}
                  className="aspect-[4/5] w-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
              )}
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

            {/* La photo affichée appartient à un autre coloris que celui
                sélectionné : on le dit, et on propose de basculer. Sans cette
                mention, la visiteuse croirait regarder la couleur qu'elle
                s'apprête à commander. */}
            {cover?.colorSlug && cover.colorSlug !== variant?.colorSlug && (
              <p className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-taupe">
                <span>Photo du coloris {cover.colorName}.</span>
                <button
                  onClick={() => selectVariant(cover.colorSlug!)}
                  className="label-lux border-b border-gold-deep/40 pb-0.5 text-gold-deep transition-colors hover:border-gold-deep"
                >
                  Choisir ce coloris
                </button>
              </p>
            )}
          </div>
        </div>

        {/* Informations */}
        <div className="lg:pl-6">
          <p className="label-lux text-gold-deep">{product.collection}</p>
          <h1 className="serif mt-2 text-[1.75rem] leading-tight sm:text-3xl md:text-4xl">{product.name}</h1>

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

          {product.includedAccessory && (
            <p className="label-lux mt-4 border border-gold/40 bg-gold/10 px-3 py-2.5 text-anthracite">
              {product.includedAccessory}
            </p>
          )}

          {/* Coloris */}
          {product.variants.length > 0 && (
            <div className="mt-7">
              <p className="label-lux text-anthracite">
                Coloris - <span className="text-taupe">{variant?.color}</span>
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
              <Truck className="text-lg text-gold-deep" /> Livraison sous 24 h à 6 jours selon la zone - frais calculés au panier
            </p>
            <p className="flex items-center gap-2.5">
              <Shield className="text-lg text-gold-deep" /> Paiement à la livraison, en espèces
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
                      <span className="text-gold-deep">-</span>
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

            <Accordion title="Livraison &amp; paiement">
              Livraison à domicile ou retrait gratuit en point relais / boutique, partout au Sénégal : 24 h sur Dakar,
              sauf le dimanche. Pour les autres zones, le délai annoncé est celui affiché au panier. Les frais
              dépendent de la zone et sont offerts au-delà du seuil indiqué au panier. Le
              règlement se fait en espèces à la remise du colis. Les retours et les échanges ne sont pas acceptés :
              vérifiez l'article devant la personne qui vous le remet.
            </Accordion>
          </div>
        </div>
      </div>

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

