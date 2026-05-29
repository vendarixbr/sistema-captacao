import type { LandingCopy, LandingImages } from "./types";

export const DEFAULT_COPY: LandingCopy = {
  meta: {
    doctorName: "Dra. Milena Bonjour",
    specialty: "Ginecologia & Estética Íntima",
    crm: "CRM MG 34040 · RQE 10210",
    whatsapp: "5537988155040",
    instagram: "@dramilenabonjourginecologista",
    instagramUrl: "https://www.instagram.com/dramilenabonjourginecologista/",
  },
  hero: {
    label: "Ginecologia & Estética Íntima",
    headline: "Desperte sua melhor versão após os 40",
    subtitle: "Atendimento especializado em estética íntima, emagrecimento e bem-estar para mulheres que querem viver com mais autoestima e prazer.",
    cta1: "Agendar Consulta",
    cta2: "Conhecer a Dra. Milena",
  },
  diferenciais: {
    label: "Por que escolher a Dra. Milena",
    headline: "Especialista em devolver autoestima e prazer para mulheres 40+",
    cards: [
      { kpi: "40+", title: "Foco em mulheres 40+", desc: "Atendimento direcionado às transformações e necessidades únicas desta fase da vida." },
      { kpi: "Humano", title: "Atendimento que acolhe", desc: "Escuta ativa, tempo de qualidade e decisões compartilhadas em cada consulta." },
      { kpi: "+2.000", title: "Mulheres atendidas", desc: "Pacientes que confiam na Dra. Milena em cada fase da vida." },
      { kpi: "Divinópolis", title: "Referência regional", desc: "Consultório próprio com estrutura completa no centro de Divinópolis - MG." },
    ],
  },
  sobre: {
    label: "Sobre a Dra. Milena",
    headline: "Muito prazer, eu sou a Dra. Milena Bonjour",
    text: "Sou ginecologista especializada em devolver autoestima e prazer para mulheres 40+. Acredito que o verdadeiro cuidado começa pela escuta — quando a paciente se sente ouvida, acolhida e respeitada.",
    cta: "Saiba mais sobre mim",
  },
  servicos: {
    label: "Especialidades",
    headline: "Áreas de Atuação",
    subtitle: "Cuidado especializado em cada etapa da sua saúde",
    cards: [
      { title: "Estética Íntima", desc: "Procedimentos modernos com laser e radiofrequência para bem-estar e autoestima feminina." },
      { title: "Emagrecimento Personalizado", desc: "Protocolo individualizado com avaliação completa e acompanhamento contínuo." },
      { title: "Ninfoplastia", desc: "Procedimento cirúrgico íntimo com foco em qualidade de vida e autoconfiança." },
      { title: "Medicina Integrativa", desc: "Abordagem completa que une saúde física, hormonal e emocional." },
      { title: "Saúde Hormonal", desc: "Equilíbrio hormonal para TPM, menopausa e bem-estar em cada fase da vida." },
      { title: "Ginecologia Clínica", desc: "Consultas de rotina, exames preventivos e diagnóstico especializado humanizado." },
    ],
  },
  depoimentos: {
    label: "Depoimentos",
    headline: "O que dizem minhas pacientes",
    subtitle: "Histórias reais de mulheres que confiaram seu cuidado a mim.",
    items: [
      { text: "A Dra. Milena mudou completamente minha relação com minha saúde. Ela explica tudo com paciência e me faz sentir segura a cada consulta.", author: "Ana Paula M.", role: "Paciente há 3 anos" },
      { text: "Fiz todo meu acompanhamento com ela e foi uma experiência incrível. Cuidadosa, atenciosa e sempre disponível.", author: "Camila R.", role: "Paciente" },
      { text: "Finalmente encontrei uma médica que me trata como pessoa, não como número.", author: "Fernanda S.", role: "Ginecologia clínica" },
      { text: "Profissional excepcional. O consultório é lindo e o atendimento é impecável.", author: "Juliana T.", role: "Saúde hormonal" },
      { text: "Sempre saio das consultas com clareza e tranquilidade. Recomendo de olhos fechados.", author: "Mariana O.", role: "Paciente há 2 anos" },
    ],
    footer: "+ centenas de pacientes atendidas",
  },
  faq: {
    label: "Dúvidas frequentes",
    headline: "Perguntas frequentes",
    items: [
      { question: "Como faço para agendar uma consulta?", answer: "Você pode agendar diretamente pelo WhatsApp ou através do formulário de contato nesta página. Nossa equipe retorna em poucas horas." },
      { question: "A consulta é presencial ou online?", answer: "Realizamos consultas presenciais em nosso consultório. Para dúvidas rápidas e orientações gerais, consulte nossa disponibilidade." },
      { question: "Quais convênios são aceitos?", answer: "Trabalhamos com atendimento particular. Entre em contato para verificar condições especiais de pagamento." },
      { question: "Qual o valor da consulta?", answer: "Os valores variam conforme o tipo de consulta e procedimento. Entre em contato para obter informações detalhadas." },
    ],
  },
  localizacao: {
    label: "Onde estamos",
    headline: "Venha nos visitar em Divinópolis",
    subtitle: "Consultório próprio com estrutura completa, ambiente acolhedor e fácil acesso no centro da cidade.",
    address: "Av. Getúlio Vargas, 805 — Sala 901",
    city: "Centro, Divinópolis - MG, 35500-017",
    hours: "Seg a Sex — 08h às 18h | Sábados — Sob consulta",
    phone: "(37) 98815-5040",
    mapsEmbed: "https://www.google.com/maps?q=Av.+Get%C3%BAlio+Vargas%2C+805%2C+Centro%2C+Divin%C3%B3polis+-+MG&output=embed",
  },
  contato: {
    label: "Vamos conversar",
    headline: "Sua autoestima merece atenção especializada",
    subtitle: "Deixe seu contato e nossa equipe retorna em poucas horas para agendar sua consulta — ou fale agora mesmo no WhatsApp.",
    cta: "Agendar pelo WhatsApp",
    formTitle: "Receba um retorno",
    formSubtitle: "Preencha e entramos em contato.",
  },
  footer: {
    tagline: "Autoestima · Bem-estar · Excelência",
  },
};

export const DEFAULT_IMAGES: LandingImages = {
  logo: null,
  hero: null,
  about: null,
};

export function mergeCopy(partial: Partial<LandingCopy>): LandingCopy {
  return {
    ...DEFAULT_COPY,
    ...partial,
    meta: { ...DEFAULT_COPY.meta, ...partial.meta },
    hero: { ...DEFAULT_COPY.hero, ...partial.hero },
    diferenciais: { ...DEFAULT_COPY.diferenciais, ...partial.diferenciais },
    sobre: { ...DEFAULT_COPY.sobre, ...partial.sobre },
    servicos: { ...DEFAULT_COPY.servicos, ...partial.servicos },
    depoimentos: { ...DEFAULT_COPY.depoimentos, ...partial.depoimentos },
    faq: { ...DEFAULT_COPY.faq, ...partial.faq },
    localizacao: { ...DEFAULT_COPY.localizacao, ...partial.localizacao },
    contato: { ...DEFAULT_COPY.contato, ...partial.contato },
    footer: { ...DEFAULT_COPY.footer, ...partial.footer },
  };
}
