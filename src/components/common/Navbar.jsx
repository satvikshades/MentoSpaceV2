import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { FiArrowRight, FiMenu, FiX } from "react-icons/fi";

const LINKS = [
  ["how", "How it works"],
  ["programs", "Programs"],
  ["pricing", "Pricing"],
  ["mentors", "For mentors"],
];

function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  // On the home page the links scroll; elsewhere they go back home first.
  const href = (id) => (pathname === "/" ? `#${id}` : `/#${id}`);
  const solid = scrolled || open || pathname !== "/";

  return (
    <nav
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        solid ? "border-b border-line bg-white/90 backdrop-blur-md" : "border-b border-transparent bg-transparent"
      }`}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 sm:px-8">
        <Link to="/" className="wordmark text-[22px] sm:text-2xl">
          MentoSpace<span className="text-secondary">.</span>
        </Link>

        <div className="hidden items-center gap-8 text-[15px] font-semibold text-ink/70 md:flex">
          {LINKS.map(([id, label]) =>
            pathname === "/" ? (
              <a key={id} href={href(id)} className="transition hover:text-ink">{label}</a>
            ) : (
              <Link key={id} to={href(id)} className="transition hover:text-ink">{label}</Link>
            )
          )}
        </div>

        <div className="flex items-center gap-2">
          <Link to="/contact" className="btn-primary px-4 py-2 text-sm sm:text-[15px]">
            <span className="hidden sm:inline">Book a pilot</span>
            <span className="sm:hidden">Contact us</span>
            <FiArrowRight className="hidden sm:block" />
          </Link>
          <button
            onClick={() => setOpen((o) => !o)}
            className="rounded-lg p-2 text-ink/70 hover:bg-bg-light-gray hover:text-ink md:hidden"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
          >
            {open ? <FiX className="h-5 w-5" /> : <FiMenu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-line bg-white px-5 pb-5 pt-2 animate-fade md:hidden">
          {LINKS.map(([id, label]) => (
            <Link key={id} to={`/#${id}`} onClick={() => setOpen(false)} className="block rounded-xl px-3 py-3 text-[15px] font-semibold text-ink/80 hover:bg-bg-light-gray">
              {label}
            </Link>
          ))}
          <Link to="/contact" className="block rounded-xl px-3 py-3 text-[15px] font-semibold text-primary hover:bg-primary-50">
            Contact us
          </Link>
        </div>
      )}
    </nav>
  );
}

export default Navbar;
