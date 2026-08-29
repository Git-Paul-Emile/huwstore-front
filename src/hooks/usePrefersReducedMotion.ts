import { useEffect, useState } from "react";

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

/**
 * Indique si le visiteur a demandé à son système de limiter les animations.
 *
 * Un défilement qui se déclenche tout seul provoque des vertiges chez une
 * partie du public. Quand ce réglage est actif, l'animation ne doit pas être
 * ralentie mais supprimée : c'est le critère WCAG 2.2.2 (Pause, Stop, Hide).
 */
export function usePrefersReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(
    () => window.matchMedia(REDUCED_MOTION_QUERY).matches,
  );

  useEffect(() => {
    const media = window.matchMedia(REDUCED_MOTION_QUERY);
    const sync = () => setPrefersReducedMotion(media.matches);
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  return prefersReducedMotion;
}
