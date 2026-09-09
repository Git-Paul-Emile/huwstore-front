import { Fragment } from "react";
import { Link } from "react-router-dom";

/**
 * Fil d'Ariane.
 *
 * Sur mobile, la largeur est la contrainte : un nom de produit long ne tient
 * pas sur une ligne. Plutôt que de le tronquer ou de le laisser déborder hors
 * de l'écran (les deux cachent du texte), le fil passe à la ligne proprement :
 *
 *  - `flex-wrap` sur le conteneur, avec un `gap` vertical pour aérer les lignes ;
 *  - `whitespace-nowrap` sur chaque maillon cliquable, pour qu'un libellé court
 *    comme « Cuir PU » ne se coupe jamais entre deux mots ;
 *  - le dernier maillon, la page courante, se répartit sur plusieurs lignes au
 *    besoin (`break-words`) sans jamais être rogné.
 *
 * Les maillons cliquables sont de vrais liens : clic du milieu pour ouvrir dans
 * un nouvel onglet, et suivi par les moteurs de recherche.
 */
export type Crumb = { label: string; to?: string };

export default function Breadcrumb({ items, className = "" }: { items: Crumb[]; className?: string }) {
  return (
    <nav
      aria-label="Fil d'Ariane"
      className={`label-lux flex-wrap items-center gap-x-2 gap-y-1 text-taupe ${className || "flex"}`}
    >
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <Fragment key={`${item.label}-${index}`}>
            {index > 0 && (
              <span aria-hidden className="text-taupe/70">
                /
              </span>
            )}
            {item.to && !isLast ? (
              <Link to={item.to} className="whitespace-nowrap transition-colors hover:text-gold-deep">
                {item.label}
              </Link>
            ) : (
              <span
                className={isLast ? "break-words text-anthracite" : "whitespace-nowrap"}
                aria-current={isLast ? "page" : undefined}
              >
                {item.label}
              </span>
            )}
          </Fragment>
        );
      })}
    </nav>
  );
}
