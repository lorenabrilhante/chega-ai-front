import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";

// Emoji por tipo de evento
const tipoEmoji = {
  Jogos: "🎮",
  Música: "🎵",
  Estudos: "📚",
  Esportes: "⚽",
  Café: "☕",
  Outros: "✨",
};

function formatDate(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" }) +
    " • " + d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

export default function GameMap({ eventos: eventosProp }) {
  const [eventos, setEventos] = useState(eventosProp || []);

  useEffect(() => {
    // Se o pai já passou os eventos, não faz nova requisição
    if (eventosProp && eventosProp.length > 0) {
      setEventos(eventosProp);
      return;
    }
    fetch(`${import.meta.env.VITE_API_URL}/eventos`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setEventos(data);
      })
      .catch((err) => console.error("Erro ao carregar eventos no mapa:", err));
  }, [eventosProp]);

  // Eventos com coordenadas válidas
  const comCoordenadas = eventos.filter(
    (e) => e.latitude != null && e.longitude != null
  );

  // Centro padrão: Fortaleza, ou primeiro evento com coordenadas
  const center = comCoordenadas.length > 0
    ? [comCoordenadas[0].latitude, comCoordenadas[0].longitude]
    : [-3.7319, -38.5267];

  return (
    <div className="w-full h-full rounded-3xl overflow-hidden">
      <MapContainer
        center={center}
        zoom={13}
        scrollWheelZoom={true}
        className="w-full h-full z-0"
      >
        <TileLayer
          attribution="&copy; OpenStreetMap"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {comCoordenadas.map((evento) => (
          <Marker
            key={evento.id_evento}
            position={[evento.latitude, evento.longitude]}
          >
            <Popup>
              <div style={{ minWidth: 160 }}>
                <strong style={{ fontSize: 13 }}>
                  {tipoEmoji[evento.tipo_evento] || "📍"} {evento.titulo}
                </strong>
                <br />
                {evento.nome_local && (
                  <span style={{ fontSize: 11, color: "#666" }}>
                    📌 {evento.nome_local}
                    <br />
                  </span>
                )}
                {evento.horario_inicio && (
                  <span style={{ fontSize: 11, color: "#888" }}>
                    🕐 {formatDate(evento.horario_inicio)}
                  </span>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}