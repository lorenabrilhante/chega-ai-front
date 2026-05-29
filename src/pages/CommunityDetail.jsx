import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Sidebar from "../components/Sidebar";

// ── helpers ──────────────────────────────────────────────
const tipoEmoji = {
  Jogos: "🎮", Música: "🎵", Estudos: "📚",
  Esportes: "⚽", Café: "☕", Outros: "✨",
};

const tipoImg = {
  Jogos:   "https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=600",
  Música:  "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?q=80&w=600",
  Estudos: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=600",
  Esportes:"https://images.unsplash.com/photo-1461896836934-ffe607ba8211?q=80&w=600",
  Café:    "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=600",
  Outros:  "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=600",
};

function formatShortDate(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit", month: "short",
  }).toUpperCase();
}

function formatFullTime(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleTimeString("pt-BR", {
    hour: "2-digit", minute: "2-digit",
  });
}

// ── component ────────────────────────────────────────────
export default function CommunityDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  // Core Data States
  const [comunidade, setComunidade] = useState(null);
  const [dono, setDono] = useState(null);
  const [membros, setMembros] = useState([]);
  const [eventos, setEventos] = useState([]);

  // UI & Loading States
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("eventos"); // "eventos" | "membros"
  const [joining, setJoining] = useState(false);
  const [actionSuccess, setActionSuccess] = useState("");

  // Session & Simulation States
  const [currentUser, setCurrentUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [isVisitor, setIsVisitor] = useState(true);

  const DEFAULT_AVATAR = "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200";
  const DEFAULT_COVER = "https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?q=80&w=1200";

  // 1. Fetch users list & active session on mount
  useEffect(() => {
    // A. Read session from localStorage / sessionStorage
    const saved = localStorage.getItem("chega_ai_user") || sessionStorage.getItem("chega_ai_user");
    if (saved) {
      try {
        const session = JSON.parse(saved);
        const u = session?.usuario || session;
        if (u?.id_usuario) {
          setCurrentUser(u);
          setIsVisitor(false);
        }
      } catch (e) {
        console.error("Erro ao ler sessão do usuário", e);
      }
    }

    // B. Fetch all users for simulation fallback dropdown
    fetch(`${import.meta.env.VITE_API_URL}/usuarios`)
      .then((res) => {
        if (!res.ok) throw new Error("Falha ao buscar usuários");
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data)) {
          setUsers(data);
          if (!saved && data.length > 0) {
            // Simulated user fallback if no active session
            setCurrentUser(data[0]);
          }
        }
      })
      .catch((err) => console.error(err));
  }, []);

  // 2. Fetch community consolidated details
  useEffect(() => {
    if (!id || !currentUser) return;
    setIsLoading(true);
    setError("");

    fetch(`${import.meta.env.VITE_API_URL}/comunidades/${id}/detalhes/${currentUser.id_usuario}`)
      .then((res) => {
        if (!res.ok) throw new Error("Comunidade não encontrada.");
        return res.json();
      })
      .then((data) => {
        setComunidade(data.comunidade || null);
        setDono(data.dono || null);
        setMembros(data.membros || []);
        setEventos(data.eventos || []);
      })
      .catch((err) => setError(err.message))
      .finally(() => setIsLoading(false));
  }, [id, currentUser]);

  // Handle Joining Community
  const handleJoin = async () => {
    if (!currentUser) return;
    setJoining(true);
    setError("");
    setActionSuccess("");

    try {
      const payload = {
        id_usuario_membro: currentUser.id_usuario,
        id_comunidade: Number(id),
        funcao_membro: "membro",
        dataentrada: new Date().toISOString(),
      };
      
      const res = await fetch(`${import.meta.env.VITE_API_URL}/membros-comunidade`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Erro ao ingressar na comunidade.");

      // Re-fetch details to sync members and status perfectly
      const syncRes = await fetch(`${import.meta.env.VITE_API_URL}/comunidades/${id}/detalhes/${currentUser.id_usuario}`);
      const syncData = await syncRes.json();
      setComunidade(syncData.comunidade);
      setMembros(syncData.membros);
      
      setActionSuccess("Você agora faz parte desta comunidade! 🎉");
      setTimeout(() => setActionSuccess(""), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setJoining(false);
    }
  };

  // Handle Leaving Community
  const handleLeave = async () => {
    if (!currentUser) return;
    setJoining(true);
    setError("");
    setActionSuccess("");

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/membros-comunidade/${currentUser.id_usuario}/${id}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Erro ao sair da comunidade.");

      // Re-fetch details to sync members and status perfectly
      const syncRes = await fetch(`${import.meta.env.VITE_API_URL}/comunidades/${id}/detalhes/${currentUser.id_usuario}`);
      const syncData = await syncRes.json();
      setComunidade(syncData.comunidade);
      setMembros(syncData.membros);

      setActionSuccess("Você saiu da comunidade.");
      setTimeout(() => setActionSuccess(""), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setJoining(false);
    }
  };

  const coverUrl = comunidade?.fotocomunidade_url || DEFAULT_COVER;
  const isOwner = currentUser && comunidade && String(comunidade.id_usuario_dono) === String(currentUser.id_usuario);

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-blue-100 via-purple-100 to-yellow-100 p-3 gap-3">
      {/* SIDEBAR */}
      <Sidebar active="/communities" />

      {/* MAIN CONTAINER */}
      <main className="flex-1 flex flex-col gap-3 min-h-0 relative overflow-y-auto pr-1">
        
        {/* HEADER */}
        <header className="flex items-center justify-between px-6 py-4 bg-white/50 rounded-3xl shadow-xl backdrop-blur-xl border border-white/40">
          <div className="flex flex-col">
            <span className="text-xs font-bold uppercase tracking-wider text-purple-600">Comunidade Chega Aí</span>
            <h1 className="text-2xl font-extrabold text-slate-800">
              {isLoading ? "Carregando..." : comunidade?.nome_comunidade || "Detalhes"}
            </h1>
          </div>
          <button
            onClick={() => navigate(-1)}
            className="px-5 py-2.5 bg-white/70 hover:bg-white text-slate-700 rounded-full font-medium transition shadow-md hover:scale-[1.02] border border-slate-100 text-sm"
          >
            ← voltar
          </button>
        </header>

        {/* Visitor simulation */}
        {isVisitor && (
          <div className="p-4 bg-amber-50/70 border border-amber-200/50 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-sm shadow-sm backdrop-blur-sm">
            <div>
              <span className="font-bold text-amber-800 block">✨ Modo de Simulação Ativo</span>
              <span className="text-amber-700 text-xs">
                Você está visualizando como visitante. Escolha um perfil para simular participação e ações.
              </span>
            </div>
            {users.length > 0 && (
              <select
                value={currentUser?.id_usuario || ""}
                onChange={(e) => setCurrentUser(users.find((u) => u.id_usuario === Number(e.target.value)))}
                className="bg-white border border-amber-200 text-slate-800 text-xs font-bold rounded-xl px-3 py-2 outline-none shadow-inner cursor-pointer"
              >
                {users.map((u) => (
                  <option key={u.id_usuario} value={u.id_usuario}>
                    {u.nome_usuario} (@{u.apelido_usuario})
                  </option>
                ))}
              </select>
            )}
          </div>
        )}

        {/* Alerts */}
        {error && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-sm font-bold text-rose-600 shadow-sm">
            ⚠️ {error}
          </div>
        )}
        {actionSuccess && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-sm font-bold text-emerald-600 shadow-sm">
            {actionSuccess}
          </div>
        )}

        {/* LOADING */}
        {isLoading && (
          <div className="flex-1 flex items-center justify-center">
            <div className="w-12 h-12 rounded-full border-4 border-purple-200 border-t-purple-500 animate-spin" />
          </div>
        )}

        {/* COMMUNITY MAIN PANEL */}
        {!isLoading && comunidade && (
          <div className="flex flex-col lg:flex-row gap-4">
            
            {/* LEFT COLUMN: HERO, TABS & MAIN CONTENT */}
            <div className="flex-1 flex flex-col gap-4">
              
              {/* HERO BANNER CARD */}
              <div className="relative h-64 sm:h-80 rounded-3xl overflow-hidden shadow-2xl">
                <img src={coverUrl} className="w-full h-full object-cover" alt={comunidade.nome_comunidade} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent" />
                
                {/* Theme Color Indicator Pill */}
                <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-md text-white text-xs font-extrabold px-3.5 py-1.5 rounded-full border border-white/30">
                  ✨ Ativa
                </div>

                {/* Bottom title & stats overlay */}
                <div className="absolute bottom-6 left-6 right-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                  <div className="text-white">
                    <h2 className="text-3xl font-black tracking-tight leading-none drop-shadow-lg">
                      {comunidade.nome_comunidade}
                    </h2>
                    <p className="text-white/80 font-medium text-sm mt-2 flex items-center gap-1.5">
                      👥 <strong>{comunidade.quantidade_membros || 0}</strong> membros cadastrados
                    </p>
                  </div>

                  {/* Actions buttons inside Hero */}
                  <div className="flex items-center gap-2">
                    {/* Join / Leave toggle */}
                    {comunidade.ja_participo ? (
                      <button
                        onClick={handleLeave}
                        disabled={joining || isOwner}
                        className={`px-5 py-2.5 rounded-full text-xs font-extrabold border transition shadow ${
                          isOwner
                            ? "bg-slate-100 text-slate-400 border-slate-200 cursor-default"
                            : "bg-white/90 hover:bg-rose-50 text-slate-700 hover:text-rose-600 border-slate-200 hover:scale-[1.02] active:scale-[0.98]"
                        }`}
                      >
                        {isOwner ? "👑 Dono da Comunidade" : joining ? "Saindo..." : "Sair da Comunidade"}
                      </button>
                    ) : (
                      <button
                        onClick={handleJoin}
                        disabled={joining}
                        className="px-5 py-2.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full text-xs font-extrabold shadow hover:scale-[1.03] active:scale-[0.97] transition"
                      >
                        {joining ? "Entrando..." : "➕ Participar"}
                      </button>
                    )}

                    {/* Create Event shortcut */}
                    <button
                      onClick={() => navigate("/criar-evento", { state: { idComunidade: comunidade.id_comunidade } })}
                      className="px-5 py-2.5 bg-white text-slate-800 hover:bg-slate-50 rounded-full text-xs font-extrabold shadow hover:scale-[1.03] active:scale-[0.97] transition"
                    >
                      📅 + Novo Evento
                    </button>
                  </div>
                </div>
              </div>

              {/* TABS CONTAINER */}
              <div className="bg-white/60 backdrop-blur-xl rounded-3xl p-2 shadow-xl border border-white/40 flex gap-2">
                <button
                  onClick={() => setActiveTab("eventos")}
                  className={`flex-1 py-3 rounded-2xl font-extrabold text-sm transition ${
                    activeTab === "eventos"
                      ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md"
                      : "text-slate-600 hover:bg-white/70"
                  }`}
                >
                  📅 Eventos da Comunidade ({eventos.length})
                </button>
                <button
                  onClick={() => setActiveTab("membros")}
                  className={`flex-1 py-3 rounded-2xl font-extrabold text-sm transition ${
                    activeTab === "membros"
                      ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md"
                      : "text-slate-600 hover:bg-white/70"
                  }`}
                >
                  👥 Membros ({membros.length})
                </button>
              </div>

              {/* TABS CONTENT */}
              <div className="flex-1 min-h-[300px]">
                
                {/* TAB 1: EVENTS */}
                {activeTab === "eventos" && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {eventos.length === 0 ? (
                      <div className="col-span-full bg-white/50 backdrop-blur-md rounded-[32px] p-10 border border-white/35 text-center flex flex-col items-center justify-center gap-4">
                        <span className="text-5xl">📅</span>
                        <h4 className="text-xl font-bold text-slate-700">Sem eventos cadastrados</h4>
                        <p className="text-sm text-slate-500 max-w-sm">
                          Nenhum evento social ativo foi agendado para esta comunidade no momento.
                        </p>
                        <button
                          onClick={() => navigate("/criar-evento", { state: { idComunidade: comunidade.id_comunidade } })}
                          className="mt-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-extrabold text-xs px-5 py-3 rounded-full shadow hover:scale-[1.01] transition"
                        >
                          🎉 Agendar Primeiro Evento
                        </button>
                      </div>
                    ) : (
                      eventos.map((ev) => {
                        const evEmoji = tipoEmoji[ev.tipo_evento] || "📍";
                        const evCover = tipoImg[ev.tipo_evento] || tipoImg["Outros"];
                        return (
                          <div
                            key={ev.id_evento}
                            onClick={() => navigate(`/evento/${ev.id_evento}`)}
                            className="bg-white/60 hover:bg-white rounded-3xl overflow-hidden shadow hover:scale-[1.01] transition duration-200 cursor-pointer border border-white/30 flex flex-col h-full"
                          >
                            <div className="h-32 relative flex-shrink-0">
                              <img src={evCover} className="w-full h-full object-cover" alt={ev.titulo} />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                              <div className="absolute top-3 left-3 bg-pink-400 text-white text-[10px] font-black px-2.5 py-1 rounded-full">
                                {formatShortDate(ev.horario_inicio)}
                              </div>
                            </div>
                            <div className="p-4 flex-1 flex flex-col justify-between">
                              <div>
                                <h4 className="font-extrabold text-base text-slate-800 line-clamp-1">
                                  {evEmoji} {ev.titulo}
                                </h4>
                                <p className="text-xs text-slate-500 mt-1.5 line-clamp-2">
                                  {ev.descricao || "Sem descrição disponível."}
                                </p>
                              </div>
                              <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between items-center text-[11px] font-bold text-slate-400">
                                <span>⏰ {formatFullTime(ev.horario_inicio)}</span>
                                <span className="text-purple-500 truncate max-w-[120px]">📍 {ev.nome_local}</span>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                )}

                {/* TAB 2: MEMBERS */}
                {activeTab === "membros" && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {membros.map((mb) => {
                      const isMemberOwner = String(comunidade.id_usuario_dono) === String(mb.id_usuario);
                      return (
                        <div
                          key={mb.id_usuario}
                          className="bg-white/60 rounded-3xl p-4 flex flex-col items-center text-center gap-2.5 border border-white/30 shadow-sm relative overflow-hidden"
                        >
                          <img
                            src={mb.fotoperfil_url || DEFAULT_AVATAR}
                            className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-md"
                            alt={mb.nome_usuario}
                          />
                          <div className="flex flex-col">
                            <span className="font-bold text-xs text-slate-800 line-clamp-1">{mb.nome_usuario}</span>
                            <span className="text-[10px] font-semibold text-purple-500">@{mb.apelido_usuario}</span>
                          </div>
                          
                          {/* Role Badge */}
                          <span
                            className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                              isMemberOwner
                                ? "bg-amber-100 text-amber-700 border border-amber-200"
                                : "bg-purple-50 text-purple-600 border border-purple-100"
                            }`}
                          >
                            {isMemberOwner ? "👑 Fundador" : "Membro"}
                          </span>

                          <span className="text-[9px] font-bold text-slate-400">
                            Social Nível {mb.nivelsocial || 1}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}

              </div>
            </div>

            {/* RIGHT COLUMN: ABOUT & CREATOR INFO */}
            <div className="w-full lg:w-80 flex flex-col gap-4">
              
              {/* DESCRIPTION & THEME CARD */}
              <div className="bg-white/70 backdrop-blur-xl rounded-3xl p-6 shadow-xl border border-white/40 flex flex-col gap-4">
                <h3 className="font-extrabold text-slate-700 text-sm uppercase tracking-wider">Sobre a Comunidade</h3>
                <p className="text-slate-600 leading-relaxed font-medium text-sm">
                  {comunidade.descricao || "Esta comunidade não possui uma descrição detalhada ainda."}
                </p>
                
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold">
                  <span className="text-slate-400">Tema Visual:</span>
                  <span className={`px-3 py-1 rounded-full text-white bg-gradient-to-r ${comunidade.temacor || "from-purple-500 to-pink-500"}`}>
                    {comunidade.temacor ? "Customizado" : "Geral"}
                  </span>
                </div>
              </div>

              {/* OWNER CARD */}
              {dono && (
                <div className="bg-white/60 backdrop-blur-xl rounded-3xl p-6 shadow-xl border border-white/40 flex flex-col gap-3">
                  <h3 className="font-extrabold text-slate-700 text-sm uppercase tracking-wider">Fundado por</h3>
                  <div className="flex items-center gap-3">
                    <img
                      src={dono.fotoperfil_url || DEFAULT_AVATAR}
                      className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-md"
                      alt={dono.nome_usuario}
                    />
                    <div>
                      <p className="font-extrabold text-slate-800 text-sm">{dono.nome_usuario}</p>
                      <p className="text-xs font-semibold text-purple-500">@{dono.apelido_usuario}</p>
                    </div>
                  </div>
                  {dono.bio_usuario && (
                    <p className="text-xs font-medium text-slate-500 italic mt-2.5 border-t border-slate-100 pt-2.5">
                      "{dono.bio_usuario}"
                    </p>
                  )}
                </div>
              )}

              {/* QUICK STATISTICS CARD */}
              <div className="bg-white/60 backdrop-blur-xl rounded-3xl p-6 shadow-xl border border-white/40 flex flex-col gap-3">
                <h3 className="font-extrabold text-slate-700 text-sm uppercase tracking-wider">Estatísticas Rápidas</h3>
                <div className="grid grid-cols-2 gap-3 mt-1">
                  <div className="bg-white/40 rounded-2xl p-3 border border-white/20 text-center">
                    <span className="text-2xl block">👥</span>
                    <span className="font-black text-slate-800 text-lg block mt-1">{membros.length}</span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Membros</span>
                  </div>
                  <div className="bg-white/40 rounded-2xl p-3 border border-white/20 text-center">
                    <span className="text-2xl block">📅</span>
                    <span className="font-black text-slate-800 text-lg block mt-1">{eventos.length}</span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Eventos</span>
                  </div>
                </div>
              </div>

            </div>

          </div>
        )}

      </main>
    </div>
  );
}
