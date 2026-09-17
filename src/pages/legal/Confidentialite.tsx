import { Link } from "react-router-dom";
import { LegalPage, Section } from "./LegalLayout";
import { useShop } from "../../hooks/useSettings";
import { useSeo } from "../../hooks/useSeo";

/**
 * Politique de confidentialité.
 *
 * Elle décrit ce que le site collecte RÉELLEMENT, et par où ces données
 * passent. Trois affirmations d'ici tiennent à du code précis : les cookies
 * déposés (jeton de session et jeton anti-CSRF, voir `auth.controller.ts`),
 * l'absence de coordonnées bancaires (le paiement se fait en espèces à la
 * livraison sur Dakar, par Wave ou Orange Money hors du site en région, jamais
 * sur ce site), et l'envoi des e-mails de confirmation par un prestataire
 * (`mail.service.ts`).
 * Si l'un de ces trois points change dans le code, cette page se corrige dans
 * le même mouvement - une politique de confidentialité fausse est pire que
 * pas de politique du tout.
 */
export default function Confidentialite() {
  const shop = useShop();
  useSeo({
    title: "Politique de confidentialité",
    description: "Les données que nous collectons, pourquoi, par où elles passent, et comment les faire supprimer.",
  });

  return (
    <LegalPage title="Politique de confidentialité" updatedAt="septembre 2026">
      <Section title="Qui traite vos données">
        <p>
          {shop.shopName}, boutique établie à {shop.city}
          {shop.country ? `, ${shop.country}` : ""}. Pour toute question sur vos données, appelez-nous au{" "}
          {shop.phone}
          {shop.email ? ` ou écrivez à ${shop.email}` : ""}.
        </p>
      </Section>

      <Section title="Ce que nous collectons">
        <p>
          Pour livrer une commande, nous conservons votre nom, votre numéro de téléphone, votre adresse de livraison et,
          si vous le souhaitez, votre adresse e-mail. Si vous créez un compte, s'y ajoutent vos adresses enregistrées,
          vos favoris et l'historique de vos commandes.
        </p>
        <p>
          Aucune coordonnée bancaire n'est collectée. Sur Dakar, le règlement se fait en espèces à la livraison ;
          dans les autres régions, par Wave ou Orange Money sur un numéro que nous vous communiquons, hors de ce
          site, et aucune donnée de ce paiement n'y transite. Ni ce site ni nous ne vous demanderons jamais un
          numéro de carte ou un code secret de portefeuille électronique.
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
        <p>
          Deux prestataires techniques interviennent, sans autre usage que le service rendu : l'hébergeur qui stocke la
          base de données du site, et le service qui expédie les e-mails de confirmation de commande, lequel reçoit
          votre adresse e-mail et le contenu du message.
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

      <Section title="Cookies et mémoire du navigateur">
        <p>
          Ce site n'utilise aucun cookie publicitaire, aucune mesure d'audience et aucun traceur tiers.
        </p>
        <p>
          Deux cookies strictement techniques sont déposés <strong>lorsque vous vous connectez à votre compte</strong> :
          l'un maintient votre session ouverte sans vous redemander votre mot de passe à chaque page, l'autre protège
          les actions faites depuis votre compte contre les demandes forgées par un autre site. Ils disparaissent à la
          déconnexion et ne servent à rien d'autre.
        </p>
        <p>
          Votre panier reste dans la mémoire de votre navigateur tant que vous n'avez pas de compte connecté : rien
          n'est envoyé au serveur avant que vous ne le validiez. Dès que vous vous connectez, il rejoint votre
          compte pour vous suivre d'un appareil à l'autre, comme vos favoris, qui eux exigent déjà un compte.
        </p>
      </Section>

      <Section title="Conditions de vente">
        <p>
          Les règles de commande, de paiement et de livraison figurent dans nos{" "}
          <Link
            to="/cgu"
            className="border-b border-gold-deep/40 text-gold-deep transition-colors hover:border-gold-deep"
          >
            conditions générales
          </Link>
          .
        </p>
      </Section>
    </LegalPage>
  );
}
