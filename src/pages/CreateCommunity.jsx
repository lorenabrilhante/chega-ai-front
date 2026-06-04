import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";

export default function CreateCommunity() {
  const navigate = useNavigate();

  // Form State
  const [nomeComunidade, setNomeComunidade] = useState("");
  const [descricao, setDescricao] = useState("");
  const [fotoComunidadeUrl, setFotoComunidadeUrl] = useState("");
  const [temaCor, setTemaCor] = useState("from-purple-400 to-pink-400");
  const [idUsuarioDono, setIdUsuarioDono] = useState("");

  // UI & Data State
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [isVisitor, setIsVisitor] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");

  // Preset themes list
  const themePresets = [
    { label: "Roxo & Rosa 🎨", value: "from-purple-400 to-pink-400", preview: "bg-gradient-to-r from-purple-400 to-pink-400" },
    { label: "Azul & Ciano 🌊", value: "from-blue-400 to-cyan-400", preview: "bg-gradient-to-r from-blue-400 to-cyan-400" },
    { label: "Laranja & Amarelo 🌅", value: "from-orange-300 to-yellow-300", preview: "bg-gradient-to-r from-orange-300 to-yellow-300" },
    { label: "Rosa & Vermelho 💖", value: "from-pink-400 to-rose-400", preview: "bg-gradient-to-r from-pink-400 to-rose-400" },
  ];

  // Preset Unsplash cover photos
  const photoPresets = [
    { label: "🎮 Jogos", url: "https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=600" },
    { label: "📚 Estudos", url: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=600" },
    { label: "☕ Café", url: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=600" },
    { label: "🎵 Música", url: "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?q=80&w=600" },
  ];

  // Fetch session & users on mount
  useEffect(() => {
    // 1. Check local session
    const savedSession = localStorage.getItem("chega_ai_user") || sessionStorage.getItem("chega_ai_user");
    if (savedSession) {
      try {
        const session = JSON.parse(savedSession);
        const userObj = session?.usuario || session;
        if (userObj && userObj.id_usuario) {
          setCurrentUser(userObj);
          setIdUsuarioDono(userObj.id_usuario);
          setIsVisitor(false);
        }
      } catch (e) {
        console.error("Erro ao ler sessão do usuário", e);
      }
    }

    // 2. Fetch users list (for visitor fallback simulation)
    fetch(`${import.meta.env.VITE_API_URL}/usuarios`)
      .then((res) => {
        if (!res.ok) throw new Error("Falha ao buscar usuários");
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data)) {
          setUsers(data);
          // If no active session, select the first user as default simulation creator
          if (!savedSession && data.length > 0) {
            setIdUsuarioDono(data[0].id_usuario);
          }
        }
      })
      .catch((err) => console.error(err));
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    // Simple validations
    if (!nomeComunidade.trim()) {
      setError("O nome da comunidade é obrigatório.");
      return;
    }
    if (!idUsuarioDono) {
      setError("É necessário selecionar um proprietário/dono para a comunidade.");
      return;
    }

    setIsLoading(true);

    const payload = {
      nome_comunidade: nomeComunidade.trim(),
      descricao: descricao.trim() || null,
      fotocomunidade_url: fotoComunidadeUrl.trim() || "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?q=80&w=600",
      temacor: temaCor,
      id_usuario_dono: idUsuarioDono,
    };

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/comunidades`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          data?.error || data?.message || "Ocorreu um erro ao criar a comunidade no servidor."
        );
      }

      setIsSuccess(true);
      // Wait for success micro-animation before redirecting
      setTimeout(() => {
        // Go back in history (which is excellent if they came from Create Event!)
        navigate(-1);
      }, 2200);
    } catch (apiError) {
      setError(
        apiError.message || "Não foi possível cadastrar a comunidade agora. Verifique a conexão com o servidor."
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-blue-100 via-pink-100 to-yellow-100 p-3 gap-3">
      {/* SIDEBAR */}
      <Sidebar active="/communities" />

      {/* MAIN CONTAINER */}
      <main className="flex-1 flex flex-col gap-3 min-h-0 relative overflow-y-auto pr-1">
        
        {/* HEADER */}
        <header className="flex items-center justify-between px-6 py-4 bg-white/50 rounded-3xl shadow-xl backdrop-blur-xl border border-white/40">
          <div className="flex flex-col">
            <span className="text-xs font-bold uppercase tracking-wider text-purple-600">
              Nova Comunidade
            </span>
            <h1 className="text-2xl font-extrabold text-slate-800">
              Criar Comunidade
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
              <div className="w-24 h-24 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg animate-bounce mb-6">
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
                Comunidade Criada! ✨
              </h2>
              <p className="mt-3 text-slate-600 font-semibold max-w-md">
                A comunidade <span className="text-purple-600">"{nomeComunidade}"</span> foi cadastrada com sucesso e está pronta para hospedar eventos incríveis!
              </p>
              <p className="mt-8 text-xs font-bold text-slate-400 animate-pulse uppercase tracking-wider">
                Retornando...
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-6 max-w-4xl mx-auto">
            
            {/* Session Info / Visitor helper */}
            {isVisitor ? (
              <div className="p-4 bg-amber-50/70 border border-amber-200/50 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-sm shadow-sm backdrop-blur-sm">
                <div>
                  <span className="font-bold text-amber-800 block">✨ Modo de Simulação Ativo</span>
                  <span className="text-amber-700 text-xs">
                    Você está criando como visitante. Escolha um perfil para simular o dono/criador da comunidade.
                  </span>
                </div>
                {users.length > 0 && (
                  <select
                    value={idUsuarioDono}
                    onChange={(e) => setIdUsuarioDono(e.target.value)}
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
                    Proprietário: {currentUser?.nome_usuario}
                  </span>
                  <span className="text-emerald-700 text-xs">
                    Você será o dono da nova comunidade (@{currentUser?.apelido_usuario}).
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

            {/* Row 1: Name & Description */}
            <div className="flex flex-col gap-5">
              <label className="flex flex-col gap-2 text-sm font-bold text-slate-700">
                Nome da Comunidade *
                <input
                  type="text"
                  value={nomeComunidade}
                  onChange={(e) => {
                    setNomeComunidade(e.target.value);
                    setError("");
                  }}
                  placeholder="Ex: Gamers Fortaleza 🎮"
                  className="w-full rounded-2xl border border-white/70 bg-white/80 px-4 py-3 font-semibold text-slate-800 outline-none transition focus:border-purple-300 focus:ring-4 focus:ring-purple-100 shadow-sm"
                  disabled={isLoading}
                  required
                />
              </label>

              <label className="flex flex-col gap-2 text-sm font-bold text-slate-700">
                Descrição da Comunidade
                <textarea
                  value={descricao}
                  onChange={(e) => setDescricao(e.target.value)}
                  placeholder="Descreva sobre o que é a comunidade, interesses, o que fazem..."
                  rows="3"
                  className="w-full resize-none rounded-2xl border border-white/70 bg-white/80 px-4 py-3 font-semibold text-slate-800 outline-none transition focus:border-purple-300 focus:ring-4 focus:ring-purple-100 shadow-sm"
                  disabled={isLoading}
                />
              </label>
            </div>

            {/* Theme Presets Selector */}
            <div className="flex flex-col gap-3">
              <span className="text-sm font-bold text-slate-700">Cor do Tema da Comunidade *</span>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {themePresets.map((theme) => {
                  const isSelected = temaCor === theme.value;
                  return (
                    <button
                      key={theme.value}
                      type="button"
                      onClick={() => setTemaCor(theme.value)}
                      className={`relative flex items-center justify-center gap-2 p-3 rounded-2xl border transition duration-200 ${
                        isSelected
                          ? "bg-white border-purple-400 scale-[1.03] shadow-md"
                          : "bg-white/80 border-slate-100 hover:scale-[1.01]"
                      }`}
                    >
                      <span className={`w-5 h-5 rounded-full ${theme.preview} shadow-inner flex-shrink-0`} />
                      <span className="text-xs font-bold text-slate-700">{theme.label}</span>
                      {isSelected && (
                        <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-purple-500 rounded-full text-white text-[8px] flex items-center justify-center font-black shadow">
                          ✓
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Cover photo presets and input */}
            <div className="flex flex-col gap-4">
              <label className="flex flex-col gap-2 text-sm font-bold text-slate-700">
                URL da Foto de Capa (Opcional)
                <input
                  type="url"
                  value={fotoComunidadeUrl}
                  onChange={(e) => setFotoComunidadeUrl(e.target.value)}
                  placeholder="Cole uma URL de imagem ou escolha um preset abaixo"
                  className="w-full rounded-2xl border border-white/70 bg-white/80 px-4 py-3 font-semibold text-slate-800 outline-none transition focus:border-purple-300 focus:ring-4 focus:ring-purple-100 shadow-sm"
                  disabled={isLoading}
                />
              </label>

              {/* Presets Grid */}
              <div className="flex flex-col gap-2">
                <span className="text-xs font-bold text-slate-500">Escolha rápida de capa:</span>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {photoPresets.map((preset) => {
                    const isSelected = fotoComunidadeUrl === preset.url;
                    return (
                      <button
                        key={preset.label}
                        type="button"
                        onClick={() => setFotoComunidadeUrl(preset.url)}
                        className="group relative h-20 rounded-2xl overflow-hidden shadow-sm hover:scale-[1.02] transition border border-transparent"
                      >
                        <img
                          src={preset.url}
                          alt={preset.label}
                          className="w-full h-full object-cover transition group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                          <span className="text-white text-xs font-bold">{preset.label}</span>
                        </div>
                        {isSelected && (
                          <div className="absolute inset-0 bg-purple-600/50 flex items-center justify-center">
                            <span className="text-white text-xs font-black">✓ Selecionado</span>
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
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
                className="flex-1 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 px-5 py-3 font-extrabold text-white shadow-lg transition hover:scale-[1.01] hover:brightness-105 active:scale-[0.995] disabled:cursor-not-allowed disabled:opacity-75 disabled:hover:scale-100"
              >
                {isLoading ? "Criando Comunidade..." : "Salvar Comunidade ✨"}
              </button>
            </div>

          </form>

        </div>

      </main>
    </div>
  );
}
