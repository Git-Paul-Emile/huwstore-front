import { test, expect } from "@playwright/test";
import { marque, telephoneTest } from "./helpers";

/**
 * Parcours cliente jusqu'à la commande.
 *
 * C'est le seul chemin qui produit du chiffre d'affaires : il est testé de
 * bout en bout, création de compte et panier compris, jusqu'au reçu. La
 * commande exige désormais un compte (la commande en invite a été retirée), et
 * passe en paiement à la livraison - aucun paiement n'est simulé, il n'y en a
 * pas.
 */

test("une cliente crée un compte depuis le panier et passe commande", async ({ page }) => {
  await page.goto("/boutique");

  // Première fiche réellement commandable (une fiche en rupture affiche « Épuisé »).
  const carte = page
    .getByRole("article")
    .filter({ has: page.getByRole("button", { name: "Ajouter au panier" }) })
    .first();
  await carte.waitFor({ state: "visible", timeout: 15_000 }).catch(() => {});
  if ((await carte.count()) === 0) test.skip(true, "catalogue vide - lancer npm run seed");

  await carte.getByRole("button", { name: /ajouter au panier/i }).click();

  // Le tiroir invite une visiteuse non connectée à ouvrir un compte.
  const tiroir = page.getByRole("complementary");
  await expect(tiroir.getByRole("heading", { name: /panier/i })).toBeVisible();
  await tiroir.getByRole("button", { name: /se connecter pour commander/i }).click();

  // Inscription dans la fenêtre de connexion.
  const suffixe = marque();
  await page.getByRole("button", { name: /créer un compte/i }).click();
  await page.getByLabel("Nom complet", { exact: true }).fill(`Cliente ${suffixe}`);
  await page.getByLabel("Téléphone", { exact: true }).fill(telephoneTest());
  await page.getByLabel("Mot de passe", { exact: true }).fill("motdepasse-e2e");
  await page.getByRole("checkbox", { name: /j'accepte/i }).check();
  await page.getByRole("button", { name: /créer mon compte/i }).click();

  // La fenêtre se ferme dès que la session est ouverte.
  await expect(page.getByRole("button", { name: /créer mon compte/i })).toBeHidden({ timeout: 15_000 });

  // Panier rouvert : la cliente est maintenant connectée, le bouton mène au tunnel.
  await page.getByRole("button", { name: "Panier" }).first().click();
  await page.getByRole("complementary").getByRole("button", { name: /finaliser ma commande/i }).click();
  await expect(page).toHaveURL(/\/commande/);

  // Nom et téléphone sont pré-remplis depuis le compte ; il reste la livraison.
  await page.getByLabel(/zone de livraison/i).selectOption({ index: 1 });
  await page.getByLabel(/adresse/i).fill("Test E2E, Dakar");

  // Les conditions générales doivent être lisibles ICI : la commande vaut
  // acceptation, la phrase serait fausse sans le lien. `.first()` cible celui
  // du tunnel, avant celui du pied de page.
  await expect(page.getByRole("link", { name: /conditions générales/i }).first()).toBeVisible();

  await page.getByRole("button", { name: /confirmer ma commande/i }).click();

  await expect(page).toHaveURL(/\/commande\//, { timeout: 20_000 });
  await expect(page.getByRole("heading", { name: /votre commande est enregistrée/i })).toBeVisible();
});

test("les pages légales s'ouvrent depuis le pied de page", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("link", { name: /conditions générales/i })).toBeVisible();
  await expect(page.getByRole("link", { name: /politique de confidentialité/i })).toBeVisible();

  await page.goto("/cgu");
  await expect(page.getByRole("heading", { level: 1, name: /conditions générales/i })).toBeVisible();

  await page.goto("/confidentialite");
  await expect(page.getByRole("heading", { level: 1, name: /confidentialité/i })).toBeVisible();
});

test("le catalogue se filtre et la recherche répond", async ({ page }) => {
  await page.goto("/boutique?q=sac");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  // Une recherche sans résultat doit le dire, pas afficher une page vide muette.
  await page.goto("/boutique?q=zzzintrouvable");
  await expect(page.getByText(/aucun|rien/i).first()).toBeVisible({ timeout: 15_000 });
});
