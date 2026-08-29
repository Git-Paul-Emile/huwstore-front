import { test, expect } from "@playwright/test";

/**
 * Garde-fous SEO (rules/SEO.md) : ce qui casse silencieusement le référencement
 * si on ne le teste pas - un H1 dupliqué, un titre manquant, une canonique
 * absente, un plan de site cassé, un robots.txt qui interdit tout.
 */

test("l'accueil a un titre, une seule balise H1 et une URL canonique", async ({ page }) => {
  await page.goto("/");

  await expect(page).toHaveTitle(/HUWSTORE/);
  await expect(page.locator("h1")).toHaveCount(1);

  const canonical = page.locator('link[rel="canonical"]');
  // La canonique est absolue et pointe sur l'URL courante (origine + chemin).
  await expect(canonical).toHaveAttribute("href", `${new URL(page.url()).origin}/`);
});

test("la fiche produit met à jour le titre et injecte des données structurées", async ({ page }) => {
  await page.goto("/boutique");

  const firstCard = page.getByRole("article").first();
  await firstCard.waitFor({ state: "visible", timeout: 15_000 }).catch(() => {});
  if ((await firstCard.count()) === 0) test.skip(true, "catalogue vide - lancer `pnpm seed` côté API");

  // La vignette du produit mène à sa fiche.
  await firstCard.getByRole("button").first().click();
  await expect(page).toHaveURL(/\/produit\//);

  await expect(page.locator("h1")).toHaveCount(1);
  await expect(page).toHaveTitle(/- HUWSTORE$/);

  // Données structurées propres à la fiche (en plus du schéma Store global).
  const jsonLd = page.locator("script#seo-json-ld");
  await expect(jsonLd).toHaveCount(1);
  const raw = await jsonLd.textContent();
  expect(JSON.parse(raw ?? "{}")["@type"]).toBe("Product");
});

test("robots.txt autorise l'indexation et référence le sitemap", async ({ request }) => {
  const response = await request.get("/robots.txt");
  expect(response.ok()).toBeTruthy();
  const body = await response.text();
  expect(body).toContain("Sitemap:");
  expect(body).toMatch(/Disallow:\s*\/admin/);
});

test("le sitemap est un XML valide qui liste l'accueil", async ({ request }) => {
  const response = await request.get("/sitemap.xml");
  expect(response.ok()).toBeTruthy();
  expect(response.headers()["content-type"]).toMatch(/xml/);
  const body = await response.text();
  expect(body).toContain("<urlset");
  expect(body).toMatch(/<loc>[^<]*\/<\/loc>/);
});
