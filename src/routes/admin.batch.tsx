import { createFileRoute } from "@tanstack/react-router";
import { useState, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import * as XLSX from "xlsx";
import {
  FileText, ImagePlus, CheckCircle2, XCircle, Loader2,
  ChevronDown, ChevronUp, AlertTriangle, Plus, Trash2, X,
  ChevronLeft, Sparkles, MapPin, Table2,
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

// ── Smart extractor ───────────────────────────────────────────────────────────

const SPECIALTY_MAP: [RegExp, string][] = [
  [/ginecolog/i, "Ginecologia"],
  [/obstetri|pr[eé].?natal/i, "Obstetrícia"],
  [/dermatolog/i, "Dermatologia"],
  [/ortoped/i, "Ortopedia"],
  [/cardiol/i, "Cardiologia"],
  [/pediatr/i, "Pediatria"],
  [/odontolog|dentist|dental|odonto\b/i, "Odontologia"],
  [/fisioter/i, "Fisioterapia"],
  [/psicolog|psicoter/i, "Psicologia"],
  [/nutri/i, "Nutrição"],
  [/oftalmo/i, "Oftalmologia"],
  [/endocrin/i, "Endocrinologia"],
  [/neurolog/i, "Neurologia"],
  [/harmoniz|orofacial|buco/i, "Harmonização Orofacial"],
  [/cirurgi.*pl[aá]stic|pl[aá]stic.*cirurgi/i, "Cirurgia Plástica"],
  [/est[eé]tic|medicina est[eé]tic/i, "Estética"],
  [/reumatolog/i, "Reumatologia"],
  [/geriatr/i, "Geriatria"],
  [/cl[ií]nica m[eé]dic|cl[ií]nico geral|medicina interna/i, "Clínica Médica"],
];

function detectSpecialty(text: string): string {
  for (const [re, name] of SPECIALTY_MAP) {
    if (re.test(text)) return name;
  }
  return "";
}

function smartExtract(rawText: string): FormProf[] {
  // Split blocks by === OR by detecting a new doctor name after some content
  const rawBlocks = rawText.split(/^===\s*$/m).map(b => b.trim()).filter(Boolean);

  return rawBlocks.map(block => {
    const prof = emptyProf();
    const full = block;

    // ── Name: Dra. / Dr. prefix ──────────────────────────────────────────────
    const nameMatch = full.match(/\b(Dra?\.\s+[\wÀ-ÿ][\wÀ-ÿ\s]{2,40}?)(?=\s*(?:,|$|\n|Rua|Av\.|CRM|@|\d{8,}))/i);
    if (nameMatch) {
      prof.nome = nameMatch[1].trim().replace(/[,;.]+$/, "");
    } else {
      // Try without prefix — first capitalized sequence on first line
      const firstLine = full.split("\n")[0];
      const capMatch = firstLine.match(/^([A-ZÀÁÂÃÉÊÍÓÔÕÚÜÇ][a-záàâãéêíóôõúüçñ]+(?:\s+[A-ZÀÁÂÃÉÊÍÓÔÕÚÜÇ][a-záàâãéêíóôõúüçñ]+){1,3})/);
      if (capMatch && !capMatch[1].match(/^(?:Rua|Av\.|Avenida)/i)) {
        prof.nome = capMatch[1].trim();
      }
    }

    // ── WhatsApp / phone ─────────────────────────────────────────────────────
    const phones = [...full.matchAll(/(?<!\d)(\(?\d{2}\)?\s?[\d\s.-]{8,13})(?!\d)/g)];
    for (const m of phones) {
      const digits = m[1].replace(/\D/g, "");
      if (digits.length >= 10 && digits.length <= 13) {
        prof.whatsapp = digits;
        break;
      }
    }
    if (!prof.whatsapp) {
      // bare number like 43998392579
      const bare = full.match(/(?<!\d)(\d{10,11})(?!\d)/);
      if (bare) prof.whatsapp = bare[1];
    }

    // ── Instagram ────────────────────────────────────────────────────────────
    const igMatch = full.match(/(?:instagram\.com\/|@)([\w.]+)/i);
    if (igMatch) prof.instagram = "@" + igMatch[1].replace(/\/+$/, "");

    // ── CRM / professional council ───────────────────────────────────────────
    const crmMatch = full.match(/\b(CRM|CRO|CRP|CREFITO|CFM)\s+[A-Z]{0,2}\s*\d[\d\s./-]*(?:·\s*RQE\s*[\d]+)?/i);
    if (crmMatch) prof.crm = crmMatch[0].trim();

    // ── Address ──────────────────────────────────────────────────────────────
    const addrMatch = full.match(/(?:Rua|R\.|Av\.|Avenida|Al\.|Alameda|Pça\.|Praça|Estrada)\s+[\wÀ-ÿ\s,]+\d+[\wÀ-ÿ\s,—–-]*/i);
    if (addrMatch) prof.endereco = addrMatch[0].trim().replace(/[,\s]+$/, "");

    // ── City ─────────────────────────────────────────────────────────────────
    const cityMatch = full.match(/[\wÀ-ÿ\s]+-\s*[A-Z]{2}(?:,\s*\d{5}-?\d{3})?/);
    if (cityMatch && cityMatch[0].trim() !== prof.endereco) {
      prof.cidade = cityMatch[0].trim();
    }

    // ── Specialty ────────────────────────────────────────────────────────────
    prof.especialidade = detectSpecialty(full);

    // ── Site / URL (best-effort as reference) ────────────────────────────────
    // (just ignore — not mapped to FormProf)

    return prof;
  });
}

// ── Google Maps parser ────────────────────────────────────────────────────────

type MapsExtracted = {
  nome: string;
  especialidade: string;
  whatsapp: string;
  endereco: string;
  cidade: string;
  horarios: string;
  site: string;
};

// Lines that are clearly Google Maps UI noise — skip them
const MAPS_NOISE = [
  /^Google Maps$/i, /^Avaliações?$/i, /^Salvar$/i, /^Compartilhar$/i,
  /^Rotas?$/i, /^Ligar$/i, /^Mais$/i, /^Envia para/i, /^Adicionar/i,
  /^Sugerir/i, /^Ver (todos|mais|fotos)/i, /^Cardápio$/i, /^Fotos?$/i,
  /^R\$(\s*·)?$/, /^\d+\s*\(/, /^★/, /^https?:\/\//, /^\d+\s*avaliações/i,
  /^Aberto agora/i, /^Fechado/i, /^Abre (às|em)/i, /^Fecha às/i,
];

function parseGoogleMapsInput(raw: string): MapsExtracted {
  const result: MapsExtracted = { nome: "", especialidade: "", whatsapp: "", endereco: "", cidade: "", horarios: "", site: "" };
  const lines = raw.split("\n").map(l => l.trim()).filter(Boolean);
  const clean = lines.filter(l => !MAPS_NOISE.some(re => re.test(l)));

  // ── Name ──────────────────────────────────────────────────────────────────
  // Google Maps format: "Dra. Nome - Especialidade" or "Clínica Nome"
  for (let i = 0; i < Math.min(5, clean.length); i++) {
    const line = clean[i];
    if (/\d{4,}|Endereço|Telefone|Horário|Site:/i.test(line)) break;

    // "Name — Category" split
    const dash = line.match(/^(.+?)\s*[-–—]+\s*(.+)$/);
    if (dash) {
      const [, left, right] = dash;
      if (left.length >= 3 && left.length <= 60 && !/^\d/.test(left)) {
        result.nome = left.trim();
        result.especialidade = detectSpecialty(right) || right.trim().split(/[,·]/)[0].trim();
        break;
      }
    }
    // Plain name line
    if (!result.nome && /^[A-ZÀÁÂÃÉÊÍÓÔÕÚÜÇ]/.test(line) && line.length < 70 && !/^\d/.test(line)) {
      result.nome = line;
    }
  }

  // ── Specialty from category lines (if not from name) ──────────────────────
  if (!result.especialidade) {
    for (const line of clean.slice(0, 8)) {
      const s = detectSpecialty(line);
      if (s) { result.especialidade = s; break; }
    }
  }

  // ── Phone ─────────────────────────────────────────────────────────────────
  for (const line of lines) {
    const stripped = line.replace(/^(?:Número de telefone|Telefone|Tel|Fone|📞)[:\s]*/i, "").trim();
    const m = stripped.match(/(?:\+?55\s?)?(?:\(?\d{2}\)?[\s-]?)?\d{4,5}[\s-]?\d{4}/);
    if (m) {
      const digits = m[0].replace(/\D/g, "");
      if (digits.length >= 10 && digits.length <= 13) { result.whatsapp = digits; break; }
    }
  }

  // ── Address ───────────────────────────────────────────────────────────────
  for (const line of lines) {
    const stripped = line.replace(/^(?:Endereço|Localização|📍)[:\s]*/i, "").trim();
    if (/^(?:Rua|R\.|Av\.|Avenida|Al\.|Alameda|Pça\.|Praça|Estrada|Rod\.|Trav\.)/i.test(stripped)) {
      // Separate street from city/state
      // Typical: "Rua X, 123 - Bairro, Cidade - UF, CEP"
      const m = stripped.match(/^(.+?),\s*([^,]+\s*-\s*[A-Z]{2}(?:,\s*\d{5}-?\d{3})?)$/);
      if (m) {
        result.endereco = m[1].trim();
        result.cidade = m[2].trim().replace(/,\s*\d{5}-?\d{3}$/, "").trim();
      } else {
        // Try to find city in the remaining text
        const stateMatch = stripped.match(/(.+?),\s*([\wÀ-ÿ\s]+-\s*[A-Z]{2})/);
        if (stateMatch) {
          result.endereco = stateMatch[1].trim();
          result.cidade = stateMatch[2].trim();
        } else {
          result.endereco = stripped;
        }
      }
      break;
    }
    if (/^(?:Endereço|Localização)[:\s]/i.test(line) && !result.endereco) {
      result.endereco = stripped;
    }
  }

  // ── City fallback ─────────────────────────────────────────────────────────
  if (!result.cidade) {
    const full = raw;
    const m = full.match(/([\wÀ-ÿ][\wÀ-ÿ\s]+?)\s*-\s*([A-Z]{2})(?:[,\s]|$)/);
    if (m && m[1].trim() !== result.endereco) {
      result.cidade = `${m[1].trim()} - ${m[2]}`;
    }
  }

  // ── Hours ─────────────────────────────────────────────────────────────────
  for (const line of lines) {
    const stripped = line.replace(/^(?:Horário[s]?|Funciona)[:\s]*/i, "").trim();
    if (/^(?:Horário|Funciona)/i.test(line) || /(?:segunda|seg\.-sex|seg\s+a\s+sex|seg\.|dom\.)/i.test(line)) {
      if (stripped.length > 5 && stripped.length < 100) { result.horarios = stripped; break; }
    }
  }

  // ── Site ──────────────────────────────────────────────────────────────────
  for (const line of lines) {
    if (/^(?:Site|Website)[:\s]+/i.test(line)) {
      result.site = line.replace(/^(?:Site|Website)[:\s]*/i, "").trim();
      break;
    }
    if (/^www\.|\.com\.br|\.med\.br/i.test(line)) { result.site = line; break; }
  }

  return result;
}

function mapsExtractedToProf(extracted: MapsExtracted, complement: MapsComplement): FormProf {
  const prof = emptyProf();
  prof.nome = extracted.nome;
  prof.especialidade = complement.especialidade || extracted.especialidade;
  prof.especialidade2 = complement.especialidade2;
  prof.whatsapp = extracted.whatsapp;
  prof.instagram = complement.instagram ? (complement.instagram.startsWith("@") ? complement.instagram : "@" + complement.instagram) : "";
  prof.crm = complement.crm;
  prof.bio = complement.bio;
  prof.endereco = extracted.endereco;
  prof.cidade = extracted.cidade;
  prof.horarios = extracted.horarios;
  return prof;
}

type MapsComplement = {
  especialidade: string;
  especialidade2: string;
  instagram: string;
  crm: string;
  bio: string;
};

// ── Influx CSV/XLSX parser ────────────────────────────────────────────────────

type InfluxRow = Record<string, string>;

// Normalize header names: "WhatsApp", "Whats App", "WHATSAPP" → "whatsapp"
function normalizeKey(k: string): string {
  return k.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[\s_-]+/g, "");
}

function findCol(row: InfluxRow, ...candidates: string[]): string {
  const keys = Object.keys(row);
  for (const candidate of candidates) {
    const norm = normalizeKey(candidate);
    const found = keys.find(k => normalizeKey(k) === norm);
    if (found && row[found]?.trim()) return row[found].trim();
  }
  return "";
}

function parseInfluxFile(file: File): Promise<FormProf[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const wb = XLSX.read(data, { type: file.name.endsWith(".csv") ? "string" : "array" });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json<InfluxRow>(ws, { defval: "" });

        const profs: FormProf[] = rows
          .map((row): FormProf | null => {
            const nome = findCol(row, "Nome", "name", "profissional");
            if (!nome) return null;

            const wa = findCol(row, "WhatsApp", "Whatsapp", "whats", "celular");
            const tel = findCol(row, "Telefone", "telefone", "phone", "fone");
            const whatsapp = (wa || tel).replace(/\D/g, "");

            const endereco = findCol(row, "Endereço", "Endereco", "Endereço", "address", "rua", "logradouro");
            const cidade = findCol(row, "Cidade", "city", "municipio", "município");
            const categoria = findCol(row, "Categoria", "categoria", "especialidade", "tipo", "category");

            return {
              ...emptyProf(),
              nome,
              especialidade: detectSpecialty(categoria) || categoria,
              whatsapp,
              endereco,
              cidade,
            };
          })
          .filter((p): p is FormProf => p !== null);

        resolve(profs);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = () => reject(new Error("Erro ao ler o arquivo."));

    if (file.name.endsWith(".csv")) {
      reader.readAsText(file, "utf-8");
    } else {
      reader.readAsArrayBuffer(file);
    }
  });
}

// ── Other helpers ─────────────────────────────────────────────────────────────

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

// ── Field ─────────────────────────────────────────────────────────────────────

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
  const filledCount = [prof.nome, prof.especialidade, prof.whatsapp, prof.endereco].filter(Boolean).length;

  return (
    <div className="bg-white border border-border rounded-2xl shadow-card overflow-hidden">
      <div className="flex items-center gap-3 px-5 py-4">
        <button onClick={onToggle} className="flex items-center gap-3 flex-1 min-w-0 text-left">
          <div className="size-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <span className="font-sans text-[11px] font-medium text-primary">{index + 1}</span>
          </div>
          <div className="min-w-0">
            <p className="font-sans text-sm font-medium text-dark truncate">{prof.nome || "Profissional sem nome"}</p>
            <p className="font-sans text-[12px] text-text-muted">
              {prof.especialidade || <span className="text-amber-500">especialidade não detectada</span>}
              {prof.whatsapp ? ` · ${prof.whatsapp}` : ""}
            </p>
          </div>
        </button>
        <div className="flex items-center gap-1.5 shrink-0">
          <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${filledCount >= 3 ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>
            {filledCount}/4
          </span>
          {Object.values(prof.images).some(Boolean) && <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full">img</span>}
          <button onClick={onRemove} className="text-text-muted hover:text-destructive transition-colors p-1"><Trash2 className="size-4" /></button>
          <button onClick={onToggle} className="text-text-muted p-1">
            {expanded ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
          </button>
        </div>
      </div>

      {expanded && (
        <div className="border-t border-border/40 p-5 space-y-6">
          <div>
            <p className="font-sans text-[10px] tracking-[0.2em] uppercase text-primary font-medium mb-3">Informações Básicas</p>
            <div className="grid sm:grid-cols-2 gap-3">
              <Field label="Nome*" value={prof.nome} onChange={v => onUpdate("nome", v)} placeholder="Dra. Nome Sobrenome" />
              <Field label="Especialidade*" value={prof.especialidade} onChange={v => onUpdate("especialidade", v)} placeholder="Ginecologia" />
              <Field label="Especialidade secundária" value={prof.especialidade2} onChange={v => onUpdate("especialidade2", v)} placeholder="Opcional" />
              <Field label="WhatsApp*" value={prof.whatsapp} onChange={v => onUpdate("whatsapp", v)} placeholder="(37) 99999-9999" />
              <Field label="Instagram" value={prof.instagram} onChange={v => onUpdate("instagram", v)} placeholder="@handle" />
              <Field label="CRM / Registro" value={prof.crm} onChange={v => onUpdate("crm", v)} placeholder="CRM MG 12345" />
            </div>
          </div>

          <div>
            <p className="font-sans text-[10px] tracking-[0.2em] uppercase text-primary font-medium mb-3">Conteúdo</p>
            <div className="grid sm:grid-cols-2 gap-3">
              <Field label="Headline" value={prof.headline} onChange={v => onUpdate("headline", v)} placeholder="Auto-gerada pela especialidade" />
              <Field label="Subtítulo" value={prof.subtitulo} onChange={v => onUpdate("subtitulo", v)} placeholder="Auto-gerado" />
              <Field label="Bio / Sobre" value={prof.bio} onChange={v => onUpdate("bio", v)} placeholder="Auto-gerada se vazia" textarea span2 />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="font-sans text-[10px] tracking-[0.2em] uppercase text-primary font-medium">Procedimentos / Serviços</p>
              <button onClick={() => onAddList("procedimentos")} className="flex items-center gap-1 text-[11px] text-primary hover:opacity-70"><Plus className="size-3" /> Adicionar</button>
            </div>
            <div className="space-y-2">
              {prof.procedimentos.map((pr, i) => (
                <div key={i} className="flex gap-2">
                  <input value={pr.nome} onChange={e => onUpdateList("procedimentos", i, "nome", e.target.value)} placeholder="Nome" className="flex-1 bg-muted/40 border border-border/60 rounded-lg px-3 py-2 text-sm font-sans text-dark focus:outline-none focus:border-primary" />
                  <input value={pr.desc} onChange={e => onUpdateList("procedimentos", i, "desc", e.target.value)} placeholder="Descrição breve" className="flex-1 bg-muted/40 border border-border/60 rounded-lg px-3 py-2 text-sm font-sans text-dark focus:outline-none focus:border-primary" />
                  <button onClick={() => onRemoveList("procedimentos", i)} className="text-text-muted hover:text-destructive p-1 shrink-0"><Trash2 className="size-3.5" /></button>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="font-sans text-[10px] tracking-[0.2em] uppercase text-primary font-medium">Depoimentos (opcional)</p>
              <button onClick={() => onAddList("depoimentos")} className="flex items-center gap-1 text-[11px] text-primary hover:opacity-70"><Plus className="size-3" /> Adicionar</button>
            </div>
            {prof.depoimentos.length === 0
              ? <p className="text-xs text-text-muted font-light">Sem depoimentos — serão usados os padrões da especialidade.</p>
              : (
                <div className="space-y-3">
                  {prof.depoimentos.map((dep, i) => (
                    <div key={i} className="bg-muted/30 rounded-xl p-3 space-y-2">
                      <div className="flex gap-2">
                        <textarea value={dep.texto} onChange={e => onUpdateList("depoimentos", i, "texto", e.target.value)} placeholder="Texto do depoimento" rows={2} className="flex-1 bg-white border border-border/60 rounded-lg px-3 py-2 text-sm font-sans text-dark focus:outline-none focus:border-primary resize-none" />
                        <button onClick={() => onRemoveList("depoimentos", i)} className="text-text-muted hover:text-destructive p-1 self-start"><Trash2 className="size-3.5" /></button>
                      </div>
                      <div className="flex gap-2">
                        <input value={dep.autor} onChange={e => onUpdateList("depoimentos", i, "autor", e.target.value)} placeholder="Nome da paciente" className="flex-1 bg-white border border-border/60 rounded-lg px-3 py-1.5 text-sm font-sans text-dark focus:outline-none focus:border-primary" />
                        <input value={dep.cargo} onChange={e => onUpdateList("depoimentos", i, "cargo", e.target.value)} placeholder="Ex: Paciente há 2 anos" className="flex-1 bg-white border border-border/60 rounded-lg px-3 py-1.5 text-sm font-sans text-dark focus:outline-none focus:border-primary" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
          </div>

          <div>
            <p className="font-sans text-[10px] tracking-[0.2em] uppercase text-primary font-medium mb-3">Localização</p>
            <div className="grid sm:grid-cols-2 gap-3">
              <Field label="Endereço" value={prof.endereco} onChange={v => onUpdate("endereco", v)} placeholder="Rua X, 123 — Bairro" />
              <Field label="Cidade — Estado" value={prof.cidade} onChange={v => onUpdate("cidade", v)} placeholder="Centro, Cidade - MG" />
              <Field label="Horários" value={prof.horarios} onChange={v => onUpdate("horarios", v)} placeholder="Seg a Sex — 08h às 18h" span2 />
            </div>
          </div>

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
                            className="absolute top-1 right-1 size-5 rounded-full bg-dark/60 text-white flex items-center justify-center hover:bg-destructive">
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
                    <input type="file" accept="image/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) onImg(sec, f); }} />
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

// ── Main ──────────────────────────────────────────────────────────────────────

export default function BatchPage() {
  const qc = useQueryClient();
  const copyInputRef = useRef<HTMLInputElement>(null);
  const imgInputRef = useRef<HTMLInputElement>(null);

  const [batchMode, setBatchMode] = useState<"import" | "maps" | "smart" | "upload">("import");
  const importRef = useRef<HTMLInputElement>(null);
  const [importPreview, setImportPreview] = useState<FormProf[]>([]);
  const [importLoading, setImportLoading] = useState(false);

  // Maps tab state
  const [mapsInput, setMapsInput] = useState("");
  const [mapsPhase, setMapsPhase] = useState<"paste" | "review">("paste");
  const [mapsExtracted, setMapsExtracted] = useState<MapsExtracted | null>(null);
  const [mapsComplement, setMapsComplement] = useState<MapsComplement>({ especialidade: "", especialidade2: "", instagram: "", crm: "", bio: "" });
  const [mapsQueueCount, setMapsQueueCount] = useState(0);
  const [formPhase, setFormPhase] = useState<"paste" | "edit">("paste");
  const [rawInput, setRawInput] = useState("");
  const [profissionais, setProfissionais] = useState<FormProf[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [entries, setEntries] = useState<BatchEntry[]>([]);
  const [expandedEntry, setExpandedEntry] = useState<number | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [batchPagemode, setBatchPagemode] = useState<"landing" | "multipage">("landing");

  // ── Smart mode handlers ────────────────────────────────────────────────────

  function handleSmartParse() {
    if (!rawInput.trim()) { toast.error("Cole as informações primeiro."); return; }
    const parsed = smartExtract(rawInput).filter(p => p.nome || p.whatsapp);
    if (!parsed.length) {
      toast.error("Não consegui identificar nenhum profissional. Certifique-se de incluir o nome (ex: Dra. Nome).");
      return;
    }
    setProfissionais(parsed);
    setExpandedId(parsed[0]?.id ?? null);
    setEntries([]);
    setFormPhase("edit");
    const detected = parsed.filter(p => p.nome).length;
    toast.success(`${detected} profissional(is) identificado(s)! Revise e ajuste o que precisar.`);
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
    toast.success(`${generated.length} página(s) prontas para criar!`);
  }

  // ── Import handlers ────────────────────────────────────────────────────────

  async function handleImportFile(file: File) {
    setImportLoading(true);
    try {
      const profs = await parseInfluxFile(file);
      if (!profs.length) {
        toast.error("Nenhum lead encontrado no arquivo. Verifique se o arquivo tem a coluna 'Nome'.");
        return;
      }
      setImportPreview(profs);
      toast.success(`${profs.length} lead(s) detectado(s) — revise e importe.`);
    } catch {
      toast.error("Erro ao ler o arquivo. Certifique-se que é um CSV ou XLSX válido.");
    } finally {
      setImportLoading(false);
    }
  }

  function handleImportConfirm() {
    if (!importPreview.length) return;
    setProfissionais(importPreview);
    setExpandedId(importPreview[0]?.id ?? null);
    setEntries([]);
    setBatchMode("smart");
    setFormPhase("edit");
    toast.success(`${importPreview.length} lead(s) importado(s)! Revise e gere as páginas.`);
  }

  // ── Maps handlers ─────────────────────────────────────────────────────────

  function handleMapsExtract() {
    if (!mapsInput.trim()) { toast.error("Cole o conteúdo do Google Maps primeiro."); return; }
    const extracted = parseGoogleMapsInput(mapsInput);
    if (!extracted.nome && !extracted.whatsapp && !extracted.endereco) {
      toast.error("Não consegui identificar o profissional. Copie mais texto da listagem do Maps e tente novamente.");
      return;
    }
    setMapsExtracted(extracted);
    setMapsComplement({ especialidade: extracted.especialidade ? "" : "", especialidade2: "", instagram: "", crm: "", bio: "" });
    setMapsPhase("review");
  }

  function handleMapsAddToQueue() {
    if (!mapsExtracted) return;
    const prof = mapsExtractedToProf(mapsExtracted, mapsComplement);
    const newCount = mapsQueueCount + 1;
    setProfissionais(prev => {
      const existing = prev.filter(p => p.nome || p.whatsapp);
      return [...existing, prof];
    });
    setMapsQueueCount(newCount);
    setMapsInput("");
    setMapsExtracted(null);
    setMapsPhase("paste");
    toast.success(`Profissional ${newCount} adicionado à fila!`);
  }

  function handleMapsGoToEdit() {
    if (profissionais.filter(p => p.nome || p.whatsapp).length === 0) {
      toast.error("Adicione pelo menos um profissional à fila primeiro.");
      return;
    }
    setBatchMode("smart");
    setFormPhase("edit");
    setExpandedId(profissionais[0]?.id ?? null);
  }

  // ── Upload mode handlers ───────────────────────────────────────────────────

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
        try {
          await createLandingPage({ slug: entry.slug, published: true, copy: mergedCopy, images: imageUrls, theme: "rose-gold", pagemode: batchPagemode });
        } catch (e) {
          const msg = (e as { message?: string }).message ?? "";
          if (msg.includes("pagemode")) {
            await createLandingPage({ slug: entry.slug, published: true, copy: mergedCopy, images: imageUrls, theme: "rose-gold" });
          } else throw e;
        }
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
        <p className="font-sans text-sm text-text-muted font-light mt-1">Cole as informações dos seus leads, formate automaticamente e crie as páginas.</p>
      </div>

      {/* Mode tabs */}
      <div className="flex flex-wrap bg-muted rounded-xl p-1 mb-6 gap-0.5">
        <button onClick={() => { setBatchMode("import"); setEntries([]); setImportPreview([]); }}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-sans text-[12px] tracking-[0.15em] uppercase transition-all ${batchMode === "import" ? "bg-white text-dark shadow-sm font-medium" : "text-text-muted hover:text-dark"}`}>
          <Table2 className="size-3.5" /> Importar Leads
        </button>
        <button onClick={() => { setBatchMode("maps"); setEntries([]); setMapsPhase("paste"); setMapsExtracted(null); setMapsQueueCount(0); setProfissionais([]); }}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-sans text-[12px] tracking-[0.15em] uppercase transition-all ${batchMode === "maps" ? "bg-white text-dark shadow-sm font-medium" : "text-text-muted hover:text-dark"}`}>
          <MapPin className="size-3.5" /> Google Maps
        </button>
        <button onClick={() => { setBatchMode("smart"); setEntries([]); setFormPhase("paste"); }}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-sans text-[12px] tracking-[0.15em] uppercase transition-all ${batchMode === "smart" ? "bg-white text-dark shadow-sm font-medium" : "text-text-muted hover:text-dark"}`}>
          <Sparkles className="size-3.5" /> Cola &amp; Cria
        </button>
        <button onClick={() => { setBatchMode("upload"); setEntries([]); }}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-sans text-[12px] tracking-[0.15em] uppercase transition-all ${batchMode === "upload" ? "bg-white text-dark shadow-sm font-medium" : "text-text-muted hover:text-dark"}`}>
          <FileText className="size-3.5" /> Upload .txt
        </button>
      </div>

      {/* ── IMPORT MODE ── */}
      {batchMode === "import" && (
        <div className="mb-6 space-y-4">
          {/* Upload area */}
          {!importPreview.length && (
            <div
              onClick={() => importRef.current?.click()}
              className="bg-white border-2 border-dashed border-border hover:border-primary/50 rounded-2xl p-12 cursor-pointer transition-all text-center group"
            >
              <input
                ref={importRef}
                type="file"
                accept=".csv,.xlsx,.xls"
                className="hidden"
                onChange={e => { const f = e.target.files?.[0]; if (f) handleImportFile(f); e.target.value = ""; }}
              />
              {importLoading ? (
                <div className="flex flex-col items-center gap-3">
                  <Loader2 className="size-10 text-primary animate-spin" />
                  <p className="font-sans text-sm text-text-muted">Lendo arquivo...</p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-4">
                  <div className="size-16 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/15 transition-colors">
                    <Table2 className="size-8 text-primary" />
                  </div>
                  <div>
                    <p className="font-sans text-base font-medium text-dark">Arraste ou clique para importar</p>
                    <p className="font-sans text-sm text-text-muted font-light mt-1">CSV ou XLSX exportado do Influx</p>
                  </div>
                  <div className="flex gap-2 mt-1">
                    <span className="font-mono text-[11px] bg-muted text-text-muted px-2.5 py-1 rounded-lg">.csv</span>
                    <span className="font-mono text-[11px] bg-muted text-text-muted px-2.5 py-1 rounded-lg">.xlsx</span>
                    <span className="font-mono text-[11px] bg-muted text-text-muted px-2.5 py-1 rounded-lg">.xls</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Preview table */}
          {importPreview.length > 0 && (
            <div className="bg-white border border-border rounded-2xl shadow-card overflow-hidden">
              <div className="px-6 py-4 border-b border-border flex items-center justify-between">
                <div>
                  <p className="font-sans text-sm font-medium text-dark">{importPreview.length} leads detectados</p>
                  <p className="font-sans text-xs text-text-muted font-light mt-0.5">
                    Campos em amber serão completados automaticamente pela especialidade
                  </p>
                </div>
                <button onClick={() => { setImportPreview([]); }} className="text-[11px] text-text-muted hover:text-dark transition-colors">
                  Trocar arquivo
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs font-sans">
                  <thead className="bg-muted/50 border-b border-border">
                    <tr>
                      {["#", "Nome", "Especialidade", "WhatsApp", "Endereço", "Cidade"].map(h => (
                        <th key={h} className="px-4 py-3 text-left font-medium text-text-muted tracking-[0.1em] uppercase text-[10px]">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {importPreview.slice(0, 8).map((p, i) => (
                      <tr key={p.id} className="hover:bg-muted/20 transition-colors">
                        <td className="px-4 py-3 text-text-muted">{i + 1}</td>
                        <td className="px-4 py-3 text-dark font-medium max-w-[180px] truncate">{p.nome || <span className="text-destructive">—</span>}</td>
                        <td className="px-4 py-3">
                          {p.especialidade
                            ? <span className="text-dark">{p.especialidade}</span>
                            : <span className="text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded text-[10px]">auto</span>}
                        </td>
                        <td className="px-4 py-3 text-text-muted font-mono">{p.whatsapp || <span className="text-amber-600">—</span>}</td>
                        <td className="px-4 py-3 text-text-muted max-w-[160px] truncate">{p.endereco || "—"}</td>
                        <td className="px-4 py-3 text-text-muted">{p.cidade || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {importPreview.length > 8 && (
                  <p className="px-4 py-3 text-xs text-text-muted font-light border-t border-border/60">
                    + {importPreview.length - 8} lead(s) não mostrado(s) na prévia
                  </p>
                )}
              </div>

              <div className="px-6 py-4 border-t border-border bg-muted/20 flex gap-3">
                <button
                  onClick={() => importRef.current?.click()}
                  className="flex-1 py-3 border border-border rounded-xl font-sans text-[11px] tracking-[0.2em] uppercase text-text-muted hover:text-dark hover:border-dark/30 transition-all"
                >
                  Trocar arquivo
                </button>
                <button
                  onClick={handleImportConfirm}
                  className="flex-[2] py-3 bg-dark text-white font-sans text-[11px] tracking-[0.25em] uppercase font-medium rounded-xl hover:bg-dark/80 transition-all"
                >
                  Importar {importPreview.length} leads → revisar e criar
                </button>
              </div>
              <input ref={importRef} type="file" accept=".csv,.xlsx,.xls" className="hidden"
                onChange={e => { const f = e.target.files?.[0]; if (f) handleImportFile(f); e.target.value = ""; }} />
            </div>
          )}
        </div>
      )}

      {/* ── MAPS MODE — paste ── */}
      {batchMode === "maps" && mapsPhase === "paste" && (
        <div className="mb-6 space-y-4">
          {mapsQueueCount > 0 && (
            <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 rounded-2xl px-5 py-3.5">
              <div className="flex items-center gap-2 text-emerald-700">
                <CheckCircle2 className="size-4" />
                <span className="font-sans text-sm font-medium">{mapsQueueCount} profissional(is) na fila</span>
              </div>
              <button onClick={handleMapsGoToEdit}
                className="font-sans text-[11px] tracking-[0.2em] uppercase text-emerald-700 border border-emerald-400 px-4 py-1.5 rounded-lg hover:bg-emerald-100 transition-colors">
                Revisar e criar →
              </button>
            </div>
          )}
          <div className="bg-white border border-border rounded-2xl shadow-card overflow-hidden">
            <div className="px-6 py-5 border-b border-border/40">
              <p className="font-sans text-base font-medium text-dark">Cole o conteúdo do Google Maps</p>
              <p className="font-sans text-sm text-text-muted font-light mt-1">
                Abra o perfil do profissional no Google Maps, selecione todo o texto visível e cole aqui. O sistema extrai nome, telefone, endereço, horários e especialidade automaticamente.
              </p>
            </div>
            <div className="px-5 py-4 bg-muted/30 border-b border-border/40">
              <p className="font-sans text-[11px] tracking-[0.15em] uppercase text-text-muted font-medium mb-2">Como copiar do Google Maps</p>
              <ol className="font-sans text-xs text-text-muted font-light space-y-1 list-decimal list-inside">
                <li>Abra o Google Maps e pesquise o profissional</li>
                <li>Clique no card/perfil do consultório</li>
                <li>Selecione todo o texto do painel lateral (Ctrl+A ou clique e arraste)</li>
                <li>Cole aqui embaixo</li>
              </ol>
            </div>
            <div className="p-4">
              <textarea
                value={mapsInput}
                onChange={e => setMapsInput(e.target.value)}
                placeholder={"Dra. Ana Campos - Ginecologista\nGinecologista\n4.8 ★ (89 avaliações)\nAberto · Fecha às 18:00\nEndereço: Rua Iguaçu, 75 - Centro, Londrina - PR, 86010-150\nTelefone: (43) 99839-2579\nSite: www.dra-ana.com.br\nHorário: segunda a sexta, das 8h às 18h"}
                rows={12}
                className="w-full bg-muted/30 border border-border/50 rounded-xl px-4 py-3 font-mono text-sm text-dark placeholder:text-text-muted/30 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 resize-y transition-all"
              />
            </div>
            <div className="px-4 pb-4">
              <button onClick={handleMapsExtract}
                className="w-full py-4 bg-dark text-white font-sans text-[11px] tracking-[0.3em] uppercase font-medium rounded-2xl hover:bg-dark/80 transition-colors shadow-sm flex items-center justify-center gap-2">
                <MapPin className="size-4" /> Extrair Informações →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MAPS MODE — review ── */}
      {batchMode === "maps" && mapsPhase === "review" && mapsExtracted && (() => {
        const detected: { label: string; value: string }[] = [];
        const missing: string[] = [];

        if (mapsExtracted.nome) detected.push({ label: "Nome", value: mapsExtracted.nome });
        else missing.push("Nome");

        if (mapsExtracted.especialidade) detected.push({ label: "Especialidade", value: mapsExtracted.especialidade });
        else missing.push("Especialidade");

        if (mapsExtracted.whatsapp) detected.push({ label: "Telefone", value: mapsExtracted.whatsapp });
        else missing.push("Telefone");

        if (mapsExtracted.endereco) detected.push({ label: "Endereço", value: mapsExtracted.endereco });
        else missing.push("Endereço");

        if (mapsExtracted.cidade) detected.push({ label: "Cidade", value: mapsExtracted.cidade });

        if (mapsExtracted.horarios) detected.push({ label: "Horários", value: mapsExtracted.horarios });

        if (mapsExtracted.site) detected.push({ label: "Site", value: mapsExtracted.site });

        const needsEspecialidade = !mapsExtracted.especialidade;

        return (
          <div className="mb-6 space-y-4">
            <button onClick={() => setMapsPhase("paste")} className="flex items-center gap-1.5 text-sm text-text-muted hover:text-dark transition-colors">
              <ChevronLeft className="size-4" /> Extrair outro
            </button>

            {/* Extracted data summary */}
            <div className="bg-white border border-border rounded-2xl shadow-card overflow-hidden">
              <div className="px-5 py-4 border-b border-border/40 flex items-center justify-between">
                <p className="font-sans text-sm font-medium text-dark">Dados extraídos do Google Maps</p>
                <span className="text-[11px] text-emerald-600 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full font-medium">
                  {detected.length} campo(s) detectado(s)
                </span>
              </div>

              {/* Detected fields */}
              <div className="px-5 py-4 border-b border-border/40">
                <p className="font-sans text-[10px] tracking-[0.2em] uppercase text-text-muted font-medium mb-3">Detectado com sucesso</p>
                <div className="space-y-2">
                  {detected.map(d => (
                    <div key={d.label} className="flex items-start gap-3">
                      <CheckCircle2 className="size-4 text-emerald-500 shrink-0 mt-0.5" />
                      <div className="min-w-0">
                        <span className="font-sans text-[11px] tracking-[0.1em] uppercase text-text-muted">{d.label}: </span>
                        <span className="font-sans text-sm text-dark">{d.value}</span>
                      </div>
                    </div>
                  ))}
                </div>
                {missing.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {missing.map(m => (
                      <span key={m} className="text-[10px] bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <AlertTriangle className="size-2.5" /> {m} não detectado
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Quick-fill for fields not on Maps */}
              <div className="px-5 py-4">
                <p className="font-sans text-[10px] tracking-[0.2em] uppercase text-primary font-medium mb-4">
                  Complete os dados que o Google Maps não tem
                </p>
                <div className="grid sm:grid-cols-2 gap-3">
                  {needsEspecialidade && (
                    <div className="sm:col-span-2">
                      <label className="font-sans text-[11px] tracking-[0.15em] uppercase text-destructive block mb-1.5">Especialidade* (obrigatório)</label>
                      <input value={mapsComplement.especialidade} onChange={e => setMapsComplement(p => ({ ...p, especialidade: e.target.value }))}
                        placeholder="Ginecologia, Cardiologia, Dermatologia..."
                        className="w-full bg-muted/40 border border-destructive/40 rounded-xl px-3.5 py-2.5 text-sm font-sans text-dark focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10" />
                    </div>
                  )}
                  <div>
                    <label className="font-sans text-[11px] tracking-[0.15em] uppercase text-text-muted block mb-1.5">Especialidade 2 (opcional)</label>
                    <input value={mapsComplement.especialidade2} onChange={e => setMapsComplement(p => ({ ...p, especialidade2: e.target.value }))}
                      placeholder="Ex: Obstetrícia"
                      className="w-full bg-muted/40 border border-border/60 rounded-xl px-3.5 py-2.5 text-sm font-sans text-dark focus:outline-none focus:border-primary" />
                  </div>
                  <div>
                    <label className="font-sans text-[11px] tracking-[0.15em] uppercase text-text-muted block mb-1.5">Instagram</label>
                    <input value={mapsComplement.instagram} onChange={e => setMapsComplement(p => ({ ...p, instagram: e.target.value }))}
                      placeholder="@handle (sem @, adiciona automático)"
                      className="w-full bg-muted/40 border border-border/60 rounded-xl px-3.5 py-2.5 text-sm font-sans text-dark focus:outline-none focus:border-primary" />
                  </div>
                  <div>
                    <label className="font-sans text-[11px] tracking-[0.15em] uppercase text-text-muted block mb-1.5">CRM / Registro</label>
                    <input value={mapsComplement.crm} onChange={e => setMapsComplement(p => ({ ...p, crm: e.target.value }))}
                      placeholder="CRM MG 12345 · RQE 678"
                      className="w-full bg-muted/40 border border-border/60 rounded-xl px-3.5 py-2.5 text-sm font-sans text-dark focus:outline-none focus:border-primary" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="font-sans text-[11px] tracking-[0.15em] uppercase text-text-muted block mb-1.5">Bio / Sobre (opcional — auto-gerada se vazia)</label>
                    <textarea value={mapsComplement.bio} onChange={e => setMapsComplement(p => ({ ...p, bio: e.target.value }))}
                      placeholder="Apresentação da profissional..."
                      rows={2}
                      className="w-full bg-muted/40 border border-border/60 rounded-xl px-3.5 py-2.5 text-sm font-sans text-dark focus:outline-none focus:border-primary resize-none" />
                  </div>
                </div>

                <p className="font-sans text-[11px] text-text-muted font-light mt-4">
                  Procedimentos, depoimentos e imagens podem ser adicionados no próximo passo.
                </p>
              </div>

              <div className="px-5 pb-5 grid sm:grid-cols-2 gap-3">
                <button onClick={() => setMapsPhase("paste")}
                  className="py-3 border border-border rounded-xl font-sans text-[11px] tracking-[0.2em] uppercase text-text-muted hover:text-dark hover:border-dark/30 transition-all">
                  ← Extrair outro lead
                </button>
                <button
                  onClick={handleMapsAddToQueue}
                  disabled={needsEspecialidade && !mapsComplement.especialidade.trim()}
                  className="py-3 bg-dark text-white font-sans text-[11px] tracking-[0.2em] uppercase font-medium rounded-xl hover:bg-dark/80 disabled:opacity-40 disabled:cursor-not-allowed transition-all">
                  Adicionar à fila {mapsQueueCount > 0 ? `(${mapsQueueCount + 1}º)` : ""}
                </button>
              </div>
            </div>

            {mapsQueueCount > 0 && (
              <button onClick={handleMapsGoToEdit}
                className="w-full py-4 bg-dark text-white font-sans text-[11px] tracking-[0.3em] uppercase font-medium rounded-2xl hover:bg-dark/80 transition-colors shadow-sm">
                Revisar {mapsQueueCount} profissional(is) e criar páginas →
              </button>
            )}
          </div>
        );
      })()}

      {/* ── SMART MODE — paste phase ── */}
      {batchMode === "smart" && formPhase === "paste" && (
        <div className="mb-6">
          <div className="bg-white border border-border rounded-2xl shadow-card overflow-hidden">
            <div className="px-6 py-5 border-b border-border/40">
              <p className="font-sans text-base font-medium text-dark">Cole as informações dos profissionais</p>
              <p className="font-sans text-sm text-text-muted font-light mt-1">
                Pode colar qualquer formato — nome, telefone, endereço, Instagram, especialidade.
                Separe cada profissional com <code className="bg-muted px-1.5 py-0.5 rounded font-mono text-[12px] text-primary">===</code> em linha separada.
              </p>
            </div>
            <div className="p-4">
              <textarea
                value={rawInput}
                onChange={e => setRawInput(e.target.value)}
                placeholder={"Dra. Ana Campos, Ginecologia\nRua Iguaçu, 75 — Centro, Londrina - PR\n43998392579\ninstagram.com/aninha\n\n===\n\nDr. João Santos — Cardiologia\n(11) 98765-4321\n@drjoaosantos\nAv. Paulista, 1000 — São Paulo - SP"}
                rows={14}
                className="w-full bg-muted/30 border border-border/50 rounded-xl px-4 py-3 font-mono text-sm text-dark placeholder:text-text-muted/30 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 resize-y transition-all"
              />
            </div>
            <div className="px-4 pb-4">
              <button onClick={handleSmartParse}
                className="w-full py-4 bg-dark text-white font-sans text-[11px] tracking-[0.3em] uppercase font-medium rounded-2xl hover:bg-dark/80 transition-colors shadow-sm flex items-center justify-center gap-2">
                <Sparkles className="size-4" /> Formatar e Gerar Profissionais
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── SMART MODE — edit phase ── */}
      {batchMode === "smart" && formPhase === "edit" && (
        <div className="space-y-3 mb-6">
          <div className="flex items-center justify-between mb-1">
            <button onClick={() => { setFormPhase("paste"); setEntries([]); }}
              className="flex items-center gap-1.5 text-sm text-text-muted hover:text-dark transition-colors">
              <ChevronLeft className="size-4" /> Editar texto
            </button>
            <span className="font-sans text-xs text-text-muted">{profissionais.length} profissional(is) — revise e ajuste</span>
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

          <button onClick={() => { const p = emptyProf(); setProfissionais(prev => [...prev, p]); setExpandedId(p.id); }}
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
            <input ref={copyInputRef} type="file" accept=".txt" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) handleCopyFile(f); }} />
          </div>
          <div onClick={() => entries.length > 0 ? imgInputRef.current?.click() : undefined}
            className={`bg-white border-2 border-dashed rounded-2xl p-8 transition-colors text-center group ${entries.length > 0 ? "border-border hover:border-primary/40 cursor-pointer" : "border-border/40 opacity-50"}`}>
            <ImagePlus className="size-8 text-primary/40 mx-auto mb-3 group-hover:text-primary/60 transition-colors" />
            <p className="font-sans text-sm font-medium text-dark">Imagens (opcional)</p>
            <p className="font-sans text-xs text-text-muted font-light mt-1">slug-secao.ext — múltiplos arquivos</p>
            <input ref={imgInputRef} type="file" accept="image/*" multiple className="hidden" onChange={e => { if (e.target.files?.length) handleImageFiles(e.target.files); }} />
          </div>
        </div>
      )}

      {/* ── PREVIEW ── */}
      {entries.length > 0 && (
        <div className="bg-white border border-border rounded-2xl shadow-card overflow-hidden mb-6">
          <div className="px-6 py-4 border-b border-border flex items-center justify-between">
            <p className="font-sans text-sm font-medium text-dark">{entries.length} página(s) prontas</p>
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
