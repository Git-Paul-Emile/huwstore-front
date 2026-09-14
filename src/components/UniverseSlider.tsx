import { Link } from "react-router-dom";
import { useCategories } from "../hooks/useCategories";
import CardRail from "./CardRail";
import { ArrowRight } from "./icons";
import type { Category } from "../data";

/**
 * Bande « Nos univers », première section sous le bloc d'accueil.
 *
 * Chaque tuile montre une COUVERTURE (`category.preview`, calculé par l'API) :
 * l'image choisie pour l'univers au back-office si la boutique en a posé une,
 * sinon la photo d'un produit réellement rattaché à l'univers. Le visuel de
 * repli `category.image` ne sert que pour un univers encore vide.
 *
 * Toute la mécanique de défilement vit dans `CardRail` : ce composant ne
 * décrit qu'une tuile et laisse le rail s'occuper du reste.
 */

/** Durée d'affichage d'une carte avant le passage à la suivante. */
const AUTOPLAY_MS = 4500;

/** Nombre de cartes fictives affichées pendant le chargement du catalogue. */
const SKELETON_COUNT = 4;

/**
 * Une case du rail : deux tuiles visibles sur mobile, comme demandé le
 * 12/09/2026, puis trois et quatre.
 */
const SLIDE_WIDTH = "shrink-0 basis-1/2 snap-start px-1.5 lg:basis-1/3 xl:basis-1/4";

/**
 * Boîte de la tuile, partagée avec le squelette : même format `4/5` que la
 * carte produit, la bande garde donc la même hauteur à toutes les largeurs
 * d'écran et ne saute pas quand les catégories arrivent.
 */
const CARD_SHELL = "relative block aspect-[4/5] overflow-hidden rounded-xl bg-cream-tint";

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
      {/* Titre en noir uni, sans italique doré - demande du 14/09/2026 : les
          deux couleurs juraient avec le reste de la page. */}
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
      <div className="absolute inset-0 animate-pulse bg-taupe-soft/45" />
      <div className="absolute inset-x-4 bottom-4 h-5 w-2/3 animate-pulse rounded bg-taupe-soft/60" />
    </div>
  );
}

/**
 * Une tuile d'univers.
 *
 * Toute la tuile est cliquable, mais c'est un vrai lien étiré à sa surface par
 * un pseudo-élément, pas un `onClick` sur le bloc : un lien s'annonce aux
 * lecteurs d'écran, s'atteint au clavier, s'ouvre dans un nouvel onglet au clic
 * du milieu et se copie par le menu contextuel.
 */
function UniverseCard({ category }: { category: Category }) {
  const cover = category.preview?.[0]?.url;

  return (
    <article className={`${CARD_SHELL} group`}>
      <UniverseCover cover={cover} fallback={category.image} name={category.name} />

      {/* Voile sombre : il n'apparaît qu'en bas, là où se pose le nom, pour
          garder la couverture lisible sans assombrir toute la photo. */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/25 to-transparent" />

      <h3 className="serif absolute inset-x-0 bottom-0 p-4 text-lg leading-tight text-cream sm:text-xl">
        <Link
          to={categoryPath(category)}
          className="outline-none after:absolute after:inset-0 after:rounded-xl after:content-[''] focus-visible:after:outline-2 focus-visible:after:outline-offset-2 focus-visible:after:outline-gold"
        >
          {category.name}
        </Link>
      </h3>
    </article>
  );
}

/**
 * La couverture : une seule photo. Celle choisie au back-office si la boutique
 * en a posé une, sinon la photo d'un produit rattaché à l'univers, calculée par
 * l'API. Le visuel de repli ne sert que pour un univers encore sans produit.
 *
 * L'image de couverture est décorative (le nom porte déjà le lien) donc
 * `alt=""` ; le repli garde un `alt` car il n'a aucun autre texte.
 */
function UniverseCover({ cover, fallback, name }: { cover?: string; fallback: string; name: string }) {
  if (cover) {
    return (
      <img
        src={cover}
        alt=""
        loading="lazy"
        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.05]"
      />
    );
  }

  // Univers sans produit : le visuel de repli est un sac détouré, on le pose
  // sur la vignette sans le rogner.
  return (
    <img
      src={fallback}
      alt={name}
      loading="lazy"
      className="h-full w-full object-contain p-6 transition-transform duration-500 group-hover:scale-[1.04]"
    />
  );
}
