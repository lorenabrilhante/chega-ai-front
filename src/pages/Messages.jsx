import { useState, useEffect, useRef, useCallback } from "react";
import Sidebar from "../components/Sidebar";

const API = import.meta.env.VITE_API_URL;

// ─── helpers ────────────────────────────────────────────────────────────────

function getUsuario() {
  try {
    // Login salva: localStorage.setItem("chega_ai_user", JSON.stringify(data))
    // onde data = { message: "...", usuario: { id_usuario, nome_usuario, ... } }
    const raw = localStorage.getItem("chega_ai_user")
      || sessionStorage.getItem("chega_ai_user");
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    // pode ser { usuario: {...} } ou diretamente o objeto do usuário
    return parsed?.usuario ?? parsed;
  }
  catch { return null; }
}

function tempoRelativo(isoString) {
  if (!isoString) return "";
  const diff = Date.now() - new Date(isoString).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return "agora";
  if (min < 60) return `${min}min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}d`;
}

function formatHora(isoString) {
  if (!isoString) return "";
  return new Date(isoString).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

function avatarFallback(nome) {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(nome || "?")}&background=6366f1&color=fff&bold=true&size=128`;
}

// ─── busca todas as mensagens e filtra no front ──────────────────────────────
async function fetchTodasMensagens() {
  const res = await fetch(`${API}/mensagens`);
  if (!res.ok) throw new Error("Erro ao buscar mensagens");
  return res.json(); // retorna array com todos os campos
}

async function fetchTodosUsuarios() {
  const res = await fetch(`${API}/usuarios`);
  if (!res.ok) throw new Error("Erro ao buscar usuarios");
  return res.json();
}

// ─── componente principal ────────────────────────────────────────────────────

export default function Messages() {
  const usuario = getUsuario();
  const myId = String(usuario?.id_usuario ?? "");

  const [conversas, setConversas]               = useState([]);
  const [loadingConversas, setLoadingConversas] = useState(true);
  const [conversaSelecionada, setConversaSelecionada] = useState(null);
  const [mensagens, setMensagens]               = useState([]);
  const [loadingMensagens, setLoadingMensagens] = useState(false);
  const [texto, setTexto]                       = useState("");
  const [enviando, setEnviando]                 = useState(false);
  const [busca, setBusca]                       = useState("");
  const [todosUsuarios, setTodosUsuarios]       = useState([]);
  const [showNewChat, setShowNewChat]           = useState(false);
  const [buscaUsuario, setBuscaUsuario]         = useState("");
  const [loadingUsuarios, setLoadingUsuarios]   = useState(false);

  const mensagensEndRef = useRef(null);
  const inputRef        = useRef(null);
  const pollingRef      = useRef(null);
  // guarda o id do contato ativo para o polling não sobrepor conversas
  const contatoAtivoRef = useRef(null);

  // ── construir lista de conversas a partir de /mensagens ─────────────────
  const carregarConversas = useCallback(async () => {
    if (!myId) return;
    setLoadingConversas(true);
    try {
      const [todasMsgs, todosUsers] = await Promise.all([
        fetchTodasMensagens(),
        fetchTodosUsuarios(),
      ]);

      // Filtrar só as mensagens que envolvem o usuário logado
      const minhas = todasMsgs.filter(
        m => String(m.id_remetente) === myId || String(m.id_destinatario) === myId
      );

      // Ordenar do mais recente para o mais antigo
      minhas.sort((a, b) => new Date(b.enviado_em) - new Date(a.enviado_em));

      // Agrupar por contato — primeira ocorrência de cada contato = última mensagem
      const contatosMap = new Map();
      for (const msg of minhas) {
        const outroId = String(msg.id_remetente) === myId
          ? String(msg.id_destinatario)
          : String(msg.id_remetente);

        if (!contatosMap.has(outroId)) {
          const naoLidas = minhas.filter(
            m => String(m.id_remetente) === outroId &&
                 String(m.id_destinatario) === myId &&
                 !m.lido_em
          ).length;

          const usuarioDados = todosUsers.find(u => String(u.id_usuario) === outroId);

          contatosMap.set(outroId, {
            id_contato: outroId,
            ultima_mensagem: msg,
            nao_lidas: naoLidas,
            usuario: usuarioDados || null,
          });
        }
      }

      setConversas(Array.from(contatosMap.values()));
    } catch (e) {
      console.error("Erro ao carregar conversas:", e);
    } finally {
      setLoadingConversas(false);
    }
  }, [myId]);

  useEffect(() => {
    carregarConversas();
  }, [carregarConversas]);

  // ── carregar thread de uma conversa ─────────────────────────────────────
  const carregarThread = useCallback(async (idContato) => {
    if (!myId || !idContato) return;
    setLoadingMensagens(true);
    // ✅ LIMPA IMEDIATAMENTE ao trocar de conversa
    setMensagens([]);
    try {
      const todas = await fetchTodasMensagens();
      const thread = todas
        .filter(m =>
          (String(m.id_remetente) === myId   && String(m.id_destinatario) === String(idContato)) ||
          (String(m.id_remetente) === String(idContato) && String(m.id_destinatario) === myId)
        )
        .sort((a, b) => new Date(a.enviado_em) - new Date(b.enviado_em));

      // só atualiza se ainda for o mesmo contato ativo
      if (contatoAtivoRef.current === String(idContato)) {
        setMensagens(thread);
      }
    } catch (e) {
      console.error("Erro ao carregar mensagens:", e);
    } finally {
      setLoadingMensagens(false);
    }
  }, [myId]);

  // ── polling a cada 5s (só para a conversa aberta) ───────────────────────
  useEffect(() => {
    if (!conversaSelecionada) return;
    const idContato = String(conversaSelecionada.id_contato);

    const poll = async () => {
      if (contatoAtivoRef.current !== idContato) return;
      try {
        const todas = await fetchTodasMensagens();
        const thread = todas
          .filter(m =>
            (String(m.id_remetente) === myId   && String(m.id_destinatario) === idContato) ||
            (String(m.id_remetente) === idContato && String(m.id_destinatario) === myId)
          )
          .sort((a, b) => new Date(a.enviado_em) - new Date(b.enviado_em));

        if (contatoAtivoRef.current === idContato) {
          setMensagens(thread);
        }
      } catch {}
    };

    pollingRef.current = setInterval(poll, 5000);
    return () => clearInterval(pollingRef.current);
  }, [conversaSelecionada, myId]);

  // ── auto-scroll ──────────────────────────────────────────────────────────
  useEffect(() => {
    mensagensEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [mensagens]);

  // ── selecionar conversa ──────────────────────────────────────────────────
  const selecionarConversa = (conv) => {
    // ✅ Registra o contato ativo ANTES de qualquer fetch
    contatoAtivoRef.current = String(conv.id_contato);
    setConversaSelecionada(conv);
    // ✅ Limpa imediatamente para não mostrar mensagens do chat anterior
    setMensagens([]);
    carregarThread(conv.id_contato);
    // zera badge
    setConversas(prev => prev.map(c =>
      String(c.id_contato) === String(conv.id_contato) ? { ...c, nao_lidas: 0 } : c
    ));
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  // ── enviar mensagem ──────────────────────────────────────────────────────
  const enviarMensagem = async () => {
    if (!texto.trim() || !conversaSelecionada || enviando) return;
    setEnviando(true);
    const conteudo = texto.trim();
    const idContato = String(conversaSelecionada.id_contato);
    setTexto("");

    // optimistic — adiciona só se ainda estiver na conversa certa
    const tempId = `temp-${Date.now()}`;
    const tempMsg = {
      id_mensagem: tempId,
      id_remetente: myId,
      id_destinatario: idContato,
      conteudo,
      enviado_em: new Date().toISOString(),
      lido_em: null,
    };
    setMensagens(prev => [...prev, tempMsg]);

    try {
      const res = await fetch(`${API}/mensagens`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          // ✅ usa o inteiro real — Number("") daria 0 e viola a FK
          id_remetente: usuario?.id_usuario,
          id_destinatario: parseInt(idContato, 10),
          conteudo,
          enviado_em: new Date().toISOString(),
        }),
      });

      if (res.ok) {
        const nova = await res.json();
        // substitui o temp pela mensagem real
        setMensagens(prev => prev.map(m => m.id_mensagem === tempId ? nova : m));
        // atualiza última mensagem na lista
        setConversas(prev => prev.map(c =>
          String(c.id_contato) === idContato
            ? { ...c, ultima_mensagem: nova }
            : c
        ));
      }
    } catch (e) {
      console.error("Erro ao enviar:", e);
      // remove a mensagem temp em caso de erro
      setMensagens(prev => prev.filter(m => m.id_mensagem !== tempId));
    } finally {
      setEnviando(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); enviarMensagem(); }
  };

  // ── novo chat ────────────────────────────────────────────────────────────
  const abrirNovoChat = async () => {
    setShowNewChat(true);
    setBuscaUsuario("");
    if (todosUsuarios.length > 0) return;
    setLoadingUsuarios(true);
    try {
      const data = await fetchTodosUsuarios();
      setTodosUsuarios(data.filter(u => String(u.id_usuario) !== myId));
    } catch {}
    finally { setLoadingUsuarios(false); }
  };

  const iniciarConversa = (u) => {
    const conv = {
      id_contato: String(u.id_usuario),
      usuario: u,
      ultima_mensagem: null,
      nao_lidas: 0,
    };
    setConversas(prev => {
      const existe = prev.find(c => String(c.id_contato) === String(u.id_usuario));
      return existe ? prev : [conv, ...prev];
    });
    selecionarConversa(conv);
    setShowNewChat(false);
  };

  // ── filtros ──────────────────────────────────────────────────────────────
  const conversasFiltradas = conversas.filter(c => {
    const nome = `${c.usuario?.nome_usuario || ""} ${c.usuario?.apelido_usuario || ""}`;
    return nome.toLowerCase().includes(busca.toLowerCase());
  });

  const usuariosFiltrados = todosUsuarios.filter(u => {
    const nome = `${u.nome_usuario || ""} ${u.apelido_usuario || ""}`.toLowerCase();
    return nome.includes(buscaUsuario.toLowerCase());
  });

  // ────────────────────────────────────────────────────────────────────────
  return (
    <div style={{
      display: "flex", height: "100vh",
      background: "linear-gradient(135deg,#dbeafe 0%,#d1fae5 50%,#fef9c3 100%)",
      padding: "12px", gap: "12px", overflow: "hidden",
      fontFamily: "'Inter','Segoe UI',sans-serif",
    }}>
      <Sidebar active="/messages" />

      <main style={{ flex: 1, display: "flex", gap: "12px", overflow: "hidden" }}>

        {/* ── LISTA DE CONVERSAS ── */}
        <section style={{
          width: "320px",
          background: "rgba(255,255,255,0.55)",
          borderRadius: "24px",
          boxShadow: "0 8px 32px rgba(0,0,0,0.10)",
          backdropFilter: "blur(20px)",
          border: "1px solid rgba(255,255,255,0.5)",
          padding: "20px",
          display: "flex", flexDirection: "column", gap: "12px",
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h2 style={{ fontSize: "20px", fontWeight: 700, color: "#374151", margin: 0 }}>mensagens</h2>
            <button onClick={abrirNovoChat} title="Nova conversa" style={{
              width: "40px", height: "40px", borderRadius: "14px",
              background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
              color: "#fff", border: "none", cursor: "pointer", fontSize: "22px",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 4px 14px rgba(99,102,241,0.4)",
              transition: "transform 0.15s",
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = "scale(1.1)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = "scale(1)"; }}
            >+</button>
          </div>

          <input type="text" placeholder="buscar conversa..." value={busca}
            onChange={e => setBusca(e.target.value)}
            style={{
              background: "rgba(255,255,255,0.7)",
              border: "1px solid rgba(209,213,219,0.5)",
              borderRadius: "50px", padding: "10px 16px",
              outline: "none", fontSize: "13px", color: "#374151",
            }}
          />

          <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: "8px" }}>
            {loadingConversas ? (
              <div style={{ textAlign: "center", color: "#9ca3af", marginTop: "40px", fontSize: "14px" }}>
                carregando...
              </div>
            ) : conversasFiltradas.length === 0 ? (
              <div style={{ textAlign: "center", color: "#9ca3af", marginTop: "40px", fontSize: "14px" }}>
                {busca ? "nenhuma conversa encontrada" : "nenhuma conversa ainda 💬"}
              </div>
            ) : (
              conversasFiltradas.map(conv => {
                const isAtiva = String(conversaSelecionada?.id_contato) === String(conv.id_contato);
                const nome = conv.usuario?.nome_usuario || conv.usuario?.apelido_usuario || "Usuário";
                const foto = conv.usuario?.fotoperfil_url || avatarFallback(nome);
                const ultimaMsg = conv.ultima_mensagem?.conteudo || "";
                const tempo = tempoRelativo(conv.ultima_mensagem?.enviado_em);
                const naoLidas = conv.nao_lidas || 0;
                const ehMinha = String(conv.ultima_mensagem?.id_remetente) === myId;

                return (
                  <div key={conv.id_contato} onClick={() => selecionarConversa(conv)} style={{
                    background: isAtiva
                      ? "linear-gradient(135deg,rgba(99,102,241,0.15),rgba(139,92,246,0.10))"
                      : "rgba(255,255,255,0.6)",
                    border: isAtiva
                      ? "1.5px solid rgba(99,102,241,0.35)"
                      : "1px solid rgba(255,255,255,0.5)",
                    borderRadius: "18px", padding: "12px",
                    display: "flex", alignItems: "center", gap: "12px",
                    cursor: "pointer", transition: "all 0.2s",
                  }}
                    onMouseEnter={e => { if (!isAtiva) e.currentTarget.style.background = "rgba(255,255,255,0.85)"; }}
                    onMouseLeave={e => { if (!isAtiva) e.currentTarget.style.background = "rgba(255,255,255,0.6)"; }}
                  >
                    <div style={{ position: "relative", flexShrink: 0 }}>
                      <img src={foto} alt={nome}
                        style={{ width: "48px", height: "48px", borderRadius: "14px", objectFit: "cover" }}
                        onError={e => { e.target.src = avatarFallback(nome); }}
                      />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontWeight: 600, fontSize: "14px", color: "#1f2937" }}>{nome}</span>
                        <span style={{ fontSize: "11px", color: "#9ca3af" }}>{tempo}</span>
                      </div>
                      <p style={{
                        fontSize: "12px",
                        color: naoLidas > 0 ? "#4f46e5" : "#6b7280",
                        fontWeight: naoLidas > 0 ? 600 : 400,
                        marginTop: "2px",
                        overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                      }}>
                        {ehMinha ? "Você: " : ""}{ultimaMsg || "Iniciar conversa"}
                      </p>
                    </div>
                    {naoLidas > 0 && (
                      <div style={{
                        background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
                        color: "#fff", borderRadius: "50px",
                        minWidth: "20px", height: "20px",
                        fontSize: "11px", fontWeight: 700,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        padding: "0 6px", flexShrink: 0,
                      }}>
                        {naoLidas > 9 ? "9+" : naoLidas}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </section>

        {/* ── ÁREA DO CHAT ── */}
        <section style={{
          flex: 1,
          background: "rgba(255,255,255,0.50)",
          borderRadius: "24px",
          boxShadow: "0 8px 32px rgba(0,0,0,0.10)",
          backdropFilter: "blur(20px)",
          border: "1px solid rgba(255,255,255,0.5)",
          display: "flex", flexDirection: "column", overflow: "hidden",
        }}>
          {conversaSelecionada ? (
            <>
              {/* TOPBAR */}
              <div style={{
                padding: "16px 20px",
                borderBottom: "1px solid rgba(255,255,255,0.4)",
                background: "rgba(255,255,255,0.3)",
                display: "flex", justifyContent: "space-between", alignItems: "center",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <img
                    src={conversaSelecionada.usuario?.fotoperfil_url || avatarFallback(conversaSelecionada.usuario?.nome_usuario)}
                    alt=""
                    style={{ width: "48px", height: "48px", borderRadius: "14px", objectFit: "cover" }}
                    onError={e => { e.target.src = avatarFallback(conversaSelecionada.usuario?.nome_usuario); }}
                  />
                  <div>
                    <h2 style={{ fontWeight: 700, fontSize: "16px", color: "#1f2937", margin: 0 }}>
                      {conversaSelecionada.usuario?.nome_usuario || "Usuário"} ✨
                    </h2>
                    <p style={{ fontSize: "12px", color: "#6b7280", margin: 0 }}>
                      {conversaSelecionada.usuario?.apelido_usuario
                        ? `@${conversaSelecionada.usuario.apelido_usuario}`
                        : ""}
                    </p>
                  </div>
                </div>
                <div style={{ display: "flex", gap: "8px" }}>
                  {["📞", "🎥"].map((icon, i) => (
                    <button key={i} style={{
                      width: "40px", height: "40px", borderRadius: "12px",
                      background: "rgba(255,255,255,0.65)",
                      border: "1px solid rgba(209,213,219,0.4)",
                      cursor: "pointer", fontSize: "18px",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      transition: "transform 0.15s",
                    }}
                      onMouseEnter={e => { e.currentTarget.style.transform = "scale(1.1)"; }}
                      onMouseLeave={e => { e.currentTarget.style.transform = "scale(1)"; }}
                    >{icon}</button>
                  ))}
                </div>
              </div>

              {/* MENSAGENS */}
              <div style={{
                flex: 1, overflowY: "auto", padding: "20px",
                display: "flex", flexDirection: "column", gap: "10px",
              }}>
                {loadingMensagens ? (
                  <div style={{ textAlign: "center", color: "#9ca3af", marginTop: "60px", fontSize: "14px" }}>
                    carregando mensagens...
                  </div>
                ) : mensagens.length === 0 ? (
                  <div style={{ textAlign: "center", color: "#9ca3af", marginTop: "60px", fontSize: "14px" }}>
                    nenhuma mensagem ainda. Diga olá! 👋
                  </div>
                ) : (
                  mensagens.map(msg => {
                    const ehMinha = String(msg.id_remetente) === myId;
                    return (
                      <div key={msg.id_mensagem} style={{
                        display: "flex", flexDirection: "column",
                        alignItems: ehMinha ? "flex-end" : "flex-start",
                      }}>
                        <div style={{
                          maxWidth: "65%",
                          background: ehMinha
                            ? "linear-gradient(135deg,#6366f1,#8b5cf6)"
                            : "rgba(255,255,255,0.80)",
                          color: ehMinha ? "#fff" : "#1f2937",
                          borderRadius: ehMinha ? "20px 20px 4px 20px" : "20px 20px 20px 4px",
                          padding: "12px 16px",
                          boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                          wordBreak: "break-word",
                        }}>
                          <p style={{ fontSize: "14px", margin: 0, lineHeight: "1.5" }}>{msg.conteudo}</p>
                        </div>
                        <span style={{
                          fontSize: "10px", color: "#9ca3af",
                          marginTop: "4px",
                          display: "flex", alignItems: "center", gap: "4px",
                        }}>
                          {formatHora(msg.enviado_em)}
                          {ehMinha && (
                            <span title={msg.lido_em ? "lida" : "enviada"}>
                              {msg.lido_em ? "✓✓" : "✓"}
                            </span>
                          )}
                        </span>
                      </div>
                    );
                  })
                )}
                <div ref={mensagensEndRef} />
              </div>

              {/* INPUT */}
              <div style={{
                padding: "16px 20px",
                borderTop: "1px solid rgba(255,255,255,0.4)",
                background: "rgba(255,255,255,0.3)",
              }}>
                <div style={{
                  background: "rgba(255,255,255,0.75)",
                  borderRadius: "50px", padding: "10px 16px",
                  display: "flex", alignItems: "center", gap: "12px",
                  border: "1px solid rgba(209,213,219,0.4)",
                }}>
                  <span style={{ fontSize: "20px" }}>😊</span>
                  <input ref={inputRef} type="text"
                    placeholder="digite uma mensagem..."
                    value={texto}
                    onChange={e => setTexto(e.target.value)}
                    onKeyDown={handleKeyDown}
                    style={{
                      flex: 1, background: "transparent",
                      border: "none", outline: "none",
                      fontSize: "14px", color: "#374151",
                    }}
                  />
                  <button onClick={enviarMensagem}
                    disabled={!texto.trim() || enviando}
                    style={{
                      width: "40px", height: "40px", borderRadius: "50%",
                      background: texto.trim() && !enviando
                        ? "linear-gradient(135deg,#6366f1,#8b5cf6)"
                        : "rgba(156,163,175,0.4)",
                      color: "#fff", border: "none",
                      cursor: texto.trim() && !enviando ? "pointer" : "not-allowed",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: "18px", transition: "all 0.2s",
                      boxShadow: texto.trim() && !enviando
                        ? "0 4px 14px rgba(99,102,241,0.4)" : "none",
                      flexShrink: 0,
                    }}
                  >{enviando ? "⋯" : "➤"}</button>
                </div>
              </div>
            </>
          ) : (
            /* ESTADO VAZIO */
            <div style={{
              flex: 1, display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center",
              gap: "16px", color: "#9ca3af",
            }}>
              <div style={{ fontSize: "64px" }}>💬</div>
              <h3 style={{ fontSize: "20px", fontWeight: 600, color: "#6b7280", margin: 0 }}>
                Suas mensagens
              </h3>
              <p style={{ fontSize: "14px", margin: 0, textAlign: "center", maxWidth: "280px" }}>
                Selecione uma conversa ou clique em <strong>+</strong> para começar a conversar
              </p>
              <button onClick={abrirNovoChat} style={{
                padding: "12px 24px", borderRadius: "50px",
                background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
                color: "#fff", border: "none", cursor: "pointer",
                fontWeight: 600, fontSize: "14px",
                boxShadow: "0 4px 14px rgba(99,102,241,0.4)",
                marginTop: "8px",
              }}>Nova conversa</button>
            </div>
          )}
        </section>
      </main>

      {/* ── MODAL NOVO CHAT ── */}
      {showNewChat && (
        <div onClick={() => setShowNewChat(false)} style={{
          position: "fixed", inset: 0,
          background: "rgba(0,0,0,0.35)",
          backdropFilter: "blur(4px)",
          zIndex: 50, display: "flex",
          alignItems: "center", justifyContent: "center",
        }}>
          <div onClick={e => e.stopPropagation()} style={{
            background: "rgba(255,255,255,0.97)",
            borderRadius: "24px", padding: "28px",
            width: "420px", maxHeight: "520px",
            display: "flex", flexDirection: "column", gap: "16px",
            boxShadow: "0 20px 60px rgba(0,0,0,0.20)",
            border: "1px solid rgba(255,255,255,0.6)",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ fontSize: "18px", fontWeight: 700, color: "#1f2937", margin: 0 }}>
                Nova conversa
              </h3>
              <button onClick={() => setShowNewChat(false)} style={{
                background: "none", border: "none", fontSize: "20px",
                cursor: "pointer", color: "#6b7280", lineHeight: 1,
              }}>✕</button>
            </div>

            <input autoFocus type="text" placeholder="buscar pessoa..."
              value={buscaUsuario}
              onChange={e => setBuscaUsuario(e.target.value)}
              style={{
                background: "#f3f4f6", border: "1px solid #e5e7eb",
                borderRadius: "50px", padding: "10px 16px",
                outline: "none", fontSize: "14px", color: "#374151",
              }}
            />

            <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: "8px" }}>
              {loadingUsuarios ? (
                <p style={{ color: "#9ca3af", fontSize: "14px", textAlign: "center", marginTop: "20px" }}>
                  carregando...
                </p>
              ) : usuariosFiltrados.length === 0 ? (
                <p style={{ color: "#9ca3af", fontSize: "14px", textAlign: "center", marginTop: "20px" }}>
                  {buscaUsuario ? "nenhum usuário encontrado" : "nenhum usuário disponível"}
                </p>
              ) : (
                usuariosFiltrados.map(u => (
                  <div key={u.id_usuario} onClick={() => iniciarConversa(u)} style={{
                    display: "flex", alignItems: "center", gap: "12px",
                    padding: "10px 12px", borderRadius: "14px",
                    cursor: "pointer", transition: "background 0.15s",
                  }}
                    onMouseEnter={e => { e.currentTarget.style.background = "#f3f4f6"; }}
                    onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
                  >
                    <img
                      src={u.fotoperfil_url || avatarFallback(u.nome_usuario)}
                      alt={u.nome_usuario}
                      style={{ width: "44px", height: "44px", borderRadius: "12px", objectFit: "cover" }}
                      onError={e => { e.target.src = avatarFallback(u.nome_usuario); }}
                    />
                    <div>
                      <p style={{ fontWeight: 600, fontSize: "14px", color: "#1f2937", margin: 0 }}>
                        {u.nome_usuario}
                      </p>
                      <p style={{ fontSize: "12px", color: "#6b7280", margin: 0 }}>
                        {u.apelido_usuario ? `@${u.apelido_usuario}` : ""}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}