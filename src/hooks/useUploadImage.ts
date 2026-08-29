import { useMutation } from "@tanstack/react-query";
import { fileToDataUri, uploadMedia, type MediaFolder } from "../api/media";

/** Mêmes plafonds que ceux appliqués par l'API. */
const MAX_IMAGE_BYTES = 8 * 1024 * 1024;
const MAX_VIDEO_BYTES = 40 * 1024 * 1024;

type UploadArgs = { file: File; folder?: MediaFolder; label?: string };

export function useUploadImage() {
  return useMutation({
    mutationFn: async ({ file, folder, label }: UploadArgs) => {
      if (!file.type.startsWith("image/")) throw new Error("Choisissez une image (JPEG, PNG ou WebP).");
      if (file.size > MAX_IMAGE_BYTES) throw new Error("Image trop lourde : 8 Mo maximum.");

      return uploadMedia(await fileToDataUri(file), folder, label);
    },
  });
}

export function useUploadVideo() {
  return useMutation({
    mutationFn: async ({ file, folder, label }: UploadArgs) => {
      if (!file.type.startsWith("video/")) throw new Error("Choisissez une vidéo (MP4 ou WebM).");
      if (file.size > MAX_VIDEO_BYTES) throw new Error("Vidéo trop lourde : 40 Mo maximum.");

      return uploadMedia(await fileToDataUri(file), folder, label);
    },
  });
}
