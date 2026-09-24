import { useState } from "react";
import CardRail from "./CardRail";
import collectionImg from "../assets/boutique-collection.webp";
import miniFormatsImg from "../assets/boutique-mini-formats.webp";
import essentielsImg from "../assets/boutique-essentiels.webp";

/**
 * Bandeau de la page Boutique : un panneau de texte fixe à gauche, une bande de
 * photos qui défile à droite.
 *
 * Le texte n'est PAS dans la case qui défile, il est à côté et son contenu suit
 * la photo affichée. C'est ce que dit la maquette : les flèches sont posées sur
 * la photo et les puces sont centrées sous la photo, pas sous l'ensemble. Un
 * volet complet (texte + photo) qui défilerait d'un bloc mettrait les flèches
 * au bord de l'ensemble et les puces au milieu du bandeau.
 *
 * Conséquence : la position courante du rail doit sortir de `CardRail`. D'où
 * l'option `onIndexChange`, ajoutée là-bas plutôt qu'une seconde mécanique de
 * défilement écrite ici. Les trois autres usages du rail ne changent pas.
 *
 * Les trois textes sont TOUS dans le document ; seul celui du volet affiché est
 * visible, les autres sont en `hidden`. Ils ne sont pas montés puis démontés :
 * le `<h1>` de la page vit dans le premier volet, et le retirer du document
 * ferait disparaître le titre principal de la page.
 *
 * Limite assumée : quand la visiteuse regarde le volet 2 ou 3, ce `<h1>` est en
 * `display:none`. Le HTML servi au chargement le contient (c'est lui que lisent
 * les moteurs de recherche, ils ne font pas défiler), et le défilement
 * automatique s'arrête au survol, au doigt et au focus clavier, donc une
 * lecture au clavier ou au lecteur d'écran ne le perd pas en route.
 */

/**
 * Une case du rail. La photo commande la hauteur du bandeau : le panneau de
 * texte, voisin dans une rangée `items-stretch`, s'y aligne.
 *
 * `basis` fixe la largeur, `aspect-square` en déduit la hauteur, et les photos
 * sont des carrés de 800 px : le cadre a donc exactement les proportions de la
 * source, RIEN n'est rogné. Changer `basis` sans garder le carré remettrait du
 * recadrage.
 *
 * La photo grandit franchement à partir de `lg`. Sur un grand écran le panneau
 * de texte prend tout ce que la photo ne prend pas : une photo restée petite
 * laissait mille pixels d'aplat beige autour d'une phrase de dix mots, la
 * maquette téléphone simplement étirée. À 1440 px la photo fait 340 px, soit un
 * rapport de 2,5 entre le panneau et elle au lieu de 4,3.
 */
const SLIDE_WIDTH =
  "shrink-0 basis-[8rem] snap-start px-1.5 sm:basis-[11rem] md:basis-[14rem] lg:basis-[18rem] xl:basis-[22rem]";

/**
 * Largeur de la colonne du rail : EXACTEMENT une case, pas un pixel de plus.
 *
 * Une colonne plus large laisserait dépasser la photo suivante, ce qui est
 * joli au premier volet et faux au dernier : arrivé au bout du rail, c'est la
 * photo PRÉCÉDENTE qui dépasse, à gauche, et les deux flèches ne sont alors
 * plus posées sur la photo active. Essayé, écarté. Les puces et les flèches
 * annoncent déjà qu'il y a une suite.
 *
 * La colonne vaut donc la largeur d'une PHOTO, gouttière déduite : ce sont les
 * mêmes valeurs que la hauteur du panneau de texte plus bas. `overflow-hidden`
 * coupe le débordement de 6 px que le rail garde de chaque côté (`-mx-1.5`) ;
 * sans lui une lisière de la photo voisine apparaît, à droite au premier volet
 * et à gauche au dernier.
 */
const RAIL_WIDTH =
  "w-[7.25rem] shrink-0 overflow-hidden sm:w-[10.25rem] md:w-[13.25rem] lg:w-[17.25rem] xl:w-[21.25rem]";

/**
 * Les flèches sont POSÉES SUR la photo, sans aucun fond : un chevron nu, comme
 * sur la maquette. Visibles aussi sur mobile.
 *
 * Un chevron nu sur une photo n'est jamais lisible tout seul. Mesuré sur les
 * trois images, dans l'empreinte exacte des deux flèches : quelle que soit la
 * couleur choisie, il s'y trouve au moins un pixel de cette couleur, soit un
 * contraste de 1:1. Une poignée de sac sombre passe là où une encre passerait,
 * un mur blanc là où passerait un crème.
 *
 * D'où le halo : deux ombres portées crème, sans décalage, appliquées au TRACÉ
 * du chevron et non à sa boîte (`drop-shadow`, pas `box-shadow` - une ombre de
 * boîte dessinerait un rectangle flou dans le vide). Le chevron reste encre sur
 * les zones claires, majoritaires, et son contour crème le détache des zones
 * sombres. C'est ce halo qui remplace le rond : ne pas le retirer en croyant
 * nettoyer.
 *
 * Vérifié après coup sur le rendu, aux six emplacements de flèche (trois
 * photos, deux côtés), en 390 et en 1440 px : le tracé du chevron ressort à
 * 7,3:1 au pire contre son entourage immédiat. `rules/30-produit/ui.md` demande
 * 3:1 pour une icône.
 *
 * La colonne fait exactement la largeur de la photo, les deux décalages sont
 * donc les mêmes : à l'intérieur de chaque bord. Mesuré à 390, 640, 768, 1280
 * et 1440 px.
 */
const ARROWS_OVER_PHOTO_BASE =
  "flex h-9 w-9 text-base text-ink [filter:drop-shadow(0_0_3px_rgba(250,247,242,0.95))_drop-shadow(0_0_7px_rgba(250,247,242,0.75))] hover:text-gold-deep focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold md:h-11 md:w-11 md:text-xl";

const ARROWS_OVER_PHOTO = {
  previous: `${ARROWS_OVER_PHOTO_BASE} left-1 md:left-2`,
  next: `${ARROWS_OVER_PHOTO_BASE} right-1 md:right-2`,
};

/**
 * 5,5 s par volet. Repère des cadences du site : univers 4,5 s (on regarde des
 * vignettes), témoignages 7 s (on lit trois lignes). Ici le premier volet porte
 * une phrase de dix mots.
 */
const AUTOPLAY_MS = 5500;

type Volet = {
  image: string;
  /** Surtitre doré, seulement sur le premier volet. */
  surtitre?: string;
  titre: string;
  soustitre?: string;
};

export default function ListingBanner({ category }: { category?: string }) {
  const [actif, setActif] = useState(0);

  const volets: Volet[] = [
    {
      image: collectionImg,
      surtitre: "Maroquinerie",
      titre: category ?? "Toute la collection",
      soustitre: "Des pièces sélectionnées pour leur matière et leur ligne.",
    },
    { image: miniFormatsImg, titre: "Les mini formats" },
    { image: essentielsImg, titre: "Les essentiels" },
  ];

  return (
    <div className="mt-6 flex items-start">
      {/* Panneau de texte. `min-w-0` : sans lui une case flexible refuse de
          descendre sous la largeur de son plus long mot, et le panneau
          pousserait la photo hors de l'écran sur un petit téléphone.

          Sa hauteur est écrite en clair et vaut EXACTEMENT celle de la photo,
          soit la largeur de case moins les 0,75 rem de gouttière du rail
          (`px-1.5` de chaque côté). Elle ne peut pas être héritée : la colonne
          du rail contient aussi les puces, une rangée `items-stretch` étirerait
          donc le panneau sous la photo. Toute retouche de `SLIDE_WIDTH` se
          reporte ici, les deux séries de valeurs vont par paires. Vérifié au
          pixel : 116 / 164 / 212 / 276 / 340 px. */}
      <div className="flex h-[7.25rem] min-w-0 flex-1 flex-col justify-center rounded-l-xl bg-[#7A553D] px-3 py-3 text-center sm:h-[10.25rem] sm:px-6 sm:py-5 md:h-[13.25rem] md:px-10 lg:h-[17.25rem] xl:h-[21.25rem]">
        {volets.map((volet, position) => {
          // Le titre du premier volet est le titre de la page. Les autres sont
          // des accroches : un `<h2>` « Les mini formats » annoncerait au
          // lecteur d'écran une section qui n'existe pas dans le document.
          const Titre = position === 0 ? "h1" : "p";

          return (
            <div key={volet.titre} className={position === actif ? "" : "hidden"}>
              {volet.surtitre && (
                <p className="label-lux text-[0.6rem] text-[#C9A876] sm:text-[0.68rem] xl:text-xs">{volet.surtitre}</p>
              )}

              <Titre
                className={`serif text-[1.05rem] leading-tight text-cream sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl ${
                  volet.surtitre ? "mt-1.5 sm:mt-3 lg:mt-4" : ""
                }`}
              >
                {volet.titre}
              </Titre>

              {volet.soustitre && (
                <p className="mx-auto mt-1.5 max-w-lg text-[0.68rem] leading-relaxed text-taupe-soft sm:mt-3 sm:text-xs md:text-sm lg:mt-4 xl:text-base">
                  {volet.soustitre}
                </p>
              )}
            </div>
          );
        })}
      </div>

      <div className={RAIL_WIDTH}>
        <CardRail
          slides={volets.map((volet, position) => (
            // `rounded-r-xl` et non `rounded-xl` : la photo et le panneau de
            // texte forment un seul bloc, arrondi à ses deux extrémités
            // seulement. Des coins arrondis côté gauche laisseraient voir le
            // fond de page dans la jointure. C'est la seule exception à la
            // règle « toute surface qui porte une image a le même rayon ».
            //
            // Photos d'ambiance, pas fiches produit : ces sacs ne sont pas au
            // catalogue, d'où `alt=""` - le texte à côté porte le message.
            // Seule la première est chargée tout de suite, les deux autres
            // sont hors écran tant qu'on n'a pas fait défiler.
            <img
              key={volet.titre}
              src={volet.image}
              alt=""
              width={800}
              height={800}
              loading={position === 0 ? "eager" : "lazy"}
              decoding="async"
              className="aspect-square w-full rounded-r-xl object-cover"
            />
          ))}
          slideWidth={SLIDE_WIDTH}
          label="Bandeau de la boutique"
          autoplayMs={AUTOPLAY_MS}
          previousLabel="Volet précédent"
          nextLabel="Volet suivant"
          onIndexChange={setActif}
          arrowClassName={ARROWS_OVER_PHOTO}
        />
      </div>
    </div>
  );
}
