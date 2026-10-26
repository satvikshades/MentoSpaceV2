import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../../firebase";

function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [signedIn, setSignedIn] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => onAuthStateChanged(auth, (u) => setSignedIn(!!u)), []);

  return (
    <nav
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled ? "border-b border-line bg-white/85 backdrop-blur-md" : "border-b border-transparent bg-transparent"
      }`}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 sm:px-8">
        <Link to="/" className="wordmark text-[22px] sm:text-2xl">
          MentoSpace<span className="text-secondary">.</span>
        </Link>

        <div className="hidden items-center gap-8 text-[15px] font-semibold text-ink/70 md:flex">
          <a href="#how" className="transition hover:text-ink">How it works</a>
          <a href="#programs" className="transition hover:text-ink">Programs</a>
          <a href="#mentors" className="transition hover:text-ink">For mentors</a>
        </div>

        <div className="flex items-center gap-2">
          {signedIn ? (
            <Link to="/dashboard" className="btn-primary px-4 py-2 text-sm sm:text-[15px]">
              Open dashboard
            </Link>
          ) : (
            <>
              <Link to="/login" className="btn px-3 py-2 text-sm text-ink/80 hover:text-ink sm:text-[15px]">
                Log in
              </Link>
              <Link to="/register" className="btn-primary px-4 py-2 text-sm sm:text-[15px]">
                Get started
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
