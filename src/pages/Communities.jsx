export default function Communities() {
  const communities = [
    {
      name: "Gamers Fortaleza 🎮",
      members: "1.2k membros",
      desc: "campeonatos, amizades e noites de gameplay",
      color: "from-purple-400 to-pink-400",
      image:
        "https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=1200&auto=format&fit=crop",
    },
    {
      name: "Study Friends 📚",
      members: "830 membros",
      desc: "grupo pra estudar junto e compartilhar metas",
      color: "from-blue-400 to-cyan-400",
      image:
        "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=1200&auto=format&fit=crop",
    },
    {
      name: "Café & Conversa ☕",
      members: "540 membros",
      desc: "lugares aconchegantes e papo aleatório",
      color: "from-orange-300 to-yellow-300",
      image:
        "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=1200&auto=format&fit=crop",
    },
    {
      name: "Indie Music 🎵",
      members: "920 membros",
      desc: "descubra artistas e eventos alternativos",
      color: "from-pink-400 to-rose-400",
      image:
        "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?q=80&w=1200&auto=format&fit=crop",
    },
  ];

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-blue-100 via-pink-100 to-yellow-100 p-3 gap-3">

      {/* SIDEBAR */}
      <aside className="w-60 bg-white/60 rounded-3xl p-5 shadow flex flex-col">

        <h1 className="text-3xl font-bold text-purple-600 mb-8">
          chega aí ✨
        </h1>

        <nav className="flex flex-col gap-2 text-sm">

          <button className="text-left px-4 py-3 rounded-2xl hover:bg-white/70">
            📍 mapa
          </button>

          <button className="text-left px-4 py-3 rounded-2xl hover:bg-white/70">
            📅 agenda
          </button>

          <button className="text-left px-4 py-3 rounded-2xl bg-purple-200 text-purple-700 font-semibold">
            👥 comunidades
          </button>

          <button className="text-left px-4 py-3 rounded-2xl hover:bg-white/70">
            💬 mensagens
          </button>

          <button className="text-left px-4 py-3 rounded-2xl hover:bg-white/70">
            🏆 conquistas
          </button>

          <button className="text-left px-4 py-3 rounded-2xl hover:bg-white/70">
            👤 perfil
          </button>

        </nav>

        <div className="mt-auto bg-white/70 rounded-3xl p-5 text-center shadow">
          <div className="text-4xl mb-2">🌎</div>

          <p className="font-semibold text-purple-600">
            encontre sua galera
          </p>

          <p className="text-xs text-gray-500 mt-1">
            participe de comunidades perto de você
          </p>

          <button className="mt-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-5 py-2 rounded-full text-sm shadow">
            explorar
          </button>
        </div>

      </aside>

      {/* MAIN */}
      <main className="flex-1 flex flex-col gap-3">

        {/* HEADER */}
        <header className="bg-white/60 rounded-3xl px-6 py-4 flex items-center gap-4 shadow">

          <nav className="flex gap-2 text-sm">

            <button className="px-4 py-2 rounded-full hover:bg-white/70">
              explorar
            </button>

            <button className="px-4 py-2 rounded-full hover:bg-white/70">
              eventos
            </button>

            <button className="px-4 py-2 rounded-full bg-purple-200 text-purple-700 font-semibold">
              comunidades
            </button>

            <button className="px-4 py-2 rounded-full hover:bg-white/70">
              amigos
            </button>

          </nav>

          <input
            type="text"
            placeholder="buscar comunidades..."
            className="flex-1 bg-white/70 rounded-full px-5 py-2 outline-none"
          />

          <button className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-5 py-2 rounded-full shadow">
            + criar comunidade
          </button>

        </header>

        {/* HERO */}
        <section className="relative overflow-hidden rounded-3xl p-8 min-h-[280px]
        bg-linear-to-r from-purple-400 via-pink-300 to-yellow-200 shadow text-white">

          <div className="absolute w-72 h-72 bg-white/20 rounded-full blur-3xl -top-20 -right-10"></div>

          <div className="relative z-10">

            <h2 className="text-3xl lg:text-5xl font-bold leading-tight max-w-4xl">
              encontre pessoas com os mesmos interesses ✨
            </h2>

            <p className="mt-3 text-white/90 max-w-2xl">
              participe de grupos locais, descubra eventos e conheça novas amizades.
            </p>

            <button className="mt-6 bg-white text-purple-600 px-6 py-3 rounded-full font-semibold shadow">
              explorar comunidades
            </button>

          </div>

        </section>

        {/* GRID */}
        <section className="grid grid-cols-2 gap-4 flex-1">

          {communities.map((community, index) => (
            <div
              key={index}
              className="bg-white/60 rounded-3xl overflow-hidden shadow hover:scale-[1.01] transition"
            >

              <div className="h-40 relative">

                <img
                  src={community.image}
                  className="w-full h-full object-cover"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>

                <div className="absolute bottom-4 left-4 text-white">

                  <h3 className="font-bold text-xl">
                    {community.name}
                  </h3>

                  <p className="text-sm opacity-90">
                    {community.members}
                  </p>

                </div>

              </div>

              <div className="p-5">

                <p className="text-sm text-gray-600">
                  {community.desc}
                </p>

                <div className="flex justify-between items-center mt-5">

                  <div className={`px-3 py-1 rounded-full text-xs text-white bg-gradient-to-r ${community.color}`}>
                    ativa agora
                  </div>

                  <button className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-full text-sm shadow">
                    participar
                  </button>

                </div>

              </div>

            </div>
          ))}

        </section>

      </main>

    </div>
  );
}