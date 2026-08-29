import { defineConfig, devices } from "@playwright/test";

/**
 * Tests de bout en bout (rules/testing.md, « parcours critiques en E2E »).
 *
 * `pnpm e2e:install` télécharge Chromium la première fois. `pnpm e2e` démarre
 * (ou réutilise) l'API sur :8000 et le front sur :5173, puis joue les scénarios
 * de `e2e/`. Il faut donc une base peuplée : `cd ../back && pnpm seed` au moins
 * une fois.
 *
 * `E2E_BASE_URL` permet de viser un environnement déjà déployé (préproduction) :
 * dans ce cas aucun serveur local n'est lancé.
 */
const useRemote = Boolean(process.env.E2E_BASE_URL);
// localhost (et non 127.0.0.1) : c'est l'origine autorisée par le CORS de l'API
// en développement (CLIENT_URL).
const baseURL = process.env.E2E_BASE_URL ?? "http://localhost:5173";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL,
    trace: "on-first-retry",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: useRemote
    ? undefined
    : [
        {
          command: "npm --prefix ../back run dev",
          url: "http://localhost:8000/health",
          timeout: 120_000,
          reuseExistingServer: !process.env.CI,
        },
        {
          command: "pnpm dev",
          url: baseURL,
          timeout: 120_000,
          reuseExistingServer: !process.env.CI,
        },
      ],
});
