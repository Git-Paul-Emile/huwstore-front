import { useEffect, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";

/**
 * Garde d'accès des écrans réservés à une cliente connectée : le tunnel de
 * commande et le reçu. La commande sans compte n'est plus ouverte.
 *
 * L'API refuse déjà ces routes sans jeton : ce composant respecte cette règle
 * côté écran, comme `RequireAdmin` pour le back-office. Trois états :
 *  - session en cours de restauration : on attend ;
 *  - personne non connectée : on invite à se connecter (fenêtre `AuthModal`) ;
 *  - connectée : on affiche l'écran demandé.
 */
export default function RequireAuth({ children }: { children: ReactNode }) {
  const status = useAuthStore((s) => s.status);
  const user = useAuthStore((s) => s.user);
  const setAuthOpen = useAuthStore((s) => s.setAuthOpen);

  const anonymous = status === "anonymous" && !user;

  // Ouvre la fenêtre de connexion dès qu'on constate l'absence de session.
  useEffect(() => {
    if (anonymous) setAuthOpen(true);
  }, [anonymous, setAuthOpen]);

  if (status === "loading") {
    return (
      <div className="grid min-h-[50vh] place-items-center text-sm text-taupe">Vérification de votre session…</div>
    );
  }

  if (anonymous) {
    return (
      <section className="mx-auto max-w-md px-5 py-24 text-center">
        <h1 className="serif text-2xl md:text-3xl">Connectez-vous pour continuer</h1>
        <p className="mt-3 text-sm text-taupe">
          La commande se fait avec un compte : il garde vos adresses et l'historique de vos commandes.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <button
            type="button"
            onClick={() => setAuthOpen(true)}
            className="label-lux bg-ink px-8 py-4 text-cream transition-colors hover:bg-anthracite"
          >
            Se connecter ou créer un compte
          </button>
          <Link
            to="/boutique"
            className="label-lux border border-ink px-8 py-4 text-ink transition-colors hover:bg-ink hover:text-cream"
          >
            Retour à la boutique
          </Link>
        </div>
      </section>
    );
  }

  return <>{children}</>;
}
