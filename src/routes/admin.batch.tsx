import { createFileRoute } from "@tanstack/react-router";
import { useState, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  FileText, ImagePlus, CheckCircle2, XCircle, Loader2,
  ChevronDown, ChevronUp, AlertTriangle, Plus, Trash2, X,
  ChevronLeft,
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

// Parse raw pasted text with =chave= markers into FormProf[]
function parseRawInput(text: string): FormProf[] {
  const blocks = text.split(/^===\s*$/m).map(b => b.trim()).filter(Boolean);

  return blocks.map(block => {
    const prof = emptyProf();
    const pattern = /=([a-z0-9]+)=[ \t]*/gi;
    const matches = [...block.matchAll(pattern)];

    const sections = matches.map((m, i) => ({
      key: m[1].toLowerCase(),
      value: block.slice(
        (m.index ?? 0) + m[0].length,
        i + 1 < matches.length ? matches[i + 1].index : undefined,
      ).trim(),
    }));

    for (const { key, value } of sections) {
      switch (key) {
        case "nome": case "name":
          prof.nome = value; break;
        case "especialidade": case "esp": case "area": case "especialidadeprincipal":
          prof.especialidade = value; break;
        case "especialidade2": case "esp2": case "secundaria":
          prof.especialidade2 = value; break;
        case "whatsapp": case "tel": case "telefone": case "fone": case "zap":
          prof.whatsapp = value; break;
        case "instagram": case "ig": case "insta":
          prof.instagram = value ? (value.startsWith("@") ? value : "@" + value) : ""; break;
        case "crm": case "cro": case "crp": case "crefito": case "registro": case "conselho":
          prof.crm = value; break;
        case "headline":
          prof.headline = value; break;
        case "subtitulo": case "subtitle":
          prof.subtitulo = value; break;
        case "bio": case "sobre": case "texto": case "apresentacao": case "descricao":
          prof.bio = value; break;
        case "procedimentos": case "servicos": case "especialidades": case "areas": case "tratamentos":
          prof.procedimentos = value.split("\n")
            .map(l => l.replace(/^[-•*]\s*/, "").trim()).filter(Boolean)
            .map(l => {
              const m = l.match(/^(.+?)\s*[—–-]{1,2}\s*(.+)$/);
              return m ? { nome: m[1].trim(), desc: m[2].trim() } : { nome: l, desc: "" };
            });
          if (!prof.procedimentos.length) prof.procedimentos = [{ nome: "", desc: "" }];
          break;
        case "depoimentos": case "testimonials": {
          const lines = value.split("\n").map(l => l.trim());
          const deps: FormProf["depoimentos"] = [];
          let cur: { texto: string; autor: string; cargo: string } | null = null;
          for (const line of lines) {
            if (!line) { if (cur) { deps.push(cur); cur = null; } continue; }
            if (/^[—–-]\s/.test(line) && cur) {
              const clean = line.replace(/^[—–-]\s*/, "");
              const [autor, cargo] = clean.split(/\s*[|\/]\s*/);
              cur.autor = autor?.trim() ?? "";
              cur.cargo = cargo?.trim() ?? "";
              deps.push(cur); cur = null;
            } else {
              if (cur) deps.push(cur);
              cur = { texto: line.replace(/^[""]|[""]$/g, "").trim(), autor: "", cargo: "" };
            }
          }
          if (cur) deps.push(cur);
          prof.depoimentos = deps;
          break;
        }
        case "localizacao": case "local": case "consultorio": {
          const lLines = value.split("\n").map(l => l.trim()).filter(Boolean);
          for (const l of lLines) {
            if (/^(?:R\.|Rua|Av\.|Avenida|Pça\.)/i.test(l)) prof.endereco = l;
            else if (/,\s*\w+\s*-\s*[A-Z]{2}/i.test(l)) prof.cidade = l;
            else if (/Seg|Sáb|\dh\s*(às|a)\s*\d/i.test(l)) prof.horarios = l;
            else if (!prof.endereco && l.length > 8) prof.endereco = l;
          }
          break;
        }
        case "endereco": case "rua": case "address": prof.endereco = value; break;
        case "cidade": case "city": prof.cidade = value; break;
        case "horarios": case "horario": case "horas": prof.horarios = value; break;
      }
    }

    return prof;
  });
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
  const cls = "w-full bg-muted/40 border border-border/60 rounded-xl px-3.5 py-2.5 text-sm font-sans text-dark placeholder:text-text-muted/40 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all";
  return (
    <div className={span2 ? "sm:col-span-2" : ""}>
      <label className="font-sans text-[11px] tracking-[0.15em] uppercase text-text-muted block mb-1.5">{label}</label>
      {textarea
        ? <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={3} className={cls + " resize-none"} />
        : <input type="text" value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} className={cls} />}
    </div>
  );
}

// ── ProfCard ──────────────────────────────────────────────────────────────────

function ProfCard({ prof, index, expanded, onToggle, onRemove, onUpdate, onUpdateList, onAddList, onRemoveList, onImg }: {
  prof: FormProf; index: number; expanded: boolean;
  onToggle: () => void; onRemove: () => void;
  onUpdate: <K extends keyof FormProf>(k: K, v: FormProf[K]) => void;
  onUpdateList: (lk: "procedimentos" | "depoimentos", i: number, f: string, v: string) => void;
  onAddList: (lk: "procedimentos" | "depoimentos") => void;
  onRemoveList: (lk: "procedimentos" | "depoimentos", i: number) => void;
  onImg: (s: "logo" | "hero" | "about", f: File | undefined) => void;
}) {
  const imgLabels = { logo: "Logo", hero: "Foto Hero", about: "Foto Sobre" };

  return (
    <div className="bg-white border border-border rounded-2xl shadow-card overflow-hidden">
      <div className="flex items-center gap-3 px-5 py-4">
        <button onClick={onToggle} className="flex items-center gap-3 flex-1 min-w-0 text-left">
          <div className="size-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <span className="font-sans text-[11px] font-medium text-primary">{index + 1}</span>
          </div>
          <div className="min-w-0">
            <p className="font-sans text-sm font-medium text-dark truncate">{prof.nome || "Profissional sem nome"}</p>
            {prof.especialidade && <p className="font-sans text-[12px] text-text-muted">{prof.especialidade}{prof.especialidade2 ? ` & ${prof.especialidade2}` : ""}</p>}
          </div>
        </button>
        <div className="flex items-center gap-1 shrink-0">
          {prof.whatsapp && <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full">WA</span>}
          {Object.values(prof.images).some(Boolean) && <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full">img</span>}
          <button onClick={onRemove} className="text-text-muted hover:text-destructive transition-colors p-1 ml-1"><Trash2 className="size-4" /></button>
          <button onClick={onToggle} className="text-text-muted p-1">
            {expanded ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
          </button>
        </div>
      </div>

      {expanded && (
        <div className="border-t border-border/40 p-5 space-y-6">

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
              {prof.procedimentos.map((pr, i) => (
                <div key={i} className="flex gap-2">
                  <input value={pr.nome} onChange={e => onUpdateList("procedimentos", i, "nome", e.target.value)}
                    placeholder="Nome do procedimento"
                    className="flex-1 bg-muted/40 border border-border/60 rounded-lg px-3 py-2 text-sm font-sans text-dark focus:outline-none focus:border-primary" />
                  <input value={pr.desc} onChange={e => onUpdateList("procedimentos", i, "desc", e.target.value)}
                    placeholder="Descrição breve"
                    className="flex-1 bg-muted/40 border border-border/60 rounded-lg px-3 py-2 text-sm font-sans text-dark focus:outline-none focus:border-primary" />
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
            {prof.depoimentos.length === 0
              ? <p className="text-xs text-text-muted font-light">Sem depoimentos — usará os padrões da especialidade.</p>
              : (
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
                          placeholder="Nome da paciente"
                          className="flex-1 bg-white border border-border/60 rounded-lg px-3 py-1.5 text-sm font-sans text-dark focus:outline-none focus:border-primary" />
                        <input value={dep.cargo} onChange={e => onUpdateList("depoimentos", i, "cargo", e.target.value)}
                          placeholder="Ex: Paciente há 2 anos"
                          className="flex-1 bg-white border border-border/60 rounded-lg px-3 py-1.5 text-sm font-sans text-dark focus:outline-none focus:border-primary" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
          </div>

          {/* Localização */}
          <div>
            <p className="font-sans text-[10px] tracking-[0.2em] uppercase text-primary font-medium mb-3">Localização (opcional)</p>
            <div className="grid sm:grid-cols-2 gap-3">
              <Field label="Endereço" value={prof.endereco} onChange={v => onUpdate("endereco", v)} placeholder="Rua X, 123 — Bairro" />
              <Field label="Cidade — Estado" value={prof.cidade} onChange={v => onUpdate("cidade", v)} placeholder="Centro, Cidade - MG" />
              <Field label="Horários" value={prof.horarios} onChange={v => onUpdate("horarios", v)} placeholder="Seg a Sex — 08h às 18h" span2 />
            </div>
          </div>

          {/* Imagens */}
          <div>
            <p className="font-sans text-[10px] tracking-[0.2em] uppercase text-primary font-medium mb-3">Imagens</p>
            <div className="grid grid-cols-3 gap-3">
              {(["logo", "hero", "about"] as const).map(sec => {
                const file = prof.images[sec];
                const url = file ? URL.createObjectURL(file) : null;
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
                        <div className="w-full h-full flex flex-col items-center justify-center gap-1 text-text-muted/50 hover:text-primary transition-colors">
                          <ImagePlus className="size-5" />
                          <span className="font-sans text-[9px] tracking-[0.15em] uppercase">{imgLabels[sec]}</span>
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
  const [formPhase, setFormPhase] = useState<"paste" | "edit">("paste");
  const [rawInput, setRawInput] = useState("");
  const [profissionais, setProfissionais] = useState<FormProf[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [entries, setEntries] = useState<BatchEntry[]>([]);
  const [expandedEntry, setExpandedEntry] = useState<number | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [batchPagemode, setBatchPagemode] = useState<"landing" | "multipage">("landing");

  // ── Form handlers ──────────────────────────────────────────────────────────

  function handleParse() {
    if (!rawInput.trim()) { toast.error("Cole as informações primeiro."); return; }
    const parsed = parseRawInput(rawInput);
    const valid = parsed.filter(p => p.nome.trim());
    if (!valid.length) { toast.error("Nenhum profissional encontrado. Use =nome= para identificar cada um."); return; }
    setProfissionais(valid);
    setExpandedId(valid[0]?.id ?? null);
    setEntries([]);
    setFormPhase("edit");
    toast.success(`${valid.length} profissional(is) extraído(s) com sucesso!`);
  }

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

  function handleGenerateEntries() {
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

  // ── Run batch ──────────────────────────────────────────────────────────────

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
        <p className="font-sans text-sm text-text-muted font-light mt-1">Cole as informações, gere os cards, crie as páginas.</p>
      </div>

      {/* Mode tabs */}
      <div className="flex bg-muted rounded-xl p-1 mb-6 w-fit">
        {(["form", "upload"] as const).map(mode => (
          <button key={mode} onClick={() => { setBatchMode(mode); setEntries([]); setFormPhase("paste"); }}
            className={`px-5 py-2.5 rounded-lg font-sans text-[12px] tracking-[0.15em] uppercase transition-all ${batchMode === mode ? "bg-white text-dark shadow-sm font-medium" : "text-text-muted hover:text-dark"}`}>
            {mode === "form" ? "Cola & Gera" : "Upload .txt"}
          </button>
        ))}
      </div>

      {/* ── COLA & GERA — fase paste ── */}
      {batchMode === "form" && formPhase === "paste" && (
        <div className="space-y-4 mb-6">
          <div className="bg-white border border-border rounded-2xl shadow-card overflow-hidden">
            <div className="px-5 py-4 border-b border-border/50">
              <p className="font-sans text-sm font-medium text-dark">Cole as informações dos profissionais</p>
              <p className="font-sans text-xs text-text-muted font-light mt-0.5">
                Use <code className="bg-muted px-1.5 py-0.5 rounded text-primary font-mono text-[11px]">=chave=</code> para cada campo.
                Separe múltiplos profissionais com <code className="bg-muted px-1.5 py-0.5 rounded text-primary font-mono text-[11px]">===</code> em linha separada.
              </p>
            </div>

            {/* Formato de referência */}
            <details className="border-b border-border/40">
              <summary className="font-sans text-[11px] tracking-[0.2em] uppercase text-text-muted cursor-pointer px-5 py-3 hover:text-dark hover:bg-muted/30 transition-all select-none">
                Ver formato aceito ▾
              </summary>
              <div className="px-5 pb-4 pt-2">
                <pre className="bg-muted rounded-xl p-4 font-mono text-[11px] text-text-muted leading-relaxed overflow-x-auto whitespace-pre">{`=nome= Dra. Maria Silva
=especialidade= Ginecologia
=especialidade2= Obstetrícia          ← opcional
=whatsapp= (37) 99999-9999
=instagram= @dramariasilva           ← opcional
=crm= CRM MG 12345 · RQE 678        ← opcional
=bio= Apresentação da profissional... ← opcional, auto-gerado se vazio
=procedimentos=
Consulta de rotina — Exames preventivos completos.
Pré-natal — Acompanhamento especializado da gestação.
Saúde Hormonal
=localizacao=
Rua X, 123 — Centro, Cidade - MG
Seg a Sex — 08h às 18h

===

=nome= Dr. João Santos
=especialidade= Cardiologia
...`}</pre>
                <p className="font-sans text-[11px] text-text-muted/60 mt-2">
                  Campos não preenchidos são gerados automaticamente pela especialidade detectada.
                </p>
              </div>
            </details>

            <div className="p-4">
              <textarea
                value={rawInput}
                onChange={e => setRawInput(e.target.value)}
                placeholder={`=nome= Dra. Maria Silva\n=especialidade= Ginecologia\n=whatsapp= (37) 99999-9999\n=bio= Sou ginecologista...\n=procedimentos=\nConsulta de rotina — Descrição\nPré-natal — Descrição\n\n===\n\n=nome= Dr. João Santos\n=especialidade= Cardiologia\n=whatsapp= (11) 99999-9999`}
                rows={18}
                className="w-full bg-muted/30 border border-border/60 rounded-xl px-4 py-3 font-mono text-sm text-dark placeholder:text-text-muted/30 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 resize-y transition-all"
              />
            </div>
            <div className="px-4 pb-4">
              <button onClick={handleParse}
                className="w-full py-4 bg-dark text-white font-sans text-[11px] tracking-[0.3em] uppercase font-medium rounded-2xl hover:bg-dark/80 transition-colors shadow-sm">
                Gerar Profissionais →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── COLA & GERA — fase edit ── */}
      {batchMode === "form" && formPhase === "edit" && (
        <div className="space-y-3 mb-6">
          <div className="flex items-center justify-between mb-2">
            <button onClick={() => { setFormPhase("paste"); setEntries([]); }}
              className="flex items-center gap-1.5 text-sm text-text-muted hover:text-dark transition-colors">
              <ChevronLeft className="size-4" /> Editar texto colado
            </button>
            <span className="font-sans text-xs text-text-muted font-light">
              {profissionais.length} profissional(is) • clique no card para editar
            </span>
          </div>

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
            className="w-full py-3 border-2 border-dashed border-primary/30 rounded-2xl text-primary font-sans text-[12px] tracking-[0.2em] uppercase hover:border-primary/60 hover:bg-primary/5 transition-all flex items-center justify-center gap-2">
            <Plus className="size-4" /> Adicionar profissional
          </button>

          <button onClick={handleGenerateEntries}
            className="w-full py-4 bg-dark text-white font-sans text-[11px] tracking-[0.3em] uppercase font-medium rounded-2xl hover:bg-dark/80 transition-colors shadow-sm">
            Gerar Preview das Páginas →
          </button>
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
          <div onClick={() => entries.length > 0 ? imgInputRef.current?.click() : undefined}
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
                        {Object.keys(entry.images).length
                          ? <div className="flex gap-2 flex-wrap">{Object.entries(entry.images).map(([sec, file]) => <span key={sec} className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full">{sec}: {file.name.slice(-14)}</span>)}</div>
                          : <p className="text-xs text-text-muted font-light">Sem imagens</p>}
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
