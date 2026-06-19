import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { getUser } from "@/lib/auth";

export const Route = createFileRoute("/")({
  component: IndexRedirect,
});

function IndexRedirect() {
  const navigate = useNavigate();
  useEffect(() => {
    const u = getUser();
    if (!u) navigate({ to: "/login", replace: true });
    else navigate({ to: u.role === "admin" ? "/admin" : "/schedule", replace: true });
  }, [navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background text-muted-foreground">
      Carregando…
    </div>
  );
}
