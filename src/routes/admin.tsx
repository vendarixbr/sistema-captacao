import { createFileRoute, Outlet, Link, useRouterState } from "@tanstack/react-router";
import { LayoutGrid, Plus, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin")({ component: AdminLayout });

function AdminLayout() {
  const { location } = useRouterState();
  const isNew = location.pathname === "/admin/new";
  const isList = location.pathname === "/admin/" || location.pathname === "/admin";

  return (
    <div className="min-h-screen flex bg-[#F4F0EB]">
      {/* Sidebar */}
      <aside className="w-64 shrink-0 flex flex-col" style={{ background: "linear-gradient(180deg, #2C1F1A 0%, #3D2A22 100%)" }}>
        {/* Brand */}
        <div className="px-6 pt-8 pb-6 border-b border-white/8">
          <div className="flex items-center gap-2.5 mb-1">
            <div className="size-7 rounded-lg bg-gradient-to-br from-[#B8865A] to-[#D4A96A] flex items-center justify-center">
              <Sparkles size={14} className="text-white" />
            </div>
            <span className="font-serif text-white text-base font-medium tracking-tight">beinflux</span>
          </div>
          <p className="font-sans text-[10px] tracking-[0.25em] uppercase text-white/35 font-light ml-9">Landing Generator</p>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-5 space-y-1">
          <p className="font-sans text-[9px] tracking-[0.3em] uppercase text-white/25 px-3 mb-3">Menu</p>
          <Link
            to="/admin"
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-sans font-medium transition-all duration-200",
              isList
                ? "bg-white/12 text-white shadow-sm"
                : "text-white/50 hover:bg-white/6 hover:text-white/80",
            )}
          >
            <LayoutGrid size={15} className={isList ? "text-[#D4A96A]" : ""} />
            Minhas Páginas
          </Link>
          <Link
            to="/admin/new"
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-sans font-medium transition-all duration-200",
              isNew
                ? "bg-white/12 text-white shadow-sm"
                : "text-white/50 hover:bg-white/6 hover:text-white/80",
            )}
          >
            <Plus size={15} className={isNew ? "text-[#D4A96A]" : ""} />
            Nova Página
          </Link>
        </nav>

        {/* Footer */}
        <div className="px-6 py-5 border-t border-white/8">
          <div className="flex items-center gap-2">
            <div className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <p className="font-sans text-[11px] text-white/30 font-light">Sistema ativo</p>
          </div>
          <p className="font-sans text-[10px] text-white/20 font-light mt-1">© {new Date().getFullYear()} beinflux</p>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 min-w-0 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
