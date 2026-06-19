export type Role = "admin" | "user";

export interface AuthUser {
  id: number;
  nome: string;
  login: string;
  role: Role;
  authHeader: string;
}

export interface AppUser {
  id: number;
  nome: string;
  login: string;
  role: Role;
}

export interface CreateUserPayload {
  nome: string;
  login: string;
  senha: string;
  role: Role;
}

const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:8080";
const SESSION_KEY = "ct_auth_user";

type BackendPerfil = "ADMIN" | "INSTRUTOR";

interface BackendUsuario {
  id: number;
  nome: string;
  login: string;
  perfil: BackendPerfil;
}

interface LoginResponse {
  usuario: BackendUsuario;
}

interface ApiError {
  mensagem?: string;
}

function toRole(perfil: BackendPerfil): Role {
  return perfil === "ADMIN" ? "admin" : "user";
}

function toPerfil(role: Role): BackendPerfil {
  return role === "admin" ? "ADMIN" : "INSTRUTOR";
}

function toAppUser(usuario: BackendUsuario): AppUser {
  return {
    id: usuario.id,
    nome: usuario.nome,
    login: usuario.login,
    role: toRole(usuario.perfil),
  };
}

async function readError(response: Response): Promise<string> {
  try {
    const body = (await response.json()) as ApiError;
    return body.mensagem ?? "Nao foi possivel concluir a operacao.";
  } catch {
    return "Nao foi possivel concluir a operacao.";
  }
}

export async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const user = getUser();
  const headers = new Headers(init.headers);
  headers.set("Content-Type", "application/json");

  if (user?.authHeader) {
    headers.set("Authorization", user.authHeader);
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers,
  });

  if (!response.ok) {
    throw new Error(await readError(response));
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export async function login(loginValue: string, senha: string): Promise<AuthUser | null> {
  const login = loginValue.trim().toLowerCase();
  const authHeader = `Basic ${btoa(`${login}:${senha}`)}`;

  const response = await fetch(`${API_BASE}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ login, senha }),
  });

  if (!response.ok) return null;

  const data = (await response.json()) as LoginResponse;
  const auth: AuthUser = {
    ...toAppUser(data.usuario),
    authHeader,
  };

  localStorage.setItem(SESSION_KEY, JSON.stringify(auth));
  return auth;
}

export function logout() {
  if (typeof window !== "undefined") localStorage.removeItem(SESSION_KEY);
}

export function getUser(): AuthUser | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(SESSION_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

export async function listUsers(): Promise<AppUser[]> {
  const users = await apiFetch<BackendUsuario[]>("/api/usuarios");
  return users.map(toAppUser);
}

export async function createUser(payload: CreateUserPayload): Promise<AppUser> {
  const usuario = await apiFetch<BackendUsuario>("/api/usuarios", {
    method: "POST",
    body: JSON.stringify({
      nome: payload.nome.trim(),
      login: payload.login.trim().toLowerCase(),
      senha: payload.senha,
      perfil: toPerfil(payload.role),
    }),
  });

  window.dispatchEvent(new Event("users:changed"));
  return toAppUser(usuario);
}
