import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";
import { useAuthStore, type User } from "../store/useAuthStore";
import type { PageMeta, Paginated } from "../data";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  // Indispensable : c'est ce qui joint le cookie de rafraîchissement.
  withCredentials: true,
});

/** Lit un cookie non HttpOnly - ici le jeton anti-CSRF posé à la connexion. */
function readCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) config.headers.Authorization = `Bearer ${token}`;

  // Le serveur exige ce couple cookie + en-tête sur les routes authentifiées
  // par cookie (/auth/refresh, /auth/logout) : c'est la protection CSRF.
  const csrf = readCookie("mw-csrf");
  if (csrf) config.headers["X-CSRF-Token"] = csrf;

  return config;
});

/**
 * Renouvellement silencieux du jeton d'accès.
 *
 * Le jeton ne vit que 15 minutes. Plutôt que de déconnecter la cliente en
 * pleine commande, on rejoue une fois la requête après avoir demandé un
 * nouveau jeton. La promesse est mise en cache le temps de l'appel : dix
 * requêtes qui échouent en même temps ne déclenchent qu'un seul renouvellement.
 */
let refreshing: Promise<string | null> | null = null;

async function refreshSession(): Promise<string | null> {
  refreshing ??= (async () => {
    try {
      // Appel direct : passer par api/auth.ts créerait une dépendance circulaire
      // entre ce fichier et celui qui l'importe.
      const response = await api.post<{ data: { user: User; accessToken: string } }>("/auth/refresh");
      const session = response.data.data;
      useAuthStore.getState().setSession(session);
      return session.accessToken;
    } catch {
      useAuthStore.getState().logout();
      return null;
    } finally {
      // Libéré au tick suivant : les requêtes en attente ont déjà lu la promesse.
      setTimeout(() => {
        refreshing = null;
      }, 0);
    }
  })();

  return refreshing;
}

/**
 * Restaure la session au chargement de l'application.
 *
 * Le jeton d'accès vit en mémoire : après un rafraîchissement de page, il n'y
 * a plus rien. Cet appel demande au serveur d'en émettre un nouveau à partir du
 * cookie HttpOnly. S'il échoue, la visiteuse est simplement anonyme.
 */
export async function restoreSession(): Promise<void> {
  // Le cookie anti-CSRF est posé en même temps que le cookie de session : son
  // absence signifie qu'il n'y a rien à restaurer. On évite ainsi un appel
  // refusé à chaque première visite d'un visiteur non connecté.
  if (!readCookie("mw-csrf")) {
    useAuthStore.getState().setStatus("anonymous");
    return;
  }

  const token = await refreshSession();
  if (!token) useAuthStore.getState().setStatus("anonymous");
}

/** Marque une requête déjà rejouée : on ne boucle jamais sur un 401 persistant. */
type RetriableConfig = InternalAxiosRequestConfig & { _retried?: boolean };

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const config = error.config as RetriableConfig | undefined;
    const isAuthRoute = config?.url?.includes("/auth/");

    if (error.response?.status === 401 && config && !config._retried && !isAuthRoute) {
      config._retried = true;
      const token = await refreshSession();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        return api.request(config);
      }
    }

    return Promise.reject(error);
  },
);

type ApiEnvelope<T> = { status: string; message: string; data: T; meta?: PageMeta };

/** Extrait la ressource de l'enveloppe API. */
export async function unwrap<T>(promise: Promise<{ data: ApiEnvelope<T> }>): Promise<T> {
  const response = await promise;
  return response.data.data;
}

/**
 * Variante pour les collections paginées : rend les éléments ET les
 * métadonnées, au lieu de perdre la pagination en route.
 */
export async function unwrapPage<T>(promise: Promise<{ data: ApiEnvelope<T[]> }>): Promise<Paginated<T>> {
  const response = await promise;
  const { data, meta } = response.data;
  return {
    items: data,
    meta: meta ?? { page: 1, limit: data.length, total: data.length, totalPages: 1, hasNext: false, hasPrev: false },
  };
}

/** Message d'erreur lisible, quelle que soit la forme de la réponse serveur. */
export function readApiError(error: unknown, fallback: string): string {
  const message = (error as { response?: { data?: { message?: string } } })?.response?.data?.message;
  return message ?? fallback;
}
