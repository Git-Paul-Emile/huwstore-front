import { Link } from "react-router-dom";
import { useLayoutStore } from "../store/useLayoutStore";
import { ArrowRight } from "./icons";
import heroFond from "../assets/hero-fond.webp";

/**
 * Bandeau d'accueil : le texte est posé SUR la photo de la boutique.
 *
 * Ce choix annule la décision du 01/09/2026 (« le haut de la page n'affiche
 * aucune image en arrière-plan »), à la demande du 08/09/2026. L'objection
 * d'alors reste valable et elle est traitée ici, pas ignorée : un texte clair
 * posé sur un visuel n'est lisible que si le fond sous ce texte est CONTRÔLÉ.
 *
 * D'où trois couches empilées, dans cet ordre :
 *
 *   1. `FOND`  la photo, en `object-cover`. Elle contient déjà le sac : il n'y
 *              a plus d'image de sac séparée dans ce composant.
 *   2. `VOILE` un dégradé sombre, opaque à gauche (là où vit le texte) et
 *              transparent à droite (là où vit le sac). C'est LUI qui garantit
 *              le contraste, pas la chance du visuel.
 *   3. le texte.
 *
 * Contrastes MESURÉS sur le rendu, pixel par pixel, sur toute la boîte de
 * chaque texte, opacités comprises. Le pire cas de chaque zone :
 *
 *              surtitre   titre    slogan
 *   390 px     10,04:1   10,63:1   8,67:1
 *   768 px     10,28:1   11,71:1   9,87:1
 *   1280 px     7,66:1    9,59:1   8,91:1
 *
 * `rules/30-produit/ui.md` exige 4,5:1 pour le texte courant et 3:1 pour les
 * grands titres.
 *
 * Toute NOUVELLE photo de fond oblige à remesurer et, si elle est plus claire,
 * à remonter les opacités du voile. C'est la contrepartie du texte posé sur une
 * image : elle ne se saute pas.
 *
 * La photo est un visuel de marque, pas une fiche produit : ce sac vert n'est
 * pas au catalogue. D'où `alt=""` (rien à annoncer au lecteur d'écran, le titre
 * porte déjà le message) et un lien qui mène à la boutique sans laisser croire
 * que ce modèle précis est en vente.
 *
 * Le contenu texte est fixe et vit dans le code : c'est la promesse de la
 * boutique, pas une campagne. Les campagnes se pilotent depuis le back-office
 * et s'affichent dans le bandeau promo, plus bas dans la page.
 */

/**
 * Couche 1, la photo. `src/assets/hero-fond.webp`, 2000x1125 (16/9), 129 Ko.
 *
 * Elle a été COMPOSÉE à partir de la photo carrée fournie par la boutique
 * (1024x1024, sac vert sur un fond de cuir brun) : la photo occupe la moitié
 * droite du fichier, et son fond est prolongé vers la gauche pour donner au
 * bandeau un format large. Recadrer directement le carré ne marchait pas : sur
 * un bandeau trois fois plus large que haut, `object-cover` zoome de 25 % et le
 * sac déborde du cadre.
 *
 * Le prolongement est la MOYENNE PAR LIGNE d'une bande de cuir prise à gauche
 * du sac, étirée à l'horizontale, plus un grain synthétique. Recopier la
 * texture de la photo, même en miroir, ramenait l'arête d'un pli en dents de
 * scie toutes les 165 px, visible au premier coup d'oeil. La jonction se fait
 * sur un fondu de 520 px à courbe en S ; une rampe linéaire laisse une cassure
 * de pente.
 *
 * CADRAGE, deux réglages qui dépendent de la forme de la case :
 * - jusqu'à `lg`, la case est plus haute que large par rapport à la photo :
 *   c'est la largeur qui est rognée, et on n'en voit que la moitié. `65 %`
 *   amène le sac entier dans la fenêtre tout en laissant du cuir nu sous le
 *   texte. Vers la droite le sac occupait toute la fenêtre, vers la gauche il
 *   n'en restait qu'un fragment coupé par le bord.
 * - à partir de `lg`, la case est plus large : toute la largeur tient, c'est la
 *   HAUTEUR qui est rognée. `62 %` et non `50 %` : la fenêtre descend dans le
 *   fichier, donc le sac remonte dans le bandeau (demande du 09/09). Réglé à
 *   l'oeil entre deux bornes : à `50 %` le sac est trop bas, au-delà de `75 %`
 *   il remonte trop et son haut finit par se faire couper.
 *
 * Le réglage vertical n'a d'effet QU'À PARTIR DE `lg`. En dessous, la case est
 * plus haute que large par rapport à la photo : toute la hauteur est déjà
 * affichée, il n'y a rien à faire monter.
 */
const CADRAGE_FOND = "object-[65%_50%] lg:object-[50%_62%]";

/**
 * Couche 2, le voile. Il s'éteint avant le bord droit pour laisser le sac en
 * pleine lumière.
 *
 * DEUX voiles, et pas un seul, parce que le cadrage de la photo change à `lg`.
 * En dessous, `object-right` amène sous le texte le carton bleu clair et la
 * partie éclairée du kraft : avec le voile large, le slogan tombait à 3,6:1,
 * sous le minimum. Le voile étroit est plus opaque et s'éteint plus à droite.
 * À partir de `lg` la photo est cadrée au centre, sa moitié gauche est déjà
 * sombre, et le voile large suffit.
 *
 * Les opacités ne se règlent pas à l'oeil : les toucher, ou changer de photo,
 * oblige à remesurer (voir l'en-tête du fichier).
 */
const VOILE_ETROIT =
  "linear-gradient(to right, rgba(15,15,15,0.76) 0%, rgba(15,15,15,0.66) 55%, rgba(15,15,15,0.28) 85%, rgba(15,15,15,0) 100%)";

const VOILE =
  "linear-gradient(to right, rgba(15,15,15,0.62) 0%, rgba(15,15,15,0.46) 45%, rgba(15,15,15,0.12) 78%, rgba(15,15,15,0) 100%)";

export default function Hero() {
  // Hauteur mesurée en temps réel par Header (bandeau d'annonce compris) : le
  // bandeau reste bas, il laisse voir le haut de la section suivante et signale
  // qu'il y a du contenu à faire défiler.
  const headerHeight = useLayoutStore((s) => s.headerHeight);

  return (
    <section className="relative w-full overflow-hidden bg-ink">
      <img
        src={heroFond}
        alt=""
        width={2000}
        height={1125}
        fetchPriority="high"
        decoding="async"
        className={`absolute inset-0 h-full w-full object-cover ${CADRAGE_FOND}`}
      />
      {/* Le voile passe par `style` et non par une classe `bg-[...]` : Tailwind
          ne génère une classe arbitraire que s'il la lit TELLE QUELLE dans le
          fichier. Une classe assemblée depuis une constante n'est jamais
          produite, et la règle n'existerait pas dans le CSS final. */}
      <div aria-hidden className="absolute inset-0 lg:hidden" style={{ backgroundImage: VOILE_ETROIT }} />
      <div aria-hidden className="absolute inset-0 hidden lg:block" style={{ backgroundImage: VOILE }} />

      {/* `relative` sans `z-index` : la grille est un frère POSITIONNÉ qui vient
          après les deux couches dans le DOM, elle passe donc devant sans avoir
          à ouvrir une échelle de plans que le reste du site devrait respecter.

          Les lignes s'inversent d'un côté à l'autre de `md`, et ce n'est pas
          un caprice : c'est la ligne qui absorbe la hauteur libre du bandeau
          (`min-height`) qui décide où tombe le vide.

          Sur mobile `1fr auto` : tout le mou va à la première ligne, donc au
          sac, qui remplit la hauteur ; le bouton reste collé en bas et le texte
          est calé en haut (`self-start`). Sans cela le mou se partage entre les
          deux lignes et un trou s'ouvre entre la phrase et le bouton.

          À partir de `md` `auto 1fr` : la première ligne se règle sur le texte
          et la seconde prend le mou, le bouton restant en haut de la sienne
          (`md:self-start`). Le sac couvre les deux. */}
      <div
        className="relative mx-auto grid max-w-[1400px] grid-cols-[minmax(0,1fr)_minmax(0,0.85fr)] items-center gap-x-3 px-5 py-9 grid-rows-[1fr_auto] sm:gap-x-6 sm:px-8 md:grid-rows-[auto_1fr] md:gap-x-10 md:px-12 md:py-14 lg:px-16"
        style={{ minHeight: `calc(52vh - ${headerHeight}px)` }}
      >
        <div className="animate-fade-up col-start-1 row-start-1 self-start text-left md:self-center">
          <p className="label-lux text-cream/85">Sacs et petite maroquinerie</p>

          {/* L'ombre portée n'est pas décorative : elle tient le titre lisible
              si le fond passe un jour à une vraie photo, plus claire par
              endroits que le dégradé actuel. */}
          <h1 className="serif mt-3 text-[1.85rem] leading-[1.08] text-cream [text-shadow:0_2px_14px_rgba(15,15,15,0.45)] sm:text-4xl md:mt-4 md:text-5xl lg:text-6xl">
            Des sacs façonnés
            <br />
            <span className="italic">pour durer</span>
          </h1>

          <p className="mt-4 max-w-sm text-sm leading-relaxed text-cream/90 md:mt-5 md:text-base">
            Alliez style et praticité au quotidien.
          </p>
        </div>

        {/* Pas de bloc dans la colonne de droite : le sac est DANS la photo de
            fond. La colonne reste néanmoins déclarée dans la grille, et c'est
            volontaire : c'est elle qui empêche le texte de s'étaler sous le
            sac. La supprimer rendrait la colonne de gauche pleine largeur et
            le titre passerait par-dessus le visuel. */}

        {/* Le bouton est un enfant de la GRILLE, pas du bloc de texte.
            Mesuré : « Découvrir la collection » sur une ligne demande 274 px,
            la colonne de gauche en fait 183 px sur un téléphone de 390 px. Le
            bouton ne peut donc pas y tenir, à aucune taille de police
            raisonnable. Sur mobile il prend une ligne à lui, sur toute la
            largeur ; à partir de `md` il revient sous la phrase, dans la
            colonne de gauche.

            Un lien, pas un bouton : la destination est une page, elle doit
            pouvoir s'ouvrir dans un nouvel onglet au clic du milieu et être
            suivie par les moteurs de recherche.

            Fond doré et texte encre, pas l'inverse : crème sur doré ne monte
            qu'à 2,7:1, sous le minimum exigé. Là on est à 8,5:1. */}
        <div className="animate-fade-up col-span-2 col-start-1 row-start-2 mt-6 md:col-span-1 md:mt-8 md:self-start">
          <Link
            to="/boutique"
            className="label-lux inline-flex items-center gap-2 whitespace-nowrap rounded-full bg-gold px-6 py-3.5 text-ink shadow-[0_6px_20px_rgba(15,15,15,0.28)] transition-colors hover:bg-cream hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cream md:px-8 md:py-4"
          >
            Découvrir la collection <ArrowRight />
          </Link>
        </div>
      </div>
    </section>
  );
}
