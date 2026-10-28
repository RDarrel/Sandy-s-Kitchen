import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux"; // Import Provider from react-redux
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import App from "./App.jsx";
import store from "./services/redux/store";
import axios from "axios";
import { ENDPOINT } from "./services/utilities";
import "./index.css";
import { GoogleOAuthProvider } from "@react-oauth/google";

axios.defaults.baseURL = `${ENDPOINT}/api`;

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <BrowserRouter>
        <Provider store={store}>
          <TooltipProvider>
            <Toaster position="top-center" richColors />
            <App />
          </TooltipProvider>
        </Provider>
      </BrowserRouter>
    </GoogleOAuthProvider>
  </StrictMode>,
);
