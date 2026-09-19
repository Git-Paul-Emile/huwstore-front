import { Link } from "react-router-dom";
import { LegalPage, Section } from "./LegalLayout";
import { useShop } from "../../hooks/useSettings";
import { useSeo } from "../../hooks/useSeo";

/**
 * Conditions générales de vente et d'utilisation.
 *
 * Cette page ne décrit QUE la façon dont la boutique fonctionne réellement :
 * sur Dakar paiement à la livraison en espèces, dans les autres régions
 * paiement Wave ou Orange Money hors du site qui confirme la commande,
 * livraison par zones, vérification du colis à la remise. Une condition écrite
 * ici engage la boutique aussi sûrement qu'une promesse faite au téléphone - si
 * une règle change dans le code (un moyen de paiement s'ouvre, une zone de
 * livraison disparaît), ce texte se corrige dans le même mouvement.
 *
 * Les coordonnées viennent des paramètres du back-office et non du code : la
 * boutique change de numéro sans qu'on ait à toucher à cette page.
 */
export default function Cgu() {
  const shop = useShop();
  useSeo({
    title: "Conditions générales de vente et d'utilisation",
    description:
      "Commande, paiement à la livraison sur Dakar ou par Wave et Orange Money en région, délais, vérification du colis et utilisation du site.",
  });

  return (
    <LegalPage title="Conditions générales de vente et d'utilisation" updatedAt="septembre 2026">
      <Section title="Qui vend">
        <p>
          {shop.shopName} est une boutique de sacs et d'accessoires établie à {shop.city}
          {shop.country ? `, ${shop.country}` : ""}
          {shop.addressLine ? ` (${shop.addressLine})` : ""}. Vous pouvez nous joindre au {shop.phone}
          {shop.email ? `, par e-mail à ${shop.email}` : ""} ou sur WhatsApp.
          {shop.ninea ? ` NINEA : ${shop.ninea}.` : ""}
        </p>
      </Section>

      <Section title="Ce que ce texte engage">
        <p>
          Ces conditions s'appliquent à toute commande passée sur ce site. Passer commande vaut acceptation.
          Nous pouvons les faire évoluer ; la version qui s'applique à votre commande est celle affichée le jour
          où vous la passez, et la date de mise à jour figure en haut de cette page.
        </p>
      </Section>

      <Section title="Le compte">
        <p>
          Vous pouvez commander sans créer de compte. Le compte sert à retrouver vos commandes, vos adresses et
          vos favoris ; vous restez responsable de la confidentialité de votre mot de passe.
        </p>
        <p>
          Votre numéro de téléphone doit être exact et joignable : c'est par lui que la livraison est organisée.
          Une commande dont le numéro ne répond pas ne peut pas être livrée.
        </p>
      </Section>

      <Section title="Les produits et les prix">
        <p>
          Les photos montrent les articles réellement vendus. Les dimensions sont mesurées à la main : une légère
          variation d'un exemplaire à l'autre est possible, tout comme un écart de teinte selon l'écran sur lequel
          vous regardez les photos.
        </p>
        <p>
          Les prix sont indiqués en francs CFA (XOF), par article, hors frais de livraison. Ils peuvent changer à
          tout moment, mais jamais après la validation de votre commande : c'est le prix affiché au moment de la
          commande qui s'applique.
          {shop.ninea ? "" : " La TVA n'est pas applicable."}
        </p>
      </Section>

      <Section title="Passer commande">
        <p>
          Vous choisissez vos articles et leur coloris, vous renseignez vos coordonnées et votre adresse, puis vous
          validez. Un récapitulatif s'affiche et vous recevez une confirmation.
        </p>
        <p>
          Un article peut se trouver épuisé entre l'ajout au panier et la préparation. Dans ce cas nous vous
          appelons pour vous proposer un autre coloris, un autre article ou l'annulation de la commande. Sur Dakar,
          aucune somme n'étant versée à l'avance, une annulation ne vous coûte rien. Dans les autres régions, si
          vous avez déjà payé par Wave ou Orange Money, la somme vous est reversée par le même canal.
        </p>
      </Section>

      <Section title="Paiement">
        <p>
          <strong>Sur Dakar</strong>, vous choisissez entre le règlement <strong>en espèces, à la livraison</strong>,
          entre vos mains et celles de la personne qui vous remet le colis, ou un paiement <strong>Wave ou Orange
          Money</strong>.
        </p>
        <p>
          <strong>Dans les autres régions</strong>, seul un paiement <strong>Wave ou Orange Money</strong> est
          proposé, du montant total, effectué d'avance et hors de ce site sur le numéro que nous vous communiquons.
          Nous confirmons l'encaissement avant l'expédition : c'est ce qui valide votre commande.
        </p>
        <p>
          Aucun paiement ne se fait sur ce site : aucune carte ni aucun compte bancaire ne vous est demandé, et
          aucune donnée de paiement n'y transite. Prévoyez le montant exact indiqué au récapitulatif de commande,
          frais de livraison compris.
        </p>
      </Section>

      <Section title="Livraison">
        <p>
          Avec {shop.shopName}, bénéficiez d'une livraison en moins de 24 heures dans la région de Dakar et d'une
          livraison entre 24 et 72 heures ouvrées dans les autres régions du Sénégal, à domicile ou en point relais
          où il existe.
        </p>
        <p>
          Les frais de livraison dépendent de la zone ; ils sont affichés avant la validation de la commande et
          offerts au-delà du seuil indiqué au panier. Un retard dû à une adresse incomplète, à un numéro injoignable
          ou à une absence au rendez-vous ne peut nous être imputé.
        </p>
      </Section>

      <Section title="Modalités de paiement">
        <p>
          Pour les zones éloignées de Dakar et les autres régions du Sénégal, le paiement intégral de la commande
          doit être effectué à l'avance par Orange Money ou Wave. Le paiement à la livraison n'est pas possible dans
          ces zones.
        </p>
        <p>
          <strong>Zones éloignées de Dakar</strong> : Rufisque (toutes communes), Diamniadio, Sébikotane, Keur
          Massar, Malika, Tivaouane, Tivaouane Peulh, Nianga, Boun, Ouagou Niayes, Yarakh, Sicap Mbao, Petit Mbao,
          Grand Mbao, Zac Mbao, Bambilor, Koukoune, Keur Ndiaye Lo.
        </p>
        <p>
          <strong>Autres régions du Sénégal</strong> : Thiès, Mbour, Saly, Tivaouane, Diourbel, Touba, Mbacké,
          Saint-Louis, Richard-Toll, Podor, Kaolack, Ziguinchor, Casamance, Louga, Fatick, Matam, Tambacounda,
          Kolda, Kédougou, Kaffrine, Sédhiou, Bambey, Oussouye, Dagana, Bakel, Koumpentoum, Nioro du Rip, Kébémer,
          Vélingara, Foundiougne, Goudiry, Guinguinéo, Gossas, Kanel, Salimata, Saraya, Boukiling.
        </p>
      </Section>

      <Section title="Politique de retours, remboursements et échanges">
        <p>
          Nous nous engageons à vous proposer des produits de qualité et un service irréprochable. Si toutefois un
          article ne vous convient pas, vous pouvez demander un retour ou un échange, sous réserve du respect des
          conditions ci-dessous.
        </p>

        <p><strong>📦 Retours</strong></p>
        <p>
          Vous disposez de 24 heures à compter de la réception de votre commande pour demander un retour. Pour être
          éligible, le sac doit être non utilisé, non froissé, dans son emballage d'origine et en parfait état. Les
          sacs utilisés ou froissés après livraison, ainsi que les emballages déchirés ou endommagés, ne sont pas
          éligibles au retour.
        </p>

        <p><strong>🔁 Échanges</strong></p>
        <p>
          Si vous souhaitez échanger un sac, par exemple pour une taille différente ou en cas de changement de
          préférence, la demande doit être effectuée dans les 24 heures suivant la réception. Au-delà de ce délai,
          aucun échange ne sera accepté. Les conditions d'éligibilité sont les mêmes que pour les retours : sac non
          utilisé, en parfait état et dans son emballage d'origine.
        </p>
        <p>
          Les frais de retour liés à un échange sont à la charge du client, sauf en cas d'erreur de notre part.
          Après réception et validation du sac retourné, l'échange sera effectué. Si le modèle souhaité est en
          rupture de stock, un avoir pourra être proposé.
        </p>

        <p><strong>💸 Remboursements</strong></p>
        <p>
          Après réception et validation du sac retourné, le remboursement sera effectué sous 24 à 48 heures, selon
          le mode de paiement utilisé. En cas de paiement à la livraison, le remboursement sera effectué par mobile
          money.
        </p>

        <p><strong>🚚 Produit endommagé ou erreur de commande</strong></p>
        <p>
          Si un sac est arrivé endommagé ou ne correspond pas au modèle commandé, contactez-nous au {shop.phone}
          dans les 2 heures suivant la réception, en joignant des photos à l'appui. Après vérification,{" "}
          {shop.shopName} prend en charge les frais et procède à un échange ou à un remboursement intégral, selon le
          cas.
        </p>
      </Section>

      <Section title="Le contenu du site">
        <p>
          Les photographies, les textes, le logo et la mise en page de ce site appartiennent à {shop.shopName}.
          Vous pouvez les partager pour parler de la boutique ; les reprendre pour vendre les mêmes articles
          ailleurs, ou aspirer le catalogue par un moyen automatique, n'est pas autorisé.
        </p>
      </Section>

      <Section title="Utilisation du site">
        <p>
          Le site est mis à disposition tel quel. Nous faisons le nécessaire pour qu'il reste accessible, sans
          pouvoir garantir une disponibilité sans interruption : une panne, une maintenance ou une coupure de
          réseau peuvent le rendre momentanément indisponible.
        </p>
        <p>
          Il est interdit de tenter d'accéder à des parties réservées, de passer des commandes fictives ou de
          perturber le fonctionnement du service.
        </p>
      </Section>

      <Section title="Vos données">
        <p>
          Nous ne collectons que ce qu'il faut pour vous livrer et vous joindre. Le détail figure dans notre{" "}
          <Link
            to="/confidentialite"
            className="border-b border-gold-deep/40 text-gold-deep transition-colors hover:border-gold-deep"
          >
            politique de confidentialité
          </Link>
          .
        </p>
      </Section>

      <Section title="Droit applicable">
        <p>
          Ces conditions sont soumises au droit sénégalais. En cas de désaccord, nous cherchons d'abord une
          solution à l'amiable : appelez-nous au {shop.phone}, c'est presque toujours le plus rapide. À défaut,
          les tribunaux compétents sont ceux de Dakar.
        </p>
      </Section>
    </LegalPage>
  );
}
