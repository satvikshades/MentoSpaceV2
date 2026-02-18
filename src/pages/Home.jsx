import { useEffect, useState } from "react";
import Navbar from "../components/common/Navbar";
import Preloader from "../components/Preloader";
import HeroSection from "../components/HeroSection";
import AboutUs from "../components/About";
import Programs from "../components/Programs";
import Values from "../components/Values";
import Testimonials from "../components/Testimonials";
import JoinUs from "../components/JoinUs";
import Footer from "../components/Footer";

function Home() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 3000); // Same duration as the preloader animation

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return <Preloader />;
  }
  return (
    <>
      <div className="font-poppins text-text-dark bg-bg-light-gray">
        <Navbar />
        <main>
          <HeroSection />
          <AboutUs />
          <Programs />
          <Values />
          <Testimonials />
          <JoinUs />
        </main>
        <Footer />
      </div>
    </>
  );
}

export default Home;
