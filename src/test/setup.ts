import "@testing-library/jest-dom/vitest";
import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";

// Chaque test repart d'un DOM propre.
afterEach(() => cleanup());

// jsdom n'implémente pas matchMedia : plusieurs composants (autoplay, préférence
// de mouvement réduit) l'interrogent au montage.
if (!window.matchMedia) {
  window.matchMedia = ((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  })) as typeof window.matchMedia;
}
