import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import "./index.css";
import App from "./App.jsx";

createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <Toaster
      position="top-center"
      toastOptions={{
        duration: 2600,
        style: {
          background: "#1d1f2b",
          color: "#fff",
          borderRadius: "14px",
          padding: "10px 14px",
          fontFamily: "Plus Jakarta Sans, sans-serif",
          fontSize: "14px",
          fontWeight: 600,
        },
        success: { iconTheme: { primary: "#8b3cff", secondary: "#fff" } },
      }}
    />
    <App />
  </BrowserRouter>
);
