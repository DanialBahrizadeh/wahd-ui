import { useState } from "react";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import Plan from "./components/Plan";
import Footer from "./components/Footer";
import "./App.css";

function App() {
  const [isBrowserOpen, setIsBrowserOpen] = useState(false);

  return (
    <div className="container">
      <Header onOpenBrowser={() => setIsBrowserOpen(true)} />
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
