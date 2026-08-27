import { useNavigate } from "react-router-dom";
import { ArrowRight } from "./icons";
import logoLight from "../assets/logo2.svg";

const cols = [
  { title: "À propos", links: ["Notre maison", "Savoir-faire", "Nos ateliers", "Carrières", "Presse"] },
  { title: "Service client", links: ["Nous contacter", "Livraison & retours", "Suivi de commande", "Guide d'entretien", "FAQ"] },
  { title: "Catégories", links: ["Nouveautés", "Idées de cadeau", "Mini sacs", "Sacs à dos", "Pochettes", "Voyage & Maternité"] },
];

export default function Footer() {
  const navigate = useNavigate();
  return (
    <footer className="mt-24 bg-ink text-cream">
      <div className="mx-auto max-w-[1400px] px-5 md:px-10 py-16">
        <div className="grid gap-12 lg:grid-cols-[1.3fr_repeat(3,1fr)]">
          <div>
            <img src={logoLight} alt="HUWSTORE" className="h-20 w-auto md:h-24" />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-cream/65">
              Alliez style et praticité au quotidien.
            </p>
            <p className="label-lux mt-6 text-cream/50">Newsletter</p>
            <form onSubmit={(e) => e.preventDefault()} className="mt-3 flex max-w-xs border-b border-cream/30">
              <input
                type="email"
                required
                placeholder="Votre adresse e-mail"
                className="flex-1 bg-transparent py-2.5 text-sm outline-none placeholder:text-cream/40"
              />
              <button className="text-gold text-xl transition-transform hover:translate-x-1" aria-label="S'inscrire"><ArrowRight /></button>
            </form>
          </div>
          {cols.map((c) => (
            <div key={c.title}>
              <p className="label-lux text-gold">{c.title}</p>
              <ul className="mt-5 space-y-3">
                {c.links.map((l) => (
                  <li key={l}>
                    <button onClick={() => navigate("/boutique")} className="text-sm text-cream/70 transition-colors hover:text-cream">
                      {l}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-14 flex flex-col gap-4 border-t border-cream/15 pt-6 text-xs text-cream/50 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © 2026 HUWSTORE - Tous droits réservés.{" "}
            <button onClick={() => navigate("/admin")} className="text-cream/40 transition-colors hover:text-gold">
              · Espace admin
            </button>
          </p>
          <div className="flex gap-5">
            {["Instagram", "Facebook", "TikTok"].map((s) => (
              <a key={s} href="#" className="transition-colors hover:text-gold">{s}</a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
