import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * React Router ne réinitialise jamais le défilement entre deux pages : sans ce
 * composant, ouvrir une fiche produit depuis le bas de la boutique l'affichait
 * encore scrollée à mi-page. Les liens d'ancrage (`/#section`) sont laissés de
 * côté : c'est `Home` qui gère leur défilement une fois la section chargée.
 */
export default function ScrollToTop() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) return;
    window.scrollTo(0, 0);
  }, [pathname, hash]);

  return null;
}
