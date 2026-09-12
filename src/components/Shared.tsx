import { useNavigate } from "react-router-dom";
import type { Product } from "../data";
import { fcfa } from "../data";
import { useCartStore } from "../store/useCartStore";
import { useWishlist } from "../hooks/useWishlist";
import { Heart, Bag } from "./icons";

const badgeStyle: Record<string, string> = {
  Nouveau: "bg-bordeaux text-cream",
  Promo: "bg-gold text-ink",
  Rupture: "bg-ink/85 text-cream",
};

export function ProductCard({ p }: { p: Product }) {
  const navigate = useNavigate();
  const { has, toggle: toggleWish } = useWishlist();
  const addToCart = useCartStore((s) => s.addToCart);
  const wished = has(p.id);
  // Sur une carte produit on n'a pas de sélecteur de couleur : on ajoute la
  // première déclinaison encore en stock, l'acheteur peut la changer ensuite.
  const defaultVariant = p.variants?.find((v) => v.available) ?? p.variants?.[0];
  const soldOut = p.badge === "Rupture" || !defaultVariant?.available;
  return (
    <article className="group flex h-full flex-col">
      <button
        onClick={() => navigate(`/produit/${p.id}`)}
        className="relative block aspect-[4/5] overflow-hidden rounded-lg bg-cream-tint text-left"
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
      {/* Texte centré sous le visuel : la vignette se lit alors comme une
          étiquette posée sous la photo plutôt que comme un bloc de texte
          aligné à gauche, et les cartes d'une même rangée restent lisibles
          quelle que soit la longueur des noms. */}
      <div className="flex flex-1 flex-col items-center pt-4 text-center">
        {/* Pas de nom de collection au-dessus du titre : tous les articles
            portent le même, il ne distingue donc rien et ne fait qu'éloigner
            le nom du produit de sa photo. */}
        <button
          onClick={() => navigate(`/produit/${p.id}`)}
          className="serif line-clamp-2 min-h-[2.8rem] text-lg leading-tight text-ink transition-colors hover:text-gold-deep"
        >
          {p.name}
        </button>
        {/* Prix barré AVANT le prix courant : l'œil lit d'abord ce qui a été
            payé avant, puis ce qui est demandé aujourd'hui. */}
        <div className="mt-1.5 flex items-baseline justify-center gap-2.5">
          {p.compareAt && <span className="text-xs text-taupe line-through">{fcfa(p.compareAt)}</span>}
          <span className={`text-sm tracking-wide ${p.compareAt ? "text-bordeaux" : "text-anthracite"}`}>{fcfa(p.price)}</span>
        </div>
        <button
          onClick={() => defaultVariant && addToCart(p, defaultVariant)}
          disabled={soldOut}
          className="label-lux mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-gold py-3 text-ink transition-all hover:bg-gold-deep active:scale-[0.99] disabled:cursor-not-allowed disabled:bg-taupe-soft disabled:text-taupe"
        >
          {/* Icône masquée sur petit écran - demande du 12/09/2026 : le texte
              « Ajouter au panier » tient mieux seul dans une carte étroite. */}
          <Bag className="hidden text-base sm:inline" />
          {soldOut ? "Épuisé" : "Ajouter au panier"}
        </button>
      </div>
    </article>
  );
}
