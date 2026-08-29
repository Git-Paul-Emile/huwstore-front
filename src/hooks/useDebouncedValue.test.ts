import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { useDebouncedValue } from "./useDebouncedValue";

/** Avance les minuteurs simulés en laissant React appliquer les mises à jour. */
const tick = (ms: number) => act(() => vi.advanceTimersByTime(ms));

describe("useDebouncedValue", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("renvoie la valeur initiale immédiatement", () => {
    const { result } = renderHook(() => useDebouncedValue("pochette", 300));
    expect(result.current).toBe("pochette");
  });

  it("ne propage la nouvelle valeur qu'après le délai", () => {
    const { result, rerender } = renderHook(({ value }) => useDebouncedValue(value, 300), {
      initialProps: { value: "p" },
    });

    rerender({ value: "poch" });
    expect(result.current).toBe("p");

    tick(299);
    expect(result.current).toBe("p");

    tick(1);
    expect(result.current).toBe("poch");
  });

  it("écrase une frappe en cours : le minuteur repart à chaque changement", () => {
    const { result, rerender } = renderHook(({ value }) => useDebouncedValue(value, 300), {
      initialProps: { value: "p" },
    });

    rerender({ value: "po" });
    tick(200); // le minuteur de "po" n'a pas fini
    rerender({ value: "poc" }); // il est annulé, un nouveau démarre

    tick(200); // 200 ms depuis "poc" : toujours pas propagé
    expect(result.current).toBe("p");

    tick(100); // 300 ms depuis "poc"
    expect(result.current).toBe("poc");
  });
});
