import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Messages from "./pages/Messages";
import Agenda from "./pages/Agenda";
import Communities from "./pages/Communities";
import Profile from "./pages/Profile";
import Achievements from "./pages/Achievements";
import Login from "./pages/Login";
import Register from "./pages/Register";
import CreateEvent from "./pages/CreateEvent";
import CreateCommunity from "./pages/CreateCommunity";
import EventDetail from "./pages/EventDetail";
import CommunityDetail from "./pages/CommunityDetail";
import UserProfile from "./pages/UserProfile";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/cadastro" element={<Register />} />
      <Route path="/" element={<Home />} />
      <Route path="/messages" element={<Messages />} />
      <Route path="/agenda" element={<Agenda />} />
      <Route path="/communities" element={<Communities />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/achievements" element={<Achievements />} />
      <Route path="/criar-evento" element={<CreateEvent />} />
      <Route path="/criar-comunidade" element={<CreateCommunity />} />
      <Route path="/evento/:id" element={<EventDetail />} />
      <Route path="/comunidade/:id" element={<CommunityDetail />} />
      <Route path="/usuario/:id" element={<UserProfile />} />
    </Routes>
  );
}
