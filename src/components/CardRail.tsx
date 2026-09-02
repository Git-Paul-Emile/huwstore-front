import { useCallback, useEffect, useRef, useState, type FocusEvent, type ReactNode } from "react";
import { useAutoplay } from "../hooks/useAutoplay";
import { useMarqueeScroll } from "../hooks/useMarqueeScroll";
import { usePrefersReducedMotion } from "../hooks/usePrefersReducedMotion";
import { ChevronLeft, ChevronRight } from "./icons";

/**
 * Rail de cartes horizontal, partagé par « Nos univers », les rangees de
 * produits et les temoignages.
 *
 * Les cartes defilent sur un rail a défilement natif plutôt que sur un rail
 * déplacé en JavaScript : le glissement au doigt, l'inertie et l'accroche sont
 * alors ceux du navigateur, donc corrects sur tous les mobiles sans une ligne
 * de code. Le JavaScript ne sert plus qu'à deux choses, faire avancer le rail
 * tout seul quand on le lui demande et lire la position courante pour les
 * puces.
 *
 * Ce composant ne connaît rien du contenu des cartes : il reçoit une liste de
 * nœuds déjà construits. C'est ce qui permet aux trois sections d'avoir la
 * même mecanique de défilement sans la réécrire - et une correction faite ici
 * profite aux trois.
 */
type CardRailProps = {
  /** Une entrée par case du rail. */
  slides: ReactNode[];
  /** Classes de largeur d'une case, par point de rupture. */
  slideWidth: string;
  /** Intitulé lu par les lecteurs d'écran pour le rail lui-même. */
  label: string;
  /**
   * Délai du défilement pas à pas. Absent = le rail n'avance pas tout seul.
   * Sans effet quand `continuousPxPerSecond` est fourni : un rail ne peut pas
   * à la fois glisser sans fin et s'arrêter sur chaque case.
   */
  autoplayMs?: number;
  /**
   * Vitesse d'un glissement CONTINU, en pixels par seconde. Le rail ne
   * s'arrête alors jamais entre deux cartes et boucle sans fin : ses cartes
   * sont dupliquées, et la seconde série est masquée aux lecteurs d'écran et
   * au clavier pour ne pas annoncer deux fois le même catalogue.
   */
  continuousPxPerSecond?: number;
  /** Libellés des flèches, adaptés au contenu ("Univers précédents"...). */
  previousLabel: string;
  nextLabel: string;
};

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

export default function CardRail({
  slides,
  slideWidth,
  label,
  autoplayMs,
  continuousPxPerSecond,
  previousLabel,
  nextLabel,
}: CardRailProps) {
  const isContinuous = continuousPxPerSecond !== undefined && slides.length > 0;
  const prefersReducedMotion = usePrefersReducedMotion();
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
  }, [measure, slides.length]);

  // La position courante est lue sur le rail : le glissement au doigt, les
  // flèches et le défilement automatique alimentent ainsi le même état, sans
  // risque de désaccord entre ce qui est affiche et ce qui est mémorisé.
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
  }, [slides.length]);

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

  const stepped = useAutoplay({
    onTick: goToNext,
    delayMs: autoplayMs ?? 0,
    enabled: !isContinuous && autoplayMs !== undefined && lastIndex > 0,
    resetKey: index,
  });

  const marquee = useMarqueeScroll({
    trackRef,
    pixelsPerSecond: continuousPxPerSecond ?? 0,
    enabled: isContinuous,
  });

  const { pause, resume } = isContinuous ? marquee : stepped;

  /**
   * En mode continu, une flèche donne un coup de pouce : on suspend le
   * glissement, on laisse le navigateur faire le déplacement en douceur, puis
   * on relance. Sans la pause, l'animation et le glissement se disputeraient
   * la position à chaque image.
   */
  const nudge = useCallback(
    (direction: 1 | -1) => {
      const track = trackRef.current;
      if (!track) return;
      pause();
      track.scrollBy({ left: direction * readStepWidth(track), behavior: prefersReducedMotion ? "auto" : "smooth" });
      window.setTimeout(resume, 700);
    },
    [pause, prefersReducedMotion, resume],
  );

  /**
   * Seul le focus clavier suspend le défilement. Un clic de souris sur une
   * fleche laisse lui aussi le focus sur le bouton : sans cette distinction, la
   * bande resterait figée tant que la visiteuse ne cliquerait pas ailleurs.
   */
  const handleFocus = (event: FocusEvent<HTMLDivElement>) => {
    if ((event.target as HTMLElement).matches(":focus-visible")) pause();
  };

  // Le focus qui passe d'une carte à l'autre reste a l'intérieur du rail :
  // inutile de relancer le défilement, la visiteuse est toujours en train de
  // parcourir la bande au clavier.
  const handleBlur = (event: FocusEvent<HTMLDivElement>) => {
    if (!event.currentTarget.contains(event.relatedTarget)) resume();
  };

  return (
    <>
      <div className="relative" onMouseEnter={pause} onMouseLeave={resume} onFocus={handleFocus} onBlur={handleBlur}>
        <ul
          ref={trackRef}
          tabIndex={0}
          aria-label={label}
          onPointerDown={pause}
          onPointerUp={resume}
          onPointerCancel={resume}
          // Ni accroche ni défilement adouci en mode continu : les deux
          // corrigeraient la position à chaque image et feraient trembler le
          // rail au lieu de le laisser glisser.
          className={`no-scrollbar -mx-1.5 flex overflow-x-auto pb-2 outline-none focus-visible:ring-2 focus-visible:ring-gold ${
            isContinuous ? "" : "snap-x snap-mandatory scroll-smooth"
          }`}
        >
          {slides.map((slide, position) => (
            <li key={position} className={slideWidth}>
              {slide}
            </li>
          ))}

          {/* Seconde série, identique : c'est elle qui rend la boucle continue.
              `aria-hidden` et `inert` la retirent des lecteurs d'écran et du
              parcours au clavier - sans quoi la visiteuse traverserait deux
              fois le même catalogue. */}
          {isContinuous &&
            slides.map((slide, position) => (
              <li key={`boucle-${position}`} className={slideWidth} aria-hidden inert>
                {slide}
              </li>
            ))}
        </ul>

        {(isContinuous || lastIndex > 0) && (
          <>
            <TrackButton
              side="left"
              onClick={isContinuous ? () => nudge(-1) : goToPrevious}
              label={previousLabel}
            />
            <TrackButton side="right" onClick={isContinuous ? () => nudge(1) : goToNext} label={nextLabel} />
          </>
        )}
      </div>

      {/* Pas de puces en mode continu : le rail n'a pas de position d'arrêt,
          une puce « courante » n'y voudrait rien dire. */}
      {!isContinuous && lastIndex > 0 && (
        <div className="mt-5 flex justify-center gap-2">
          {Array.from({ length: lastIndex + 1 }, (_, position) => (
            <button
              key={position}
              type="button"
              onClick={() => goTo(position)}
              aria-label={`${label}, position ${position + 1} sur ${lastIndex + 1}`}
              aria-current={position === index}
              className={`h-1.5 rounded-full transition-all ${
                position === index ? "w-7 bg-ink" : "w-2.5 bg-ink/25 hover:bg-ink/45"
              }`}
            />
          ))}
        </div>
      )}
    </>
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
