import React from "react";

const SectionTitle = ({ children, className }) => {
  return (
    <h2
      className={`font-montserrat text-3xl md:text-5xl font-bold mb-12 relative inline-block after:content-[''] after:block after:w-20 after:h-[5px] after:bg-gradient-to-r from-primary to-secondary after:mx-auto after:mt-2.5 after:rounded-full ${className}`}
    >
      {children}
    </h2>
  );
};

export default SectionTitle;
