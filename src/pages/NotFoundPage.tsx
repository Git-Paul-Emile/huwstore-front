import { useNavigate } from "react-router-dom";
import { useSeo } from "../hooks/useSeo";

export default function NotFoundPage() {
  const navigate = useNavigate();
  // Une 404 ne doit jamais entrer dans l'index (rules/SEO.md).
  useSeo({ title: "Page introuvable", noindex: true });
  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-6 py-32 text-center">
      <p className="label-lux text-gold-deep">Erreur 404</p>
      <h1 className="serif mt-3 text-3xl">Cette page n'existe pas</h1>
      <p className="mt-3 text-sm text-taupe">Le lien est peut-être obsolète ou l'adresse mal orthographiée.</p>
      <button
        onClick={() => navigate("/")}
        className="label-lux mt-8 bg-ink px-6 py-3 text-cream transition-colors hover:bg-anthracite"
      >
        Retour à l'accueil
      </button>
    </div>
  );
}
