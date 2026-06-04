import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Sidebar from "../components/Sidebar";

const DEFAULT_AVATAR = "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=250";
const DEFAULT_COVER  = "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?q=80&w=1200";

export default function UserProfile() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [profileData, setProfileData]     = useState(null);
  const [stats, setStats]                 = useState({ quantidade_eventos: 0, quantidade_amigos: 0, quantidade_comunidades: 0 });
  const [userFriends, setUserFriends]     = useState([]);
  const [userCommunities, setUserCommunities] = useState([]);
  const [userAchievements, setUserAchievements] = useState([]);
  const [isLoading, setIsLoading]         = useState(true);
  const [error, setError]                 = useState("");

  // Session / friendship state
  const [currentUser, setCurrentUser]     = useState(null);
  const [friendStatus, setFriendStatus]   = useState(null); // null | "pendente" | "aceito"
  const [sendingReq, setSendingReq]       = useState(false);
  const [reqMsg, setReqMsg]               = useState("");

  // 1. Load current session
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

  // 2. Load profile data
  useEffect(() => {
    if (!id) return;
    setIsLoading(true);
    setError("");

    const base = import.meta.env.VITE_API_URL;

    Promise.all([
      fetch(`${base}/usuarios/${id}`).then(r => r.ok ? r.json() : Promise.reject("Usuário não encontrado")),
      fetch(`${base}/usuarios/${id}/stats`).then(r => r.ok ? r.json() : { quantidade_eventos: 0, quantidade_amigos: 0, quantidade_comunidades: 0 }).catch(() => ({ quantidade_eventos: 0, quantidade_amigos: 0, quantidade_comunidades: 0 })),
      fetch(`${base}/usuarios/${id}/amigos`).then(r => r.ok ? r.json() : []).catch(() => []),
      fetch(`${base}/usuarios/${id}/comunidades`).then(r => r.ok ? r.json() : []).catch(() => []),
      fetch(`${base}/usuarios/${id}/conquistas`).then(r => r.ok ? r.json() : []).catch(() => []),
    ])
      .then(([profile, s, friends, comms, achs]) => {
        setProfileData(profile);
        setStats(s);
        setUserFriends(Array.isArray(friends) ? friends : []);
        setUserCommunities(Array.isArray(comms) ? comms : []);
        setUserAchievements(Array.isArray(achs) ? achs : []);
      })
      .catch(e => setError(typeof e === "string" ? e : "Erro ao carregar perfil."))
      .finally(() => setIsLoading(false));
  }, [id]);

  // 3. Check friendship status between currentUser and this profile
  useEffect(() => {
    if (!currentUser || !id || String(currentUser.id_usuario) === String(id)) return;
    fetch(`${import.meta.env.VITE_API_URL}/usuarios/${currentUser.id_usuario}/amigos`)
      .then(r => r.ok ? r.json() : [])
      .then(friends => {
        const rel = friends.find(f => String(f.id_usuario) === String(id));
        if (rel) {
          const s = rel.status?.toLowerCase();
          setFriendStatus(s === "aceito" || s === "accepted" ? "aceito" : "pendente");
        } else {
          setFriendStatus(null);
        }
      })
      .catch(() => {});
  }, [currentUser, id]);

  async function handleAddFriend() {
    if (!currentUser) { navigate("/login"); return; }
    setSendingReq(true);
    setReqMsg("");
    try {
      const payload = {
        id_usuario: currentUser.id_usuario,
        id_amigo: Number(id),
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
        throw new Error(d?.error || "Erro ao enviar solicitação.");
      }
      setFriendStatus("pendente");
      setReqMsg("Solicitação de amizade enviada! ✅");
      setTimeout(() => setReqMsg(""), 3000);
    } catch (e) {
      setReqMsg(`⚠️ ${e.message}`);
    } finally {
      setSendingReq(false);
    }
  }

  const isOwnProfile = currentUser && String(currentUser.id_usuario) === String(id);
  const progresso = profileData ? ((profileData.xpatual || 0) / (profileData.xpmaximo || 1000)) * 100 : 0;

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-blue-100 via-purple-100 to-yellow-100 p-3 gap-3">
      <Sidebar active="" />

      <main className="flex-1 flex flex-col gap-3 overflow-y-auto pr-1">

        {/* HEADER */}
        <header className="flex items-center justify-between px-6 py-4 bg-white/50 rounded-3xl shadow-xl backdrop-blur-xl border border-white/40">
          <div className="flex flex-col">
            <span className="text-xs font-bold uppercase tracking-wider text-purple-600">Perfil Público</span>
            <h1 className="text-2xl font-extrabold text-slate-800">
              {isLoading ? "Carregando..." : profileData?.nome_usuario || "Usuário"}
            </h1>
          </div>
          <button
            onClick={() => navigate(-1)}
            className="px-5 py-2.5 bg-white/70 hover:bg-white text-slate-700 rounded-full font-medium transition shadow-md hover:scale-[1.02] border border-slate-100 text-sm"
          >
            ← voltar
          </button>
        </header>

        {/* ALERTS */}
        {error && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-sm font-bold text-rose-600 shadow-sm">
            ⚠️ {error}
          </div>
        )}
        {reqMsg && (
          <div className={`p-4 rounded-2xl text-sm font-bold shadow-sm ${reqMsg.startsWith("⚠️") ? "bg-rose-50 border border-rose-200 text-rose-600" : "bg-emerald-50 border border-emerald-200 text-emerald-600"}`}>
            {reqMsg}
          </div>
        )}

        {/* LOADING */}
        {isLoading && (
          <div className="flex-1 flex items-center justify-center">
            <div className="w-12 h-12 rounded-full border-4 border-purple-200 border-t-purple-500 animate-spin" />
          </div>
        )}

        {/* CONTENT */}
        {!isLoading && profileData && (
          <>
            {/* PROFILE CARD */}
            <section className="bg-white/60 backdrop-blur-xl border border-white/40 rounded-3xl overflow-hidden shadow-2xl">

              {/* CAPA */}
              <div className="h-48 relative overflow-hidden group">
                <img
                  src={profileData.fotocapa_url || DEFAULT_COVER}
                  alt="Capa"
                  className="w-full h-full object-cover transition duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              </div>

              {/* INFO */}
              <div className="px-8 pb-8 relative">

                {/* AVATAR */}
                <div className="absolute -top-16 left-8 z-10">
                  <img
                    src={profileData.fotoperfil_url || DEFAULT_AVATAR}
                    alt={profileData.nome_usuario}
                    className="w-32 h-32 rounded-full border-4 border-white shadow-2xl object-cover"
                  />
                </div>

                <div className="pt-20 flex flex-col lg:flex-row justify-between gap-6">

                  {/* LEFT — dados */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 flex-wrap">
                      <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">
                        {profileData.nome_usuario}
                      </h2>
                      <span className="text-xs bg-gradient-to-r from-green-400 to-emerald-500 font-extrabold text-white px-3 py-1 rounded-full shadow">
                        lvl {profileData.nivelsocial || 1}
                      </span>
                    </div>
                    <p className="text-sm font-semibold text-purple-600 mt-0.5">
                      @{profileData.apelido_usuario}
                    </p>
                    <p className="mt-4 text-slate-600 font-medium max-w-xl leading-relaxed bg-white/30 p-4 rounded-2xl border border-white/20">
                      {profileData.bio_usuario || "✨ Nenhuma bio cadastrada."}
                    </p>

                    {/* STATS */}
                    <div className="flex flex-wrap gap-4 mt-6 text-sm font-bold text-slate-600">
                      <div className="bg-white/40 px-4 py-2 rounded-xl shadow-sm border border-white/20">
                        <span className="text-purple-600 font-black text-base mr-1">{stats.quantidade_eventos || 0}</span>eventos
                      </div>
                      <div className="bg-white/40 px-4 py-2 rounded-xl shadow-sm border border-white/20">
                        <span className="text-cyan-600 font-black text-base mr-1">{stats.quantidade_amigos || 0}</span>amigos
                      </div>
                      <div className="bg-white/40 px-4 py-2 rounded-xl shadow-sm border border-white/20">
                        <span className="text-pink-600 font-black text-base mr-1">{stats.quantidade_comunidades || 0}</span>comunidades
                      </div>
                    </div>

                    {/* FRIEND ACTION */}
                    {!isOwnProfile && (
                      <div className="mt-6">
                        {friendStatus === "aceito" ? (
                          <span className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-50 border border-emerald-200 text-emerald-700 font-extrabold text-sm rounded-full shadow-sm">
                            ✅ Vocês são amigos
                          </span>
                        ) : friendStatus === "pendente" ? (
                          <span className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-50 border border-amber-200 text-amber-700 font-extrabold text-sm rounded-full shadow-sm">
                            ⏳ Solicitação enviada
                          </span>
                        ) : (
                          <button
                            onClick={handleAddFriend}
                            disabled={sendingReq}
                            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 via-fuchsia-500 to-pink-500 text-white font-extrabold text-sm rounded-full shadow-lg hover:scale-[1.03] hover:brightness-105 active:scale-[0.97] transition disabled:opacity-70"
                          >
                            {sendingReq ? "Enviando..." : "➕ Solicitar Amizade"}
                          </button>
                        )}
                      </div>
                    )}
                    {isOwnProfile && (
                      <div className="mt-6">
                        <button
                          onClick={() => navigate("/profile")}
                          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-extrabold text-sm rounded-full shadow-lg hover:scale-[1.02] transition"
                        >
                          ⚙️ Editar meu perfil
                        </button>
                      </div>
                    )}
                  </div>

                  {/* RIGHT — gamification */}
                  <div className="w-full lg:w-72 bg-white/70 backdrop-blur-md rounded-3xl p-5 shadow-xl border border-white/30 flex flex-col gap-4">
                    <div className="flex justify-between items-center">
                      <h3 className="font-extrabold text-slate-700 text-sm tracking-wide uppercase">Nível Social</h3>
                      <span className="text-xs bg-gradient-to-r from-green-400 to-emerald-500 font-extrabold text-white px-3.5 py-1.5 rounded-full shadow-md">
                        lvl {profileData.nivelsocial || 1}
                      </span>
                    </div>
                    <div>
                      <div className="h-3 bg-slate-200/80 rounded-full overflow-hidden shadow-inner">
                        <div
                          className="h-full bg-gradient-to-r from-purple-500 via-pink-400 to-yellow-300 rounded-full transition-all duration-500"
                          style={{ width: `${Math.min(progresso, 100)}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-xs font-bold text-slate-400 mt-2">
                        <span>{profileData.xpatual || 0} XP</span>
                        <span>{profileData.xpmaximo || 1000} XP MÁX</span>
                      </div>
                    </div>

                    {/* Achievements */}
                    <div className="border-t border-slate-100 pt-4">
                      <h4 className="font-extrabold text-slate-700 text-xs tracking-wide uppercase mb-3">Conquistas</h4>
                      <div className="flex flex-wrap gap-2">
                        {userAchievements.length > 0 ? (
                          userAchievements.map((c, i) => (
                            <div
                              key={i}
                              className="w-11 h-11 rounded-2xl bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center shadow-md font-bold text-xl hover:scale-110 transition border border-white/40 cursor-help"
                              title={`${c.nome}: ${c.descricao} (+${c.recompensa_xp} XP)`}
                            >
                              {c.simbolo_icone || "🏆"}
                            </div>
                          ))
                        ) : (
                          <p className="text-xs font-bold text-slate-400/80 italic">Sem conquistas ainda. 🏆</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* BOTTOM GRID */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">

              {/* COMUNIDADES */}
              <section className="bg-white/60 backdrop-blur-xl border border-white/40 rounded-3xl p-6 shadow-xl flex flex-col gap-4">
                <h2 className="text-lg font-extrabold text-slate-800">Comunidades</h2>
                {userCommunities.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {userCommunities.map((c, i) => (
                      <div
                        key={i}
                        onClick={() => navigate(`/comunidade/${c.id_comunidade}`)}
                        className="bg-white/70 border border-white/30 rounded-2xl overflow-hidden shadow-sm hover:scale-[1.01] transition cursor-pointer"
                      >
                        <div className="h-20 overflow-hidden">
                          <img src={c.fotocomunidade_url || "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=600"} className="w-full h-full object-cover" alt={c.nome_comunidade} />
                        </div>
                        <div className="p-3">
                          <p className="font-bold text-slate-800 text-sm line-clamp-1">{c.nome_comunidade}</p>
                          <p className="text-[11px] text-slate-400 font-semibold mt-0.5">{c.quantidade_membros || 0} membros</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-400 font-medium">Este usuário não participa de comunidades ainda.</p>
                )}
              </section>

              {/* AMIGOS */}
              <section className="bg-white/60 backdrop-blur-xl border border-white/40 rounded-3xl p-6 shadow-xl flex flex-col gap-4">
                <h2 className="text-lg font-extrabold text-slate-800">Amigos ({userFriends.length})</h2>
                {userFriends.length > 0 ? (
                  <div className="flex flex-col gap-2">
                    {userFriends.slice(0, 8).map((f, i) => (
                      <div
                        key={i}
                        onClick={() => navigate(`/usuario/${f.id_usuario}`)}
                        className="flex items-center gap-3 p-3 bg-white/70 border border-white/30 rounded-2xl shadow-sm hover:scale-[1.01] hover:bg-white transition cursor-pointer"
                      >
                        <img src={f.fotoperfil_url || DEFAULT_AVATAR} className="w-10 h-10 rounded-full object-cover border border-white shadow-sm" alt={f.nome_usuario} />
                        <div>
                          <p className="font-bold text-slate-800 text-sm">{f.nome_usuario}</p>
                          <p className="text-[11px] font-semibold text-purple-500">@{f.apelido_usuario}</p>
                        </div>
                        <span className={`ml-auto text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                          f.status?.toLowerCase() === "aceito" || f.status?.toLowerCase() === "accepted"
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-amber-100 text-amber-700"
                        }`}>
                          {f.status?.toLowerCase() === "aceito" || f.status?.toLowerCase() === "accepted" ? "✅ Amigos" : "⏳ Pendente"}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-400 font-medium">Este usuário ainda não tem amigos vinculados.</p>
                )}
              </section>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
