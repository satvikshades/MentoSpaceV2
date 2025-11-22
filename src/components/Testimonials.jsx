import React from "react";
import SectionTitle from "./SectionTitle";

const testimonialData = [
  {
    quote:
      "Joining MentoSpace Community has been life-changing. The one-on-one mentoring sessions gave me a safe space to open up and feel truly understood. I found guidance and support that helped me see things from a new perspective.",
    author: "- Alpha A, 22 Years Old",
  },
  {
    quote:
      "I was hesitant at first, but the group support sessions have become a highlight of my week. Knowing there are others who share similar struggles has brought me a sense of belonging I didn't know I needed.",
    author: "- Alpha B, 23 Years Old",
  },
  {
    quote:
      "Being part of the Peer-to-Peer Mentorship program was inspiring. Hearing the stories of others who've overcome similar challenges reminded me that I'm not alone, and that recovery is possible. It's truly empowering.",
    author: "- Alpha C, 23 Years Old",
  },
];

const TestimonialCard = ({ quote, author }) => (
  <div className="bg-[#3b3b3b] p-8 rounded-lg border border-gray-700 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 ease-in-out text-left">
    <p className="italic text-lg mb-4 leading-relaxed">"{quote}"</p>
    <p className="font-semibold text-secondary">{author}</p>
  </div>
);

const Testimonials = () => {
  return (
    <section className="py-24 text-center bg-bg-dark text-white px-4">
      <div className="max-w-7xl mx-auto">
        <SectionTitle className="text-white">
          Stories of Hope and Strength
        </SectionTitle>
        <div className="grid gap-8 lg:grid-cols-3">
          {testimonialData.map((t, index) => (
            <TestimonialCard key={index} {...t} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
