import { createFileRoute, redirect } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Calendar as CalIcon, Pencil, Plus, Trash2, UserRound, X } from "lucide-react";
import { AppUser, getUser, listUsers } from "@/lib/auth";
import { Navbar } from "@/components/Navbar";
import { UsersManager } from "@/components/UsersManager";
import { CATEGORIES, CATEGORY_STYLES, Category } from "@/lib/categories";
import {
  WEEKDAYS,
  Weekday,
  Workout,
  createWorkout,
  deleteWorkout,
  listWorkouts,
  updateWorkout,
} from "@/lib/workouts";

export const Route = createFileRoute("/admin")({
  beforeLoad: () => {
    if (typeof window === "undefined") return;
    const u = getUser();
    if (!u) throw redirect({ to: "/login" });
    if (u.role !== "admin") throw redirect({ to: "/schedule" });
  },
  head: () => ({
    meta: [
      { title: "Admin - Cronograma de Treinos" },
      { name: "description", content: "Gerencie cronogramas de treino por dia e modalidade." },
    ],
  }),
  component: AdminPage,
});

interface FormState {
  weekday: Weekday;
  category: Category;
  professorId: string;
  pilar: string;
  descricao: string;
  ativo: boolean;
}

const EMPTY: FormState = {
  weekday: "Segunda",
  category: "MF Combate",
  professorId: "",
  pilar: "",
  descricao: "",
  ativo: true,
};

function AdminPage() {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [professores, setProfessores] = useState<AppUser[]>([]);
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY);
  const [formError, setFormError] = useState("");
  const [loading, setLoading] = useState(false);

  const refresh = async () => {
    try {
      const [nextWorkouts, users] = await Promise.all([listWorkouts(), listUsers()]);
      setWorkouts(nextWorkouts);
      setProfessores(users.filter((user) => user.role === "user"));
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Nao foi possivel carregar cronogramas.");
    }
  };

  useEffect(() => {
    void refresh();
    const h = () => void refresh();
    window.addEventListener("workouts:changed", h);
    return () => window.removeEventListener("workouts:changed", h);
  }, []);

  const openCreate = () => {
    setEditId(null);
    setForm(EMPTY);
    setFormError("");
    setOpen(true);
  };

  const openEdit = (w: Workout) => {
    setEditId(w.id);
    setForm({
      weekday: w.weekday,
      category: w.category,
      professorId: String(w.professor.id),
      pilar: w.pilar,
      descricao: w.descricao ?? "",
      ativo: w.ativo,
    });
    setFormError("");
    setOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    const pilar = form.pilar.trim();
    const professorId = Number(form.professorId);
    if (!pilar) {
      setFormError("Informe ao menos 1 pilar/conteudo do treino.");
      return;
    }
    if (!professorId) {
      setFormError("Selecione o professor que vai dar a aula.");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        weekday: form.weekday,
        category: form.category,
        professorId,
        pilar,
        descricao: form.descricao.trim() || undefined,
        ativo: form.ativo,
      };
      if (editId) await updateWorkout(editId, payload);
      else await createWorkout(payload);
      await refresh();
      setOpen(false);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Nao foi possivel salvar o cronograma.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Excluir este cronograma?")) return;
    try {
      await deleteWorkout(id);
      await refresh();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Nao foi possivel excluir o cronograma.");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-widest text-primary">
              Painel administrativo
            </p>
            <h1 className="font-display text-4xl">Gerenciar cronogramas</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {workouts.length} cronogramas ativos cadastrados.
            </p>
          </div>
          <button
            onClick={openCreate}
            className="flex items-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition hover:brightness-110"
          >
            <Plus className="h-4 w-4" />
            Novo cronograma
          </button>
        </div>

        {formError && !open && (
          <div className="mt-4 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {formError}
          </div>
        )}

        <div className="mt-8 overflow-hidden rounded-2xl border border-border bg-card">
          <div className="hidden grid-cols-12 gap-4 border-b border-border bg-muted/40 px-5 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground md:grid">
            <div className="col-span-2">Dia</div>
            <div className="col-span-2">Modalidade</div>
            <div className="col-span-3">Professor</div>
            <div className="col-span-3">Pilar</div>
            <div className="col-span-2 text-right">Acoes</div>
          </div>

          {workouts.length === 0 && (
            <div className="px-5 py-12 text-center text-sm text-muted-foreground">
              Nenhum cronograma cadastrado.
            </div>
          )}

          {workouts.map((w) => {
            const s = CATEGORY_STYLES[w.category];
            return (
              <div
                key={w.id}
                className={`grid grid-cols-1 gap-3 border-b border-border border-l-4 px-5 py-4 last:border-b-0 md:grid-cols-12 md:items-center md:gap-4 ${s.ring}`}
              >
                <div className="flex items-center gap-2 text-sm md:col-span-2">
                  <CalIcon className="h-4 w-4 text-muted-foreground md:hidden" />
                  {w.weekday}
                </div>
                <div className="md:col-span-2">
                  <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${s.badge}`}>
                    {w.category}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm md:col-span-3">
                  <UserRound className="h-4 w-4 text-muted-foreground" />
                  {w.professor.nome}
                </div>
                <div className="md:col-span-3">
                  <div className="font-semibold">{w.pilar}</div>
                  {w.descricao && (
                    <div className="line-clamp-1 text-xs text-muted-foreground">
                      {w.descricao}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2 md:col-span-2 md:justify-end">
                  <button
                    onClick={() => openEdit(w)}
                    className="flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-xs transition hover:bg-secondary"
                  >
                    <Pencil className="h-3.5 w-3.5" /> Editar
                  </button>
                  <button
                    onClick={() => void handleDelete(w.id)}
                    className="flex items-center gap-1.5 rounded-md border border-destructive/40 px-3 py-1.5 text-xs text-destructive transition hover:bg-destructive/10"
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Excluir
                  </button>
                </div>
              </div>
            );
          })}
        </div>
        <UsersManager />
      </main>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur-sm">
          <form
            onSubmit={handleSave}
            className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-2xl"
          >
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-lg font-semibold">
                  {editId ? "Editar cronograma" : "Novo cronograma"}
                </h2>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  Preencha as informacoes abaixo.
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
              <div className="grid grid-cols-2 gap-3">
                <Field label="Dia da semana">
                  <select
                    value={form.weekday}
                    onChange={(e) => setForm({ ...form, weekday: e.target.value as Weekday })}
                    className="input"
                  >
                    {WEEKDAYS.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </Field>
                <Field label="Modalidade">
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value as Category })}
                    className="input"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </Field>
              </div>

              <Field label="Professor">
                <select
                  required
                  value={form.professorId}
                  onChange={(e) => setForm({ ...form, professorId: e.target.value })}
                  className="input"
                >
                  <option value="">Selecione um professor</option>
                  {professores.map((professor) => (
                    <option key={professor.id} value={professor.id}>
                      {professor.nome}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Pilar / conteudo do treino">
                <textarea
                  required
                  rows={3}
                  maxLength={500}
                  placeholder="Ex.: chutes, quedas, condicionamento..."
                  value={form.pilar}
                  onChange={(e) => setForm({ ...form, pilar: e.target.value })}
                  className="input resize-none"
                />
              </Field>

              <Field label="Descricao (opcional)">
                <textarea
                  rows={3}
                  maxLength={800}
                  value={form.descricao}
                  onChange={(e) => setForm({ ...form, descricao: e.target.value })}
                  className="input resize-none"
                />
              </Field>
            </div>

            {formError && (
              <div className="mt-4 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {formError}
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
                {loading ? "Salvando..." : editId ? "Salvar alteracoes" : "Criar cronograma"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
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
