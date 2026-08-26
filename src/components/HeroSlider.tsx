import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, ChevronDown } from "./icons";

type Slide = {
  img: string;
  alt: string;
  eyebrow: string;
  title: React.ReactNode;
  text: string;
  cta: string;
};

const img = (id: string) => `https://images.unsplash.com/photo-${id}?w=1600&h=1100&fit=crop&auto=format`;

const slides: Slide[] = [
  {
    img: img("1560891958-68bb1fe7fb78"),
    alt: "Femme tenant un sac en cuir bleu",
    eyebrow: "Collection Automne 2026",
    title: <>L'élégance<br /><span className="italic">se façonne à la main</span></>,
    text: "Des sacs intemporels nés dans nos ateliers parisiens, où chaque couture raconte un savoir-faire.",
    cta: "Découvrir la collection",
  },
  {
    img: img("1637759292654-a12cb2be085e"),
    alt: "Sac à main en cuir fauve avec longue bandoulière",
    eyebrow: "Édition limitée · Ligne Nappa",
    title: <>Le cuir nappa,<br /><span className="italic">jusqu'à −20%</span></>,
    text: "Une sélection de nos peaux les plus précieuses, à prix atelier pendant quelques jours seulement.",
    cta: "Profiter de l'offre",
  },
  {
    img: img("1683921470299-b8f0f3331657"),
    alt: "Main tenant un sac en cuir gris",
    eyebrow: "Maison Aurélie",
    title: <>Le geste juste,<br /><span className="italic">transmis depuis 1987</span></>,
    text: "Chaque pièce naît de la main d'un seul artisan, du choix de la peau au dernier point sellier.",
    cta: "Découvrir la maison",
  },
];

export default function HeroSlider() {
  const navigate = useNavigate();
  const [i, setI] = useState(0);
  const timer = useRef<ReturnType<typeof setInterval> | undefined>(undefined);

  const go = useCallback((n: number) => setI((n + slides.length) % slides.length), []);

  const reset = useCallback(() => {
    if (timer.current) clearInterval(timer.current);
    timer.current = setInterval(() => setI((p) => (p + 1) % slides.length), 6000);
  }, []);

  useEffect(() => {
    reset();
    return () => { if (timer.current) clearInterval(timer.current); };
  }, [reset]);

  const select = (n: number) => { go(n); reset(); };

  return (
    <section className="relative">
      <div className="relative h-[72vh] min-h-[480px] w-full overflow-hidden bg-bottle sm:h-[80vh] lg:h-[86vh] lg:min-h-[560px]">
        {/* Slides */}
        {slides.map((s, idx) => (
          <div
            key={idx}
            className={`absolute inset-0 transition-opacity duration-[900ms] ease-in-out ${idx === i ? "opacity-100" : "pointer-events-none opacity-0"}`}
            aria-hidden={idx !== i}
          >
            <img
              src={s.img}
              alt={s.alt}
              className={`h-full w-full object-cover object-center transition-transform duration-[7000ms] ease-out ${idx === i ? "scale-105" : "scale-100"}`}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-ink/70 via-ink/25 to-transparent" />
            <div className="absolute inset-0 mx-auto flex max-w-[1400px] flex-col justify-center px-6 md:px-10">
              {idx === i && (
                <div key={i} className="max-w-xl animate-fade-up">
                  <p className="label-lux text-gold">{s.eyebrow}</p>
                  <h1 className="serif mt-3 text-[2rem] leading-[1.1] text-cream sm:mt-4 sm:text-5xl md:text-6xl">{s.title}</h1>
                  <p className="mt-4 max-w-md text-sm leading-relaxed text-cream/80 sm:mt-5 md:text-base">{s.text}</p>
                  <button
                    onClick={() => navigate("/boutique")}
                    className="group mt-6 inline-flex items-center gap-3 bg-gold px-6 py-3.5 text-ink transition-all hover:bg-gold-deep sm:mt-8 sm:px-8 sm:py-4"
                  >
                    <span className="label-lux">{s.cta}</span>
                    <ArrowRight className="text-base transition-transform group-hover:translate-x-1" />
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Flèches */}
        <button
          onClick={() => select(i - 1)}
          aria-label="Slide précédent"
          className="absolute left-4 top-1/2 hidden h-12 w-12 -translate-y-1/2 place-items-center rounded-full border border-cream/40 text-xl text-cream backdrop-blur-sm transition-colors hover:border-gold hover:text-gold md:grid"
        >
          <ArrowRight className="rotate-180" />
        </button>
        <button
          onClick={() => select(i + 1)}
          aria-label="Slide suivant"
          className="absolute right-4 top-1/2 hidden h-12 w-12 -translate-y-1/2 place-items-center rounded-full border border-cream/40 text-xl text-cream backdrop-blur-sm transition-colors hover:border-gold hover:text-gold md:grid"
        >
          <ArrowRight />
        </button>

        {/* Puces */}
        <div className="absolute bottom-7 left-1/2 flex -translate-x-1/2 items-center gap-3">
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => select(idx)}
              aria-label={`Aller au slide ${idx + 1}`}
              className="group relative h-2.5 py-2"
            >
              <span
                className={`block h-[3px] rounded-full transition-all duration-500 ${idx === i ? "w-10 bg-gold" : "w-5 bg-cream/50 group-hover:bg-cream"}`}
              />
            </button>
          ))}
        </div>

        {/* Indicateur de défilement */}
        <div className="absolute bottom-6 right-8 hidden flex-col items-center gap-1 text-cream/60 lg:flex">
          <span className="label-lux text-[0.55rem]">Défiler</span>
          <ChevronDown className="animate-bounce text-lg" />
        </div>
      </div>
    </section>
  );
}
