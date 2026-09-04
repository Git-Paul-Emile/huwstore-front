import { fileURLToPath } from "node:url";
import { expect, type Page } from "@playwright/test";

/** Petite image carrée servie aux formulaires qui exigent un visuel. */
export const IMAGE_FIXTURE = fileURLToPath(new URL("./fixtures/univers.png", import.meta.url));

/**
 * Outils partagés par les scénarios du back-office.
 *
 * Ces tests parlent à une VRAIE base : ils créent des données et les nettoient
 * derrière eux. Chaque objet créé porte donc un nom horodaté, pour qu'un test
 * interrompu ne bloque jamais le suivant sur un doublon, et pour qu'on
 * reconnaisse au premier coup d'œil ce qui vient d'un essai.
 */

/** Compte de gestion créé par `npm run seed` (back/prisma/seed.ts). */
export const ADMIN = {
  phone: process.env.E2E_ADMIN_PHONE ?? "709666259",
  password: process.env.E2E_ADMIN_PASSWORD ?? process.env.ADMIN_PASSWORD ?? "huwstore2026",
};

/** Suffixe unique : deux exécutions ne se marchent jamais dessus. */
export const marque = () => `E2E-${Date.now().toString().slice(-8)}`;

/**
 * Numéro sénégalais valide et quasi unique, pour créer un compte de test à
 * chaque exécution sans buter sur « ce numéro est déjà pris ».
 */
export const telephoneTest = () => `77${Date.now().toString().slice(-7)}`;

/**
 * Ouvre le back-office en session administrateur.
 *
 * La garde `RequireAdmin` affiche son propre formulaire : on ne passe donc pas
 * par la fenêtre de connexion de la vitrine. Si le compte n'existe pas, le test
 * s'arrête ici avec un message explicite plutôt que d'échouer vingt lignes plus
 * loin sur un bouton introuvable.
 */
export async function connexionAdmin(page: Page) {
  await page.goto("/admin");

  const tableauDeBord = page.getByRole("heading", { name: /tableau de bord/i });
  if (await tableauDeBord.isVisible().catch(() => false)) return;

  const formulaire = page.getByRole("heading", { name: /back-office/i });
  await expect(formulaire, "l'écran de connexion du back-office ne s'affiche pas").toBeVisible();

  await page.getByLabel(/téléphone/i).fill(ADMIN.phone);
  // Intitulé exact : /mot de passe/i attraperait aussi le bouton
  // « Afficher le mot de passe » posé dans le champ.
  await page.getByLabel("Mot de passe", { exact: true }).fill(ADMIN.password);
  await page.getByRole("button", { name: /se connecter/i }).click();

  await expect(
    page.getByRole("link", { name: /tableau de bord/i }),
    `connexion refusée pour ${ADMIN.phone} - la base est-elle amorcée (npm run seed) ?`,
  ).toBeVisible({ timeout: 15_000 });
}

/** Va sur un écran du back-office par son entrée de menu. */
export async function allerA(page: Page, entree: RegExp) {
  await page.getByRole("link", { name: entree }).click();
}

/**
 * Attend qu'un message de confirmation ou d'erreur s'affiche, et le renvoie.
 *
 * C'est le point de contrôle central de ces tests : depuis la correction du
 * 03/09, TOUTE écriture du back-office affiche un message, en succès comme en
 * échec. Un écran qui ne dit rien est désormais un défaut, et ces tests
 * échouent si le silence revient.
 *
 * Les toasts vivent 3 secondes : quand une action en suit une autre, celui de
 * la première peut encore être là. Passer `attendu` cible alors le message
 * voulu au lieu du plus ancien encore visible.
 */
export async function messageAffiche(page: Page, attendu?: RegExp): Promise<string> {
  const toasts = page.locator("div.pointer-events-auto");
  const message = attendu ? toasts.filter({ hasText: attendu }) : toasts;
  await expect(message.first()).toBeVisible({ timeout: 15_000 });
  return (await message.first().textContent()) ?? "";
}
