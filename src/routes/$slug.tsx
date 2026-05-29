import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { getLandingPageBySlug } from "@/lib/supabase";
import { LandingTemplate } from "@/components/LandingTemplate";
import { mergeCopy, DEFAULT_IMAGES } from "@/lib/defaults";
import type { LandingCopy } from "@/lib/types";

export const Route = createFileRoute("/$slug")({
  component: SlugPage,
});

function SlugPage() {
  const { slug } = Route.useParams();

  const { data: page, isLoading, error } = useQuery({
    queryKey: ["landing-page-public", slug],
    queryFn: () => getLandingPageBySlug(slug),
    retry: false,
  });

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-text-muted text-sm font-light">Carregando...</p>
        </div>
      </div>
    );
  }

  if (error || !page) {
    return <NotFound slug={slug} />;
  }

  const copy = mergeCopy(page.copy as Partial<LandingCopy>);
  const images = { ...DEFAULT_IMAGES, ...page.images };

  return <LandingTemplate copy={copy} images={images} theme={page.theme} />;
}

function NotFound({ slug }: { slug: string }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-warm px-4">
      <div className="max-w-md text-center">
        <div className="mb-6">
          <span className="font-display text-8xl text-primary/20 font-bold">404</span>
        </div>
        <h1 className="font-display text-3xl text-dark mb-3">Página não encontrada</h1>
        <p className="text-text-muted font-light leading-relaxed mb-2">
          A landing page{" "}
          <code className="bg-muted border border-border rounded px-1.5 py-0.5 text-sm font-mono">
            /{slug}
          </code>{" "}
          não existe ou ainda não foi publicada.
        </p>
        <p className="text-text-muted/60 text-sm font-light mb-8">
          Se você é o administrador, verifique se a página está publicada no painel admin.
        </p>
        <a
          href="/admin"
          className="inline-flex items-center px-6 py-2.5 bg-primary text-white text-[11px] tracking-[0.25em] uppercase hover:bg-primary-dark transition-colors"
        >
          Ir para o Admin
        </a>
      </div>
    </div>
  );
}
