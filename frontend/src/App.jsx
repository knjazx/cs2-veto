import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import VetoRoom from "./pages/VetoRoom";

export default function App() {
  return (
    <div className="min-h-screen bg-bg text-fg font-sans">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/room/:roomId" element={<VetoRoom />} />
      </Routes>
    </div>
  );
}
