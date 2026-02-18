import React from "react";
import { Link } from "react-router-dom";

const HeroSection = () => {
  return (
    <header className="min-h-screen bg-white text-text-dark flex items-center justify-center text-center pt-24 px-4">
      <div className="max-w-4xl">
        <h1 className="font-montserrat text-5xl md:text-7xl font-bold mb-5 leading-tight">
          <span
            className="block opacity-0 animate-slide-up"
            style={{ animationDelay: "0s" }}
          >
            A Safe Space to
          </span>
          <span
            className="block opacity-0 animate-slide-up"
            style={{ animationDelay: "0.2s" }}
          >
            Heal and Grow
          </span>
          <span
            className="block opacity-0 animate-slide-up"
            style={{ animationDelay: "0.4s" }}
          >
            Together
          </span>
        </h1>

        <p className="text-base md:text-lg max-w-2xl mx-auto mb-6 leading-relaxed">
          Through peer support, we empower people to develop the skills needed
          to navigate life's challenges, enhance their quality of life, and
          pursue their personal goals.
        </p>

        {/* Vision Statement */}
        <div className="mb-10 mt-2">
  <p className="text-gray-500 text-sm italic">
    A vision by <span className="font-medium">Satvik Sanisetty</span>
  </p>
  <p className="text-gray-600 text-sm mt-1">
    Creating a world where no one has to face depression alone.
  </p>
</div>

        <Link
          to="/register"
          className="inline-block px-9 py-4 bg-primary text-white font-semibold text-lg rounded-full transition-all duration-300 ease-in-out shadow-lg hover:-translate-y-1 hover:shadow-2xl"
        >
          Get Started
        </Link>
      </div>
    </header>
  );
};

export default HeroSection;