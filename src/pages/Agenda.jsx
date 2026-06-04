import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";

export default function Agenda() {
  const navigate = useNavigate();
  return (
    <div className="flex h-screen bg-gradient-to-br from-blue-100 via-green-100 to-yellow-100 p-3 gap-3">

      <Sidebar active="/agenda" />

      {/* MAIN */}
      <main className="flex-1 flex flex-col gap-3">

        {/* HEADER */}
        <header className="flex items-center gap-4 px-6 py-3 bg-white/50 rounded-3xl shadow">

          <nav className="flex gap-2 text-sm">

            <button className="px-4 py-2 hover:bg-white/70 rounded-full">
              explorar
            </button>

            <button className="px-4 py-2 hover:bg-white/70 rounded-full">
              eventos
            </button>

            <button className="px-4 py-2 bg-blue-200 rounded-full">
              comunidades
            </button>

            <button className="px-4 py-2 hover:bg-white/70 rounded-full">
              amigos
            </button>

          </nav>

          <input
            className="flex-1 px-4 py-2 rounded-full bg-white/70 outline-none text-sm"
            placeholder="Buscar eventos..."
          />

          <button
            onClick={() => navigate("/criar-evento")}
            className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-2 rounded-full text-sm shadow hover:scale-[1.02] transition"
          >
            + criar evento
          </button>

        </header>

        {/* CALENDÁRIO */}
        <div className="flex-1 bg-white/50 rounded-3xl shadow p-5 flex flex-col">

          {/* TOPO */}
          <div className="flex justify-between items-center mb-4">

            <div className="flex items-center gap-3">

              <button className="bg-white/70 px-3 py-1 rounded-lg text-sm shadow">
                Todos
              </button>

              <h2 className="text-xl font-semibold text-gray-700">
                Maio 2024
              </h2>

              <button className="bg-white/70 px-2 py-1 rounded-lg shadow">
                ←
              </button>

              <button className="bg-white/70 px-2 py-1 rounded-lg shadow">
                →
              </button>

            </div>

            <div className="flex gap-2">

              <button className="bg-blue-200 px-3 py-1 rounded-lg text-sm shadow">
                Mês
              </button>

              <button className="bg-white/70 px-3 py-1 rounded-lg text-sm shadow">
                Semana
              </button>

              <button className="bg-white/70 px-3 py-1 rounded-lg text-sm shadow">
                Dia
              </button>

            </div>

          </div>

          {/* GRID */}
          <div className="flex-1 grid grid-cols-7 grid-rows-6 gap-2 text-sm">

            {/* DIAS */}
            {[
              "Dom",
              "Seg",
              "Ter",
              "Qua",
              "Qui",
              "Sex",
              "Sab",
            ].map((day) => (
              <div
                key={day}
                className="text-center font-semibold text-gray-500"
              >
                {day}
              </div>
            ))}

            {/* CALENDÁRIO */}

            {Array.from({ length: 35 }).map((_, i) => (
              <div
                key={i}
                className="bg-white/60 rounded-2xl p-2 relative hover:bg-white/80 transition"
              >

                <span className="text-gray-500 text-xs">
                  {i + 1}
                </span>

                {/* EVENTOS */}

                {i === 8 && (
                  <div className="mt-2 bg-purple-400 text-white text-[10px] px-2 py-1 rounded-full w-fit">
                    ☕ Noite de Animes
                  </div>
                )}

                {i === 15 && (
                  <div className="mt-2 bg-blue-400 text-white text-[10px] px-2 py-1 rounded-full w-fit">
                    🎵 Show Indie
                  </div>
                )}

                {i === 23 && (
                  <div className="mt-2 bg-green-400 text-white text-[10px] px-2 py-1 rounded-full w-fit">
                    🎮 Torneio
                  </div>
                )}

                {i === 28 && (
                  <div className="mt-2 bg-pink-400 text-white text-[10px] px-2 py-1 rounded-full w-fit">
                    🍜 Almoço com Laura
                  </div>
                )}

              </div>
            ))}

          </div>

        </div>

      </main>

    </div>
  );
}