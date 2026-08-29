import { api, unwrap } from "./axiosConfig";
import type { User } from "../store/useAuthStore";

export type AuthSession = { user: User; accessToken: string };

export const register = (input: { name: string; phone: string; email?: string; password: string }) =>
  unwrap<AuthSession>(api.post("/auth/register", input));

export const login = (input: { phone: string; password: string }) =>
  unwrap<AuthSession>(api.post("/auth/login", input));

export const logout = () => unwrap<null>(api.post("/auth/logout"));

export const getMe = () => unwrap<User>(api.get("/auth/me"));

export type ProfileInput = {
  name?: string;
  email?: string | null;
  currentPassword?: string;
  newPassword?: string;
};

/**
 * Mise à jour du profil. Le téléphone n'y figure pas : c'est l'identifiant de
 * connexion et la clé de rattachement des commandes, il se change avec l'aide
 * de la boutique.
 */
export const updateProfile = (input: ProfileInput) => unwrap<User>(api.patch("/auth/me", input));
