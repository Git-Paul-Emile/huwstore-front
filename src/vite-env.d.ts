/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Base de l'API, version comprise (ex. http://localhost:8000/api/v1). */
  readonly VITE_API_URL: string;
  /** DSN Sentry. Vide tant que le monitoring n'est pas branché. */
  readonly VITE_SENTRY_DSN?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
