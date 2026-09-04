import { test, expect } from "@playwright/test";
import { connexionAdmin, allerA, marque, messageAffiche, IMAGE_FIXTURE } from "./helpers";

/**
 * Gestion du catalogue depuis le back-office.
 *
 * Ces scénarios existent à cause d'un défaut réel : la création de produit
 * échouait en silence. Le formulaire se fermait avant la réponse du serveur et
 * aucun message n'était affiché - la boutique voyait le panneau se refermer,
 * aucun produit n'apparaissait, et rien n'expliquait pourquoi. Chaque test
 * ci-dessous vérifie donc DEUX choses : que l'action aboutit, et qu'elle le
 * DIT. Un écran muet est le défaut que l'on surveille.
 */

test.describe("Catalogue", () => {
  test.beforeEach(async ({ page }) => {
    await connexionAdmin(page);
  });

  test("créer un produit, le retrouver dans la liste, puis l'archiver", async ({ page }) => {
    test.slow();
    const nom = `Sac de test ${marque()}`;

    await allerA(page, /produits/i);
    await page.getByRole("button", { name: /nouveau produit|ajouter un produit/i }).first().click();

    const panneau = page.getByRole("dialog");
    await expect(panneau).toBeVisible();

    await panneau.getByLabel("Nom", { exact: true }).fill(nom);
    await panneau.getByLabel(/catégorie/i).selectOption({ index: 0 });
    await panneau.getByLabel(/matière/i).fill("Toile de test");
    await panneau.getByLabel(/^prix/i).first().fill("7500");
    await panneau.getByLabel(/description/i).fill("Fiche créée par le test de bout en bout.");
    await panneau.getByLabel(/entretien/i).fill("Nettoyer avec un chiffon humide.");
    await panneau.getByLabel(/nom du coloris|couleur/i).first().fill("Noir");

    await panneau.getByRole("button", { name: /créer le produit/i }).click();

    // Le message est la preuve que le serveur a répondu, dans un sens ou dans
    // l'autre. C'est exactement ce qui manquait avant la correction.
    expect(await messageAffiche(page)).toMatch(/produit créé/i);
    await expect(panneau).toBeHidden();
    await expect(page.getByText(nom)).toBeVisible({ timeout: 25_000 });

    // Ménage : le produit d'essai ne doit pas rester dans le catalogue.
    await page.getByRole("row", { name: new RegExp(nom, "i") }).getByRole("button", { name: /archiver/i }).click();
    await page.getByRole("dialog").getByRole("button", { name: /^archiver$/i }).click();
    expect(await messageAffiche(page, /archivé/i)).toMatch(/archivé/i);
  });

  test("un formulaire incomplet dit ce qui manque, et ne se ferme pas", async ({ page }) => {
    await allerA(page, /produits/i);
    await page.getByRole("button", { name: /nouveau produit|ajouter un produit/i }).first().click();

    const panneau = page.getByRole("dialog");
    await panneau.getByLabel("Nom", { exact: true }).fill("Fiche volontairement incomplète");
    await panneau.getByRole("button", { name: /créer le produit/i }).click();

    // Ni fermeture silencieuse, ni bouton grisé sans explication : on nomme les
    // champs manquants, sinon la boutique ne peut pas deviner ce qui bloque.
    await expect(panneau).toBeVisible();
    // `.last()` : le premier « Il manque… » est l'aide en direct, le second le
    // refus affiché au clic. Les deux prouvent que l'écran ne se ferme pas en silence.
    await expect(panneau.getByText(/il manque/i).last()).toBeVisible();
  });

  test("un prix saisi avec un espace est refusé, et la saisie est conservée", async ({ page }) => {
    const nom = `Prix mal saisi ${marque()}`;
    await allerA(page, /produits/i);
    await page.getByRole("button", { name: /nouveau produit|ajouter un produit/i }).first().click();

    const panneau = page.getByRole("dialog");
    await panneau.getByLabel("Nom", { exact: true }).fill(nom);
    await panneau.getByLabel(/catégorie/i).selectOption({ index: 0 });
    await panneau.getByLabel(/matière/i).fill("Toile");
    await panneau.getByLabel(/^prix/i).first().fill("12 000");
    await panneau.getByLabel(/description/i).fill("Description.");
    await panneau.getByLabel(/entretien/i).fill("Entretien.");
    await panneau.getByLabel(/nom du coloris|couleur/i).first().fill("Noir");
    await panneau.getByRole("button", { name: /créer le produit/i }).click();

    await expect(panneau.getByText(/prix en chiffres entiers/i).last()).toBeVisible();
    // La saisie survit au refus : c'est le point qui faisait tout retaper.
    await expect(panneau.getByLabel("Nom", { exact: true })).toHaveValue(nom);
  });

  test("créer une catégorie, la retrouver en vitrine, puis la supprimer", async ({ page }) => {
    // Téléversement Cloudinary + création + rafraîchissement de liste + suppression,
    // le tout contre une base distante : on triple les délais.
    test.slow();
    const nom = `Univers ${marque()}`;

    await allerA(page, /catégories/i);
    await page.getByRole("button", { name: /nouvelle catégorie|ajouter/i }).first().click();

    const panneau = page.getByRole("dialog");
    await panneau.getByLabel("Nom", { exact: true }).fill(nom);

    // Un univers exige un visuel : on téléverse le fichier de test et on attend
    // que l'aperçu confirme l'envoi avant de valider.
    await panneau.locator('input[type="file"]').setInputFiles(IMAGE_FIXTURE);
    await expect(panneau.getByRole("button", { name: /remplacer la photo/i })).toBeVisible({ timeout: 30_000 });

    await panneau.getByRole("button", { name: /créer la catégorie/i }).click();

    expect(await messageAffiche(page, /catégorie créée/i)).toMatch(/créée/i);

    // Rechargement : on repart d'une liste fraîche du serveur, sans dépendre du
    // rafraîchissement en arrière-plan de TanStack Query.
    await page.reload();
    await expect(page.getByText(nom)).toBeVisible({ timeout: 25_000 });

    await page.getByRole("row", { name: new RegExp(nom, "i") }).getByRole("button", { name: /supprimer/i }).click();
    await page.getByRole("dialog").getByRole("button", { name: /^supprimer$/i }).click();
    // Une catégorie qui porte des produits ne DOIT pas disparaître en silence :
    // le message dit alors pourquoi la suppression est refusée.
    expect(await messageAffiche(page, /supprimée|impossible/i)).toMatch(/supprimée|impossible/i);
  });
});
