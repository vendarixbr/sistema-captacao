import { useState } from "react";
import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { Sparkles } from "lucide-react";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/login")({
  beforeLoad: async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (session) {
      throw redirect({ to: "/admin" });
    }
  },
  component: LoginPage,
});

function LoginPage() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  function switchMode(next: "login" | "register") {
    setMode(next);
    setError("");
    setSuccess("");
    setPassword("");
    setConfirmPassword("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (mode === "register" && password !== confirmPassword) {
      setError("As senhas não coincidem.");
      return;
    }

    setLoading(true);
    try {
      if (mode === "login") {
        const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
        if (authError) throw authError;
        navigate({ to: "/admin" });
      } else {
        const { error: authError } = await supabase.auth.signUp({ email, password });
        if (authError) throw authError;
        setSuccess("Conta criada! Verifique seu e-mail para confirmar o cadastro, ou faça login se a confirmação estiver desativada.");
        switchMode("login");
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Ocorreu um erro";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F4F0EB] px-4">
      <div className="w-full max-w-sm">
        <div className="flex items-center justify-center gap-2.5 mb-8">
          <div className="size-9 rounded-xl bg-gradient-to-br from-[#B8865A] to-[#D4A96A] flex items-center justify-center shadow-md">
            <Sparkles size={18} className="text-white" />
          </div>
          <div>
            <p className="font-serif text-[#2C1F1A] text-xl font-medium tracking-tight">beinflux</p>
            <p className="font-sans text-[9px] tracking-[0.25em] uppercase text-[#2C1F1A]/40 font-light">
              Landing Generator
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-[#2C1F1A]/6 px-8 py-8">
          {/* Tabs */}
          <div className="flex mb-6 bg-[#F4F0EB] rounded-xl p-1">
            <button
              type="button"
              onClick={() => switchMode("login")}
              className={`flex-1 py-2 text-[11px] tracking-[0.15em] uppercase font-sans font-medium rounded-lg transition-all ${
                mode === "login"
                  ? "bg-white text-[#2C1F1A] shadow-sm"
                  : "text-[#2C1F1A]/40 hover:text-[#2C1F1A]/70"
              }`}
            >
              Entrar
            </button>
            <button
              type="button"
              onClick={() => switchMode("register")}
              className={`flex-1 py-2 text-[11px] tracking-[0.15em] uppercase font-sans font-medium rounded-lg transition-all ${
                mode === "register"
                  ? "bg-white text-[#2C1F1A] shadow-sm"
                  : "text-[#2C1F1A]/40 hover:text-[#2C1F1A]/70"
              }`}
            >
              Cadastrar
            </button>
          </div>

          <h1 className="font-serif text-xl text-[#2C1F1A] mb-1">
            {mode === "login" ? "Entrar" : "Criar conta"}
          </h1>
          <p className="text-[12px] text-[#2C1F1A]/45 font-sans mb-6">
            {mode === "login" ? "Acesse o painel de administração" : "Crie sua conta de administrador"}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[11px] tracking-[0.15em] uppercase text-[#2C1F1A]/60 font-sans font-medium">
                E-mail
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
                placeholder="seu@email.com"
                className="w-full px-3.5 py-2.5 text-[13px] font-sans bg-[#F4F0EB] border border-[#2C1F1A]/10 rounded-xl focus:outline-none focus:border-[#B8865A] focus:ring-2 focus:ring-[#B8865A]/15 transition-all placeholder:text-[#2C1F1A]/25 text-[#2C1F1A]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] tracking-[0.15em] uppercase text-[#2C1F1A]/60 font-sans font-medium">
                Senha
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 text-[13px] font-sans bg-[#F4F0EB] border border-[#2C1F1A]/10 rounded-xl focus:outline-none focus:border-[#B8865A] focus:ring-2 focus:ring-[#B8865A]/15 transition-all placeholder:text-[#2C1F1A]/25 text-[#2C1F1A]"
              />
            </div>

            {mode === "register" && (
              <div className="space-y-1.5">
                <label className="text-[11px] tracking-[0.15em] uppercase text-[#2C1F1A]/60 font-sans font-medium">
                  Confirmar senha
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 text-[13px] font-sans bg-[#F4F0EB] border border-[#2C1F1A]/10 rounded-xl focus:outline-none focus:border-[#B8865A] focus:ring-2 focus:ring-[#B8865A]/15 transition-all placeholder:text-[#2C1F1A]/25 text-[#2C1F1A]"
                />
              </div>
            )}

            {error && (
              <p className="text-[12px] text-red-500 font-sans bg-red-50 px-3.5 py-2.5 rounded-xl">
                {error}
              </p>
            )}

            {success && (
              <p className="text-[12px] text-emerald-600 font-sans bg-emerald-50 px-3.5 py-2.5 rounded-xl">
                {success}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 mt-2 bg-gradient-to-r from-[#2C1F1A] to-[#3D2A22] text-white text-[11px] tracking-[0.2em] uppercase font-sans font-medium rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading
                ? mode === "login" ? "Entrando..." : "Cadastrando..."
                : mode === "login" ? "Entrar" : "Cadastrar"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
