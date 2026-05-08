import { useNavigate } from "react-router-dom";
import imgLogo from "../assets/logo.png";

const menuItems = [
  { label: "📍 mapa", path: "/" },
  { label: "📅 agenda", path: "/agenda" },
  { label: "👥 comunidades", path: "/communities" },
  { label: "💬 mensagens", path: "/messages" },
  { label: "🏆 conquistas", path: "/achievements" },
  { label: "👤 perfil", path: "/profile" },
];

export default function Sidebar({ active }) {
  const navigate = useNavigate();

  return (
    <aside className="w-60 p-5 flex flex-col gap-6 bg-white/50 rounded-3xl shadow-xl backdrop-blur-xl border border-white/40">
      <div className="text-2xl font-bold text-blue-600 justify-center flex items-center">
        <img src={imgLogo} alt="logo" width={100} height={100} />
      </div>

      <nav className="flex flex-col gap-2 text-sm">
        {menuItems.map((item) => {
          const isActive = item.path === active;
          return (
            <button
              key={item.label}
              onClick={() => item.path && navigate(item.path)}
              className={`px-4 py-3 rounded-2xl text-left transition ${
                isActive
                  ? "bg-blue-200 font-medium shadow-sm"
                  : "hover:bg-white/70"
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </nav>

      <div className="mt-auto bg-white/60 p-4 rounded-3xl shadow-lg border border-white/40">
        <p className="text-blue-600 font-semibold text-sm">convide amigos</p>
        <p className="text-purple-500 text-xs mt-1">ganhe pontos extras ✨</p>
        <button className="mt-3 w-full bg-gradient-to-r from-blue-500 via-cyan-400 to-green-400 text-white px-4 py-3 rounded-full text-sm shadow-lg font-medium">
          convidar
        </button>
      </div>
    </aside>
  );
}
