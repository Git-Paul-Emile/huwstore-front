import { Link } from "react-router-dom";
import { useProduct } from "../hooks/useProducts";
import { ArrowRight } from "./icons";

/**
 * Bande de photos entre le bandeau d'accueil et « Nos univers » : le slogan
 * et le bouton, puis quatre modèles choisis à la main pour cette vitrine -
 * demande du 14/09/2026, qui remplace les couvertures d'univers affichées
 * ici jusque-là (composant `CategoryShowcase`).
 *
 * Contrairement aux univers et aux meilleures ventes, cette sélection est
 * fixe et vit dans le code : la faire évoluer passe par
 * `FEATURED_PRODUCT_IDS` ci-dessous, pas par le back-office.
 */

/** Identifiants des quatre modèles à mettre en avant - demande du 14/09/2026. */
const FEATURED_PRODUCT_IDS = [
  "cabas-multi-compartiments",
  "tote-bag-velours-cotele",
  "cabas-bi-matiere-similicuir",
  "tote-bag-coton-durable",
] as const;

/**
 * Boîte de la tuile. Même aspect `4/5` que les cartes de `UniverseSlider` et
 * `ProductCard` (`Shared.tsx`) - demande du 14/09/2026, pour que les trois
 * bandes de produits de la page d'accueil montrent des vignettes de la même
 * taille.
 */
const TILE_SHELL = "block aspect-[4/5] overflow-hidden rounded-2xl bg-cream-tint";

export default function FeaturedProducts() {
  return (
    <section aria-label="Aperçu de la collection" className="mx-auto max-w-[1400px] px-5 pt-14 text-center md:px-10 md:pt-16">
      {/* Même police que les titres « Nos univers » et « Meilleures ventes »,
          en gras, sans changer sa taille - demande du 14/09/2026. */}
      <p className="serif font-bold text-base text-anthracite md:text-lg">Alliez style et praticité au quotidien.</p>

      {/* Fond doré et texte crème, à la demande explicite du 12/09/2026
          malgré l'alerte donnée à ce moment-là : crème sur ce doré ne monte
          qu'à 2,1:1, sous le minimum de 4,5:1 exigé par
          `rules/30-produit/ui.md`. Choix assumé, pas un oubli. */}
      <Link
        to="/boutique"
        className="label-lux mt-5 inline-flex items-center gap-2 whitespace-nowrap rounded-full bg-gold px-6 py-3.5 text-cream transition-colors hover:bg-gold-deep md:px-8 md:py-4"
      >
        Découvrir la collection <ArrowRight />
      </Link>

      <div className="mt-8 grid grid-cols-2 gap-3 md:mt-10 md:grid-cols-4">
        {FEATURED_PRODUCT_IDS.map((id) => (
          <FeaturedTile key={id} id={id} />
        ))}
      </div>
    </section>
  );
}

/** Une photo, cliquable vers la fiche du produit. */
function FeaturedTile({ id }: { id: string }) {
  const { data: product, isLoading } = useProduct(id);

  if (!isLoading && !product) return null;

  if (!product) {
    return <div className={`${TILE_SHELL} animate-pulse bg-taupe-soft/45`} aria-hidden />;
  }

  return (
    <Link to={`/produit/${product.id}`} className={`${TILE_SHELL} group`}>
      <img
        src={product.image}
        alt={product.imageAlt}
        loading="lazy"
        className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-[1.04]"
      />
    </Link>
  );
}
