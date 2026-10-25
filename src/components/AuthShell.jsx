import { useState } from "react";
import { Link } from "react-router-dom";
import { FiEye, FiEyeOff } from "react-icons/fi";

export function GoogleIcon() {
  return (
    <svg viewBox="0 0 48 48" className="h-5 w-5" aria-hidden="true">
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
      <path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2c-2 1.5-4.5 2.4-7.2 2.4-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" />
    </svg>
  );
}

export function PasswordInput({ id, value, onChange, placeholder = "Password", autoComplete = "current-password", invalid }) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <input
        id={id}
        name={id}
        type={show ? "text" : "password"}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className={`field pr-11 ${invalid ? "border-red-400 focus:border-red-500 focus:ring-red-500/10" : ""}`}
      />
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        className="absolute inset-y-0 right-0 grid w-11 place-items-center text-muted hover:text-ink"
        aria-label={show ? "Hide password" : "Show password"}
      >
        {show ? <FiEyeOff /> : <FiEye />}
      </button>
    </div>
  );
}

export function FieldError({ children }) {
  if (!children) return null;
  return <p className="mt-1.5 text-[13px] font-medium text-red-600">{children}</p>;
}

export function Divider() {
  return (
    <div className="flex items-center gap-3 text-xs font-semibold uppercase tracking-wider text-muted">
      <span className="h-px flex-1 bg-line" /> or <span className="h-px flex-1 bg-line" />
    </div>
  );
}

/** Two-column auth layout: a quiet brand panel on the left, the form on the right. */
export default function AuthShell({ title, subtitle, children, side }) {
  return (
    <div className="flex min-h-screen bg-white">
      <aside className="relative hidden w-[44%] max-w-[620px] overflow-hidden bg-bg-dark p-12 text-white lg:flex lg:flex-col">
        <div className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-primary/40 blur-[110px]" />
        <div className="pointer-events-none absolute -bottom-40 -left-24 h-96 w-96 rounded-full bg-secondary/30 blur-[120px]" />
        <Link to="/" className="relative text-2xl font-extrabold tracking-tight">
          MentoSpace<span className="text-secondary">.</span>
        </Link>
        <div className="relative mt-auto">{side}</div>
      </aside>

      <main className="flex flex-1 flex-col px-5 py-8 sm:px-10">
        <Link to="/" className="wordmark text-xl lg:hidden">
          MentoSpace<span className="text-secondary">.</span>
        </Link>
        <div className="mx-auto flex w-full max-w-[400px] flex-1 flex-col justify-center py-10">
          <h1 className="text-[30px] font-extrabold leading-tight">{title}</h1>
          {subtitle && <p className="mt-2 text-[15px] text-muted">{subtitle}</p>}
          <div className="mt-8">{children}</div>
        </div>
      </main>
    </div>
  );
}
