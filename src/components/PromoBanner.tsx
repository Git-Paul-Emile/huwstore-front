import { useState } from "react";
import { Link } from "react-router-dom";
import { useBanners } from "../hooks/useBanners";
import { useAutoplay } from "../hooks/useAutoplay";
import { ArrowRight } from "./icons";

/**
 * Campagnes en cours, alimentées par les bannières « Bandeau promo » du
 * back-office.
 *
 * Le serveur ne renvoie que les bannières actives ET dans leur fenêtre de
 * diffusion : si la section s'affiche, c'est qu'au moins une campagne court
 * vraiment. Jusqu'à trois peuvent tourner en même temps, le bandeau les fait
 * alors défiler l'une après l'autre.
 */

/**
 * Au-delà de cet horizon, la date de fin n'apporte plus rien : une échéance à
 * six mois ne crée aucune urgence, et une bannière ouverte jusqu'en 9999 - le
 * cas des campagnes sans fin réelle - afficherait une date absurde.
 */
const HORIZON_ECHEANCE_JOURS = 90;
const MS_PAR_JOUR = 24 * 60 * 60 * 1000;

/** Durée d'affichage d'une campagne avant le passage à la suivante. */
const AUTOPLAY_MS = 7000;

/** « 30 septembre », ou rien si l'échéance est trop lointaine ou déjà passée. */
function echeanceLisible(fin: string): string | null {
  const date = new Date(fin);
  if (Number.isNaN(date.getTime())) return null;

  const jours = (date.getTime() - Date.now()) / MS_PAR_JOUR;
  if (jours < 0 || jours > HORIZON_ECHEANCE_JOURS) return null;

  return date.toLocaleDateString("fr-FR", { day: "numeric", month: "long" });
}

export default function PromoBanner() {
  const { data: banners = [] } = useBanners("Bandeau promo");
  const [index, setIndex] = useState(0);

  // Le nombre de campagnes peut baisser entre deux chargements (une campagne
  // qui expire) : on ramène toujours l'index dans les bornes avant de lire.
  const current = banners.length > 0 ? index % banners.length : 0;

  const autoplay = useAutoplay({
    onTick: () => setIndex((i) => (i + 1) % banners.length),
    delayMs: AUTOPLAY_MS,
    enabled: banners.length > 1,
    resetKey: current,
  });

  const banner = banners[current];
  if (!banner) return null;

  const echeance = echeanceLisible(banner.end);

  return (
    <section
      aria-labelledby="campagne"
      aria-roledescription={banners.length > 1 ? "carrousel" : undefined}
      className="mx-auto max-w-[1400px] px-5 md:px-10"
      onMouseEnter={autoplay.pause}
      onMouseLeave={autoplay.resume}
      onFocusCapture={autoplay.pause}
      onBlurCapture={autoplay.resume}
    >
      {/* Coins arrondis et espace latéral : le bandeau se pose comme une carte
          sur le fond de page plutôt que de courir bord à bord. */}
      <div className="relative overflow-hidden rounded-2xl bg-ink text-cream">
        {/* Visuel : en tête sur mobile, où l'on fait défiler et où la photo
            accroche mieux qu'un titre ; à droite et sur toute la hauteur à
            partir de `lg`, où il tient le rôle d'aplat plutôt que de vignette
            posée. */}
        <div className="relative lg:absolute lg:inset-y-0 lg:right-0 lg:w-[46%]">
          <img
            key={banner.id}
            src={banner.image}
            alt=""
            loading="lazy"
            className="aspect-[4/3] w-full object-cover object-center sm:aspect-[2/1] lg:aspect-auto lg:h-full"
          />
          {/* Raccord avec le fond : sans ce dégradé, la photo se termine par une
              arête franche au milieu de la section. */}
          <div
            aria-hidden
            className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-ink to-transparent lg:inset-y-0 lg:right-auto lg:h-auto lg:w-48 lg:bg-gradient-to-r"
          />
        </div>

        <div className="relative px-5 md:px-10">
          <div className="py-10 md:py-14 lg:min-h-[20rem] lg:w-1/2 lg:py-16 lg:pr-12">
            {echeance && <p className="label-lux text-gold">{`Jusqu'au ${echeance}`}</p>}

            <h2 id="campagne" className="serif text-xl leading-tight sm:text-2xl md:text-3xl">
              {banner.title}
              {banner.subtitle && (
                <>
                  <br />
                  <span className="italic text-gold">{banner.subtitle}</span>
                </>
              )}
            </h2>

            {banner.text && <p className="mt-5 max-w-md text-sm leading-relaxed text-cream/75">{banner.text}</p>}

            {banner.ctaLabel && (
              <Link
                to={banner.ctaHref ?? "/boutique"}
                className="group mt-8 inline-flex items-center gap-3 bg-gold px-8 py-4 text-ink transition-colors hover:bg-cream focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cream"
              >
                <span className="label-lux">{banner.ctaLabel}</span>
                <ArrowRight className="text-base transition-transform group-hover:translate-x-1" />
              </Link>
            )}

            {banners.length > 1 && (
              <div className="mt-8 flex gap-2" role="group" aria-label="Choisir une campagne">
                {banners.map((b, i) => (
                  <button
                    key={b.id}
                    type="button"
                    aria-label={`Campagne ${i + 1} : ${b.title}`}
                    aria-current={i === current}
                    onClick={() => setIndex(i)}
                    className={`h-1.5 rounded-full transition-all ${i === current ? "w-6 bg-gold" : "w-2 bg-cream/30 hover:bg-cream/50"}`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
