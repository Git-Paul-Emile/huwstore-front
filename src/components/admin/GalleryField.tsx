import { useRef, useState } from "react";
import { useUploadImage } from "../../hooks/useUploadImage";
import type { MediaFolder } from "../../api/media";
import { Close, Plus } from "../icons";
import { Btn, Input } from "./ui";

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
}: {
  images: string[];
  onChange: (images: string[]) => void;
  folder?: MediaFolder;
  label?: string;
}) {
  const upload = useUploadImage();
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(0);

  async function addFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setError(null);
    setPending(files.length);

    const uploaded: string[] = [];
    for (const file of Array.from(files)) {
      try {
        const media = await upload.mutateAsync({ file, folder });
        uploaded.push(media.url);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Une image n'a pas pu être envoyée.");
      } finally {
        setPending((count) => count - 1);
      }
    }

    if (uploaded.length > 0) onChange([...images, ...uploaded]);
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
          <Plus /> {pending > 0 ? `Envoi… (${pending})` : "Ajouter des photos"}
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

        {images.length === 0 && (
          <p className="text-xs" style={{ color: "var(--adm-muted)" }}>
            Aucune photo pour ce coloris.
          </p>
        )}
      </div>

      <Input
        placeholder="…ou collez l'adresse d'une image et validez avec Entrée"
        className="mt-2"
        onKeyDown={(e) => {
          if (e.key !== "Enter") return;
          e.preventDefault();
          const value = e.currentTarget.value.trim();
          if (!value) return;
          onChange([...images, value]);
          e.currentTarget.value = "";
        }}
      />

      {error && <p className="mt-1 text-[0.7rem] text-rose-500">{error}</p>}
    </div>
  );
}
