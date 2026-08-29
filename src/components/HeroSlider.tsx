import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useBanners } from "../hooks/useBanners";
import { useAutoplay } from "../hooks/useAutoplay";
import { useLayoutStore } from "../store/useLayoutStore";
import { bannerFocusClass } from "../utils/banner";
import type { Banner } from "../api/banners";
import { ArrowRight } from "./icons";

/**
 * Carrousel d'accueil.
 *
 * Le premier slide est fixe : la vitrine ne doit jamais s'ouvrir sur un
 * carrousel vide tant que la boutique n'a saisi aucune bannière. Les slides
 * suivants viennent des bannières « Hero » ajoutées depuis le back-office
 * (campagnes, promotions) - au plus deux à la fois, cette limite est imposée
 * côté serveur (`banner.service.ts`).
 */
/** Slide fixe : la seule à porter un slogan, mis en évidence en tête du texte. */
type HeroSlide = Banner & { slogan?: string };

const STATIC_SLIDE: HeroSlide = {
  id: "static-hero",
  slogan: "Alliez style et praticité au quotidien.",
  title: "Des sacs façonnés",
  subtitle: "pour durer",
  text: "Toile, coton et cuir polyuréthane sélectionnés pièce par pièce.",
  ctaLabel: "Découvrir la collection",
  ctaHref: "/boutique",
  slot: "Hero",
  target: "Toutes",
  focus: "center",
  position: -1,
  start: "1970-01-01T00:00:00.000Z",
  end: "9999-12-31T00:00:00.000Z",
  active: true,
  image:
    "https://res.cloudinary.com/sbyx9l2f/image/upload/v1787839543/huwstore/products/tote-bag-velours-cotele/noir-marron-1.jpg",
};

const AUTOPLAY_MS = 6000;

export default function HeroSlider() {
  const navigate = useNavigate();
  const headerHeight = useLayoutStore((s) => s.headerHeight);
  const { data: campaigns = [], isLoading } = useBanners("Hero");
  // Le slide statique s'affiche tout de suite ; les campagnes s'ajoutent dès
  // que la requête aboutit, sans jamais vider le carrousel entre-temps.
  const slides: HeroSlide[] = [STATIC_SLIDE, ...(isLoading ? [] : campaigns)];
  const [index, setIndex] = useState(0);

  const goTo = useCallback(
    (next: number) => {
      setIndex(((next % slides.length) + slides.length) % slides.length);
    },
    [slides.length],
  );

  const goToNext = useCallback(() => goTo(index + 1), [goTo, index]);

  const { pause, resume } = useAutoplay({
    onTick: goToNext,
    delayMs: AUTOPLAY_MS,
    enabled: slides.length > 1,
    resetKey: index,
  });

  // Un index peut dépasser après une suppression de bannière côté back-office.
  useEffect(() => {
    if (index >= slides.length) setIndex(0);
  }, [index, slides.length]);

  const slide = slides[index] ?? slides[0];
  const focus = bannerFocusClass(slide.focus);

  return (
    // Hauteur = 90vh moins l'en-tête (bandeau d'annonce compris), mesuré en
    // temps réel par Header via useLayoutStore : les 10 % restants laissent
    // apparaître le haut de la section suivante dès l'arrivée sur le site,
    // pour que la visiteuse comprenne d'emblée qu'il y a du contenu à faire
    // défiler plutôt qu'un écran figé.
    <section
      className="relative w-full overflow-hidden bg-cream"
      style={{ height: `calc(90vh - ${headerHeight}px)` }}
      onMouseEnter={pause}
      onMouseLeave={resume}
    >
      {slides.map((item, i) => (
        <img
          key={item.id}
          src={item.image}
          alt={item.title}
          loading={i === 0 ? "eager" : "lazy"}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${focus} ${
            i === index ? "opacity-100" : "opacity-0"
          }`}
        />
      ))}

      {/* Voile clair côté texte. La photo change à chaque campagne : le voile
          est donc opaque là où le titre s'écrit, pour que le contraste reste
          conforme quelle que soit l'image chargée depuis le back-office. */}
      <div className="absolute inset-0 bg-gradient-to-b from-cream/95 via-cream/70 to-cream/40 md:bg-gradient-to-r md:from-cream md:via-cream/70 md:via-40% md:to-transparent md:to-75%" />

      {/* Fondu vers le fond de page : les cartes « Nos univers » se posent sur
          cette zone claire, leurs ombres y restent lisibles. */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-cream to-transparent" />

      <div className="relative mx-auto flex h-full max-w-[1400px] flex-col justify-center px-5 md:px-10">
        <div key={slide.id} className="max-w-2xl animate-fade-up">
          <h1 className="serif text-[2rem] leading-[1.1] text-ink sm:text-4xl md:text-5xl lg:text-6xl">
            {slide.title}
            {slide.subtitle && (
              <>
                <br />
                <span className="italic">{slide.subtitle}</span>
              </>
            )}
          </h1>
          {(slide.slogan || slide.text) && (
            <p className="mt-5 max-w-md text-sm leading-relaxed text-anthracite md:text-base">
              {slide.slogan && <span className="font-semibold text-bordeaux">{slide.slogan} </span>}
              {slide.text}
            </p>
          )}
          {slide.ctaLabel && (
            <button
              onClick={() => navigate(slide.ctaHref ?? "/boutique")}
              className="label-lux mt-8 inline-flex items-center gap-2 bg-gold px-8 py-4 text-ink transition-colors hover:bg-ink hover:text-cream"
            >
              {slide.ctaLabel} <ArrowRight />
            </button>
          )}
        </div>

        {slides.length > 1 && (
          <div className="mt-10 flex gap-2">
            {slides.map((item, i) => (
              <button
                key={item.id}
                onClick={() => goTo(i)}
                aria-label={`Afficher « ${item.title} »`}
                aria-current={i === index}
                className={`h-1.5 rounded-full transition-all ${i === index ? "w-8 bg-ink" : "w-3 bg-ink/25 hover:bg-ink/45"}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
