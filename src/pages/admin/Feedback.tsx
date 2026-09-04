import { useState } from "react";
import { Card, PageHead, Pill, Btn, ConfirmModal, useAdminAction, th, td } from "../../components/admin/ui";
import { useFeedbacks, useMarkFeedbackRead, useDeleteFeedback } from "../../hooks/useFeedback";
import type { Feedback } from "../../api/feedback";
import { Trash, Check } from "../../components/icons";

export default function FeedbackAdmin() {
  const run = useAdminAction();
  const { data: rows = [] } = useFeedbacks();
  const markRead = useMarkFeedbackRead();
  const deleteFeedback = useDeleteFeedback();
  const [removing, setRemoving] = useState<Feedback | null>(null);

  const unreadCount = rows.filter((f) => !f.read).length;

  return (
    <div>
      <PageHead
        title="Avis sur le site"
        sub={`${rows.length} avis reçu(s) - ${unreadCount} non lu(s)`}
      />

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px]">
            <thead style={{ background: "var(--adm-surface-2)", color: "var(--adm-muted)" }}>
              <tr>
                <th className={th}>Reçu le</th>
                <th className={th}>De</th>
                <th className={th}>Message</th>
                <th className={th}>Statut</th>
                <th className={th}></th>
              </tr>
            </thead>
            <tbody className="divide-y" style={{ borderColor: "var(--adm-border)" }}>
              {rows.map((f) => (
                <tr key={f.id} className={f.read ? "" : "font-medium"}>
                  <td className={td} style={{ color: "var(--adm-muted)" }}>
                    {new Date(f.createdAt).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" })}
                  </td>
                  <td className={td} style={{ color: "var(--adm-text)" }}>
                    {f.name || "Anonyme"}
                    {(f.phone || f.email) && (
                      <span className="block text-xs font-normal" style={{ color: "var(--adm-muted)" }}>
                        {[f.phone, f.email].filter(Boolean).join(" - ")}
                      </span>
                    )}
                  </td>
                  <td className={`${td} max-w-md`} style={{ color: "var(--adm-text)" }}>{f.message}</td>
                  <td className={td}>
                    <Pill tone={f.read ? "gray" : "gold"}>{f.read ? "Lu" : "Non lu"}</Pill>
                  </td>
                  <td className={td}>
                    <div className="flex justify-end gap-2">
                      {!f.read && (
                        <Btn variant="ghost" onClick={() =>
                            run(markRead, { id: f.id, read: true }, {
                              failure: "L'avis n'a pas pu être marqué comme lu.",
                            })
                          }>
                          <Check /> Marquer lu
                        </Btn>
                      )}
                      <Btn variant="ghost" onClick={() => setRemoving(f)}>
                        <Trash /><span className="sr-only">Supprimer l'avis de {f.name || "cette visiteuse"}</span>
                      </Btn>
                    </div>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td className={td} colSpan={5}>
                    <span style={{ color: "var(--adm-muted)" }}>Aucun avis pour le moment.</span>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {removing && (
        <ConfirmModal
          title="Supprimer l'avis"
          message="Cet avis sera définitivement supprimé."
          confirmLabel="Supprimer"
          onConfirm={() =>
            run(deleteFeedback, removing.id, {
              success: "Avis supprimé",
              failure: "L'avis n'a pas pu être supprimé.",
            })
          }
          onClose={() => setRemoving(null)}
        />
      )}
    </div>
  );
}
