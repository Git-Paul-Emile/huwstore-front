import { useEffect, useState } from "react";
import { usePrefersReducedMotion } from "../hooks/usePrefersReducedMotion";
import { ArrowUp } from "./icons";

/**
 * Retour en haut de page, posé juste au-dessus du widget WhatsApp.
 *
 * Le bouton ne s'affiche qu'une fois la page suffisamment défilée : proposé dès
 * le haut, il ne servirait à rien et surchargerait le coin de l'écran. Le seuil
 * est volontairement bas (une hauteur d'écran) pour rester utile sur mobile.
 *
 * Si le visiteur a demandé à limiter les animations, le retour est instantané
 * (WCAG 2.3.3), sinon il est fluide.
 */
const SEUIL_AFFICHAGE_PX = 600;

export default function ScrollTopButton() {
  const [visible, setVisible] = useState(false);
  const prefersReducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    const sync = () => setVisible(window.scrollY > SEUIL_AFFICHAGE_PX);
    sync();
    window.addEventListener("scroll", sync, { passive: true });
    return () => window.removeEventListener("scroll", sync);
  }, []);

  if (!visible) return null;

  return (
    <button
      onClick={() =>
        window.scrollTo({ top: 0, behavior: prefersReducedMotion ? "auto" : "smooth" })
      }
      aria-label="Revenir en haut de la page"
      className="fixed bottom-23 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full border border-taupe/25 bg-cream text-ink shadow-[0_12px_30px_-12px_rgba(15,15,15,0.5)] transition-colors hover:bg-ink hover:text-cream active:scale-95 animate-fade-up"
    >
      <ArrowUp className="text-xl" />
    </button>
  );
}
