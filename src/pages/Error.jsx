import { Link } from "react-router-dom";

function ErrorPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-bg-light-gray px-6 text-center">
      <p className="eyebrow">Error 404</p>
      <h1 className="mt-3 text-[40px] font-extrabold leading-tight sm:text-[56px]">
        This page <span className="font-serif font-medium italic text-primary">wandered off.</span>
      </h1>
      <p className="mt-4 max-w-md text-muted">The link might be old, or the page moved. Everything else is right where you left it.</p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link to="/dashboard" className="btn-primary">Go to your dashboard</Link>
        <Link to="/" className="btn-ghost">Home page</Link>
      </div>
    </div>
  );
}

export default ErrorPage;
