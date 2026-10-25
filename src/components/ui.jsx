import { useEffect, useState } from "react";
import { avatarUrl } from "../lib/people";

export function Avatar({ person, size = 40, className = "", ring = false }) {
  return (
    <img
      src={avatarUrl(person)}
      alt={person?.name ? `${person.name}` : ""}
      width={size}
      height={size}
      style={{ width: size, height: size }}
      className={`shrink-0 rounded-full object-cover bg-primary-50 ${ring ? "ring-2 ring-white" : ""} ${className}`}
      loading="lazy"
    />
  );
}

export function PageHeader({ eyebrow, title, subtitle, action }) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between animate-rise">
      <div>
        {eyebrow && <p className="eyebrow mb-2">{eyebrow}</p>}
        <h1 className="text-[28px] font-extrabold leading-tight sm:text-[32px]">{title}</h1>
        {subtitle && <p className="mt-1.5 max-w-xl text-[15px] text-muted">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function EmptyState({ icon, title, body, action }) {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-dashed border-line bg-white/60 px-6 py-12 text-center">
      {icon && (
        <div className="mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-primary-50 text-xl text-primary">
          {icon}
        </div>
      )}
      <h3 className="text-base font-bold">{title}</h3>
      {body && <p className="mt-1 max-w-sm text-sm text-muted">{body}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function Skeleton({ className = "" }) {
  return <div className={`animate-pulse rounded-xl bg-bg-medium-gray ${className}`} />;
}

export function PageSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-9 w-56" />
      <Skeleton className="h-4 w-80" />
      <div className="grid gap-4 pt-4 md:grid-cols-3">
        <Skeleton className="h-36" />
        <Skeleton className="h-36" />
        <Skeleton className="h-36" />
      </div>
    </div>
  );
}

export function Spinner({ className = "h-4 w-4" }) {
  return (
    <svg className={`animate-spin ${className}`} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeOpacity="0.25" strokeWidth="3" />
      <path d="M22 12a10 10 0 0 0-10-10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

/** Circular progress used for "today" completion. */
export function Ring({ value = 0, size = 56, stroke = 6, children, track = "#e8ebf0" }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(100, value));
  return (
    <div className="relative inline-grid place-items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <defs>
          <linearGradient id="ring-grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#4a54ff" />
            <stop offset="1" stopColor="#8b3cff" />
          </linearGradient>
        </defs>
        <circle cx={size / 2} cy={size / 2} r={r} stroke={track} strokeWidth={stroke} fill="none" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke="url(#ring-grad)"
          strokeWidth={stroke}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={c}
          strokeDashoffset={c - (pct / 100) * c}
          style={{ transition: "stroke-dashoffset 0.8s cubic-bezier(0.2,0.8,0.2,1)" }}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center">{children}</div>
    </div>
  );
}

/** A small celebratory burst. Render it with a changing `fire` key. */
export function Burst({ fire }) {
  const [dots, setDots] = useState([]);
  useEffect(() => {
    if (!fire) return;
    const colors = ["#4a54ff", "#8b3cff", "#f59e0b", "#10b981", "#ec4899"];
    setDots(
      Array.from({ length: 18 }, (_, i) => {
        const angle = (i / 18) * Math.PI * 2;
        const dist = 40 + Math.random() * 50;
        return {
          id: `${fire}-${i}`,
          color: colors[i % colors.length],
          dx: `${Math.cos(angle) * dist}px`,
          dy: `${Math.sin(angle) * dist - 20}px`,
          rot: `${Math.random() * 360}deg`,
        };
      })
    );
    const t = setTimeout(() => setDots([]), 1000);
    return () => clearTimeout(t);
  }, [fire]);

  return (
    <span className="pointer-events-none absolute left-1/2 top-1/2 z-10" aria-hidden="true">
      {dots.map((d) => (
        <span
          key={d.id}
          className="burst-dot"
          style={{ background: d.color, "--dx": d.dx, "--dy": d.dy, "--rot": d.rot }}
        />
      ))}
    </span>
  );
}

export function Modal({ open, onClose, title, children, size = "max-w-md" }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose?.();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center bg-ink/40 p-0 backdrop-blur-[2px] animate-fade sm:items-center sm:p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div
        className={`w-full ${size} max-h-[92vh] overflow-y-auto rounded-t-3xl bg-white p-6 shadow-2xl animate-rise sm:rounded-3xl`}
        onClick={(e) => e.stopPropagation()}
      >
        {title && (
          <div className="mb-4 flex items-start justify-between gap-4">
            <h2 className="text-xl font-bold">{title}</h2>
            <button
              onClick={onClose}
              className="-mr-2 -mt-1 rounded-lg p-2 text-muted hover:bg-bg-light-gray hover:text-ink"
              aria-label="Close"
            >
              ✕
            </button>
          </div>
        )}
        {children}
      </div>
    </div>
  );
}

export function Badge({ children, className = "" }) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${className}`}>
      {children}
    </span>
  );
}

