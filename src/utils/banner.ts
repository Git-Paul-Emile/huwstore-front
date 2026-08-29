import type { Banner } from "../api/banners";

/**
 * Classe de cadrage correspondant au point d'intérêt choisi au back-office.
 *
 * La boutique indique, pour chaque bannière, quelle partie de la photo doit
 * rester visible quand elle est rognée. Sans cette traduction, le réglage est
 * enregistré mais n'a aucun effet à l'écran - et un visage ou un logo se
 * retrouve coupé alors que la boutique croyait l'avoir protégé.
 */
export function bannerFocusClass(focus: Banner["focus"]): string {
  if (focus === "top") return "object-top";
  if (focus === "bottom") return "object-bottom";
  return "object-center";
}
