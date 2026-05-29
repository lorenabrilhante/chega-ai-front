import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";

export default function Communities() {
  const navigate = useNavigate();
  const [communities, setCommunities] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [isVisitor, setIsVisitor] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Load session and fallback users on mount
  useEffect(() => {
    // 1. Load logged user from storage
    const savedSession = localStorage.getItem("chega_ai_user") || sessionStorage.getItem("chega_ai_user");
    if (savedSession) {
      try {
        const session = JSON.parse(savedSession);
        const userObj = session?.usuario || session;
        if (userObj && userObj.id_usuario) {
          setCurrentUser(userObj);
          setIsVisitor(false);
        }
      } catch (e) {
        console.error("Erro ao ler sessão do usuário", e);
      }
    }

    // 2. Fetch users list for visitor simulation
    fetch(`${import.meta.env.VITE_API_URL}/usuarios`)
      .then((res) => {
        if (!res.ok) throw new Error("Falha ao buscar usuários");
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data)) {
          setUsers(data);
          if (!savedSession && data.length > 0) {
            // default simulate first user
            setCurrentUser(data[0]);
          }
        }
      })
      .catch((err) => console.error(err));
  }, []);

  // Load communities for current (or simulated) user
  useEffect(() => {
    if (!currentUser && users.length === 0) return; // wait for session/users
    const userId = currentUser?.id_usuario || (users[0] && users[0].id_usuario);
    if (!userId) return;
    setIsLoading(true);
    fetch(`${import.meta.env.VITE_API_URL}/comunidades/explorar/${userId}`)
      .then((res) => {
        if (!res.ok) throw new Error("Falha ao buscar comunidades");
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data)) setCommunities(data);
        else setCommunities([]);
      })
      .catch((err) => setError(err.message))
      .finally(() => setIsLoading(false));
  }, [currentUser, users]);

  const handleJoin = async (comId) => {
    if (!currentUser) {
      setError("É necessário estar logado para participar.");
      return;
    }
    setIsLoading(true);
    try {
      const payload = {
        id_usuario_membro: currentUser.id_usuario,
        id_comunidade: comId,
        funcao_membro: "membro",
        dataentrada: new Date().toISOString(),
      };
      const response = await fetch(`${import.meta.env.VITE_API_URL}/membros-comunidade`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result?.error || "Erro ao participar da comunidade");
      // Optimistically update UI
      setCommunities((prev) =>
        prev.map((c) =>
          c.id_comunidade === comId
            ? { ...c, ja_participo: true, quantidade_membros: (c.quantidade_membros || 0) + 1 }
            : c
        )
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const userId = currentUser?.id_usuario || (users[0] && users[0].id_usuario);

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-blue-100 via-pink-100 to-yellow-100 p-3 gap-3">
      <Sidebar active="/communities" />

      <main className="flex-1 flex flex-col gap-3">
        {/* HEADER */}
        <header className="bg-white/60 rounded-3xl px-6 py-4 flex items-center gap-4 shadow">
          <nav className="flex gap-2 text-sm">
            <button className="px-4 py-2 rounded-full hover:bg-white/70">explorar</button>
            <button className="px-4 py-2 rounded-full hover:bg-white/70">eventos</button>
            <button className="px-4 py-2 rounded-full bg-purple-200 text-purple-700 font-semibold">comunidades</button>
            <button className="px-4 py-2 rounded-full hover:bg-white/70">amigos</button>
          </nav>
          <input type="text" placeholder="buscar comunidades..." className="flex-1 bg-white/70 rounded-full px-5 py-2 outline-none" />
          <button onClick={() => navigate("/criar-comunidade")}
            className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-5 py-2 rounded-full shadow hover:scale-[1.02] transition">
            + criar comunidade
          </button>
        </header>

        {/* Visitor simulation */}
        {isVisitor && (
          <div className="p-4 bg-amber-50/70 border border-amber-200/50 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-sm shadow-sm backdrop-blur-sm">
            <div>
              <span className="font-bold text-amber-800 block">✨ Modo de Simulação Ativo</span>
              <span className="text-amber-700 text-xs">
                Você está navegando como visitante. Escolha um usuário para simular o participante.
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

        {/* Error alert */}
        {error && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-sm font-bold text-rose-600 shadow-sm">
            ⚠️ {error}
          </div>
        )}

        {/* GRID */}
        <section className="grid grid-cols-2 gap-4">
          {isLoading ? (
            <p className="text-center col-span-full">Carregando comunidades...</p>
          ) : (
            communities.map((community) => (
              <div key={community.id_comunidade} className="bg-white/60 rounded-3xl overflow-hidden shadow hover:scale-[1.01] transition border border-white/30">
                <div className="h-40 relative cursor-pointer" onClick={() => navigate(`/comunidade/${community.id_comunidade}`)}>
                  <img src={community.fotocomunidade_url || community.image} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                  <div className="absolute bottom-4 left-4 text-white">
                    <h3 className="font-bold text-xl hover:underline">{community.nome_comunidade}</h3>
                    <p className="text-sm opacity-90">👥 {community.quantidade_membros || community.members} membros</p>
                  </div>
                </div>
                <div className="p-5">
                  <p className="text-sm text-slate-500 cursor-pointer line-clamp-2" onClick={() => navigate(`/comunidade/${community.id_comunidade}`)}>
                    {community.descricao || community.desc}
                  </p>
                  <div className="flex justify-between items-center mt-5">
                    <div className={`px-3 py-1 rounded-full text-xs text-white bg-gradient-to-r ${community.temacor || community.color}`}>
                      {community.ja_participo ? "Participando" : "Ativa agora"}
                    </div>
                    <button
                      disabled={isLoading || community.ja_participo}
                      onClick={() => handleJoin(community.id_comunidade)}
                      className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-full text-sm shadow disabled:opacity-50"
                    >
                      {community.ja_participo ? "Participando" : "participar"}
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </section>
      </main>
    </div>
  );
}