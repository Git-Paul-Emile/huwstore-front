import { api, unwrap } from "./axiosConfig";

export type MediaFolder = "produits" | "categories" | "bannieres" | "temoignages";

export type Media = { url: string; publicId: string; width: number; height: number };

/**
 * Téléverse une image depuis le back-office.
 *
 * Le fichier part encodé en base64 dans le corps JSON : la boutique choisit une
 * photo sur son ordinateur ou son téléphone, sans jamais manipuler d'URL. Le
 * serveur le dépose sur Cloudinary et renvoie l'adresse définitive.
 */
export const uploadImage = (file: string, folder: MediaFolder = "produits", label?: string) =>
  unwrap<Media>(api.post("/media", { file, folder, label }));

/** Lit un fichier choisi dans un <input type="file"> et le convertit en data URI. */
export function fileToDataUri(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Le fichier n'a pas pu être lu."));
    reader.readAsDataURL(file);
  });
}
