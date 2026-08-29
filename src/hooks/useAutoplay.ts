import { useCallback, useEffect, useRef, useState } from "react";
import { usePrefersReducedMotion } from "./usePrefersReducedMotion";

type AutoplayOptions = {
  /** Action déclenchée à chaque échéance (passer au slide suivant). */
  onTick: () => void;
  /** Durée d'affichage d'une position, en millisecondes. */
  delayMs: number;
  /** Faux quand le défilement n'a pas lieu d'être : une seule position. */
  enabled: boolean;
  /**
   * Valeur qui change à chaque déplacement, manuel comme automatique. Le
   * minuteur repart alors de zéro : sans cela, un clic juste avant l'échéance
   * enchaînerait deux transitions coup sur coup.
   */
  resetKey: unknown;
};

type Autoplay = {
  /** Suspend le défilement (survol, focus clavier, doigt posé sur le rail). */
  pause: () => void;
  /** Reprend le défilement là où il s'était arrêté. */
  resume: () => void;
  /** Vrai quand le minuteur tourne réellement : sert à l'état des commandes. */
  isRunning: boolean;
};

/**
 * Minuteur de défilement automatique, partagé par tous les carrousels.
 *
 * Le hook ne connaît ni le nombre de slides ni la façon de les afficher : il
 * se contente de rappeler `onTick` à intervalle régulier tant que le
 * défilement est autorisé. Chaque carrousel garde donc sa propre mécanique
 * d'affichage (fondu enchaîné, rail à défilement) sans dupliquer la gestion du
 * minuteur, de la pause et de l'accessibilité.
 */
export function useAutoplay({ onTick, delayMs, enabled, resetKey }: AutoplayOptions): Autoplay {
  const prefersReducedMotion = usePrefersReducedMotion();
  const [isPaused, setIsPaused] = useState(false);
  const latestOnTick = useRef(onTick);

  // Le rappel est relu au moment de l'échéance : le minuteur n'a pas à être
  // recréé chaque fois que le composant parent se rend à nouveau.
  useEffect(() => {
    latestOnTick.current = onTick;
  }, [onTick]);

  useEffect(() => {
    if (!enabled || isPaused || prefersReducedMotion) return;
    const timer = window.setTimeout(() => latestOnTick.current(), delayMs);
    return () => window.clearTimeout(timer);
  }, [enabled, isPaused, prefersReducedMotion, delayMs, resetKey]);

  const pause = useCallback(() => setIsPaused(true), []);
  const resume = useCallback(() => setIsPaused(false), []);

  return { pause, resume, isRunning: enabled && !isPaused && !prefersReducedMotion };
}
