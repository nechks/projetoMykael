import { createFileRoute, redirect } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Flame, UserRound } from "lucide-react";
import { getUser } from "@/lib/auth";
import { Navbar } from "@/components/Navbar";
import { CATEGORIES, CATEGORY_STYLES, Category } from "@/lib/categories";
import { WEEKDAYS, Weekday, Workout, listTodayWorkouts, listWorkouts } from "@/lib/workouts";

export const Route = createFileRoute("/schedule")({
  beforeLoad: () => {
    if (typeof window === "undefined") return;
    if (!getUser()) throw redirect({ to: "/login" });
  },
  head: () => ({
    meta: [
      { title: "Cronograma - EMANUELAFELIZ" },
      { name: "description", content: "Cronograma semanal de treinos por modalidade." },
    ],
  }),
  component: SchedulePage,
});

type Filter = "Todos" | Category;
const FILTERS: Filter[] = ["Todos", ...CATEGORIES];

const JS_DAY_TO_WEEKDAY: Record<number, Weekday> = {
  0: "Domingo",
  1: "Segunda",
  2: "Terca",
  3: "Quarta",
  4: "Quinta",
  5: "Sexta",
  6: "Sabado",
};

function SchedulePage() {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [todayWorkouts, setTodayWorkouts] = useState<Workout[]>([]);
  const [filter, setFilter] = useState<Filter>("Todos");
  const [error, setError] = useState("");

  useEffect(() => {
    const refresh = async () => {
      try {
        const [all, today] = await Promise.all([listWorkouts(), listTodayWorkouts()]);
        setWorkouts(all);
        setTodayWorkouts(today);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Nao foi possivel carregar cronogramas.");
      }
    };

    void refresh();
    window.addEventListener("workouts:changed", refresh);
    return () => window.removeEventListener("workouts:changed", refresh);
  }, []);

  const filtered = useMemo(
    () => (filter === "Todos" ? workouts : workouts.filter((w) => w.category === filter)),
    [workouts, filter],
  );

  const filteredToday = useMemo(
    () => (filter === "Todos" ? todayWorkouts : todayWorkouts.filter((w) => w.category === filter)),
    [todayWorkouts, filter],
  );

  const today: Weekday = useMemo(
    () => JS_DAY_TO_WEEKDAY[new Date().getDay()],
    [],
  );

  const byDay = useMemo(() => {
    const m = new Map<string, Workout[]>();
    WEEKDAYS.forEach((d) => m.set(d, []));
    filtered.forEach((w) => m.get(w.weekday)?.push(w));
    return m;
  }, [filtered]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-8">
        <div>
          <p className="text-xs font-medium uppercase tracking-widest text-primary">
            Cronograma semanal
          </p>
          <h1 className="font-display text-4xl">Treinos da semana</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Acompanhe os pilares organizados por dia.
          </p>
        </div>

        {error && (
          <div className="mt-4 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </div>
        )}

        <section className="mt-6 overflow-hidden rounded-2xl border border-primary/40 bg-gradient-to-br from-primary/10 via-card to-card shadow-xl shadow-primary/10">
          <div className="flex items-center justify-between border-b border-primary/30 px-5 py-3">
            <div className="flex items-center gap-2">
              <Flame className="h-5 w-5 text-primary" />
              <h2 className="font-display text-xl tracking-wide">Treino de hoje - {today}</h2>
            </div>
            <span className="text-xs text-muted-foreground">
              {filteredToday.length} {filteredToday.length === 1 ? "treino" : "treinos"}
            </span>
          </div>
          {filteredToday.length === 0 ? (
            <div className="px-5 py-8 text-center text-sm text-muted-foreground">
              Nenhum treino programado para hoje.
            </div>
          ) : (
            <div className="divide-y divide-border">
              {filteredToday.map((w) => {
                const s = CATEGORY_STYLES[w.category];
                return (
                  <div
                    key={w.id}
                    className={`grid grid-cols-1 gap-3 border-l-4 px-5 py-4 md:grid-cols-12 md:items-center ${s.ring}`}
                  >
                    <div className="md:col-span-3">
                      <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${s.badge}`}>
                        {w.category}
                      </span>
                    </div>
                    <div className="md:col-span-9">
                      <div className="font-semibold">{w.pilar}</div>
                      <div className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                        <UserRound className="h-3.5 w-3.5" />
                        {w.professor.nome}
                      </div>
                      {w.descricao && (
                        <div className="mt-0.5 text-sm text-muted-foreground">
                          {w.descricao}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        <div className="mt-8 flex flex-wrap gap-2">
          {FILTERS.map((f) => {
            const active = filter === f;
            const dot =
              f === "Todos" ? "bg-foreground" : CATEGORY_STYLES[f as Category].dot;
            return (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-sm transition ${
                  active
                    ? "border-primary bg-primary text-primary-foreground shadow-md shadow-primary/20"
                    : "border-border bg-card text-muted-foreground hover:text-foreground"
                }`}
              >
                <span className={`h-2 w-2 rounded-full ${dot}`} />
                {f}
              </button>
            );
          })}
        </div>

        <div className="mt-6 space-y-5">
          {WEEKDAYS.map((day) => {
            const items = byDay.get(day) ?? [];
            const isToday = day === today;
            return (
              <section
                key={day}
                className={`overflow-hidden rounded-2xl border bg-card ${isToday ? "border-primary/40" : "border-border"}`}
              >
                <div className="flex items-center justify-between border-b border-border bg-muted/30 px-5 py-3">
                  <h2 className="font-display text-xl tracking-wide">
                    {day} {isToday && <span className="ml-2 rounded-full bg-primary/15 px-2 py-0.5 text-xs font-medium text-primary">hoje</span>}
                  </h2>
                  <span className="text-xs text-muted-foreground">
                    {items.length} {items.length === 1 ? "treino" : "treinos"}
                  </span>
                </div>

                {items.length === 0 ? (
                  <div className="px-5 py-8 text-center text-sm text-muted-foreground">
                    Sem treinos {filter !== "Todos" ? `de ${filter}` : ""} neste dia.
                  </div>
                ) : (
                  <div className="divide-y divide-border">
                    {items.map((w) => {
                      const s = CATEGORY_STYLES[w.category];
                      return (
                        <div
                          key={w.id}
                          className={`grid grid-cols-1 gap-3 border-l-4 px-5 py-4 md:grid-cols-12 md:items-center ${s.ring}`}
                        >
                          <div className="md:col-span-3">
                            <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${s.badge}`}>
                              {w.category}
                            </span>
                          </div>
                          <div className="md:col-span-9">
                            <div className="font-semibold">{w.pilar}</div>
                            <div className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                              <UserRound className="h-3.5 w-3.5" />
                              {w.professor.nome}
                            </div>
                            {w.descricao && (
                              <div className="mt-0.5 text-sm text-muted-foreground">
                                {w.descricao}
                              </div>
                            )}
                          </div>
                        </div>
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
