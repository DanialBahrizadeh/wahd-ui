import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import LessonProvider from "./providers/LessonProvider.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <LessonProvider>
      <App />
    </LessonProvider>
  </StrictMode>,
);
