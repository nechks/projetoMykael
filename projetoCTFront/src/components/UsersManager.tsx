import { useEffect, useState } from "react";
import { Plus, Shield, User as UserIcon, X } from "lucide-react";
import { AppUser, Role, createUser, listUsers } from "@/lib/auth";

interface FormState {
  nome: string;
  login: string;
  senha: string;
  role: Role;
}

const EMPTY: FormState = { nome: "", login: "", senha: "", role: "user" };

export function UsersManager() {
  const [users, setUsers] = useState<AppUser[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const refresh = async () => {
    try {
      setUsers(await listUsers());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Nao foi possivel carregar usuarios.");
    }
  };

  useEffect(() => {
    void refresh();
    const h = () => void refresh();
    window.addEventListener("users:changed", h);
    return () => window.removeEventListener("users:changed", h);
  }, []);

  const openCreate = () => {
    setForm(EMPTY);
    setError("");
    setOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await createUser(form);
      await refresh();
      setOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Nao foi possivel criar o usuario.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="mt-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-widest text-primary">
            Controle de acesso
          </p>
          <h2 className="font-display text-3xl">Usuarios</h2>
          <p className="mt-1 text-sm text-muted-foreground">{users.length} usuarios cadastrados.</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition hover:brightness-110"
        >
          <Plus className="h-4 w-4" />
          Novo usuario
        </button>
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border border-border bg-card">
        <div className="hidden grid-cols-12 gap-4 border-b border-border bg-muted/40 px-5 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground md:grid">
          <div className="col-span-4">Nome</div>
          <div className="col-span-4">Login</div>
          <div className="col-span-4">Permissao</div>
        </div>

        {users.length === 0 && (
          <div className="px-5 py-8 text-center text-sm text-muted-foreground">
            Nenhum usuario cadastrado.
          </div>
        )}

        {users.map((u) => (
          <div
            key={u.id}
            className="grid grid-cols-1 gap-3 border-b border-border px-5 py-4 last:border-b-0 md:grid-cols-12 md:items-center md:gap-4"
          >
            <div className="flex items-center gap-3 md:col-span-4">
              <span
                className={`grid h-9 w-9 place-items-center rounded-md ${
                  u.role === "admin" ? "bg-primary/15 text-primary" : "bg-secondary text-foreground"
                }`}
              >
                {u.role === "admin" ? (
                  <Shield className="h-4 w-4" />
                ) : (
                  <UserIcon className="h-4 w-4" />
                )}
              </span>
              <div className="font-semibold">{u.nome}</div>
            </div>
            <div className="text-sm text-muted-foreground md:col-span-4">{u.login}</div>
            <div className="md:col-span-4">
              <span
                className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${
                  u.role === "admin"
                    ? "border-primary/40 bg-primary/10 text-primary"
                    : "border-border bg-secondary text-muted-foreground"
                }`}
              >
                {u.role === "admin" ? "Administrador" : "Instrutor"}
              </span>
            </div>
          </div>
        ))}
      </div>

      {error && !open && (
        <div className="mt-4 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </div>
      )}

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur-sm">
          <form
            onSubmit={handleSave}
            className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl"
          >
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-lg font-semibold">Novo usuario</h2>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  Defina credenciais e nivel de permissao.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-md p-1.5 text-muted-foreground transition hover:bg-secondary"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-5 space-y-4">
              <Field label="Nome">
                <input
                  required
                  maxLength={80}
                  value={form.nome}
                  onChange={(e) => setForm({ ...form, nome: e.target.value })}
                  className="input"
                />
              </Field>

              <Field label="Login">
                <input
                  required
                  maxLength={40}
                  value={form.login}
                  onChange={(e) => setForm({ ...form, login: e.target.value })}
                  className="input"
                />
              </Field>

              <Field label="Senha">
                <input
                  required
                  type="text"
                  maxLength={80}
                  value={form.senha}
                  onChange={(e) => setForm({ ...form, senha: e.target.value })}
                  className="input"
                />
              </Field>

              <Field label="Nivel de permissao">
                <select
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value as Role })}
                  className="input"
                >
                  <option value="user">Instrutor</option>
                  <option value="admin">Administrador</option>
                </select>
              </Field>
            </div>

            {error && (
              <div className="mt-4 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {error}
              </div>
            )}

            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-md border border-border px-4 py-2 text-sm transition hover:bg-secondary"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition hover:brightness-110 disabled:opacity-70"
              >
                {loading ? "Criando..." : "Criar usuario"}
              </button>
            </div>
          </form>
        </div>
      )}
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </label>
      {children}
    </div>
  );
}
