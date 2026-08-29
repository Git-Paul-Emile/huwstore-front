import { Component, type ErrorInfo, type ReactNode } from "react";
import { monitoring } from "../lib/monitoring";

type Props = { children: ReactNode };
type State = { hasError: boolean };

/**
 * Frontière d'erreur au-dessus des routes (rules/frontend.md, observability.md).
 *
 * Sans elle, une exception dans un composant démonte toute l'application et
 * laisse une page blanche. Ici on affiche un écran de repli lisible, on
 * signale l'erreur au monitoring, et on propose de recharger.
 */
export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    monitoring.captureException(error, { componentStack: info.componentStack });
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
        <h1 className="text-2xl font-semibold text-ink">Une erreur est survenue</h1>
        <p className="max-w-md text-sm text-taupe">
          Quelque chose s'est mal passé de notre côté. Rechargez la page&nbsp;; si le problème persiste, contactez-nous.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="rounded-full bg-ink px-6 py-2.5 text-sm text-cream transition-colors hover:bg-anthracite"
        >
          Recharger la page
        </button>
      </div>
    );
  }
}
