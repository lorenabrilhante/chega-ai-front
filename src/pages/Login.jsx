import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import imgLogo from "../assets/logo.png";

const API_URL = `${import.meta.env.VITE_API_URL}/login`;

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

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
          email_usuario: email,
          senha_usuario: password,
        }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          data?.error || data?.message || "E-mail ou senha incorretos."
        );
      }

      const storage = remember ? localStorage : sessionStorage;
      storage.setItem("chega_ai_user", JSON.stringify(data));

      navigate("/");
    } catch (loginError) {
      setError(
        loginError.message ||
          "Nao foi possivel entrar agora. Tente novamente em instantes."
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
              chega ai
            </h1>

            <p className="mt-4 max-w-md text-lg font-semibold text-slate-600">
              Encontre eventos, comunidades e amizades perto de voce.
            </p>

            <div className="mt-8 grid grid-cols-3 gap-3 text-sm font-semibold">
              <div className="rounded-3xl bg-white/65 p-4 shadow">
                <span className="block text-2xl font-extrabold text-sky-600">
                  12
                </span>
                niveis sociais
              </div>

              <div className="rounded-3xl bg-white/65 p-4 shadow">
                <span className="block text-2xl font-extrabold text-emerald-600">
                  24h
                </span>
                rolês ativos
              </div>

              <div className="rounded-3xl bg-white/65 p-4 shadow">
                <span className="block text-2xl font-extrabold text-violet-600">
                  XP
                </span>
                conquistas
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
              <p className="text-sm font-bold uppercase tracking-wide text-sky-600">
                bem-vindo
              </p>
              <h2 className="text-3xl font-extrabold text-slate-800">
                entrar
              </h2>
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-4">
            <label className="text-sm font-bold text-slate-600">
              e-mail
              <input
                type="email"
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value);
                  setError("");
                }}
                placeholder="voce@email.com"
                className="mt-2 w-full rounded-2xl border border-white/70 bg-white/80 px-4 py-3 font-semibold outline-none transition focus:border-sky-300 focus:ring-4 focus:ring-sky-100"
                disabled={isLoading}
                required
              />
            </label>

            <label className="text-sm font-bold text-slate-600">
              senha
              <input
                type="password"
                value={password}
                onChange={(event) => {
                  setPassword(event.target.value);
                  setError("");
                }}
                placeholder="sua senha"
                className="mt-2 w-full rounded-2xl border border-white/70 bg-white/80 px-4 py-3 font-semibold outline-none transition focus:border-sky-300 focus:ring-4 focus:ring-sky-100"
                disabled={isLoading}
                required
              />
            </label>
          </div>

          {error && (
            <p className="mt-4 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-bold text-red-600">
              {error}
            </p>
          )}

          {location.state?.successMessage && !error && (
            <p className="mt-4 rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-600">
              {location.state.successMessage}
            </p>
          )}

          <div className="mt-5 flex items-center justify-between gap-3 text-sm">
            <label className="flex items-center gap-2 font-semibold text-slate-600">
              <input
                type="checkbox"
                checked={remember}
                onChange={(event) => setRemember(event.target.checked)}
                className="h-4 w-4 rounded border-slate-300 accent-sky-500"
                disabled={isLoading}
              />
              lembrar de mim
            </label>

            <button
              type="button"
              className="font-bold text-sky-600 hover:text-sky-700"
            >
              esqueci a senha
            </button>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="mt-8 w-full rounded-full bg-gradient-to-r from-sky-500 via-cyan-400 to-emerald-400 px-5 py-3 font-extrabold text-white shadow-lg transition hover:scale-[1.01] focus:outline-none focus:ring-4 focus:ring-cyan-100 disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:scale-100"
          >
            {isLoading ? "entrando..." : "entrar no chega ai"}
          </button>

          <div className="mt-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-slate-200" />
            <span className="text-xs font-bold uppercase text-slate-400">
              ou
            </span>
            <div className="h-px flex-1 bg-slate-200" />
          </div>

          <button
            type="button"
            onClick={() => navigate("/")}
            disabled={isLoading}
            className="mt-5 w-full rounded-full border border-slate-200 bg-white/80 px-5 py-3 font-bold text-slate-700 shadow-sm transition hover:bg-white"
          >
            continuar como visitante
          </button>

          <p className="mt-6 text-center text-sm font-semibold text-slate-500">
            ainda nao tem conta?{" "}
            <button
              type="button"
              onClick={() => navigate("/cadastro")}
              className="font-extrabold text-emerald-600"
            >
              criar cadastro
            </button>
          </p>
        </form>
      </section>
    </main>
  );
}
