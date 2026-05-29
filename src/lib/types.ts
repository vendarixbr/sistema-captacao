export type LandingImages = {
  logo?: string | null;
  hero?: string | null;
  about?: string | null;
};

export type ServiceCard = { title: string; desc: string };
export type DiferencialCard = { kpi: string; title: string; desc: string };
export type Testimonial = { text: string; author: string; role: string };
export type FaqItem = { question: string; answer: string };

export type LandingCopy = {
  meta: {
    doctorName: string;
    specialty: string;
    crm: string;
    whatsapp: string;
    instagram?: string;
    instagramUrl?: string;
  };
  hero: {
    label: string;
    headline: string;
    subtitle: string;
    cta1: string;
    cta2: string;
  };
  diferenciais: {
    label: string;
    headline: string;
    cards: DiferencialCard[];
  };
  sobre: {
    label: string;
    headline: string;
    text: string;
    cta: string;
  };
  servicos: {
    label: string;
    headline: string;
    subtitle: string;
    cards: ServiceCard[];
  };
  depoimentos: {
    label: string;
    headline: string;
    subtitle: string;
    items: Testimonial[];
    footer?: string;
  };
  faq: {
    label: string;
    headline: string;
    items: FaqItem[];
  };
  localizacao: {
    label: string;
    headline: string;
    subtitle: string;
    buildingName?: string;
    address: string;
    city: string;
    hours: string;
    phone: string;
    mapsEmbed?: string;
  };
  contato: {
    label: string;
    headline: string;
    subtitle: string;
    cta: string;
    formTitle: string;
    formSubtitle: string;
  };
  footer: {
    tagline: string;
  };
};

export type LandingPage = {
  id: string;
  slug: string;
  created_at: string;
  updated_at: string;
  published: boolean;
  copy: LandingCopy;
  images: LandingImages;
  theme?: string;
};
