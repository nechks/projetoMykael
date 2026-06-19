import { Category } from "./categories";
import { AppUser } from "./auth";
import { apiFetch } from "./auth";
import { categoryFromBackend, BackendModalidade } from "./workouts";

export interface ClassRecord {
  id: string;
  date: string;
  cronogramaId: string;
  professor: AppUser;
  category: Category;
  pilar: string;
  resumo: string;
  observacoes?: string;
  criadoEm: string;
}

export interface CreateClassRecordPayload {
  date: string;
  cronogramaId: string;
  resumo: string;
  observacoes?: string;
}

interface BackendRegistroAula {
  id: number;
  dataAula: string;
  cronogramaId: number;
  professor: {
    id: number;
    nome: string;
    login: string;
    perfil: "ADMIN" | "INSTRUTOR";
  };
  modalidade: BackendModalidade;
  pilar: string;
  resumo: string;
  observacoes?: string;
  criadoEm: string;
}

function toClassRecord(registro: BackendRegistroAula): ClassRecord {
  return {
    id: String(registro.id),
    date: registro.dataAula,
    cronogramaId: String(registro.cronogramaId),
    professor: {
      id: registro.professor.id,
      nome: registro.professor.nome,
      login: registro.professor.login,
      role: registro.professor.perfil === "ADMIN" ? "admin" : "user",
    },
    category: categoryFromBackend[registro.modalidade],
    pilar: registro.pilar,
    resumo: registro.resumo,
    observacoes: registro.observacoes,
    criadoEm: registro.criadoEm,
  };
}

export async function listClassRecordsByWeek(startDate: string): Promise<ClassRecord[]> {
  const registros = await apiFetch<BackendRegistroAula[]>(`/api/aulas/semana?inicio=${startDate}`);
  return registros.map(toClassRecord);
}

export async function createClassRecord(payload: CreateClassRecordPayload): Promise<ClassRecord> {
  const registro = await apiFetch<BackendRegistroAula>("/api/aulas", {
    method: "POST",
    body: JSON.stringify({
      dataAula: payload.date,
      cronogramaId: Number(payload.cronogramaId),
      resumo: payload.resumo.trim(),
      observacoes: payload.observacoes?.trim() || null,
    }),
  });

  window.dispatchEvent(new Event("classes:changed"));
  return toClassRecord(registro);
}

export async function deleteClassRecord(id: string): Promise<void> {
  await apiFetch<void>(`/api/aulas/${id}`, { method: "DELETE" });
  window.dispatchEvent(new Event("classes:changed"));
}
