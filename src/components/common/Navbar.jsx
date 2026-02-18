import { Link, useNavigate } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();

  return (
    <>
      <nav className="fixed top-0 left-0 w-full bg-white shadow-md z-[999]">
        <div className="flex justify-between items-center max-w-7xl mx-auto px-6 md:px-14 py-4">
          <div className="flex flex-col items-start">
            <Link to="/">
              <h1 className="font-montserrat text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent tracking-tighter leading-none">
                MentoSpace<span className="text-secondary">.</span>
              </h1>
            </Link>
            <p className="font-poppins text-sm font-medium text-text-dark mt-1 opacity-90">
              Building strong individuals
            </p>
          </div>
          <div className="flex items-center gap-5">
            {/* <div className="hidden md:block text-right font-poppins text-sm text-text-dark">
              <p className="leading-tight">Reach out to us at:</p>
              <p className="leading-tight">permanentwofliving@gmail.com</p>
            </div> */}
            <button
              onClick={() => navigate("/login")}
              className="inline-block px-6 py-2.5 bg-white text-primary font-semibold text-base rounded-full border-2 border-primary transition-transform duration-300 ease-in-out hover:-translate-y-0.5 cursor-pointer"
            >
              Login
            </button>
            <button
              onClick={() => navigate("/register")}
              className="inline-block px-6 py-2.5 bg-primary text-white font-semibold text-base rounded-full transition-transform duration-300 ease-in-out hover:-translate-y-0.5 cursor-pointer"
            >
              Register
            </button>
          </div>
        </div>
      </nav>
    </>
  );
}

export default Navbar;
