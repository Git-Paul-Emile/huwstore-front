import { useNavigate } from "react-router-dom";
import type { Product } from "../data";
import { fcfa } from "../data";
import { useCartStore } from "../store/useCartStore";
import { Heart, Star, Bag } from "./icons";

export function Stars({ n, reviews }: { n: number; reviews?: number }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-gold">
      <span className="inline-flex text-[0.8rem]">
        {[1, 2, 3, 4, 5].map((i) => (
          <Star key={i} filled={i <= n} className={i <= n ? "text-gold" : "text-taupe-soft"} />
        ))}
      </span>
      {reviews != null && <span className="text-taupe text-xs tracking-wide">{reviews} avis</span>}
    </span>
  );
}

const badgeStyle: Record<string, string> = {
  Nouveau: "bg-bordeaux text-cream",
  Promo: "bg-gold text-ink",
  Rupture: "bg-ink/85 text-cream",
};

export function ProductCard({ p }: { p: Product }) {
  const navigate = useNavigate();
  const wishlist = useCartStore((s) => s.wishlist);
  const toggleWish = useCartStore((s) => s.toggleWish);
  const addToCart = useCartStore((s) => s.addToCart);
  const wished = wishlist.includes(p.id);
  const soldOut = p.badge === "Rupture";
  return (
    <article className="group flex flex-col">
      <button
        onClick={() => navigate(`/produit/${p.id}`)}
        className="relative block overflow-hidden bg-cream-tint aspect-[4/5] text-left"
      >
        <img
          src={p.image}
          alt={p.imageAlt}
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover transition-all duration-500 group-hover:opacity-0 group-hover:scale-105"
        />
        <img
          src={p.imageHover}
          alt=""
          aria-hidden
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover opacity-0 scale-105 transition-all duration-500 group-hover:opacity-100 group-hover:scale-100"
        />
        {p.badge && (
          <span className={`label-lux absolute left-4 top-4 px-2.5 py-1 ${badgeStyle[p.badge]}`}>{p.badge}</span>
        )}
        <span
          role="button"
          tabIndex={0}
          onClick={(e) => { e.stopPropagation(); toggleWish(p.id); }}
          onKeyDown={(e) => { if (e.key === "Enter") { e.stopPropagation(); toggleWish(p.id); } }}
          className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-cream/90 text-ink text-[1rem] opacity-0 translate-y-1 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0 hover:text-gold"
        >
          <Heart filled={wished} className={wished ? "text-gold" : ""} />
        </span>
      </button>
      <div className="pt-4">
        <p className="label-lux text-taupe">{p.collection}</p>
        <button
          onClick={() => navigate(`/produit/${p.id}`)}
          className="serif mt-1 block text-lg text-ink transition-colors hover:text-gold-deep"
        >
          {p.name}
        </button>
        <div className="mt-1.5 flex items-baseline gap-2.5">
          <span className={`text-sm tracking-wide ${p.compareAt ? "text-bordeaux" : "text-anthracite"}`}>{fcfa(p.price)}</span>
          {p.compareAt && <span className="text-xs text-taupe line-through">{fcfa(p.compareAt)}</span>}
        </div>
        <button
          onClick={() => addToCart(p)}
          disabled={soldOut}
          className="label-lux mt-3 flex w-full items-center justify-center gap-2 bg-gold py-3 text-ink transition-all hover:bg-gold-deep active:scale-[0.99] disabled:cursor-not-allowed disabled:bg-taupe-soft disabled:text-taupe"
        >
          <Bag className="text-base" />
          {soldOut ? "Épuisé" : "Ajouter au panier"}
        </button>
      </div>
    </article>
  );
}
