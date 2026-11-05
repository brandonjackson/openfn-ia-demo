import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { HashRouter } from "react-router-dom";
import "./index.css";
import App from "./app/App.tsx";
import { ThemeProvider } from "./theme/ThemeProvider";
import StylePicker from "./components/patterns/StylePicker";
import FeatureFlags from "./app/FeatureFlags";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider>
      <HashRouter>
        <App />
      </HashRouter>
      {/* Global controls: re-skin the whole app, and turn its new features on and off. */}
      <StylePicker />
      <FeatureFlags />
    </ThemeProvider>
  </StrictMode>
);
