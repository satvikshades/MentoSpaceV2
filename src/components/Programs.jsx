import React from "react";
import SectionTitle from "./SectionTitle";

const programData = [
  {
    title: "1. One-on-One Mentoring",
    description:
      "Personalized, confidential support sessions where individuals can connect one-on-one with a trained peer mentor. This program offers a safe space for open conversation, guidance, and encouragement.",
  },
  {
    title: "2. Group Support Sessions",
    description:
      "A welcoming group environment where participants can share experiences, listen, and provide mutual support. These sessions foster a sense of community and understanding.",
  },
  {
    title: "3. Self-Care & Mindfulness Workshop",
    description:
      "Workshops focused on teaching essential self-care practices and mindfulness techniques. Participants learn strategies for managing stress, enhancing emotional well-being, and building daily habits.",
  },
  {
    title: "4. Coping Skills Training",
    description:
      "Interactive training sessions that provide practical tools and techniques for managing difficult emotions, stress, and challenging situations. This program helps individuals develop the skills they need to navigate life's challenges.",
  },
];

const ProgramCard = ({ title, description }) => (
  <div className="bg-white p-8 rounded-lg shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 ease-in-out text-left">
    <h3 className="text-xl font-semibold text-primary mb-2.5">{title}</h3>
    <p className="text-gray-600">{description}</p>
  </div>
);

const Programs = () => {
  return (
    <section className="py-24 text-center bg-bg-medium-gray px-4">
      <div className="max-w-7xl mx-auto">
        <SectionTitle>Our Support Programs</SectionTitle>
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {programData.map((prog, index) => (
            <ProgramCard key={index} {...prog} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Programs;
