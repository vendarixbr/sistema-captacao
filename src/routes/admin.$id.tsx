import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { getLandingPageById } from "@/lib/supabase";
import { LandingForm } from "@/components/LandingForm";

export const Route = createFileRoute("/admin/$id")({
  component: AdminEdit,
});

function AdminEdit() {
  const { id } = Route.useParams();

  const {
    data: page,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["landing-page", id],
    queryFn: () => getLandingPageById(id),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64 text-text-muted text-sm">
        Carregando...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-6 text-center">
          <p className="text-destructive font-medium">Erro ao carregar a página</p>
          <p className="text-destructive/70 text-sm mt-1 font-light">{(error as Error).message}</p>
        </div>
      </div>
    );
  }

  if (!page) {
    return (
      <div className="p-8">
        <div className="bg-muted border border-border rounded-xl p-6 text-center">
          <p className="text-dark font-medium">Página não encontrada</p>
          <p className="text-text-muted text-sm mt-1 font-light">
            A página com ID &ldquo;{id}&rdquo; não existe.
          </p>
        </div>
      </div>
    );
  }

  return <LandingForm mode="edit" page={page} />;
}
