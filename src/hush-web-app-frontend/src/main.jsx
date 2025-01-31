import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { Toaster } from "sonner";
import "./index.css";
import { NextUIProvider } from "@nextui-org/react";
import { AnonAadhaarProvider } from "@anon-aadhaar/react";
// import {theme} from "../src/lib/theme"

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Toaster />
    <NextUIProvider>
      <AnonAadhaarProvider>
        <App />
      </AnonAadhaarProvider>
    </NextUIProvider>
  </React.StrictMode>
);
