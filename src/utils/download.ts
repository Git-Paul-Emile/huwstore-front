/**
 * Télécharge un fichier renvoyé par l'API.
 *
 * Le navigateur ne peut pas enregistrer directement une réponse HTTP : on la
 * transforme en URL temporaire, on simule un clic, puis on RÉVOQUE l'URL -
 * sans cela le fichier reste en mémoire tant que l'onglet est ouvert.
 */
export function downloadBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);
}

/** Suffixe de date des fichiers exportés, ex. « commandes-2026-08-28.csv ». */
export const stampedName = (base: string, extension = "csv") =>
  `${base}-${new Date().toISOString().slice(0, 10)}.${extension}`;
