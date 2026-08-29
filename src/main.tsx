import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AppRoutes } from "./routes/AppRoutes";
import ErrorBoundary from "./components/ErrorBoundary";
import { monitoring } from "./lib/monitoring";
import "./index.css";

/** Fraîcheur par défaut des données serveur avant refetch (TanStack Query). */
const QUERY_STALE_TIME_MS = 30_000;

monitoring.init();

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: QUERY_STALE_TIME_MS, retry: 1 } },
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </QueryClientProvider>
    </ErrorBoundary>
  </React.StrictMode>,
);
