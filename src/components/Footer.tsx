import { Link } from "react-router-dom";
import logoLight from "../assets/logo2.svg";
import { useShop } from "../hooks/useSettings";

/**
 * Pied de page.
 *
 * Chaque entrée pointe vers une page qui existe réellement : un lien mort dans
 * un pied de page coûte plus de confiance qu'il n'en rapporte. Les colonnes
 * décoratives d'avant (« Nos ateliers », « Presse », « Carrières »…) ont été
 * retirées faute de contenu derrière.
 */
const cols: { title: string; links: { label: string; to: string }[] }[] = [
  {
    title: "Boutique",
    links: [
      { label: "Toutes les pièces", to: "/boutique" },
      { label: "Nouveautés", to: "/boutique?tri=nouveautes" },
      { label: "Mon compte", to: "/compte" },
      { label: "Mes favoris", to: "/compte" },
    ],
  },
  {
    title: "Service client",
    links: [{ label: "Nous contacter", to: "/contact" }],
  },
  {
    title: "Informations",
    links: [{ label: "Politique de confidentialité", to: "/confidentialite" }],
  },
];

export default function Footer() {
  const shop = useShop();

  // Les liens sociaux ne sont affiches que s'ils sont renseignes : un lien vide
  // vaut moins que pas de lien du tout.
  const socials = [
    { label: "Instagram", href: shop.instagramUrl },
    { label: "Facebook", href: shop.facebookUrl },
    { label: "TikTok", href: shop.tiktokUrl },
    { label: "WhatsApp", href: shop.whatsapp ? `https://wa.me/${shop.whatsapp}` : undefined },
  ].filter((social): social is { label: string; href: string } => Boolean(social.href));

  return (
    <footer className="mt-24 bg-ink text-cream">
      <div className="mx-auto max-w-[1400px] px-5 py-16 md:px-10">
        <div className="grid gap-12 lg:grid-cols-[1.3fr_repeat(3,1fr)]">
          <div>
            <img src={logoLight} alt="HUWSTORE" className="h-20 w-auto md:h-24" />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-cream/65">
              Alliez style et praticité au quotidien. Livraison partout au Sénégal, paiement à la livraison.
            </p>
            {shop.phone && (
              <a
                href={`tel:+${shop.whatsapp || shop.phone}`}
                className="mt-4 inline-block text-sm text-cream/70 transition-colors hover:text-gold"
              >
                {shop.phone}
              </a>
            )}
          </div>

          {cols.map((c) => (
            <div key={c.title}>
              <p className="label-lux text-gold">{c.title}</p>
              <ul className="mt-5 space-y-3">
                {c.links.map((link) => (
                  <li key={link.label}>
                    <Link to={link.to} className="text-sm text-cream/70 transition-colors hover:text-cream">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-14 flex flex-col gap-4 border-t border-cream/15 pt-6 text-xs text-cream/50 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {shop.shopName} - Tous droits réservés.{" "}
            <Link to="/admin" className="text-cream/40 transition-colors hover:text-gold">
              - Espace admin
            </Link>
          </p>
          <div className="flex gap-5">
            {socials.map((social) => (
              <a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className="transition-colors hover:text-gold"
              >
                {social.label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
