import { createContext, useContext, useState, type ReactNode } from "react";
import { Check, Alert, Close } from "../icons";

export const fcfa = (n: number) => `${n.toLocaleString("fr-FR")} FCFA`;

// — Toasts —
type Toast = { id: number; msg: string; kind: "success" | "error" };
type AdminUI = { toast: (msg: string, kind?: "success" | "error") => void };
const UICtx = createContext<AdminUI | null>(null);
export const useUI = () => {
  const c = useContext(UICtx);
  if (!c) throw new Error("useUI outside provider");
  return c;
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<Toast[]>([]);
  const toast: AdminUI["toast"] = (msg, kind = "success") => {
    const id = Date.now() + Math.random();
    setItems((s) => [...s, { id, msg, kind }]);
    setTimeout(() => setItems((s) => s.filter((t) => t.id !== id)), 3200);
  };
  return (
    <UICtx.Provider value={{ toast }}>
      {children}
      <div className="pointer-events-none fixed bottom-5 left-1/2 z-[60] flex -translate-x-1/2 flex-col items-center gap-2">
        {items.map((t) => (
          <div
            key={t.id}
            className="pointer-events-auto flex items-center gap-2.5 rounded-lg border px-4 py-3 text-sm shadow-lg animate-fade-up"
            style={{
              background: "var(--adm-surface)",
              borderColor: "var(--adm-border)",
              color: "var(--adm-text)",
            }}
          >
            <span className={t.kind === "success" ? "text-emerald-600" : "text-rose-600"}>
              {t.kind === "success" ? <Check /> : <Alert />}
            </span>
            {t.msg}
          </div>
        ))}
      </div>
    </UICtx.Provider>
  );
}

// — Primitives —
export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={`rounded-xl border ${className}`}
      style={{ background: "var(--adm-surface)", borderColor: "var(--adm-border)" }}
    >
      {children}
    </div>
  );
}

export function PageHead({ title, sub, action }: { title: string; sub?: string; action?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="serif text-2xl" style={{ color: "var(--adm-text)" }}>{title}</h1>
        {sub && <p className="mt-1 text-sm" style={{ color: "var(--adm-muted)" }}>{sub}</p>}
      </div>
      {action}
    </div>
  );
}

const pillStyles: Record<string, string> = {
  green: "bg-emerald-500/12 text-emerald-600",
  amber: "bg-amber-500/15 text-amber-600",
  red: "bg-rose-500/12 text-rose-600",
  blue: "bg-sky-500/12 text-sky-600",
  gray: "bg-gray-500/12 text-gray-500",
  gold: "bg-[#c9a876]/20 text-[#9a7b3f]",
};
export function Pill({ tone = "gray", children }: { tone?: keyof typeof pillStyles | string; children: ReactNode }) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${pillStyles[tone] ?? pillStyles.gray}`}>
      {children}
    </span>
  );
}

export function Btn({
  children, onClick, variant = "primary", type = "button", disabled, className = "",
}: {
  children: ReactNode; onClick?: () => void; variant?: "primary" | "ghost" | "danger";
  type?: "button" | "submit"; disabled?: boolean; className?: string;
}) {
  const styles = {
    primary: "text-white hover:opacity-90",
    ghost: "border hover:bg-[var(--adm-hover)]",
    danger: "bg-rose-600 text-white hover:bg-rose-700",
  }[variant];
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all active:scale-[0.98] disabled:opacity-40 ${styles} ${className}`}
      style={
        variant === "primary"
          ? { background: "var(--adm-nav)" }
          : variant === "ghost"
          ? { borderColor: "var(--adm-border)", color: "var(--adm-text)" }
          : undefined
      }
    >
      {children}
    </button>
  );
}

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  const { className = "", ...rest } = props;
  return (
    <input
      {...rest}
      className={`w-full rounded-lg border px-3 py-2.5 text-sm outline-none transition-colors focus:border-[#c9a876] ${className}`}
      style={{ background: "var(--adm-surface-2)", borderColor: "var(--adm-border)", color: "var(--adm-text)" }}
    />
  );
}

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  const { className = "", children, ...rest } = props;
  return (
    <select
      {...rest}
      className={`w-full rounded-lg border px-3 py-2.5 text-sm outline-none focus:border-[#c9a876] ${className}`}
      style={{ background: "var(--adm-surface-2)", borderColor: "var(--adm-border)", color: "var(--adm-text)" }}
    >
      {children}
    </select>
  );
}

// — Modale (confirmations, formulaires) —
export function Modal({
  title, children, onClose, wide,
}: { title: string; children: ReactNode; onClose: () => void; wide?: boolean }) {
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-[1px]" onClick={onClose} />
      <div
        className={`relative z-10 max-h-[88vh] w-full ${wide ? "max-w-2xl" : "max-w-md"} overflow-y-auto rounded-2xl border shadow-2xl animate-fade-up`}
        style={{ background: "var(--adm-surface)", borderColor: "var(--adm-border)" }}
      >
        <div className="flex items-center justify-between border-b px-5 py-4" style={{ borderColor: "var(--adm-border)" }}>
          <h3 className="serif text-lg" style={{ color: "var(--adm-text)" }}>{title}</h3>
          <button onClick={onClose} className="text-xl" style={{ color: "var(--adm-muted)" }}><Close /></button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

export function ConfirmModal({
  title, message, confirmLabel = "Confirmer", onConfirm, onClose,
}: { title: string; message: string; confirmLabel?: string; onConfirm: () => void; onClose: () => void }) {
  return (
    <Modal title={title} onClose={onClose}>
      <p className="text-sm" style={{ color: "var(--adm-muted)" }}>{message}</p>
      <div className="mt-6 flex justify-end gap-3">
        <Btn variant="ghost" onClick={onClose}>Annuler</Btn>
        <Btn variant="danger" onClick={() => { onConfirm(); onClose(); }}>{confirmLabel}</Btn>
      </div>
    </Modal>
  );
}

export const th = "px-4 py-3 text-left text-[0.68rem] font-semibold uppercase tracking-wider";
export const td = "px-4 py-3.5 text-sm";
