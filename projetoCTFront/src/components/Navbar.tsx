import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { Calendar, CalendarDays, LogOut, Settings } from "lucide-react";
import { getUser, logout } from "@/lib/auth";
import logoUrl from "../../icone/WhatsApp Image 2026-06-09 at 14.47.39.jpeg";


export function Navbar() {
  const navigate = useNavigate();
  const user = typeof window !== "undefined" ? getUser() : null;
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  if (pathname === "/login" || pathname === "/") return null;

  const handleLogout = () => {
    logout();
    navigate({ to: "/login" });
  };

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link to="/schedule" className="flex items-center gap-2">
          <img src={logoUrl} alt="EMANUELAFELIZ" className="h-10 w-10 rounded-full object-contain" />
          <span className="font-display text-xl">EMANUELAFELIZ</span>
        </Link>


        <nav className="flex items-center gap-1">
          <Link
            to="/schedule"
            className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground transition hover:bg-secondary hover:text-foreground"
            activeProps={{ className: "flex items-center gap-2 rounded-md px-3 py-2 text-sm bg-secondary text-foreground" }}
          >
            <Calendar className="h-4 w-4" />
            <span className="hidden sm:inline">Cronograma</span>
          </Link>
          <Link
            to="/calendar"
            className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground transition hover:bg-secondary hover:text-foreground"
            activeProps={{ className: "flex items-center gap-2 rounded-md px-3 py-2 text-sm bg-secondary text-foreground" }}
          >
            <CalendarDays className="h-4 w-4" />
            <span className="hidden sm:inline">Calendario</span>
          </Link>
          {user?.role === "admin" && (
            <Link
              to="/admin"
              className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground transition hover:bg-secondary hover:text-foreground"
              activeProps={{ className: "flex items-center gap-2 rounded-md px-3 py-2 text-sm bg-secondary text-foreground" }}
            >
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">Admin</span>
            </Link>
          )}
          <button
            onClick={handleLogout}
            className="ml-2 flex items-center gap-2 rounded-md border border-border px-3 py-2 text-sm text-muted-foreground transition hover:bg-secondary hover:text-foreground"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Sair</span>
          </button>
        </nav>
      </div>
    </header>
  );
}
