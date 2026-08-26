import { useToastStore } from "../store/useToastStore";
import { Check } from "./icons";

export default function Toasts() {
  const toasts = useToastStore((s) => s.toasts);
  return (
    <div className="pointer-events-none fixed bottom-6 left-1/2 z-[70] flex -translate-x-1/2 flex-col items-center gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          className="pointer-events-auto flex items-center gap-2.5 rounded-full bg-ink px-5 py-3 text-sm text-cream shadow-lg animate-fade-up"
        >
          <span className="text-gold"><Check /></span>
          {t.msg}
        </div>
      ))}
    </div>
  );
}
