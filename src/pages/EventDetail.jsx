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
  const [participantes, setParticipantes] = useState([]);
  const [friendReqs, setFriendReqs] = useState({}); // { [id_usuario]: "pendente"|"aceito"|"sending" }
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  const [jaParticipa, setJaParticipa] = useState(false);
  const [joining, setJoining] = useState(false);
  const [joinSuccess, setJoinSuccess] = useState(false);
  const [copied, setCopied] = useState(false);

  const eventUrl = typeof window !== "undefined" ? window.location.href : "";

  function handleCopyLink() {
    navigator.clipboard.writeText(eventUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  }

  function shareOn(platform) {
    const text = encodeURIComponent(`Vem comigo nesse evento: ${evento?.titulo || ""} 🎉`);
    const url = encodeURIComponent(eventUrl);
    const links = {
      whatsapp: `https://wa.me/?text=${text}%20${url}`,
      twitter:  `https://twitter.com/intent/tweet?text=${text}&url=${url}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
      telegram: `https://t.me/share/url?url=${url}&text=${text}`,
    };
    if (links[platform]) window.open(links[platform], "_blank", "noopener");
  }

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

  // load participants with user details
  useEffect(() => {
    if (!id) return;
    fetch(`${import.meta.env.VITE_API_URL}/participantes-evento?id_evento=${id}`)
      .then(r => r.ok ? r.json() : [])
      .then(async (list) => {
        if (!Array.isArray(list) || list.length === 0) return;
        const details = await Promise.all(
          list.map(p =>
            fetch(`${import.meta.env.VITE_API_URL}/usuarios/${p.id_participante}`)
              .then(r => r.ok ? r.json() : null)
              .catch(() => null)
          )
        );
        setParticipantes(details.filter(Boolean));
      })
      .catch(() => {});
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

    // load friendship statuses for participants
    fetch(`${import.meta.env.VITE_API_URL}/usuarios/${currentUser.id_usuario}/amigos`)
      .then(r => r.ok ? r.json() : [])
      .then(friends => {
        const map = {};
        if (Array.isArray(friends)) {
          friends.forEach(f => {
            const s = f.status?.toLowerCase();
            map[String(f.id_usuario)] = (s === "aceito" || s === "accepted") ? "aceito" : "pendente";
          });
        }
        setFriendReqs(map);
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

  async function handleFriendRequest(userId) {
    if (!currentUser) { navigate("/login"); return; }
    setFriendReqs(prev => ({ ...prev, [String(userId)]: "sending" }));
    try {
      const payload = {
        id_usuario: currentUser.id_usuario,
        id_amigo: Number(userId),
        status: "pendente",
        datarequisicao: new Date().toISOString(),
      };
      const res = await fetch(`${import.meta.env.VITE_API_URL}/amizades`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d?.error || "Erro");
      }
      setFriendReqs(prev => ({ ...prev, [String(userId)]: "pendente" }));
    } catch (_) {
      setFriendReqs(prev => { const n = {...prev}; delete n[String(userId)]; return n; });
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

              {/* PARTICIPANTS */}
              {participantes.length > 0 && (
                <div className="bg-white/60 backdrop-blur-xl rounded-3xl p-6 shadow-xl border border-white/40">
                  <h3 className="font-extrabold text-slate-700 text-sm uppercase tracking-wider mb-4">
                    👥 Quem vai ({participantes.length})
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {participantes.map((p) => {
                      const pid = String(p.id_usuario);
                      const isMe = currentUser && String(currentUser.id_usuario) === pid;
                      const status = friendReqs[pid];
                      return (
                        <div
                          key={p.id_usuario}
                          className="bg-white/70 rounded-2xl p-3 flex flex-col items-center gap-2 border border-white/30 shadow-sm hover:shadow-md transition"
                        >
                          {/* Avatar — clicável */}
                          <button
                            onClick={() => navigate(`/usuario/${p.id_usuario}`)}
                            className="relative group focus:outline-none"
                            title={`Ver perfil de ${p.nome_usuario}`}
                          >
                            <img
                              src={p.fotoperfil_url || DEFAULT_AVATAR}
                              className="w-14 h-14 rounded-full object-cover border-2 border-white shadow-md group-hover:scale-105 transition"
                              alt={p.nome_usuario}
                            />
                            <span className="absolute inset-0 rounded-full ring-2 ring-purple-400 ring-offset-2 opacity-0 group-hover:opacity-100 transition" />
                          </button>

                          {/* Name */}
                          <div className="text-center">
                            <button
                              onClick={() => navigate(`/usuario/${p.id_usuario}`)}
                              className="font-bold text-xs text-slate-800 hover:text-purple-600 transition line-clamp-1"
                            >
                              {p.nome_usuario}
                            </button>
                            <p className="text-[10px] font-semibold text-purple-400">@{p.apelido_usuario}</p>
                          </div>

                          {/* Friend button */}
                          {!isMe && (
                            status === "aceito" ? (
                              <span className="text-[9px] font-extrabold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">✅ Amigos</span>
                            ) : status === "pendente" || status === "sending" ? (
                              <span className="text-[9px] font-extrabold text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                                {status === "sending" ? "..." : "⏳ Pendente"}
                              </span>
                            ) : (
                              <button
                                onClick={() => handleFriendRequest(p.id_usuario)}
                                className="text-[10px] font-extrabold text-white bg-gradient-to-r from-purple-500 to-pink-500 px-3 py-1 rounded-full hover:scale-105 active:scale-95 transition shadow-sm"
                              >
                                + Amigo
                              </button>
                            )
                          )}
                          {isMe && (
                            <span className="text-[9px] font-extrabold text-slate-400 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-full">Você</span>
                          )}
                        </div>
                      );
                    })}
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

              {/* SHARE CARD */}
              <div className="bg-white/60 backdrop-blur-xl rounded-3xl p-6 shadow-xl border border-white/40 flex flex-col gap-4">
                <h3 className="font-extrabold text-slate-700 text-sm uppercase tracking-wider">Compartilhar</h3>
                <p className="text-xs text-slate-500 font-medium">Chame seus amigos para esse evento!</p>

                {/* Social buttons */}
                <div className="flex justify-between gap-2">
                  {/* WhatsApp */}
                  <button
                    onClick={() => shareOn("whatsapp")}
                    title="Compartilhar no WhatsApp"
                    className="flex-1 flex flex-col items-center gap-1.5 py-3 rounded-2xl bg-[#25D366]/10 hover:bg-[#25D366]/20 transition-all hover:scale-105 active:scale-95 group border border-[#25D366]/20"
                  >
                    <svg viewBox="0 0 24 24" className="w-6 h-6 fill-[#25D366]" xmlns="http://www.w3.org/2000/svg">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                    </svg>
                    <span className="text-[10px] font-bold text-[#25D366]">WhatsApp</span>
                  </button>

                  {/* X / Twitter */}
                  <button
                    onClick={() => shareOn("twitter")}
                    title="Compartilhar no X"
                    className="flex-1 flex flex-col items-center gap-1.5 py-3 rounded-2xl bg-black/5 hover:bg-black/10 transition-all hover:scale-105 active:scale-95 group border border-black/10"
                  >
                    <svg viewBox="0 0 24 24" className="w-6 h-6 fill-black" xmlns="http://www.w3.org/2000/svg">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                    </svg>
                    <span className="text-[10px] font-bold text-slate-700">Twitter / X</span>
                  </button>

                  {/* Facebook */}
                  <button
                    onClick={() => shareOn("facebook")}
                    title="Compartilhar no Facebook"
                    className="flex-1 flex flex-col items-center gap-1.5 py-3 rounded-2xl bg-[#1877F2]/10 hover:bg-[#1877F2]/20 transition-all hover:scale-105 active:scale-95 group border border-[#1877F2]/20"
                  >
                    <svg viewBox="0 0 24 24" className="w-6 h-6 fill-[#1877F2]" xmlns="http://www.w3.org/2000/svg">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                    <span className="text-[10px] font-bold text-[#1877F2]">Facebook</span>
                  </button>

                  {/* Telegram */}
                  <button
                    onClick={() => shareOn("telegram")}
                    title="Compartilhar no Telegram"
                    className="flex-1 flex flex-col items-center gap-1.5 py-3 rounded-2xl bg-[#0088CC]/10 hover:bg-[#0088CC]/20 transition-all hover:scale-105 active:scale-95 group border border-[#0088CC]/20"
                  >
                    <svg viewBox="0 0 24 24" className="w-6 h-6 fill-[#0088CC]" xmlns="http://www.w3.org/2000/svg">
                      <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                    </svg>
                    <span className="text-[10px] font-bold text-[#0088CC]">Telegram</span>
                  </button>
                </div>

                {/* Copy link */}
                <button
                  onClick={handleCopyLink}
                  className={`w-full flex items-center justify-center gap-2 py-3 rounded-full font-bold text-sm transition-all border ${
                    copied
                      ? "bg-emerald-50 border-emerald-200 text-emerald-600"
                      : "bg-white/80 hover:bg-white border-slate-200 text-slate-700 hover:scale-[1.01] active:scale-[0.98]"
                  } shadow-sm`}
                >
                  {copied ? (
                    <>
                      <svg viewBox="0 0 24 24" className="w-4 h-4 fill-emerald-500" xmlns="http://www.w3.org/2000/svg"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
                      Link copiado!
                    </>
                  ) : (
                    <>
                      <svg viewBox="0 0 24 24" className="w-4 h-4 fill-slate-500" xmlns="http://www.w3.org/2000/svg"><path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/></svg>
                      Copiar link do evento
                    </>
                  )}
                </button>
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
