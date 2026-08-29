import { useEffect, useState } from "react";

/**
 * Retarde la propagation d'une valeur qui change vite.
 *
 * Cas d'usage : la recherche. Sans ce délai, taper « pochette » déclenche huit
 * requêtes réseau, dont sept sont déjà obsolètes en arrivant - c'est lourd
 * pour le serveur et lent en 3G. On n'interroge l'API qu'une fois la frappe
 * retombée (rules/frontend.md, « Debounce pour la recherche »).
 */
export function useDebouncedValue<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(value), delay);
    return () => window.clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}
