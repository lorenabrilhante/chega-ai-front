import { useState } from "react";
import { useNavigate } from "react-router-dom";
import imgLogo from "../assets/logo.png";

const API_URL = `${import.meta.env.VITE_API_URL}/usuarios`;

export default function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nome_usuario: "",
    apelido_usuario: "",
    email_usuario: "",
    senha_usuario: "",
    bio_usuario: "",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;
    setFormData((currentData) => ({
      ...currentData,
      [name]: value,
    }));
    setError("");
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nome_usuario: formData.nome_usuario,
          apelido_usuario: formData.apelido_usuario,
          email_usuario: formData.email_usuario,
          senha_usuario: formData.senha_usuario,
          bio_usuario: formData.bio_usuario,
        }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          data?.error || data?.message || "Nao foi possivel criar sua conta."
        );
      }

      navigate("/login", {
        state: {
          successMessage: "Conta criada com sucesso. Agora e so entrar.",
        },
      });
    } catch (registerError) {
      setError(
        registerError.message ||
          "Nao foi possivel criar sua conta agora. Tente novamente."
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-sky-100 via-emerald-100 to-amber-100 px-4 py-6 text-gray-800">
      <section className="mx-auto flex min-h-[calc(100vh-48px)] w-full max-w-6xl items-center justify-center gap-6 lg:justify-between">
        <div className="hidden max-w-xl flex-1 lg:block">
          <div className="rounded-[32px] border border-white/50 bg-white/45 p-8 shadow-2xl backdrop-blur-xl">
            <img
              src={imgLogo}
              alt="Chega Ai"
              className="h-24 w-24 object-contain"
            />

            <h1 className="mt-8 text-5xl font-extrabold leading-tight text-slate-800">
              crie seu perfil
            </h1>

            <p className="mt-4 max-w-md text-lg font-semibold text-slate-600">
              Entre no mapa social, descubra comunidades e comece a ganhar XP.
            </p>

            <div className="mt-8 grid grid-cols-3 gap-3 text-sm font-semibold">
              <div className="rounded-3xl bg-white/65 p-4 shadow">
                <span className="block text-2xl font-extrabold text-sky-600">
                  mapa
                </span>
                rolês perto
              </div>

              <div className="rounded-3xl bg-white/65 p-4 shadow">
                <span className="block text-2xl font-extrabold text-emerald-600">
                  grupos
                </span>
                comunidades
              </div>

              <div className="rounded-3xl bg-white/65 p-4 shadow">
                <span className="block text-2xl font-extrabold text-violet-600">
                  lvl
                </span>
                progresso
              </div>
            </div>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="w-full max-w-md rounded-[32px] border border-white/50 bg-white/70 p-6 shadow-2xl backdrop-blur-xl sm:p-8"
        >
          <div className="flex items-center gap-3">
            <img
              src={imgLogo}
              alt="Chega Ai"
              className="h-16 w-16 object-contain"
            />

            <div>
              <p className="text-sm font-bold uppercase tracking-wide text-emerald-600">
                nova conta
              </p>
              <h2 className="text-3xl font-extrabold text-slate-800">
                cadastro
              </h2>
            </div>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <label className="text-sm font-bold text-slate-600">
              nome
              <input
                type="text"
                name="nome_usuario"
                value={formData.nome_usuario}
                onChange={handleChange}
                placeholder="Maria"
                className="mt-2 w-full rounded-2xl border border-white/70 bg-white/80 px-4 py-3 font-semibold outline-none transition focus:border-emerald-300 focus:ring-4 focus:ring-emerald-100"
                disabled={isLoading}
                required
              />
            </label>

            <label className="text-sm font-bold text-slate-600">
              apelido
              <input
                type="text"
                name="apelido_usuario"
                value={formData.apelido_usuario}
                onChange={handleChange}
                placeholder="mari"
                className="mt-2 w-full rounded-2xl border border-white/70 bg-white/80 px-4 py-3 font-semibold outline-none transition focus:border-emerald-300 focus:ring-4 focus:ring-emerald-100"
                disabled={isLoading}
                required
              />
            </label>
          </div>

          <div className="mt-4 flex flex-col gap-4">
            <label className="text-sm font-bold text-slate-600">
              e-mail
              <input
                type="email"
                name="email_usuario"
                value={formData.email_usuario}
                onChange={handleChange}
                placeholder="maria@email.com"
                className="mt-2 w-full rounded-2xl border border-white/70 bg-white/80 px-4 py-3 font-semibold outline-none transition focus:border-emerald-300 focus:ring-4 focus:ring-emerald-100"
                disabled={isLoading}
                required
              />
            </label>

            <label className="text-sm font-bold text-slate-600">
              senha
              <input
                type="password"
                name="senha_usuario"
                value={formData.senha_usuario}
                onChange={handleChange}
                placeholder="sua senha"
                className="mt-2 w-full rounded-2xl border border-white/70 bg-white/80 px-4 py-3 font-semibold outline-none transition focus:border-emerald-300 focus:ring-4 focus:ring-emerald-100"
                disabled={isLoading}
                required
              />
            </label>

            <label className="text-sm font-bold text-slate-600">
              bio
              <textarea
                name="bio_usuario"
                value={formData.bio_usuario}
                onChange={handleChange}
                placeholder="Ola!"
                rows="3"
                className="mt-2 w-full resize-none rounded-2xl border border-white/70 bg-white/80 px-4 py-3 font-semibold outline-none transition focus:border-emerald-300 focus:ring-4 focus:ring-emerald-100"
                disabled={isLoading}
              />
            </label>
          </div>

          {error && (
            <p className="mt-4 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-bold text-red-600">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="mt-6 w-full rounded-full bg-gradient-to-r from-emerald-500 via-cyan-400 to-sky-500 px-5 py-3 font-extrabold text-white shadow-lg transition hover:scale-[1.01] focus:outline-none focus:ring-4 focus:ring-emerald-100 disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:scale-100"
          >
            {isLoading ? "criando conta..." : "criar conta"}
          </button>

          <p className="mt-6 text-center text-sm font-semibold text-slate-500">
            ja tem conta?{" "}
            <button
              type="button"
              onClick={() => navigate("/login")}
              className="font-extrabold text-sky-600"
            >
              entrar
            </button>
          </p>
        </form>
      </section>
    </main>
  );
}
