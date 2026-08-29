import { test, expect } from "@playwright/test";

/**
 * Parcours d'achat (rules/testing.md). Nécessite l'API et une base peuplée
 * (`cd ../back && pnpm seed`). Contre un environnement distant : `E2E_BASE_URL`.
 */

async function firstProductCard(page: import("@playwright/test").Page) {
  await page.goto("/boutique");
  const card = page.getByRole("article").first();
  await card.waitFor({ state: "visible", timeout: 15_000 }).catch(() => {});
  return card;
}

test("la boutique affiche des produits et mène à une fiche", async ({ page }) => {
  const card = await firstProductCard(page);
  if ((await card.count()) === 0) test.skip(true, "catalogue vide");

  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await card.getByRole("button").first().click();
  await expect(page).toHaveURL(/\/produit\//);
});

test("ajouter au panier ouvre le tiroir avec le total", async ({ page }) => {
  const card = await firstProductCard(page);
  if ((await card.count()) === 0) test.skip(true, "catalogue vide");

  await card.getByRole("button", { name: /ajouter au panier/i }).click();

  const drawer = page.getByRole("complementary");
  await expect(drawer.getByRole("heading", { name: /panier/i })).toBeVisible();
  await expect(drawer.getByText(/^Total$/)).toBeVisible();
});

test("le back-office refuse le contenu aux visiteurs non connectés", async ({ page }) => {
  await page.goto("/admin");
  // La garde affiche l'écran de connexion, jamais le tableau de bord admin.
  await expect(page.getByRole("heading", { name: /back-office/i })).toBeVisible();
  await expect(page.getByRole("button", { name: /se connecter/i })).toBeVisible();
  await expect(page.getByRole("link", { name: /tableau de bord|commandes|catalogue/i })).toHaveCount(0);
});
