import { useState } from "react";
import type { LandingCopy, LandingImages } from "@/lib/types";
import { Instagram, MapPin, Phone, Clock, ArrowRight, Star, Navigation, ChevronDown, Menu, X } from "lucide-react";

interface LandingTemplateProps {
  copy: LandingCopy;
  images: LandingImages;
}

function waUrl(number: string) {
  const n = number.replace(/\D/g, "");
  return `https://wa.me/${n}`;
}

function cleanText(s: string) {
  return s.replace(/\s*\(link:.*?\)/gi, "").replace(/https?:\/\/\S+/gi, "").trim();
}

function MapsUrl(address: string) {
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`;
}

export function LandingTemplate({ copy, images }: LandingTemplateProps) {
  const wa = waUrl(copy.meta.whatsapp);
  const [menuOpen, setMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [form, setForm] = useState({ nome: "", telefone: "", email: "" });

  const navLinks = [
    { label: "Home", href: "#hero" },
    { label: "Sobre", href: "#sobre" },
    { label: "Serviços", href: "#servicos" },
    { label: "Depoimentos", href: "#depoimentos" },
    { label: "Contato", href: "#contato" },
  ];

  function handleFormSubmit(e: React.FormEvent) {
    e.preventDefault();
    const msg = `Olá, ${copy.meta.doctorName}! Gostaria de agendar uma consulta.\n\nNome: ${form.nome}\nTelefone: ${form.telefone}${form.email ? `\nE-mail: ${form.email}` : ""}`;
    window.open(`${wa}?text=${encodeURIComponent(msg)}`, "_blank");
  }

  return (
    <div className="min-h-screen bg-background font-sans">

      {/* ── HEADER ── */}
      <header className="fixed top-0 inset-x-0 z-50 transition-all duration-500 bg-background/92 backdrop-blur-md shadow-[0_1px_0_rgba(184,134,90,0.12),0_4px_20px_rgba(0,0,0,0.06)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 h-20 sm:h-24 flex items-center justify-between gap-4">
          {/* Logo */}
          <a href="#hero" className="flex items-center shrink-0">
            {images.logo ? (
              <img src={images.logo} alt={copy.meta.doctorName} className="h-12 sm:h-14 w-auto object-contain" />
            ) : (
              <div className="flex flex-col leading-none gap-1">
                <span className="font-serif text-[1.25rem] tracking-tight text-dark leading-none">{copy.meta.doctorName}</span>
                <span className="font-sans text-[8px] tracking-[0.24em] uppercase text-text-muted font-light">{copy.meta.specialty}</span>
              </div>
            )}
          </a>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-10">
            {navLinks.map((l) => (
              <a key={l.href} href={l.href} className="font-sans text-[12px] tracking-[0.25em] uppercase font-light text-dark hover:text-primary transition-colors">
                {l.label}
              </a>
            ))}
          </nav>

          {/* Desktop CTA */}
          <a href={wa} target="_blank" rel="noreferrer" className="hidden lg:inline-flex items-center px-6 py-2.5 bg-gradient-gold text-white font-sans text-[11px] tracking-[0.25em] uppercase font-medium transition-all duration-300 hover:opacity-90 rounded-lg">
            {cleanText(copy.hero.cta1)}
          </a>

          {/* Mobile */}
          <div className="flex items-center gap-2 lg:hidden">
            <a href={wa} target="_blank" rel="noreferrer" className="inline-flex items-center bg-gradient-gold text-white font-sans text-[11px] tracking-[0.2em] uppercase font-medium px-3.5 py-2 rounded-lg">
              Agendar
            </a>
            <button onClick={() => setMenuOpen(true)} className="text-dark p-1" aria-label="Menu">
              <Menu className="size-6" />
            </button>
          </div>
        </div>
        <div className="h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

        {/* Mobile menu drawer */}
        {menuOpen && (
          <div className="fixed inset-0 z-[100] lg:hidden">
            <div className="absolute inset-0 bg-dark/70 backdrop-blur-sm" onClick={() => setMenuOpen(false)} />
            <div className="absolute right-0 top-0 h-[100dvh] w-[88%] max-w-sm bg-background shadow-2xl flex flex-col">
              <div className="flex items-center justify-between px-6 h-20 border-b border-primary/15">
                <span className="font-serif text-lg text-dark">{copy.meta.doctorName}</span>
                <button onClick={() => setMenuOpen(false)} className="text-dark p-1"><X className="size-6" /></button>
              </div>
              <nav className="flex-1 flex flex-col px-8 py-6 gap-1">
                {navLinks.map((l) => (
                  <a key={l.href} href={l.href} onClick={() => setMenuOpen(false)}
                    className="font-serif text-[26px] leading-none text-dark hover:text-primary transition-colors py-4 border-b border-primary/10">
                    {l.label}
                  </a>
                ))}
              </nav>
              <div className="p-6 border-t border-primary/15">
                <a href={wa} target="_blank" rel="noreferrer" onClick={() => setMenuOpen(false)}
                  className="inline-flex w-full items-center justify-center px-6 py-3.5 bg-gradient-gold text-white font-sans text-[11px] tracking-[0.25em] uppercase font-medium rounded-xl">
                  {cleanText(copy.hero.cta1)}
                </a>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* ── HERO ── */}
      <section id="hero" className="relative min-h-screen flex items-center pt-20 sm:pt-24 bg-gradient-warm overflow-hidden">
        <div className="absolute inset-0 noise opacity-60 pointer-events-none" />
        <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-10 w-full grid lg:grid-cols-2 gap-12 items-center py-16 sm:py-24">
          <div className="relative z-10">
            <span className="font-sans text-[10px] sm:text-[11px] tracking-[0.3em] uppercase text-primary font-medium block mb-6">
              {copy.hero.label}
            </span>
            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl text-dark mb-6 leading-tight text-balance">
              {copy.hero.headline}
            </h1>
            <p className="font-sans font-light text-text-muted text-base sm:text-lg leading-relaxed mb-10 max-w-lg">
              {copy.hero.subtitle}
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <a href={wa} target="_blank" rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-gold text-white font-sans text-[11px] tracking-[0.25em] uppercase font-medium rounded-xl hover:opacity-90 transition-opacity shadow-lg shadow-primary/25">
                {cleanText(copy.hero.cta1)} <ArrowRight className="size-4" />
              </a>
              <a href="#sobre"
                className="inline-flex items-center justify-center px-8 py-4 border border-primary/40 text-primary font-sans text-[11px] tracking-[0.25em] uppercase font-medium rounded-xl hover:bg-primary/5 transition-colors">
                {copy.hero.cta2}
              </a>
            </div>
            {copy.meta.crm && (
              <p className="mt-8 font-sans text-[11px] tracking-[0.2em] uppercase text-text-muted font-light">{copy.meta.crm}</p>
            )}
          </div>

          <div className="relative hidden lg:flex justify-center">
            {images.hero ? (
              <div className="relative">
                <div className="absolute -inset-3 border border-primary/30 rounded-2xl" />
                <img src={images.hero} alt={copy.meta.doctorName} className="relative w-full max-w-md aspect-[3/4] object-cover rounded-2xl shadow-[0_32px_64px_rgba(0,0,0,0.18)]" />
              </div>
            ) : (
              <div className="relative">
                <div className="absolute -inset-3 border border-primary/30 rounded-2xl" />
                <div className="relative w-full max-w-md aspect-[3/4] bg-gradient-to-br from-accent to-bg-alt rounded-2xl shadow-premium flex items-center justify-center">
                  <div className="text-center p-8">
                    <span className="font-serif text-3xl text-primary/60 italic">{copy.meta.doctorName}</span>
                    <p className="font-sans text-[10px] tracking-[0.25em] uppercase text-primary/40 mt-3">{copy.meta.specialty}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── DIFERENCIAIS ── */}
      <section className="py-20 lg:py-28 bg-gradient-cream relative overflow-hidden">
        <div className="absolute inset-0 noise opacity-50 pointer-events-none" />
        <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-10 relative">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="font-sans text-[10px] sm:text-[11px] tracking-[0.3em] uppercase text-primary font-medium">{copy.diferenciais.label}</span>
            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl text-dark mt-4 leading-tight text-balance">{copy.diferenciais.headline}</h2>
            <div className="mt-6 mx-auto w-20 h-px bg-gradient-to-r from-transparent via-primary to-transparent" />
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            {copy.diferenciais.cards.map((card, i) => (
              <div key={i} className="group relative bg-background/80 border border-primary/10 rounded-2xl p-6 sm:p-7 shadow-soft hover:shadow-premium transition-all duration-500 hover:-translate-y-1.5 overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-primary to-transparent opacity-60" />
                <div className="font-serif text-2xl sm:text-3xl bg-gradient-gold bg-clip-text text-transparent leading-none mb-3">{card.kpi}</div>
                <h3 className="font-serif text-base sm:text-lg text-dark mb-2 leading-tight">{card.title}</h3>
                <p className="font-sans text-[13px] text-text-muted font-light leading-relaxed">{card.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SOBRE ── */}
      <section id="sobre" className="py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-10 grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div className="relative">
            {images.about ? (
              <div className="relative">
                <div className="absolute -inset-4 border border-primary/40" />
                <img src={images.about} alt={copy.meta.doctorName} className="relative w-full aspect-[4/5] object-cover shadow-xl" />
              </div>
            ) : (
              <div className="relative">
                <div className="absolute -inset-4 border border-primary/40" />
                <div className="relative w-full aspect-[4/5] bg-gradient-to-br from-accent to-bg-alt flex items-center justify-center shadow-xl">
                  <span className="font-serif text-2xl text-primary/40 italic">{copy.sobre.label}</span>
                </div>
              </div>
            )}
          </div>
          <div>
            <span className="font-sans text-[11px] tracking-[0.3em] uppercase text-primary">{copy.sobre.label}</span>
            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl text-dark mt-4 text-balance leading-tight">{copy.sobre.headline}</h2>
            <div className="w-16 h-px bg-primary my-8" />
            <p className="font-sans font-light text-text-muted leading-relaxed text-base whitespace-pre-line">{copy.sobre.text}</p>
            {copy.meta.crm && (
              <p className="font-sans text-xs tracking-[0.25em] uppercase text-primary mt-8">{copy.meta.crm}</p>
            )}
            <a href={wa} target="_blank" rel="noreferrer"
              className="inline-flex items-center gap-3 mt-8 px-8 py-3.5 bg-gradient-gold text-white font-sans text-[11px] tracking-[0.25em] uppercase rounded-xl transition-all duration-300 hover:opacity-90 hover:scale-[1.02]">
              {cleanText(copy.sobre.cta)} <ArrowRight className="size-4" />
            </a>
          </div>
        </div>
      </section>

      {/* ── SERVIÇOS ── */}
      <section id="servicos" className="py-20 lg:py-28 bg-gradient-rose relative overflow-hidden">
        <div className="absolute inset-0 noise-dark opacity-60 pointer-events-none" />
        <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-10 relative">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="font-sans text-[10px] sm:text-[11px] tracking-[0.3em] uppercase text-white/60 font-medium">{copy.servicos.label}</span>
            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl text-white mt-4 text-balance">{copy.servicos.headline}</h2>
            <p className="font-sans font-light text-white/65 mt-4 text-base">{copy.servicos.subtitle}</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {copy.servicos.cards.map((card, i) => (
              <div key={i} className="group bg-white/8 border border-white/12 rounded-2xl p-6 hover:bg-white/14 transition-all duration-300 hover:-translate-y-1">
                <div className="flex items-start gap-3 mb-3">
                  <span className="font-sans text-[10px] tracking-[0.3em] uppercase text-primary/80 shrink-0 mt-1">0{i + 1}</span>
                  <h3 className="font-serif text-lg text-white">{card.title}</h3>
                </div>
                <p className="font-sans text-white/55 font-light text-sm leading-relaxed pl-6">{card.desc}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-12">
            <a href={wa} target="_blank" rel="noreferrer"
              className="inline-flex items-center gap-3 px-8 py-3.5 bg-gradient-gold text-white font-sans text-[11px] tracking-[0.25em] uppercase rounded-xl hover:opacity-90 transition-all hover:scale-[1.02]">
              {cleanText(copy.hero.cta1)} <ArrowRight className="size-4" />
            </a>
          </div>
        </div>
      </section>

      {/* ── DEPOIMENTOS ── */}
      <section id="depoimentos" className="py-20 lg:py-28 bg-gradient-cream relative overflow-hidden">
        <div className="absolute inset-0 noise opacity-50 pointer-events-none" />
        <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-10 relative">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="font-sans text-[10px] sm:text-[11px] tracking-[0.3em] uppercase text-primary font-medium">{copy.depoimentos.label}</span>
            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl text-dark mt-4 text-balance">{copy.depoimentos.headline}</h2>
            <p className="font-sans font-light text-text-muted mt-4">{copy.depoimentos.subtitle}</p>
          </div>

          {/* Bento grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 items-start">
            {/* Left col */}
            <div className="flex flex-col gap-5">
              {copy.depoimentos.items.slice(0, 2).map((item, i) => (
                <div key={i} className="bg-background/85 border border-primary/12 rounded-2xl p-6 shadow-soft">
                  <span className="font-serif text-3xl text-primary/25 leading-none block mb-3">"</span>
                  <p className="font-sans font-light text-text-muted text-sm leading-relaxed mb-5">{item.text}</p>
                  <div className="flex items-center gap-3">
                    <div className="size-9 rounded-full bg-gradient-to-br from-accent to-bg-alt border border-primary/20 flex items-center justify-center shrink-0">
                      <span className="font-serif text-primary text-sm">{item.author.charAt(0)}</span>
                    </div>
                    <div>
                      <p className="font-sans text-sm font-medium text-dark">{item.author}</p>
                      <p className="font-sans text-[11px] text-text-muted font-light">{item.role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Center — featured */}
            <div className="bg-background border border-primary/15 rounded-2xl p-8 shadow-premium flex flex-col items-center text-center lg:row-span-1">
              <div className="flex gap-1 mb-5">
                {[1,2,3,4,5].map(s => <Star key={s} className="size-4 text-primary fill-primary" />)}
              </div>
              <h3 className="font-serif text-2xl text-dark mb-4 leading-snug">
                {copy.diferenciais.cards[1]?.title ?? "Atendimento que acolhe"}
              </h3>
              {copy.depoimentos.items[2] && (
                <>
                  <p className="font-sans font-light text-text-muted text-sm leading-relaxed mb-6">{copy.depoimentos.items[2].text}</p>
                  <div className="flex items-center gap-3 mt-auto">
                    <div className="size-10 rounded-full bg-gradient-to-br from-accent to-bg-alt border border-primary/20 flex items-center justify-center">
                      <span className="font-serif text-primary">{copy.depoimentos.items[2].author.charAt(0)}</span>
                    </div>
                    <div className="text-left">
                      <p className="font-sans text-sm font-medium text-dark">{copy.depoimentos.items[2].author}</p>
                      <p className="font-sans text-[11px] text-text-muted font-light">{copy.depoimentos.items[2].role}</p>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Right col */}
            <div className="flex flex-col gap-5">
              {copy.depoimentos.items.slice(3, 5).map((item, i) => (
                <div key={i} className="bg-background/85 border border-primary/12 rounded-2xl p-6 shadow-soft">
                  <div className="flex gap-1 mb-3">
                    {[1,2,3,4,5].map(s => <Star key={s} className="size-3 text-primary fill-primary" />)}
                  </div>
                  <p className="font-sans font-light text-text-muted text-sm leading-relaxed italic mb-5">"{item.text}"</p>
                  <div className="flex items-center gap-3">
                    <div className="size-9 rounded-full bg-gradient-to-br from-accent to-bg-alt border border-primary/20 flex items-center justify-center shrink-0">
                      <span className="font-serif text-primary text-sm">{item.author.charAt(0)}</span>
                    </div>
                    <div>
                      <p className="font-sans text-sm font-medium text-dark">{item.author}</p>
                      <p className="font-sans text-[11px] text-text-muted font-light">{item.role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {copy.depoimentos.footer && (
            <p className="text-center font-sans text-sm text-text-muted font-light mt-10">{copy.depoimentos.footer}</p>
          )}
        </div>
      </section>

      {/* ── FAQ ── */}
      {copy.faq.items.length > 0 && (
        <section className="py-20 lg:py-28 bg-background">
          <div className="max-w-4xl mx-auto px-5 sm:px-6 lg:px-10">
            <div className="text-center mb-14">
              <span className="font-sans text-[10px] sm:text-[11px] tracking-[0.3em] uppercase text-primary font-medium">{copy.faq.label}</span>
              <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl text-dark mt-4">{copy.faq.headline}</h2>
            </div>
            <div className="space-y-3">
              {copy.faq.items.map((item, i) => (
                <div key={i} className="border border-border/60 bg-background rounded-2xl overflow-hidden">
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full flex items-center justify-between px-7 py-5 text-left hover:bg-accent/30 transition-colors"
                  >
                    <span className="font-serif text-lg text-dark">{item.question}</span>
                    <ChevronDown className={`size-5 text-primary shrink-0 transition-transform duration-300 ${openFaq === i ? "rotate-180" : ""}`} />
                  </button>
                  {openFaq === i && (
                    <div className="px-7 pb-6">
                      <p className="font-sans font-light text-text-muted text-base leading-relaxed">{item.answer}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── LOCALIZAÇÃO ── */}
      <section className="py-20 lg:py-28 bg-gradient-cream relative overflow-hidden">
        <div className="absolute inset-0 noise opacity-50 pointer-events-none" />
        <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-10 relative">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="font-sans text-[10px] sm:text-[11px] tracking-[0.3em] uppercase text-primary font-medium">{copy.localizacao.label}</span>
            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl text-dark mt-4 text-balance">{copy.localizacao.headline}</h2>
            <div className="w-12 h-px bg-primary mx-auto my-6" />
            <p className="font-sans font-light text-text-muted text-[15px] leading-relaxed">{copy.localizacao.subtitle}</p>
          </div>

          <div className="relative max-w-4xl mx-auto bg-background rounded-2xl border border-primary/20 shadow-premium overflow-hidden">
            {/* Consultório badge */}
            <div className="absolute top-5 right-5 z-10 inline-flex items-center gap-2 px-3.5 py-1.5 bg-background/96 backdrop-blur-sm border border-primary/25 rounded-full shadow-soft">
              <MapPin className="size-3.5 text-primary" />
              <span className="font-sans text-[10px] tracking-[0.25em] uppercase text-primary font-medium">Consultório</span>
            </div>

            {/* Map */}
            <div className="relative w-full h-[260px] sm:h-[340px] border-b border-primary/15">
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
                  <p className="font-sans text-sm text-text-muted">Mapa não configurado</p>
                </div>
              )}
            </div>

            {/* Info */}
            <div className="p-6 sm:p-8 lg:p-10">
              <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-7">
                <div>
                  {copy.localizacao.buildingName && (
                    <h3 className="font-serif text-2xl sm:text-3xl text-dark leading-tight">{copy.localizacao.buildingName}</h3>
                  )}
                  <p className="font-sans text-[13px] text-text-muted mt-1.5">{copy.localizacao.city}</p>
                </div>
                <div className="flex gap-2.5">
                  <a href={MapsUrl(copy.localizacao.address)} target="_blank" rel="noreferrer"
                    className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-gold text-white font-sans text-[10px] tracking-[0.25em] uppercase rounded-lg hover:opacity-90 transition-opacity">
                    <Navigation className="size-3.5" /> Como chegar
                  </a>
                  <a href={wa} target="_blank" rel="noreferrer"
                    className="inline-flex items-center justify-center px-5 py-2.5 border border-primary/40 text-primary font-sans text-[10px] tracking-[0.25em] uppercase rounded-lg hover:bg-primary hover:text-white transition-colors">
                    Agendar
                  </a>
                </div>
              </div>

              <div className="grid sm:grid-cols-3 gap-5 pt-6 border-t border-primary/15 font-sans text-[13.5px] text-text-muted font-light">
                <div className="flex gap-3">
                  <MapPin className="size-4 text-primary shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{copy.localizacao.address}</span>
                </div>
                <div className="flex gap-3">
                  <Clock className="size-4 text-primary shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{copy.localizacao.hours}</span>
                </div>
                <div className="flex gap-3">
                  <Phone className="size-4 text-primary shrink-0 mt-0.5" />
                  <a href={`tel:${copy.localizacao.phone.replace(/\D/g,"")}`} className="leading-relaxed hover:text-primary transition-colors">
                    {copy.localizacao.phone}
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CONTATO ── */}
      <section id="contato" className="py-20 lg:py-28 bg-gradient-rose relative overflow-hidden">
        <div className="absolute inset-0 noise-dark opacity-60 pointer-events-none" />
        <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-10 relative grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left — CTA */}
          <div>
            <span className="font-sans text-[10px] sm:text-[11px] tracking-[0.3em] uppercase text-white/60 font-medium">{copy.contato.label}</span>
            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl text-white mt-4 text-balance">{copy.contato.headline}</h2>
            <p className="font-sans font-light text-white/70 mt-6 text-base leading-relaxed">{copy.contato.subtitle}</p>
            <a href={wa} target="_blank" rel="noreferrer"
              className="inline-flex items-center gap-3 mt-10 px-8 py-4 bg-gradient-gold text-white font-sans text-[11px] tracking-[0.25em] uppercase rounded-xl hover:opacity-90 transition-all hover:scale-[1.02] shadow-lg shadow-primary/25">
              {cleanText(copy.contato.cta)} <ArrowRight className="size-4" />
            </a>
          </div>

          {/* Right — Form */}
          <div className="bg-background/96 rounded-2xl px-6 py-7 sm:px-8 sm:py-8 shadow-premium border border-primary/15">
            <h3 className="font-serif text-2xl text-dark mb-1">{copy.contato.formTitle}</h3>
            <p className="font-sans text-sm text-text-muted font-light mb-6">{copy.contato.formSubtitle}</p>
            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <label className="font-sans text-[10px] tracking-[0.2em] uppercase text-text-muted font-medium block mb-1.5">Nome *</label>
                <input required value={form.nome} onChange={e => setForm(p => ({...p, nome: e.target.value}))}
                  placeholder="Seu nome completo"
                  className="w-full border border-border rounded-lg px-4 py-2.5 font-sans text-sm text-dark focus:outline-none focus:border-primary transition-colors" />
              </div>
              <div>
                <label className="font-sans text-[10px] tracking-[0.2em] uppercase text-text-muted font-medium block mb-1.5">Telefone *</label>
                <input required value={form.telefone} onChange={e => setForm(p => ({...p, telefone: e.target.value}))}
                  placeholder="(00) 00000-0000"
                  className="w-full border border-border rounded-lg px-4 py-2.5 font-sans text-sm text-dark focus:outline-none focus:border-primary transition-colors" />
              </div>
              <div>
                <label className="font-sans text-[10px] tracking-[0.2em] uppercase text-text-muted font-medium block mb-1.5">E-mail</label>
                <input type="email" value={form.email} onChange={e => setForm(p => ({...p, email: e.target.value}))}
                  placeholder="voce@email.com"
                  className="w-full border border-border rounded-lg px-4 py-2.5 font-sans text-sm text-dark focus:outline-none focus:border-primary transition-colors" />
              </div>
              <button type="submit"
                className="w-full py-3.5 bg-gradient-gold text-white font-sans text-[11px] tracking-[0.25em] uppercase font-medium rounded-xl hover:opacity-90 transition-opacity mt-2">
                {cleanText(copy.contato.cta)} →
              </button>
              <p className="text-center font-sans text-[11px] text-text-muted font-light">Seus dados são tratados com sigilo.</p>
            </form>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-gradient-footer text-white relative overflow-hidden">
        <div className="absolute inset-0 noise-dark opacity-60 pointer-events-none" />
        <div className="h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

        <div className="relative max-w-7xl mx-auto px-6 lg:px-10 pt-14 pb-8">
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-10 sm:gap-12 mb-12">
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
                <li className="leading-relaxed">{copy.localizacao.buildingName}</li>
                <li className="leading-relaxed">{copy.localizacao.address}</li>
                <li className="leading-relaxed">{copy.localizacao.city}</li>
                <li className="leading-relaxed">{copy.localizacao.hours}</li>
              </ul>
            </div>
            <div>
              <h4 className="font-sans text-[11px] tracking-[0.3em] uppercase text-primary font-medium mb-5">Contato</h4>
              <ul className="space-y-3 font-sans text-sm text-white/70 font-light">
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

          <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center sm:justify-between gap-4 text-center sm:text-left">
            <div className="space-y-1">
              <p className="font-sans text-[11px] tracking-[0.18em] uppercase text-white/50 font-light">
                © {new Date().getFullYear()} {copy.meta.doctorName} — Todos os direitos reservados
              </p>
              {copy.meta.crm && (
                <p className="font-sans text-[10px] tracking-[0.25em] uppercase text-primary/60 font-light">{copy.meta.crm}</p>
              )}
            </div>
            <p className="font-serif italic text-[14px] text-primary/80">{copy.footer.tagline}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
