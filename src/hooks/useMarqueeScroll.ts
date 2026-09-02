import { useCallback, useEffect, useRef, useState, type RefObject } from "react";
import { usePrefersReducedMotion } from "./usePrefersReducedMotion";

type MarqueeOptions = {
  /** Rail à faire glisser. Son contenu doit être dupliqué DEUX fois à l'identique. */
  trackRef: RefObject<HTMLElement | null>;
  /** Vitesse de glissement, en pixels par seconde. */
  pixelsPerSecond: number;
  /** Faux quand le glissement n'a pas lieu d'être (rail vide). */
  enabled: boolean;
};

type Marquee = {
  /** Suspend le glissement (survol, focus clavier, doigt posé sur le rail). */
  pause: () => void;
  /** Reprend le glissement là où il s'était arrêté. */
  resume: () => void;
};

/**
 * Glissement continu et sans fin d'un rail, façon bandeau défilant.
 *
 * À ne pas confondre avec `useAutoplay`, qui fait AVANCER un rail d'une case
 * toutes les N secondes : ici le rail ne s'arrête jamais entre deux cartes, il
 * glisse en permanence à vitesse constante. C'est la différence entre un
 * diaporama et un tapis roulant.
 *
 * La boucle est obtenue en dupliquant le contenu : le rail contient deux fois
 * la meme suite de cartes, et dès que le défilement a parcouru la première
 * moitié on retranche cette moitié à la position. Comme les deux moitiés sont
 * identiques au pixel près, le saut est invisible - et il n'y a jamais de
 * retour en arrière visible comme avec un rail qui rembobine.
 *
 * Le glissement s'appuie sur `scrollLeft`, la position de défilement native du
 * navigateur, et non sur une transformation CSS : le rail reste donc un rail
 * que l'on peut attraper au doigt, et le doigt garde la priorité sur
 * l'animation.
 */
export function useMarqueeScroll({ trackRef, pixelsPerSecond, enabled }: MarqueeOptions): Marquee {
  const prefersReducedMotion = usePrefersReducedMotion();
  const [isPaused, setIsPaused] = useState(false);
  const pauseCount = useRef(0);

  const isRunning = enabled && !isPaused && !prefersReducedMotion;

  useEffect(() => {
    if (!isRunning) return;
    const track = trackRef.current;
    if (!track) return;

    let frame = 0;
    let previous = 0;

    /**
     * Position tenue par nous, en nombre à virgule, et non relue sur le rail à
     * chaque image. À cette vitesse un pas vaut moins d'un pixel : si le
     * navigateur arrondit `scrollLeft` et qu'on repart de sa valeur arrondie,
     * le pas est perdu à chaque image et le rail ne bouge jamais. On garde
     * donc notre propre compteur et on ne fait que l'écrire.
     *
     * Il est relu sur le rail au démarrage - donc aussi à chaque reprise après
     * une pause -, ce qui rattrape le déplacement fait au doigt entre-temps.
     */
    let offset = track.scrollLeft;

    const step = (now: number) => {
      const half = track.scrollWidth / 2;
      // `previous` vaut zéro à la toute première image : on ne connaît pas
      // encore la durée écoulée, on se contente de la mémoriser.
      if (previous && half > 0) {
        offset += (pixelsPerSecond * (now - previous)) / 1000;
        // Les deux moitiés étant identiques, franchir la limite dans un sens
        // ou dans l'autre se corrige en ajoutant ou retranchant une moitié.
        if (offset >= half) offset -= half;
        else if (offset <= 0) offset += half;
        track.scrollLeft = offset;
      }
      previous = now;
      frame = requestAnimationFrame(step);
    };

    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [isRunning, pixelsPerSecond, trackRef]);

  /**
   * Les causes de pause se cumulent : la souris peut survoler le rail pendant
   * qu'un doigt le tient. Un simple booléen ferait repartir le rail au premier
   * relâchement, alors qu'une autre cause est toujours active - on compte donc
   * les demandes plutôt que de les écraser.
   */
  const pause = useCallback(() => {
    pauseCount.current += 1;
    setIsPaused(true);
  }, []);

  const resume = useCallback(() => {
    pauseCount.current = Math.max(0, pauseCount.current - 1);
    if (pauseCount.current === 0) setIsPaused(false);
  }, []);

  return { pause, resume };
}
