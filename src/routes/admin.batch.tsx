import { createFileRoute } from "@tanstack/react-router";
import { useState, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Upload, FileText, ImagePlus, CheckCircle2, XCircle, Loader2, ChevronDown, ChevronUp } from "lucide-react";
import { parsePrompt } from "@/lib/parsePrompt";
import { mergeCopy } from "@/lib/defaults";
import { createLandingPage, uploadLandingImage } from "@/lib/supabase";
import type { LandingCopy } from "@/lib/types";

export const Route = createFileRoute("/admin/batch")({ component: BatchPage });

type BatchEntry = {
  slug: string;
  copy: Partial<LandingCopy>;
  detected: string[];
  images: Record<string, File>;
  status: "pending" | "creating" | "done" | "error";
  error?: string;
};

function parseBatchFile(text: string): BatchEntry[] {
  const blocks = text.split(/^===\s*$/m).map(b => b.trim()).filter(Boolean);
  return blocks.map(block => {
    const result = parsePrompt(block);
    return {
      slug: result.slug || `pagina-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      copy: result.copy,
      detected: result.detected,
      images: {},
      status: "pending",
    };
  });
}

export default function BatchPage() {
  const qc = useQueryClient();
  const copyInputRef = useRef<HTMLInputElement>(null);
  const imgInputRef = useRef<HTMLInputElement>(null);

  const [entries, setEntries] = useState<BatchEntry[]>([]);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  // ── Parse copy file ──────────────────────────────────────────────────────

  function handleCopyFile(file: File) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const parsed = parseBatchFile(text);
      if (!parsed.length) {
        toast.error("Nenhuma entrada encontrada. Use === como separador entre as copys.");
        return;
      }
      setEntries(parsed);
      toast.success(`${parsed.length} ${parsed.length === 1 ? "entrada detectada" : "entradas detectadas"}.`);
    };
    reader.readAsText(file, "utf-8");
  }

  // ── Map images by filename slug-section.ext ──────────────────────────────

  function handleImageFiles(files: FileList) {
    setEntries(prev => {
      const next = prev.map(e => ({ ...e, images: { ...e.images } }));
      Array.from(files).forEach(file => {
        const name = file.name.replace(/\.[^.]+$/, "").toLowerCase();
        const sections = ["logo", "hero", "about"];
        for (const section of sections) {
          if (name.endsWith(`-${section}`)) {
            const slug = name.slice(0, -(section.length + 1));
            const idx = next.findIndex(e => e.slug === slug);
            if (idx >= 0) next[idx].images[section] = file;
            break;
          }
        }
      });
      return next;
    });
    toast.success(`${files.length} ${files.length === 1 ? "imagem mapeada" : "imagens mapeadas"}.`);
  }

  // ── Create all ───────────────────────────────────────────────────────────

  async function runBatch() {
    setIsRunning(true);
    for (let i = 0; i < entries.length; i++) {
      const entry = entries[i];
      setEntries(prev => prev.map((e, j) => j === i ? { ...e, status: "creating" } : e));
      try {
        const mergedCopy = mergeCopy(entry.copy);
        const imageUrls: Record<string, string> = {};

        // Upload images first
        for (const [section, file] of Object.entries(entry.images)) {
          const url = await uploadLandingImage(entry.slug, section, file);
          imageUrls[section] = url;
        }

        await createLandingPage({
          slug: entry.slug,
          published: true,
          copy: mergedCopy,
          images: imageUrls,
          theme: "rose-gold",
        });

        setEntries(prev => prev.map((e, j) => j === i ? { ...e, status: "done" } : e));
      } catch (err) {
        setEntries(prev => prev.map((e, j) => j === i ? { ...e, status: "error", error: (err as Error).message } : e));
      }
    }
    setIsRunning(false);
    qc.invalidateQueries({ queryKey: ["landing-pages"] });
    toast.success("Processamento em lote concluído!");
  }

  const doneCount = entries.filter(e => e.status === "done").length;
  const errorCount = entries.filter(e => e.status === "error").length;
  const hasEntries = entries.length > 0;

  return (
    <div className="p-8 max-w-4xl">
      <div className="mb-10">
        <h1 className="font-serif text-3xl text-dark tracking-tight">Criação em Lote</h1>
        <p className="font-sans text-sm text-text-muted font-light mt-1">
          Crie múltiplas landing pages de uma vez com um arquivo de copy + imagens nomeadas.
        </p>
      </div>

      {/* Format guide */}
      <div className="bg-white border border-border rounded-2xl p-6 shadow-card mb-6">
        <h2 className="font-serif text-lg text-dark mb-4">Formatos aceitos</h2>
        <div className="grid sm:grid-cols-2 gap-6">
          <div>
            <p className="font-sans text-[11px] tracking-[0.2em] uppercase text-primary font-medium mb-2">Arquivo de copy (.txt)</p>
            <div className="bg-muted rounded-xl p-4 font-mono text-xs text-text-muted leading-relaxed">
              <span className="text-primary font-bold">===</span>{"\n"}
              Logo: Dra. Lara Ganem — Ginecologia{"\n"}
              CRM MG 90916 · RQE 54639{"\n"}
              (37) 99421-9291{"\n"}
              @dralaraganem{"\n"}
              ...{"\n"}
              {"\n"}
              <span className="text-primary font-bold">===</span>{"\n"}
              Logo: Dra. Juliana — Dermatologia{"\n"}
              ...
            </div>
          </div>
          <div>
            <p className="font-sans text-[11px] tracking-[0.2em] uppercase text-primary font-medium mb-2">Imagens (nomeação)</p>
            <div className="bg-muted rounded-xl p-4 font-mono text-xs text-text-muted leading-relaxed">
              <span className="text-dark">laraganem</span>-logo.png{"\n"}
              <span className="text-dark">laraganem</span>-hero.jpg{"\n"}
              <span className="text-dark">laraganem</span>-about.jpg{"\n"}
              {"\n"}
              <span className="text-dark">juliana</span>-logo.png{"\n"}
              <span className="text-dark">juliana</span>-hero.jpg{"\n"}
              {"\n"}
              <span className="text-text-muted/50 text-[10px]">slug = derivado do nome da médica</span>
            </div>
          </div>
        </div>
      </div>

      {/* Upload area */}
      <div className="grid sm:grid-cols-2 gap-4 mb-6">
        {/* Copy file */}
        <div
          onClick={() => copyInputRef.current?.click()}
          className="bg-white border-2 border-dashed border-border hover:border-primary/40 rounded-2xl p-8 cursor-pointer transition-colors text-center group"
        >
          <FileText className="size-8 text-primary/40 mx-auto mb-3 group-hover:text-primary/60 transition-colors" />
          <p className="font-sans text-sm font-medium text-dark">Arquivo de Copy</p>
          <p className="font-sans text-xs text-text-muted font-light mt-1">.txt com separador ===</p>
          {hasEntries && (
            <p className="mt-2 text-xs font-medium text-primary">{entries.length} entrada(s) carregada(s)</p>
          )}
          <input ref={copyInputRef} type="file" accept=".txt" className="hidden"
            onChange={e => { const f = e.target.files?.[0]; if (f) handleCopyFile(f); }} />
        </div>

        {/* Images */}
        <div
          onClick={() => imgInputRef.current?.click()}
          className={`bg-white border-2 border-dashed rounded-2xl p-8 cursor-pointer transition-colors text-center group ${hasEntries ? "border-border hover:border-primary/40" : "border-border/40 opacity-50 cursor-not-allowed"}`}
          style={{ pointerEvents: hasEntries ? "auto" : "none" }}
        >
          <ImagePlus className="size-8 text-primary/40 mx-auto mb-3 group-hover:text-primary/60 transition-colors" />
          <p className="font-sans text-sm font-medium text-dark">Imagens (opcional)</p>
          <p className="font-sans text-xs text-text-muted font-light mt-1">Múltiplos arquivos — slug-secao.ext</p>
          {Object.values(entries.flatMap(e => Object.keys(e.images))).length > 0 && (
            <p className="mt-2 text-xs font-medium text-primary">
              {entries.reduce((acc, e) => acc + Object.keys(e.images).length, 0)} imagem(ns) mapeada(s)
            </p>
          )}
          <input ref={imgInputRef} type="file" accept="image/*" multiple className="hidden"
            onChange={e => { if (e.target.files?.length) handleImageFiles(e.target.files); }} />
        </div>
      </div>

      {/* Entries preview */}
      {hasEntries && (
        <div className="bg-white border border-border rounded-2xl shadow-card overflow-hidden mb-6">
          <div className="px-6 py-4 border-b border-border flex items-center justify-between">
            <p className="font-sans text-sm font-medium text-dark">{entries.length} páginas para criar</p>
            <div className="flex gap-4 text-xs font-sans text-text-muted">
              {doneCount > 0 && <span className="text-emerald-600">✓ {doneCount} criada(s)</span>}
              {errorCount > 0 && <span className="text-destructive">✗ {errorCount} erro(s)</span>}
            </div>
          </div>
          <div className="divide-y divide-border">
            {entries.map((entry, i) => (
              <div key={i}>
                <button
                  onClick={() => setExpanded(expanded === i ? null : i)}
                  className="w-full flex items-center justify-between px-6 py-4 hover:bg-muted/40 transition-colors text-left"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {entry.status === "done" && <CheckCircle2 className="size-4 text-emerald-500 shrink-0" />}
                    {entry.status === "error" && <XCircle className="size-4 text-destructive shrink-0" />}
                    {entry.status === "creating" && <Loader2 className="size-4 text-primary animate-spin shrink-0" />}
                    {entry.status === "pending" && <div className="size-4 rounded-full border-2 border-border shrink-0" />}
                    <div className="min-w-0">
                      <p className="font-mono text-sm text-dark">/{entry.slug}</p>
                      <p className="font-sans text-xs text-text-muted font-light truncate">
                        {(entry.copy as LandingCopy)?.meta?.doctorName ?? "—"} · {(entry.copy as LandingCopy)?.meta?.specialty ?? "—"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="font-sans text-[10px] text-text-muted">{entry.detected.length} campos</span>
                    {Object.keys(entry.images).length > 0 && (
                      <span className="font-sans text-[10px] text-primary">{Object.keys(entry.images).length} img</span>
                    )}
                    {expanded === i ? <ChevronUp className="size-4 text-text-muted" /> : <ChevronDown className="size-4 text-text-muted" />}
                  </div>
                </button>
                {expanded === i && (
                  <div className="px-6 pb-5 bg-muted/30">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <p className="font-sans text-[10px] tracking-[0.2em] uppercase text-text-muted font-medium mb-2">Campos detectados</p>
                        <div className="flex flex-wrap gap-1.5">
                          {entry.detected.map(d => (
                            <span key={d} className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full">{d}</span>
                          ))}
                        </div>
                      </div>
                      <div>
                        <p className="font-sans text-[10px] tracking-[0.2em] uppercase text-text-muted font-medium mb-2">Imagens</p>
                        {Object.keys(entry.images).length ? (
                          <div className="flex gap-2">
                            {Object.entries(entry.images).map(([sec, file]) => (
                              <span key={sec} className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full">
                                {sec}: {file.name.slice(-12)}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs text-text-muted font-light">Sem imagens — usará padrão</p>
                        )}
                      </div>
                    </div>
                    {entry.error && (
                      <p className="mt-3 text-xs text-destructive font-medium">Erro: {entry.error}</p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action */}
      {hasEntries && !isRunning && doneCount < entries.length && (
        <button
          onClick={runBatch}
          className="w-full py-4 bg-dark text-white font-sans text-[11px] tracking-[0.25em] uppercase font-medium rounded-2xl hover:bg-dark/80 transition-colors shadow-sm"
        >
          Criar {entries.length - doneCount} página(s) agora →
        </button>
      )}
      {isRunning && (
        <div className="w-full py-4 bg-dark/60 text-white font-sans text-[11px] tracking-[0.25em] uppercase font-medium rounded-2xl flex items-center justify-center gap-3">
          <Loader2 className="size-4 animate-spin" />
          Criando páginas... {doneCount}/{entries.length}
        </div>
      )}
      {doneCount === entries.length && entries.length > 0 && !isRunning && (
        <div className="w-full py-4 bg-emerald-600 text-white font-sans text-[11px] tracking-[0.25em] uppercase font-medium rounded-2xl flex items-center justify-center gap-3">
          <CheckCircle2 className="size-4" /> {doneCount} página(s) criada(s) com sucesso
        </div>
      )}
    </div>
  );
}
