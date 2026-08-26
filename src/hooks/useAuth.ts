import { useMutation } from "@tanstack/react-query";
import { login, logout, register } from "../api/auth";
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
  return useMutation({ mutationFn: logout, onSuccess: clearSession });
}
