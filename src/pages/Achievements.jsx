import Sidebar from "../components/Sidebar";

const achievements = [
  {
    icon: "⚡",
    title: "Primeiros Passos",
    desc: "Participe do seu primeiro evento",
    unlocked: true,
    xp: 100,
  },
  {
    icon: "💬",
    title: "Socializador",
    desc: "Envie 50 mensagens em chats",
    unlocked: true,
    xp: 150,
  },
  {
    icon: "👥",
    title: "Construtor de Comunidade",
    desc: "Participe de 3 comunidades diferentes",
    unlocked: true,
    xp: 200,
  },
  {
    icon: "⭐",
    title: "Super Estrela",
    desc: "Seja destaque em um evento",
    unlocked: true,
    xp: 300,
  },
  {
    icon: "🎮",
    title: "Gamer",
    desc: "Participe de 5 eventos de games",
    unlocked: false,
    xp: 250,
  },
  {
    icon: "☕",
    title: "Amante de Café",
    desc: "Vá a 10 encontros em cafeterias",
    unlocked: false,
    xp: 200,
  },
  {
    icon: "🎵",
    title: "Melodia",
    desc: "Participe de 3 shows ou eventos musicais",
    unlocked: false,
    xp: 250,
  },
  {
    icon: "📚",
    title: "Estudioso",
    desc: "Participe de 5 grupos de estudo",
    unlocked: false,
    xp: 200,
  },
  {
    icon: "🏆",
    title: "Lenda Local",
    desc: "Alcance o nível 20",
    unlocked: false,
    xp: 500,
  },
];

export default function Achievements() {
  const unlockedCount = achievements.filter((a) => a.unlocked).length;
  const totalXP = achievements
    .filter((a) => a.unlocked)
    .reduce((sum, a) => sum + a.xp, 0);

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-blue-100 via-pink-100 to-yellow-100 p-3 gap-3">
      <Sidebar active="/achievements" />

      <main className="flex-1 flex flex-col gap-3">
        <header className="bg-white/60 rounded-3xl px-6 py-4 flex items-center gap-4 shadow">
          <nav className="flex gap-2 text-sm">
            <button className="px-4 py-2 rounded-full hover:bg-white/70">
              explorar
            </button>
            <button className="px-4 py-2 rounded-full hover:bg-white/70">
              eventos
            </button>
            <button className="px-4 py-2 rounded-full hover:bg-white/70">
              comunidades
            </button>
            <button className="px-4 py-2 rounded-full hover:bg-white/70">
              amigos
            </button>
          </nav>

          <input
            type="text"
            placeholder="buscar conquistas..."
            className="flex-1 bg-white/70 rounded-full px-5 py-2 outline-none"
          />
        </header>

        <section className="flex-1 bg-white/60 rounded-3xl p-6 shadow overflow-auto">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">
                🏆 conquistas
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                {unlockedCount} de {achievements.length} desbloqueadas
              </p>
            </div>

            <div className="bg-white/70 rounded-2xl px-5 py-3 shadow text-center">
              <p className="text-xs text-gray-500">XP total</p>
              <p className="text-xl font-bold text-purple-600">{totalXP}</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            {achievements.map((a, i) => (
              <div
                key={i}
                className={`rounded-3xl p-5 shadow border transition ${
                  a.unlocked
                    ? "bg-white/80 border-white/60"
                    : "bg-gray-100/60 border-gray-200/40 opacity-60"
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <span
                    className={`text-4xl ${
                      a.unlocked ? "" : "grayscale"
                    }`}
                  >
                    {a.icon}
                  </span>
                  {a.unlocked ? (
                    <span className="text-xs bg-green-400 text-white px-3 py-1 rounded-full shadow">
                      desbloqueado
                    </span>
                  ) : (
                    <span className="text-xs bg-gray-300 text-gray-600 px-3 py-1 rounded-full">
                      bloqueado
                    </span>
                  )}
                </div>

                <h3 className="font-bold text-gray-800">{a.title}</h3>
                <p className="text-sm text-gray-500 mt-1">{a.desc}</p>

                <div className="mt-4 flex items-center gap-2">
                  <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        a.unlocked
                          ? "bg-gradient-to-r from-purple-500 to-pink-500 w-full"
                          : "bg-gray-300 w-0"
                      }`}
                    />
                  </div>
                  <span className="text-xs text-gray-500 font-medium">
                    +{a.xp} XP
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
