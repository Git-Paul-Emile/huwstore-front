import { api, unwrap } from "./axiosConfig";
import type { User } from "../store/useAuthStore";

export type AuthSession = { user: User; accessToken: string };

export const register = (input: { name: string; phone: string; email?: string; password: string }) =>
  unwrap<AuthSession>(api.post("/auth/register", input));

export const login = (input: { phone: string; password: string }) =>
  unwrap<AuthSession>(api.post("/auth/login", input));

export const logout = () => unwrap<null>(api.post("/auth/logout"));

export const getMe = () => unwrap<User>(api.get("/auth/me"));
