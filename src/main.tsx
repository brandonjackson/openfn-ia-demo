import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { HashRouter } from "react-router-dom";
import "./index.css";
import App from "./app/App.tsx";
import { ThemeProvider } from "./theme/ThemeProvider";
import DemoSettings from "./app/DemoSettings";
import ApiProvider from "./api/ApiProvider";
import SignedIn from "./app/SignedIn";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider>
      <ApiProvider>
        <SignedIn>
          <HashRouter>
            <App />
          </HashRouter>
        </SignedIn>
        {/* The demo's own controls: its theme, its new features, and where its data comes from. */}
        <DemoSettings />
      </ApiProvider>
    </ThemeProvider>
  </StrictMode>
);
