import { LegalPage, Section } from "./LegalLayout";
import { useShop } from "../../hooks/useSettings";
import { useSeo } from "../../hooks/useSeo";

/**
 * Politique de confidentialité.
 *
 * Elle décrit ce que le site collecte RÉELLEMENT. Si une donnée nouvelle est
 * collectée un jour (par exemple à l'ouverture d'un paiement en ligne), cette
 * page doit être mise à jour en même temps que le code.
 */
export default function Confidentialite() {
  const shop = useShop();
  useSeo({ title: "Politique de confidentialité", description: "Les données que nous collectons, pourquoi, et comment les faire supprimer." });

  return (
    <LegalPage title="Politique de confidentialité" updatedAt="août 2026">
      <Section title="Ce que nous collectons">
        <p>
          Pour livrer une commande, nous conservons votre nom, votre numéro de téléphone, votre adresse de livraison et,
          si vous le souhaitez, votre adresse e-mail. Si vous créez un compte, s'y ajoutent vos adresses enregistrées,
          vos favoris et l'historique de vos commandes.
        </p>
        <p>
          Aucune coordonnée bancaire n'est collectée : le règlement se fait à la livraison, en espèces.
        </p>
      </Section>

      <Section title="Pourquoi nous les conservons">
        <p>
          Uniquement pour préparer et livrer vos commandes, vous joindre à leur sujet, et vous permettre de retrouver
          vos achats passés depuis votre compte. Vos données ne sont ni revendues, ni utilisées à des fins publicitaires.
        </p>
      </Section>

      <Section title="Qui y a accès">
        <p>
          La responsable de la boutique, et la personne chargée de la livraison - qui reçoit votre nom, votre téléphone
          et votre adresse, et rien d'autre.
        </p>
      </Section>

      <Section title="Combien de temps">
        <p>
          Les commandes sont conservées pour le suivi de l'activité de la boutique. Un compte client inactif peut être
          supprimé sur simple demande.
        </p>
      </Section>

      <Section title="Vos droits">
        <p>
          Vous pouvez demander à consulter, corriger ou supprimer vos informations en nous appelant au{" "}
          {shop.phone}. Depuis votre compte, vous pouvez déjà modifier vos informations et vos adresses à tout
          moment.
        </p>
      </Section>

      <Section title="Cookies">
        <p>
          Ce site n'utilise aucun cookie publicitaire ni aucun traceur tiers. Votre panier, vos favoris et votre session
          sont conservés localement dans votre navigateur, pour que vous les retrouviez à votre retour.
        </p>
      </Section>
    </LegalPage>
  );
}
