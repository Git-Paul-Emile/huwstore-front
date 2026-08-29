/**
 * Point de collecte des erreurs côté client (rules/observability.md).
 *
 * Tout passe par `captureException` plutôt que par le SDK directement.
 * `init()` est appelée une fois dans `main.tsx`, avant le rendu. Le DSN vient
 * de l'environnement : sans `VITE_SENTRY_DSN`, Sentry reste éteint (dev local).
 */
import * as Sentry from "@sentry/react";

const dsn = import.meta.env.VITE_SENTRY_DSN;
const isDev = import.meta.env.DEV;

export const monitoring = {
  init(): void {
    if (!dsn) return;
    Sentry.init({
      dsn,
      environment: import.meta.env.MODE,
      // Traces de performance : 10 % suffisent pour une vitrine.
      tracesSampleRate: 0.1,
      // Pas d'IP ni de données personnelles envoyées à un tiers.
      sendDefaultPii: false,
    });
  },

  captureException(error: unknown, context: Record<string, unknown> = {}): void {
    if (isDev) console.error("[monitoring]", error, context);
    if (dsn) Sentry.captureException(error, { extra: context });
  },

  get enabled(): boolean {
    return Boolean(dsn);
  },
};
