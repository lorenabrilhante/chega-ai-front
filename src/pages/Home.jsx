import GameMap from "../components/GameMap";
import EventCarousel from "../components/EventCarousel";

export default function Home() {
  const user = {
    nome: "Beth",
    nivel: 12,
    xpAtual: 1250,
    xpMax: 1800,
  };

  const progresso = (user.xpAtual / user.xpMax) * 100;

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-blue-100 via-green-100 to-yellow-100 p-3 gap-3">

      {/* SIDEBAR ESQUERDA */}
      <aside className="w-60 p-5 flex flex-col gap-6 bg-white/50 rounded-3xl shadow-xl backdrop-blur-xl border border-white/40">

        <div className="text-2xl font-bold text-blue-600">
          chega aí ✨
        </div>

        <nav className="flex flex-col gap-2 text-sm">

          <button className="px-4 py-3 bg-blue-200 rounded-2xl text-left font-medium shadow-sm">
            📍 mapa
          </button>

          <button className="px-4 py-3 hover:bg-white/70 rounded-2xl text-left transition">
            📅 agenda
          </button>

          <button className="px-4 py-3 hover:bg-white/70 rounded-2xl text-left transition">
            👥 comunidades
          </button>

          <button className="px-4 py-3 hover:bg-white/70 rounded-2xl text-left transition">
            💬 mensagens
          </button>

          <button className="px-4 py-3 hover:bg-white/70 rounded-2xl text-left transition">
            🏆 conquistas
          </button>

          <button className="px-4 py-3 hover:bg-white/70 rounded-2xl text-left transition">
            👤 perfil
          </button>

        </nav>

        {/* CARD */}
        <div className="mt-auto bg-white/60 p-4 rounded-3xl shadow-lg border border-white/40">

          <p className="text-blue-600 font-semibold text-sm">
            convide amigos
          </p>

          <p className="text-purple-500 text-xs mt-1">
            ganhe pontos extras ✨
          </p>

          <button className="mt-3 w-full bg-gradient-to-r from-blue-500 via-cyan-400 to-green-400 text-white px-4 py-3 rounded-full text-sm shadow-lg font-medium">
            convidar
          </button>

        </div>

      </aside>

      {/* MAIN */}
      <main className="flex-1 flex flex-col gap-3 min-h-0">

        {/* HEADER */}
        <header className="flex items-center gap-4 px-6 py-4 bg-white/50 rounded-3xl shadow-xl backdrop-blur-xl border border-white/40">

          <nav className="flex gap-2 text-sm">

            <button className="px-4 py-2 bg-blue-200 rounded-full font-medium">
              explorar
            </button>

            <button className="px-4 py-2 hover:bg-white/70 rounded-full transition">
              eventos
            </button>

            <button className="px-4 py-2 hover:bg-white/70 rounded-full transition">
              comunidades
            </button>

            <button className="px-4 py-2 hover:bg-white/70 rounded-full transition">
              amigos
            </button>

          </nav>

          <input
            className="flex-1 px-5 py-3 rounded-full bg-white/70 outline-none shadow-inner"
            placeholder="buscar eventos..."
          />

          <button className="bg-gradient-to-r from-blue-500 via-cyan-400 to-purple-500 text-white px-5 py-3 rounded-full text-sm shadow-lg font-medium">
            + criar evento
          </button>

        </header>

        {/* CONTEÚDO */}
        <div className="flex-1 flex gap-3 min-h-0">

          {/* ESQUERDA */}
          <div className="flex-1 flex flex-col gap-3 min-h-0">

            {/* MAPA */}
            <div className="flex-1 min-h-[500px] rounded-3xl overflow-hidden shadow-xl border border-white/40">
              <GameMap />
            </div>

            {/* EVENTOS */}
            <div className="h-[320px] flex-shrink-0">
              <EventCarousel />
            </div>

          </div>

          {/* SIDEBAR DIREITA */}
          <aside className="w-80 flex flex-col gap-3">

            {/* NÍVEL */}
            <div className="p-5 bg-white/60 rounded-3xl shadow-xl backdrop-blur-xl border border-white/40">

              <div className="flex justify-between items-center">

                <span className="font-semibold text-gray-700">
                  seu nível
                </span>

                <span className="text-xs bg-gradient-to-r from-green-400 to-emerald-500 text-white px-3 py-1 rounded-full shadow">
                  nível {user.nivel}
                </span>

              </div>

              <p className="text-sm text-gray-500 mt-1">
                {user.nome}
              </p>

              <div className="mt-3 h-3 bg-gray-200 rounded-full overflow-hidden">

                <div
                  className="h-full bg-gradient-to-r from-blue-500 via-cyan-400 to-yellow-300 rounded-full"
                  style={{ width: `${progresso}%` }}
                />

              </div>

              <p className="text-xs text-gray-400 mt-2">
                {user.xpAtual} / {user.xpMax} XP
              </p>

            </div>

            {/* AMIGOS */}
            <div className="p-5 bg-white/60 rounded-3xl shadow-xl backdrop-blur-xl border border-white/40">

              <h3 className="font-semibold text-sm mb-3">
                amigos por perto
              </h3>

              <div className="flex flex-col gap-3 text-sm">

                <div className="flex items-center justify-between">
                  <span>laura ✨</span>
                  <span className="text-green-500">200m</span>
                </div>

                <div className="flex items-center justify-between">
                  <span>pedro 🎮</span>
                  <span className="text-blue-500">350m</span>
                </div>

                <div className="flex items-center justify-between">
                  <span>ana ☕</span>
                  <span className="text-emerald-500">online</span>
                </div>

              </div>

            </div>

            {/* DESAFIO */}
            <div className="p-5 bg-white/60 rounded-3xl shadow-xl backdrop-blur-xl border border-white/40">

              <h3 className="font-semibold text-sm">
                desafio da semana
              </h3>

              <p className="text-xs text-gray-500 mt-1">
                participe de 2 eventos
              </p>

              <div className="mt-3 h-3 bg-gray-200 rounded-full overflow-hidden">

                <div className="w-1/2 h-full bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-500 rounded-full"></div>

              </div>

            </div>

            {/* CONQUISTAS */}
            <div className="p-5 bg-white/60 rounded-3xl shadow-xl backdrop-blur-xl border border-white/40">

              <h3 className="font-semibold text-sm mb-3">
                conquistas
              </h3>

              <div className="flex gap-3 text-2xl">
                ⚡ 💬 👥 ⭐
              </div>

            </div>

          </aside>

        </div>

      </main>

    </div>
  );
}