import { useRef, useState } from "react";
import { useUploadImage } from "../../hooks/useUploadImage";
import type { MediaFolder } from "../../api/media";
import { Image, Close } from "../icons";
import { Btn, Input } from "./ui";

/**
 * Classes ecrites en toutes lettres : Tailwind analyse le code source comme du
 * texte, une classe assemblee a l'execution (`object-${fit}`) ne serait jamais
 * generee et l'apercu se retrouverait sans regle du tout.
 */
const FIT_CLASSES = { cover: "object-cover", contain: "object-contain" } as const;

/**
 * Champ image du back-office.
 *
 * C'est la pièce qui rend la boutique autonome : elle choisit une photo sur son
 * ordinateur ou son téléphone, le fichier part sur Cloudinary et l'adresse
 * revient toute seule. Le champ texte reste disponible en dessous pour coller
 * une adresse existante - utile pour réutiliser une image déjà en ligne.
 */
export default function ImageField({
  value,
  onChange,
  folder = "produits",
  label = "Image",
  hint,
  fit = "cover",
}: {
  value: string;
  onChange: (url: string) => void;
  folder?: MediaFolder;
  label?: string;
  hint?: string;
  /**
   * `cover` recadre l'aperçu, ce qui convient aux photos produits. `contain`
   * l'affiche en entier : indispensable pour un sujet détouré, qu'un recadrage
   * amputerait de ses anses.
   */
  fit?: "cover" | "contain";
}) {
  const upload = useUploadImage();
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);

  function pick(file: File | undefined) {
    if (!file) return;
    setError(null);
    upload.mutate(
      { file, folder },
      {
        onSuccess: (media) => onChange(media.url),
        onError: (err) => setError(err instanceof Error ? err.message : "Le téléversement a échoué."),
      },
    );
  }

  return (
    <div>
      <p className="text-xs" style={{ color: "var(--adm-muted)" }}>{label}</p>

      <div className="mt-1.5 flex items-start gap-3">
        <div
          className="grid h-24 w-20 shrink-0 place-items-center overflow-hidden rounded-lg border"
          style={{ borderColor: "var(--adm-border)", background: "var(--adm-surface-2)" }}
        >
          {value ? (
            <img src={value} alt="" className={`h-full w-full ${FIT_CLASSES[fit]}`} />
          ) : (
            <Image className="text-xl" />
          )}
        </div>

        <div className="flex-1">
          <div className="flex flex-wrap gap-2">
            <Btn variant="ghost" onClick={() => inputRef.current?.click()} disabled={upload.isPending}>
              {upload.isPending ? "Envoi en cours…" : value ? "Remplacer la photo" : "Choisir une photo"}
            </Btn>
            {value && (
              <Btn variant="ghost" onClick={() => onChange("")}>
                <Close /> Retirer
              </Btn>
            )}
          </div>

          <input
            ref={inputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/avif"
            className="hidden"
            onChange={(e) => {
              pick(e.target.files?.[0]);
              // Réinitialise pour que choisir DEUX FOIS le même fichier
              // déclenche bien un second envoi.
              e.target.value = "";
            }}
          />

          <Input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="…ou collez l'adresse d'une image déjà en ligne"
            className="mt-2"
          />
          {hint && <p className="mt-1 text-[0.7rem]" style={{ color: "var(--adm-muted)" }}>{hint}</p>}
          {error && <p className="mt-1 text-[0.7rem] text-rose-500">{error}</p>}
        </div>
      </div>
    </div>
  );
}
