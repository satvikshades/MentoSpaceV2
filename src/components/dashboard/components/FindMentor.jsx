import { useState, useMemo } from "react";
import { FaSearch, FaStar, FaCheckCircle, FaAward } from "react-icons/fa";
import master_jiraya from "../../../assets/jiraiya.png";
import kakasi from "../../../assets/kakasi.png";
import minato from "../../../assets/minato.png";
import guy from "../../../assets/Might_Guy.webp";
import itachi_uchia from "../../../assets/itachi.png";
import tsunade from "../../../assets/tsunade.png";
import { allMentors } from "../../../constatnts/userdata.json";

const allExpertiseAreas = [...new Set(allMentors.flatMap((m) => m.expertise))];

const StarRating = ({ rating }) => {
  return (
    <div className="flex items-center">
      {[...Array(5)].map((_, index) => (
        <FaStar
          key={index}
          className={index < rating ? "text-yellow-400" : "text-gray-300"}
        />
      ))}
    </div>
  );
};

function FindMentor() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedExpertise, setSelectedExpertise] = useState("All");

  const filteredMentors = useMemo(() => {
    return allMentors
      .filter((mentor) =>
        mentor.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .filter((mentor) =>
        selectedExpertise === "All"
          ? true
          : mentor.expertise.includes(selectedExpertise)
      );
  }, [searchTerm, selectedExpertise]);

  return (
    <div className="space-y-6">
      {/* --- Header and Filters --- */}
      <div className="bg-white p-4 rounded-lg shadow-md space-y-4">
        <h1 className="text-3xl font-bold text-gray-800">Find Your Mentor</h1>
        <p className="text-gray-600">
          Search and connect with experienced mentors across various tech
          domains.
        </p>
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search by Name */}
          <div className="relative flex-grow">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
              <FaSearch />
            </span>
            <input
              type="text"
              placeholder="Search by mentor name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none"
            />
          </div>
          {/* Filter by Expertise */}
          <select
            value={selectedExpertise}
            onChange={(e) => setSelectedExpertise(e.target.value)}
            className="p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none cursor-pointer"
          >
            <option value="All">All Expertise Areas</option>
            {allExpertiseAreas.sort().map((area) => (
              <option key={area} value={area}>
                {area}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* --- Mentors Grid --- */}
      {filteredMentors.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMentors.map((mentor) => (
            <div
              key={mentor.id}
              className="bg-white rounded-lg shadow-md p-5 flex flex-col items-center text-center transform hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
            >
              <img
                src={mentor.profilePic}
                alt={mentor.name}
                className="w-28 h-28 rounded-full object-cover mb-4 border-4 border-gray-200"
              />
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-xl font-bold text-gray-800">
                  {mentor.name}
                </h3>
                {mentor.isVerified && (
                  <FaCheckCircle
                    className="text-blue-500"
                    title="Verified Mentor"
                  />
                )}
              </div>
              <StarRating rating={mentor.rating} />
              <div className="flex flex-wrap justify-center gap-2 my-4">
                {mentor.expertise.map((skill) => (
                  <span
                    key={skill}
                    className="bg-primary/10 text-primary text-xs font-semibold px-2.5 py-1 rounded-full"
                  >
                    {skill}
                  </span>
                ))}
              </div>
              <p className="text-gray-600 text-sm mb-4 flex-grow">
                {mentor.bio}
              </p>
              <div className="flex flex-col justify-center items-center space-y-2">
                <button className="w-full py-2 px-4 bg-primary text-white font-semibold rounded-lg hover:bg-primary/90 transition-colors duration-300 cursor-pointer">
                  View Profile
                </button>
                <button className="w-full py-2 px-4 bg-violet-500 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors duration-300 cursor-pointer">
                  Send Request
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-lg shadow-md">
          <FaSearch className="mx-auto text-4xl text-gray-400 mb-4" />
          <h2 className="text-xl font-semibold text-gray-700">
            No Mentors Found
          </h2>
          <p className="text-gray-500 mt-2">
            Please try a different search term or filter.
          </p>
        </div>
      )}
    </div>
  );
}

export default FindMentor;
