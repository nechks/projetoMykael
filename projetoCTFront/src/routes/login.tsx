import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { LogIn } from "lucide-react";
import { login } from "@/lib/auth";
import logoUrl from "../../icone/WhatsApp Image 2026-06-09 at 14.47.39.jpeg";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Login - EMANUELAFELIZ" },
      { name: "description", content: "Acesse o sistema de cronograma de treinos." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const u = await login(username, password);
      if (!u) {
        setError("Usuario ou senha invalidos.");
        return;
      }
      navigate({ to: u.role === "admin" ? "/admin" : "/schedule" });
    } catch {
      setError("Nao foi possivel conectar ao backend.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      <div className="absolute inset-0 bg-grid opacity-60" />
      <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-primary/20 blur-3xl" />
      <div className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-cat-elite/20 blur-3xl" />

      <div className="relative flex min-h-screen items-center justify-center px-4 py-10">
        <div className="w-full max-w-md">
          <div className="mb-8 flex flex-col items-center text-center">
            <img src={logoUrl} alt="EMANUELAFELIZ" className="mb-4 h-24 w-24 rounded-full object-contain" />
            <h1 className="font-display text-4xl">EMANUELAFELIZ</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Gerencie seus treinos com performance.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="rounded-2xl border border-border bg-card p-6 shadow-2xl"
          >
            <h2 className="text-lg font-semibold">Entrar</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Use suas credenciais para acessar.
            </p>

            <div className="mt-6 space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Usuario
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  autoComplete="username"
                  className="w-full rounded-md border border-input bg-background px-3 py-2.5 text-sm outline-none ring-ring transition focus:border-ring focus:ring-2"
                  placeholder="admin"
                  required
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Senha
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  className="w-full rounded-md border border-input bg-background px-3 py-2.5 text-sm outline-none ring-ring transition focus:border-ring focus:ring-2"
                  placeholder="******"
                  required
                />
              </div>
            </div>

            {error && (
              <div className="mt-4 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition hover:brightness-110 disabled:opacity-70"
            >
              <LogIn className="h-4 w-4" />
              {loading ? "Entrando..." : "Entrar"}
            </button>

            <div className="mt-6 rounded-md border border-border bg-muted/40 p-3 text-xs text-muted-foreground">
              <p className="font-semibold text-foreground">Credenciais de teste</p>
              <p className="mt-1">Administrador - <span className="font-mono">admin / admin123</span></p>
              <p>Instrutor - <span className="font-mono">instrutor / instrutor123</span></p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
