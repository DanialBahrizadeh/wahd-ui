import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import Plan from "./components/Plan";
import Footer from "./components/Footer";
import "./App.css";

function App() {
  return (
    <div className="container">
      <Header />
      <main className="main">
        <Sidebar />
        <Plan />
      </main>
      <Footer />
    </div>
  );
}

export default App;
