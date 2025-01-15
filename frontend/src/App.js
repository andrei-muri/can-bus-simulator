import { Routes, Route } from "react-router-dom";
import { SimulationPage } from "./pages/index.js";
import "./gstyles/App.css";

function App() {
  
  return (
    <>
      <Routes>
        <Route path="/" element={<SimulationPage />}/>
      </Routes>    
    </>
  );
}

export default App;
