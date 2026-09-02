import { useEffect, useState } from "react";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import Plan from "./components/Plan";
import Footer from "./components/Footer";
import "./App.css";

function App() {
  const [isBrowserOpen, setIsBrowserOpen] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "light" || savedTheme === "dark") return savedTheme;
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  });

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("theme", theme);
  }, [theme]);

  return (
    <div className="container">
      <Header
        onOpenBrowser={() => setIsBrowserOpen(true)}
        theme={theme}
        onToggleTheme={() =>
          setTheme((current) => (current === "light" ? "dark" : "light"))
        }
      />
      <main className="main">
        <Sidebar
          isOpen={isBrowserOpen}
          onClose={() => setIsBrowserOpen(false)}
        />
        <Plan />
      </main>
      <Footer />
    </div>
  );
}

export default App;
