import { useMutation } from "@tanstack/react-query";
import { fileToDataUri, uploadImage, type MediaFolder } from "../api/media";

/** 8 Mo : la même limite que celle appliquée par l'API, annoncée plus tôt. */
const MAX_BYTES = 8 * 1024 * 1024;

export function useUploadImage() {
  return useMutation({
    mutationFn: async ({ file, folder, label }: { file: File; folder?: MediaFolder; label?: string }) => {
      if (!file.type.startsWith("image/")) throw new Error("Choisissez une image (JPEG, PNG ou WebP).");
      if (file.size > MAX_BYTES) throw new Error("Image trop lourde : 8 Mo maximum.");

      const dataUri = await fileToDataUri(file);
      return uploadImage(dataUri, folder, label);
    },
  });
}
