import { Category } from "./categories";
import { AppUser } from "./auth";
import { apiFetch } from "./auth";

export const WEEKDAYS = [
  "Segunda",
  "Terca",
  "Quarta",
  "Quinta",
  "Sexta",
  "Sabado",
  "Domingo",
] as const;

export type Weekday = (typeof WEEKDAYS)[number];

export interface Workout {
  id: string;
  weekday: Weekday;
  category: Category;
  professor: AppUser;
  pilar: string;
  descricao?: string;
  ativo: boolean;
}

export interface WorkoutPayload {
  weekday: Weekday;
  category: Category;
  professorId: number;
  pilar: string;
  descricao?: string;
  ativo?: boolean;
}

type BackendDiaSemana =
  | "SEGUNDA"
  | "TERCA"
  | "QUARTA"
  | "QUINTA"
  | "SEXTA"
  | "SABADO"
  | "DOMINGO";

export type BackendModalidade =
  | "FUNCIONAL"
  | "MF_COMBATE"
  | "TAEKWONDO"
  | "ALTO_RENDIMENTO";

interface BackendCronograma {
  id: number;
  diaSemana: BackendDiaSemana;
  modalidade: BackendModalidade;
  professor: BackendUsuario;
  pilar: string;
  descricao?: string;
  ativo: boolean;
}

interface BackendUsuario {
  id: number;
  nome: string;
  login: string;
  perfil: "ADMIN" | "INSTRUTOR";
}

const weekdayToBackend: Record<Weekday, BackendDiaSemana> = {
  Segunda: "SEGUNDA",
  Terca: "TERCA",
  Quarta: "QUARTA",
  Quinta: "QUINTA",
  Sexta: "SEXTA",
  Sabado: "SABADO",
  Domingo: "DOMINGO",
};

const weekdayFromBackend: Record<BackendDiaSemana, Weekday> = {
  SEGUNDA: "Segunda",
  TERCA: "Terca",
  QUARTA: "Quarta",
  QUINTA: "Quinta",
  SEXTA: "Sexta",
  SABADO: "Sabado",
  DOMINGO: "Domingo",
};

const categoryToBackend: Record<Category, BackendModalidade> = {
  Funcional: "FUNCIONAL",
  "MF Combate": "MF_COMBATE",
  Taekwondo: "TAEKWONDO",
  "Alto Rendimento": "ALTO_RENDIMENTO",
};

export const categoryFromBackend: Record<BackendModalidade, Category> = {
  FUNCIONAL: "Funcional",
  MF_COMBATE: "MF Combate",
  TAEKWONDO: "Taekwondo",
  ALTO_RENDIMENTO: "Alto Rendimento",
};

function toWorkout(cronograma: BackendCronograma): Workout {
  return {
    id: String(cronograma.id),
    weekday: weekdayFromBackend[cronograma.diaSemana],
    category: categoryFromBackend[cronograma.modalidade],
    professor: {
      id: cronograma.professor.id,
      nome: cronograma.professor.nome,
      login: cronograma.professor.login,
      role: cronograma.professor.perfil === "ADMIN" ? "admin" : "user",
    },
    pilar: cronograma.pilar,
    descricao: cronograma.descricao,
    ativo: cronograma.ativo,
  };
}

function toBackend(payload: WorkoutPayload) {
  return {
    diaSemana: weekdayToBackend[payload.weekday],
    modalidade: categoryToBackend[payload.category],
    professorId: payload.professorId,
    pilar: payload.pilar.trim(),
    descricao: payload.descricao?.trim() || null,
    ativo: payload.ativo ?? true,
  };
}

export async function listWorkouts(): Promise<Workout[]> {
  const cronogramas = await apiFetch<BackendCronograma[]>("/api/cronogramas");
  return cronogramas.map(toWorkout);
}

export async function listTodayWorkouts(): Promise<Workout[]> {
  const cronogramas = await apiFetch<BackendCronograma[]>("/api/cronogramas/hoje");
  return cronogramas.map(toWorkout);
}

export async function createWorkout(payload: WorkoutPayload): Promise<Workout> {
  const cronograma = await apiFetch<BackendCronograma>("/api/cronogramas", {
    method: "POST",
    body: JSON.stringify(toBackend(payload)),
  });
  window.dispatchEvent(new Event("workouts:changed"));
  return toWorkout(cronograma);
}

export async function updateWorkout(id: string, payload: WorkoutPayload): Promise<Workout> {
  const cronograma = await apiFetch<BackendCronograma>(`/api/cronogramas/${id}`, {
    method: "PUT",
    body: JSON.stringify(toBackend(payload)),
  });
  window.dispatchEvent(new Event("workouts:changed"));
  return toWorkout(cronograma);
}

export async function deleteWorkout(id: string): Promise<void> {
  await apiFetch<void>(`/api/cronogramas/${id}`, { method: "DELETE" });
  window.dispatchEvent(new Event("workouts:changed"));
}
