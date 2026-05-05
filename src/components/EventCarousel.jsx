export default function EventCarousel() {
  const events = [
    {
      title: "Noite de Animes",
      info: "19h • São Paulo",
      img: "https://picsum.photos/300/200?1",
      date: "24 MAI",
    },
    {
      title: "Show Indie 🎵",
      info: "20h • Curitiba",
      img: "https://picsum.photos/300/200?2",
      date: "25 MAI",
    },
    {
      title: "Study Group 📚",
      info: "15h • BH",
      img: "https://picsum.photos/300/200?3",
      date: "26 MAI",
    },
    {
      title: "Torneio 🎮",
      info: "14h • Online",
      img: "https://picsum.photos/300/200?4",
      date: "27 MAI",
    },
  ];

  return (
    <div className="mt-4 p-4 rounded-3xl bg-white/40 shadow-lg">

      {/* HEADER */}
      <div className="flex justify-between items-center mb-3">
        <h2 className="font-semibold text-gray-700">
          eventos em destaque
        </h2>
        <span className="text-sm text-purple-500 cursor-pointer">
          ver todos
        </span>
      </div>

      {/* CARDS */}
      <div className="flex gap-4 overflow-x-auto pb-2">

        {events.map((e, i) => (
          <div
            key={i}
            className="min-w-[180px] h-[140px] rounded-2xl overflow-hidden relative shadow-md hover:scale-105 transition"
          >
            <img
              src={e.img}
              className="w-full h-full object-cover"
            />

            {/* overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

            {/* conteúdo */}
            <div className="absolute bottom-2 left-2 text-white text-xs">
              <p className="font-bold">{e.title}</p>
              <p>{e.info}</p>
            </div>

            {/* data */}
            <div className="absolute top-2 left-2 bg-pink-400 text-white text-[10px] px-2 py-1 rounded-full">
              {e.date}
            </div>
          </div>
        ))}

      </div>

      {/* CTA */}
      <div className="mt-4 flex justify-between items-center bg-white/50 px-4 py-3 rounded-full">

        <p className="text-sm text-gray-600">
          ✨ ache lugares. conheça pessoas. viva momentos reais.
        </p>

        <button className="bg-purple-500 text-white px-4 py-2 rounded-full text-sm">
          explorar agora →
        </button>

      </div>

    </div>
  );
}