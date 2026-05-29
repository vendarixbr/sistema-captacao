import { QueryClient } from "@tanstack/react-query";
import { Outlet, createRootRouteWithContext } from "@tanstack/react-router";
import { Toaster } from "@/components/ui/sonner";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="font-serif text-7xl text-primary">404</h1>
        <h2 className="mt-4 font-serif text-2xl text-dark">Página não encontrada</h2>
        <p className="mt-2 text-sm text-text-muted font-light">
          A página que você procura não existe ou foi movida.
        </p>
        <div className="mt-6">
          <a
            href="/admin"
            className="inline-flex items-center justify-center px-6 py-2.5 bg-primary text-white text-[11px] tracking-[0.25em] uppercase"
          >
            Ir para o Admin
          </a>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error }: { error: Error; reset: () => void }) {
  console.error(error);
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="font-serif text-2xl text-dark">Algo deu errado</h1>
        <p className="mt-2 text-sm text-text-muted font-light">{error.message}</p>
        <div className="mt-6 flex justify-center gap-2">
          <a
            href="/"
            className="px-6 py-2.5 border border-primary text-primary text-[11px] tracking-[0.25em] uppercase"
          >
            Início
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  component: () => (
    <>
      <Outlet />
      <Toaster />
    </>
  ),
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});
