import React from "react";

function Preloader() {
  return (
    <div
      id="preloader"
      className="fixed top-0 left-0 w-full h-full bg-white flex justify-center items-center z-[9999]"
    >
      <div id="preloader-logo" className="text-center animate-preloader-zoom">
        <h1 className="font-montserrat text-7xl md:text-8xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent leading-none">
          MentoSpace<span className="text-secondary">.</span>
        </h1>
        <p className="font-poppins text-lg font-medium text-text-dark mt-1 opacity-0 animate-fade-in-delayed">
          Building strong individuals
        </p>
      </div>
    </div>
  );
}

export default Preloader;
