import { describe, expect, it, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { useSeo } from "./useSeo";

const head = () => document.head;

describe("useSeo", () => {
  beforeEach(() => {
    head()
      .querySelectorAll("meta, link[rel=canonical], script#seo-json-ld")
      .forEach((node) => node.remove());
    document.title = "";
  });

  it("compose le titre avec le nom du site et renseigne Open Graph", () => {
    renderHook(() => useSeo({ title: "Tote bag en coton", description: "Sac du quotidien." }));

    expect(document.title).toBe("Tote bag en coton - HUWSTORE");
    expect(head().querySelector('meta[property="og:title"]')?.getAttribute("content")).toBe(
      "Tote bag en coton - HUWSTORE",
    );
    expect(head().querySelector('meta[name="description"]')?.getAttribute("content")).toBe("Sac du quotidien.");
  });

  it("pose une balise canonical sur l'URL courante", () => {
    renderHook(() => useSeo({ title: "Boutique" }));
    const canonical = head().querySelector('link[rel="canonical"]')?.getAttribute("href");
    expect(canonical).toBe(window.location.origin + window.location.pathname);
  });

  it("ajoute puis retire le noindex selon les pages", () => {
    const { rerender } = renderHook(({ noindex }) => useSeo({ title: "X", noindex }), {
      initialProps: { noindex: true },
    });
    expect(head().querySelector('meta[name="robots"]')?.getAttribute("content")).toBe("noindex, nofollow");

    rerender({ noindex: false });
    expect(head().querySelector('meta[name="robots"]')).toBeNull();
  });

  it("injecte le JSON-LD de la page et le retire au démontage", () => {
    const { unmount } = renderHook(() => useSeo({ title: "Fiche", jsonLd: { "@type": "Product", name: "Tote" } }));
    const script = document.getElementById("seo-json-ld");
    expect(script?.textContent).toContain('"@type":"Product"');

    unmount();
    expect(document.getElementById("seo-json-ld")).toBeNull();
  });
});
