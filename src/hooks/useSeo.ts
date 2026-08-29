import { useEffect } from "react";

const SITE = "HUWSTORE";
const JSON_LD_ID = "seo-json-ld";

type Attr = "name" | "property";

/**
 * Écrit une balise <meta> unique dans le <head>, en la créant si besoin.
 * `attr` distingue les métadonnées classiques (`name`) des balises Open Graph
 * (`property`) : les deux familles cohabitent et ne s'écrasent pas.
 */
function setMeta(attr: Attr, key: string, content: string) {
  const selector = `meta[${attr}="${key}"]`;
  let element = document.head.querySelector<HTMLMetaElement>(selector);
  if (!element) {
    element = document.createElement("meta");
    element.setAttribute(attr, key);
    document.head.appendChild(element);
  }
  element.setAttribute("content", content);
}

function setCanonical(href: string) {
  let element = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!element) {
    element = document.createElement("link");
    element.setAttribute("rel", "canonical");
    document.head.appendChild(element);
  }
  element.setAttribute("href", href);
}

/**
 * Balise `robots`. Écrite seulement quand une page demande le noindex, et
 * retirée dès qu'on navigue vers une page indexable - sinon, SPA oblige, le
 * `noindex` d'un reçu resterait collé sur la page suivante.
 */
function setRobots(noindex: boolean) {
  const element = document.head.querySelector<HTMLMetaElement>('meta[name="robots"]');
  if (noindex) {
    if (element) {
      element.setAttribute("content", "noindex, nofollow");
    } else {
      const meta = document.createElement("meta");
      meta.setAttribute("name", "robots");
      meta.setAttribute("content", "noindex, nofollow");
      document.head.appendChild(meta);
    }
  } else {
    element?.remove();
  }
}

/**
 * Données structurées Schema.org de la page. Même principe que `robots` : le
 * bloc appartient à UNE page, il est remplacé à chaque navigation et retiré
 * quand la page suivante n'en déclare pas.
 */
function setJsonLd(data?: Record<string, unknown>) {
  document.getElementById(JSON_LD_ID)?.remove();
  if (!data) return;

  const script = document.createElement("script");
  script.id = JSON_LD_ID;
  script.type = "application/ld+json";
  script.textContent = JSON.stringify(data);
  document.head.appendChild(script);
}

export type SeoInput = {
  title: string;
  description?: string;
  image?: string;
  /**
   * Schema.org de la page, ex. une fiche `Product`. C'est ce qui permet à
   * Google d'afficher le prix et la disponibilité dans ses résultats.
   */
  jsonLd?: Record<string, unknown>;
  /** Pages privées (reçu, tunnel de commande, compte) : hors index moteur. */
  noindex?: boolean;
};

/**
 * Titre, description et métadonnées par page.
 *
 * L'application est une SPA : sans ce hook, chaque URL sert le titre unique
 * défini dans index.html. Google et les aperçus WhatsApp afficheraient donc la
 * même fiche pour l'accueil et pour chaque produit.
 *
 * Ce hook corrige les balises APRÈS le rendu côté client. Il ne remplace pas un
 * pré-rendu : le jour où le référencement des fiches produit deviendra un
 * enjeu commercial, il faudra générer les pages au build.
 */
export function useSeo({ title, description, image, jsonLd, noindex = false }: SeoInput) {
  // Les données structurées sont comparées par leur contenu : un objet
  // reconstruit à chaque rendu relancerait l'effet en boucle sinon.
  const jsonLdKey = jsonLd ? JSON.stringify(jsonLd) : null;

  useEffect(() => {
    const fullTitle = title === SITE ? title : `${title} - ${SITE}`;

    document.title = fullTitle;
    setMeta("property", "og:title", fullTitle);

    if (description) {
      setMeta("name", "description", description);
      setMeta("property", "og:description", description);
    }
    if (image) setMeta("property", "og:image", image);

    setRobots(noindex);
    setCanonical(window.location.origin + window.location.pathname);
    setJsonLd(jsonLdKey ? (JSON.parse(jsonLdKey) as Record<string, unknown>) : undefined);

    return () => setJsonLd(undefined);
  }, [title, description, image, noindex, jsonLdKey]);
}
