import Navbar from "../components/common/Navbar";
import HeroSection from "../components/HeroSection";
import AboutUs from "../components/About";
import Programs from "../components/Programs";
import Values from "../components/Values";
import JoinUs from "../components/JoinUs";
import Footer from "../components/Footer";

function Home() {
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
