import { createFileRoute, Outlet, Link, useRouterState } from "@tanstack/react-router";
import { LayoutDashboard, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin")({
  component: AdminLayout,
});

function AdminLayout() {
  const { location } = useRouterState();

  return (
    <div className="min-h-screen bg-muted flex">
      {/* Sidebar */}
      <aside className="w-60 shrink-0 bg-white border-r border-border flex flex-col">
        {/* Brand */}
        <div className="px-6 py-5 border-b border-border">
          <p className="font-display text-base font-semibold text-dark leading-none">
            Landing Generator
          </p>
          <p className="text-[11px] tracking-widest uppercase text-primary font-medium mt-1">
            beinflux
          </p>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          <Link
            to="/admin"
            className={cn(
              "flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
              location.pathname === "/admin"
                ? "bg-primary/10 text-primary"
                : "text-text-muted hover:bg-muted hover:text-dark",
            )}
          >
            <LayoutDashboard size={16} />
            Minhas Páginas
          </Link>
          <Link
            to="/admin/new"
            className={cn(
              "flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
              location.pathname === "/admin/new"
                ? "bg-primary/10 text-primary"
                : "text-text-muted hover:bg-muted hover:text-dark",
            )}
          >
            <Plus size={16} />
            Nova Página
          </Link>
        </nav>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border">
          <p className="text-[11px] text-text-muted font-light">
            &copy; {new Date().getFullYear()} beinflux
          </p>
        </div>
      </aside>

      {/* Content */}
      <main className="flex-1 min-w-0 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
