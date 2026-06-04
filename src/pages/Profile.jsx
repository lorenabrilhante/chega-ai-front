import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";

export default function Profile() {
  const navigate = useNavigate();

  // Default images fallbacks
  const DEFAULT_AVATAR = "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=250";
  const DEFAULT_COVER = "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?q=80&w=1200";

  // Active User / Session State
  const [userId, setUserId] = useState("");
  const [profileData, setProfileData] = useState(null);
  const [allUsers, setAllUsers] = useState([]);
  const [isVisitor, setIsVisitor] = useState(true);

  // Dynamic States for Profile Integration
  const [stats, setStats] = useState({ quantidade_eventos: 0, quantidade_amigos: 0, quantidade_comunidades: 0 });
  const [userCommunities, setUserCommunities] = useState([]);
  const [userAchievements, setUserAchievements] = useState([]);
  const [userFriends, setUserFriends] = useState([]);

  // Edit Form State
  const [isEditing, setIsEditing] = useState(false);
  const [nomeUsuario, setNomeUsuario] = useState("");
  const [apelidoUsuario, setApelidoUsuario] = useState("");
  const [emailUsuario, setEmailUsuario] = useState("");
  const [senhaUsuario, setSenhaUsuario] = useState("");
  const [bioUsuario, setBioUsuario] = useState("");
  const [fotoPerfilUrl, setFotoPerfilUrl] = useState("");
  const [fotoCapaUrl, setFotoCapaUrl] = useState("");

  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Helper to load profile data and custom backend endpoints
  async function fetchProfile(id) {
    if (!id) return;
    setIsLoading(true);
    setError("");
    try {
      // 1. Fetch main user profile data
      const response = await fetch(`${import.meta.env.VITE_API_URL}/usuarios/${id}`);
      if (!response.ok) throw new Error("Erro ao buscar dados do perfil.");
      const data = await response.json();
      setProfileData(data);
      
      // Sync form fields
      setNomeUsuario(data.nome_usuario || "");
      setApelidoUsuario(data.apelido_usuario || "");
      setEmailUsuario(data.email_usuario || "");
      setSenhaUsuario(data.senha_usuario || "");
      setBioUsuario(data.bio_usuario || "");
      setFotoPerfilUrl(data.fotoperfil_url || "");
      setFotoCapaUrl(data.fotocapa_url || "");

      // 2. Fetch Stats
      try {
        const statsRes = await fetch(`${import.meta.env.VITE_API_URL}/usuarios/${id}/stats`);
        if (statsRes.ok) {
          const statsData = await statsRes.json();
          setStats(statsData);
        } else {
          setStats({ quantidade_eventos: 0, quantidade_amigos: 0, quantidade_comunidades: 0 });
        }
      } catch (err) {
        console.error("Erro ao buscar estatísticas do perfil:", err);
        setStats({ quantidade_eventos: 0, quantidade_amigos: 0, quantidade_comunidades: 0 });
      }

      // 3. Fetch Communities
      try {
        const commsRes = await fetch(`${import.meta.env.VITE_API_URL}/usuarios/${id}/comunidades`);
        if (commsRes.ok) {
          const commsData = await commsRes.json();
          setUserCommunities(Array.isArray(commsData) ? commsData : []);
        } else {
          setUserCommunities([]);
        }
      } catch (err) {
        console.error("Erro ao buscar comunidades do perfil:", err);
        setUserCommunities([]);
      }

      // 4. Fetch Achievements
      try {
        const achsRes = await fetch(`${import.meta.env.VITE_API_URL}/usuarios/${id}/conquistas`);
        if (achsRes.ok) {
          const achsData = await achsRes.json();
          setUserAchievements(Array.isArray(achsData) ? achsData : []);
        } else {
          setUserAchievements([]);
        }
      } catch (err) {
        console.error("Erro ao buscar conquistas do perfil:", err);
        setUserAchievements([]);
      }

      // 5. Fetch Friends
      try {
        const friendsRes = await fetch(`${import.meta.env.VITE_API_URL}/usuarios/${id}/amigos`);
        if (friendsRes.ok) {
          const friendsData = await friendsRes.json();
          setUserFriends(Array.isArray(friendsData) ? friendsData : []);
        } else {
          setUserFriends([]);
        }
      } catch (err) {
        console.error("Erro ao buscar amigos do perfil:", err);
        setUserFriends([]);
      }

    } catch (err) {
      console.error(err);
      setError("Não foi possível carregar as informações em tempo real do perfil.");
    } finally {
      setIsLoading(false);
    }
  }

  // Initial load
  useEffect(() => {
    // 1. Check local session
    const savedSession = localStorage.getItem("chega_ai_user") || sessionStorage.getItem("chega_ai_user");
    let activeId = "";

    if (savedSession) {
      try {
        const session = JSON.parse(savedSession);
        const userObj = session?.usuario || session;
        if (userObj && userObj.id_usuario) {
          activeId = userObj.id_usuario;
          setUserId(activeId);
          setIsVisitor(false);
        }
      } catch (e) {
        console.error("Erro ao ler sessão no perfil", e);
      }
    }

    // 2. Load all users (for simulation/visitor fallback switcher)
    fetch(`${import.meta.env.VITE_API_URL}/usuarios`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setAllUsers(data);
          // If no active session, simulate the first user's profile
          if (!activeId && data.length > 0) {
            setUserId(data[0].id_usuario);
            fetchProfile(data[0].id_usuario);
          }
        }
      })
      .catch((err) => console.error("Erro ao listar usuários:", err));

    if (activeId) {
      fetchProfile(activeId);
    }
  }, []);

  // Handler for visitor selector
  function handleUserChange(e) {
    const selectedId = e.target.value;
    setUserId(selectedId);
    fetchProfile(selectedId);
  }

  // Handle Edit Submit (PUT)
  async function handleSave(e) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!nomeUsuario.trim()) {
      setError("O nome é obrigatório.");
      return;
    }
    if (!apelidoUsuario.trim()) {
      setError("O apelido é obrigatório.");
      return;
    }
    if (!emailUsuario.trim()) {
      setError("O e-mail é obrigatório.");
      return;
    }

    setIsSaving(true);

    const payload = {
      nome_usuario: nomeUsuario.trim(),
      apelido_usuario: apelidoUsuario.trim(),
      email_usuario: emailUsuario.trim(),
      senha_usuario: senhaUsuario || profileData?.senha_usuario,
      bio_usuario: bioUsuario.trim() || null,
      fotoperfil_url: fotoPerfilUrl.trim() || null,
      fotocapa_url: fotoCapaUrl.trim() || null,
    };

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/usuarios/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.error || data?.message || "Ocorreu um erro ao atualizar dados.");
      }

      setSuccess("Perfil atualizado com sucesso! ✨");
      
      // Update local storage session if we are updating our own profile
      const savedSession = localStorage.getItem("chega_ai_user") || sessionStorage.getItem("chega_ai_user");
      if (savedSession) {
        try {
          const session = JSON.parse(savedSession);
          if (session.usuario && session.usuario.id_usuario === userId) {
            session.usuario = data;
            const remember = !!localStorage.getItem("chega_ai_user");
            const storage = remember ? localStorage : sessionStorage;
            storage.setItem("chega_ai_user", JSON.stringify(session));
          } else if (session.id_usuario === userId) {
            const remember = !!localStorage.getItem("chega_ai_user");
            const storage = remember ? localStorage : sessionStorage;
            storage.setItem("chega_ai_user", JSON.stringify(data));
          }
        } catch (storageErr) {
          console.error(storageErr);
        }
      }

      // Re-fetch profile data to update UI state
      await fetchProfile(userId);

      // Hide modal after short delay
      setTimeout(() => {
        setIsEditing(false);
        setSuccess("");
      }, 1500);

    } catch (saveErr) {
      setError(saveErr.message || "Erro ao salvar alterações. Tente novamente.");
    } finally {
      setIsSaving(false);
    }
  }

  // Values display (fallbacks)
  const displayCover = profileData?.fotocapa_url || DEFAULT_COVER;
  const displayAvatar = profileData?.fotoperfil_url || DEFAULT_AVATAR;
  const displayNome = profileData?.nome_usuario || "Carregando...";
  const displayApelido = profileData?.apelido_usuario ? `@${profileData.apelido_usuario}` : "@carregando";
  const displayBio = profileData?.bio_usuario || "✨ Nenhuma bio cadastrada ainda.";
  const displayLevel = profileData?.nivelsocial || 1;
  const displayXpCurrent = profileData?.xpatual || 0;
  const displayXpMax = profileData?.xpmaximo || 1000;
  const progresso = (displayXpCurrent / displayXpMax) * 100;

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-blue-100 via-pink-100 to-yellow-100 p-3 gap-3 overflow-hidden">
      
      {/* SIDEBAR */}
      <Sidebar active="/profile" />

      {/* MAIN */}
      <main className="flex-1 flex flex-col gap-3 overflow-y-auto pr-1 relative">
        
        {/* HEADER */}
        <header className="bg-white/60 backdrop-blur-xl border border-white/40 rounded-3xl px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
          <div className="flex flex-col">
            <span className="text-xs font-bold uppercase tracking-wider text-purple-600">
              Painel Social
            </span>
            <h1 className="text-2xl font-extrabold text-slate-800">
              Seu Perfil
            </h1>
          </div>

          <div className="flex items-center gap-4">
            {isVisitor && allUsers.length > 0 && (
              <div className="flex items-center gap-2 bg-amber-50/70 border border-amber-200/50 px-3 py-1.5 rounded-2xl text-xs font-bold text-amber-800">
                <span>Simular Perfil:</span>
                <select
                  value={userId}
                  onChange={handleUserChange}
                  className="bg-white border border-amber-200 rounded-lg p-1 outline-none font-bold text-slate-700 cursor-pointer shadow-inner"
                >
                  {allUsers.map((u) => (
                    <option key={u.id_usuario} value={u.id_usuario}>
                      {u.nome_usuario} (@{u.apelido_usuario})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <button
              onClick={() => {
                setError("");
                setSuccess("");
                setIsEditing(true);
              }}
              className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-5 py-2.5 rounded-full shadow-lg font-bold text-sm hover:scale-[1.02] active:scale-[0.99] transition duration-200"
            >
              Editar Perfil ⚙️
            </button>
          </div>
        </header>

        {/* LOADING INDICATOR */}
        {isLoading && (
          <div className="p-8 bg-white/60 rounded-3xl text-center text-slate-600 font-bold backdrop-blur-md border border-white/40 shadow">
            Carregando informações do perfil...
          </div>
        )}

        {/* PERFIL CONTAINER */}
        {!isLoading && profileData && (
          <section className="bg-white/60 backdrop-blur-xl border border-white/40 rounded-3xl overflow-hidden shadow-2xl transition duration-300">
            
            {/* CAPA */}
            <div className="h-48 relative overflow-hidden group">
              <img
                src={displayCover}
                alt="Foto de capa"
                className="w-full h-full object-cover transition duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
            </div>

            {/* INFO */}
            <div className="px-8 pb-8 relative">
              
              {/* FOTO DE PERFIL */}
              <div className="absolute -top-16 left-8 z-10">
                <img
                  src={displayAvatar}
                  alt={displayNome}
                  className="w-32 h-32 rounded-full border-4 border-white shadow-2xl object-cover hover:scale-105 transition duration-200"
                />
              </div>

              <div className="pt-20 flex flex-col lg:flex-row justify-between gap-6">
                
                {/* ESQUERDA - DADOS GERAIS */}
                <div className="flex-1">
                  <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">
                    {displayNome}
                  </h2>
                  <p className="text-sm font-semibold text-purple-600 mt-0.5">
                    {displayApelido}
                  </p>
                  <p className="mt-4 text-slate-600 font-medium max-w-xl leading-relaxed bg-white/30 p-4 rounded-2xl border border-white/20">
                    {displayBio}
                  </p>

                  {/* STATS REAL COUNTERS */}
                  <div className="flex flex-wrap gap-6 mt-6 text-sm font-bold text-slate-600">
                    <div className="bg-white/40 px-4 py-2 rounded-xl shadow-sm border border-white/20">
                      <span className="text-purple-600 font-black text-base mr-1">{stats.quantidade_eventos || 0}</span>
                      eventos
                    </div>
                    <div className="bg-white/40 px-4 py-2 rounded-xl shadow-sm border border-white/20">
                      <span className="text-cyan-600 font-black text-base mr-1">{stats.quantidade_amigos || 0}</span>
                      amigos
                    </div>
                    <div className="bg-white/40 px-4 py-2 rounded-xl shadow-sm border border-white/20">
                      <span className="text-pink-600 font-black text-base mr-1">{stats.quantidade_comunidades || 0}</span>
                      comunidades
                    </div>
                  </div>
                </div>

                {/* CARD LATERAL - GAMIFICATION */}
                <div className="w-full lg:w-80 bg-white/70 backdrop-blur-md rounded-3xl p-5 shadow-xl border border-white/30 flex flex-col gap-4">
                  <div className="flex justify-between items-center">
                    <h3 className="font-extrabold text-slate-700 text-sm tracking-wide uppercase">
                      Nível Social
                    </h3>
                    <span className="text-xs bg-gradient-to-r from-green-400 to-emerald-500 font-extrabold text-white px-3.5 py-1.5 rounded-full shadow-md">
                      lvl {displayLevel}
                    </span>
                  </div>

                  <div>
                    <div className="h-3 bg-slate-200/80 rounded-full overflow-hidden shadow-inner">
                      <div
                        className="h-full bg-gradient-to-r from-purple-500 via-pink-400 to-yellow-300 rounded-full transition-all duration-500"
                        style={{ width: `${progresso}%` }}
                      />
                    </div>
                    <div className="flex justify-between items-center text-xs font-bold text-slate-400 mt-2">
                      <span>{displayXpCurrent} XP</span>
                      <span>{displayXpMax} XP MÁX</span>
                    </div>
                  </div>

                  {/* DYNAMIC ACHIEVEMENTS */}
                  <div className="border-t border-slate-100 pt-4 mt-2">
                    <h4 className="font-extrabold text-slate-700 text-xs tracking-wide uppercase mb-3">
                      Conquistas Recentes
                    </h4>
                    <div className="flex flex-wrap gap-2.5">
                      {userAchievements.length > 0 ? (
                        userAchievements.map((c, i) => (
                          <div
                            key={i}
                            className="w-11 h-11 rounded-2xl bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center shadow-md font-bold text-xl hover:scale-110 active:scale-95 transition duration-200 border border-white/40 cursor-help"
                            title={`${c.nome}: ${c.descricao} (+${c.recompensa_xp} XP)`}
                          >
                            {c.simbolo_icone || "🏆"}
                          </div>
                        ))
                      ) : (
                        <p className="text-xs font-bold text-slate-400/80 italic">
                          Sem conquistas ainda. Participe de eventos! 🏆
                        </p>
                      )}
                    </div>
                  </div>
                </div>

              </div>
            </div>

          </section>
        )}

        {/* DYNAMIC BOTTOM GRID: COMMUNITIES & FRIENDS */}
        {!isLoading && profileData && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mt-3">
            
            {/* MINHAS COMUNIDADES */}
            <section className="bg-white/60 backdrop-blur-xl border border-white/40 rounded-3xl p-6 shadow-xl flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center mb-5">
                  <h2 className="text-xl font-extrabold text-slate-800">
                    Minhas Comunidades
                  </h2>
                  <button 
                    onClick={() => navigate("/communities")}
                    className="text-sm font-bold text-purple-600 hover:text-purple-700 underline transition"
                  >
                    ver todas
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {userCommunities.length > 0 ? (
                    userCommunities.map((c, i) => (
                      <div
                        key={i}
                        className="bg-white/70 border border-white/30 rounded-[24px] overflow-hidden shadow-md hover:scale-[1.01] hover:shadow-lg transition duration-200 flex flex-col justify-between"
                      >
                        <div>
                          <div className="h-28 overflow-hidden">
                            <img
                              src={c.fotocomunidade_url || "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=600"}
                              alt={c.nome_comunidade}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="p-4">
                            <h3 className="font-bold text-slate-800 text-sm">
                              {c.nome_comunidade}
                            </h3>
                            <p className="text-xs font-semibold text-slate-400 mt-1">
                              {c.quantidade_membros === 1 ? "1 membro" : `${c.quantidade_membros || 0} membros`}
                            </p>
                            {c.funcao_membro && (
                              <span className="inline-block mt-2 px-2.5 py-0.5 bg-purple-100 text-purple-700 text-[10px] font-bold rounded-md">
                                {c.funcao_membro === "owner" ? "👑 Criador" : c.funcao_membro === "admin" ? "🛡️ Admin" : "👥 Membro"}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="p-4 pt-0">
                          <button className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-2 rounded-full font-bold text-xs shadow-md transition hover:brightness-105 active:scale-[0.99]">
                            ver comunidade
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-full py-8 text-center text-slate-500 font-medium bg-white/30 rounded-2xl border border-white/10 shadow-sm w-full">
                      <p className="text-sm">Você ainda não participa de nenhuma comunidade. 👥</p>
                      <button 
                        onClick={() => navigate("/communities")}
                        className="mt-3 text-xs bg-purple-600 text-white px-5 py-2.5 rounded-full font-bold shadow-md transition hover:scale-105 active:scale-95"
                      >
                        Explorar Comunidades 🌐
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </section>

            {/* MEUS AMIGOS */}
            <section className="bg-white/60 backdrop-blur-xl border border-white/40 rounded-3xl p-6 shadow-xl flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center mb-5">
                  <h2 className="text-xl font-extrabold text-slate-800">
                    Meus Amigos
                  </h2>
                  <button 
                    onClick={() => navigate("/")}
                    className="text-sm font-bold text-purple-600 hover:text-purple-700 underline transition"
                  >
                    ver mapa
                  </button>
                </div>

                <div className="flex flex-col gap-3">
                  {userFriends.length > 0 ? (
                    userFriends.map((f, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between p-3.5 bg-white/70 border border-white/30 rounded-2xl shadow-sm hover:scale-[1.01] hover:shadow-md transition duration-200"
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={f.fotoperfil_url || DEFAULT_AVATAR}
                            alt={f.nome_usuario}
                            className="w-11 h-11 rounded-full object-cover border border-white/50 shadow-sm"
                          />
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-bold text-slate-800 text-sm">
                                {f.nome_usuario}
                              </h4>
                              <span className="text-[10px] bg-green-400 font-extrabold text-white px-2 py-0.5 rounded-full shadow-sm">
                                lvl {f.nivelsocial || 1}
                              </span>
                            </div>
                            <span className="text-[11px] font-semibold text-purple-500">
                              @{f.apelido_usuario}
                            </span>
                          </div>
                        </div>

                        <div>
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold shadow-sm ${
                            f.status === "Aceito" || f.status === "accepted"
                              ? "bg-green-100 text-green-700 border border-green-200/50"
                              : "bg-amber-100 text-amber-700 border border-amber-200/50"
                          }`}>
                            {f.status === "Aceito" || f.status === "accepted" ? "✅ Amigos" : "⏳ Pendente"}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="py-8 text-center text-slate-500 font-medium bg-white/30 rounded-2xl border border-white/10 shadow-sm w-full">
                      <p className="text-sm">Você ainda não tem amigos vinculados. 📍</p>
                      <button 
                        onClick={() => navigate("/")}
                        className="mt-3 text-xs bg-purple-600 text-white px-5 py-2.5 rounded-full font-bold shadow-md transition hover:scale-105 active:scale-95"
                      >
                        Explorar Mapa Social 📍
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </section>

          </div>
        )}

        {/* EDIT PROFILE MODAL */}
        {isEditing && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
            <div className="w-full max-w-2xl bg-white/90 backdrop-blur-2xl border border-white/50 rounded-[32px] shadow-2xl p-6 max-h-[90vh] overflow-y-auto relative animate-scale-up">
              
              {/* Close Button */}
              <button
                onClick={() => setIsEditing(false)}
                className="absolute top-6 right-6 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold flex items-center justify-center transition shadow-sm"
              >
                ✕
              </button>

              <div className="flex flex-col mb-6">
                <span className="text-xs font-bold uppercase tracking-wider text-purple-600">
                  Configurações
                </span>
                <h2 className="text-2xl font-extrabold text-slate-800">
                  Editar Dados do Perfil
                </h2>
              </div>

              {/* Status messages */}
              {error && (
                <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-sm font-bold text-rose-600 shadow-sm mb-4">
                  ⚠️ {error}
                </div>
              )}
              {success && (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-sm font-bold text-emerald-600 shadow-sm mb-4 flex items-center gap-2 animate-bounce">
                  <span>✨</span> {success}
                </div>
              )}

              <form onSubmit={handleSave} className="flex flex-col gap-4">
                
                {/* Row 1: Name & Apelido */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="flex flex-col gap-2 text-sm font-bold text-slate-700">
                    Nome Completo *
                    <input
                      type="text"
                      value={nomeUsuario}
                      onChange={(e) => setNomeUsuario(e.target.value)}
                      placeholder="Felipe Rodrigues"
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-800 outline-none transition focus:border-purple-300 focus:ring-4 focus:ring-purple-100"
                      disabled={isSaving}
                      required
                    />
                  </label>

                  <label className="flex flex-col gap-2 text-sm font-bold text-slate-700">
                    Apelido/Username *
                    <input
                      type="text"
                      value={apelidoUsuario}
                      onChange={(e) => setApelidoUsuario(e.target.value)}
                      placeholder="felipe.dev"
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-800 outline-none transition focus:border-purple-300 focus:ring-4 focus:ring-purple-100"
                      disabled={isSaving}
                      required
                    />
                  </label>
                </div>

                {/* Row 2: Email & Password */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="flex flex-col gap-2 text-sm font-bold text-slate-700">
                    E-mail *
                    <input
                      type="email"
                      value={emailUsuario}
                      onChange={(e) => setEmailUsuario(e.target.value)}
                      placeholder="exemplo@email.com"
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-800 outline-none transition focus:border-purple-300 focus:ring-4 focus:ring-purple-100"
                      disabled={isSaving}
                      required
                    />
                  </label>

                  <label className="flex flex-col gap-2 text-sm font-bold text-slate-700">
                    Senha (Opcional)
                    <input
                      type="password"
                      value={senhaUsuario}
                      onChange={(e) => setSenhaUsuario(e.target.value)}
                      placeholder="Mantenha em branco para não alterar"
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-800 outline-none transition focus:border-purple-300 focus:ring-4 focus:ring-purple-100"
                      disabled={isSaving}
                    />
                  </label>
                </div>

                {/* Bio */}
                <label className="flex flex-col gap-2 text-sm font-bold text-slate-700">
                  Biografia
                  <textarea
                    value={bioUsuario}
                    onChange={(e) => setBioUsuario(e.target.value)}
                    placeholder="Escreva algo legal sobre você..."
                    rows="3"
                    className="w-full resize-none rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-800 outline-none transition focus:border-purple-300 focus:ring-4 focus:ring-purple-100"
                    disabled={isSaving}
                  />
                </label>

                {/* Cover & Profile Avatar links */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="flex flex-col gap-2 text-sm font-bold text-slate-700">
                    URL da Foto de Perfil
                    <input
                      type="url"
                      value={fotoPerfilUrl}
                      onChange={(e) => setFotoPerfilUrl(e.target.value)}
                      placeholder="Ex: https://imagens.com/minhafoto.jpg"
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-800 outline-none transition focus:border-purple-300 focus:ring-4 focus:ring-purple-100"
                      disabled={isSaving}
                    />
                  </label>

                  <label className="flex flex-col gap-2 text-sm font-bold text-slate-700">
                    URL da Foto de Capa
                    <input
                      type="url"
                      value={fotoCapaUrl}
                      onChange={(e) => setFotoCapaUrl(e.target.value)}
                      placeholder="Ex: https://imagens.com/minhacapa.jpg"
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-800 outline-none transition focus:border-purple-300 focus:ring-4 focus:ring-purple-100"
                      disabled={isSaving}
                    />
                  </label>
                </div>

                {/* Actions */}
                <div className="flex gap-4 mt-6">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="flex-1 rounded-full border border-slate-200 bg-slate-50 px-5 py-3 font-bold text-slate-600 text-sm shadow-sm transition hover:bg-slate-100 hover:scale-[1.005]"
                    disabled={isSaving}
                  >
                    Fechar
                  </button>

                  <button
                    type="submit"
                    disabled={isSaving}
                    className="flex-1 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 px-5 py-3 font-extrabold text-white text-sm shadow-lg transition hover:scale-[1.01] hover:brightness-105 active:scale-[0.995] disabled:cursor-not-allowed disabled:opacity-75 disabled:hover:scale-100"
                  >
                    {isSaving ? "Salvando..." : "Salvar Alterações ✨"}
                  </button>
                </div>

              </form>

            </div>
          </div>
        )}

      </main>
    </div>
  );
}