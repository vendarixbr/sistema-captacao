import type { LandingCopy, FaqItem } from "./types";

// ─── Specialty detection ────────────────────────────────────────────────────

type SpecialtyKey =
  | "ginecologia" | "dermatologia" | "ortopedia" | "cardiologia"
  | "pediatria" | "odontologia" | "fisioterapia" | "psicologia"
  | "nutricao" | "oftalmologia" | "endocrinologia" | "neurologia"
  | "obstetricia" | "estetica" | "geral";

function detectSpecialty(text: string): SpecialtyKey {
  const t = text.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
  if (t.includes("ginecolog") || t.includes("obstetr") || t.includes("pre-natal") || t.includes("pré-natal")) {
    if (t.includes("obstetr") || t.includes("pre-natal") || t.includes("pré-natal")) return "obstetricia";
    return "ginecologia";
  }
  if (t.includes("dermatolog")) return "dermatologia";
  if (t.includes("ortoped") || t.includes("ortopedia")) return "ortopedia";
  if (t.includes("cardio")) return "cardiologia";
  if (t.includes("pediatr")) return "pediatria";
  if (t.includes("odontolog") || t.includes("dentist") || t.includes("dental")) return "odontologia";
  if (t.includes("fisioter")) return "fisioterapia";
  if (t.includes("psicolog") || t.includes("psicoter")) return "psicologia";
  if (t.includes("nutri")) return "nutricao";
  if (t.includes("oftalmo") || t.includes("ocular") || t.includes("visao") || t.includes("visão")) return "oftalmologia";
  if (t.includes("endocrin") || t.includes("hormonal") || t.includes("hormonio")) return "endocrinologia";
  if (t.includes("neurolog") || t.includes("cerebr")) return "neurologia";
  if (t.includes("estetica") || t.includes("estética") || t.includes("beleza") || t.includes("laser")) return "estetica";
  return "geral";
}

// ─── Content library ────────────────────────────────────────────────────────

const LIBRARY: Record<SpecialtyKey, {
  heroLabels: string[];
  heroHeadlines: string[];
  heroSubtitles: string[];
  diferencialLabel: string;
  diferencialHeadline: string;
  sobreLabel: string;
  servicosLabel: string;
  servicosHeadline: string;
  servicosSubtitle: string;
  depoimentosSubtitle: string;
  contatoLabel: string;
  contatoHeadline: string;
  contatoSubtitle: string;
  footerTagline: string;
  faq: FaqItem[];
}> = {
  ginecologia: {
    heroLabels: ["Ginecologia Clínica", "Ginecologia & Saúde Feminina", "Ginecologia especializada"],
    heroHeadlines: ["Cuidado ginecológico especializado para cada fase da sua vida", "Sua saúde feminina em mãos especializadas", "Atendimento humanizado para mulheres em todas as fases da vida"],
    heroSubtitles: ["Atendimento ginecológico humanizado, diagnóstico preciso e acolhimento em cada consulta.", "Consultas de rotina, exames preventivos e cuidado integral para a saúde da mulher.", "Do preventivo ao tratamento especializado — com escuta ativa e cuidado de verdade."],
    diferencialLabel: "Por que nos escolher",
    diferencialHeadline: "Um cuidado que une técnica e sensibilidade",
    sobreLabel: "Sobre a",
    servicosLabel: "Especialidades",
    servicosHeadline: "Áreas de Atuação",
    servicosSubtitle: "Cuidado ginecológico especializado em cada etapa da sua saúde",
    depoimentosSubtitle: "Histórias reais de mulheres que confiaram sua saúde ginecológica a mim.",
    contatoLabel: "Vamos conversar",
    contatoHeadline: "Sua saúde ginecológica merece atenção especializada",
    contatoSubtitle: "Deixe seu contato e nossa equipe retorna em poucas horas para agendar sua consulta — ou fale agora mesmo no WhatsApp.",
    footerTagline: "Cuidado · Confiança · Excelência",
    faq: [
      { question: "Com que frequência devo fazer consulta ginecológica?", answer: "O ideal é pelo menos uma consulta por ano, mesmo sem sintomas, para exames preventivos e check-up completo da saúde feminina." },
      { question: "O Papanicolau dói?", answer: "O exame pode causar um leve desconforto, mas raramente dor. É rápido, essencial para prevenção do câncer de colo do útero e feito com todo cuidado." },
      { question: "A consulta é sigilosa?", answer: "Sim, totalmente. Todas as informações compartilhadas na consulta são protegidas pelo sigilo médico." },
      { question: "Como faço para agendar?", answer: "Você pode agendar diretamente pelo WhatsApp ou pelo formulário nesta página. Nossa equipe retorna em poucas horas." },
      { question: "Quais exames são feitos na primeira consulta?", answer: "Depende do seu histórico e queixa. A médica avalia individualmente e indica os exames mais adequados para o seu caso." },
    ],
  },
  obstetricia: {
    heroLabels: ["Ginecologia & Pré-natal", "Obstetrícia & Ginecologia Clínica", "Pré-natal especializado"],
    heroHeadlines: ["Acompanhamento completo do seu pré-natal com afeto e técnica", "Sua gestação merece o melhor cuidado especializado", "Do pré-natal ao pós-parto — com você em cada etapa"],
    heroSubtitles: ["Acompanhamento pré-natal humanizado, com toda atenção que você e seu bebê merecem.", "Consultas de pré-natal completas, com diagnóstico preciso e acolhimento em cada fase da gestação.", "Gestação assistida com excelência técnica e cuidado próximo em cada consulta."],
    diferencialLabel: "Por que nos escolher",
    diferencialHeadline: "Experiência e cuidado em cada fase da sua gestação",
    sobreLabel: "Sobre a",
    servicosLabel: "Serviços",
    servicosHeadline: "Áreas de Atuação",
    servicosSubtitle: "Acompanhamento especializado da gestação ao pós-parto",
    depoimentosSubtitle: "Histórias reais de gestantes que confiaram seu pré-natal a mim.",
    contatoLabel: "Vamos conversar",
    contatoHeadline: "Sua gestação merece atenção especializada",
    contatoSubtitle: "Entre em contato para agendar sua consulta de pré-natal com carinho e profissionalismo.",
    footerTagline: "Cuidado · Carinho · Excelência",
    faq: [
      { question: "Quando devo iniciar o pré-natal?", answer: "O ideal é começar o pré-natal assim que a gravidez for confirmada, de preferência no primeiro trimestre." },
      { question: "Quantas consultas de pré-natal são necessárias?", answer: "A recomendação é de no mínimo 6 consultas durante a gestação, distribuídas ao longo dos 9 meses." },
      { question: "O pré-natal cobre o pós-parto?", answer: "Sim. Realizamos acompanhamento pós-parto para verificar sua recuperação e saúde do bebê." },
      { question: "Como agendar minha primeira consulta?", answer: "Entre em contato pelo WhatsApp ou formulário. Nossa equipe retorna rapidamente." },
    ],
  },
  dermatologia: {
    heroLabels: ["Dermatologia Clínica & Estética", "Dermatologia especializada", "Dermatologia & Cuidados com a Pele"],
    heroHeadlines: ["Sua pele merece o melhor cuidado especializado", "Dermatologia de alta performance para resultados reais", "Pele saudável, autoestima elevada — com ciência e cuidado"],
    heroSubtitles: ["Diagnóstico preciso, tratamentos modernos e atendimento humanizado para a saúde da sua pele.", "Cuidados dermatológicos especializados para tratar, prevenir e realçar a beleza natural da sua pele.", "Do diagnóstico ao tratamento — com tecnologia de ponta e atenção personalizada."],
    diferencialLabel: "Por que nos escolher",
    diferencialHeadline: "Ciência e sensibilidade em cada consulta",
    sobreLabel: "Sobre a",
    servicosLabel: "Especialidades",
    servicosHeadline: "Áreas de Atuação",
    servicosSubtitle: "Cuidados dermatológicos completos para a saúde e beleza da sua pele",
    depoimentosSubtitle: "Histórias reais de quem confiou o cuidado da pele a mim.",
    contatoLabel: "Vamos conversar",
    contatoHeadline: "Sua pele merece atenção especializada",
    contatoSubtitle: "Agende sua consulta e dê o primeiro passo para uma pele mais saudável e radiante.",
    footerTagline: "Saúde · Beleza · Excelência",
    faq: [
      { question: "Com que frequência devo ir ao dermatologista?", answer: "O ideal é uma consulta por ano para check-up de rotina e rastreamento precoce de lesões suspeitas." },
      { question: "O que é mapeamento de nevos?", answer: "É um exame que registra e monitora todas as pintas do corpo ao longo do tempo, importante para detectar câncer de pele precocemente." },
      { question: "Qual a diferença entre dermatologia clínica e estética?", answer: "A dermatologia clínica trata doenças da pele, como acne e dermatite. A estética foca em procedimentos de rejuvenescimento e harmonia da pele." },
      { question: "Como agendar minha consulta?", answer: "Pelo WhatsApp ou formulário desta página. Respondemos rapidamente." },
    ],
  },
  ortopedia: {
    heroLabels: ["Ortopedia & Traumatologia", "Ortopedia especializada"],
    heroHeadlines: ["Recupere seu movimento com cuidado especializado", "Ortopedia de excelência para você voltar a viver bem"],
    heroSubtitles: ["Diagnóstico preciso e tratamento especializado para lesões e dores musculoesqueléticas.", "Do diagnóstico à recuperação — com técnica avançada e atenção individualizada."],
    diferencialLabel: "Por que nos escolher",
    diferencialHeadline: "Expertise ortopédica com foco na sua qualidade de vida",
    sobreLabel: "Sobre o",
    servicosLabel: "Especialidades",
    servicosHeadline: "Áreas de Atuação",
    servicosSubtitle: "Tratamento especializado para cada condição ortopédica",
    depoimentosSubtitle: "Histórias reais de pacientes que recuperaram sua mobilidade.",
    contatoLabel: "Vamos conversar",
    contatoHeadline: "Sua recuperação começa com uma consulta especializada",
    contatoSubtitle: "Entre em contato e agende sua avaliação ortopédica.",
    footerTagline: "Movimento · Saúde · Excelência",
    faq: [
      { question: "Preciso de encaminhamento para consultar?", answer: "Não. Você pode agendar diretamente pelo WhatsApp ou formulário desta página." },
      { question: "O que é artroscopia?", answer: "É um procedimento minimamente invasivo para diagnóstico e tratamento de lesões articulares, com recuperação mais rápida que cirurgias abertas." },
      { question: "Quanto tempo dura a recuperação de uma cirurgia ortopédica?", answer: "Varia conforme o procedimento e o paciente. O médico avaliará seu caso e apresentará um plano de recuperação personalizado." },
    ],
  },
  cardiologia: {
    heroLabels: ["Cardiologia Clínica", "Cardiologia especializada"],
    heroHeadlines: ["Cuide do seu coração com quem entende do assunto", "Saúde cardiovascular com diagnóstico preciso e cuidado humanizado"],
    heroSubtitles: ["Diagnóstico e acompanhamento cardiológico especializado para proteger sua saúde cardiovascular.", "Prevenção, diagnóstico e tratamento de doenças cardiovasculares com excelência e atenção."],
    diferencialLabel: "Por que nos escolher",
    diferencialHeadline: "Cardiologia que une tecnologia e humanização",
    sobreLabel: "Sobre o",
    servicosLabel: "Especialidades",
    servicosHeadline: "Áreas de Atuação",
    servicosSubtitle: "Cuidado cardiovascular completo em cada etapa da sua vida",
    depoimentosSubtitle: "Histórias de pacientes que cuidam do coração com a gente.",
    contatoLabel: "Vamos conversar",
    contatoHeadline: "Seu coração merece atenção especializada",
    contatoSubtitle: "Agende sua consulta cardiológica e invista na sua saúde cardiovascular.",
    footerTagline: "Prevenção · Cuidado · Excelência",
    faq: [
      { question: "A partir de que idade devo consultar um cardiologista?", answer: "Recomenda-se check-up cardiológico a partir dos 40 anos, ou antes se houver histórico familiar de doenças cardíacas." },
      { question: "O que é um ecocardiograma?", answer: "É um exame de ultrassom que avalia a estrutura e funcionamento do coração, identificando alterações precocemente." },
      { question: "Hipertensão tem cura?", answer: "Na maioria dos casos não tem cura, mas tem controle eficiente com medicação, dieta e estilo de vida saudável, sob acompanhamento médico." },
    ],
  },
  pediatria: {
    heroLabels: ["Pediatria especializada", "Pediatria & Saúde Infantil"],
    heroHeadlines: ["Cuidado especializado para a saúde do seu filho", "Pediatria humanizada para cada fase do desenvolvimento"],
    heroSubtitles: ["Acompanhamento pediátrico completo, com carinho e atenção em cada consulta.", "Da recém-nascida à adolescência — cuidado especializado para o crescimento saudável do seu filho."],
    diferencialLabel: "Por que nos escolher",
    diferencialHeadline: "Pediatria com amor e excelência técnica",
    sobreLabel: "Sobre a",
    servicosLabel: "Especialidades",
    servicosHeadline: "Áreas de Atuação",
    servicosSubtitle: "Cuidado pediátrico especializado em cada fase",
    depoimentosSubtitle: "Histórias de pais que confiam a saúde dos filhos a nós.",
    contatoLabel: "Vamos conversar",
    contatoHeadline: "Seu filho merece o melhor cuidado",
    contatoSubtitle: "Agende a consulta pediátrica e garanta o desenvolvimento saudável do seu filho.",
    footerTagline: "Cuidado · Saúde · Carinho",
    faq: [
      { question: "Com que frequência devo levar meu filho ao pediatra?", answer: "No primeiro ano, consultas mensais são recomendadas. Após isso, semestrais até os 5 anos e anuais depois." },
      { question: "Quais vacinas são obrigatórias?", answer: "O calendário vacinal do Ministério da Saúde orienta todas as vacinas essenciais. Na consulta, orientamos sobre cada uma." },
      { question: "Até que idade acompanham o paciente?", answer: "Acompanhamos crianças e adolescentes até os 18 anos." },
    ],
  },
  odontologia: {
    heroLabels: ["Odontologia Estética & Clínica", "Odontologia especializada"],
    heroHeadlines: ["Sorria com confiança — odontologia que transforma", "Saúde bucal e estética com excelência e cuidado"],
    heroSubtitles: ["Odontologia clínica e estética com tecnologia de ponta e atendimento humanizado.", "Cuide do seu sorriso com quem alia técnica, estética e atenção individualizada."],
    diferencialLabel: "Por que nos escolher",
    diferencialHeadline: "Seu sorriso, nossa especialidade",
    sobreLabel: "Sobre a",
    servicosLabel: "Especialidades",
    servicosHeadline: "Áreas de Atuação",
    servicosSubtitle: "Soluções odontológicas completas para sua saúde bucal",
    depoimentosSubtitle: "Histórias de quem transformou o sorriso conosco.",
    contatoLabel: "Vamos conversar",
    contatoHeadline: "Seu sorriso merece atenção especializada",
    contatoSubtitle: "Agende sua consulta e dê o primeiro passo para um sorriso mais bonito e saudável.",
    footerTagline: "Saúde · Estética · Excelência",
    faq: [
      { question: "De quanto em quanto tempo devo ir ao dentista?", answer: "Recomenda-se visita a cada 6 meses para limpeza e avaliação preventiva." },
      { question: "O clareamento dental danifica o esmalte?", answer: "Quando feito corretamente por um profissional, o clareamento é seguro e não danifica o esmalte." },
      { question: "Implante dental é definitivo?", answer: "Sim, quando bem cuidado, o implante dura a vida toda. É a solução mais próxima de um dente natural." },
    ],
  },
  fisioterapia: {
    heroLabels: ["Fisioterapia especializada", "Fisioterapia & Reabilitação"],
    heroHeadlines: ["Recupere seu movimento e qualidade de vida", "Fisioterapia que devolve bem-estar e liberdade de movimento"],
    heroSubtitles: ["Tratamento fisioterapêutico especializado para recuperar sua mobilidade e qualidade de vida.", "Reabilitação personalizada com técnicas modernas e atenção ao seu progresso."],
    diferencialLabel: "Por que nos escolher",
    diferencialHeadline: "Reabilitação com ciência e cuidado individualizado",
    sobreLabel: "Sobre a",
    servicosLabel: "Especialidades",
    servicosHeadline: "Áreas de Atuação",
    servicosSubtitle: "Tratamentos fisioterapêuticos especializados",
    depoimentosSubtitle: "Histórias de recuperação e superação.",
    contatoLabel: "Vamos conversar",
    contatoHeadline: "Seu corpo merece cuidado especializado",
    contatoSubtitle: "Agende sua avaliação fisioterapêutica e inicie sua recuperação.",
    footerTagline: "Movimento · Saúde · Bem-estar",
    faq: [
      { question: "Preciso de encaminhamento médico?", answer: "Não é obrigatório, mas é recomendável ter um laudo médico para otimizar o tratamento." },
      { question: "Quantas sessões são necessárias?", answer: "Varia conforme o caso. Na avaliação inicial, montamos um plano de tratamento personalizado." },
      { question: "Fisioterapia é dolorosa?", answer: "Não. O objetivo é aliviar a dor, não causá-la. O tratamento é ajustado às necessidades de cada paciente." },
    ],
  },
  psicologia: {
    heroLabels: ["Psicologia Clínica", "Psicoterapia especializada"],
    heroHeadlines: ["Cuidado com a saúde mental que você merece", "Psicoterapia humanizada para o seu bem-estar emocional"],
    heroSubtitles: ["Atendimento psicológico especializado para te acompanhar no caminho do autoconhecimento e bem-estar.", "Psicoterapia com escuta ativa, acolhimento e técnicas baseadas em evidências."],
    diferencialLabel: "Por que nos escolher",
    diferencialHeadline: "Saúde mental com acolhimento e profissionalismo",
    sobreLabel: "Sobre a",
    servicosLabel: "Especialidades",
    servicosHeadline: "Áreas de Atuação",
    servicosSubtitle: "Acompanhamento psicológico em diferentes contextos de vida",
    depoimentosSubtitle: "Histórias de transformação e bem-estar.",
    contatoLabel: "Vamos conversar",
    contatoHeadline: "Sua saúde mental importa",
    contatoSubtitle: "Dê o primeiro passo. Agende sua sessão e inicie sua jornada de bem-estar.",
    footerTagline: "Acolhimento · Saúde · Transformação",
    faq: [
      { question: "Como funciona a primeira sessão?", answer: "A primeira sessão é uma conversa inicial para entender suas demandas e verificar como o acompanhamento pode te ajudar." },
      { question: "As sessões são confidenciais?", answer: "Sim. O sigilo profissional é um dever ético do psicólogo, garantido pelo Código de Ética." },
      { question: "Com que frequência são as sessões?", answer: "Geralmente semanais, mas o ritmo é definido em conjunto conforme suas necessidades." },
    ],
  },
  nutricao: {
    heroLabels: ["Nutrição Clínica & Funcional", "Nutrição especializada"],
    heroHeadlines: ["Transforme sua relação com a alimentação e sua saúde", "Nutrição funcional para resultados reais e duradouros"],
    heroSubtitles: ["Acompanhamento nutricional personalizado para sua saúde, bem-estar e qualidade de vida.", "Plano alimentar individualizado baseado em ciência, para você atingir seus objetivos com saúde."],
    diferencialLabel: "Por que nos escolher",
    diferencialHeadline: "Nutrição com ciência e individualização",
    sobreLabel: "Sobre a",
    servicosLabel: "Especialidades",
    servicosHeadline: "Áreas de Atuação",
    servicosSubtitle: "Acompanhamento nutricional em diferentes contextos",
    depoimentosSubtitle: "Histórias de transformação através da nutrição.",
    contatoLabel: "Vamos conversar",
    contatoHeadline: "Sua saúde começa no prato",
    contatoSubtitle: "Agende sua consulta nutricional e dê o primeiro passo para uma vida mais saudável.",
    footerTagline: "Saúde · Equilíbrio · Resultados",
    faq: [
      { question: "Dieta de nutricionista é diferente de dieta da internet?", answer: "Sim. Um plano nutricional elaborado por nutricionista é individualizado, baseado no seu exame de bioimpedância, histórico e objetivos." },
      { question: "Preciso de exames para iniciar?", answer: "Recomendamos exames laboratoriais para uma avaliação mais completa, mas não é obrigatório na primeira consulta." },
      { question: "Com que frequência são as consultas?", answer: "Geralmente mensais no início, com ajustes conforme a evolução do tratamento." },
    ],
  },
  oftalmologia: {
    heroLabels: ["Oftalmologia Clínica & Cirúrgica", "Oftalmologia especializada"],
    heroHeadlines: ["Cuide da sua visão com quem entende do assunto", "Oftalmologia de excelência para a saúde dos seus olhos"],
    heroSubtitles: ["Diagnóstico e tratamento oftalmológico especializado com tecnologia de ponta.", "Cuidado completo com a saúde visual — do diagnóstico precoce ao tratamento cirúrgico."],
    diferencialLabel: "Por que nos escolher",
    diferencialHeadline: "Tecnologia e cuidado para a sua saúde visual",
    sobreLabel: "Sobre o",
    servicosLabel: "Especialidades",
    servicosHeadline: "Áreas de Atuação",
    servicosSubtitle: "Cuidado oftalmológico completo",
    depoimentosSubtitle: "Histórias de quem recuperou e protegeu a visão.",
    contatoLabel: "Vamos conversar",
    contatoHeadline: "Sua visão merece cuidado especializado",
    contatoSubtitle: "Agende seu exame oftalmológico e proteja sua saúde visual.",
    footerTagline: "Visão · Saúde · Excelência",
    faq: [
      { question: "De quanto em quanto tempo devo fazer exame de vista?", answer: "Anualmente para adultos, e a cada 6 meses para quem usa óculos ou tem histórico familiar de doenças oculares." },
      { question: "O que é a cirurgia refrativa?", answer: "É um procedimento a laser que corrige miopia, hipermetropia e astigmatismo, reduzindo ou eliminando a dependência de óculos." },
      { question: "Glaucoma tem cura?", answer: "Não tem cura, mas com diagnóstico precoce e tratamento adequado é possível controlar e preservar a visão." },
    ],
  },
  endocrinologia: {
    heroLabels: ["Endocrinologia & Metabologia", "Endocrinologia especializada"],
    heroHeadlines: ["Equilíbrio hormonal para uma vida com mais qualidade", "Endocrinologia que cuida de você por inteiro"],
    heroSubtitles: ["Diagnóstico e tratamento endocrinológico especializado para equilibrar sua saúde hormonal e metabólica.", "Do diabetes à tireoide — cuidado endocrinológico completo e personalizado."],
    diferencialLabel: "Por que nos escolher",
    diferencialHeadline: "Endocrinologia com diagnóstico preciso e cuidado humano",
    sobreLabel: "Sobre o",
    servicosLabel: "Especialidades",
    servicosHeadline: "Áreas de Atuação",
    servicosSubtitle: "Tratamento endocrinológico em diferentes condições",
    depoimentosSubtitle: "Histórias de equilíbrio e saúde hormonal.",
    contatoLabel: "Vamos conversar",
    contatoHeadline: "Seu equilíbrio hormonal importa",
    contatoSubtitle: "Agende sua consulta endocrinológica e cuide da sua saúde metabólica.",
    footerTagline: "Equilíbrio · Saúde · Excelência",
    faq: [
      { question: "Quais doenças um endocrinologista trata?", answer: "Diabetes, obesidade, distúrbios da tireoide, problemas hormonais, osteoporose, entre outras." },
      { question: "Preciso de exames para a primeira consulta?", answer: "Recomendamos trazer exames anteriores se tiver, mas não é obrigatório. O médico solicitará o que for necessário." },
      { question: "Hipotireoidismo tem cura?", answer: "Na maioria dos casos não tem cura, mas o controle com medicação adequada permite vida completamente normal." },
    ],
  },
  neurologia: {
    heroLabels: ["Neurologia Clínica", "Neurologia especializada"],
    heroHeadlines: ["Cuidado neurológico especializado para sua qualidade de vida", "Neurologia que une diagnóstico preciso e atenção humanizada"],
    heroSubtitles: ["Diagnóstico e tratamento neurológico especializado com atenção individualizada.", "Do diagnóstico precoce ao tratamento — cuidado completo para sua saúde neurológica."],
    diferencialLabel: "Por que nos escolher",
    diferencialHeadline: "Neurologia com precisão e humanização",
    sobreLabel: "Sobre o",
    servicosLabel: "Especialidades",
    servicosHeadline: "Áreas de Atuação",
    servicosSubtitle: "Tratamento neurológico especializado",
    depoimentosSubtitle: "Histórias de diagnóstico e recuperação neurológica.",
    contatoLabel: "Vamos conversar",
    contatoHeadline: "Sua saúde neurológica merece atenção especializada",
    contatoSubtitle: "Agende sua consulta neurológica e cuide do seu bem-estar.",
    footerTagline: "Diagnóstico · Cuidado · Excelência",
    faq: [
      { question: "Quais sintomas levam a um neurologista?", answer: "Dores de cabeça frequentes, tontura, formigamento, tremores, convulsões, problemas de memória, entre outros." },
      { question: "Enxaqueca tem tratamento?", answer: "Sim. Com o diagnóstico correto e plano de tratamento adequado, é possível reduzir significativamente as crises." },
    ],
  },
  estetica: {
    heroLabels: ["Estética Avançada", "Medicina Estética", "Estética clínica especializada"],
    heroHeadlines: ["Realce sua beleza natural com procedimentos especializados", "Estética avançada para resultados naturais e duradouros"],
    heroSubtitles: ["Procedimentos estéticos modernos com tecnologia de ponta e atenção individualizada.", "Tratamentos estéticos personalizados para realçar sua beleza com segurança e naturalidade."],
    diferencialLabel: "Por que nos escolher",
    diferencialHeadline: "Estética de excelência com resultados naturais",
    sobreLabel: "Sobre a",
    servicosLabel: "Procedimentos",
    servicosHeadline: "Nossos Tratamentos",
    servicosSubtitle: "Procedimentos estéticos especializados para cada necessidade",
    depoimentosSubtitle: "Histórias de transformação e autoestima elevada.",
    contatoLabel: "Vamos conversar",
    contatoHeadline: "Sua beleza merece atenção especializada",
    contatoSubtitle: "Agende sua avaliação e descubra os melhores procedimentos para o seu caso.",
    footerTagline: "Beleza · Autoestima · Excelência",
    faq: [
      { question: "Os procedimentos são seguros?", answer: "Sim, todos os procedimentos são realizados por profissionais qualificados com produtos e equipamentos certificados." },
      { question: "Os resultados são permanentes?", answer: "Depende do procedimento. Na avaliação, explicamos a durabilidade e manutenção de cada tratamento." },
      { question: "Existe período de recuperação?", answer: "Varia conforme o procedimento. Alguns não têm downtime, outros requerem cuidados por alguns dias." },
    ],
  },
  geral: {
    heroLabels: ["Atendimento Especializado", "Medicina especializada"],
    heroHeadlines: ["Cuidado especializado para a sua saúde", "Atendimento humanizado com diagnóstico preciso"],
    heroSubtitles: ["Atendimento médico especializado, humanizado e com atenção individualizada para cada paciente.", "Diagnóstico preciso e tratamento eficaz — cuidando da sua saúde com excelência."],
    diferencialLabel: "Por que nos escolher",
    diferencialHeadline: "Cuidado com técnica e sensibilidade",
    sobreLabel: "Sobre o",
    servicosLabel: "Especialidades",
    servicosHeadline: "Áreas de Atuação",
    servicosSubtitle: "Atendimento especializado em saúde",
    depoimentosSubtitle: "Histórias reais de quem confiou sua saúde a nós.",
    contatoLabel: "Vamos conversar",
    contatoHeadline: "Sua saúde merece atenção especializada",
    contatoSubtitle: "Agende sua consulta e cuide da sua saúde com quem entende.",
    footerTagline: "Saúde · Cuidado · Excelência",
    faq: [
      { question: "Como faço para agendar uma consulta?", answer: "Pelo WhatsApp ou formulário desta página. Nossa equipe retorna em poucas horas." },
      { question: "A consulta é presencial ou online?", answer: "Realizamos consultas presenciais em nosso consultório. Consulte-nos sobre disponibilidade." },
      { question: "Quais convênios são aceitos?", answer: "Trabalhamos com atendimento particular. Entre em contato para informações sobre formas de pagamento." },
    ],
  },
};

// ─── Main derive function ────────────────────────────────────────────────────

export function deriveContent(partial: Partial<LandingCopy>): Partial<LandingCopy> {
  const specialtyText = [
    partial.meta?.specialty ?? "",
    partial.hero?.label ?? "",
    partial.servicos?.cards?.map(c => c.title).join(" ") ?? "",
  ].join(" ");

  const key = detectSpecialty(specialtyText);
  const lib = LIBRARY[key];
  const result: Partial<LandingCopy> = { ...partial };

  // ── Meta ──────────────────────────────────────────────────────────────────

  if (result.meta) {
    // WhatsApp: add 55 if needed
    const wa = result.meta.whatsapp?.replace(/\D/g, "") ?? "";
    if (wa && wa.length <= 11) {
      result.meta = { ...result.meta, whatsapp: "55" + wa };
    }
    // Instagram URL from handle
    if (result.meta.instagram && !result.meta.instagramUrl) {
      const handle = result.meta.instagram.replace("@", "");
      result.meta = { ...result.meta, instagramUrl: `https://www.instagram.com/${handle}/` };
    }
  }

  // ── Hero ──────────────────────────────────────────────────────────────────

  if (!result.hero) result.hero = {} as LandingCopy["hero"];
  if (!result.hero.label) result.hero = { ...result.hero, label: lib.heroLabels[0] };
  if (!result.hero.headline) result.hero = { ...result.hero, headline: lib.heroHeadlines[0] };
  if (!result.hero.subtitle) result.hero = { ...result.hero, subtitle: lib.heroSubtitles[0] };
  if (!result.hero.cta1) result.hero = { ...result.hero, cta1: "Agendar Consulta" };
  if (!result.hero.cta2) {
    const name = result.meta?.doctorName?.split(" ").slice(0, 3).join(" ") ?? "o Profissional";
    result.hero = { ...result.hero, cta2: `Conhecer ${name.startsWith("Dr") ? name : "o profissional"}` };
  }

  // ── Diferenciais ─────────────────────────────────────────────────────────

  if (!result.diferenciais) result.diferenciais = {} as LandingCopy["diferenciais"];
  if (!result.diferenciais.label) result.diferenciais = { ...result.diferenciais, label: lib.diferencialLabel };
  if (!result.diferenciais.headline) result.diferenciais = { ...result.diferenciais, headline: lib.diferencialHeadline };

  // ── Sobre ─────────────────────────────────────────────────────────────────

  if (!result.sobre) result.sobre = {} as LandingCopy["sobre"];
  if (!result.sobre.label && result.meta?.doctorName) {
    result.sobre = { ...result.sobre, label: `${lib.sobreLabel} ${result.meta.doctorName}` };
  }
  if (!result.sobre.cta) {
    result.sobre = { ...result.sobre, cta: "Saiba mais sobre mim" };
  }
  if (!result.sobre.headline && result.meta?.doctorName) {
    const parts = result.meta.doctorName.split(" ");
    const firstName = parts.find(p => !p.startsWith("Dr")) ?? parts[1] ?? "";
    result.sobre = { ...result.sobre, headline: `Muito prazer, eu sou ${result.meta.doctorName}` };
    void firstName;
  }

  // ── Serviços ──────────────────────────────────────────────────────────────

  if (!result.servicos) result.servicos = {} as LandingCopy["servicos"];
  if (!result.servicos.label) result.servicos = { ...result.servicos, label: lib.servicosLabel };
  if (!result.servicos.headline) result.servicos = { ...result.servicos, headline: lib.servicosHeadline };
  if (!result.servicos.subtitle) result.servicos = { ...result.servicos, subtitle: lib.servicosSubtitle };

  // ── Depoimentos ───────────────────────────────────────────────────────────

  if (!result.depoimentos) result.depoimentos = {} as LandingCopy["depoimentos"];
  if (!result.depoimentos.label) result.depoimentos = { ...result.depoimentos, label: "Depoimentos" };
  if (!result.depoimentos.headline) result.depoimentos = { ...result.depoimentos, headline: "O que dizem meus pacientes" };
  if (!result.depoimentos.subtitle) result.depoimentos = { ...result.depoimentos, subtitle: lib.depoimentosSubtitle };
  if (!result.depoimentos.footer) result.depoimentos = { ...result.depoimentos, footer: "+ centenas de pacientes atendidos" };

  // ── FAQ ───────────────────────────────────────────────────────────────────

  if (!result.faq) result.faq = {} as LandingCopy["faq"];
  if (!result.faq.label) result.faq = { ...result.faq, label: "Dúvidas frequentes" };
  if (!result.faq.headline) result.faq = { ...result.faq, headline: "Perguntas frequentes" };
  if (!result.faq.items?.length) result.faq = { ...result.faq, items: lib.faq };

  // ── Localização ───────────────────────────────────────────────────────────

  if (!result.localizacao) result.localizacao = {} as LandingCopy["localizacao"];
  if (!result.localizacao.label) result.localizacao = { ...result.localizacao, label: "Onde estamos" };
  if (!result.localizacao.subtitle) {
    result.localizacao = { ...result.localizacao, subtitle: "Consultório próprio com estrutura completa, ambiente acolhedor e fácil acesso." };
  }
  // Auto-generate maps embed from address
  if (!result.localizacao.mapsEmbed && result.localizacao.address) {
    const q = encodeURIComponent(`${result.localizacao.address}, ${result.localizacao.city ?? ""}`);
    result.localizacao = { ...result.localizacao, mapsEmbed: `https://www.google.com/maps?q=${q}&output=embed` };
  }
  // Derive headline from city
  if (!result.localizacao.headline) {
    const city = result.localizacao.city?.split(",")[0]?.split("-")[0]?.trim() ?? "nossa cidade";
    result.localizacao = { ...result.localizacao, headline: `Venha nos visitar em ${city}` };
  }

  // ── Contato ───────────────────────────────────────────────────────────────

  if (!result.contato) result.contato = {} as LandingCopy["contato"];
  if (!result.contato.label) result.contato = { ...result.contato, label: lib.contatoLabel };
  if (!result.contato.headline) result.contato = { ...result.contato, headline: lib.contatoHeadline };
  if (!result.contato.subtitle) result.contato = { ...result.contato, subtitle: lib.contatoSubtitle };
  if (!result.contato.cta) result.contato = { ...result.contato, cta: "Agendar pelo WhatsApp" };
  if (!result.contato.formTitle) result.contato = { ...result.contato, formTitle: "Receba um retorno" };
  if (!result.contato.formSubtitle) result.contato = { ...result.contato, formSubtitle: "Preencha e entramos em contato." };

  // ── Footer ────────────────────────────────────────────────────────────────

  if (!result.footer) result.footer = {} as LandingCopy["footer"];
  if (!result.footer.tagline) result.footer = { ...result.footer, tagline: lib.footerTagline };

  return result;
}
