import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { HashRouter } from "react-router-dom";
import "./index.css";
import App from "./App.tsx";
import { ToastProvider } from "./components/Toast";
import { ThemeProvider } from "./theme/ThemeProvider";
import { AnnotationsProvider } from "./annotations/AnnotationsContext";
import SettingsMenu from "./components/devtools/SettingsMenu";
import AnnotationsPanel from "./components/devtools/AnnotationsPanel";
import AnnotationsFrame from "./components/devtools/AnnotationsFrame";
import SessionProvider from "./session/SessionProvider";
import { session } from "./mock-data/users";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider>
      <HashRouter>
        <AnnotationsProvider>
          <SessionProvider session={session}>
            <ToastProvider>
              <AnnotationsFrame>
                <App />
              </AnnotationsFrame>
            </ToastProvider>
          </SessionProvider>
          {/* Demo tooling, outside the Lightning UI: annotations and themes. */}
          <AnnotationsPanel />
          <SettingsMenu />
        </AnnotationsProvider>
      </HashRouter>
    </ThemeProvider>
  </StrictMode>
);
