import { FaWhatsapp } from "react-icons/fa";

type P = { className?: string; strokeWidth?: number };
const base = (p: P) => ({
  className: p.className,
  width: "1em",
  height: "1em",
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: p.strokeWidth ?? 1.4,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
});

export const Search = (p: P) => (
  <svg {...base(p)}><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
);
export const User = (p: P) => (
  <svg {...base(p)}><circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.5-6 8-6s8 2 8 6" /></svg>
);
export const Eye = (p: P) => (
  <svg {...base(p)}><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="3" /></svg>
);
export const EyeOff = (p: P) => (
  <svg {...base(p)}>
    <path d="M9.9 4.24A9.6 9.6 0 0 1 12 4c6.4 0 10 7 10 7a15.6 15.6 0 0 1-2.16 3.19" />
    <path d="M6.5 6.61C3.4 8.5 2 11 2 11s3.6 7 10 7c1.35 0 2.55-.31 3.6-.78" />
    <path d="M9.9 14.1a3 3 0 0 0 4.24-4.24" />
    <path d="M2 2l20 20" /></svg>
);
export const Heart = ({ filled, ...p }: P & { filled?: boolean }) => (
  <svg {...base(p)} fill={filled ? "currentColor" : "none"}>
    <path d="M12 20s-7-4.35-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.65-7 10-7 10Z" />
  </svg>
);
export const Bag = (p: P) => (
  <svg {...base(p)}><path d="M6 8h12l-.8 12H6.8L6 8Z" /><path d="M9 8V6a3 3 0 0 1 6 0v2" /></svg>
);
export const Close = (p: P) => (
  <svg {...base(p)}><path d="M6 6 18 18M18 6 6 18" /></svg>
);
export const Plus = (p: P) => (<svg {...base(p)}><path d="M12 5v14M5 12h14" /></svg>);
export const Minus = (p: P) => (<svg {...base(p)}><path d="M5 12h14" /></svg>);
export const ArrowRight = (p: P) => (<svg {...base(p)}><path d="M5 12h14M13 6l6 6-6 6" /></svg>);
export const ChevronDown = (p: P) => (<svg {...base(p)}><path d="m6 9 6 6 6-6" /></svg>);
export const ArrowUp = (p: P) => (<svg {...base(p)}><path d="M12 19V5M6 11l6-6 6 6" /></svg>);
export const Menu = (p: P) => (<svg {...base(p)}><path d="M4 7h16M4 12h16M4 17h16" /></svg>);
export const Truck = (p: P) => (
  <svg {...base(p)}><path d="M3 7h11v8H3zM14 10h4l3 3v2h-7z" /><circle cx="7" cy="17" r="1.6" /><circle cx="17" cy="17" r="1.6" /></svg>
);
export const Shield = (p: P) => (
  <svg {...base(p)}><path d="M12 3l7 3v5c0 5-3.5 8-7 9-3.5-1-7-4-7-9V6z" /><path d="m9 12 2 2 4-4" /></svg>
);
export const Leaf = (p: P) => (
  <svg {...base(p)}><path d="M20 4C9 4 4 9 4 20c11 0 16-5 16-16Z" /><path d="M4 20 14 10" /></svg>
);
export const Rotate = (p: P) => (
  <svg {...base(p)}><path d="M4 12a8 8 0 0 1 13.5-5.8L20 8" /><path d="M20 4v4h-4" /><path d="M20 12a8 8 0 0 1-13.5 5.8L4 16" /><path d="M4 20v-4h4" /></svg>
);
export const Star = ({ filled, ...p }: P & { filled?: boolean }) => (
  <svg {...base(p)} fill={filled ? "currentColor" : "none"} strokeWidth={filled ? 0 : 1.2}>
    <path d="m12 3 2.6 5.6 6 .8-4.4 4.2 1.1 6L12 17.8 6.7 19.6l1.1-6L3.4 9.4l6-.8z" />
  </svg>
);

// - Admin icons -
export const Grid = (p: P) => (
  <svg {...base(p)}><rect x="4" y="4" width="7" height="7" rx="1" /><rect x="13" y="4" width="7" height="7" rx="1" /><rect x="4" y="13" width="7" height="7" rx="1" /><rect x="13" y="13" width="7" height="7" rx="1" /></svg>
);
export const Box = (p: P) => (
  <svg {...base(p)}><path d="M12 3 4 7v10l8 4 8-4V7z" /><path d="m4 7 8 4 8-4M12 11v10" /></svg>
);
export const Layers = (p: P) => (
  <svg {...base(p)}><path d="M12 3 3 8l9 5 9-5z" /><path d="m3 12 9 5 9-5M3 16l9 5 9-5" /></svg>
);
export const Users = (p: P) => (
  <svg {...base(p)}><circle cx="9" cy="8" r="3.2" /><path d="M3 20c0-3.3 2.7-5 6-5s6 1.7 6 5" /><path d="M16 5.2a3.2 3.2 0 0 1 0 5.6M21 20c0-2.6-1.5-4.2-4-4.8" /></svg>
);
export const Image = (p: P) => (
  <svg {...base(p)}><rect x="3" y="4" width="18" height="16" rx="2" /><circle cx="8.5" cy="9.5" r="1.8" /><path d="m4 18 5-5 4 4 3-3 4 4" /></svg>
);
export const Tag = (p: P) => (
  <svg {...base(p)}><path d="M3 12V4h8l10 10-8 8L3 12Z" /><circle cx="7.5" cy="7.5" r="1.3" /></svg>
);
export const Chart = (p: P) => (
  <svg {...base(p)}><path d="M4 4v16h16" /><path d="M8 15v3M12 10v8M16 6v12" /></svg>
);
export const Cog = (p: P) => (
  <svg {...base(p)}><circle cx="12" cy="12" r="3.2" /><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M19.1 4.9 17 7M7 17l-2.1 2.1" /></svg>
);
export const Bell = (p: P) => (
  <svg {...base(p)}><path d="M6 9a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6Z" /><path d="M10 20a2 2 0 0 0 4 0" /></svg>
);
export const Sun = (p: P) => (
  <svg {...base(p)}><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></svg>
);
export const Moon = (p: P) => (
  <svg {...base(p)}><path d="M20 14a8 8 0 1 1-10-10 6.5 6.5 0 0 0 10 10Z" /></svg>
);
export const Edit = (p: P) => (
  <svg {...base(p)}><path d="M4 20h4L18 10l-4-4L4 16v4Z" /><path d="m13.5 6.5 4 4" /></svg>
);
export const Copy = (p: P) => (
  <svg {...base(p)}><rect x="9" y="9" width="11" height="11" rx="2" /><path d="M5 15V6a2 2 0 0 1 2-2h9" /></svg>
);
export const Archive = (p: P) => (
  <svg {...base(p)}><rect x="3" y="4" width="18" height="4" rx="1" /><path d="M5 8v11a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V8M10 12h4" /></svg>
);
export const Trash = (p: P) => (
  <svg {...base(p)}><path d="M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2M6 7l1 13h10l1-13M10 11v6M14 11v6" /></svg>
);
export const Check = (p: P) => (<svg {...base(p)}><path d="m5 12 5 5 9-11" /></svg>);
/** Anneau qui tourne : indicateur de chargement d'une action en cours. */
export const Spinner = (p: P) => (
  <svg {...base(p)} className={`animate-spin ${p.className ?? ""}`}>
    <path d="M12 3a9 9 0 1 0 9 9" />
  </svg>
);
/** Triangle plein : il se lit comme un bouton de lecture, pas comme une flèche. */
export const Play = (p: P) => (
  <svg {...base(p)} fill="currentColor" stroke="none"><path d="M8 5.5v13l11-6.5z" /></svg>
);
export const ChevronLeft = (p: P) => (<svg {...base(p)}><path d="m14 6-6 6 6 6" /></svg>);
export const ChevronRight = (p: P) => (<svg {...base(p)}><path d="m10 6 6 6-6 6" /></svg>);
export const Filter = (p: P) => (<svg {...base(p)}><path d="M3 5h18l-7 8v6l-4-2v-4z" /></svg>);
export const Download = (p: P) => (
  <svg {...base(p)}><path d="M12 3v12M8 11l4 4 4-4M4 19h16" /></svg>
);
export const Command = (p: P) => (
  <svg {...base(p)}><path d="M9 6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3z" /></svg>
);
export const Trend = (p: P) => (
  <svg {...base(p)}><path d="M3 17 9 11l4 4 8-8" /><path d="M15 7h6v6" /></svg>
);
export const Alert = (p: P) => (
  <svg {...base(p)}><path d="M12 3 2 20h20L12 3Z" /><path d="M12 9v5M12 17h.01" /></svg>
);
export const Lock = (p: P) => (
  <svg {...base(p)}><rect x="5" y="11" width="14" height="9" rx="2" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></svg>
);
export const MapPin = (p: P) => (
  <svg {...base(p)}><path d="M12 21s-6-5.2-6-10a6 6 0 0 1 12 0c0 4.8-6 10-6 10Z" /><circle cx="12" cy="11" r="2.2" /></svg>
);
export const Card = (p: P) => (
  <svg {...base(p)}><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M3 10h18M7 15h4" /></svg>
);
export const Chat = (p: P) => (
  <svg {...base(p)}><path d="M4 5h16v11H9l-4 3v-3H4z" /><path d="M8 10h.01M12 10h.01M16 10h.01" /></svg>
);
export const LogOut = (p: P) => (
  <svg {...base(p)}><path d="M15 4h3a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1h-3" /><path d="M10 12H3M6 8l-4 4 4 4" /></svg>
);
export const Phone = (p: P) => (
  <svg {...base(p)}><path d="M5 4h3l2 5-2 1.5a11 11 0 0 0 5 5L16 13l5 2v3a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2Z" /></svg>
);
/**
 * Seule icône de marque du fichier : ni les tracés maison ci-dessus ni
 * lucide-react n'incluent de logos - lucide est un jeu d'icônes d'interface,
 * pas un pack de marques. Le vrai logo WhatsApp vient donc de react-icons
 * (Font Awesome).
 */
export const WhatsApp = (p: P) => <FaWhatsapp className={p.className} />;
