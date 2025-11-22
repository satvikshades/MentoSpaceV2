import { Outlet } from "react-router-dom";
import { BiMenu } from "react-icons/bi";
import { useState } from "react";
import Sidebar from "./components/Sidebar";

function DashboardLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="relative min-h-screen bg-[#f0f2f5]">
      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 bg-white w-64 h-screen shadow-lg z-30
                    transform transition-transform duration-300 ease-in-out
                    ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      </div>

      {/* Overlay for mobile, shown when sidebar is open */}
      {isSidebarOpen && (
        <div
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
        ></div>
      )}

      {/* Main Content */}
      <div
        className={`flex flex-col flex-1 transition-all duration-300 ease-in-out
                    ${isSidebarOpen ? "lg:ml-64" : "ml-0"}`}
      >
        <header className="sticky top-0 right-0 bg-[#f0f2f5]/80 backdrop-blur-sm p-4 z-10">
          <button
            className="cursor-pointer text-gray-700 hover:text-primary"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          >
            <BiMenu className="h-8 w-8" />
          </button>
        </header>

        {/* This is where the routed components will be rendered */}
        <main className="p-4">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default DashboardLayout;
