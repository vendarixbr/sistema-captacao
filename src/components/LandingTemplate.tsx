import type { LandingCopy, LandingImages } from "@/lib/types";
import { Instagram, MapPin, Phone, Clock, Star, CheckCircle } from "lucide-react";

interface LandingTemplateProps {
  copy: LandingCopy;
  images: LandingImages;
}

function whatsappUrl(number: string, message?: string) {
  const msg = message ? encodeURIComponent(message) : "";
  return `https://wa.me/${number}${msg ? `?text=${msg}` : ""}`;
}

export function LandingTemplate({ copy, images }: LandingTemplateProps) {
  const waUrl = whatsappUrl(copy.meta.whatsapp, `Olá, ${copy.meta.doctorName}! Gostaria de agendar uma consulta.`);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* HEADER */}
      <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-border/50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            {images.logo ? (
              <img src={images.logo} alt={copy.meta.doctorName} className="h-10 w-auto object-contain" />
            ) : (
              <div>
                <span className="font-display text-lg font-semibold text-primary leading-none">
                  {copy.meta.doctorName}
                </span>
                <p className="text-[10px] tracking-widest uppercase text-text-muted font-sans font-light mt-0.5">
                  {copy.meta.specialty}
                </p>
              </div>
            )}
          </div>

          {/* CTA */}
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex items-center px-5 py-2 bg-primary text-white text-[11px] tracking-[0.2em] uppercase font-medium hover:bg-primary-dark transition-colors"
          >
            {copy.hero.cta1}
          </a>
        </div>
      </header>

      {/* HERO */}
      <section className="relative min-h-screen flex items-center pt-16 bg-gradient-warm overflow-hidden">
        <div className="absolute inset-0 noise opacity-60 pointer-events-none" />
        <div className="max-w-6xl mx-auto px-6 w-full grid lg:grid-cols-2 gap-12 items-center py-24">
          {/* Text */}
          <div className="relative z-10">
            <span className="inline-block px-3 py-1 border border-primary/30 text-primary text-[10px] tracking-[0.3em] uppercase font-medium mb-8">
              {copy.hero.label}
            </span>
            <h1 className="font-display text-5xl md:text-6xl lg:text-7xl text-dark mb-6 text-balance">
              {copy.hero.headline}
            </h1>
            <p className="text-text-muted font-sans font-light text-lg leading-relaxed mb-10 max-w-md">
              {copy.hero.subtitle}
            </p>
            <div className="flex flex-wrap gap-4">
              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-8 py-4 bg-gradient-gold text-white text-sm tracking-[0.15em] uppercase font-medium shadow-premium hover:opacity-90 transition-opacity"
              >
                {copy.hero.cta1}
              </a>
              <a
                href="#sobre"
                className="inline-flex items-center px-8 py-4 border border-primary/40 text-primary text-sm tracking-[0.15em] uppercase font-medium hover:bg-primary/5 transition-colors"
              >
                {copy.hero.cta2}
              </a>
            </div>
            {copy.meta.crm && (
              <p className="mt-8 text-[11px] tracking-widest uppercase text-text-muted font-light">
                {copy.meta.crm}
              </p>
            )}
          </div>

          {/* Image */}
          <div className="relative hidden lg:block">
            {images.hero ? (
              <div className="relative rounded-2xl overflow-hidden shadow-premium aspect-[3/4]">
                <img
                  src={images.hero}
                  alt={copy.meta.doctorName}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="relative rounded-2xl overflow-hidden shadow-premium aspect-[3/4] bg-gradient-rose flex items-center justify-center">
                <div className="text-center p-8">
                  <span className="font-display text-4xl text-white/80 italic">{copy.meta.doctorName}</span>
                  <p className="text-white/60 mt-2 text-sm tracking-widest uppercase">{copy.meta.specialty}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* DIFERENCIAIS */}
      <section className="py-24 bg-gradient-cream">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="inline-block px-3 py-1 border border-primary/30 text-primary text-[10px] tracking-[0.3em] uppercase font-medium mb-6">
              {copy.diferenciais.label}
            </span>
            <h2 className="font-display text-4xl md:text-5xl text-dark max-w-2xl mx-auto text-balance">
              {copy.diferenciais.headline}
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {copy.diferenciais.cards.map((card, i) => (
              <div
                key={i}
                className="bg-white/70 border border-border/60 rounded-xl p-6 shadow-card hover:shadow-soft transition-shadow"
              >
                <span className="font-display text-3xl text-primary font-semibold block mb-3">
                  {card.kpi}
                </span>
                <h3 className="font-display text-lg text-dark mb-2">{card.title}</h3>
                <p className="text-text-muted font-light text-sm leading-relaxed">{card.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SOBRE */}
      <section id="sobre" className="py-24 bg-gradient-warm">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Image */}
            <div className="relative order-2 lg:order-1">
              {images.about ? (
                <div className="rounded-2xl overflow-hidden shadow-premium aspect-square">
                  <img
                    src={images.about}
                    alt={`${copy.sobre.label} — ${copy.meta.doctorName}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="rounded-2xl overflow-hidden shadow-premium aspect-square bg-gradient-primary flex items-center justify-center">
                  <div className="text-center p-8">
                    <span className="font-display text-3xl text-white/80 italic">{copy.sobre.label}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Text */}
            <div className="order-1 lg:order-2">
              <span className="inline-block px-3 py-1 border border-primary/30 text-primary text-[10px] tracking-[0.3em] uppercase font-medium mb-6">
                {copy.sobre.label}
              </span>
              <h2 className="font-display text-4xl md:text-5xl text-dark mb-6 text-balance">
                {copy.sobre.headline}
              </h2>
              <div className="gold-divider mb-6" />
              <p className="text-text-muted font-light text-base leading-relaxed mb-8 whitespace-pre-line">
                {copy.sobre.text}
              </p>
              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-7 py-3 border border-primary text-primary text-[11px] tracking-[0.25em] uppercase font-medium hover:bg-primary hover:text-white transition-colors"
              >
                {copy.sobre.cta}
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* SERVIÇOS */}
      <section className="py-24 bg-gradient-dark">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="inline-block px-3 py-1 border border-gold-light/30 text-gold-light text-[10px] tracking-[0.3em] uppercase font-medium mb-6">
              {copy.servicos.label}
            </span>
            <h2 className="font-display text-4xl md:text-5xl text-white mb-4 text-balance">
              {copy.servicos.headline}
            </h2>
            <p className="text-white/60 font-light max-w-xl mx-auto">{copy.servicos.subtitle}</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {copy.servicos.cards.map((card, i) => (
              <div
                key={i}
                className="border border-white/10 rounded-xl p-6 bg-white/5 hover:bg-white/10 transition-colors"
              >
                <div className="flex items-start gap-3 mb-3">
                  <CheckCircle className="text-primary mt-0.5 shrink-0" size={18} />
                  <h3 className="font-display text-lg text-white">{card.title}</h3>
                </div>
                <p className="text-white/55 font-light text-sm leading-relaxed pl-7">{card.desc}</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-8 py-4 bg-gradient-gold text-white text-sm tracking-[0.15em] uppercase font-medium hover:opacity-90 transition-opacity"
            >
              {copy.hero.cta1}
            </a>
          </div>
        </div>
      </section>

      {/* DEPOIMENTOS */}
      <section className="py-24 bg-gradient-rose">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="inline-block px-3 py-1 border border-white/20 text-white/70 text-[10px] tracking-[0.3em] uppercase font-medium mb-6">
              {copy.depoimentos.label}
            </span>
            <h2 className="font-display text-4xl md:text-5xl text-white mb-4 text-balance">
              {copy.depoimentos.headline}
            </h2>
            <p className="text-white/65 font-light max-w-xl mx-auto">{copy.depoimentos.subtitle}</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {copy.depoimentos.items.map((item, i) => (
              <div
                key={i}
                className="bg-white/10 backdrop-blur-sm border border-white/15 rounded-xl p-6"
              >
                <div className="flex gap-1 mb-4">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} className="text-gold-light fill-gold-light" size={14} />
                  ))}
                </div>
                <p className="text-white/85 font-light text-sm leading-relaxed mb-6 italic">
                  &ldquo;{item.text}&rdquo;
                </p>
                <div>
                  <p className="font-display text-white font-medium">{item.author}</p>
                  <p className="text-white/50 text-xs mt-0.5">{item.role}</p>
                </div>
              </div>
            ))}
          </div>

          {copy.depoimentos.footer && (
            <p className="text-center text-white/50 text-sm mt-10 font-light">
              {copy.depoimentos.footer}
            </p>
          )}
        </div>
      </section>

      {/* LOCALIZAÇÃO */}
      <section className="py-24 bg-gradient-cream">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="inline-block px-3 py-1 border border-primary/30 text-primary text-[10px] tracking-[0.3em] uppercase font-medium mb-6">
              {copy.localizacao.label}
            </span>
            <h2 className="font-display text-4xl md:text-5xl text-dark mb-4 text-balance">
              {copy.localizacao.headline}
            </h2>
            <p className="text-text-muted font-light max-w-xl mx-auto">{copy.localizacao.subtitle}</p>
          </div>

          <div className="grid lg:grid-cols-2 gap-10 items-start">
            {/* Map */}
            <div className="rounded-xl overflow-hidden shadow-premium aspect-video bg-muted">
              {copy.localizacao.mapsEmbed ? (
                <iframe
                  src={copy.localizacao.mapsEmbed}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Localização"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-text-muted text-sm">
                  Mapa não configurado
                </div>
              )}
            </div>

            {/* Info */}
            <div className="space-y-6">
              {copy.localizacao.buildingName && (
                <div>
                  <p className="font-display text-xl text-dark">{copy.localizacao.buildingName}</p>
                </div>
              )}
              <div className="flex items-start gap-3">
                <MapPin className="text-primary mt-0.5 shrink-0" size={18} />
                <div>
                  <p className="text-dark font-medium text-sm">{copy.localizacao.address}</p>
                  <p className="text-text-muted text-sm font-light">{copy.localizacao.city}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Clock className="text-primary mt-0.5 shrink-0" size={18} />
                <p className="text-text-muted text-sm font-light">{copy.localizacao.hours}</p>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="text-primary shrink-0" size={18} />
                <a
                  href={`tel:${copy.localizacao.phone.replace(/\D/g, "")}`}
                  className="text-dark text-sm font-medium hover:text-primary transition-colors"
                >
                  {copy.localizacao.phone}
                </a>
              </div>
              <div className="pt-4">
                <a
                  href={waUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-7 py-3 bg-gradient-gold text-white text-[11px] tracking-[0.25em] uppercase font-medium hover:opacity-90 transition-opacity"
                >
                  {copy.hero.cta1}
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CONTATO */}
      <section className="py-24 bg-gradient-dark">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <span className="inline-block px-3 py-1 border border-gold-light/30 text-gold-light text-[10px] tracking-[0.3em] uppercase font-medium mb-6">
            {copy.contato.label}
          </span>
          <h2 className="font-display text-4xl md:text-5xl text-white mb-6 text-balance">
            {copy.contato.headline}
          </h2>
          <p className="text-white/65 font-light text-lg leading-relaxed mb-10 max-w-xl mx-auto">
            {copy.contato.subtitle}
          </p>
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 px-10 py-5 bg-gradient-gold text-white text-sm tracking-[0.2em] uppercase font-medium shadow-premium hover:opacity-90 transition-opacity"
          >
            {copy.contato.cta}
          </a>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-12 bg-gradient-footer">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div>
              <p className="font-display text-lg font-semibold text-white">{copy.meta.doctorName}</p>
              <p className="text-white/50 text-xs tracking-widest uppercase mt-1 font-light">
                {copy.footer.tagline}
              </p>
            </div>

            <div className="flex items-center gap-4">
              {copy.meta.instagramUrl && (
                <a
                  href={copy.meta.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-white/60 hover:text-white text-sm transition-colors"
                >
                  <Instagram size={16} />
                  <span className="text-xs">{copy.meta.instagram}</span>
                </a>
              )}
              {copy.meta.crm && (
                <span className="text-white/35 text-[11px] tracking-widest uppercase font-light">
                  {copy.meta.crm}
                </span>
              )}
            </div>
          </div>

          <div className="gold-divider mt-8 mb-6 opacity-30" />
          <p className="text-center text-white/30 text-xs font-light">
            &copy; {new Date().getFullYear()} {copy.meta.doctorName}. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}
