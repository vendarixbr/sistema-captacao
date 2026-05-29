import type { LandingCopy } from "./types";
import { deriveContent } from "./deriveContent";

export type ParseResult = {
  copy: Partial<LandingCopy>;
  slug: string;
  detected: string[];
};

function clean(s: string) {
  return s.replace(/^[*_~`#>\-•·]+/, "").trim();
}

function stripEmoji(s: string) {
  return s.replace(/[\u{1F000}-\u{1FFFF}]/gu, "").replace(/[☀-⛿✀-➿]/g, "").trim();
}

function normalizePhone(s: string) {
  return s.replace(/\D/g, "");
}

function toSlug(name: string) {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/\./g, "")
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function getAfterColon(line: string): string {
  const idx = line.indexOf(":");
  return idx >= 0 ? line.slice(idx + 1).trim() : "";
}

function matchesAny(line: string, ...patterns: string[]): boolean {
  const l = line.toLowerCase();
  return patterns.some((p) => l.includes(p.toLowerCase()));
}

// Read next non-empty line(s) as value (multiline until next key)
function readMultiline(lines: string[], start: number): { value: string; next: number } {
  const parts: string[] = [];
  let i = start;
  while (i < lines.length) {
    const l = lines[i].trim();
    if (!l) { i++; continue; }
    // Stop if it looks like a new key/section
    if (/^[📌🔝✅⚡💬📍📞🌐🕐🗓️]/.test(l)) break;
    if (/^(SEÇÃO|HEADER|FOOTER|CTA|Logo:|Menu:|Tag\/Label:|Label:|Headline:|Subtítulo:|Botões:|Cards:|Depoimentos:|Localização:|Informações|Endereço:|Horário|📍|📞|Botão|Rodapé|Formulário|Campos:|Aviso)/i.test(l)) break;
    if (l.includes("—") && l.length < 60 && parts.length > 0) break;
    parts.push(clean(l));
    i++;
  }
  return { value: parts.join(" "), next: i };
}

export function parsePrompt(text: string): ParseResult {
  const lines = text.split("\n");
  const detected: string[] = [];
  const copy: Partial<LandingCopy> = {};
  let slug = "";

  const meta: Partial<LandingCopy["meta"]> = {};
  const hero: Partial<LandingCopy["hero"]> = {};
  const diferenciais: Partial<LandingCopy["diferenciais"]> & { cards?: LandingCopy["diferenciais"]["cards"] } = {};
  const sobre: Partial<LandingCopy["sobre"]> = {};
  const servicos: Partial<LandingCopy["servicos"]> & { cards?: LandingCopy["servicos"]["cards"] } = {};
  const depoimentos: Partial<LandingCopy["depoimentos"]> & { items?: LandingCopy["depoimentos"]["items"] } = {};
  const localizacao: Partial<LandingCopy["localizacao"]> = {};
  const contato: Partial<LandingCopy["contato"]> = {};
  const footer: Partial<LandingCopy["footer"]> = {};

  type Section = "header" | "hero" | "diferenciais" | "sobre" | "servicos" | "depoimentos" | "localizacao" | "contato" | "footer" | "";
  let section: Section = "";

  // Buffers for multi-item parsing
  const diferencialCards: LandingCopy["diferenciais"]["cards"] = [];
  const servicoCards: LandingCopy["servicos"]["cards"] = [];
  const testimonialItems: LandingCopy["depoimentos"]["items"] = [];

  // State machine
  let heroCtas: string[] = [];
  let heroCtaMode = false;
  let servicoMode = false;
  let depoimentoMode = false;
  let diferencialMode = false;

  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i];
    const line = raw.trim();
    if (!line) { heroCtaMode = false; continue; }
    const stripped = stripEmoji(line).trim();

    // --- SECTION DETECTION ---
    if (matchesAny(stripped, "HEADER", "NAVEGAÇÃO", "HEADER / NAVEGAÇÃO")) {
      section = "header"; heroCtaMode = false; servicoMode = false; diferencialMode = false; depoimentoMode = false;
      continue;
    }
    if (matchesAny(stripped, "SEÇÃO 1", "HERO", "BANNER PRINCIPAL")) {
      section = "hero"; heroCtaMode = false; servicoMode = false; depoimentoMode = false;
      continue;
    }
    if (matchesAny(stripped, "SEÇÃO 2", "DIFERENCIAL")) {
      section = "diferenciais"; heroCtaMode = false; servicoMode = false; depoimentoMode = false; diferencialMode = false;
      continue;
    }
    if (matchesAny(stripped, "SEÇÃO 3", "SOBRE")) {
      section = "sobre"; heroCtaMode = false; servicoMode = false; depoimentoMode = false;
      continue;
    }
    if (matchesAny(stripped, "SEÇÃO 4", "ESPECIALIDADE", "SERVIÇO")) {
      section = "servicos"; heroCtaMode = false; servicoMode = false; depoimentoMode = false;
      continue;
    }
    if (matchesAny(stripped, "SEÇÃO 5", "DEPOIMENTO", "PACIENTE")) {
      section = "depoimentos"; heroCtaMode = false; servicoMode = false; depoimentoMode = false;
      continue;
    }
    if (matchesAny(stripped, "SEÇÃO 6", "LOCALIZAÇÃO", "ONDE ESTAMOS")) {
      section = "localizacao"; heroCtaMode = false; servicoMode = false; depoimentoMode = false;
      continue;
    }
    if (matchesAny(stripped, "SEÇÃO 7", "CTA FINAL", "VAMOS CONVERSAR") && !matchesAny(stripped, "LOCALIZAÇÃO")) {
      section = "contato"; heroCtaMode = false; servicoMode = false; depoimentoMode = false;
      continue;
    }
    if (matchesAny(stripped, "FOOTER", "RODAPÉ")) {
      section = "footer"; heroCtaMode = false; servicoMode = false; depoimentoMode = false;
      continue;
    }

    // --- GLOBAL PATTERNS (any section) ---

    // Logo: Dra. X — Specialty
    const logoMatch = stripped.match(/^Logo:\s*(.+?)(?:\s*[—–-]{1,2}\s*(.+))?$/i);
    if (logoMatch) {
      const name = logoMatch[1]?.trim();
      const spec = logoMatch[2]?.trim();
      if (name) { meta.doctorName = name; slug = toSlug(name); }
      if (spec) meta.specialty = spec;
      if (name || spec) detected.push("Nome / especialidade");
      continue;
    }

    // CRM
    const crmMatch = stripped.match(/(?:CRM)\s+(?:MG|SP|RJ|RS|PR|BA|SC|PE|CE|GO|DF|ES|MA|MS|MT|PA|PI|RN|AL|AM|AP|RO|RR|SE|TO|AC|PB)\s+[\d]+(?:\s*[·•]\s*RQE\s+[\d]+)?/i);
    if (crmMatch) {
      meta.crm = crmMatch[0].trim();
      detected.push("CRM");
      continue;
    }

    // WhatsApp / Telefone
    const phoneMatch = stripped.match(/(?:📞|WhatsApp|Tel(?:efone)?)[:\s]+([+\d\s()./-]{7,})/i);
    if (phoneMatch) {
      meta.whatsapp = normalizePhone(phoneMatch[1]);
      detected.push("WhatsApp");
      continue;
    }
    // Standalone phone like (37) 99421-9291
    const standalonePhone = stripped.match(/^\(?\d{2}\)?\s*[\d\s.-]{8,}$/);
    if (standalonePhone && section === "localizacao") {
      localizacao.phone = stripped;
      meta.whatsapp = normalizePhone(stripped);
      continue;
    }
    if (standalonePhone && !meta.whatsapp) {
      meta.whatsapp = normalizePhone(stripped);
      detected.push("WhatsApp");
      continue;
    }

    // Instagram
    const igHandleMatch = stripped.match(/(?:Instagram[:\s]+)?(@[\w.]+)/i);
    if (igHandleMatch && stripped.toLowerCase().includes("instagram") || (stripped.startsWith("@") && stripped.length < 50)) {
      const handle = igHandleMatch ? igHandleMatch[1] : stripped;
      meta.instagram = handle;
      meta.instagramUrl = `https://www.instagram.com/${handle.replace("@", "")}/`;
      detected.push("Instagram");
      continue;
    }

    // --- PER SECTION ---

    if (section === "hero") {
      if (matchesAny(stripped, "Tag/Label:", "Label:", "Tag:")) {
        const v = getAfterColon(stripped);
        if (v) { hero.label = v; detected.push("Hero label"); }
        heroCtaMode = false; continue;
      }
      if (matchesAny(stripped, "Headline:")) {
        const inline = getAfterColon(stripped);
        if (inline) { hero.headline = inline; detected.push("Hero headline"); }
        else {
          // Next line is the headline
          const next = lines[++i]?.trim();
          if (next) { hero.headline = clean(next); detected.push("Hero headline"); }
        }
        heroCtaMode = false; continue;
      }
      if (matchesAny(stripped, "Subtítulo:")) {
        const inline = getAfterColon(stripped);
        if (inline) { hero.subtitle = inline; detected.push("Hero subtítulo"); }
        else {
          const next = lines[++i]?.trim();
          if (next) { hero.subtitle = clean(next); detected.push("Hero subtítulo"); }
        }
        heroCtaMode = false; continue;
      }
      if (matchesAny(stripped, "Botão", "Botões:", "CTA:")) {
        heroCtaMode = true; heroCtas = []; continue;
      }
      if (heroCtaMode && stripped && !stripped.includes(":") && !matchesAny(stripped, "Agendar", "Conhecer", "Saiba", "Ver")) {
        heroCtaMode = false;
      }
      if (heroCtaMode && stripped) {
        const cta = clean(stripped);
        if (cta) heroCtas.push(cta);
        if (heroCtas.length === 1) hero.cta1 = heroCtas[0];
        if (heroCtas.length === 2) { hero.cta2 = heroCtas[1]; heroCtaMode = false; detected.push("Hero CTAs"); }
        continue;
      }
      // Loose headline detection (long text with no colon)
      if (!stripped.includes(":") && stripped.length > 20 && stripped.length < 120 && !hero.headline) {
        hero.headline = clean(stripped); detected.push("Hero headline");
        continue;
      }
    }

    if (section === "diferenciais") {
      if (matchesAny(stripped, "Tag/Label:", "Label:")) {
        const v = getAfterColon(stripped); if (v) { diferenciais.label = v; detected.push("Diferenciais label"); }
        continue;
      }
      if (matchesAny(stripped, "Headline:")) {
        const inline = getAfterColon(stripped);
        if (inline) { diferenciais.headline = inline; detected.push("Diferenciais headline"); }
        else { const next = lines[++i]?.trim(); if (next) { diferenciais.headline = clean(next); detected.push("Diferenciais headline"); } }
        continue;
      }
      if (matchesAny(stripped, "Cards de diferenciais", "Cards:")) { diferencialMode = true; continue; }

      // Table row: DestaqueTítuloDescrição (header skip) or pipe-separated or dash-separated
      // Pattern: "10+Anos de experiênciaTrajetória..."
      // Also handle: "10+ | Anos de experiência | Trajetória..."
      const pipeCard = stripped.match(/^([^|]{1,20})\|([^|]{1,60})\|(.+)$/);
      if (pipeCard) {
        diferencialCards.push({ kpi: pipeCard[1].trim(), title: pipeCard[2].trim(), desc: pipeCard[3].trim() });
        detected.push(`Diferencial: ${pipeCard[2].trim()}`);
        diferencialMode = true; continue;
      }

      // Pattern from prompt: "10+Anos de experiênciaTrajetória..."
      // These often appear concatenated or with spaces
      const concatCard = stripped.match(/^([^\s]{1,15})\s+(.{3,40})\s+(.{10,})$/);
      if (diferencialMode && concatCard && !matchesAny(stripped, "Label", "Headline", "Tag", ":")) {
        const kpi = concatCard[1].trim();
        const title = concatCard[2].trim();
        const desc = concatCard[3].trim();
        if (kpi.length <= 15 && title.length >= 3 && desc.length >= 10) {
          diferencialCards.push({ kpi, title, desc });
          detected.push(`Diferencial: ${title}`);
          continue;
        }
      }
    }

    if (section === "sobre") {
      if (matchesAny(stripped, "Tag/Label:", "Label:")) {
        const v = getAfterColon(stripped); if (v) { sobre.label = v; detected.push("Sobre label"); } continue;
      }
      if (matchesAny(stripped, "Headline:")) {
        const inline = getAfterColon(stripped);
        if (inline) { sobre.headline = inline; detected.push("Sobre headline"); }
        else { const next = lines[++i]?.trim(); if (next) { sobre.headline = clean(next); detected.push("Sobre headline"); } }
        continue;
      }
      if (matchesAny(stripped, "Texto:")) {
        const inline = getAfterColon(stripped);
        if (inline) { sobre.text = inline; detected.push("Sobre texto"); }
        else { const next = lines[++i]?.trim(); if (next) { sobre.text = clean(next); detected.push("Sobre texto"); } }
        continue;
      }
      if (matchesAny(stripped, "Botão:")) {
        const v = getAfterColon(stripped); if (v) { sobre.cta = v; detected.push("Sobre CTA"); } continue;
      }
      // Loose text detection
      if (!stripped.includes(":") && stripped.length > 40 && !sobre.text) {
        sobre.text = clean(stripped); detected.push("Sobre texto"); continue;
      }
    }

    if (section === "servicos") {
      if (matchesAny(stripped, "Tag/Label:", "Label:")) {
        const v = getAfterColon(stripped); if (v) { servicos.label = v; detected.push("Serviços label"); } continue;
      }
      if (matchesAny(stripped, "Headline:")) {
        const inline = getAfterColon(stripped);
        if (inline) { servicos.headline = inline; detected.push("Serviços headline"); }
        else { const next = lines[++i]?.trim(); if (next) { servicos.headline = clean(next); detected.push("Serviços headline"); } }
        continue;
      }
      if (matchesAny(stripped, "Subtítulo:")) {
        const v = getAfterColon(stripped); if (v) { servicos.subtitle = v; } continue;
      }
      if (matchesAny(stripped, "Cards de serviços")) { servicoMode = true; continue; }

      // Service card: "Título — Descrição" or "- Título — Descrição"
      const dashCard = stripped.match(/^[-•*]?\s*(.+?)\s*[—–-]{1,2}\s*(.+)$/);
      if (dashCard && dashCard[1].length < 60 && dashCard[2].length > 5) {
        servicoCards.push({ title: dashCard[1].replace(/^[-•*]\s*/, "").trim(), desc: dashCard[2].trim() });
        detected.push(`Serviço: ${dashCard[1].trim()}`);
        servicoMode = true; continue;
      }

      // "Título. Descrição..." (period after title)
      const dotCard = stripped.match(/^(.+?)\.\s{1,5}([A-Z].+)$/);
      if (servicoMode && dotCard && dotCard[1].length < 60) {
        servicoCards.push({ title: dotCard[1].trim(), desc: dotCard[2].trim() });
        detected.push(`Serviço: ${dotCard[1].trim()}`);
        continue;
      }
    }

    if (section === "depoimentos") {
      if (matchesAny(stripped, "Tag/Label:", "Label:")) {
        const v = getAfterColon(stripped); if (v) { depoimentos.label = v; detected.push("Depoimentos label"); } continue;
      }
      if (matchesAny(stripped, "Headline:")) {
        const inline = getAfterColon(stripped);
        if (inline) { depoimentos.headline = inline; detected.push("Depoimentos headline"); }
        else { const next = lines[++i]?.trim(); if (next) { depoimentos.headline = clean(next); detected.push("Depoimentos headline"); } }
        continue;
      }
      if (matchesAny(stripped, "Subtítulo:")) {
        const v = getAfterColon(stripped); if (v) { depoimentos.subtitle = v; } continue;
      }
      if (matchesAny(stripped, "Rodapé da seção:", "+ centenas")) {
        const v = stripped.includes(":") ? getAfterColon(stripped) : stripped;
        if (v) depoimentos.footer = v; continue;
      }

      // Quoted testimonial: "texto..." — Author | Role
      const quoteMatch = stripped.match(/^[""](.+?)[""]$/);
      if (quoteMatch) {
        // Look for author on next line
        const nextLine = lines[i + 1]?.trim() ?? "";
        const authorMatch = nextLine.match(/^[—–-]\s*(.+?)(?:\s*[|\/]\s*(.+))?$/);
        if (authorMatch) {
          testimonialItems.push({
            text: quoteMatch[1].trim(),
            author: authorMatch[1].trim(),
            role: authorMatch[2]?.trim() ?? "",
          });
          detected.push(`Depoimento: ${authorMatch[1].trim()}`);
          i++; depoimentoMode = true; continue;
        }
      }

      // Author line: — Name | Role
      if (stripped.match(/^[—–-]\s*.+[|\/].+$/)) {
        const authorMatch = stripped.match(/^[—–-]\s*(.+?)\s*[|\/]\s*(.+)$/);
        if (authorMatch && testimonialItems.length > 0) {
          const last = testimonialItems[testimonialItems.length - 1];
          last.author = authorMatch[1].trim();
          last.role = authorMatch[2].trim();
        }
        continue;
      }
    }

    if (section === "localizacao") {
      if (matchesAny(stripped, "Tag/Label:", "Label:")) {
        const v = getAfterColon(stripped); if (v) { localizacao.label = v; detected.push("Localização label"); } continue;
      }
      if (matchesAny(stripped, "Headline:")) {
        const inline = getAfterColon(stripped);
        if (inline) { localizacao.headline = inline; detected.push("Localização headline"); }
        else { const next = lines[++i]?.trim(); if (next) { localizacao.headline = clean(next); detected.push("Localização headline"); } }
        continue;
      }
      if (matchesAny(stripped, "Subtítulo:")) {
        const v = getAfterColon(stripped); if (v) localizacao.subtitle = v; continue;
      }
      if (matchesAny(stripped, "Edifício", "Edif")) {
        const v = getAfterColon(stripped) || stripped; if (v) localizacao.buildingName = v; continue;
      }
      // Hours pattern: Seg a Sex — ... | Sábados — ...
      if (matchesAny(stripped, "Seg", "Sáb", "Seg.") && stripped.includes("—")) {
        localizacao.hours = stripped; detected.push("Horários"); continue;
      }
      // Address: R. or Rua or Av. ...
      const addrMatch = stripped.match(/^(?:R\.|Rua|Av\.|Avenida|Pça\.|Praça)\s+.+/i);
      if (addrMatch) { localizacao.address = stripped; detected.push("Endereço"); continue; }
      // City/CEP
      const cityMatch = stripped.match(/,\s*\w+\s*-\s*[A-Z]{2}(?:,\s*\d{5}-\d{3})?/);
      if (cityMatch) { localizacao.city = stripped; detected.push("Cidade"); continue; }
      // Phone in location
      const locPhone = stripped.match(/^(?:📞\s*)?(\(?\d{2}\)?\s*[\d\s.()-]{7,})$/);
      if (locPhone) { localizacao.phone = stripped.replace("📞", "").trim(); continue; }
    }

    if (section === "contato") {
      if (matchesAny(stripped, "Tag/Label:", "Label:")) {
        const v = getAfterColon(stripped); if (v) { contato.label = v; detected.push("Contato label"); } continue;
      }
      if (matchesAny(stripped, "Headline:")) {
        const inline = getAfterColon(stripped);
        if (inline) { contato.headline = inline; detected.push("Contato headline"); }
        else { const next = lines[++i]?.trim(); if (next) { contato.headline = clean(next); detected.push("Contato headline"); } }
        continue;
      }
      if (matchesAny(stripped, "Subtítulo:")) {
        const v = getAfterColon(stripped); if (v) { contato.subtitle = v; detected.push("Contato subtítulo"); } continue;
      }
      if (matchesAny(stripped, "Botão:")) {
        const v = getAfterColon(stripped); if (v) { contato.cta = v; } continue;
      }
    }

    if (section === "footer") {
      // © ... ou tagline
      if (stripped.includes("·") || stripped.includes("•")) {
        const parts = stripped.split(/[·•]/).map((s) => s.trim()).filter(Boolean);
        if (parts.length >= 2) { footer.tagline = parts.join(" · "); detected.push("Footer tagline"); }
      }
    }
  }

  // Commit parsed values
  if (Object.keys(meta).length) copy.meta = meta as LandingCopy["meta"];
  if (Object.keys(hero).length) copy.hero = hero as LandingCopy["hero"];
  if (Object.keys(sobre).length) copy.sobre = sobre as LandingCopy["sobre"];
  if (Object.keys(localizacao).length) copy.localizacao = localizacao as LandingCopy["localizacao"];
  if (Object.keys(contato).length) copy.contato = contato as LandingCopy["contato"];
  if (Object.keys(footer).length) copy.footer = footer as LandingCopy["footer"];

  if (Object.keys(diferenciais).length || diferencialCards.length) {
    copy.diferenciais = {
      ...diferenciais,
      cards: diferencialCards.length ? diferencialCards : undefined,
    } as LandingCopy["diferenciais"];
  }
  if (Object.keys(servicos).length || servicoCards.length) {
    copy.servicos = {
      ...servicos,
      cards: servicoCards.length ? servicoCards : undefined,
    } as LandingCopy["servicos"];
  }
  if (Object.keys(depoimentos).length || testimonialItems.length) {
    copy.depoimentos = {
      ...depoimentos,
      items: testimonialItems.length ? testimonialItems : undefined,
    } as LandingCopy["depoimentos"];
  }

  const enriched = deriveContent(copy);
  return { copy: enriched, slug, detected: [...new Set(detected)] };
}
