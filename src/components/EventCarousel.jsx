import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const tipoEmoji = {
  Jogos: "🎮",
  Música: "🎵",
  Estudos: "📚",
  Esportes: "⚽",
  Café: "☕",
  Outros: "✨",
};

// Imagens de fallback por tipo de evento
const tipoImg = {
  Jogos: "https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=600",
  Música: "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?q=80&w=600",
  Estudos: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=600",
  Esportes: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?q=80&w=600",
  Café: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=600",
  Outros: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=600",
};

function formatDateLabel(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" }).toUpperCase();
}

function formatTimeLocation(iso, nomeLocal) {
  const parts = [];
  if (iso) {
    const d = new Date(iso);
    parts.push(d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }) + "h");
  }
  if (nomeLocal) parts.push(nomeLocal);
  return parts.join(" • ");
}

export default function EventCarousel({ eventos: eventosProp, onNavigate }) {
  const [eventos, setEventos] = useState(eventosProp || []);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (eventosProp && eventosProp.length > 0) {
      setEventos(eventosProp);
      return;
    }
    setIsLoading(true);
    fetch(`${import.meta.env.VITE_API_URL}/eventos`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setEventos(data);
      })
      .catch((err) => console.error("Erro ao carregar eventos:", err))
      .finally(() => setIsLoading(false));
  }, [eventosProp]);

  return (
    <div className="mt-4 p-4 rounded-3xl bg-white/40 shadow-lg">

      {/* HEADER */}
      <div className="flex justify-between items-center mb-3">
        <h2 className="font-semibold text-gray-700">eventos em destaque</h2>
        <span className="text-sm text-purple-500 cursor-pointer">ver todos</span>
      </div>

      {/* CARDS */}
      <div className="flex gap-4 overflow-x-auto pb-2">
        {isLoading ? (
          <p className="text-sm text-gray-400">Carregando eventos...</p>
        ) : eventos.length === 0 ? (
          <p className="text-sm text-gray-400">Nenhum evento disponível.</p>
        ) : (
          eventos.map((evento) => {
            const emoji = tipoEmoji[evento.tipo_evento] || "📍";
            const img = tipoImg[evento.tipo_evento] || tipoImg["Outros"];
            const dateLabel = formatDateLabel(evento.horario_inicio);
            const info = formatTimeLocation(evento.horario_inicio, evento.nome_local);

            return (
              <div
                key={evento.id_evento}
                onClick={() => navigate(`/evento/${evento.id_evento}`)}
                className="min-w-[180px] h-[140px] rounded-2xl overflow-hidden relative shadow-md hover:scale-105 transition cursor-pointer flex-shrink-0"
              >
                <img src={img} className="w-full h-full object-cover" />

                {/* overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

                {/* conteúdo */}
                <div className="absolute bottom-2 left-2 text-white text-xs">
                  <p className="font-bold">{emoji} {evento.titulo}</p>
                  <p>{info}</p>
                </div>

                {/* data */}
                {dateLabel && (
                  <div className="absolute top-2 left-2 bg-pink-400 text-white text-[10px] px-2 py-1 rounded-full">
                    {dateLabel}
                  </div>
                )}
              </div>
            );
          })
        )}
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