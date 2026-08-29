import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import ErrorBoundary from "./ErrorBoundary";
import { monitoring } from "../lib/monitoring";

function Boom(): never {
  throw new Error("composant cassé");
}

describe("ErrorBoundary", () => {
  it("affiche les enfants quand tout va bien", () => {
    render(
      <ErrorBoundary>
        <p>contenu normal</p>
      </ErrorBoundary>,
    );
    expect(screen.getByText("contenu normal")).toBeInTheDocument();
  });

  it("affiche l'écran de repli et signale l'erreur au monitoring", () => {
    const capture = vi.spyOn(monitoring, "captureException").mockImplementation(() => {});
    // React journalise l'erreur interceptée : on tait ce bruit attendu.
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});

    render(
      <ErrorBoundary>
        <Boom />
      </ErrorBoundary>,
    );

    expect(screen.getByRole("heading", { name: /une erreur est survenue/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /recharger/i })).toBeInTheDocument();
    expect(capture).toHaveBeenCalledOnce();

    capture.mockRestore();
    consoleError.mockRestore();
  });
});
