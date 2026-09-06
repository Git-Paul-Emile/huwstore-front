import { useRef, useState } from "react";
import { useUploadImage } from "../../hooks/useUploadImage";
import type { MediaFolder } from "../../api/media";
import { Close, Plus, Spinner } from "../icons";
import { Btn } from "./ui";

/**
 * Galerie photo d'une déclinaison couleur.
 *
 * La première image est celle qui s'affiche sur la carte produit, la deuxième
 * apparaît au survol : l'ordre compte, on le rend donc modifiable.
 *
 * Plusieurs fichiers peuvent être choisis d'un coup, mais ils sont envoyés
 * **un par un** : un envoi qui échoue ne fait alors pas perdre les autres.
 */
export default function GalleryField({
  images,
  onChange,
  folder = "produits",
  label = "Photos",
  onBusyChange,
}: {
  images: string[];
  onChange: (images: string[]) => void;
  folder?: MediaFolder;
  label?: string;
  /**
   * Signale au formulaire parent qu'un envoi est en cours : il bloque alors
   * l'enregistrement tant qu'une photo n'est pas arrivée sur Cloudinary.
   */
  onBusyChange?: (busy: boolean) => void;
}) {
  const upload = useUploadImage();
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(0);

  async function addFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setError(null);
    setPending(files.length);
    onBusyChange?.(true);

    const uploaded: string[] = [];
    let failure: string | null = null;
    for (const file of Array.from(files)) {
      try {
        const media = await upload.mutateAsync({ file, folder });
        uploaded.push(media.url);
      } catch (err) {
        failure = err instanceof Error ? err.message : "Une image n'a pas pu être envoyée.";
      } finally {
        setPending((count) => count - 1);
      }
    }

    if (failure) setError(failure);
    if (uploaded.length > 0) onChange([...images, ...uploaded]);
    onBusyChange?.(false);
  }

  const move = (from: number, to: number) => {
    if (to < 0 || to >= images.length) return;
    const next = [...images];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    onChange(next);
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs" style={{ color: "var(--adm-muted)" }}>
          {label} <span className="opacity-70">- la 1ʳᵉ est la photo principale, la 2ᵉ s'affiche au survol</span>
        </p>
        <Btn variant="ghost" onClick={() => inputRef.current?.click()} disabled={pending > 0}>
          {pending > 0 ? <Spinner /> : <Plus />}
          {pending > 0 ? `Envoi en cours… (${pending})` : "Ajouter des photos"}
        </Btn>
      </div>

      <input
        ref={inputRef}
        type="file"
        multiple
        accept="image/png,image/jpeg,image/webp,image/avif"
        className="hidden"
        onChange={(e) => {
          void addFiles(e.target.files);
          e.target.value = "";
        }}
      />

      <div className="mt-2 flex flex-wrap gap-2">
        {images.map((url, index) => (
          <div
            key={`${url}-${index}`}
            className="relative h-24 w-20 overflow-hidden rounded-lg border"
            style={{ borderColor: "var(--adm-border)" }}
          >
            <img src={url} alt="" className="h-full w-full object-cover" />
            <button
              type="button"
              onClick={() => onChange(images.filter((_, i) => i !== index))}
              aria-label="Retirer cette photo"
              className="absolute right-1 top-1 grid h-6 w-6 place-items-center rounded-full bg-black/60 text-white"
            >
              <Close />
            </button>
            <div className="absolute inset-x-0 bottom-0 flex justify-between bg-black/55 text-[0.65rem] text-white">
              <button type="button" onClick={() => move(index, index - 1)} className="px-2 py-0.5 disabled:opacity-30" disabled={index === 0}>
                ‹
              </button>
              <span className="py-0.5">{index + 1}</span>
              <button
                type="button"
                onClick={() => move(index, index + 1)}
                className="px-2 py-0.5 disabled:opacity-30"
                disabled={index === images.length - 1}
              >
                ›
              </button>
            </div>
          </div>
        ))}

        {/* Une tuile de chargement par fichier encore en route : la boutique voit
            que l'envoi travaille, et à quel emplacement la photo va se poser. */}
        {Array.from({ length: pending }).map((_, index) => (
          <div
            key={`pending-${index}`}
            className="grid h-24 w-20 place-items-center rounded-lg border"
            style={{ borderColor: "var(--adm-border)", background: "var(--adm-surface-2)", color: "var(--adm-muted)" }}
          >
            <Spinner className="text-lg" />
          </div>
        ))}

        {images.length === 0 && pending === 0 && (
          <p className="text-xs" style={{ color: "var(--adm-muted)" }}>
            Aucune photo pour ce coloris.
          </p>
        )}
      </div>

      {error && (
        <p className="mt-2 rounded-lg border-l-2 border-rose-500 bg-rose-500/5 px-3 py-2 text-xs text-rose-600">
          {error} La photo n'a pas été ajoutée : réessayez, le produit ne peut pas être enregistré sans elle.
        </p>
      )}
    </div>
  );
}
