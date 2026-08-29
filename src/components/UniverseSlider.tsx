import { useCallback, useEffect, useRef, useState, type FocusEvent } from "react";
import { Link } from "react-router-dom";
import { useCategories } from "../hooks/useCategories";
import { useAutoplay } from "../hooks/useAutoplay";
import { usePrefersReducedMotion } from "../hooks/usePrefersReducedMotion";
import { ArrowRight, ChevronLeft, ChevronRight } from "./icons";
import type { Category } from "../data";

/**
 * Bande « Nos univers », posée à cheval sur le bas du Hero.
 *
 * Les cartes défilent sur un rail à défilement natif plutôt que sur un rail
 * déplacé en JavaScript : le glissement au doigt, l'inertie et l'accroche sont
 * alors ceux du navigateur, donc corrects sur tous les mobiles sans une ligne
 * de code. Le JavaScript ne sert plus qu'à deux choses, faire avancer le rail
 * tout seul et lire la position courante pour les puces.
 */

/** Durée d'affichage d'une carte avant le passage à la suivante. */
const AUTOPLAY_MS = 4500;

/** Nombre de cartes fictives affichées pendant le chargement du catalogue :
 *  autant que la rangée en montre au plus. */
const SKELETON_COUNT = 4;

/** Classes communes à une case du rail : une carte, deux, trois, puis quatre. */
const SLIDE_WIDTH = "shrink-0 basis-full snap-start px-1.5 sm:basis-1/2 lg:basis-1/3 xl:basis-1/4";

/**
 * Habillage de la carte, partagé avec son squelette de chargement : les deux
 * occupent exactement la même boîte, la bande ne saute donc pas au moment où
 * les catégories arrivent.
 */
const CARD_SHELL = "@container relative flex h-full flex-col items-center rounded-lg bg-cream p-5 text-center sm:p-6";

/**
 * Boîte du visuel : le sac occupe toute la largeur de la carte, le nom passe
 * dessous. À quatre colonnes, la carte n'est plus assez large pour poser le
 * visuel et le nom côte à côte sans rapetisser l'un ou couper l'autre.
 *
 * Seule la hauteur compte ici : les fichiers sont carrés et affichés en
 * `object-contain`, c'est donc elle qui fixe la taille du sac à l'écran. Elle
 * est réglée sur la largeur intérieure de LA CARTE et non sur celle de l'écran
 * - une carte au quart de la largeur sur un écran de 1440 px est plus étroite
 * que la carte unique d'un mobile, alors que les points de rupture d'écran
 * diraient l'inverse.
 */
const THUMB_BOX = "h-40 w-full @min-[260px]:h-48 @min-[300px]:h-56";

/**
 * Typographie du nom de l'univers, partagée avec le squelette. Le squelette
 * s'en sert pour sa propre barre : sa hauteur suit alors celle du vrai titre à
 * chaque point de rupture, au lieu d'une valeur figée à réajuster à la main.
 */
const CARD_TITLE = "serif text-xl leading-tight sm:text-2xl";

/** Chemin de la page boutique filtrée sur un univers. */
const categoryPath = (category: Category) => `/boutique/${encodeURIComponent(category.name)}`;

/**
 * Largeur d'un pas de défilement, lue dans le DOM plutôt que codée en dur :
 * la grille change avec les points de rupture Tailwind, et une valeur figée
 * désaccorderait le défilement dès le premier changement de maquette.
 */
function readStepWidth(track: HTMLElement): number {
  const slides = track.children;
  const first = slides[0] as HTMLElement | undefined;
  if (!first) return 0;
  const second = slides[1] as HTMLElement | undefined;
  return second ? second.offsetLeft - first.offsetLeft : first.offsetWidth;
}

export default function UniverseSlider() {
  const prefersReducedMotion = usePrefersReducedMotion();
  const { data: categories = [], isLoading } = useCategories();

  const trackRef = useRef<HTMLUListElement>(null);
  const [index, setIndex] = useState(0);
  const [lastIndex, setLastIndex] = useState(0);

  // Dernière position atteignable : au bout du rail, la dernière carte est
  // entièrement visible, il reste donc moins de cases que de cartes.
  const measure = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    const step = readStepWidth(track);
    const scrollable = track.scrollWidth - track.clientWidth;
    setLastIndex(step > 0 ? Math.max(0, Math.round(scrollable / step)) : 0);
  }, []);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(track);
    return () => observer.disconnect();
  }, [measure, categories.length]);

  // La position courante est lue sur le rail : le glissement au doigt, les
  // flèches et le défilement automatique alimentent ainsi le même état, sans
  // risque de désaccord entre ce qui est affiché et ce qui est mémorisé.
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    let frame = 0;
    const syncIndex = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const step = readStepWidth(track);
        if (step > 0) setIndex(Math.round(track.scrollLeft / step));
      });
    };
    track.addEventListener("scroll", syncIndex, { passive: true });
    return () => {
      track.removeEventListener("scroll", syncIndex);
      cancelAnimationFrame(frame);
    };
  }, [categories.length]);

  const goTo = useCallback(
    (position: number) => {
      const track = trackRef.current;
      if (!track) return;
      const step = readStepWidth(track);
      const clamped = Math.min(Math.max(position, 0), lastIndex);
      track.scrollTo({ left: clamped * step, behavior: prefersReducedMotion ? "auto" : "smooth" });
    },
    [lastIndex, prefersReducedMotion],
  );

  // Boucle : après la dernière carte on revient au début, et inversement.
  const goToNext = useCallback(() => goTo(index >= lastIndex ? 0 : index + 1), [goTo, index, lastIndex]);
  const goToPrevious = useCallback(() => goTo(index <= 0 ? lastIndex : index - 1), [goTo, index, lastIndex]);

  const { pause, resume } = useAutoplay({
    onTick: goToNext,
    delayMs: AUTOPLAY_MS,
    enabled: lastIndex > 0,
    resetKey: index,
  });

  /**
   * Seul le focus clavier suspend le défilement. Un clic de souris sur une
   * flèche laisse lui aussi le focus sur le bouton : sans cette distinction, la
   * bande resterait figée tant que la visiteuse ne cliquerait pas ailleurs.
   */
  const handleFocus = (event: FocusEvent<HTMLDivElement>) => {
    if ((event.target as HTMLElement).matches(":focus-visible")) pause();
  };

  // Le focus qui passe d'une carte à l'autre reste à l'intérieur du rail :
  // inutile de relancer le défilement, la visiteuse est toujours en train de
  // parcourir la bande au clavier.
  const handleBlur = (event: FocusEvent<HTMLDivElement>) => {
    if (!event.currentTarget.contains(event.relatedTarget)) resume();
  };

  if (!isLoading && categories.length === 0) return null;

  return (
    <section aria-labelledby="nos-univers" className="mx-auto max-w-[1400px] px-5 pt-14 pb-6 md:px-10 md:pt-16 md:pb-8">
      <div className="mb-8 flex items-end justify-between gap-4 md:mb-10">
        <h2 id="nos-univers" className="serif text-[1.4rem] leading-tight sm:text-2xl md:text-3xl">
          Nos univers
        </h2>
        <Link
          to="/boutique"
          className="label-lux hidden shrink-0 items-center gap-2 text-anthracite transition-colors hover:text-gold-deep sm:inline-flex"
        >
          Tout voir <ArrowRight />
        </Link>
      </div>

      <div className="relative" onMouseEnter={pause} onMouseLeave={resume} onFocus={handleFocus} onBlur={handleBlur}>
        <ul
          ref={trackRef}
          tabIndex={0}
          className="no-scrollbar -mx-1.5 flex snap-x snap-mandatory overflow-x-auto scroll-smooth pb-2 outline-none focus-visible:ring-2 focus-visible:ring-gold"
        >
          {isLoading
            ? Array.from({ length: SKELETON_COUNT }, (_, i) => (
                <li key={`skeleton-${i}`} className={SLIDE_WIDTH} aria-hidden>
                  <div className={CARD_SHELL}>
                    <div className={`${THUMB_BOX} mb-4 animate-pulse rounded-md bg-cream-tint`} />
                    <div className={`${CARD_TITLE} mt-auto w-32 animate-pulse rounded bg-cream-tint`}>&nbsp;</div>
                  </div>
                </li>
              ))
            : categories.map((category) => (
                <li key={category.id} className={SLIDE_WIDTH}>
                  <UniverseCard category={category} />
                </li>
              ))}
        </ul>

        {lastIndex > 0 && (
          <>
            <TrackButton side="left" onClick={goToPrevious} label="Univers précédents" />
            <TrackButton side="right" onClick={goToNext} label="Univers suivants" />
          </>
        )}
      </div>

      {lastIndex > 0 && (
        <div className="mt-4 flex justify-center gap-2">
          {Array.from({ length: lastIndex + 1 }, (_, position) => (
            <button
              key={position}
              type="button"
              onClick={() => goTo(position)}
              aria-label={`Afficher les univers, position ${position + 1} sur ${lastIndex + 1}`}
              aria-current={position === index}
              className={`h-1.5 rounded-full transition-all ${
                position === index ? "w-7 bg-ink" : "w-2.5 bg-ink/25 hover:bg-ink/45"
              }`}
            />
          ))}
        </div>
      )}
    </section>
  );
}

/**
 * Une carte d'univers : le visuel, puis le nom qui porte le lien.
 *
 * Toute la carte est cliquable, mais la zone cliquable n'est pas un bloc
 * `onClick` posé sur l'article : c'est un vrai lien, étiré à la surface de la
 * carte par un pseudo-élément. La différence n'est pas cosmétique - un lien
 * s'annonce comme tel aux lecteurs d'écran, s'atteint au clavier, s'ouvre dans
 * un nouvel onglet au clic du milieu et se copie par le menu contextuel, ce
 * qu'un gestionnaire de clic ne sait pas faire.
 */
function UniverseCard({ category }: { category: Category }) {
  return (
    <article
      className={`${CARD_SHELL} group shadow-[0_20px_45px_-28px_rgba(15,15,15,0.55)] transition duration-300 hover:-translate-y-0.5`}
    >
      {/* Visuel décoratif : le nom de l'univers est juste en dessous et porte
          déjà le lien, un texte de remplacement le répéterait inutilement pour
          les lecteurs d'écran. `object-contain` et non `object-cover` : ces
          visuels sont des sacs détourés, les rogner couperait les anses. */}
      <img src={category.image} alt="" loading="lazy" className={`${THUMB_BOX} mb-4 object-contain`} />

      {/* `mt-auto` : si un nom d'univers passe sur deux lignes, les noms des
          cartes voisines restent alignés entre eux. */}
      <h3 className={`${CARD_TITLE} mt-auto text-ink`}>
        {/* Le pseudo-élément couvre la carte entière : c'est lui la zone
            cliquable, et c'est donc lui qu'on entoure au focus clavier. Le
            halo dessiné sur le lien seul n'aurait cerné que le texte, et un
            anneau posé sur l'article ne se déclenche pas de façon fiable. */}
        <Link
          to={categoryPath(category)}
          className="outline-none transition-colors after:absolute after:inset-0 after:rounded-lg after:content-[''] group-hover:text-gold-deep focus-visible:after:outline-2 focus-visible:after:outline-offset-2 focus-visible:after:outline-bordeaux"
        >
          {category.name}
        </Link>
      </h3>
    </article>
  );
}

/** Flèche de commande, posée sur le bord du rail et masquée sur mobile. */
function TrackButton({ side, onClick, label }: { side: "left" | "right"; onClick: () => void; label: string }) {
  const Icon = side === "left" ? ChevronLeft : ChevronRight;
  const placement = side === "left" ? "-left-5 lg:-left-8" : "-right-5 lg:-right-8";

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={`absolute top-1/2 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-cream text-ink shadow-[0_10px_25px_-12px_rgba(15,15,15,0.6)] ring-1 ring-taupe-soft/70 transition-colors hover:bg-gold md:flex ${placement}`}
    >
      <Icon className="text-lg" />
    </button>
  );
}
