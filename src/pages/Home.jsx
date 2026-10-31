import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import Navbar from "../components/common/Navbar";
import HeroSection from "../components/HeroSection";
import AboutUs from "../components/About";
import Programs from "../components/Programs";
import Values from "../components/Values";
import JoinUs from "../components/JoinUs";
import Footer from "../components/Footer";

function Home() {
  const { hash } = useLocation();

  // Links like /#pricing from other pages land on the right section.
  useEffect(() => {
    if (!hash) return;
    const el = document.getElementById(hash.slice(1));
    if (el) requestAnimationFrame(() => el.scrollIntoView({ behavior: "smooth", block: "start" }));
  }, [hash]);

  return (
    <div className="bg-white text-ink">
      <Navbar />
      <main>
        <HeroSection />
        <AboutUs />
        <Programs />
        <Values />
        <JoinUs />
      </main>
      <Footer />
    </div>
  );
}

export default Home;
