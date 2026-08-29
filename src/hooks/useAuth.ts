import { useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { login, logout, register, updateProfile, type ProfileInput } from "../api/auth";
import { restoreSession } from "../api/axiosConfig";
import { useAuthStore } from "../store/useAuthStore";

export function useLogin() {
  const setSession = useAuthStore((s) => s.setSession);
  return useMutation({ mutationFn: login, onSuccess: setSession });
}

export function useRegister() {
  const setSession = useAuthStore((s) => s.setSession);
  return useMutation({ mutationFn: register, onSuccess: setSession });
}

export function useLogout() {
  const clearSession = useAuthStore((s) => s.logout);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: logout,
    // Les données déjà chargées (commandes, favoris, adresses) appartiennent au
    // compte qui se déconnecte : on vide le cache, sinon elles resteraient
    // visibles pour la personne suivante sur le même navigateur.
    onSuccess: () => {
      clearSession();
      queryClient.clear();
    },
  });
}

/** Met à jour le profil ET la session en mémoire, pour que l'écran suive. */
export function useUpdateProfile() {
  const setUser = useAuthStore((s) => s.setSession);
  const accessToken = useAuthStore((s) => s.accessToken);
  return useMutation({
    mutationFn: (input: ProfileInput) => updateProfile(input),
    onSuccess: (user) => {
      if (accessToken) setUser({ user, accessToken });
    },
  });
}

/**
 * Restaure la session une seule fois, au démarrage de l'application.
 *
 * Tant que l'appel n'a pas répondu, `status` vaut "loading" : les écrans
 * protégés attendent au lieu de rediriger une personne pourtant connectée.
 */
export function useRestoreSession() {
  const status = useAuthStore((s) => s.status);

  useEffect(() => {
    void restoreSession();
  }, []);

  return status;
}
