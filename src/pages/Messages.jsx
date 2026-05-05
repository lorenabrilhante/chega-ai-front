export default function Messages() {
  const chats = [
    {
      name: "Laura",
      msg: "vamos no evento de anime hoje?",
      time: "2 min",
      online: true,
      avatar:
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200",
    },
    {
      name: "Pedro",
      msg: "partiu study group 📚",
      time: "12 min",
      online: false,
      avatar:
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200",
    },
    {
      name: "Ana",
      msg: "amei aquele café ☕",
      time: "1h",
      online: true,
      avatar:
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=200",
    },
  ];

  return (
    <div className="flex h-screen bg-gradient-to-br from-blue-100 via-green-100 to-yellow-100 p-3 gap-3 overflow-hidden">

      {/* SIDEBAR ESQUERDA */}
      <aside className="w-60 p-5 flex flex-col gap-6 bg-white/50 rounded-3xl shadow-xl backdrop-blur-xl border border-white/40">

        <div className="text-2xl font-bold text-blue-600">
          chega aí ✨
        </div>

        <nav className="flex flex-col gap-2 text-sm">

          <button className="px-4 py-3 hover:bg-white/70 rounded-2xl text-left transition">
            📍 mapa
          </button>

          <button className="px-4 py-3 hover:bg-white/70 rounded-2xl text-left transition">
            📅 agenda
          </button>

          <button className="px-4 py-3 hover:bg-white/70 rounded-2xl text-left transition">
            👥 comunidades
          </button>

          <button className="px-4 py-3 bg-blue-200 rounded-2xl text-left font-medium shadow-sm">
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
            converse mais
          </p>

          <p className="text-purple-500 text-xs mt-1">
            faça novas conexões ✨
          </p>

          <button className="mt-3 w-full bg-gradient-to-r from-blue-500 via-cyan-400 to-green-400 text-white px-4 py-3 rounded-full text-sm shadow-lg font-medium">
            iniciar chat
          </button>

        </div>

      </aside>

      {/* MAIN */}
      <main className="flex-1 flex gap-3 overflow-hidden">

        {/* LISTA DE CHATS */}
        <section className="w-[320px] bg-white/50 rounded-3xl shadow-xl backdrop-blur-xl border border-white/40 p-4 flex flex-col">

          {/* HEADER */}
          <div className="flex justify-between items-center mb-4">

            <h2 className="text-xl font-bold text-gray-700">
              mensagens
            </h2>

            <button className="w-10 h-10 rounded-2xl bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg">
              +
            </button>

          </div>

          {/* SEARCH */}
          <input
            type="text"
            placeholder="buscar conversa..."
            className="bg-white/70 rounded-full px-4 py-3 outline-none mb-4"
          />

          {/* CHATS */}
          <div className="flex-1 overflow-y-auto flex flex-col gap-3">

            {chats.map((chat, index) => (
              <div
                key={index}
                className="bg-white/60 hover:bg-white/80 transition rounded-3xl p-3 flex items-center gap-3 cursor-pointer border border-white/40"
              >

                <div className="relative">

                  <img
                    src={chat.avatar}
                    className="w-12 h-12 rounded-2xl object-cover"
                  />

                  {chat.online && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-white"></div>
                  )}

                </div>

                <div className="flex-1">

                  <div className="flex justify-between items-center">

                    <h3 className="font-semibold text-sm text-gray-700">
                      {chat.name}
                    </h3>

                    <span className="text-xs text-gray-400">
                      {chat.time}
                    </span>

                  </div>

                  <p className="text-xs text-gray-500 truncate mt-1">
                    {chat.msg}
                  </p>

                </div>

              </div>
            ))}

          </div>

        </section>

        {/* CHAT */}
        <section className="flex-1 bg-white/50 rounded-3xl shadow-xl backdrop-blur-xl border border-white/40 flex flex-col overflow-hidden">

          {/* TOP BAR */}
          <div className="p-4 border-b border-white/40 flex justify-between items-center bg-white/30">

            <div className="flex items-center gap-3">

              <img
                src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200"
                className="w-12 h-12 rounded-2xl object-cover"
              />

              <div>

                <h2 className="font-semibold text-gray-700">
                  Laura ✨
                </h2>

                <p className="text-xs text-green-500">
                  online agora
                </p>

              </div>

            </div>

            <div className="flex gap-2">

              <button className="w-10 h-10 rounded-2xl bg-white/60">
                📞
              </button>

              <button className="w-10 h-10 rounded-2xl bg-white/60">
                🎥
              </button>

            </div>

          </div>

          {/* MENSAGENS */}
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">

            {/* RECEBIDA */}
            <div className="max-w-[260px] bg-white/70 rounded-3xl rounded-bl-md p-3 shadow">

              <p className="text-sm text-gray-700">
                amiga vamos no evento de anime hoje?? ✨
              </p>

            </div>

            {/* ENVIADA */}
            <div className="max-w-[260px] ml-auto bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-3xl rounded-br-md p-3 shadow">

              <p className="text-sm">
                SIMMMM eu tava esperando tu chamar 😭
              </p>

            </div>

            {/* RECEBIDA */}
            <div className="max-w-[260px] bg-white/70 rounded-3xl rounded-bl-md p-3 shadow">

              <p className="text-sm text-gray-700">
                então bora marcar 19h ☕
              </p>

            </div>

          </div>

          {/* INPUT */}
          <div className="p-4 border-t border-white/40 bg-white/30">

            <div className="bg-white/70 rounded-full px-4 py-3 flex items-center gap-3">

              <button className="text-xl">
                😊
              </button>

              <input
                type="text"
                placeholder="digite uma mensagem..."
                className="flex-1 bg-transparent outline-none text-sm"
              />

              <button className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg">
                ➤
              </button>

            </div>

          </div>

        </section>

      </main>

    </div>
  );
}