import { createFileRoute, redirect } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { CalendarDays, ChevronLeft, ChevronRight, Plus, Trash2, UserRound } from "lucide-react";
import { getUser } from "@/lib/auth";
import { Navbar } from "@/components/Navbar";
import { CATEGORY_STYLES } from "@/lib/categories";
import { ClassRecord, createClassRecord, deleteClassRecord, listClassRecordsByWeek } from "@/lib/classes";
import { WEEKDAYS, Workout, listWorkouts } from "@/lib/workouts";

export const Route = createFileRoute("/calendar")({
  beforeLoad: () => {
    if (typeof window === "undefined") return;
    if (!getUser()) throw redirect({ to: "/login" });
  },
  head: () => ({
    meta: [
      { title: "Calendario - Historico de Aulas" },
      { name: "description", content: "Resumo semanal das aulas registradas." },
    ],
  }),
  component: CalendarPage,
});

interface FormState {
  date: string;
  cronogramaId: string;
  resumo: string;
  observacoes: string;
}

const JS_DAY_TO_INDEX: Record<number, number> = {
  0: 6,
  1: 0,
  2: 1,
  3: 2,
  4: 3,
  5: 4,
  6: 5,
};

function toInputDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function getWeekStart(date: Date): Date {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  copy.setDate(copy.getDate() - JS_DAY_TO_INDEX[copy.getDay()]);
  return copy;
}

function addDays(date: Date, amount: number): Date {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + amount);
  return copy;
}

function formatDate(date: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(`${date}T00:00:00`));
}

function CalendarPage() {
  const user = typeof window !== "undefined" ? getUser() : null;
  const [weekStart, setWeekStart] = useState(() => toInputDate(getWeekStart(new Date())));
  const [records, setRecords] = useState<ClassRecord[]>([]);
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [form, setForm] = useState<FormState>({
    date: toInputDate(new Date()),
    cronogramaId: "",
    resumo: "",
    observacoes: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const weekDays = useMemo(() => {
    const start = new Date(`${weekStart}T00:00:00`);
    return WEEKDAYS.map((label, index) => ({
      label,
      date: toInputDate(addDays(start, index)),
    }));
  }, [weekStart]);

  const refresh = async () => {
    try {
      const [nextRecords, nextWorkouts] = await Promise.all([
        listClassRecordsByWeek(weekStart),
        listWorkouts(),
      ]);
      setRecords(nextRecords);
      setWorkouts(nextWorkouts);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Nao foi possivel carregar o calendario.");
    }
  };

  useEffect(() => {
    void refresh();
    const h = () => void refresh();
    window.addEventListener("classes:changed", h);
    return () => window.removeEventListener("classes:changed", h);
  }, [weekStart]);

  const recordsByDate = useMemo(() => {
    const map = new Map<string, ClassRecord[]>();
    weekDays.forEach((day) => map.set(day.date, []));
    records.forEach((record) => map.get(record.date)?.push(record));
    return map;
  }, [records, weekDays]);

  const formWorkouts = useMemo(() => {
    const selected = weekDays.find((day) => day.date === form.date);
    if (!selected) return workouts;
    return workouts.filter((workout) => workout.weekday === selected.label);
  }, [form.date, weekDays, workouts]);

  const changeWeek = (amount: number) => {
    const next = addDays(new Date(`${weekStart}T00:00:00`), amount * 7);
    setWeekStart(toInputDate(next));
  };

  const handleWeekInput = (value: string) => {
    setWeekStart(toInputDate(getWeekStart(new Date(`${value}T00:00:00`))));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!form.cronogramaId) {
      setError("Selecione o cronograma da aula.");
      return;
    }

    if (!form.resumo.trim()) {
      setError("Informe o resumo da aula.");
      return;
    }

    setLoading(true);
    try {
      await createClassRecord({
        date: form.date,
        cronogramaId: form.cronogramaId,
        resumo: form.resumo,
        observacoes: form.observacoes,
      });
      setForm({ ...form, resumo: "", observacoes: "" });
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Nao foi possivel registrar a aula.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Excluir este registro de aula?")) return;

    try {
      await deleteClassRecord(id);
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Nao foi possivel excluir o registro.");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-widest text-primary">
              Historico de aulas
            </p>
            <h1 className="font-display text-4xl">Calendario semanal</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Registre e consulte o resumo das aulas realizadas.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => changeWeek(-1)}
              className="rounded-md border border-border p-2 transition hover:bg-secondary"
              aria-label="Semana anterior"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <input
              type="date"
              value={weekStart}
              onChange={(e) => handleWeekInput(e.target.value)}
              className="input w-auto"
            />
            <button
              onClick={() => changeWeek(1)}
              className="rounded-md border border-border p-2 transition hover:bg-secondary"
              aria-label="Proxima semana"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {error && (
          <div className="mt-4 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </div>
        )}

        {user?.role === "admin" && (
          <form
            onSubmit={handleSave}
            className="mt-6 rounded-2xl border border-border bg-card p-5 shadow-xl"
          >
            <div className="flex items-center gap-2">
              <Plus className="h-4 w-4 text-primary" />
              <h2 className="text-lg font-semibold">Registrar aula</h2>
            </div>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <Field label="Data">
                <input
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value, cronogramaId: "" })}
                  className="input"
                  required
                />
              </Field>
              <Field label="Cronograma">
                <select
                  value={form.cronogramaId}
                  onChange={(e) => setForm({ ...form, cronogramaId: e.target.value })}
                  className="input"
                  required
                >
                  <option value="">Selecione uma aula planejada</option>
                  {formWorkouts.map((workout) => (
                    <option key={workout.id} value={workout.id}>
                      {workout.category} - {workout.professor.nome} - {workout.pilar}
                    </option>
                  ))}
                </select>
              </Field>
            </div>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <Field label="Resumo da aula">
                <textarea
                  rows={4}
                  maxLength={1000}
                  value={form.resumo}
                  onChange={(e) => setForm({ ...form, resumo: e.target.value })}
                  className="input resize-none"
                  required
                />
              </Field>
              <Field label="Observacoes">
                <textarea
                  rows={4}
                  maxLength={1000}
                  value={form.observacoes}
                  onChange={(e) => setForm({ ...form, observacoes: e.target.value })}
                  className="input resize-none"
                />
              </Field>
            </div>
            <div className="mt-4 flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition hover:brightness-110 disabled:opacity-70"
              >
                {loading ? "Salvando..." : "Salvar registro"}
              </button>
            </div>
          </form>
        )}

        <div className="mt-8 grid gap-4 lg:grid-cols-2">
          {weekDays.map((day) => {
            const dayRecords = recordsByDate.get(day.date) ?? [];
            return (
              <section key={day.date} className="overflow-hidden rounded-2xl border border-border bg-card">
                <div className="flex items-center justify-between border-b border-border bg-muted/30 px-5 py-3">
                  <div className="flex items-center gap-2">
                    <CalendarDays className="h-4 w-4 text-primary" />
                    <h2 className="font-display text-xl">
                      {day.label}
                    </h2>
                  </div>
                  <span className="text-xs text-muted-foreground">{formatDate(day.date)}</span>
                </div>

                {dayRecords.length === 0 ? (
                  <div className="px-5 py-8 text-center text-sm text-muted-foreground">
                    Nenhuma aula registrada.
                  </div>
                ) : (
                  <div className="divide-y divide-border">
                    {dayRecords.map((record) => {
                      const style = CATEGORY_STYLES[record.category];
                      return (
                        <article
                          key={record.id}
                          className={`border-l-4 px-5 py-4 ${style.ring}`}
                        >
                          <div className="flex flex-wrap items-start justify-between gap-3">
                            <div>
                              <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${style.badge}`}>
                                {record.category}
                              </span>
                              <h3 className="mt-2 font-semibold">{record.pilar}</h3>
                              <div className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                                <UserRound className="h-3.5 w-3.5" />
                                {record.professor.nome}
                              </div>
                            </div>
                            {user?.role === "admin" && (
                              <button
                                onClick={() => void handleDelete(record.id)}
                                className="rounded-md border border-destructive/40 p-2 text-destructive transition hover:bg-destructive/10"
                                aria-label="Excluir registro"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                          <p className="mt-3 text-sm">{record.resumo}</p>
                          {record.observacoes && (
                            <p className="mt-2 text-xs text-muted-foreground">
                              {record.observacoes}
                            </p>
                          )}
                        </article>
                      );
                    })}
                  </div>
                )}
              </section>
            );
          })}
        </div>
      </main>
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
