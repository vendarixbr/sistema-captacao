import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getLandingPages, deleteLandingPage } from "@/lib/supabase";
import { Plus, ExternalLink, Pencil, Trash2, FileText, Globe, Clock } from "lucide-react";
import { toast } from "sonner";
import { getTheme } from "@/lib/themes";

export const Route = createFileRoute("/admin/")({ component: AdminIndex });

function AdminIndex() {
  const qc = useQueryClient();
  const navigate = useNavigate();

  const { data: pages, isLoading, error } = useQuery({
    queryKey: ["landing-pages"],
    queryFn: getLandingPages,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteLandingPage,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["landing-pages"] }); toast.success("Página deletada."); },
    onError: (err: Error) => toast.error(`Erro ao deletar: ${err.message}`),
  });

  const published = pages?.filter((p) => p.published).length ?? 0;
  const total = pages?.length ?? 0;

  return (
    <div className="p-8 max-w-6xl">
      {/* Header */}
      <div className="flex items-start justify-between mb-10">
        <div>
          <h1 className="font-serif text-3xl text-dark tracking-tight">Minhas Páginas</h1>
          <p className="font-sans text-sm text-text-muted font-light mt-1">Gerencie todas as landing pages do sistema.</p>
        </div>
        <Link to="/admin/new"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-dark text-white font-sans text-[11px] tracking-[0.2em] uppercase font-medium rounded-xl hover:bg-dark/80 transition-colors shadow-sm">
          <Plus size={14} /> Nova Página
        </Link>
      </div>

      {/* Stats */}
      {total > 0 && (
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: "Total de páginas", value: total, icon: FileText },
            { label: "Publicadas", value: published, icon: Globe },
            { label: "Rascunhos", value: total - published, icon: Clock },
          ].map((s) => (
            <div key={s.label} className="bg-white border border-border rounded-2xl p-5 shadow-card">
              <div className="flex items-center justify-between mb-2">
                <span className="font-sans text-[10px] tracking-[0.2em] uppercase text-text-muted font-medium">{s.label}</span>
                <s.icon size={14} className="text-primary" />
              </div>
              <p className="font-serif text-3xl text-dark">{s.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Content */}
      {isLoading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1,2,3].map(i => (
            <div key={i} className="bg-white border border-border rounded-2xl h-48 animate-pulse" />
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-20 bg-white border border-border rounded-2xl">
          <p className="text-destructive text-sm font-medium">{(error as Error).message}</p>
          <p className="text-text-muted text-xs mt-2 font-light">Verifique as variáveis de ambiente do Supabase.</p>
        </div>
      ) : !pages?.length ? (
        <div className="text-center py-24 bg-white border-2 border-dashed border-border rounded-2xl">
          <div className="size-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <FileText size={24} className="text-primary" />
          </div>
          <p className="font-serif text-xl text-dark mb-1">Nenhuma página ainda</p>
          <p className="font-sans text-sm text-text-muted font-light mb-6">Crie sua primeira landing page.</p>
          <Link to="/admin/new"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-dark text-white font-sans text-[11px] tracking-[0.2em] uppercase rounded-xl hover:bg-dark/80 transition-colors">
            <Plus size={14} /> Criar agora
          </Link>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {pages.map((page) => {
            const theme = getTheme(page.theme);
            const primaryColor = Object.keys(theme.vars).length > 0
              ? theme.vars["--primary"] ?? "#B8865A"
              : "#B8865A";
            return (
              <div key={page.id} className="group bg-white border border-border rounded-2xl overflow-hidden shadow-card hover:shadow-premium transition-all duration-300 hover:-translate-y-0.5">
                {/* Preview strip */}
                <div className="h-24 relative overflow-hidden" style={{ backgroundColor: theme.preview.bg }}>
                  <div className="absolute inset-0" style={{ background: `radial-gradient(ellipse at 80% 20%, ${theme.preview.primary}22 0%, transparent 60%), radial-gradient(ellipse at 20% 80%, ${theme.preview.secondary}18 0%, transparent 60%)` }} />
                  {page.images?.logo ? (
                    <img src={page.images.logo} alt="" className="absolute inset-0 m-auto h-10 w-auto object-contain" />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <p className="font-serif text-base" style={{ color: primaryColor }}>{page.copy?.meta?.doctorName?.split(" ").slice(0,3).join(" ") ?? page.slug}</p>
                    </div>
                  )}
                  {/* Theme dot */}
                  <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-white/80 backdrop-blur-sm rounded-full px-2.5 py-1 border border-white/60">
                    <div className="size-2 rounded-full" style={{ backgroundColor: primaryColor }} />
                    <span className="font-sans text-[9px] tracking-wide text-dark/60">{theme.name}</span>
                  </div>
                </div>

                {/* Info */}
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <div className="min-w-0">
                      <p className="font-sans text-sm font-medium text-dark truncate">
                        {page.copy?.meta?.doctorName ?? "Sem nome"}
                      </p>
                      <p className="font-mono text-[11px] text-text-muted font-light">/{page.slug}</p>
                    </div>
                    <span className={`shrink-0 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-sans font-medium ${page.published ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-muted text-text-muted border border-border"}`}>
                      {page.published ? "• Publicada" : "Rascunho"}
                    </span>
                  </div>
                  <p className="font-sans text-[11px] text-text-muted font-light mb-4">{page.copy?.meta?.specialty ?? "—"}</p>

                  <div className="flex items-center gap-1 pt-3 border-t border-border">
                    <button onClick={() => navigate({ to: "/admin/$id", params: { id: page.id } })}
                      className="flex-1 flex items-center justify-center gap-1.5 py-1.5 text-[11px] font-sans text-text-muted hover:text-dark hover:bg-muted rounded-lg transition-colors">
                      <Pencil size={12} /> Editar
                    </button>
                    <a href={`/${page.slug}`} target="_blank" rel="noopener noreferrer"
                      className="flex-1 flex items-center justify-center gap-1.5 py-1.5 text-[11px] font-sans text-text-muted hover:text-primary hover:bg-primary/5 rounded-lg transition-colors">
                      <ExternalLink size={12} /> Ver
                    </a>
                    <button onClick={() => { if(confirm(`Deletar "/${page.slug}"?`)) deleteMutation.mutate(page.id); }}
                      disabled={deleteMutation.isPending}
                      className="flex-1 flex items-center justify-center gap-1.5 py-1.5 text-[11px] font-sans text-text-muted hover:text-destructive hover:bg-destructive/5 rounded-lg transition-colors disabled:opacity-40">
                      <Trash2 size={12} /> Deletar
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Add new card */}
          <Link to="/admin/new"
            className="group border-2 border-dashed border-border rounded-2xl flex flex-col items-center justify-center gap-3 p-6 min-h-[200px] hover:border-primary/40 hover:bg-primary/3 transition-all duration-200">
            <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/15 transition-colors">
              <Plus size={18} className="text-primary" />
            </div>
            <p className="font-sans text-sm font-medium text-text-muted group-hover:text-dark transition-colors">Nova Página</p>
          </Link>
        </div>
      )}
    </div>
  );
}
