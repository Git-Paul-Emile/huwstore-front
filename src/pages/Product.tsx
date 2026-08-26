import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useProduct, useProducts } from "../hooks/useProducts";
import { useCartStore } from "../store/useCartStore";
import { fcfa } from "../data";
import { Stars, ProductCard } from "../components/Shared";
import { Heart, Bag, Truck, Rotate, Plus, Minus, ChevronDown } from "../components/icons";

const colorSwatch: Record<string, string> = {
  Noir: "#1a1a1a", Fauve: "#b07d4a", Cognac: "#8a4b2a", Ivoire: "#efe8dc",
  Grège: "#c7bba8", Bordeaux: "#5c2a2a", "Vert bouteille": "#1f2e28", "Gris orage": "#6b6b6b",
};

const accordions = [
  { title: "Description", body: "Un sac structuré aux lignes épurées, façonné dans un cuir sélectionné pour sa main souple et sa patine. Doublure en microfibre, poche zippée intérieure et bandoulière amovible réglable." },
  { title: "Matières & entretien", body: "Cuir de veau tanné au végétal. Nourrir régulièrement avec un lait spécifique, éviter l'exposition prolongée au soleil et à l'humidité. Chaque marque naturelle témoigne de l'authenticité de la peau." },
  { title: "Livraison & retours", body: "Livraison à domicile ou retrait gratuit en point relais / boutique. Livraison offerte dès 75 000 FCFA d'achat. Paiement à la livraison, Wave ou Orange Money. Retours et échanges gratuits sous 14 jours." },
  { title: "Dimensions", body: "L 28 × H 20 × P 12 cm. Anse : 22 cm. Bandoulière réglable jusqu'à 120 cm. Poids : 620 g." },
];

function Accordion({ title, body }: { title: string; body: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-taupe/25">
      <button onClick={() => setOpen((o) => !o)} className="flex w-full items-center justify-between py-4">
        <span className="label-lux text-ink">{title}</span>
        <ChevronDown className={`text-taupe transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      <div className={`grid transition-all duration-300 ${open ? "grid-rows-[1fr] pb-5" : "grid-rows-[0fr]"}`}>
        <div className="overflow-hidden text-sm leading-relaxed text-anthracite">{body}</div>
      </div>
    </div>
  );
}

export default function Product() {
  const navigate = useNavigate();
  const { id = "" } = useParams<{ id: string }>();
  const { data: product } = useProduct(id);
  const { data: allProducts = [] } = useProducts();
  const addToCart = useCartStore((s) => s.addToCart);
  const wishlist = useCartStore((s) => s.wishlist);
  const toggleWish = useCartStore((s) => s.toggleWish);

  const [active, setActive] = useState(0);
  const [color, setColor] = useState<string | null>(null);
  const [qty, setQty] = useState(1);

  if (!product) return null;

  const gallery = [product.image, product.imageHover].filter(Boolean);
  const soldOut = product.badge === "Rupture";
  const wished = wishlist.includes(product.id);
  const related = allProducts.filter((p) => p.id !== product.id).slice(0, 4);
  const selectedColor = color ?? product.color;

  return (
    <div className="mx-auto max-w-[1400px] px-5 md:px-10 py-8">
      <nav className="label-lux flex items-center gap-2 text-taupe">
        <button onClick={() => navigate("/")} className="hover:text-gold-deep">Accueil</button>
        <span>/</span>
        <button onClick={() => navigate(`/boutique/${encodeURIComponent(product.category)}`)} className="hover:text-gold-deep">{product.category}</button>
        <span>/</span>
        <span className="text-anthracite">{product.name}</span>
      </nav>

      <div className="mt-6 grid gap-10 lg:grid-cols-2">
        {/* Galerie */}
        <div className="flex flex-col-reverse gap-4 md:flex-row">
          <div className="flex gap-3 md:flex-col">
            {gallery.map((g, i) => (
              <button
                key={i}
                onClick={() => setActive(i)}
                className={`h-20 w-16 shrink-0 overflow-hidden bg-cream-tint transition-all md:h-24 md:w-20 ${active === i ? "ring-2 ring-gold ring-offset-2 ring-offset-cream" : "opacity-70 hover:opacity-100"}`}
              >
                <img src={g} alt={`${product.name} vue ${i + 1}`} className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
          <div className="group relative flex-1 overflow-hidden bg-cream-tint">
            <img
              src={gallery[active] ?? product.image}
              alt={product.imageAlt}
              className="aspect-[4/5] w-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
            {product.badge && (
              <span className={`label-lux absolute left-4 top-4 px-2.5 py-1 ${product.badge === "Nouveau" ? "bg-bordeaux text-cream" : product.badge === "Promo" ? "bg-gold text-ink" : "bg-ink/85 text-cream"}`}>
                {product.badge}
              </span>
            )}
          </div>
        </div>

        {/* Infos */}
        <div className="lg:pl-6">
          <p className="label-lux text-gold-deep">{product.collection}</p>
          <h1 className="serif mt-2 text-[1.75rem] leading-tight sm:text-3xl md:text-4xl">{product.name}</h1>
          <div className="mt-3"><Stars n={product.rating} reviews={product.reviews} /></div>

          <div className="mt-5 flex items-baseline gap-3 sm:mt-6">
            <span className="serif text-2xl text-ink sm:text-3xl">{fcfa(product.price)}</span>
            {product.compareAt && <span className="text-lg text-taupe line-through">{fcfa(product.compareAt)}</span>}
            {product.compareAt && (
              <span className="label-lux bg-gold px-2 py-0.5 text-ink">−{Math.round((1 - product.price / product.compareAt) * 100)}%</span>
            )}
          </div>

          {/* Couleur */}
          <div className="mt-7">
            <p className="label-lux text-anthracite">Couleur — <span className="text-taupe">{selectedColor}</span></p>
            <div className="mt-3 flex gap-3">
              {[product.color, "Noir", "Cognac"].filter((v, i, a) => a.indexOf(v) === i).map((c) => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  title={c}
                  className={`h-9 w-9 rounded-full border transition-all ${selectedColor === c ? "border-gold ring-2 ring-gold ring-offset-2 ring-offset-cream" : "border-taupe/40"}`}
                  style={{ background: colorSwatch[c] ?? "#ccc" }}
                />
              ))}
            </div>
          </div>

          {/* Quantité + CTA */}
          <div className="mt-8 flex items-stretch gap-3">
            <div className="flex items-center border border-taupe/50">
              <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="grid h-full w-11 place-items-center transition-colors hover:text-gold-deep"><Minus /></button>
              <span className="w-8 text-center text-sm tabular-nums">{qty}</span>
              <button onClick={() => setQty((q) => q + 1)} className="grid h-full w-11 place-items-center transition-colors hover:text-gold-deep"><Plus /></button>
            </div>
            <button
              disabled={soldOut}
              onClick={() => addToCart(product, qty)}
              className="group flex flex-1 items-center justify-center gap-2.5 bg-ink py-4 text-cream transition-all hover:bg-anthracite active:scale-[0.99] disabled:cursor-not-allowed disabled:bg-taupe"
            >
              <Bag className="text-base" />
              <span className="label-lux">{soldOut ? "Rupture de stock" : "Ajouter au panier"}</span>
            </button>
            <button
              onClick={() => toggleWish(product.id)}
              aria-label="Ajouter aux favoris"
              className={`grid w-14 place-items-center border text-xl transition-colors ${wished ? "border-gold text-gold" : "border-taupe/50 text-ink hover:border-gold hover:text-gold-deep"}`}
            >
              <Heart filled={wished} />
            </button>
          </div>

          {/* Réassurance */}
          <div className="mt-6 space-y-2.5 text-sm text-anthracite">
            <p className="flex items-center gap-2.5"><Truck className="text-lg text-gold-deep" /> Livraison sous 24h à 6 jours selon la zone · frais calculés au panier</p>
            <p className="flex items-center gap-2.5"><Rotate className="text-lg text-gold-deep" /> Retours &amp; échanges gratuits sous 14 jours</p>
          </div>

          {/* Accordéons */}
          <div className="mt-8">
            {accordions.map((a) => <Accordion key={a.title} {...a} />)}
          </div>
        </div>
      </div>

      {/* Vous aimerez aussi */}
      <section className="mt-16 md:mt-24">
        <h2 className="serif mb-6 text-xl sm:text-2xl md:mb-8 md:text-3xl">Vous aimerez aussi</h2>
        <div className="grid grid-cols-2 gap-x-3 gap-y-8 sm:gap-x-4 sm:gap-y-10 md:grid-cols-4">
          {related.map((p) => <ProductCard key={p.id} p={p} />)}
        </div>
      </section>
    </div>
  );
}
