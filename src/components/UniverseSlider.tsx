import { Link } from "react-router-dom";
import { useCategories } from "../hooks/useCategories";
import CardRail from "./CardRail";
import { ArrowRight } from "./icons";
import type { Category } from "../data";

/**
 * Bande « Nos univers », première section sous le bloc d'accueil.
 *
 * Toute la mécanique de défilement vit dans `CardRail` : ce composant ne
 * décrit plus qu'une tuile d'univers et laisse le rail s'occuper du reste.
 */

/** Durée d'affichage d'une carte avant le passage à la suivante. */
const AUTOPLAY_MS = 4500;

/** Nombre de cartes fictives affichées pendant le chargement du catalogue. */
const SKELETON_COUNT = 4;

/** Classes communes à une case du rail : deux tuiles par écran, puis trois, puis quatre. */
const SLIDE_WIDTH = "shrink-0 basis-1/2 snap-start px-1.5 lg:basis-1/3 xl:basis-1/4";

/**
 * Habillage de la tuile, partagé avec son squelette de chargement : les deux
 * occupent exactement la même boîte, la bande ne saute donc pas au moment où
 * les catégories arrivent.
 *
 * Le fond est `cream-tint` et NON `cream` : les visuels d'univers sont des sacs
 * détourés sur fond transparent. Sur un fond identique à celui de la page, ils
 * flottaient dans le vide au lieu d'occuper une vignette - c'est ce qui donnait
 * à la bande son air d'affiche. Le beige un ton plus soutenu redonne un cadre à
 * l'objet, exactement comme le fait déjà la carte produit.
 *
 * `aspect-[3/4]` plutôt qu'une hauteur en pixels : toutes les tuiles du rail
 * ont alors la même hauteur, à toutes les largeurs d'écran, sans mesure JS.
 */
const CARD_SHELL = "relative flex aspect-[3/4] flex-col overflow-hidden rounded-xl bg-cream-tint";

/**
 * Boîte du visuel : le sac prend toute la place laissée libre au-dessus du nom.
 * `object-contain` et non `object-cover` : ces visuels sont des sacs détourés,
 * les rogner couperait les anses.
 */
const THUMB_BOX = "min-h-0 w-full flex-1 object-contain p-4 pb-1";

/** Typographie du nom de l'univers, partagée avec le squelette. */
const CARD_TITLE = "serif text-[0.95rem] leading-tight sm:text-lg";

/** Chemin de la page boutique filtrée sur un univers. */
const categoryPath = (category: Category) => `/boutique/${encodeURIComponent(category.name)}`;

export default function UniverseSlider() {
  const { data: categories = [], isLoading } = useCategories();

  if (!isLoading && categories.length === 0) return null;

  const slides = isLoading
    ? Array.from({ length: SKELETON_COUNT }, (_, i) => <UniverseSkeleton key={`skeleton-${i}`} />)
    : categories.map((category) => <UniverseCard key={category.id} category={category} />);

  return (
    <section aria-labelledby="nos-univers" className="mx-auto max-w-[1400px] px-5 pt-14 pb-6 md:px-10 md:pt-16 md:pb-8">
      {/* Titre centré : c'est la composition retenue pour les trois bandes de
          la page d'accueil, elles se lisent ainsi comme une même famille. */}
      <h2 id="nos-univers" className="serif mb-8 text-center text-[1.6rem] leading-tight sm:text-3xl md:mb-10 md:text-4xl">
        Nos univers
      </h2>

      <CardRail
        slides={slides}
        slideWidth={SLIDE_WIDTH}
        label="Nos univers"
        autoplayMs={AUTOPLAY_MS}
        previousLabel="Univers précédents"
        nextLabel="Univers suivants"
      />

      <div className="mt-8 flex justify-center">
        <Link
          to="/boutique"
          className="label-lux inline-flex items-center gap-2 border-b border-ink/25 pb-1 text-anthracite transition-colors hover:border-gold-deep hover:text-gold-deep"
        >
          Toute la boutique <ArrowRight />
        </Link>
      </div>
    </section>
  );
}

/** Case de chargement : même boîte que la tuile, la bande ne saute pas. */
function UniverseSkeleton() {
  return (
    <div className={CARD_SHELL} aria-hidden>
      {/* Le pouls est en taupe et non en `cream-tint` : la tuile porte déjà
          cette teinte, un squelette de la même couleur serait invisible. */}
      <div className="m-4 mb-1 min-h-0 flex-1 animate-pulse rounded-md bg-taupe-soft/45" />
      <div className={`${CARD_TITLE} mx-3.5 mb-4 w-2/3 animate-pulse rounded bg-taupe-soft/45`}>&nbsp;</div>
    </div>
  );
}

/**
 * Une tuile d'univers : le visuel, puis le nom qui porte le lien.
 *
 * Toute la tuile est cliquable, mais la zone cliquable n'est pas un bloc
 * `onClick` posé sur l'article : c'est un vrai lien, étiré à la surface de la
 * tuile par un pseudo-élément. La différence n'est pas cosmétique - un lien
 * s'annonce comme tel aux lecteurs d'écran, s'atteint au clavier, s'ouvre dans
 * un nouvel onglet au clic du milieu et se copie par le menu contextuel, ce
 * qu'un gestionnaire de clic ne sait pas faire.
 */
function UniverseCard({ category }: { category: Category }) {
  return (
    <article className={`${CARD_SHELL} group transition-colors duration-300 hover:bg-taupe-soft/40`}>
      {/* Visuel décoratif : le nom de l'univers est juste en dessous et porte
          déjà le lien, un texte de remplacement le répéterait inutilement pour
          les lecteurs d'écran. */}
      <img
        src={category.image}
        alt=""
        loading="lazy"
        className={`${THUMB_BOX} transition-transform duration-500 group-hover:scale-[1.04]`}
      />

      <div className="flex items-center justify-between gap-2 px-3.5 pb-4 pt-1">
        <h3 className={`${CARD_TITLE} text-ink`}>
          <Link
            to={categoryPath(category)}
            className="outline-none transition-colors after:absolute after:inset-0 after:rounded-xl after:content-[''] group-hover:text-gold-deep focus-visible:after:outline-2 focus-visible:after:outline-offset-2 focus-visible:after:outline-bordeaux"
          >
            {category.name}
          </Link>
        </h3>

        <ArrowRight
          aria-hidden
          className="shrink-0 text-sm text-gold-deep transition-transform duration-300 group-hover:translate-x-0.5"
        />
      </div>
    </article>
  );
}
