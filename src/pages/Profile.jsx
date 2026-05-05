export default function Profile() {
  const conquistas = ["⚡", "💬", "👥", "⭐", "🎮", "☕"];

  const comunidades = [
    {
      nome: "Gamers Fortaleza 🎮",
      membros: "1.2k membros",
      imagem:
        "https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=1200&auto=format&fit=crop",
    },
    {
      nome: "Café & Conversa ☕",
      membros: "540 membros",
      imagem:
        "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=1200&auto=format&fit=crop",
    },
    {
      nome: "Study Friends 📚",
      membros: "830 membros",
      imagem:
        "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=1200&auto=format&fit=crop",
    },
  ];

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-blue-100 via-pink-100 to-yellow-100 p-3 gap-3 overflow-hidden">

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

          <button className="text-left px-4 py-3 rounded-2xl hover:bg-white/70">
            👥 comunidades
          </button>

          <button className="text-left px-4 py-3 rounded-2xl hover:bg-white/70">
            💬 mensagens
          </button>

          <button className="text-left px-4 py-3 rounded-2xl hover:bg-white/70">
            🏆 conquistas
          </button>

          <button className="text-left px-4 py-3 rounded-2xl bg-purple-200 text-purple-700 font-semibold">
            👤 perfil
          </button>

        </nav>

        <div className="mt-auto bg-white/70 rounded-3xl p-5 text-center shadow">

          <div className="text-4xl mb-2">
            🌟
          </div>

          <p className="font-semibold text-purple-600">
            personalize seu perfil
          </p>

          <p className="text-xs text-gray-500 mt-1">
            deixe seu perfil mais divertido
          </p>

          <button className="mt-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-5 py-2 rounded-full text-sm shadow">
            editar perfil
          </button>

        </div>

      </aside>

      {/* MAIN */}
      <main className="flex-1 flex flex-col gap-3 overflow-y-auto pr-1">

        {/* HEADER */}
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
            placeholder="buscar..."
            className="flex-1 bg-white/70 rounded-full px-5 py-2 outline-none"
          />

          <button className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-5 py-2 rounded-full shadow">
            editar
          </button>

        </header>

        {/* PERFIL */}
        <section className="bg-white/60 rounded-3xl overflow-hidden shadow">

          {/* CAPA */}
          <div className="h-44 relative">

            <img
              src="https://getstencil.com/templates/tmplshv1n0op/download"
              className="w-full h-full object-cover"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>

          </div>

          {/* INFO */}
          <div className="px-8 pb-8 relative">

            {/* FOTO */}
            <div className="absolute -top-14 left-8">

              <img
                src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT4NLykJd0BQqwu47cIjweZCXrhCNlH0msyeQ&s"
                className="w-28 h-28 rounded-full border-4 border-white shadow-xl object-cover"
              />

            </div>

            <div className="pt-20 flex justify-between">

              {/* ESQUERDA */}
              <div>

                <h2 className="text-3xl font-bold text-gray-800">
                  Beth
                </h2>

                <p className="text-sm text-gray-500">
                  @itsbeth
                </p>

                <p className="mt-4 text-gray-600 max-w-xl">
                  ✨ amante de café, bons livros, música indie e encontros aleatórios.
                  procurando novas amizades e rolês legais.
                </p>

                <div className="flex gap-6 mt-5 text-sm text-gray-600">

                  <div>
                    <span className="font-bold text-gray-800">
                      150
                    </span>{" "}
                    eventos
                  </div>

                  <div>
                    <span className="font-bold text-gray-800">
                      1.2k
                    </span>{" "}
                    amigos
                  </div>

                  <div>
                    <span className="font-bold text-gray-800">
                      32
                    </span>{" "}
                    comunidades
                  </div>

                </div>

              </div>

              {/* CARD LATERAL */}
              <div className="w-72 bg-white/70 rounded-3xl p-5 shadow">

                <div className="flex justify-between items-center">

                  <h3 className="font-semibold">
                    nível social
                  </h3>

                  <span className="text-xs bg-green-400 text-white px-3 py-1 rounded-full">
                    lvl 12
                  </span>

                </div>

                <div className="mt-4 h-3 bg-gray-200 rounded-full overflow-hidden">

                  <div className="w-[70%] h-full bg-gradient-to-r from-purple-500 to-pink-500"></div>

                </div>

                <p className="text-xs text-gray-500 mt-2">
                  1250 / 1800 XP
                </p>

                <div className="mt-6">

                  <h4 className="font-semibold text-sm mb-3">
                    conquistas
                  </h4>

                  <div className="flex flex-wrap gap-3 text-2xl">

                    {conquistas.map((c, i) => (
                      <div
                        key={i}
                        className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center shadow"
                      >
                        {c}
                      </div>
                    ))}

                  </div>

                </div>

              </div>

            </div>

          </div>

        </section>

        {/* COMUNIDADES */}
        <section className="flex-1 bg-white/60 rounded-3xl p-6 shadow overflow-auto">

          <div className="flex justify-between items-center mb-5">

            <h2 className="text-2xl font-bold text-gray-800">
              minhas comunidades
            </h2>

            <button className="text-sm text-purple-500">
              ver todas
            </button>

          </div>

          <div className="grid grid-cols-3 gap-4">

            {comunidades.map((c, i) => (
              <div
                key={i}
                className="bg-white/70 rounded-3xl overflow-hidden shadow hover:scale-[1.02] transition"
              >

                <div className="h-32">

                  <img
                    src={c.imagem}
                    className="w-full h-full object-cover"
                  />

                </div>

                <div className="p-4">

                  <h3 className="font-bold text-gray-800">
                    {c.nome}
                  </h3>

                  <p className="text-sm text-gray-500 mt-1">
                    {c.membros}
                  </p>

                  <button className="mt-4 w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-2 rounded-full text-sm shadow">
                    participar
                  </button>

                </div>

              </div>
            ))}

          </div>

        </section>

      </main>

    </div>
  );
}