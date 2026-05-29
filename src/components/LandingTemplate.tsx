import { useState } from "react";
import { motion } from "framer-motion";
import type { LandingCopy, LandingImages } from "@/lib/types";
import { getTheme } from "@/lib/themes";
import { DEFAULT_COPY } from "@/lib/defaults";
import {
  Instagram, MapPin, Phone, Clock, ArrowRight, Star,
  Navigation, ChevronDown, Menu, X, Loader2, Check,
  Stethoscope, Heart, Sparkles, Shield, Activity, Flower2,
  Users, Zap, Eye, Brain, Leaf, Sun,
} from "lucide-react";

// ── Animation helpers ─────────────────────────────────────────────────────────

function Reveal({ children, delay = 0, y = 24, className = "" }: {
  children: React.ReactNode; delay?: number; y?: number; className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function Stagger({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-60px" }}
      variants={{ hidden: {}, show: { transition: { staggerChildren: 0.1 } } }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function StaggerItem({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div
      variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } } }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const SERVICE_ICONS = [Stethoscope, Heart, Sparkles, Shield, Activity, Flower2, Users, Zap, Eye, Brain, Leaf, Sun];

function waUrl(number: string) {
  return `https://wa.me/${number.replace(/\D/g, "")}`;
}

function cleanText(s: string) {
  return s.replace(/\s*\(link:.*?\)/gi, "").replace(/https?:\/\/\S+/gi, "").trim();
}

function mapsDir(address: string) {
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`;
}

// ── Avatar placeholder ────────────────────────────────────────────────────────

function Avatar({ name, size = 12 }: { name: string; size?: number }) {
  const initial = name.charAt(0).toUpperCase();
  return (
    <div
      className={`size-${size} rounded-full bg-gradient-to-br from-accent to-bg-alt border-2 border-background flex items-center justify-center shrink-0 shadow-soft`}
    >
      <span className="font-serif text-primary" style={{ fontSize: size * 2.5 }}>{initial}</span>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

interface LandingTemplateProps {
  copy: LandingCopy;
  images: LandingImages;
  theme?: string;
}

export function LandingTemplate({ copy, images, theme }: LandingTemplateProps) {
  const wa = waUrl(copy.meta.whatsapp);
  const [menuOpen, setMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [form, setForm] = useState({ nome: "", telefone: "", email: "" });
  const [formStatus, setFormStatus] = useState<"idle" | "loading" | "done">("idle");

  const activeTheme = getTheme(theme);
  const themeStyle = Object.keys(activeTheme.vars).length > 0
    ? activeTheme.vars as React.CSSProperties
    : undefined;

  // Pad testimonials to 5
  const FALLBACK = DEFAULT_COPY.depoimentos.items;
  const testimonialItems = copy.depoimentos.items.length >= 5
    ? copy.depoimentos.items
    : [...copy.depoimentos.items, ...FALLBACK.filter(f => !copy.depoimentos.items.some(i => i.author === f.author))].slice(0, 5);

  const navLinks = [
    { label: "Home", href: "#hero" },
    { label: "Sobre", href: "#sobre" },
    { label: "Serviços", href: "#servicos" },
    { label: "Depoimentos", href: "#depoimentos" },
    { label: "Contato", href: "#contato" },
  ];

  function handleFormSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormStatus("loading");
    const msg = `Olá, ${copy.meta.doctorName}! Gostaria de agendar uma consulta.\n\nNome: ${form.nome}\nTelefone: ${form.telefone}${form.email ? `\nE-mail: ${form.email}` : ""}`;
    setTimeout(() => {
      window.open(`${wa}?text=${encodeURIComponent(msg)}`, "_blank");
      setFormStatus("done");
      setForm({ nome: "", telefone: "", email: "" });
    }, 600);
  }

  return (
    <div className="min-h-screen bg-background font-sans" style={themeStyle}>

      {/* ── HEADER ─────────────────────────────────────────────────────────── */}
      <header className="fixed top-0 inset-x-0 z-50 bg-background/92 backdrop-blur-md shadow-[0_1px_0_rgba(184,134,90,0.12),0_4px_20px_rgba(0,0,0,0.06)] transition-all duration-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 h-20 sm:h-24 flex items-center justify-between gap-4">
          <a href="#hero" className="flex items-center shrink-0">
            {images.logo ? (
              <img src={images.logo} alt={copy.meta.doctorName} className="h-12 sm:h-14 w-auto object-contain" />
            ) : (
              <div className="flex flex-col leading-none gap-1">
                <span className="font-serif text-[1.2rem] tracking-tight text-dark leading-none">{copy.meta.doctorName}</span>
                <span className="font-sans text-[8px] tracking-[0.24em] uppercase text-text-muted font-light">{copy.meta.specialty}</span>
              </div>
            )}
          </a>

          <nav className="hidden lg:flex items-center gap-10">
            {navLinks.map((l) => (
              <a key={l.href} href={l.href} className="nav-link font-sans text-[12px] tracking-[0.25em] uppercase font-light text-dark hover:text-primary transition-colors">
                {l.label}
              </a>
            ))}
          </nav>

          <a href={wa} target="_blank" rel="noreferrer"
            className="hidden lg:inline-flex items-center px-6 py-2.5 bg-gradient-gold text-white font-sans text-[11px] tracking-[0.25em] uppercase font-medium rounded-lg hover:opacity-90 transition-all hover:shadow-lg hover:shadow-primary/30 hover:scale-[1.03]">
            {cleanText(copy.hero.cta1)}
          </a>

          <div className="flex items-center gap-2 lg:hidden">
            <a href={wa} target="_blank" rel="noreferrer"
              className="inline-flex items-center bg-gradient-gold text-white font-sans text-[11px] tracking-[0.2em] uppercase font-medium px-3.5 py-2 rounded-lg">
              Agendar
            </a>
            <button onClick={() => setMenuOpen(true)} className="text-dark p-1" aria-label="Menu">
              <Menu className="size-6" />
            </button>
          </div>
        </div>
        <div className="h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

        {/* Mobile drawer */}
        {menuOpen && (
          <div className="fixed inset-0 z-[100] lg:hidden">
            <div className="absolute inset-0 bg-dark/70 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setMenuOpen(false)} />
            <div className="absolute right-0 top-0 h-[100dvh] w-[88%] max-w-sm bg-background shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
              <div className="flex items-center justify-between px-6 h-20 sm:h-24 border-b border-primary/15 shrink-0">
                <span className="font-serif text-lg text-dark">{copy.meta.doctorName}</span>
                <button onClick={() => setMenuOpen(false)} className="text-dark p-1"><X className="size-6" /></button>
              </div>
              <div className="h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent shrink-0" />
              <nav className="flex-1 flex flex-col px-8 py-6 gap-1 overflow-y-auto">
                {navLinks.map((l, i) => (
                  <a key={l.href} href={l.href} onClick={() => setMenuOpen(false)}
                    className="group font-serif text-[26px] leading-none text-dark hover:text-primary transition-colors py-4 border-b border-primary/10 flex items-center justify-between">
                    <span>{l.label}</span>
                    <span className="font-sans text-[10px] tracking-[0.25em] text-primary/40">0{i + 1}</span>
                  </a>
                ))}
              </nav>
              <div className="p-6 border-t border-primary/15 shrink-0">
                <a href={wa} target="_blank" rel="noreferrer" onClick={() => setMenuOpen(false)}
                  className="inline-flex w-full items-center justify-center px-6 py-3.5 bg-gradient-gold text-white font-sans text-[11px] tracking-[0.25em] uppercase font-medium rounded-xl">
                  {cleanText(copy.hero.cta1)}
                </a>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* ── HERO ───────────────────────────────────────────────────────────── */}
      <section id="hero" className="relative min-h-[88vh] lg:min-h-screen pt-24 sm:pt-28 lg:pt-0 lg:flex items-center overflow-hidden bg-gradient-warm">
        <div className="absolute inset-0 noise opacity-70 pointer-events-none" />
        <div className="absolute right-0 top-1/4 w-[55%] h-[60%] rounded-full bg-accent/40 blur-3xl pointer-events-none" />
        <div className="absolute -left-32 bottom-0 w-[40%] h-[50%] rounded-full bg-gold-light/15 blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-10 w-full grid lg:grid-cols-12 gap-10 lg:gap-12 items-center relative pb-16 lg:pb-0">
          {/* Text */}
          <div className="lg:col-span-5 relative order-1">
            <div className="absolute -left-6 top-2 bottom-2 w-px bg-primary hidden lg:block" />
            <Stagger className="space-y-5 sm:space-y-6 lg:space-y-7">
              <StaggerItem>
                <span className="font-sans text-[10px] sm:text-[11px] tracking-[0.25em] sm:tracking-[0.3em] uppercase text-primary font-medium">{copy.hero.label}</span>
              </StaggerItem>
              <StaggerItem>
                <h1 className="font-serif text-[2.25rem] sm:text-5xl md:text-6xl lg:text-7xl leading-[1.05] text-dark text-balance">
                  {copy.hero.headline}
                </h1>
              </StaggerItem>
              <StaggerItem>
                <p className="font-sans font-light text-text-muted text-base sm:text-lg max-w-md leading-relaxed">
                  {copy.hero.subtitle}
                </p>
              </StaggerItem>
              <StaggerItem>
                <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4 pt-2">
                  <a href={wa} target="_blank" rel="noreferrer"
                    className="group inline-flex items-center justify-center gap-3 px-6 sm:px-8 py-3.5 bg-primary text-white font-sans text-[11px] tracking-[0.25em] uppercase hover:bg-primary-dark transition-all duration-300 hover:shadow-xl hover:shadow-primary/25 rounded-xl">
                    {cleanText(copy.hero.cta1)} <ArrowRight className="size-4 group-hover:translate-x-1 transition-transform duration-200" />
                  </a>
                  <a href="#sobre"
                    className="inline-flex items-center justify-center px-6 sm:px-8 py-3.5 border border-primary text-primary font-sans text-[11px] tracking-[0.25em] uppercase hover:bg-primary hover:text-white transition-all duration-300 rounded-xl">
                    {copy.hero.cta2}
                  </a>
                </div>
              </StaggerItem>
              {copy.meta.crm && (
                <StaggerItem>
                  <p className="font-sans text-[11px] tracking-[0.2em] uppercase text-text-muted font-light">{copy.meta.crm}</p>
                </StaggerItem>
              )}
            </Stagger>
          </div>

          {/* Image — framed */}
          <div className="lg:col-span-7 relative flex justify-center lg:justify-end order-2">
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
              className="relative max-w-[300px] sm:max-w-[420px] lg:max-w-[520px] w-full"
            >
              {images.hero ? (
                <div className="relative p-2.5 sm:p-3 md:p-4 bg-gradient-to-br from-bg-alt via-background to-accent/60 shadow-premium">
                  <div className="relative p-1.5 sm:p-2 border border-gold-light/70">
                    <div className="absolute inset-0 border border-primary/20 m-[3px] pointer-events-none" />
                    <img src={images.hero} alt={copy.meta.doctorName} className="relative w-full h-auto object-cover" />
                  </div>
                  <span className="absolute top-0 left-0 w-4 h-4 sm:w-5 sm:h-5 border-t-2 border-l-2 border-primary -translate-x-1 -translate-y-1" />
                  <span className="absolute top-0 right-0 w-4 h-4 sm:w-5 sm:h-5 border-t-2 border-r-2 border-primary translate-x-1 -translate-y-1" />
                  <span className="absolute bottom-0 left-0 w-4 h-4 sm:w-5 sm:h-5 border-b-2 border-l-2 border-primary -translate-x-1 translate-y-1" />
                  <span className="absolute bottom-0 right-0 w-4 h-4 sm:w-5 sm:h-5 border-b-2 border-r-2 border-primary translate-x-1 translate-y-1" />
                </div>
              ) : (
                <div className="relative p-2.5 sm:p-3 md:p-4 bg-gradient-to-br from-bg-alt via-background to-accent/60 shadow-premium">
                  <div className="relative p-1.5 sm:p-2 border border-gold-light/70 aspect-[3/4] bg-gradient-to-br from-accent to-bg-alt flex items-center justify-center">
                    <div className="text-center p-6">
                      <span className="font-serif text-2xl text-primary/50 italic">{copy.meta.doctorName}</span>
                      <p className="font-sans text-[9px] tracking-[0.25em] uppercase text-primary/30 mt-3">{copy.meta.specialty}</p>
                    </div>
                  </div>
                  <span className="absolute top-0 left-0 w-4 h-4 sm:w-5 sm:h-5 border-t-2 border-l-2 border-primary -translate-x-1 -translate-y-1" />
                  <span className="absolute top-0 right-0 w-4 h-4 sm:w-5 sm:h-5 border-t-2 border-r-2 border-primary translate-x-1 -translate-y-1" />
                  <span className="absolute bottom-0 left-0 w-4 h-4 sm:w-5 sm:h-5 border-b-2 border-l-2 border-primary -translate-x-1 translate-y-1" />
                  <span className="absolute bottom-0 right-0 w-4 h-4 sm:w-5 sm:h-5 border-b-2 border-r-2 border-primary translate-x-1 translate-y-1" />
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── DIFERENCIAIS ───────────────────────────────────────────────────── */}
      <section className="py-16 sm:py-20 lg:py-24 bg-gradient-cream relative overflow-hidden border-t border-primary/10">
        <div className="absolute inset-0 noise opacity-50 pointer-events-none" />
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[40rem] h-[40rem] rounded-full bg-gold-light/10 blur-3xl pointer-events-none" />
        <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-10 relative">
          <Reveal>
            <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
              <span className="font-sans text-[10px] sm:text-[11px] tracking-[0.25em] sm:tracking-[0.3em] uppercase text-primary font-medium">{copy.diferenciais.label}</span>
              <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl text-dark mt-4 leading-[1.1] text-balance">{copy.diferenciais.headline}</h2>
              <div className="mt-6 mx-auto w-20 h-px bg-gradient-to-r from-transparent via-primary to-transparent" />
            </div>
          </Reveal>
          <Stagger className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            {copy.diferenciais.cards.map((card, i) => (
              <StaggerItem key={i}>
                <div className="group relative h-full bg-background/80 backdrop-blur-sm border border-primary/10 rounded-2xl p-6 sm:p-7 shadow-soft hover:shadow-premium transition-all duration-500 hover:-translate-y-1.5 overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-primary to-transparent opacity-60" />
                  <div className="absolute -top-16 -right-16 w-40 h-40 rounded-full bg-gradient-gold opacity-[0.07] blur-2xl group-hover:opacity-[0.14] transition-opacity" />
                  <div className="relative">
                    <div className="font-serif text-2xl sm:text-3xl bg-gradient-gold bg-clip-text text-transparent leading-none mb-3">{card.kpi}</div>
                    <h3 className="font-serif text-base sm:text-lg text-dark mb-2 leading-tight">{card.title}</h3>
                    <p className="font-sans text-[13px] text-text-muted font-light leading-relaxed">{card.desc}</p>
                  </div>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      {/* ── SOBRE ──────────────────────────────────────────────────────────── */}
      <section id="sobre" className="py-16 sm:py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-10 grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <Reveal>
            <div className="relative max-w-md mx-auto lg:max-w-none w-full">
              <div className="absolute -inset-3 sm:-inset-4 border border-primary/40 -rotate-2" />
              {images.about ? (
                <div className="relative aspect-[4/5] -rotate-2 overflow-hidden">
                  <img src={images.about} alt={copy.meta.doctorName} className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="relative aspect-[4/5] bg-gradient-to-br from-accent to-bg-alt -rotate-2 flex items-center justify-center">
                  <span className="font-serif text-xl text-primary/40 italic rotate-2">{copy.sobre.label}</span>
                </div>
              )}
            </div>
          </Reveal>

          <Reveal delay={0.15}>
            <div>
              <span className="font-sans text-[10px] sm:text-[11px] tracking-[0.25em] sm:tracking-[0.3em] uppercase text-primary font-medium">{copy.sobre.label}</span>
              <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl text-dark mt-4 text-balance leading-tight">{copy.sobre.headline}</h2>
              <div className="w-16 h-px bg-primary my-6 sm:my-8" />
              <p className="font-sans text-text-muted font-light leading-relaxed text-[15px] sm:text-base whitespace-pre-line">{copy.sobre.text}</p>
              {copy.meta.crm && <p className="font-sans text-xs tracking-[0.25em] uppercase text-primary mt-6 sm:mt-8">{copy.meta.crm}</p>}
              <a href={wa} target="_blank" rel="noreferrer"
                className="group inline-flex items-center gap-3 mt-7 sm:mt-8 text-primary font-sans text-[11px] tracking-[0.25em] uppercase">
                {cleanText(copy.sobre.cta)} <ArrowRight className="size-4 group-hover:translate-x-1 transition-transform" />
              </a>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── SERVIÇOS ───────────────────────────────────────────────────────── */}
      <section id="servicos" className="py-16 sm:py-20 lg:py-28 bg-gradient-cream relative overflow-hidden">
        <div className="absolute inset-0 noise opacity-50 pointer-events-none" />
        <div className="absolute top-20 right-10 w-72 h-72 rounded-full bg-accent/30 blur-3xl pointer-events-none" />
        <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-10 relative">
          <Reveal>
            <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
              <span className="font-sans text-[10px] sm:text-[11px] tracking-[0.25em] sm:tracking-[0.3em] uppercase text-primary font-medium">{copy.servicos.label}</span>
              <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl text-dark mt-4">{copy.servicos.headline}</h2>
              <p className="font-sans text-text-muted font-light mt-4 text-sm sm:text-base">{copy.servicos.subtitle}</p>
            </div>
          </Reveal>
          <Stagger className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {copy.servicos.cards.map((s, i) => {
              const Icon = SERVICE_ICONS[i % SERVICE_ICONS.length];
              return (
                <StaggerItem key={i}>
                  <motion.div
                    whileHover={{ y: -6 }}
                    transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                    className="group relative bg-background/80 backdrop-blur-sm p-7 sm:p-8 border border-border/60 hover:border-primary/40 transition-all duration-300 shadow-soft hover:shadow-premium h-full rounded-2xl overflow-hidden"
                  >
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-br from-accent/30 via-transparent to-transparent pointer-events-none" />
                    <div className="relative">
                      <div className="inline-flex items-center justify-center size-12 sm:size-14 rounded-full bg-gradient-to-br from-accent to-bg-alt mb-5 sm:mb-6">
                        <Icon className="size-6 sm:size-7 text-primary stroke-[1.25]" />
                      </div>
                      <h3 className="font-serif text-xl sm:text-2xl text-dark mb-3">{s.title}</h3>
                      <p className="font-sans text-sm text-text-muted font-light leading-relaxed">{s.desc}</p>
                      <span className="inline-flex items-center gap-2 mt-5 sm:mt-6 text-primary text-[11px] tracking-[0.25em] uppercase group-hover:gap-3 transition-all duration-200">
                        Saiba mais <ArrowRight className="size-3" />
                      </span>
                    </div>
                  </motion.div>
                </StaggerItem>
              );
            })}
          </Stagger>
        </div>
      </section>

      {/* ── DEPOIMENTOS ────────────────────────────────────────────────────── */}
      <section id="depoimentos" className="py-16 sm:py-20 lg:py-28 bg-gradient-cream relative overflow-hidden">
        <div className="absolute inset-0 noise opacity-50 pointer-events-none" />
        <div className="absolute -top-20 -left-20 w-96 h-96 rounded-full bg-accent/40 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -right-20 w-96 h-96 rounded-full bg-gold-light/20 blur-3xl pointer-events-none" />
        <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-10 relative">
          <Reveal>
            <div className="text-center mb-12 sm:mb-16 max-w-2xl mx-auto">
              <span className="font-sans text-[10px] sm:text-[11px] tracking-[0.25em] sm:tracking-[0.3em] uppercase text-primary font-medium">{copy.depoimentos.label}</span>
              <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl text-dark mt-4 text-balance">{copy.depoimentos.headline}</h2>
              <p className="font-sans text-text-muted font-light mt-4 text-sm sm:text-base">{copy.depoimentos.subtitle}</p>
            </div>
          </Reveal>

          <Stagger className="grid grid-cols-1 md:grid-cols-6 gap-4 sm:gap-5">
            {/* Card 0 — left top */}
            <StaggerItem className="md:col-span-2">
              <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                className="relative bg-background/90 backdrop-blur-sm p-7 rounded-2xl shadow-soft border border-border/40 h-full">
                <span className="absolute top-4 left-5 font-serif text-5xl text-primary/30 leading-none">"</span>
                <p className="font-sans text-sm text-text-muted font-light leading-relaxed pt-6">{testimonialItems[0]?.text}</p>
                <div className="mt-6 pt-5 border-t border-border/50 flex items-center gap-3">
                  <Avatar name={testimonialItems[0]?.author ?? "P"} size={12} />
                  <div>
                    <p className="font-sans text-sm text-dark font-medium">{testimonialItems[0]?.author}</p>
                    <p className="font-sans text-[11px] text-primary tracking-wide italic">{testimonialItems[0]?.role}</p>
                  </div>
                </div>
              </motion.div>
            </StaggerItem>

            {/* Card 1 — center FEATURED (row-span-2) */}
            <StaggerItem className="md:col-span-2 md:row-span-2">
              <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                className="relative bg-background/90 backdrop-blur-sm p-8 rounded-2xl shadow-soft border border-border/40 h-full overflow-hidden flex flex-col justify-between min-h-[360px]">
                <div className="relative">
                  <div className="flex justify-center gap-1 mb-5">
                    {[...Array(5)].map((_, k) => <Star key={k} className="size-4 fill-gold-light text-gold-light" />)}
                  </div>
                  <h3 className="font-serif text-2xl md:text-3xl text-center text-balance leading-tight text-dark">
                    {copy.diferenciais.cards[1]?.title ?? "Atendimento que acolhe"}
                  </h3>
                  <p className="font-sans text-sm text-text-muted font-light leading-relaxed mt-5 text-center">{testimonialItems[2]?.text}</p>
                </div>
                <div className="flex items-center justify-center gap-3 mt-6 pt-5 border-t border-border/50">
                  <Avatar name={testimonialItems[2]?.author ?? "C"} size={12} />
                  <div className="text-left">
                    <p className="font-sans text-sm text-dark font-medium">{testimonialItems[2]?.author}</p>
                    <p className="font-sans text-[11px] text-primary tracking-wide italic">{testimonialItems[2]?.role}</p>
                  </div>
                </div>
              </motion.div>
            </StaggerItem>

            {/* Card 2 — right top */}
            <StaggerItem className="md:col-span-2">
              <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                className="relative bg-background/90 backdrop-blur-sm p-7 rounded-2xl shadow-soft border border-border/40 h-full">
                <div className="flex items-center gap-3 mb-4">
                  <Avatar name={testimonialItems[3]?.author ?? "F"} size={12} />
                  <div>
                    <p className="font-sans text-sm text-dark font-medium">{testimonialItems[3]?.author}</p>
                    <p className="font-sans text-[11px] text-primary tracking-wide italic">{testimonialItems[3]?.role}</p>
                  </div>
                </div>
                <div className="flex gap-1 mb-3">{[...Array(5)].map((_, k) => <Star key={k} className="size-3.5 fill-gold-light text-gold-light" />)}</div>
                <p className="font-sans text-sm text-text-muted font-light leading-relaxed italic">"{testimonialItems[3]?.text}"</p>
              </motion.div>
            </StaggerItem>

            {/* Card 3 — left bottom */}
            <StaggerItem className="md:col-span-2">
              <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                className="relative bg-gradient-warm p-7 rounded-2xl shadow-soft border border-primary/15 h-full overflow-hidden">
                <div className="absolute inset-0 noise opacity-60 pointer-events-none" />
                <div className="relative">
                  <span className="font-serif text-4xl bg-gradient-gold bg-clip-text text-transparent leading-none">"</span>
                  <p className="font-sans text-sm text-dark/80 font-light leading-relaxed mt-2">{testimonialItems[1]?.text}</p>
                  <div className="mt-5 flex items-center gap-3">
                    <Avatar name={testimonialItems[1]?.author ?? "A"} size={10} />
                    <div>
                      <p className="font-sans text-sm text-dark font-medium">{testimonialItems[1]?.author}</p>
                      <p className="font-sans text-[11px] text-primary tracking-wide italic">{testimonialItems[1]?.role}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </StaggerItem>

            {/* Card 4 — right bottom */}
            <StaggerItem className="md:col-span-2">
              <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                className="relative bg-background/90 backdrop-blur-sm p-7 rounded-2xl shadow-soft border border-border/40 h-full">
                <p className="font-serif text-lg text-dark/90 italic leading-relaxed text-balance">"{testimonialItems[4]?.text}"</p>
                <div className="mt-6 pt-5 border-t border-border/50 flex items-center justify-between gap-3">
                  <div>
                    <p className="font-sans text-sm text-dark font-medium">{testimonialItems[4]?.author}</p>
                    <p className="font-sans text-[11px] text-primary tracking-wide italic">{testimonialItems[4]?.role}</p>
                  </div>
                  <Avatar name={testimonialItems[4]?.author ?? "M"} size={12} />
                </div>
              </motion.div>
            </StaggerItem>
          </Stagger>

          {/* Bottom bar */}
          <Reveal delay={0.2}>
            <div className="flex flex-wrap items-center justify-center gap-4 mt-14">
              <div className="flex -space-x-3">
                {testimonialItems.slice(0, 4).map((t, i) => (
                  <div key={i} className="size-10 rounded-full border-2 border-background bg-gradient-to-br from-accent to-bg-alt flex items-center justify-center shadow-soft">
                    <span className="font-serif text-primary text-sm">{t.author.charAt(0)}</span>
                  </div>
                ))}
              </div>
              <div className="flex gap-1">{[...Array(5)].map((_, k) => <Star key={k} className="size-4 fill-gold-light text-gold-light" />)}</div>
              {copy.depoimentos.footer && (
                <span className="font-sans text-sm text-text-muted">{copy.depoimentos.footer}</span>
              )}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── FAQ ────────────────────────────────────────────────────────────── */}
      {copy.faq.items.length > 0 && (
        <section className="py-16 sm:py-20 lg:py-28 bg-background">
          <div className="max-w-4xl mx-auto px-5 sm:px-6 lg:px-10">
            <Reveal>
              <div className="text-center mb-12 sm:mb-16">
                <span className="font-sans text-[10px] sm:text-[11px] tracking-[0.25em] sm:tracking-[0.3em] uppercase text-primary font-medium">{copy.faq.label}</span>
                <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl text-dark mt-4">{copy.faq.headline}</h2>
              </div>
            </Reveal>
            <div className="space-y-3">
              {copy.faq.items.map((item, i) => (
                <Reveal key={i} delay={i * 0.05}>
                  <div data-open={openFaq === i ? "true" : undefined} className="border border-border/60 bg-background/85 backdrop-blur-sm rounded-2xl overflow-hidden data-[open=true]:border-primary/35 transition-all duration-300">
                    <button
                      onClick={() => setOpenFaq(openFaq === i ? null : i)}
                      className="w-full flex items-center justify-between px-7 py-5 sm:py-6 text-left hover:bg-accent/20 transition-colors"
                    >
                      <span className="font-serif text-lg sm:text-xl text-dark hover:text-primary transition-colors pr-4">{item.question}</span>
                      <ChevronDown className={`size-5 text-primary shrink-0 transition-transform duration-300 ${openFaq === i ? "rotate-180" : ""}`} />
                    </button>
                    {openFaq === i && (
                      <div className="px-7 pb-6">
                        <p className="font-sans font-light text-text-muted text-base leading-relaxed">{item.answer}</p>
                      </div>
                    )}
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── LOCALIZAÇÃO ────────────────────────────────────────────────────── */}
      <section className="py-16 sm:py-20 lg:py-28 bg-bg-alt/30">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-10">
          <Reveal>
            <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
              <span className="font-sans text-[10px] sm:text-[11px] tracking-[0.25em] sm:tracking-[0.3em] uppercase text-primary font-medium">{copy.localizacao.label}</span>
              <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl text-dark mt-4 text-balance">{copy.localizacao.headline}</h2>
              <div className="w-12 h-px bg-primary mx-auto my-6" />
              <p className="font-sans font-light text-text-muted text-[15px] sm:text-base leading-relaxed">{copy.localizacao.subtitle}</p>
            </div>
          </Reveal>

          <Reveal>
            <div className="relative max-w-4xl mx-auto bg-background rounded-2xl border border-primary/20 shadow-premium overflow-hidden">
              <div className="absolute top-5 right-5 z-10 inline-flex items-center gap-2 px-3.5 py-1.5 bg-background/96 backdrop-blur-sm border border-primary/25 rounded-full shadow-card">
                <MapPin className="size-3.5 text-primary" />
                <span className="font-sans text-[10px] tracking-[0.25em] uppercase text-primary font-medium">Consultório</span>
              </div>
              <div className="relative w-full h-[260px] sm:h-[340px] lg:h-[380px] border-b border-primary/15">
                {copy.localizacao.mapsEmbed ? (
                  <iframe
                    title="Localização"
                    src={copy.localizacao.mapsEmbed}
                    className="w-full h-full grayscale-[30%] hover:grayscale-0 transition-all duration-700"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-warm">
                    <p className="font-sans text-sm text-text-muted">Configure o endereço para exibir o mapa</p>
                  </div>
                )}
              </div>
              <div className="p-6 sm:p-8 lg:p-10">
                <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-7">
                  <div>
                    <h3 className="font-serif text-2xl sm:text-3xl text-dark leading-tight">
                      {copy.localizacao.buildingName ?? copy.localizacao.address}
                    </h3>
                    <p className="font-sans text-[13px] text-text-muted mt-1.5">{copy.localizacao.city}</p>
                  </div>
                  <div className="flex gap-2.5">
                    <a href={mapsDir(copy.localizacao.address)} target="_blank" rel="noreferrer"
                      className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-gold text-white font-sans text-[10px] tracking-[0.25em] uppercase rounded-lg transition-all hover:shadow-lg hover:shadow-primary/30 hover:scale-[1.02]">
                      <Navigation className="size-3.5" /> Como chegar
                    </a>
                    <a href={wa} target="_blank" rel="noreferrer"
                      className="inline-flex items-center justify-center px-5 py-2.5 border border-primary/40 text-primary font-sans text-[10px] tracking-[0.25em] uppercase rounded-lg transition-all hover:bg-primary hover:text-white hover:border-primary">
                      Agendar
                    </a>
                  </div>
                </div>
                <div className="grid sm:grid-cols-3 gap-5 sm:gap-6 pt-6 border-t border-primary/15 font-sans text-[13.5px] text-text-muted font-light">
                  <div className="flex gap-3">
                    <MapPin className="size-4 text-primary shrink-0 mt-0.5" />
                    <span className="leading-relaxed">{copy.localizacao.address}<br />{copy.localizacao.city}</span>
                  </div>
                  <div className="flex gap-3">
                    <Clock className="size-4 text-primary shrink-0 mt-0.5" />
                    <span className="leading-relaxed">{copy.localizacao.hours}</span>
                  </div>
                  <div className="flex gap-3">
                    <Phone className="size-4 text-primary shrink-0 mt-0.5" />
                    <a href={`tel:${copy.localizacao.phone.replace(/\D/g, "")}`} className="hover:text-primary transition-colors">
                      {copy.localizacao.phone}
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── CONTATO / CTA ──────────────────────────────────────────────────── */}
      <section id="contato" className="relative py-16 sm:py-20 lg:py-28 overflow-hidden bg-gradient-dark">
        <div className="absolute inset-0 noise-dark opacity-70" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[60%] h-1 bg-gradient-to-r from-transparent via-gold-light/60 to-transparent" />
        <div className="absolute -top-32 -left-20 w-[28rem] h-[28rem] rounded-full bg-primary/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -right-20 w-[28rem] h-[28rem] rounded-full bg-gold-light/10 blur-3xl pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-5 sm:px-6 lg:px-10 grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <Reveal>
            <div className="text-white">
              <span className="font-sans text-[10px] sm:text-[11px] tracking-[0.25em] sm:tracking-[0.3em] uppercase text-gold-light/90 font-medium">{copy.contato.label}</span>
              <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-[3.25rem] text-balance leading-[1.05] mt-5">
                {copy.contato.headline}
              </h2>
              <p className="font-sans font-light text-white/70 mt-5 sm:mt-6 max-w-md leading-relaxed text-[15px] sm:text-base">
                {copy.contato.subtitle}
              </p>
              <a href={wa} target="_blank" rel="noreferrer"
                className="inline-flex items-center gap-3 mt-7 sm:mt-8 px-7 sm:px-8 py-3.5 bg-gradient-gold text-white font-sans text-[11px] tracking-[0.3em] uppercase rounded-xl transition-all duration-300 hover:shadow-2xl hover:shadow-primary/40 hover:scale-[1.02]">
                {cleanText(copy.contato.cta)} <ArrowRight className="size-4" />
              </a>
            </div>
          </Reveal>

          <Reveal delay={0.15}>
            <div className="relative">
              <div className="absolute -inset-4 border border-gold-light/20 rounded-2xl -rotate-1 hidden md:block" />
              <form onSubmit={handleFormSubmit}
                className="relative bg-background/96 backdrop-blur-sm p-6 sm:p-8 md:p-10 rounded-2xl shadow-premium border border-white/8">
                <div className="mb-6">
                  <h3 className="font-serif text-2xl text-dark">{copy.contato.formTitle}</h3>
                  <p className="font-sans text-sm text-text-muted font-light mt-1">{copy.contato.formSubtitle}</p>
                </div>
                <div className="space-y-4">
                  {[
                    { key: "nome", label: "Nome*", type: "text", placeholder: "Seu nome completo", required: true },
                    { key: "telefone", label: "Telefone*", type: "tel", placeholder: "(00) 00000-0000", required: true },
                    { key: "email", label: "E-mail", type: "email", placeholder: "voce@email.com", required: false },
                  ].map(({ key, label, type, placeholder, required }) => (
                    <div key={key}>
                      <label className="font-sans text-[11px] tracking-[0.2em] uppercase text-text-muted block mb-2">{label}</label>
                      <input
                        type={type}
                        required={required}
                        value={form[key as keyof typeof form]}
                        onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}
                        placeholder={placeholder}
                        className="w-full bg-bg-alt/40 border border-border/60 px-4 py-3 text-sm font-sans text-dark focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 transition-all duration-200 rounded-xl"
                      />
                    </div>
                  ))}
                </div>
                <button
                  type="submit"
                  disabled={formStatus === "loading" || formStatus === "done"}
                  className="w-full mt-7 inline-flex items-center justify-center gap-3 px-8 py-3.5 bg-gradient-gold text-white font-sans text-[11px] tracking-[0.3em] uppercase transition-all duration-300 hover:shadow-xl hover:shadow-primary/30 hover:scale-[1.01] disabled:opacity-70 disabled:cursor-not-allowed rounded-xl"
                >
                  {formStatus === "loading" && <><Loader2 className="size-4 animate-spin" /> Enviando</>}
                  {formStatus === "done" && <><Check className="size-4" /> Enviado!</>}
                  {formStatus === "idle" && <>Quero ser contatada <ArrowRight className="size-4" /></>}
                </button>
                <p className="font-sans text-[11px] text-text-muted text-center mt-4 font-light">Seus dados são tratados com sigilo.</p>
              </form>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── FOOTER ─────────────────────────────────────────────────────────── */}
      <footer className="bg-gradient-footer text-white relative overflow-hidden">
        <div className="absolute inset-0 noise-dark opacity-60 pointer-events-none" />
        <div className="gold-divider relative" />
        <div className="relative max-w-7xl mx-auto px-6 lg:px-10 pt-16 sm:pt-20 pb-10 flex flex-col items-center text-center">
          {images.logo ? (
            <img src={images.logo} alt={copy.meta.doctorName} className="h-16 sm:h-20 w-auto object-contain mb-6 opacity-90 brightness-0 invert" />
          ) : (
            <div className="mb-6">
              <p className="font-serif text-2xl text-white">{copy.meta.doctorName}</p>
              <p className="font-sans text-[10px] tracking-[0.3em] uppercase text-white/40 mt-1">{copy.meta.specialty}</p>
            </div>
          )}
          <div className="w-12 h-px bg-primary/50 mb-8" />
        </div>
        <div className="relative max-w-7xl mx-auto px-6 lg:px-10 pb-16 grid sm:grid-cols-2 md:grid-cols-3 gap-10 sm:gap-12">
          <div>
            <h4 className="font-sans text-[11px] tracking-[0.3em] uppercase text-primary font-medium mb-5">Navegação</h4>
            <ul className="space-y-3 font-sans text-sm text-white/70 font-light">
              {navLinks.map(l => (
                <li key={l.href}><a href={l.href} className="hover:text-primary transition-colors">{l.label}</a></li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-sans text-[11px] tracking-[0.3em] uppercase text-primary font-medium mb-5">Consultório</h4>
            <ul className="space-y-3 font-sans text-sm text-white/70 font-light">
              {copy.localizacao.buildingName && <li>{copy.localizacao.buildingName}</li>}
              <li className="leading-relaxed">{copy.localizacao.address}</li>
              <li className="leading-relaxed">{copy.localizacao.city}</li>
              <li className="leading-relaxed">{copy.localizacao.hours}</li>
            </ul>
          </div>
          <div>
            <h4 className="font-sans text-[11px] tracking-[0.3em] uppercase text-primary font-medium mb-5">Contato</h4>
            <ul className="space-y-4 font-sans text-sm text-white/70 font-light">
              <li><a href={wa} className="hover:text-primary transition-colors">{copy.localizacao.phone}</a></li>
              {copy.meta.instagramUrl && (
                <li className="flex items-center gap-2">
                  <Instagram className="size-4" />
                  <a href={copy.meta.instagramUrl} target="_blank" rel="noreferrer" className="hover:text-primary transition-colors">{copy.meta.instagram}</a>
                </li>
              )}
            </ul>
          </div>
        </div>
        <div className="relative border-t border-white/10">
          <div className="max-w-7xl mx-auto px-6 lg:px-10 py-6 flex flex-col sm:flex-row items-center sm:justify-between gap-4 text-center sm:text-left">
            <div className="space-y-1.5">
              <p className="font-sans text-[11px] tracking-[0.18em] uppercase text-white/55 font-light">
                © {new Date().getFullYear()} {copy.meta.doctorName} — Todos os direitos reservados
              </p>
              {copy.meta.crm && (
                <p className="font-sans text-[10px] tracking-[0.25em] uppercase text-primary/70 font-light">{copy.meta.crm}</p>
              )}
            </div>
            <p className="font-serif italic text-[14px] text-primary/90">{copy.footer.tagline}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
