import { Link } from "react-router-dom";

function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-line bg-bg-light-gray">
      <div className="mx-auto max-w-6xl px-5 py-14 sm:px-8">
        <div className="flex flex-col justify-between gap-10 md:flex-row">
          <div className="max-w-sm">
            <Link to="/" className="wordmark text-2xl">
              MentoSpace<span className="text-secondary">.</span>
            </Link>
            <p className="mt-3 text-sm leading-relaxed text-muted">Building strong individuals, one check-in at a time.</p>
          </div>
          <div className="grid grid-cols-2 gap-x-16 gap-y-3 text-sm font-semibold text-ink/70">
            <a href="#how" className="hover:text-ink">How it works</a>
            <Link to="/register" className="hover:text-ink">Create account</Link>
            <a href="#programs" className="hover:text-ink">Programs</a>
            <Link to="/login" className="hover:text-ink">Log in</Link>
            <a href="#mentors" className="hover:text-ink">For mentors</a>
            <Link to="/privacy" className="hover:text-ink">Privacy and consent</Link>
          </div>
        </div>

        <div className="mt-12 rounded-2xl bg-white p-5 text-sm leading-relaxed text-ink/70 ring-1 ring-line">
          MentoSpace offers mentoring and support. It is not a replacement for a doctor, psychiatrist or emergency service. If you're in crisis, contact your local
          emergency number. In India, Tele-MANAS is free and open 24/7 at{" "}
          <a href="tel:14416" className="font-bold text-primary">14416</a>.
        </div>

        <div className="mt-8 flex flex-col justify-between gap-2 text-xs text-muted sm:flex-row">
          <p>© {year} MentoSpace</p>
          <p>Made by the MentoSpace team</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
