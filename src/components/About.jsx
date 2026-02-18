import React from "react";
import SectionTitle from "./SectionTitle";

const AboutUs = () => {
  return (
    <section className="py-24 text-center bg-bg-light-gray px-4">
      <div className="max-w-7xl mx-auto">
        <SectionTitle>About Us</SectionTitle>
        <p className="max-w-3xl mx-auto text-lg leading-relaxed">
          Our mission is to create a community of understanding, resilience, and
          hope. We provide a welcoming and supportive environment where
          individuals can connect, share, and grow together.
        </p>
      </div>
    </section>
  );
};

export default AboutUs;
