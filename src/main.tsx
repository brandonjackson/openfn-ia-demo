import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { HashRouter } from "react-router-dom";
import "./index.css";
import App from "./App.tsx";
import { ThemeProvider } from "./theme/ThemeProvider";
import StylePicker from "./components/StylePicker";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider>
      <HashRouter>
        <App />
      </HashRouter>
      {/* Global control — re-skins the whole app on every route. */}
      <StylePicker />
    </ThemeProvider>
  </StrictMode>
);
