import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getSettings, updateSettings, type Settings, type SettingsInput } from "../api/settings";

/**
 * Paramètres de la boutique, lus par le pied de page, le widget WhatsApp et le
 * bandeau d'annonce. Ils changent rarement : on les garde longtemps en cache
 * plutôt que de les redemander à chaque navigation.
 */
export const useSettings = () =>
  useQuery({ queryKey: ["settings"], queryFn: getSettings, staleTime: 10 * 60 * 1000 });

export function useUpdateSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: SettingsInput) => updateSettings(input),
    onSuccess: (settings) => queryClient.setQueryData<Settings>(["settings"], settings),
  });
}

/**
 * Valeurs de repli le temps que les paramètres arrivent.
 *
 * Elles ne servent qu'à éviter un écran cassé pendant la première fraction de
 * seconde : les champs de contact restent VIDES plutôt que d'afficher un
 * numéro codé en dur qui pourrait être faux.
 */
const FALLBACK: Settings = {
  shopName: "HUWSTORE",
  phone: "",
  whatsapp: "",
  city: "",
  country: "",
  siteAvailable: true,
};

/** Paramètres toujours définis : évite un `?.` dans chaque composant. */
export function useShop(): Settings {
  const { data } = useSettings();
  return data ?? FALLBACK;
}
