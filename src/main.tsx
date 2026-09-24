import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { QueryClient } from "@tanstack/react-query";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister";
import { AppRoutes } from "./routes/AppRoutes";
import ErrorBoundary from "./components/ErrorBoundary";
import { monitoring } from "./lib/monitoring";
import "./index.css";

/** Fraîcheur par défaut des données serveur avant refetch (TanStack Query). */
const QUERY_STALE_TIME_MS = 30_000;

/**
 * Le cache est écrit dans le `localStorage` et relu au démarrage : après une
 * première visite, un rechargement affiche les dernières données connues tout
 * de suite, pendant que TanStack Query revalide en arrière-plan. Sans ça, le
 * cache vit en mémoire et chaque F5 repart sur un écran de chargement.
 */
const PERSIST_MAX_AGE_MS = 24 * 60 * 60 * 1000;

/**
 * Bump ce jeton quand la forme d'une réponse cachée change (nouveau champ
 * attendu par l'UI) : un cache d'une version antérieure est alors jeté au lieu
 * d'être réhydraté.
 */
const CACHE_BUSTER = "v3";

/**
 * Seules les données publiques du catalogue sont persistées. Les données
 * personnelles ou d'administration (commandes, clientes, stock, favoris,
 * session) restent en mémoire et disparaissent à la fermeture de l'onglet.
 */
const PERSISTED_QUERY_KEYS = new Set(["products", "categories", "banners", "testimonials", "settings"]);

/** Une vue back-office (`{ all: true }`) n'est jamais persistée, même sur une clé autorisée. */
const isAdminView = (queryKey: readonly unknown[]) =>
  queryKey.some((part) => typeof part === "object" && part !== null && "all" in part);

monitoring.init();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: QUERY_STALE_TIME_MS,
      // Le cache persisté doit survivre à la session : sans un gcTime long, une
      // query inactive est nettoyée au bout de 5 min et n'est jamais réécrite.
      gcTime: PERSIST_MAX_AGE_MS,
      retry: 1,
    },
  },
});

const persister = createSyncStoragePersister({
  storage: window.localStorage,
  key: "huwstore-query-cache",
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <PersistQueryClientProvider
        client={queryClient}
        persistOptions={{
          persister,
          maxAge: PERSIST_MAX_AGE_MS,
          buster: CACHE_BUSTER,
          dehydrateOptions: {
            shouldDehydrateQuery: (query) =>
              query.state.status === "success" &&
              PERSISTED_QUERY_KEYS.has(query.queryKey[0] as string) &&
              !isAdminView(query.queryKey),
          },
        }}
      >
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </PersistQueryClientProvider>
    </ErrorBoundary>
  </React.StrictMode>,
);
