import { createFileRoute } from "@tanstack/react-router";
import { useState, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  FileText, ImagePlus, CheckCircle2, XCircle, Loader2,
  ChevronDown, ChevronUp, AlertTriangle, Plus, Trash2, X, User,
} from "lucide-react";
import { parsePrompt } from "@/lib/parsePrompt";
import { mergeCopy } from "@/lib/defaults";
import { createLandingPage, uploadLandingImage } from "@/lib/supabase";
import type { LandingCopy } from "@/lib/types";

export const Route = createFileRoute("/admin/batch")({ component: BatchPage });

// ── Types ─────────────────────────────────────────────────────────────────────

type CriticalField = { field: string; label: string };

type BatchEntry = {
  slug: string;
  copy: Partial<LandingCopy>;
  detected: string[];
  missing: CriticalField[];
  images: Record<string, File>;
  status: "pending" | "creating" | "done" | "error";
  error?: string;
};

type FormProf = {
  id: string;
  nome: string;
  especialidade: string;
  especialidade2: string;
  whatsapp: string;
  instagram: string;
  crm: string;
  headline: string;
  subtitulo: string;
  bio: string;
  endereco: string;
  cidade: string;
  horarios: string;
  procedimentos: { nome: string; desc: string }[];
  depoimentos: { texto: string; autor: string; cargo: string }[];
  images: { logo?: File; hero?: File; about?: File };
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function uid() { return Math.random().toString(36).slice(2, 9); }

function emptyProf(): FormProf {
  return {
    id: uid(), nome: "", especialidade: "", especialidade2: "",
    whatsapp: "", instagram: "", crm: "",
    headline: "", subtitulo: "", bio: "",
    endereco: "", cidade: "", horarios: "",
    procedimentos: [{ nome: "", desc: "" }],
    depoimentos: [],
    images: {},
  };
}

function profToText(p: FormProf): string {
  const lines: string[] = [];
  const esp2 = p.especialidade2 ? ` & ${p.especialidade2}` : "";
  lines.push(`Logo: ${p.nome}${p.especialidade ? ` — ${p.especialidade}${esp2}` : ""}`);
  if (p.crm) lines.push(p.crm);
  if (p.whatsapp) lines.push(`WhatsApp: ${p.whatsapp}`);
  if (p.instagram) lines.push(`Instagram: ${p.instagram.startsWith("@") ? p.instagram : "@" + p.instagram}`);
  lines.push("\nSEÇÃO 1 — HERO");
  const label = [p.especialidade, p.especialidade2].filter(Boolean).join(" · ");
  if (label) lines.push(`Tag/Label: ${label}`);
  if (p.headline) lines.push(`Headline: ${p.headline}`);
  if (p.subtitulo) lines.push(`Subtítulo: ${p.subtitulo}`);
  lines.push("\nSEÇÃO 3 — SOBRE");
  if (p.bio) lines.push(`Texto: ${p.bio}`);
  const validProc = p.procedimentos.filter(pr => pr.nome);
  if (validProc.length) {
    lines.push("\nSEÇÃO 4 — ESPECIALIDADES");
    validProc.forEach(pr => lines.push(`- ${pr.nome}${pr.desc ? ` — ${pr.desc}` : ""}`));
  }
  const validDep = p.depoimentos.filter(d => d.texto);
  if (validDep.length) {
    lines.push("\nSEÇÃO 5 — DEPOIMENTOS");
    validDep.forEach(d => {
      lines.push(`"${d.texto}"`);
      if (d.autor) lines.push(`— ${d.autor}${d.cargo ? ` | ${d.cargo}` : ""}`);
    });
  }
  if (p.endereco || p.cidade) {
    lines.push("\nSEÇÃO 6 — LOCALIZAÇÃO");
    if (p.endereco) lines.push(p.endereco);
    if (p.cidade) lines.push(p.cidade);
    if (p.horarios) lines.push(`Seg a Sex — ${p.horarios}`);
  }
  return lines.join("\n");
}

function getMissing(copy: Partial<LandingCopy>): CriticalField[] {
  const m: CriticalField[] = [];
  if (!copy.meta?.doctorName) m.push({ field: "nome", label: "Nome" });
  if (!copy.meta?.whatsapp) m.push({ field: "whatsapp", label: "WhatsApp" });
  if (!copy.meta?.specialty) m.push({ field: "especialidade", label: "Especialidade" });
  if (!copy.sobre?.text) m.push({ field: "bio", label: "Bio" });
  if (!copy.localizacao?.address) m.push({ field: "endereco", label: "Endereço" });
  return m;
}

function parseBatchFile(text: string): BatchEntry[] {
  return text.split(/^===\s*$/m).map(b => b.trim()).filter(Boolean).map(block => {
    const result = parsePrompt(block);
    return {
      slug: result.slug || `pagina-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      copy: result.copy, detected: result.detected,
      missing: getMissing(result.copy), images: {}, status: "pending",
    };
  });
}

// ── Field component ───────────────────────────────────────────────────────────

function Field({ label, value, onChange, placeholder, textarea, span2 }: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder?: string; textarea?: boolean; span2?: boolean;
}) {
  const cls = "w-full bg-muted/40 border border-border/60 rounded-xl px-3.5 py-2.5 text-sm font-sans text-dark placeholder:text-text-muted/50 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all";
  return (
    <div className={span2 ? "sm:col-span-2" : ""}>
      <label className="font-sans text-[11px] tracking-[0.15em] uppercase text-text-muted block mb-1.5">{label}</label>
      {textarea
        ? <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={3} className={cls + " resize-none"} />
        : <input type="text" value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} className={cls} />}
    </div>
  );
}

// ── ProfCard component ────────────────────────────────────────────────────────

function ProfCard({ prof, index, expanded, onToggle, onRemove, onUpdate, onUpdateList, onAddList, onRemoveList, onImg }: {
  prof: FormProf; index: number; expanded: boolean;
  onToggle: () => void; onRemove: () => void;
  onUpdate: <K extends keyof FormProf>(k: K, v: FormProf[K]) => void;
  onUpdateList: (lk: "procedimentos" | "depoimentos", i: number, f: string, v: string) => void;
  onAddList: (lk: "procedimentos" | "depoimentos") => void;
  onRemoveList: (lk: "procedimentos" | "depoimentos", i: number) => void;
  onImg: (s: "logo" | "hero" | "about", f: File | undefined) => void;
}) {
  return (
    <div className="bg-white border border-border rounded-2xl shadow-card overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-4">
        <button onClick={onToggle} className="flex items-center gap-3 flex-1 min-w-0 text-left">
          <div className="size-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <span className="font-sans text-[11px] font-medium text-primary">{index + 1}</span>
          </div>
          <div className="min-w-0">
            <p className="font-sans text-sm font-medium text-dark truncate">{prof.nome || "Novo profissional"}</p>
            {prof.especialidade && <p className="font-sans text-[12px] text-text-muted">{prof.especialidade}</p>}
          </div>
        </button>
        <button onClick={onRemove} className="text-text-muted hover:text-destructive transition-colors p-1 shrink-0"><Trash2 className="size-4" /></button>
        <button onClick={onToggle} className="text-text-muted p-1 shrink-0">
          {expanded ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
        </button>
      </div>

      {expanded && (
        <div className="border-t border-border/50 p-5 space-y-6">

          {/* Básico */}
          <div>
            <p className="font-sans text-[10px] tracking-[0.2em] uppercase text-primary font-medium mb-3">Informações Básicas</p>
            <div className="grid sm:grid-cols-2 gap-3">
              <Field label="Nome*" value={prof.nome} onChange={v => onUpdate("nome", v)} placeholder="Dra. Nome Sobrenome" />
              <Field label="Especialidade*" value={prof.especialidade} onChange={v => onUpdate("especialidade", v)} placeholder="Ginecologia" />
              <Field label="Especialidade secundária" value={prof.especialidade2} onChange={v => onUpdate("especialidade2", v)} placeholder="Obstetrícia (opcional)" />
              <Field label="WhatsApp*" value={prof.whatsapp} onChange={v => onUpdate("whatsapp", v)} placeholder="(37) 99999-9999" />
              <Field label="Instagram" value={prof.instagram} onChange={v => onUpdate("instagram", v)} placeholder="@handle" />
              <Field label="CRM / Registro" value={prof.crm} onChange={v => onUpdate("crm", v)} placeholder="CRM MG 12345 · RQE 678" />
            </div>
          </div>

          {/* Conteúdo */}
          <div>
            <p className="font-sans text-[10px] tracking-[0.2em] uppercase text-primary font-medium mb-3">Conteúdo</p>
            <div className="grid sm:grid-cols-2 gap-3">
              <Field label="Headline (opcional)" value={prof.headline} onChange={v => onUpdate("headline", v)} placeholder="Auto-gerada pela especialidade" />
              <Field label="Subtítulo (opcional)" value={prof.subtitulo} onChange={v => onUpdate("subtitulo", v)} placeholder="Auto-gerado" />
              <Field label="Bio / Sobre" value={prof.bio} onChange={v => onUpdate("bio", v)} placeholder="Apresentação da profissional — auto-gerada se vazia" textarea span2 />
            </div>
          </div>

          {/* Procedimentos */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="font-sans text-[10px] tracking-[0.2em] uppercase text-primary font-medium">Procedimentos / Serviços</p>
              <button onClick={() => onAddList("procedimentos")} className="flex items-center gap-1 text-[11px] text-primary hover:opacity-70 transition-opacity">
                <Plus className="size-3" /> Adicionar
              </button>
            </div>
            <div className="space-y-2">
              {prof.procedimentos.map((proc, i) => (
                <div key={i} className="flex gap-2">
                  <input value={proc.nome} onChange={e => onUpdateList("procedimentos", i, "nome", e.target.value)}
                    placeholder="Nome" className="flex-1 bg-muted/40 border border-border/60 rounded-lg px-3 py-2 text-sm font-sans text-dark focus:outline-none focus:border-primary" />
                  <input value={proc.desc} onChange={e => onUpdateList("procedimentos", i, "desc", e.target.value)}
                    placeholder="Descrição breve" className="flex-1 bg-muted/40 border border-border/60 rounded-lg px-3 py-2 text-sm font-sans text-dark focus:outline-none focus:border-primary" />
                  <button onClick={() => onRemoveList("procedimentos", i)} className="text-text-muted hover:text-destructive p-1 shrink-0"><Trash2 className="size-3.5" /></button>
                </div>
              ))}
            </div>
          </div>

          {/* Depoimentos */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="font-sans text-[10px] tracking-[0.2em] uppercase text-primary font-medium">Depoimentos (opcional)</p>
              <button onClick={() => onAddList("depoimentos")} className="flex items-center gap-1 text-[11px] text-primary hover:opacity-70 transition-opacity">
                <Plus className="size-3" /> Adicionar
              </button>
            </div>
            <div className="space-y-3">
              {prof.depoimentos.map((dep, i) => (
                <div key={i} className="bg-muted/30 rounded-xl p-3 space-y-2">
                  <div className="flex gap-2">
                    <textarea value={dep.texto} onChange={e => onUpdateList("depoimentos", i, "texto", e.target.value)}
                      placeholder="Texto do depoimento" rows={2}
                      className="flex-1 bg-white border border-border/60 rounded-lg px-3 py-2 text-sm font-sans text-dark focus:outline-none focus:border-primary resize-none" />
                    <button onClick={() => onRemoveList("depoimentos", i)} className="text-text-muted hover:text-destructive p-1 shrink-0 self-start"><Trash2 className="size-3.5" /></button>
                  </div>
                  <div className="flex gap-2">
                    <input value={dep.autor} onChange={e => onUpdateList("depoimentos", i, "autor", e.target.value)}
                      placeholder="Nome da paciente" className="flex-1 bg-white border border-border/60 rounded-lg px-3 py-1.5 text-sm font-sans text-dark focus:outline-none focus:border-primary" />
                    <input value={dep.cargo} onChange={e => onUpdateList("depoimentos", i, "cargo", e.target.value)}
                      placeholder="Ex: Paciente há 2 anos" className="flex-1 bg-white border border-border/60 rounded-lg px-3 py-1.5 text-sm font-sans text-dark focus:outline-none focus:border-primary" />
                  </div>
                </div>
              ))}
              {prof.depoimentos.length === 0 && (
                <p className="text-xs text-text-muted font-light">Sem depoimentos — serão usados os padrões da especialidade.</p>
              )}
            </div>
          </div>

          {/* Localização */}
          <div>
            <p className="font-sans text-[10px] tracking-[0.2em] uppercase text-primary font-medium mb-3">Localização (opcional)</p>
            <div className="grid sm:grid-cols-2 gap-3">
              <Field label="Endereço" value={prof.endereco} onChange={v => onUpdate("endereco", v)} placeholder="Rua X, 123 — Bairro" />
              <Field label="Cidade — Estado" value={prof.cidade} onChange={v => onUpdate("cidade", v)} placeholder="Centro, Cidade - MG" />
              <Field label="Horários" value={prof.horarios} onChange={v => onUpdate("horarios", v)} placeholder="08h às 18h | Sábados sob consulta" span2 />
            </div>
          </div>

          {/* Imagens */}
          <div>
            <p className="font-sans text-[10px] tracking-[0.2em] uppercase text-primary font-medium mb-3">Imagens</p>
            <div className="grid grid-cols-3 gap-3">
              {(["logo", "hero", "about"] as const).map(sec => {
                const file = prof.images[sec];
                const url = file ? URL.createObjectURL(file) : null;
                const labels = { logo: "Logo", hero: "Foto Hero", about: "Foto Sobre" };
                return (
                  <label key={sec} className="cursor-pointer block">
                    <div className={`relative rounded-xl border-2 aspect-square overflow-hidden transition-all ${file ? "border-primary/50" : "border-dashed border-border hover:border-primary/40"}`}>
                      {url ? (
                        <>
                          <img src={url} alt={sec} className="w-full h-full object-cover" />
                          <button type="button" onClick={e => { e.preventDefault(); onImg(sec, undefined); }}
                            className="absolute top-1 right-1 size-5 rounded-full bg-dark/60 text-white flex items-center justify-center hover:bg-destructive transition-colors">
                            <X className="size-3" />
                          </button>
                        </>
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center gap-1 text-text-muted/60 hover:text-primary transition-colors">
                          <ImagePlus className="size-5" />
                          <span className="font-sans text-[9px] tracking-[0.15em] uppercase">{labels[sec]}</span>
                        </div>
                      )}
                    </div>
                    <input type="file" accept="image/*" className="hidden"
                      onChange={e => { const f = e.target.files?.[0]; if (f) onImg(sec, f); }} />
                  </label>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function BatchPage() {
  const qc = useQueryClient();
  const copyInputRef = useRef<HTMLInputElement>(null);
  const imgInputRef = useRef<HTMLInputElement>(null);

  const [batchMode, setBatchMode] = useState<"form" | "upload">("form");
  const [profissionais, setProfissionais] = useState<FormProf[]>(() => [emptyProf()]);
  const [expandedId, setExpandedId] = useState<string | null>(() => profissionais[0]?.id ?? null);
  const [entries, setEntries] = useState<BatchEntry[]>([]);
  const [expandedEntry, setExpandedEntry] = useState<number | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [batchPagemode, setBatchPagemode] = useState<"landing" | "multipage">("landing");

  // ── Form handlers ──────────────────────────────────────────────────────────

  function updateProf<K extends keyof FormProf>(id: string, key: K, value: FormProf[K]) {
    setProfissionais(prev => prev.map(p => p.id === id ? { ...p, [key]: value } : p));
  }

  function updateList(profId: string, lk: "procedimentos" | "depoimentos", idx: number, field: string, value: string) {
    setProfissionais(prev => prev.map(p => {
      if (p.id !== profId) return p;
      const list = (p[lk] as Record<string, string>[]).map((item, i) => i === idx ? { ...item, [field]: value } : item);
      return { ...p, [lk]: list };
    }));
  }

  function addList(profId: string, lk: "procedimentos" | "depoimentos") {
    const blank = lk === "procedimentos" ? { nome: "", desc: "" } : { texto: "", autor: "", cargo: "" };
    setProfissionais(prev => prev.map(p => p.id === profId ? { ...p, [lk]: [...(p[lk] as object[]), blank] } : p));
  }

  function removeList(profId: string, lk: "procedimentos" | "depoimentos", idx: number) {
    setProfissionais(prev => prev.map(p => p.id === profId ? { ...p, [lk]: (p[lk] as object[]).filter((_, i) => i !== idx) } : p));
  }

  function updateImg(profId: string, sec: "logo" | "hero" | "about", file: File | undefined) {
    setProfissionais(prev => prev.map(p => p.id === profId ? { ...p, images: { ...p.images, [sec]: file } } : p));
  }

  function handleGenerate() {
    const valid = profissionais.filter(p => p.nome.trim());
    if (!valid.length) { toast.error("Preencha o nome de pelo menos um profissional."); return; }
    const generated: BatchEntry[] = valid.map(p => {
      const result = parsePrompt(profToText(p));
      const slug = result.slug || p.nome.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[.\s]+/g, "-").replace(/[^a-z0-9-]/g, "").replace(/-+/g, "-");
      const images: Record<string, File> = {};
      if (p.images.logo) images.logo = p.images.logo;
      if (p.images.hero) images.hero = p.images.hero;
      if (p.images.about) images.about = p.images.about;
      return { slug, copy: result.copy, detected: result.detected, missing: getMissing(result.copy), images, status: "pending" };
    });
    setEntries(generated);
    setExpandedEntry(null);
    toast.success(`${generated.length} entrada(s) gerada(s)!`);
  }

  // ── Upload handlers ────────────────────────────────────────────────────────

  function handleCopyFile(file: File) {
    const reader = new FileReader();
    reader.onload = e => {
      const parsed = parseBatchFile(e.target?.result as string);
      if (!parsed.length) { toast.error("Nenhuma entrada. Use === como separador."); return; }
      setEntries(parsed);
      toast.success(`${parsed.length} entrada(s) detectada(s).`);
    };
    reader.readAsText(file, "utf-8");
  }

  function handleImageFiles(files: FileList) {
    setEntries(prev => {
      const next = prev.map(e => ({ ...e, images: { ...e.images } }));
      Array.from(files).forEach(file => {
        const name = file.name.replace(/\.[^.]+$/, "").toLowerCase();
        for (const sec of ["logo", "hero", "about"]) {
          if (name.endsWith(`-${sec}`)) {
            const slug = name.slice(0, -(sec.length + 1));
            const idx = next.findIndex(e => e.slug === slug);
            if (idx >= 0) next[idx].images[sec] = file;
            break;
          }
        }
      });
      return next;
    });
    toast.success(`${files.length} imagem(ns) mapeada(s).`);
  }

  // ── Run ────────────────────────────────────────────────────────────────────

  async function runBatch() {
    setIsRunning(true);
    for (let i = 0; i < entries.length; i++) {
      const entry = entries[i];
      setEntries(prev => prev.map((e, j) => j === i ? { ...e, status: "creating" } : e));
      try {
        const mergedCopy = mergeCopy(entry.copy);
        const imageUrls: Record<string, string> = {};
        for (const [sec, file] of Object.entries(entry.images)) {
          imageUrls[sec] = await uploadLandingImage(entry.slug, sec as "logo" | "hero" | "about", file);
        }
        await createLandingPage({ slug: entry.slug, published: true, copy: mergedCopy, images: imageUrls, theme: "rose-gold", pagemode: batchPagemode });
        setEntries(prev => prev.map((e, j) => j === i ? { ...e, status: "done" } : e));
      } catch (err) {
        setEntries(prev => prev.map((e, j) => j === i ? { ...e, status: "error", error: (err as Error).message } : e));
      }
    }
    setIsRunning(false);
    qc.invalidateQueries({ queryKey: ["landing-pages"] });
    toast.success("Processamento concluído!");
  }

  const doneCount = entries.filter(e => e.status === "done").length;
  const errorCount = entries.filter(e => e.status === "error").length;

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="p-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="font-serif text-3xl text-dark tracking-tight">Criação em Lote</h1>
        <p className="font-sans text-sm text-text-muted font-light mt-1">Crie múltiplas landing pages de uma vez.</p>
      </div>

      {/* Mode tabs */}
      <div className="flex bg-muted rounded-xl p-1 mb-6 w-fit">
        {([["form", "Formulário", User], ["upload", "Upload .txt", FileText]] as const).map(([mode, label, Icon]) => (
          <button key={mode} onClick={() => { setBatchMode(mode as "form" | "upload"); setEntries([]); }}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-sans text-[12px] tracking-[0.15em] uppercase transition-all ${batchMode === mode ? "bg-white text-dark shadow-sm font-medium" : "text-text-muted hover:text-dark"}`}>
            <Icon className="size-4" />{label}
          </button>
        ))}
      </div>

      {/* ── FORM MODE ── */}
      {batchMode === "form" && (
        <div className="space-y-3 mb-6">
          {profissionais.map((prof, idx) => (
            <ProfCard
              key={prof.id} prof={prof} index={idx}
              expanded={expandedId === prof.id}
              onToggle={() => setExpandedId(expandedId === prof.id ? null : prof.id)}
              onRemove={() => {
                if (profissionais.length === 1) return;
                setProfissionais(prev => prev.filter(p => p.id !== prof.id));
                if (expandedId === prof.id) setExpandedId(null);
              }}
              onUpdate={(k, v) => updateProf(prof.id, k, v)}
              onUpdateList={(lk, i, f, v) => updateList(prof.id, lk, i, f, v)}
              onAddList={lk => addList(prof.id, lk)}
              onRemoveList={(lk, i) => removeList(prof.id, lk, i)}
              onImg={(sec, file) => updateImg(prof.id, sec, file)}
            />
          ))}

          <button
            onClick={() => { const p = emptyProf(); setProfissionais(prev => [...prev, p]); setExpandedId(p.id); }}
            className="w-full py-3.5 border-2 border-dashed border-primary/30 rounded-2xl text-primary font-sans text-[12px] tracking-[0.2em] uppercase hover:border-primary/60 hover:bg-primary/5 transition-all flex items-center justify-center gap-2"
          >
            <Plus className="size-4" /> Adicionar Profissional
          </button>

          {profissionais.some(p => p.nome.trim()) && (
            <button onClick={handleGenerate}
              className="w-full py-4 bg-dark text-white font-sans text-[11px] tracking-[0.25em] uppercase font-medium rounded-2xl hover:bg-dark/80 transition-colors shadow-sm">
              Gerar Preview →
            </button>
          )}
        </div>
      )}

      {/* ── UPLOAD MODE ── */}
      {batchMode === "upload" && (
        <div className="grid sm:grid-cols-2 gap-4 mb-6">
          <div onClick={() => copyInputRef.current?.click()}
            className="bg-white border-2 border-dashed border-border hover:border-primary/40 rounded-2xl p-8 cursor-pointer transition-colors text-center group">
            <FileText className="size-8 text-primary/40 mx-auto mb-3 group-hover:text-primary/60 transition-colors" />
            <p className="font-sans text-sm font-medium text-dark">Arquivo de Copy</p>
            <p className="font-sans text-xs text-text-muted font-light mt-1">.txt com separador ===</p>
            {entries.length > 0 && <p className="mt-2 text-xs font-medium text-primary">{entries.length} entrada(s)</p>}
            <input ref={copyInputRef} type="file" accept=".txt" className="hidden"
              onChange={e => { const f = e.target.files?.[0]; if (f) handleCopyFile(f); }} />
          </div>
          <div
            onClick={() => entries.length > 0 ? imgInputRef.current?.click() : undefined}
            className={`bg-white border-2 border-dashed rounded-2xl p-8 transition-colors text-center group ${entries.length > 0 ? "border-border hover:border-primary/40 cursor-pointer" : "border-border/40 opacity-50"}`}>
            <ImagePlus className="size-8 text-primary/40 mx-auto mb-3 group-hover:text-primary/60 transition-colors" />
            <p className="font-sans text-sm font-medium text-dark">Imagens (opcional)</p>
            <p className="font-sans text-xs text-text-muted font-light mt-1">slug-secao.ext — múltiplos arquivos</p>
            <input ref={imgInputRef} type="file" accept="image/*" multiple className="hidden"
              onChange={e => { if (e.target.files?.length) handleImageFiles(e.target.files); }} />
          </div>
        </div>
      )}

      {/* ── PREVIEW ── */}
      {entries.length > 0 && (
        <div className="bg-white border border-border rounded-2xl shadow-card overflow-hidden mb-6">
          <div className="px-6 py-4 border-b border-border flex items-center justify-between">
            <p className="font-sans text-sm font-medium text-dark">{entries.length} página(s) para criar</p>
            <div className="flex gap-4 text-xs font-sans">
              {doneCount > 0 && <span className="text-emerald-600">✓ {doneCount} criada(s)</span>}
              {errorCount > 0 && <span className="text-destructive">✗ {errorCount} erro(s)</span>}
            </div>
          </div>
          <div className="divide-y divide-border">
            {entries.map((entry, i) => (
              <div key={i}>
                <button onClick={() => setExpandedEntry(expandedEntry === i ? null : i)}
                  className="w-full flex items-center justify-between px-6 py-4 hover:bg-muted/40 transition-colors text-left">
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
                    {entry.missing.length > 0 && entry.status === "pending" && (
                      <span className="flex items-center gap-1 text-[10px] text-amber-600 font-medium">
                        <AlertTriangle className="size-3" />{entry.missing.length}
                      </span>
                    )}
                    <span className="font-sans text-[10px] text-text-muted">{entry.detected.length} campos</span>
                    {Object.keys(entry.images).length > 0 && <span className="font-sans text-[10px] text-primary">{Object.keys(entry.images).length} img</span>}
                    {expandedEntry === i ? <ChevronUp className="size-4 text-text-muted" /> : <ChevronDown className="size-4 text-text-muted" />}
                  </div>
                </button>
                {expandedEntry === i && (
                  <div className="px-6 pb-5 bg-muted/30 space-y-4">
                    {entry.missing.length > 0 && (
                      <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
                        <p className="font-sans text-[10px] tracking-[0.2em] uppercase text-amber-700 font-medium mb-2 flex items-center gap-1">
                          <AlertTriangle className="size-3" /> Gerados automaticamente pela especialidade
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {entry.missing.map(m => <span key={m.field} className="text-[10px] bg-amber-100 text-amber-800 border border-amber-300 px-2 py-0.5 rounded-full">{m.label}</span>)}
                        </div>
                      </div>
                    )}
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <p className="font-sans text-[10px] tracking-[0.2em] uppercase text-text-muted font-medium mb-2">Detectados</p>
                        <div className="flex flex-wrap gap-1.5">
                          {entry.detected.map(d => <span key={d} className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full">{d}</span>)}
                        </div>
                      </div>
                      <div>
                        <p className="font-sans text-[10px] tracking-[0.2em] uppercase text-text-muted font-medium mb-2">Imagens</p>
                        {Object.keys(entry.images).length ? (
                          <div className="flex gap-2 flex-wrap">
                            {Object.entries(entry.images).map(([sec, file]) => (
                              <span key={sec} className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full">{sec}: {file.name.slice(-14)}</span>
                            ))}
                          </div>
                        ) : <p className="text-xs text-text-muted font-light">Sem imagens</p>}
                      </div>
                    </div>
                    {entry.error && <p className="text-xs text-destructive font-medium">Erro: {entry.error}</p>}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── MODO + CRIAR ── */}
      {entries.length > 0 && (
        <div className="space-y-4">
          <div className="bg-white border border-border rounded-2xl p-5 shadow-card">
            <p className="font-sans text-sm font-medium text-dark mb-3">Modo de exibição</p>
            <div className="flex gap-3">
              {(["landing", "multipage"] as const).map(mode => (
                <button key={mode} onClick={() => setBatchPagemode(mode)}
                  className={`flex-1 rounded-xl border-2 px-4 py-3 text-left transition-all ${batchPagemode === mode ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"}`}>
                  <p className="font-sans text-[12px] font-medium text-dark">{mode === "landing" ? "Landing Page" : "Multipage"}</p>
                  <p className="font-sans text-[11px] text-text-muted font-light mt-0.5">{mode === "landing" ? "Scroll contínuo" : "Abas de navegação"}</p>
                </button>
              ))}
            </div>
          </div>

          {!isRunning && doneCount < entries.length && (
            <button onClick={runBatch} className="w-full py-4 bg-dark text-white font-sans text-[11px] tracking-[0.25em] uppercase font-medium rounded-2xl hover:bg-dark/80 transition-colors shadow-sm">
              Criar {entries.length - doneCount} página(s) agora →
            </button>
          )}
          {isRunning && (
            <div className="w-full py-4 bg-dark/60 text-white font-sans text-[11px] tracking-[0.25em] uppercase font-medium rounded-2xl flex items-center justify-center gap-3">
              <Loader2 className="size-4 animate-spin" /> Criando... {doneCount}/{entries.length}
            </div>
          )}
          {doneCount === entries.length && entries.length > 0 && !isRunning && (
            <div className="w-full py-4 bg-emerald-600 text-white font-sans text-[11px] tracking-[0.25em] uppercase font-medium rounded-2xl flex items-center justify-center gap-3">
              <CheckCircle2 className="size-4" /> {doneCount} página(s) criada(s) com sucesso
            </div>
          )}
        </div>
      )}
    </div>
  );
}
