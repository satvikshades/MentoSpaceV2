import React from "react";
import SectionTitle from "./SectionTitle";
import { Link } from "react-router-dom";

const statsData = [
  { number: "100+", label: "Mentors" },
  { number: "500+", label: "Students" },
  { number: "20+", label: "Programs" },
];

const StatCard = ({ number, label }) => (
  <div className="bg-white p-8 rounded-lg shadow-sm">
    <h3 className="font-montserrat text-5xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent leading-none mb-2.5">
      {number}
    </h3>
    <p className="text-lg font-medium text-gray-500">{label}</p>
  </div>
);

const JoinUs = () => {
  return (
    <section className="py-24 text-center bg-bg-light-gray px-4">
      <div className="max-w-7xl mx-auto">
        <SectionTitle>Join Our Growing Community</SectionTitle>
        <div className="max-w-4xl mx-auto grid gap-8 md:grid-cols-3 mb-12">
          {statsData.map((stat, index) => (
            <StatCard key={index} {...stat} />
          ))}
        </div>
        <Link
          to="/register"
          className="inline-block px-9 py-4 bg-primary text-white font-semibold text-lg rounded-full transition-all duration-300 ease-in-out shadow-lg hover:-translate-y-1 hover:shadow-2xl"
        >
          Register Now
        </Link>
      </div>
    </section>
  );
};

export default JoinUs;
