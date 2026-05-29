import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getLandingPages, deleteLandingPage } from "@/lib/supabase";
import { Plus, ExternalLink, Pencil, Trash2, Globe, FileText } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const Route = createFileRoute("/admin/")({
  component: AdminIndex,
});

function AdminIndex() {
  const qc = useQueryClient();
  const navigate = useNavigate();

  const { data: pages, isLoading, error } = useQuery({
    queryKey: ["landing-pages"],
    queryFn: getLandingPages,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteLandingPage,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["landing-pages"] });
      toast.success("Página deletada com sucesso.");
    },
    onError: (err: Error) => {
      toast.error(`Erro ao deletar: ${err.message}`);
    },
  });

  function handleDelete(id: string, slug: string) {
    if (!confirm(`Tem certeza que deseja deletar a página "/${slug}"? Esta ação é irreversível.`)) {
      return;
    }
    deleteMutation.mutate(id);
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl text-dark">Minhas Páginas</h1>
          <p className="text-text-muted text-sm font-light mt-1">
            Gerencie todas as landing pages do sistema.
          </p>
        </div>
        <Link
          to="/admin/new"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white text-sm font-medium hover:bg-primary-dark transition-colors"
        >
          <Plus size={16} />
          Nova Página
        </Link>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="text-center py-20 text-text-muted text-sm">Carregando...</div>
      ) : error ? (
        <div className="text-center py-20">
          <p className="text-destructive text-sm">{(error as Error).message}</p>
          <p className="text-text-muted text-xs mt-2 font-light">
            Verifique se as variáveis de ambiente do Supabase estão configuradas.
          </p>
        </div>
      ) : !pages?.length ? (
        <div className="text-center py-20 border border-dashed border-border rounded-xl">
          <FileText className="mx-auto text-text-muted/50 mb-4" size={40} />
          <p className="text-dark font-medium mb-1">Nenhuma página criada ainda</p>
          <p className="text-text-muted text-sm font-light mb-6">
            Crie sua primeira landing page para começar.
          </p>
          <Link
            to="/admin/new"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white text-sm font-medium hover:bg-primary-dark transition-colors"
          >
            <Plus size={16} />
            Criar primeira página
          </Link>
        </div>
      ) : (
        <div className="bg-white border border-border rounded-xl overflow-hidden shadow-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Slug</TableHead>
                <TableHead>Médica</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Criado em</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pages.map((page) => (
                <TableRow key={page.id}>
                  <TableCell>
                    <span className="font-mono text-sm text-dark">/{page.slug}</span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-dark">
                      {page.copy?.meta?.doctorName ?? "—"}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge variant={page.published ? "default" : "secondary"}>
                      {page.published ? "Publicada" : "Rascunho"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-text-muted font-light">
                      {new Date(page.created_at).toLocaleDateString("pt-BR")}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => navigate({ to: "/admin/$id", params: { id: page.id } })}
                        className="p-1.5 text-text-muted hover:text-dark hover:bg-muted rounded transition-colors"
                        title="Editar"
                      >
                        <Pencil size={15} />
                      </button>
                      <a
                        href={`/${page.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 text-text-muted hover:text-primary hover:bg-muted rounded transition-colors"
                        title="Preview"
                      >
                        <ExternalLink size={15} />
                      </a>
                      <button
                        onClick={() => handleDelete(page.id, page.slug)}
                        disabled={deleteMutation.isPending}
                        className="p-1.5 text-text-muted hover:text-destructive hover:bg-destructive/10 rounded transition-colors disabled:opacity-50"
                        title="Deletar"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {pages && pages.length > 0 && (
        <p className="text-text-muted text-xs font-light mt-4 text-right">
          {pages.length} {pages.length === 1 ? "página" : "páginas"} no total ·{" "}
          {pages.filter((p) => p.published).length} publicada(s)
        </p>
      )}
    </div>
  );
}
