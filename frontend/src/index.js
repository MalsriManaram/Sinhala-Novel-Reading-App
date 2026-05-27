import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import App from "./App";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <App />
    <Toaster
      position="top-right"
      toastOptions={{
        style: {
          background: "rgba(25,26,35,0.95)",
          color: "#F8F8F7",
          border: "1px solid rgba(255,255,255,0.08)",
          backdropFilter: "blur(14px)",
        },
      }}
    />
  </BrowserRouter>
);
