import { useState, type FormEvent, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import { useLogin } from "../hooks/useAuth";
import { readApiError } from "../api/axiosConfig";
import { Eye, EyeOff } from "./icons";

/**
 * Garde d'accès du back-office.
 *
 * L'API refuse déjà toute donnée à qui n'est pas administrateur : ce composant
 * n'ajoute pas la sécurité, il la RESPECTE côté écran. Sans lui, n'importe qui
 * ouvrant /admin verrait l'interface complète se remplir de messages d'erreur -
 * déroutant pour une cliente, et une invitation à chercher la faille pour les
 * autres.
 *
 * Trois états, et un seul écran par état :
 *  - session en cours de restauration : on attend, on ne redirige pas ;
 *  - personne non connectée : formulaire de connexion ;
 *  - connectée mais sans le rôle : refus net, sans formulaire.
 */
export default function RequireAdmin({ children }: { children: ReactNode }) {
  const status = useAuthStore((s) => s.status);
  const user = useAuthStore((s) => s.user);

  if (status === "loading") {
    return (
      <div className="grid min-h-screen place-items-center bg-cream text-sm text-taupe">
        Vérification de votre session…
      </div>
    );
  }

  if (!user) return <AdminLogin />;

  if (user.role !== "ADMIN") {
    return (
      <div className="grid min-h-screen place-items-center bg-cream px-5 text-center">
        <div>
          <h1 className="serif text-2xl">Espace réservé</h1>
          <p className="mt-3 text-sm text-taupe">
            Votre compte n'a pas accès à la gestion de la boutique.
          </p>
          <Link to="/" className="label-lux mt-8 inline-block bg-ink px-8 py-4 text-cream hover:bg-anthracite">
            Retour à la boutique
          </Link>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

function AdminLogin() {
  const signIn = useLogin();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [visible, setVisible] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function submit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    signIn.mutate(
      { phone: phone.trim(), password },
      { onError: (err) => setError(readApiError(err, "Connexion impossible. Vérifiez vos identifiants.")) },
    );
  }

  return (
    <div className="grid min-h-screen place-items-center bg-cream px-5">
      <form onSubmit={submit} className="w-full max-w-sm border border-taupe/30 bg-white p-8">
        <p className="label-lux text-gold-deep">HUWSTORE</p>
        <h1 className="serif mt-1 text-2xl">Back-office</h1>
        <p className="mt-2 text-sm text-taupe">Connectez-vous avec le compte de gestion de la boutique.</p>

        <label className="mt-6 block text-sm">
          <span className="text-taupe">Téléphone</span>
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            autoComplete="username"
            inputMode="tel"
            placeholder="70 966 62 59"
            required
            className="mt-1.5 w-full border border-taupe/40 px-3 py-2.5 text-sm outline-none focus:border-gold"
          />
        </label>

        <label className="mt-4 block text-sm">
          <span className="text-taupe">Mot de passe</span>
          <div className="relative mt-1.5">
            <input
              type={visible ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
              className="w-full border border-taupe/40 px-3 py-2.5 pr-11 text-sm outline-none focus:border-gold"
            />
            <button
              type="button"
              onClick={() => setVisible((v) => !v)}
              aria-label={visible ? "Masquer le mot de passe" : "Afficher le mot de passe"}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-taupe transition-colors hover:text-ink"
            >
              {visible ? <EyeOff /> : <Eye />}
            </button>
          </div>
        </label>

        {error && <p className="mt-4 text-sm text-rose-600">{error}</p>}

        <button
          type="submit"
          disabled={signIn.isPending}
          className="label-lux mt-6 w-full bg-ink py-3.5 text-cream transition-colors hover:bg-anthracite disabled:opacity-60"
        >
          {signIn.isPending ? "Connexion…" : "Se connecter"}
        </button>

        <Link to="/" className="mt-4 block text-center text-xs text-taupe hover:text-ink">
          Retour à la boutique
        </Link>
      </form>
    </div>
  );
}
