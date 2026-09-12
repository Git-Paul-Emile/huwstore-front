import { Link } from "react-router-dom";
import { useCategories } from "../hooks/useCategories";
import { ArrowRight } from "./icons";
import type { Category } from "../data";

/**
 * Bande de photos entre le bandeau d'accueil et « Nos univers » : le slogan
 * et le bouton de la maquette, puis les couvertures des quatre premiers
 * univers en grille fixe, sans défilement - demande du 12/09/2026, après un
 * premier essai en rail jugé pas adapté ici. Deux colonnes (deux en haut,
 * deux en bas) sur petit écran, quatre colonnes (une seule ligne) à partir de
 * `md` - demande du 12/09/2026.
 *
 * Mêmes couvertures que `UniverseSlider` (`category.preview`, calculé par
 * l'API, ou `category.image` en repli) : cette bande annonce le catalogue
 * réel, elle ne montre pas un visuel choisi pour l'occasion.
 */

/** Toujours quatre : deux lignes de deux sur petit écran, une ligne de quatre au-delà. */
const SHOWCASE_COUNT = 4;

/**
 * Boîte de la tuile. Demande du 12/09/2026 : même largeur que les cartes de
 * `UniverseSlider` (donc même grille deux colonnes sur le même conteneur, et
 * le même écart de 12 px entre elles), pour une hauteur de MOITIÉ la leur.
 *
 * La carte `UniverseSlider` est en `aspect-[4/5]` (largeur/hauteur = 0,8, donc
 * hauteur = largeur x 1,25). La moitié de cette hauteur donne largeur/hauteur
 * = 1 / (1,25 / 2) = 1,6, soit `8/5`.
 */
const TILE_SHELL = "block aspect-[8/5] overflow-hidden rounded-2xl bg-cream-tint";

const categoryPath = (category: Category) => `/boutique/${encodeURIComponent(category.name)}`;

export default function CategoryShowcase() {
  const { data: categories = [], isLoading } = useCategories();
  const showcased = categories.slice(0, SHOWCASE_COUNT);

  if (!isLoading && showcased.length === 0) return null;

  return (
    <section aria-label="Aperçu de la collection" className="mx-auto max-w-[1400px] px-5 pt-14 text-center md:px-10 md:pt-16">
      <p className="text-base text-anthracite md:text-lg">Alliez style et praticité au quotidien.</p>

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

      {/* Deux colonnes sur petit écran (deux en haut, deux en bas), quatre à
          partir de `md` (une seule ligne) - demande du 12/09/2026. Largeur à
          100 % du conteneur : la demande du 12/09/2026 de monter de 30 % de-
          puis 79,2 % (0,792 x 1,3 = 1,03) dépasserait la largeur disponible
          dans la section, qui a déjà son propre `px-5`/`md:px-10` - la grille
          déborderait de la page. Plafonné à 100 %, le maximum possible sans
          défilement horizontal. Le ratio `8/5` de `TILE_SHELL` reste
          inchangé : la hauteur suit la largeur de chaque colonne via
          `aspect-ratio`, quel que soit leur nombre. */}
      <div className="mt-8 grid grid-cols-2 gap-3 md:mt-10 md:grid-cols-4">
        {isLoading
          ? Array.from({ length: SHOWCASE_COUNT }, (_, i) => <div key={`skeleton-${i}`} className={`${TILE_SHELL} animate-pulse bg-taupe-soft/45`} />)
          : showcased.map((category) => <ShowcaseTile key={category.id} category={category} />)}
      </div>
    </section>
  );
}

/** Une photo, cliquable vers la boutique filtrée sur cet univers. */
function ShowcaseTile({ category }: { category: Category }) {
  const cover = category.preview?.[0]?.url || category.image;

  return (
    <Link to={categoryPath(category)} className={`${TILE_SHELL} group`}>
      <img
        src={cover}
        alt={category.name}
        loading="lazy"
        className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-[1.04]"
      />
    </Link>
  );
}
