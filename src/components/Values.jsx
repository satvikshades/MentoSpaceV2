import React from "react";
import SectionTitle from "./SectionTitle";

const valuesData = [
  { title: "Respect", description: "For every individual's unique path" },
  { title: "Hope", description: "That everyone can achieve positive change" },
  {
    title: "Empowerment",
    description: "Through shared stories and mutual support",
  },
  {
    title: "Self-awareness",
    description: "To recognize and embrace personal growth",
  },
];

const ValueCard = ({ title, description }) => (
  <div className="bg-white p-8 rounded-lg shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 ease-in-out text-left md:text-center">
    <h3 className="text-xl font-semibold text-primary mb-2.5">{title}</h3>
    <p className="text-gray-600">{description}</p>
  </div>
);

const Values = () => {
  return (
    <section className="py-24 text-center bg-bg-light-gray px-4">
      <div className="max-w-7xl mx-auto">
        <SectionTitle>Our Values</SectionTitle>
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {valuesData.map((val, index) => (
            <ValueCard key={index} {...val} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Values;
