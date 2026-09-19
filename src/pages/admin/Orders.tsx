import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Card, PageHead, Pill, Btn, Input, Select, Modal, useAdminAction, useUI, fcfa, th, td } from "../../components/admin/ui";
import { useOrderPage, useUpdateOrder } from "../../hooks/useOrders";
import { exportOrdersCsv, downloadInvoice, type Order, type OrderStatus } from "../../api/orders";
import { Download, Truck, Check, Spinner } from "../../components/icons";
import { downloadBlob, stampedName } from "../../utils/download";

const flow: OrderStatus[] = ["En préparation", "En cours de livraison", "Livrée"];
const payTone = (p: Order["pay"]) => (p === "Payé" ? "green" : p === "En attente" ? "amber" : "red");
const statusTone = (s: OrderStatus) =>
  s === "Livrée" ? "green" : s === "Retournée" ? "red" : s === "En préparation" ? "amber" : "blue";

/**
 * Sur Dakar, le paiement se règle à la livraison - en espèces ou en mobile
 * money entre les mains de la livreuse - ou d'avance via le lien si la
 * cliente préfère : dans tous les cas, `settleOnDelivery` côté serveur solde
 * le paiement au passage à « Livrée », rien à bloquer avant.
 *
 * Hors Dakar, le mobile money est le seul moyen ouvert et il est réglé
 * d'avance, hors du site : celui-ci ne peut donc jamais savoir tout seul que
 * le paiement est passé. Tant qu'une commande de ce type n'est pas marquée
 * payée ici, elle reste bloquée avant l'étape suivante - c'est ce qui
 * « valide » la commande.
 */
const needsPaymentConfirmation = (o: Order) => !o.codEligible && o.pay !== "Payé";

export default function Orders() {
  const { toast } = useUI();
  const run = useAdminAction();
  const [pay, setPay] = useState("all");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [openId, setOpenId] = useState<string | null>(null);
  // Lu depuis l'URL : le lien de l'e-mail « nouvelle commande » pointe ici
  // avec le numéro en query (?search=), pour amener directement l'admin à la
  // commande à confirmer plutôt qu'à une liste vide de recherche.
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState(() => searchParams.get("search") ?? "");

  /**
   * Filtrage ET pagination faits PAR LE SERVEUR (comme la boutique publique,
   * `Listing.tsx`) : filtrer en mémoire une page chargée sans limite explicite
   * ne portait que sur les 25 premières commandes renvoyées par défaut par
   * l'API, ce qui rendait les filtres muets dès que la boutique dépassait ce
   * volume.
   */
  const { data: pageData, isLoading } = useOrderPage({
    ...(pay !== "all" ? { pay: pay as Order["pay"] } : {}),
    ...(status !== "all" ? { status: status as OrderStatus } : {}),
    ...(search.trim() ? { search: search.trim() } : {}),
    page,
    limit: 25,
  });
  const rows = pageData?.items ?? [];
  const meta = pageData?.meta;
  const updateOrder = useUpdateOrder();

  // Changer un filtre ramène à la première page, sinon rester page 3 après
  // avoir filtré afficherait une page vide sans explication.
  useEffect(() => {
    setPage(1);
  }, [pay, status, search]);

  function updateSearch(value: string) {
    setSearch(value);
    setSearchParams(value ? { search: value } : {}, { replace: true });
  }

  // Ouvre directement le détail de la commande visée par une recherche exacte
  // sur son numéro (le lien de l'e-mail de notification) : l'admin n'a pas à
  // la repérer elle-même dans la liste pour confirmer le paiement.
  useEffect(() => {
    if (!search.trim() || openId) return;
    const match = rows.find((o) => o.id === search.trim());
    if (match) setOpenId(match.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows, search]);

  const open = rows.find((o) => o.id === openId) ?? null;

  // Vrai seulement pendant un changement de statut (pas un changement de
  // livreur, qui passe par la même mutation) : c'est ce qui pilote le bouton.
  const advancing = updateOrder.isPending && updateOrder.variables?.input.status !== undefined;

  /**
   * Export CSV. Le serveur renvoie un fichier : on le télécharge via une URL
   * temporaire d'objet, révoquée juste après pour ne pas fuir de mémoire.
   */
  async function exportCsv() {
    try {
      const blob = await exportOrdersCsv({
        ...(pay !== "all" ? { pay: pay as Order["pay"] } : {}),
        ...(status !== "all" ? { status: status as OrderStatus } : {}),
        ...(search.trim() ? { search: search.trim() } : {}),
      });
      downloadBlob(blob, stampedName("commandes"));
      toast("Export téléchargé");
    } catch {
      toast("L'export n'a pas pu être généré");
    }
  }

  /** Reçu PDF de la commande, généré par le serveur. */
  async function printReceipt(o: Order) {
    try {
      downloadBlob(await downloadInvoice(o.id), `recu-${o.id}.pdf`);
    } catch {
      toast("Le reçu n'a pas pu être téléchargé");
    }
  }

  const advance = (o: Order) => {
    if (needsPaymentConfirmation(o)) {
      toast("Confirmez le paiement avant de faire avancer cette commande.", "error");
      return;
    }
    const i = flow.indexOf(o.status);
    if (i < 0 || i >= flow.length - 1) return;
    const next = flow[i + 1];
    run(updateOrder, { id: o.id, input: { status: next } }, {
      success: `${o.id} → ${next}`,
      failure: "Le statut de la commande n'a pas pu être changé.",
    });
  };

  const confirmPayment = (o: Order) =>
    run(updateOrder, { id: o.id, input: { pay: "Payé" } }, {
      success: `Paiement de ${o.id} confirmé`,
      failure: "Le paiement n'a pas pu être confirmé.",
    });

  return (
    <div>
      <PageHead
        title="Commandes & livraison"
        sub={isLoading ? "Chargement…" : `${meta?.total ?? 0} commandes`}
        action={<Btn variant="ghost" onClick={exportCsv}><Download /> Exporter en CSV</Btn>}
      />

      <Card className="mb-4 p-4">
        <div className="grid gap-3 md:grid-cols-3">
          <Input
            placeholder="Rechercher (n°, client, téléphone, ville, suivi)"
            value={search}
            onChange={(e) => updateSearch(e.target.value)}
          />
          <Select value={pay} onChange={(e) => setPay(e.target.value)}>
            <option value="all">Tous paiements</option>
            <option>Payé</option><option>En attente</option><option>Échoué</option>
          </Select>
          <Select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="all">Tous statuts livraison</option>
            {flow.concat("Retournée").map((s) => <option key={s}>{s}</option>)}
          </Select>
        </div>
      </Card>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px]">
            <thead style={{ background: "var(--adm-surface-2)", color: "var(--adm-muted)" }}>
              <tr>
                <th className={th}>N°</th><th className={th}>Client</th><th className={th}>Montant</th>
                <th className={th}>Paiement</th><th className={th}>Livraison</th><th className={th}>Transporteur</th>
                <th className={`${th} text-right`}>Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y" style={{ borderColor: "var(--adm-border)" }}>
              {rows.map((o) => (
                <tr key={o.id} className="hover:bg-[var(--adm-hover)]">
                  <td className={td}><span className="font-medium" style={{ color: "var(--adm-text)" }}>{o.id}</span></td>
                  <td className={td} style={{ color: "var(--adm-muted)" }}>{o.client}<br /><span className="text-xs">{o.city}</span></td>
                  <td className={td} style={{ color: "var(--adm-text)" }}>{fcfa(o.total)}</td>
                  <td className={td}><Pill tone={payTone(o.pay)}>{o.pay}</Pill><br /><span className="mt-1 inline-block text-xs" style={{ color: "var(--adm-muted)" }}>{o.method}</span></td>
                  <td className={td}><Pill tone={statusTone(o.status)}>{o.status}</Pill></td>
                  <td className={td} style={{ color: "var(--adm-muted)" }}>{o.courier ?? "-"}{o.tracking && <><br /><span className="text-xs">{o.tracking}</span></>}</td>
                  <td className={`${td} text-right`}><Btn variant="ghost" onClick={() => setOpenId(o.id)}>Détail</Btn></td>
                </tr>
              ))}
              {rows.length === 0 && !isLoading && (
                <tr>
                  <td className={td} colSpan={7}>
                    <span style={{ color: "var(--adm-muted)" }}>Aucune commande ne correspond à ces filtres.</span>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {meta && meta.totalPages > 1 && (
        <nav aria-label="Pagination" className="mt-4 flex flex-wrap items-center justify-center gap-2">
          <Btn variant="ghost" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={!meta.hasPrev}>
            Précédent
          </Btn>
          {Array.from({ length: meta.totalPages }, (_, i) => i + 1).map((n) => (
            <Btn key={n} variant={n === meta.page ? "primary" : "ghost"} onClick={() => setPage(n)}>
              {n}
            </Btn>
          ))}
          <Btn variant="ghost" onClick={() => setPage((p) => p + 1)} disabled={!meta.hasNext}>
            Suivant
          </Btn>
        </nav>
      )}

      {open && (
        <Modal title={`Commande ${open.id}`} onClose={() => setOpenId(null)} wide>
          {/* Timeline suivi */}
          <div className="mb-6 flex items-center justify-between">
            {flow.map((s, i) => {
              const done = flow.indexOf(open.status) >= i;
              return (
                <div key={s} className="flex flex-1 flex-col items-center">
                  <div className="flex w-full items-center">
                    {i > 0 && <div className="h-0.5 flex-1" style={{ background: done ? "#c9a876" : "var(--adm-border)" }} />}
                    <div className={`grid h-8 w-8 place-items-center rounded-full text-xs ${done ? "bg-[#c9a876] text-white" : ""}`} style={done ? undefined : { background: "var(--adm-hover)", color: "var(--adm-muted)" }}>
                      {done ? <Check /> : i + 1}
                    </div>
                    {i < flow.length - 1 && <div className="h-0.5 flex-1" style={{ background: flow.indexOf(open.status) > i ? "#c9a876" : "var(--adm-border)" }} />}
                  </div>
                  <span className="mt-2 text-center text-[0.65rem]" style={{ color: "var(--adm-muted)" }}>{s}</span>
                </div>
              );
            })}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg border p-3" style={{ borderColor: "var(--adm-border)" }}>
              <p className="text-xs uppercase tracking-wider" style={{ color: "var(--adm-muted)" }}>Livraison</p>
              <p className="mt-1 text-sm" style={{ color: "var(--adm-text)" }}>{open.client}</p>
              <a href={`tel:${open.phone}`} className="text-sm hover:underline" style={{ color: "var(--adm-text)" }}>{open.phone}</a>
              <p className="text-sm" style={{ color: "var(--adm-muted)" }}>{open.addressLine}</p>
              {open.landmark && <p className="text-sm italic" style={{ color: "var(--adm-muted)" }}>{open.landmark}</p>}
              <p className="text-sm" style={{ color: "var(--adm-muted)" }}>{open.city}, {open.country} - {open.deliveryMode}</p>
              {open.note && (
                <p className="mt-2 text-xs" style={{ color: "var(--adm-text)" }}>Note : {open.note}</p>
              )}
            </div>
            <div className="rounded-lg border p-3" style={{ borderColor: "var(--adm-border)" }}>
              <p className="text-xs uppercase tracking-wider" style={{ color: "var(--adm-muted)" }}>Paiement</p>
              <p className="mt-1 text-sm" style={{ color: "var(--adm-text)" }}>{open.method} - <Pill tone={payTone(open.pay)}>{open.pay}</Pill></p>
              {needsPaymentConfirmation(open) && (
                <Btn variant="ghost" className="mt-2" onClick={() => confirmPayment(open)} disabled={updateOrder.isPending}>
                  <Check /> Confirmer le paiement
                </Btn>
              )}
            </div>
          </div>

          <div className="mt-4 rounded-lg border" style={{ borderColor: "var(--adm-border)" }}>
            {open.items.map((it, i) => (
              <div key={i} className="flex items-center gap-3 border-b px-4 py-2.5 text-sm last:border-0" style={{ borderColor: "var(--adm-border)" }}>
                <img
                  src={it.image}
                  alt=""
                  className="h-12 w-10 shrink-0 rounded object-cover"
                  style={{ background: "var(--adm-hover)" }}
                />
                <span className="flex-1" style={{ color: "var(--adm-text)" }}>{it.name}{it.color ? ` - ${it.color}` : ""} × {it.qty}</span>
                <span style={{ color: "var(--adm-muted)" }}>{fcfa(it.price * it.qty)}</span>
              </div>
            ))}
            <div className="flex justify-between px-4 pt-2.5 text-sm" style={{ color: "var(--adm-muted)" }}>
              <span>Sous-total</span><span>{fcfa(open.subtotal)}</span>
            </div>
            <div className="flex justify-between px-4 pt-1 text-sm" style={{ color: "var(--adm-muted)" }}>
              <span>Livraison</span><span>{open.shippingFee === 0 ? "Offerte" : fcfa(open.shippingFee)}</span>
            </div>
            {open.discount > 0 && (
              <div className="flex justify-between px-4 pt-1 text-sm" style={{ color: "var(--adm-muted)" }}>
                <span>Remise{open.promoCode ? ` (${open.promoCode})` : ""}</span><span>−{fcfa(open.discount)}</span>
              </div>
            )}
            <div className="flex justify-between px-4 py-2.5 text-sm font-semibold" style={{ color: "var(--adm-text)" }}>
              <span>Total à encaisser</span><span>{fcfa(open.total)}</span>
            </div>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <label className="block text-sm">
              <span style={{ color: "var(--adm-muted)" }}>Transporteur / livreur</span>
              <Select
                value={open.courier ?? "-"}
                onChange={(e) =>
                  run(updateOrder, { id: open.id, input: { courier: e.target.value } }, {
                    success: "Livreur enregistré",
                    failure: "Le livreur n'a pas pu être enregistré.",
                  })
                }
                className="mt-1.5"
              >
                <option>-</option><option>Livreur - Moussa</option><option>Livreur - Ibrahima</option><option>Retrait en point relais</option>
              </Select>
            </label>
            <div className="flex flex-col items-end gap-1">
              <div className="flex items-end gap-2">
                <Btn variant="ghost" onClick={() => printReceipt(open)}>
                  <Download /> Imprimer
                </Btn>
                {open.status === "Livrée" ? (
                  <Btn onClick={() => setOpenId(null)}>
                    <Check /> Terminer
                  </Btn>
                ) : (
                  <Btn
                    onClick={() => advance(open)}
                    disabled={open.status === "Retournée" || advancing || needsPaymentConfirmation(open)}
                  >
                    {advancing ? <Spinner /> : <Truck />} Étape suivante
                  </Btn>
                )}
              </div>
              {needsPaymentConfirmation(open) && open.status !== "Livrée" && (
                <span className="text-xs" style={{ color: "var(--adm-muted)" }}>
                  Paiement à confirmer avant de continuer.
                </span>
              )}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
