import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Sidebar from "../components/Sidebar";

export default function CreateEvent() {
  const navigate = useNavigate();
  const location = useLocation();

  // Form State
  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [tipoEvento, setTipoEvento] = useState("Jogos");
  const [idComunidade, setIdComunidade] = useState(location.state?.idComunidade || "");
  const [nomeLocal, setNomeLocal] = useState("");
  const [latitude, setLatitude] = useState("-3.7699");
  const [longitude, setLongitude] = useState("-38.4795");
  const [horarioInicio, setHorarioInicio] = useState("");
  const [horarioTermino, setHorarioTermino] = useState("");
  const [idCriador, setIdCriador] = useState("");

  // UI & Data State
  const [communities, setCommunities] = useState([]);
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [isVisitor, setIsVisitor] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");

  // Categories definition
  const categories = [
    { label: "🎮 Jogos", value: "Jogos", color: "from-purple-500 to-pink-500" },
    { label: "🎵 Música", value: "Música", color: "from-pink-500 to-rose-500" },
    { label: "📚 Estudos", value: "Estudos", color: "from-blue-500 to-cyan-500" },
    { label: "⚽ Esportes", value: "Esportes", color: "from-green-500 to-emerald-500" },
    { label: "☕ Café", value: "Café", color: "from-amber-500 to-orange-500" },
    { label: "✨ Outros", value: "Outros", color: "from-violet-500 to-indigo-500" },
  ];

  // Fetch session, users, and communities on mount
  useEffect(() => {
    // 1. Check local session
    const savedSession = localStorage.getItem("chega_ai_user") || sessionStorage.getItem("chega_ai_user");
    if (savedSession) {
      try {
        const session = JSON.parse(savedSession);
        const userObj = session?.usuario || session;
        if (userObj && userObj.id_usuario) {
          setCurrentUser(userObj);
          setIdCriador(userObj.id_usuario);
          setIsVisitor(false);
        }
      } catch (e) {
        console.error("Erro ao ler sessão do usuário", e);
      }
    }

    // 2. Fetch communities for dropdown selection
    fetch(`${import.meta.env.VITE_API_URL}/comunidades`)
      .then((res) => {
        if (!res.ok) throw new Error("Falha ao buscar comunidades");
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data)) {
          setCommunities(data);
        }
      })
      .catch((err) => console.error(err));

    // 3. Fetch users list (for visitor fallback simulation)
    fetch(`${import.meta.env.VITE_API_URL}/usuarios`)
      .then((res) => {
        if (!res.ok) throw new Error("Falha ao buscar usuários");
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data)) {
          setUsers(data);
          // If no active session, select the first user as a default simulation creator
          if (!savedSession && data.length > 0) {
            setIdCriador(data[0].id_usuario);
          }
        }
      })
      .catch((err) => console.error(err));
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    // Simple validations
    if (!titulo.trim()) {
      setError("O título do evento é obrigatório.");
      return;
    }
    if (!idComunidade) {
      setError("Vincular o evento a uma comunidade é obrigatório. Por favor, selecione ou crie uma comunidade.");
      return;
    }
    if (!nomeLocal.trim()) {
      setError("O nome do local é obrigatório.");
      return;
    }
    if (!horarioInicio) {
      setError("O horário de início é obrigatório.");
      return;
    }
    if (horarioTermino && new Date(horarioTermino) <= new Date(horarioInicio)) {
      setError("O horário de término deve ser após o horário de início.");
      return;
    }
    if (!idCriador) {
      setError("É necessário selecionar um criador para o evento.");
      return;
    }

    setIsLoading(true);

    const payload = {
      titulo: titulo.trim(),
      descricao: descricao.trim() || null,
      tipo_evento: tipoEvento,
      id_comunidade: idComunidade || null,
      nome_local: nomeLocal.trim(),
      latitude: parseFloat(latitude) || null,
      longitude: parseFloat(longitude) || null,
      horario_inicio: new Date(horarioInicio).toISOString(),
      horario_termino: horarioTermino ? new Date(horarioTermino).toISOString() : null,
      id_criador: idCriador,
    };

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/eventos`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          data?.error || data?.message || "Ocorreu um erro ao criar o evento no servidor."
        );
      }

      setIsSuccess(true);
      // Wait for success micro-animation before redirecting
      setTimeout(() => {
        navigate("/agenda");
      }, 2200);
    } catch (apiError) {
      setError(
        apiError.message || "Não foi possível cadastrar o evento agora. Verifique a conexão com o servidor."
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-blue-100 via-purple-100 to-yellow-100 p-3 gap-3">
      {/* SIDEBAR */}
      <Sidebar active="/agenda" />

      {/* MAIN CONTAINER */}
      <main className="flex-1 flex flex-col gap-3 min-h-0 relative overflow-y-auto pr-1">
        
        {/* HEADER */}
        <header className="flex items-center justify-between px-6 py-4 bg-white/50 rounded-3xl shadow-xl backdrop-blur-xl border border-white/40">
          <div className="flex flex-col">
            <span className="text-xs font-bold uppercase tracking-wider text-purple-600">
              Novo Evento
            </span>
            <h1 className="text-2xl font-extrabold text-slate-800">
              Criar Evento Social
            </h1>
          </div>

          <button
            onClick={() => navigate(-1)}
            className="px-5 py-2.5 bg-white/70 hover:bg-white text-slate-700 rounded-full font-medium transition shadow-md hover:scale-[1.02] border border-slate-100 text-sm"
          >
            ← voltar
          </button>
        </header>

        {/* FORM CONTENT */}
        <div className="flex-1 bg-white/50 rounded-[32px] shadow-2xl backdrop-blur-xl border border-white/40 p-6 lg:p-10 relative">
          
          {/* Animated Success Overlay */}
          {isSuccess && (
            <div className="absolute inset-0 bg-white/95 rounded-[32px] z-50 flex flex-col items-center justify-center p-6 text-center animate-fade-in transition">
              <div className="w-24 h-24 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-lg animate-bounce mb-6">
                <svg
                  className="w-12 h-12 text-white"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3.5"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              </div>
              <h2 className="text-4xl font-black text-slate-800 tracking-tight">
                Evento Criado! ✨
              </h2>
              <p className="mt-3 text-slate-600 font-semibold max-w-md">
                O evento <span className="text-purple-600">"{titulo}"</span> foi cadastrado com sucesso e está visível no mapa social!
              </p>
              <p className="mt-8 text-xs font-bold text-slate-400 animate-pulse uppercase tracking-wider">
                Redirecionando para a sua agenda...
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-6 max-w-4xl mx-auto">
            
            {/* Header info / Session helper */}
            {isVisitor ? (
              <div className="p-4 bg-amber-50/70 border border-amber-200/50 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-sm shadow-sm backdrop-blur-sm">
                <div>
                  <span className="font-bold text-amber-800 block">✨ Modo de Simulação Ativo</span>
                  <span className="text-amber-700 text-xs">
                    Você está navegando como visitante. Selecione um perfil para simular o criador do evento.
                  </span>
                </div>
                {users.length > 0 && (
                  <select
                    value={idCriador}
                    onChange={(e) => setIdCriador(e.target.value)}
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
            ) : (
              <div className="p-4 bg-emerald-50/70 border border-emerald-200/50 rounded-2xl flex items-center gap-3 text-sm shadow-sm backdrop-blur-sm">
                <span className="text-xl">✅</span>
                <div>
                  <span className="font-bold text-emerald-800 block">
                    Conectado como {currentUser?.nome_usuario}
                  </span>
                  <span className="text-emerald-700 text-xs">
                    Este evento será criado sob o seu perfil (@{currentUser?.apelido_usuario}).
                  </span>
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-sm font-bold text-rose-600 shadow-sm">
                ⚠️ {error}
              </div>
            )}

            {/* Row 1: Title & Type */}
            <div className="grid gap-6 md:grid-cols-2">
              <label className="flex flex-col gap-2 text-sm font-bold text-slate-700">
                Título do Evento *
                <input
                  type="text"
                  value={titulo}
                  onChange={(e) => {
                    setTitulo(e.target.value);
                    setError("");
                  }}
                  placeholder="Ex: Noite do Jogo de Tabuleiro 🎲"
                  className="w-full rounded-2xl border border-white/70 bg-white/80 px-4 py-3 font-semibold text-slate-800 outline-none transition focus:border-purple-300 focus:ring-4 focus:ring-purple-100 shadow-sm"
                  disabled={isLoading}
                  required
                />
              </label>

              <div className="flex flex-col gap-2">
                <span className="text-sm font-bold text-slate-700">Categoria do Evento *</span>
                <div className="grid grid-cols-3 gap-2">
                  {categories.map((cat) => {
                    const isSelected = tipoEvento === cat.value;
                    return (
                      <button
                        key={cat.value}
                        type="button"
                        onClick={() => {
                          setTipoEvento(cat.value);
                          setError("");
                        }}
                        className={`py-2.5 px-3 rounded-2xl text-xs font-bold transition duration-200 text-center shadow-sm border ${
                          isSelected
                            ? `bg-gradient-to-r ${cat.color} text-white border-transparent scale-[1.03] shadow-md`
                            : "bg-white/80 hover:bg-white text-slate-600 border-slate-100 hover:scale-[1.01]"
                        }`}
                        disabled={isLoading}
                      >
                        {cat.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Description */}
            <label className="flex flex-col gap-2 text-sm font-bold text-slate-700">
              Descrição do Evento
              <textarea
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                placeholder="Conte o que vai rolar, quem pode ir, o que levar..."
                rows="3"
                className="w-full resize-none rounded-2xl border border-white/70 bg-white/80 px-4 py-3 font-semibold text-slate-800 outline-none transition focus:border-purple-300 focus:ring-4 focus:ring-purple-100 shadow-sm"
                disabled={isLoading}
              />
            </label>

            {/* Row 2: Location & Coordinates */}
            <div className="grid gap-6 md:grid-cols-2">
              <label className="flex flex-col gap-2 text-sm font-bold text-slate-700">
                Nome do Local *
                <input
                  type="text"
                  value={nomeLocal}
                  onChange={(e) => {
                    setNomeLocal(e.target.value);
                    setError("");
                  }}
                  placeholder="Ex: Unifor - Centro de Convivência"
                  className="w-full rounded-2xl border border-white/70 bg-white/80 px-4 py-3 font-semibold text-slate-800 outline-none transition focus:border-purple-300 focus:ring-4 focus:ring-purple-100 shadow-sm"
                  disabled={isLoading}
                  required
                />
              </label>

              <div className="grid grid-cols-2 gap-3">
                <label className="flex flex-col gap-2 text-sm font-bold text-slate-600">
                  Latitude (Opcional)
                  <input
                    type="number"
                    step="any"
                    value={latitude}
                    onChange={(e) => setLatitude(e.target.value)}
                    placeholder="-3.7699"
                    className="w-full rounded-2xl border border-white/70 bg-white/80 px-4 py-3 font-semibold text-slate-800 outline-none transition focus:border-purple-300 focus:ring-4 focus:ring-purple-100 shadow-sm"
                    disabled={isLoading}
                  />
                </label>

                <label className="flex flex-col gap-2 text-sm font-bold text-slate-600">
                  Longitude (Opcional)
                  <input
                    type="number"
                    step="any"
                    value={longitude}
                    onChange={(e) => setLongitude(e.target.value)}
                    placeholder="-38.4795"
                    className="w-full rounded-2xl border border-white/70 bg-white/80 px-4 py-3 font-semibold text-slate-800 outline-none transition focus:border-purple-300 focus:ring-4 focus:ring-purple-100 shadow-sm"
                    disabled={isLoading}
                  />
                </label>
              </div>
            </div>

            {/* Row 3: Times & Associated Community */}
            <div className="grid gap-6 md:grid-cols-3">
              <label className="flex flex-col gap-2 text-sm font-bold text-slate-700">
                Horário de Início *
                <input
                  type="datetime-local"
                  value={horarioInicio}
                  onChange={(e) => {
                    setHorarioInicio(e.target.value);
                    setError("");
                  }}
                  className="w-full rounded-2xl border border-white/70 bg-white/80 px-4 py-3 font-semibold text-slate-800 outline-none transition focus:border-purple-300 focus:ring-4 focus:ring-purple-100 shadow-sm cursor-pointer"
                  disabled={isLoading}
                  required
                />
              </label>

              <label className="flex flex-col gap-2 text-sm font-bold text-slate-700">
                Horário de Término (Opcional)
                <input
                  type="datetime-local"
                  value={horarioTermino}
                  onChange={(e) => {
                    setHorarioTermino(e.target.value);
                    setError("");
                  }}
                  className="w-full rounded-2xl border border-white/70 bg-white/80 px-4 py-3 font-semibold text-slate-800 outline-none transition focus:border-purple-300 focus:ring-4 focus:ring-purple-100 shadow-sm cursor-pointer"
                  disabled={isLoading}
                />
              </label>

              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-bold text-slate-700">Comunidade Vinculada *</span>
                  <button
                    type="button"
                    onClick={() => navigate("/criar-comunidade")}
                    className="text-xs font-bold text-purple-600 hover:text-purple-700 underline transition"
                  >
                    + criar nova
                  </button>
                </div>
                <select
                  value={idComunidade}
                  onChange={(e) => {
                    setIdComunidade(e.target.value);
                    setError("");
                  }}
                  className="w-full rounded-2xl border border-white/70 bg-white/80 px-4 py-3 font-semibold text-slate-800 outline-none transition focus:border-purple-300 focus:ring-4 focus:ring-purple-100 shadow-sm cursor-pointer"
                  disabled={isLoading}
                  required
                >
                  <option value="">-- Selecione uma comunidade (Obrigatório) --</option>
                  {communities.map((comm) => (
                    <option key={comm.id_comunidade} value={comm.id_comunidade}>
                      {comm.nome_comunidade}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-4 mt-6">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="flex-1 rounded-full border border-slate-200 bg-white/80 px-5 py-3 font-bold text-slate-700 shadow-sm transition hover:bg-white hover:scale-[1.005]"
                disabled={isLoading}
              >
                Cancelar
              </button>

              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 rounded-full bg-gradient-to-r from-purple-600 via-fuchsia-500 to-pink-500 px-5 py-3 font-extrabold text-white shadow-lg transition hover:scale-[1.01] hover:brightness-105 active:scale-[0.995] disabled:cursor-not-allowed disabled:opacity-75 disabled:hover:scale-100"
              >
                {isLoading ? "Criando Evento..." : "Publicar no Mapa ✨"}
              </button>
            </div>

          </form>

        </div>

      </main>
    </div>
  );
}
