import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import Sidebar from "../components/Sidebar";

// ── helpers ──────────────────────────────────────────────
const tipoEmoji = {
  Jogos: "🎮", Música: "🎵", Estudos: "📚",
  Esportes: "⚽", Café: "☕", Outros: "✨",
};

const tipoImg = {
  Jogos:   "https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=1200",
  Música:  "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?q=80&w=1200",
  Estudos: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=1200",
  Esportes:"https://images.unsplash.com/photo-1461896836934-ffe607ba8211?q=80&w=1200",
  Café:    "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=1200",
  Outros:  "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=1200",
};

function formatFull(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("pt-BR", {
    day: "2-digit", month: "long", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

function formatShortDate(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit", month: "short",
  }).toUpperCase();
}

// ── component ────────────────────────────────────────────
export default function EventDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [evento, setEvento] = useState(null);
  const [criador, setCriador] = useState(null);
  const [comunidade, setComunidade] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  const [jaParticipa, setJaParticipa] = useState(false);
  const [joining, setJoining] = useState(false);
  const [joinSuccess, setJoinSuccess] = useState(false);

  // load logged user
  useEffect(() => {
    const saved = localStorage.getItem("chega_ai_user") || sessionStorage.getItem("chega_ai_user");
    if (saved) {
      try {
        const session = JSON.parse(saved);
        const u = session?.usuario || session;
        if (u?.id_usuario) setCurrentUser(u);
      } catch (_) {}
    }
  }, []);

  // load event
  useEffect(() => {
    if (!id) return;
    setIsLoading(true);
    setError("");

    fetch(`${import.meta.env.VITE_API_URL}/eventos/${id}`)
      .then((r) => {
        if (!r.ok) throw new Error("Evento não encontrado.");
        return r.json();
      })
      .then(async (data) => {
        setEvento(data);

        // load criador
        if (data.id_criador) {
          fetch(`${import.meta.env.VITE_API_URL}/usuarios/${data.id_criador}`)
            .then((r) => r.ok ? r.json() : null)
            .then((u) => { if (u) setCriador(u); })
            .catch(() => {});
        }

        // load comunidade
        if (data.id_comunidade) {
          fetch(`${import.meta.env.VITE_API_URL}/comunidades/${data.id_comunidade}`)
            .then((r) => r.ok ? r.json() : null)
            .then((c) => { if (c) setComunidade(c); })
            .catch(() => {});
        }
      })
      .catch((e) => setError(e.message))
      .finally(() => setIsLoading(false));
  }, [id]);

  // check if user already joined
  useEffect(() => {
    if (!currentUser || !id) return;
    fetch(`${import.meta.env.VITE_API_URL}/participantes-evento?id_participante=${currentUser.id_usuario}&id_evento=${id}`)
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) setJaParticipa(true);
      })
      .catch(() => {});
  }, [currentUser, id]);

  async function handleJoin() {
    if (!currentUser) {
      navigate("/login");
      return;
    }
    setJoining(true);
    try {
      const payload = {
        id_participante: currentUser.id_usuario,
        id_evento: Number(id),
        status: "confirmado",
        ultima_atualizacao: new Date().toISOString(),
      };
      const res = await fetch(`${import.meta.env.VITE_API_URL}/participantes-evento`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d?.error || "Erro ao confirmar participação.");
      }
      setJaParticipa(true);
      setJoinSuccess(true);
      setTimeout(() => setJoinSuccess(false), 3000);
    } catch (e) {
      setError(e.message);
    } finally {
      setJoining(false);
    }
  }

  // ── derived values ───────────────────────────────────
  const emoji = tipoEmoji[evento?.tipo_evento] || "📍";
  const coverImg = tipoImg[evento?.tipo_evento] || tipoImg["Outros"];
  const hasCoords = evento?.latitude != null && evento?.longitude != null;
  const DEFAULT_AVATAR = "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200";

  // ── render ───────────────────────────────────────────
  return (
    <div className="flex min-h-screen bg-gradient-to-br from-blue-100 via-purple-100 to-yellow-100 p-3 gap-3">
      <Sidebar active="/agenda" />

      <main className="flex-1 flex flex-col gap-3 overflow-y-auto pr-1">

        {/* HEADER */}
        <header className="flex items-center justify-between px-6 py-4 bg-white/50 rounded-3xl shadow-xl backdrop-blur-xl border border-white/40">
          <div className="flex flex-col">
            <span className="text-xs font-bold uppercase tracking-wider text-purple-600">Detalhe do Evento</span>
            <h1 className="text-2xl font-extrabold text-slate-800">
              {isLoading ? "Carregando..." : evento?.titulo || "Evento"}
            </h1>
          </div>
          <button
            onClick={() => navigate(-1)}
            className="px-5 py-2.5 bg-white/70 hover:bg-white text-slate-700 rounded-full font-medium transition shadow-md hover:scale-[1.02] border border-slate-100 text-sm"
          >
            ← voltar
          </button>
        </header>

        {/* ERROR */}
        {error && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-sm font-bold text-rose-600 shadow-sm">
            ⚠️ {error}
          </div>
        )}

        {/* SUCCESS JOIN */}
        {joinSuccess && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-sm font-bold text-emerald-600 shadow-sm flex items-center gap-2">
            🎉 Você confirmou presença neste evento!
          </div>
        )}

        {/* LOADING */}
        {isLoading && (
          <div className="flex-1 flex items-center justify-center">
            <div className="w-12 h-12 rounded-full border-4 border-purple-200 border-t-purple-500 animate-spin" />
          </div>
        )}

        {/* CONTENT */}
        {!isLoading && evento && (
          <div className="flex flex-col lg:flex-row gap-4">

            {/* LEFT COLUMN */}
            <div className="flex-1 flex flex-col gap-4">

              {/* COVER HERO */}
              <div className="relative h-72 rounded-3xl overflow-hidden shadow-2xl">
                <img src={coverImg} className="w-full h-full object-cover" alt={evento.titulo} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                {/* Date badge */}
                <div className="absolute top-4 left-4 bg-pink-400 text-white text-xs font-extrabold px-3 py-1.5 rounded-full shadow-lg">
                  {formatShortDate(evento.horario_inicio)}
                </div>

                {/* Type pill */}
                <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-md text-white text-xs font-bold px-3 py-1.5 rounded-full border border-white/30">
                  {emoji} {evento.tipo_evento || "Geral"}
                </div>

                {/* Title on image */}
                <div className="absolute bottom-6 left-6 right-6">
                  <h2 className="text-3xl font-black text-white leading-tight drop-shadow-lg">
                    {emoji} {evento.titulo}
                  </h2>
                  {evento.nome_local && (
                    <p className="text-white/90 font-semibold text-sm mt-1">
                      📌 {evento.nome_local}
                    </p>
                  )}
                </div>
              </div>

              {/* DESCRIPTION */}
              {evento.descricao && (
                <div className="bg-white/60 backdrop-blur-xl rounded-3xl p-6 shadow-xl border border-white/40">
                  <h3 className="font-extrabold text-slate-700 text-sm uppercase tracking-wider mb-3">Sobre o Evento</h3>
                  <p className="text-slate-600 leading-relaxed font-medium">{evento.descricao}</p>
                </div>
              )}

              {/* MAP */}
              {hasCoords && (
                <div className="bg-white/60 backdrop-blur-xl rounded-3xl overflow-hidden shadow-xl border border-white/40">
                  <div className="px-6 pt-5 pb-3">
                    <h3 className="font-extrabold text-slate-700 text-sm uppercase tracking-wider">Localização no Mapa</h3>
                    {evento.nome_local && (
                      <p className="text-xs font-semibold text-slate-400 mt-0.5">📌 {evento.nome_local}</p>
                    )}
                  </div>
                  <div className="h-64 w-full">
                    <MapContainer
                      center={[evento.latitude, evento.longitude]}
                      zoom={15}
                      scrollWheelZoom={false}
                      className="w-full h-full z-0"
                    >
                      <TileLayer
                        attribution="&copy; OpenStreetMap"
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      />
                      <Marker position={[evento.latitude, evento.longitude]}>
                        <Popup>
                          <strong>{emoji} {evento.titulo}</strong>
                          {evento.nome_local && <><br />{evento.nome_local}</>}
                        </Popup>
                      </Marker>
                    </MapContainer>
                  </div>
                </div>
              )}
            </div>

            {/* RIGHT COLUMN */}
            <div className="w-full lg:w-80 flex flex-col gap-4">

              {/* JOIN CARD */}
              <div className="bg-white/70 backdrop-blur-xl rounded-3xl p-6 shadow-xl border border-white/40 flex flex-col gap-4">
                <h3 className="font-extrabold text-slate-700 text-sm uppercase tracking-wider">Participar</h3>

                <button
                  onClick={handleJoin}
                  disabled={jaParticipa || joining}
                  className={`w-full py-3.5 rounded-full font-extrabold text-sm shadow-lg transition ${
                    jaParticipa
                      ? "bg-emerald-100 text-emerald-700 border border-emerald-200 cursor-default"
                      : "bg-gradient-to-r from-purple-600 via-fuchsia-500 to-pink-500 text-white hover:scale-[1.02] hover:brightness-105 active:scale-[0.98] disabled:opacity-70"
                  }`}
                >
                  {joining ? "Confirmando..." : jaParticipa ? "✅ Você vai comparecer!" : "🎉 Confirmar Presença"}
                </button>

                {!currentUser && (
                  <p className="text-xs text-center text-slate-400 font-semibold">
                    Faça{" "}
                    <button onClick={() => navigate("/login")} className="text-purple-500 underline font-bold">login</button>
                    {" "}para confirmar presença.
                  </p>
                )}
              </div>

              {/* DATE & TIME */}
              <div className="bg-white/60 backdrop-blur-xl rounded-3xl p-6 shadow-xl border border-white/40 flex flex-col gap-3">
                <h3 className="font-extrabold text-slate-700 text-sm uppercase tracking-wider">Data e Horário</h3>
                <div className="flex items-start gap-3">
                  <span className="text-2xl mt-0.5">🗓️</span>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase">Início</p>
                    <p className="font-bold text-slate-700 text-sm">{formatFull(evento.horario_inicio)}</p>
                  </div>
                </div>
                {evento.horario_termino && (
                  <div className="flex items-start gap-3">
                    <span className="text-2xl mt-0.5">⏰</span>
                    <div>
                      <p className="text-xs font-bold text-slate-400 uppercase">Término</p>
                      <p className="font-bold text-slate-700 text-sm">{formatFull(evento.horario_termino)}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* ORGANIZER */}
              {criador && (
                <div className="bg-white/60 backdrop-blur-xl rounded-3xl p-6 shadow-xl border border-white/40 flex flex-col gap-3">
                  <h3 className="font-extrabold text-slate-700 text-sm uppercase tracking-wider">Organizador</h3>
                  <div className="flex items-center gap-3">
                    <img
                      src={criador.fotoperfil_url || DEFAULT_AVATAR}
                      className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-md"
                    />
                    <div>
                      <p className="font-extrabold text-slate-800 text-sm">{criador.nome_usuario}</p>
                      <p className="text-xs font-semibold text-purple-500">@{criador.apelido_usuario}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* COMMUNITY */}
              {comunidade && (
                <div className="bg-white/60 backdrop-blur-xl rounded-3xl overflow-hidden shadow-xl border border-white/40">
                  {comunidade.fotocomunidade_url && (
                    <div className="h-24 overflow-hidden">
                      <img src={comunidade.fotocomunidade_url} className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div className="p-5">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Comunidade</p>
                    <p className="font-extrabold text-slate-800">{comunidade.nome_comunidade}</p>
                    {comunidade.descricao && (
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2">{comunidade.descricao}</p>
                    )}
                    <button
                      onClick={() => navigate(`/comunidade/${comunidade.id_comunidade}`)}
                      className="mt-3 w-full py-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold text-xs shadow hover:scale-[1.01] active:scale-[0.99] transition"
                    >
                      Ver Comunidade
                    </button>
                  </div>
                </div>
              )}

            </div>
          </div>
        )}
      </main>
    </div>
  );
}
