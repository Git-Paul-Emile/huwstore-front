import { useRef, useState } from "react";
import { useUploadVideo } from "../../hooks/useUploadImage";
import type { MediaFolder } from "../../api/media";
import { Close } from "../icons";
import { Btn } from "./ui";

/**
 * Champ vidéo du back-office.
 *
 * Même principe que `ImageField` : la boutique choisit un fichier sur son
 * appareil, il part sur Cloudinary et s'affiche aussitôt en aperçu. Aucune
 * adresse de vidéo n'est jamais saisie à la main.
 */
export default function VideoField({
  value,
  onChange,
  folder = "produits",
  label = "Vidéo",
  hint,
}: {
  value: string;
  onChange: (url: string) => void;
  folder?: MediaFolder;
  label?: string;
  hint?: string;
}) {
  const upload = useUploadVideo();
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
          className="grid h-24 w-32 shrink-0 place-items-center overflow-hidden rounded-lg border text-[0.7rem]"
          style={{ borderColor: "var(--adm-border)", background: "var(--adm-surface-2)", color: "var(--adm-muted)" }}
        >
          {value ? (
            <video src={value} className="h-full w-full object-cover" muted playsInline preload="metadata" />
          ) : (
            "Aucune vidéo"
          )}
        </div>

        <div className="flex-1">
          <div className="flex flex-wrap gap-2">
            <Btn variant="ghost" onClick={() => inputRef.current?.click()} disabled={upload.isPending}>
              {upload.isPending ? "Envoi en cours…" : value ? "Remplacer la vidéo" : "Choisir une vidéo"}
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
            accept="video/mp4,video/webm"
            className="hidden"
            onChange={(e) => {
              pick(e.target.files?.[0]);
              e.target.value = "";
            }}
          />

          <p className="mt-2 text-[0.7rem]" style={{ color: "var(--adm-muted)" }}>
            {hint ?? "MP4 ou WebM, 40 Mo maximum. Videz pour retirer la vidéo."}
          </p>
          {error && <p className="mt-1 text-[0.7rem] text-rose-500">{error}</p>}
        </div>
      </div>
    </div>
  );
}
