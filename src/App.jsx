import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Messages from "./pages/Messages";
import Agenda from "./pages/Agenda";
import Communities from "./pages/Communities";
import Profile from "./pages/Profile";
import Achievements from "./pages/Achievements";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/messages" element={<Messages />} />
      <Route path="/agenda" element={<Agenda />} />
      <Route path="/communities" element={<Communities />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/achievements" element={<Achievements />} />
    </Routes>
  );
}