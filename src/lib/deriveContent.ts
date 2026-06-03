import type { LandingCopy, FaqItem, DiferencialCard, ServiceCard } from "./types";

// ─── Specialty detection ────────────────────────────────────────────────────

type SpecialtyKey =
  | "ginecologia" | "dermatologia" | "ortopedia" | "cardiologia"
  | "pediatria" | "odontologia" | "fisioterapia" | "psicologia"
  | "nutricao" | "oftalmologia" | "endocrinologia" | "neurologia"
  | "obstetricia" | "estetica" | "harmonizacao" | "cirurgia_plastica"
  | "reumatologia" | "geriatria" | "clinica_medica" | "geral";

function detectSpecialty(text: string): SpecialtyKey {
  const t = text.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
  if (t.includes("ginecolog") || t.includes("obstetr") || t.includes("pre-natal") || t.includes("pré-natal")) {
    if (t.includes("obstetr") || t.includes("pre-natal") || t.includes("pré-natal")) return "obstetricia";
    return "ginecologia";
  }
  if (t.includes("dermatolog")) return "dermatologia";
  if (t.includes("ortoped")) return "ortopedia";
  if (t.includes("cardio")) return "cardiologia";
  if (t.includes("pediatr")) return "pediatria";
  if (t.includes("odontolog") || t.includes("dentist") || t.includes("dental") || t.includes("odonto")) return "odontologia";
  if (t.includes("fisioter")) return "fisioterapia";
  if (t.includes("psicolog") || t.includes("psicoter")) return "psicologia";
  if (t.includes("nutri")) return "nutricao";
  if (t.includes("oftalmo") || t.includes("ocular") || t.includes("visao") || t.includes("visão")) return "oftalmologia";
  if (t.includes("endocrin") || t.includes("hormonal") || t.includes("hormonio")) return "endocrinologia";
  if (t.includes("neurolog") || t.includes("cerebr")) return "neurologia";
  if (t.includes("harmoniz") || t.includes("buco") || t.includes("orofacial") || t.includes("botox") || t.includes("preenchimento")) return "harmonizacao";
  if (t.includes("cirurgia plastica") || t.includes("cirurgi") && t.includes("plastic") || t.includes("plastico") || t.includes("plástico")) return "cirurgia_plastica";
  if (t.includes("reumatolog") || t.includes("artrite") || t.includes("lupus") || t.includes("fibromialg")) return "reumatologia";
  if (t.includes("geriatr") || t.includes("idoso") || t.includes("terceira idade") || t.includes("envelhecimento")) return "geriatria";
  if (t.includes("clinica medica") || t.includes("clínica médica") || t.includes("clinico geral") || t.includes("clínico geral") || t.includes("medicina interna") || t.includes("medicina do trabalho") || t.includes("medicina ocupacional")) return "clinica_medica";
  if (t.includes("estetica") || t.includes("estética") || t.includes("beleza") || t.includes("laser") || t.includes("medicina estetica") || t.includes("medicina estética")) return "estetica";
  return "geral";
}

// ─── Content library ────────────────────────────────────────────────────────

const LIBRARY: Record<SpecialtyKey, {
  heroLabels: string[];
  heroHeadlines: string[];
  heroSubtitles: string[];
  diferencialLabel: string;
  diferencialHeadline: string;
  diferencialCards: DiferencialCard[];
  sobreLabel: string;
  sobreText: string;
  servicosLabel: string;
  servicosHeadline: string;
  servicosSubtitle: string;
  servicoCards: ServiceCard[];
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
    diferencialCards: [
      { kpi: "15+", title: "Anos de experiência", desc: "Trajetória dedicada à saúde feminina em todas as fases da vida." },
      { kpi: "Humanizado", title: "Atendimento que acolhe", desc: "Escuta ativa, tempo de qualidade e decisões compartilhadas em cada consulta." },
      { kpi: "+3.000", title: "Pacientes atendidas", desc: "Mulheres que confiam seu cuidado ginecológico especializado a nós." },
      { kpi: "Moderno", title: "Consultório completo", desc: "Estrutura e equipamentos atualizados para diagnóstico preciso e seguro." },
    ],
    sobreLabel: "Sobre a",
    sobreText: "Sou ginecologista com dedicação ao cuidado integral da saúde feminina. Atendo com escuta ativa, tempo de qualidade e decisões compartilhadas, porque acredito que uma consulta de verdade começa quando a paciente se sente ouvida e acolhida.",
    servicosLabel: "Especialidades",
    servicosHeadline: "Áreas de Atuação",
    servicosSubtitle: "Cuidado ginecológico especializado em cada etapa da sua saúde",
    servicoCards: [
      { title: "Ginecologia Clínica", desc: "Consultas de rotina, exames preventivos e diagnóstico ginecológico especializado." },
      { title: "Saúde Hormonal", desc: "Equilíbrio hormonal para TPM, menopausa e bem-estar em cada fase da vida." },
      { title: "Colposcopia", desc: "Avaliação detalhada do colo do útero para diagnóstico precoce e seguro." },
      { title: "Planejamento Familiar", desc: "Orientação completa sobre métodos contraceptivos e saúde reprodutiva." },
      { title: "Pré-natal", desc: "Acompanhamento especializado e humanizado durante toda a gestação." },
      { title: "Prevenção e Rastreamento", desc: "Papanicolau, ultrassom e exames completos para saúde ginecológica preventiva." },
    ],
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
    diferencialCards: [
      { kpi: "10+", title: "Anos em obstetrícia", desc: "Dedicação exclusiva ao acompanhamento de gestantes com excelência e segurança." },
      { kpi: "Acolhedor", title: "Ambiente humanizado", desc: "Consultas com tempo e atenção para esclarecer todas as dúvidas da gestação." },
      { kpi: "+2.000", title: "Bebês acompanhados", desc: "Histórias de gestações saudáveis e partos seguros que nos enchem de orgulho." },
      { kpi: "Completo", title: "Pré-natal integral", desc: "Do primeiro trimestre ao pós-parto, com suporte contínuo e especializado." },
    ],
    sobreLabel: "Sobre a",
    sobreText: "Sou obstetra e ginecologista com paixão pelo acompanhamento da gestação. Cada pré-natal é uma história única — acolho gestantes com dedicação, segurança e toda a atenção que este momento especial merece.",
    servicosLabel: "Serviços",
    servicosHeadline: "Áreas de Atuação",
    servicosSubtitle: "Acompanhamento especializado da gestação ao pós-parto",
    servicoCards: [
      { title: "Pré-natal Completo", desc: "Acompanhamento integral da gestação, do primeiro trimestre ao nascimento." },
      { title: "Ultrassom Obstétrico", desc: "Avaliação detalhada do desenvolvimento fetal em cada fase da gestação." },
      { title: "Pré-natal de Alto Risco", desc: "Acompanhamento especializado para gestações que exigem maior atenção médica." },
      { title: "Pós-parto", desc: "Revisão e acompanhamento materno nas semanas após o parto." },
      { title: "Planejamento Familiar", desc: "Orientação para quem planeja engravidar, com avaliação de fertilidade e saúde reprodutiva." },
      { title: "Ginecologia Clínica", desc: "Consultas de rotina e exames preventivos fora do período gestacional." },
    ],
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
    diferencialCards: [
      { kpi: "10+", title: "Anos de especialização", desc: "Experiência em dermatologia clínica e estética para diagnósticos precisos e seguros." },
      { kpi: "Tecnologia", title: "Equipamentos modernos", desc: "Laser, dermatoscopia e tecnologias de ponta para melhores resultados." },
      { kpi: "+5.000", title: "Pacientes tratados", desc: "Histórias de pele transformada com segurança, ciência e cuidado individualizado." },
      { kpi: "Completo", title: "Clínica e estética", desc: "Tratamos doenças da pele e realizamos procedimentos estéticos com excelência." },
    ],
    sobreLabel: "Sobre a",
    sobreText: "Sou dermatologista com foco em diagnóstico preciso e tratamentos personalizados. Acredito que uma pele saudável começa com cuidado baseado em ciência — por isso combino tecnologia de ponta com atenção individualizada em cada consulta.",
    servicosLabel: "Especialidades",
    servicosHeadline: "Áreas de Atuação",
    servicosSubtitle: "Cuidados dermatológicos completos para a saúde e beleza da sua pele",
    servicoCards: [
      { title: "Dermatologia Clínica", desc: "Diagnóstico e tratamento de acne, dermatite, psoríase, eczema e outras condições da pele." },
      { title: "Mapeamento de Nevos", desc: "Monitoramento digital de pintas e lesões para detecção precoce do câncer de pele." },
      { title: "Dermatoscopia", desc: "Avaliação ampliada de lesões cutâneas com dermatoscópio de alta resolução." },
      { title: "Peeling Químico", desc: "Renovação celular e tratamento de manchas, marcas e textura irregular da pele." },
      { title: "Laser e Luz Intensa", desc: "Procedimentos a laser para rejuvenescimento, manchas e vasos aparentes." },
      { title: "Tricologia", desc: "Diagnóstico e tratamento de queda de cabelo e doenças do couro cabeludo." },
    ],
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
    diferencialCards: [
      { kpi: "15+", title: "Anos de experiência", desc: "Trajetória sólida em ortopedia clínica e cirúrgica com excelência comprovada." },
      { kpi: "Preciso", title: "Diagnóstico avançado", desc: "Avaliação criteriosa com apoio de exames de imagem para o diagnóstico correto." },
      { kpi: "+4.000", title: "Pacientes recuperados", desc: "Histórias de retorno ao movimento e à qualidade de vida que nos motivam." },
      { kpi: "Completo", title: "Clínico e cirúrgico", desc: "Tratamento conservador ou cirúrgico — sempre com foco no seu melhor resultado." },
    ],
    sobreLabel: "Sobre o",
    sobreText: "Sou ortopedista com dedicação ao diagnóstico e tratamento preciso de lesões e condições musculoesqueléticas. Meu objetivo é devolver movimento, qualidade de vida e autonomia a cada paciente — com o plano terapêutico mais adequado para cada caso.",
    servicosLabel: "Especialidades",
    servicosHeadline: "Áreas de Atuação",
    servicosSubtitle: "Tratamento especializado para cada condição ortopédica",
    servicoCards: [
      { title: "Ortopedia Clínica", desc: "Diagnóstico e tratamento de dores, fraturas, lesões musculares e articulares." },
      { title: "Cirurgia Ortopédica", desc: "Procedimentos cirúrgicos modernos para lesões e condições que necessitam de intervenção." },
      { title: "Artroscopia", desc: "Cirurgia minimamente invasiva para diagnóstico e tratamento de lesões articulares." },
      { title: "Coluna Vertebral", desc: "Tratamento de hérnia de disco, lombalgias, estenose e outras patologias da coluna." },
      { title: "Joelho e Quadril", desc: "Avaliação e tratamento especializado das principais articulações do corpo." },
      { title: "Ombro e Cotovelo", desc: "Diagnóstico e tratamento de tendinites, bursites, lesões do manguito rotador e mais." },
    ],
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
    diferencialCards: [
      { kpi: "15+", title: "Anos em cardiologia", desc: "Especialização e experiência para diagnóstico preciso das doenças cardiovasculares." },
      { kpi: "Preventivo", title: "Foco em prevenção", desc: "Identificamos riscos antes que se tornem problemas — cuidando do seu coração de verdade." },
      { kpi: "+5.000", title: "Pacientes acompanhados", desc: "Vidas protegidas com diagnóstico precoce e tratamento personalizado." },
      { kpi: "Moderno", title: "Exames completos", desc: "Ecocardiograma, teste ergométrico, Holter e os principais exames cardiológicos." },
    ],
    sobreLabel: "Sobre o",
    sobreText: "Sou cardiologista com foco em prevenção e tratamento personalizado das doenças cardiovasculares. Acredito que cuidar do coração vai além do diagnóstico — é construir com o paciente um estilo de vida que proteja sua saúde a longo prazo.",
    servicosLabel: "Especialidades",
    servicosHeadline: "Áreas de Atuação",
    servicosSubtitle: "Cuidado cardiovascular completo em cada etapa da sua vida",
    servicoCards: [
      { title: "Cardiologia Clínica", desc: "Consultas de rotina, prevenção e acompanhamento de doenças cardiovasculares." },
      { title: "Ecocardiograma", desc: "Avaliação da estrutura e função cardíaca com ultrassom de alta resolução." },
      { title: "Teste Ergométrico", desc: "Avaliação do coração em esforço para detecção de isquemia e capacidade cardíaca." },
      { title: "Holter 24h", desc: "Monitoramento contínuo do ritmo cardíaco para diagnóstico de arritmias." },
      { title: "MAPA", desc: "Monitoramento ambulatorial da pressão arterial durante 24 horas." },
      { title: "Hipertensão e Diabetes", desc: "Acompanhamento especializado dos principais fatores de risco cardiovascular." },
    ],
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
    diferencialCards: [
      { kpi: "10+", title: "Anos em pediatria", desc: "Experiência dedicada ao desenvolvimento saudável de crianças e adolescentes." },
      { kpi: "Acolhedor", title: "Ambiente infantil", desc: "Consultório planejado para deixar crianças à vontade desde a chegada." },
      { kpi: "+3.000", title: "Pacientes atendidos", desc: "Famílias que confiam a saúde dos filhos ao nosso cuidado especializado." },
      { kpi: "Integral", title: "Do recém-nascido ao teen", desc: "Acompanhamento contínuo do nascimento até os 18 anos com atenção completa." },
    ],
    sobreLabel: "Sobre a",
    sobreText: "Sou pediatra com paixão pelo desenvolvimento saudável de crianças e adolescentes. Atendo com carinho, paciência e atenção, porque sei que uma consulta pediátrica de qualidade cuida não só da criança, mas de toda a família.",
    servicosLabel: "Especialidades",
    servicosHeadline: "Áreas de Atuação",
    servicosSubtitle: "Cuidado pediátrico especializado em cada fase",
    servicoCards: [
      { title: "Consultas de Puericultura", desc: "Acompanhamento do crescimento, desenvolvimento e vacinação de bebês e crianças." },
      { title: "Pediatria Clínica", desc: "Diagnóstico e tratamento de doenças infantis com atenção e precisão." },
      { title: "Neonatologia", desc: "Cuidados especializados para recém-nascidos e bebês prematuros." },
      { title: "Saúde do Adolescente", desc: "Acompanhamento da saúde física e emocional na fase da adolescência." },
      { title: "Alergologia Pediátrica", desc: "Diagnóstico e tratamento de alergias alimentares, rinite e asma em crianças." },
      { title: "Orientação Nutricional", desc: "Guia de alimentação saudável para cada fase do desenvolvimento infantil." },
    ],
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
    diferencialCards: [
      { kpi: "12+", title: "Anos em odontologia", desc: "Experiência em odontologia clínica e estética para transformar sorrisos com segurança." },
      { kpi: "Digital", title: "Planejamento digital", desc: "Tecnologia de ponta para planejar seu tratamento e visualizar o resultado antes." },
      { kpi: "+4.000", title: "Pacientes atendidos", desc: "Sorrisos transformados com cuidado, técnica e atenção personalizada." },
      { kpi: "Indolor", title: "Tratamentos sem dor", desc: "Técnicas modernas de anestesia e sedação para consultas confortáveis." },
    ],
    sobreLabel: "Sobre a",
    sobreText: "Sou dentista com especialização em odontologia estética e reabilitadora. Acredito que um sorriso bonito precisa antes de tudo ser saudável — por isso combino diagnóstico criterioso com planejamento estético personalizado para cada paciente.",
    servicosLabel: "Especialidades",
    servicosHeadline: "Áreas de Atuação",
    servicosSubtitle: "Soluções odontológicas completas para sua saúde bucal",
    servicoCards: [
      { title: "Clareamento Dental", desc: "Clareamento a laser ou com moldeiras para um sorriso mais branco e natural." },
      { title: "Facetas de Porcelana", desc: "Lâminas cerâmicas ultrafinas que transformam a forma, cor e harmonia do sorriso." },
      { title: "Implante Dentário", desc: "Substituição de dentes ausentes com resultado idêntico ao dente natural." },
      { title: "Ortodontia", desc: "Correção do alinhamento dental com aparelho fixo, móvel ou alinhadores invisíveis." },
      { title: "Odontologia Estética", desc: "Resinas, reconstruções e procedimentos para devolver beleza e função ao sorriso." },
      { title: "Odontologia Preventiva", desc: "Limpeza, profilaxia e tratamento precoce para manter a saúde bucal em dia." },
    ],
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
    diferencialCards: [
      { kpi: "10+", title: "Anos de experiência", desc: "Especialização em fisioterapia musculoesquelética, neurofuncional e respiratória." },
      { kpi: "Personalizado", title: "Plano individualizado", desc: "Cada paciente recebe um protocolo de tratamento exclusivo para sua condição." },
      { kpi: "+3.000", title: "Pacientes reabilitados", desc: "Histórias de superação e retorno ao movimento que nos impulsionam." },
      { kpi: "Moderno", title: "Técnicas avançadas", desc: "Pilates clínico, RPG, dry needling e tecnologias de ponta na reabilitação." },
    ],
    sobreLabel: "Sobre a",
    sobreText: "Sou fisioterapeuta com foco em reabilitação funcional e qualidade de vida. Acredito que cada pessoa tem um potencial de recuperação único — por isso desenvolvo planos de tratamento individualizados, com técnicas baseadas em evidências e atenção constante à sua evolução.",
    servicosLabel: "Especialidades",
    servicosHeadline: "Áreas de Atuação",
    servicosSubtitle: "Tratamentos fisioterapêuticos especializados",
    servicoCards: [
      { title: "Fisioterapia Ortopédica", desc: "Reabilitação de fraturas, cirurgias e lesões musculoesqueléticas." },
      { title: "Pilates Clínico", desc: "Fortalecimento, postura e reabilitação com o método Pilates terapêutico." },
      { title: "RPG", desc: "Reeducação Postural Global para correção de desvios e alívio de dores crônicas." },
      { title: "Fisioterapia Neurofuncional", desc: "Reabilitação neurológica para AVC, Parkinson e lesões medulares." },
      { title: "Dry Needling", desc: "Agulhamento seco para alívio de pontos de tensão e dores musculares." },
      { title: "Fisioterapia Respiratória", desc: "Tratamento de doenças pulmonares e reabilitação pós-COVID." },
    ],
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
    diferencialCards: [
      { kpi: "8+", title: "Anos de atuação clínica", desc: "Experiência em psicoterapia individual, de casal e de grupos terapêuticos." },
      { kpi: "Sigiloso", title: "Espaço seguro e privado", desc: "Sessões com total confidencialidade e ambiente preparado para o seu bem-estar." },
      { kpi: "+1.000", title: "Pacientes acompanhados", desc: "Processos terapêuticos que geraram transformação real e bem-estar duradouro." },
      { kpi: "Online", title: "Presencial e online", desc: "Flexibilidade para atender no consultório ou por videochamada, onde você estiver." },
    ],
    sobreLabel: "Sobre a",
    sobreText: "Sou psicóloga clínica com abordagem humanista e foco no autoconhecimento. Ofereço um espaço seguro, acolhedor e sem julgamentos para que você possa explorar seus sentimentos, superar desafios e construir uma vida mais plena e equilibrada.",
    servicosLabel: "Especialidades",
    servicosHeadline: "Áreas de Atuação",
    servicosSubtitle: "Acompanhamento psicológico em diferentes contextos de vida",
    servicoCards: [
      { title: "Psicoterapia Individual", desc: "Acompanhamento psicológico para adultos em processos de autoconhecimento e transformação." },
      { title: "Terapia de Casal", desc: "Suporte profissional para casais em momentos de crise, conflito ou crescimento conjunto." },
      { title: "Ansiedade e Depressão", desc: "Tratamento especializado para transtornos de ansiedade, depressão e burnout." },
      { title: "Terapia Cognitivo-Comportamental", desc: "TCC com base em evidências para mudança de padrões de pensamento e comportamento." },
      { title: "Luto e Perdas", desc: "Suporte especializado para processar perdas e reconstruir a vida com significado." },
      { title: "Atendimento Online", desc: "Sessões por videochamada com a mesma qualidade e sigilo do atendimento presencial." },
    ],
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
    diferencialCards: [
      { kpi: "8+", title: "Anos de atuação", desc: "Especialização em nutrição clínica, esportiva e comportamento alimentar." },
      { kpi: "Personalizado", title: "Plano exclusivo", desc: "Cardápio e protocolo nutricional desenvolvido para o seu perfil e objetivos." },
      { kpi: "+2.000", title: "Pacientes acompanhados", desc: "Histórias de transformação real através da alimentação consciente e saudável." },
      { kpi: "Funcional", title: "Abordagem integrativa", desc: "Nutrição funcional que vai além das calorias — cuida de você por inteiro." },
    ],
    sobreLabel: "Sobre a",
    sobreText: "Sou nutricionista com abordagem clínica e funcional, focada em resultados reais e sustentáveis. Não acredito em dietas restritivas — acredito em educação alimentar, individualização e construção de uma relação saudável com a comida.",
    servicosLabel: "Especialidades",
    servicosHeadline: "Áreas de Atuação",
    servicosSubtitle: "Acompanhamento nutricional em diferentes contextos",
    servicoCards: [
      { title: "Nutrição Clínica", desc: "Tratamento nutricional para diabetes, hipertensão, dislipidemia e outras condições." },
      { title: "Emagrecimento Saudável", desc: "Protocolo individualizado para perda de peso com saúde, sem restrições radicais." },
      { title: "Nutrição Esportiva", desc: "Otimização da performance e recuperação atlética através da alimentação." },
      { title: "Nutrição Funcional", desc: "Abordagem integrativa que considera intestino, inflamação, hormônios e metabolismo." },
      { title: "Reeducação Alimentar", desc: "Construção de novos hábitos alimentares para uma vida saudável a longo prazo." },
      { title: "Nutrição na Gestação", desc: "Acompanhamento nutricional especializado para gestantes e puérperas." },
    ],
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
    diferencialCards: [
      { kpi: "12+", title: "Anos em oftalmologia", desc: "Especialização em oftalmologia clínica e cirúrgica com resultados reconhecidos." },
      { kpi: "Alta Tech", title: "Tecnologia de ponta", desc: "Tomografia de córnea, OCT retinal e laser dos mais modernos do mercado." },
      { kpi: "+6.000", title: "Pacientes atendidos", desc: "Visão protegida e restaurada com diagnóstico preciso e cirurgias seguras." },
      { kpi: "Completo", title: "Clínico e cirúrgico", desc: "Consultas de rotina, tratamento de doenças e cirurgias oftalmológicas em um só lugar." },
    ],
    sobreLabel: "Sobre o",
    sobreText: "Sou oftalmologista com foco em diagnóstico precoce e tratamento cirúrgico de precisão. Acredito que ver bem é fundamental para a qualidade de vida — por isso trabalho com tecnologia de ponta para proteger e restaurar a visão de cada paciente.",
    servicosLabel: "Especialidades",
    servicosHeadline: "Áreas de Atuação",
    servicosSubtitle: "Cuidado oftalmológico completo",
    servicoCards: [
      { title: "Exame de Vista Completo", desc: "Avaliação da acuidade visual, pressão ocular e saúde geral dos olhos." },
      { title: "Cirurgia Refrativa (Laser)", desc: "Correção de miopia, hipermetropia e astigmatismo com laser de última geração." },
      { title: "Cirurgia de Catarata", desc: "Facoemulsificação com implante de lente intraocular para restauração da visão." },
      { title: "Glaucoma", desc: "Diagnóstico precoce e tratamento do glaucoma para preservar a visão a longo prazo." },
      { title: "Retinopatia e Mácula", desc: "Avaliação e tratamento das doenças da retina e mácula com OCT e injeção intravítrea." },
      { title: "Olho Seco e Blefarite", desc: "Diagnóstico e tratamento da síndrome do olho seco e inflamações palpebrais." },
    ],
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
    diferencialCards: [
      { kpi: "12+", title: "Anos em endocrinologia", desc: "Especialização em distúrbios hormonais, metabólicos e doenças da tireoide." },
      { kpi: "Integral", title: "Visão do corpo inteiro", desc: "Avaliação que considera todos os sistemas envolvidos no equilíbrio hormonal." },
      { kpi: "+4.000", title: "Pacientes acompanhados", desc: "Histórias de equilíbrio metabólico e melhora na qualidade de vida." },
      { kpi: "Preciso", title: "Exames interpretados", desc: "Análise criteriosa de exames laboratoriais para diagnóstico e conduta certeiros." },
    ],
    sobreLabel: "Sobre o",
    sobreText: "Sou endocrinologista com foco no equilíbrio hormonal e metabólico de cada paciente. Trabalho com visão integrada do organismo, interpretando exames com cuidado para traçar o melhor plano terapêutico — seja para diabetes, tireoide, obesidade ou distúrbios hormonais.",
    servicosLabel: "Especialidades",
    servicosHeadline: "Áreas de Atuação",
    servicosSubtitle: "Tratamento endocrinológico em diferentes condições",
    servicoCards: [
      { title: "Diabetes Mellitus", desc: "Diagnóstico, controle e acompanhamento do diabetes tipo 1, tipo 2 e gestacional." },
      { title: "Doenças da Tireoide", desc: "Hipotireoidismo, hipertireoidismo, nódulos e câncer de tireoide com conduta especializada." },
      { title: "Obesidade e Sobrepeso", desc: "Abordagem clínica e medicamentosa para perda de peso segura e duradoura." },
      { title: "Saúde Hormonal Feminina", desc: "Menopausa, SOP, hiperprolactinemia e distúrbios hormonais femininos." },
      { title: "Osteoporose", desc: "Diagnóstico e tratamento da perda óssea com estratégias para prevenção de fraturas." },
      { title: "Distúrbios Metabólicos", desc: "Dislipidemia, síndrome metabólica e doenças da adrenal." },
    ],
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
    diferencialCards: [
      { kpi: "12+", title: "Anos em neurologia", desc: "Especialização em neurologia clínica com ampla experiência diagnóstica." },
      { kpi: "Preciso", title: "Diagnóstico diferenciado", desc: "Avaliação neurológica criteriosa com suporte de exames de imagem e neurofisiologia." },
      { kpi: "+3.000", title: "Pacientes atendidos", desc: "Diagnósticos que fizeram diferença real na vida e qualidade de cada paciente." },
      { kpi: "Integral", title: "Visão sistêmica", desc: "Tratamento que considera o paciente como um todo, não apenas o sintoma." },
    ],
    sobreLabel: "Sobre o",
    sobreText: "Sou neurologista com foco em diagnóstico preciso e tratamento humanizado das doenças do sistema nervoso. Acredito que um bom diagnóstico neurológico exige tempo, atenção e escuta — por isso ofereço consultas completas e individualizadas.",
    servicosLabel: "Especialidades",
    servicosHeadline: "Áreas de Atuação",
    servicosSubtitle: "Tratamento neurológico especializado",
    servicoCards: [
      { title: "Enxaqueca e Cefaleia", desc: "Diagnóstico e tratamento preventivo e abortivo das diferentes formas de cefaleia." },
      { title: "Epilepsia", desc: "Controle de crises epilépticas com protocolo terapêutico atualizado e seguro." },
      { title: "AVC e Prevenção", desc: "Avaliação de risco, diagnóstico e reabilitação pós-AVC isquêmico ou hemorrágico." },
      { title: "Doença de Parkinson", desc: "Diagnóstico precoce e acompanhamento especializado da doença de Parkinson." },
      { title: "Distúrbios de Memória", desc: "Avaliação cognitiva e tratamento de demências, Alzheimer e déficit de memória." },
      { title: "Neuropatias Periféricas", desc: "Diagnóstico e tratamento de dormências, formigamentos e fraqueza muscular." },
    ],
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
    diferencialCards: [
      { kpi: "10+", title: "Anos em estética", desc: "Experiência em procedimentos estéticos clínicos com foco em resultados naturais." },
      { kpi: "Natural", title: "Resultados equilibrados", desc: "Protocolo personalizado que valoriza sua beleza sem perder a naturalidade." },
      { kpi: "+3.000", title: "Procedimentos realizados", desc: "Clientes satisfeitos com autoestima elevada e resultados que falam por si." },
      { kpi: "Tecnologia", title: "Equipamentos modernos", desc: "Laser, radiofrequência, ultrassom e os mais avançados equipamentos estéticos." },
    ],
    sobreLabel: "Sobre a",
    sobreText: "Sou especialista em estética avançada com paixão por resultados naturais e seguros. Trabalho com um olhar individualizado para cada cliente, combinando tecnologia de ponta e protocolos modernos para realçar a beleza de quem já é bonito.",
    servicosLabel: "Procedimentos",
    servicosHeadline: "Nossos Tratamentos",
    servicosSubtitle: "Procedimentos estéticos especializados para cada necessidade",
    servicoCards: [
      { title: "Toxina Botulínica", desc: "Aplicação de botox para suavizar rugas e linhas de expressão com resultado natural." },
      { title: "Preenchimento Facial", desc: "Ácido hialurônico para restaurar volume, contorno e harmonia facial." },
      { title: "Laser e Fototerapia", desc: "Tratamento de manchas, rugas e irregularidades com laser de última geração." },
      { title: "Bioestimuladores", desc: "Estimulação da produção natural de colágeno para rejuvenescimento profundo." },
      { title: "Fios de PDO", desc: "Lifting não cirúrgico com fios tensores para rejuvenescimento e sustentação facial." },
      { title: "Skinbooster", desc: "Hidratação profunda da pele com ácido hialurônico injetável para luminosidade." },
    ],
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
  harmonizacao: {
    heroLabels: ["Harmonização Orofacial", "Harmonização Facial", "HOF especializada"],
    heroHeadlines: ["Harmonize sua beleza com resultados naturais e precisos", "Harmonização facial que respeita e realça quem você é"],
    heroSubtitles: ["Procedimentos de harmonização orofacial com técnica especializada e resultado natural e equilibrado.", "Botox, preenchimento e bioestimuladores para uma face harmônica, jovem e autêntica."],
    diferencialLabel: "Por que nos escolher",
    diferencialHeadline: "Harmonização com técnica, arte e naturalidade",
    diferencialCards: [
      { kpi: "8+", title: "Anos em HOF", desc: "Especialização em harmonização orofacial com centenas de procedimentos realizados." },
      { kpi: "Natural", title: "Resultados equilibrados", desc: "Técnica que valoriza os traços únicos de cada paciente sem perder a naturalidade." },
      { kpi: "+2.000", title: "Procedimentos realizados", desc: "Rostos harmonizados com segurança, técnica e atenção ao detalhe." },
      { kpi: "Avaliação", title: "Diagnóstico facial", desc: "Análise facial completa antes de cada procedimento para o melhor planejamento." },
    ],
    sobreLabel: "Sobre a",
    sobreText: "Sou especialista em harmonização orofacial com visão artística e técnica precisa. Cada rosto é único — por isso faço uma avaliação completa antes de cada procedimento, traçando um plano personalizado que respeita sua identidade e realça sua beleza natural.",
    servicosLabel: "Procedimentos",
    servicosHeadline: "Nossos Tratamentos",
    servicosSubtitle: "Procedimentos de harmonização para cada necessidade facial",
    servicoCards: [
      { title: "Toxina Botulínica", desc: "Suavização de rugas e linhas de expressão com botox de alta precisão e resultado natural." },
      { title: "Preenchimento com HA", desc: "Ácido hialurônico para lábios, maçãs do rosto, olheiras e contorno facial." },
      { title: "Bichectomia", desc: "Procedimento cirúrgico para afinar o rosto e definir o contorno mandibular." },
      { title: "Bioestimuladores de Colágeno", desc: "Estimulação natural do colágeno para firmeza e rejuvenescimento da pele." },
      { title: "Fios de PDO", desc: "Lifting não cirúrgico com fios tensores para reposicionamento e sustentação facial." },
      { title: "Rinomodelação", desc: "Correção e harmonização do nariz com preenchimento, sem cirurgia." },
    ],
    depoimentosSubtitle: "Histórias de rostos harmonizados e autoestima transformada.",
    contatoLabel: "Vamos conversar",
    contatoHeadline: "Sua harmonia facial começa aqui",
    contatoSubtitle: "Agende sua avaliação e descubra o melhor plano de harmonização para o seu rosto.",
    footerTagline: "Harmonia · Beleza · Naturalidade",
    faq: [
      { question: "Harmonização facial dói?", answer: "Os procedimentos são realizados com anestesia tópica e local, tornando a experiência confortável e com mínimo desconforto." },
      { question: "Os resultados são definitivos?", answer: "Depende do procedimento. Botox dura de 4 a 6 meses; preenchimentos de 12 a 18 meses. Na consulta, explicamos cada caso." },
      { question: "A harmonização fica artificial?", answer: "Com técnica especializada e planejamento correto, os resultados são naturais e valorizam seus traços — sem deixar aparência artificial." },
      { question: "Como agendar minha avaliação?", answer: "Pelo WhatsApp ou formulário desta página. Nossa equipe retorna rapidamente." },
    ],
  },
  cirurgia_plastica: {
    heroLabels: ["Cirurgia Plástica", "Cirurgia Plástica & Reconstrutora", "Cirurgia Plástica especializada"],
    heroHeadlines: ["Cirurgia plástica que transforma com segurança e naturalidade", "Resultados que respeitam sua identidade e elevam sua autoestima"],
    heroSubtitles: ["Procedimentos cirúrgicos plásticos com planejamento preciso, segurança e resultados naturais.", "Cirurgia plástica estética e reconstrutora com técnica avançada e cuidado individualizado."],
    diferencialLabel: "Por que nos escolher",
    diferencialHeadline: "Cirurgia plástica com segurança, arte e excelência",
    diferencialCards: [
      { kpi: "15+", title: "Anos de experiência", desc: "Trajetória dedicada à cirurgia plástica com centenas de procedimentos bem-sucedidos." },
      { kpi: "Natural", title: "Resultado harmonioso", desc: "Planejamento cirúrgico que respeita sua anatomia para resultados naturais e duradouros." },
      { kpi: "+3.000", title: "Cirurgias realizadas", desc: "Histórias de autoestima transformada com segurança e excelência técnica." },
      { kpi: "Acreditado", title: "Centro cirúrgico próprio", desc: "Estrutura hospitalar completa para sua segurança antes, durante e após o procedimento." },
    ],
    sobreLabel: "Sobre o",
    sobreText: "Sou cirurgião plástico com foco em resultados naturais, seguros e harmoniosos. Acredito que a cirurgia plástica bem feita respeita a identidade de cada paciente — por isso dedico atenção especial ao planejamento, à técnica e ao acompanhamento pós-operatório.",
    servicosLabel: "Procedimentos",
    servicosHeadline: "Nossas Cirurgias",
    servicosSubtitle: "Procedimentos cirúrgicos estéticos e reconstrutores",
    servicoCards: [
      { title: "Rinoplastia", desc: "Cirurgia de remodelação nasal para harmonia facial e melhora da respiração." },
      { title: "Mamoplastia", desc: "Aumento, redução ou elevação mamária com implantes e técnicas modernas." },
      { title: "Abdominoplastia", desc: "Remoção de excesso de pele e gordura abdominal com definição do contorno corporal." },
      { title: "Lipoaspiração", desc: "Remoção de gordura localizada com técnica de precisão e recuperação mais rápida." },
      { title: "Blefaroplastia", desc: "Cirurgia das pálpebras para rejuvenescimento do olhar e correção de excesso de pele." },
      { title: "Lifting Facial", desc: "Rejuvenescimento facial cirúrgico para reposicionamento dos tecidos e resultado duradouro." },
    ],
    depoimentosSubtitle: "Histórias de transformação e autoestima conquistada.",
    contatoLabel: "Vamos conversar",
    contatoHeadline: "Sua transformação começa com uma avaliação",
    contatoSubtitle: "Agende sua consulta de avaliação e conheça as possibilidades para o seu caso.",
    footerTagline: "Arte · Técnica · Excelência",
    faq: [
      { question: "Como é feito o planejamento cirúrgico?", answer: "Na consulta, fazemos uma avaliação completa, simulamos o resultado e discutimos todas as opções antes de definir o procedimento." },
      { question: "Quanto tempo é a recuperação?", answer: "Varia conforme o procedimento. Na consulta, explicamos o pós-operatório detalhado e os cuidados necessários." },
      { question: "As cirurgias são seguras?", answer: "Sim, quando realizadas por cirurgião plástico habilitado (membro da SBCP) em centro cirúrgico adequado." },
    ],
  },
  reumatologia: {
    heroLabels: ["Reumatologia especializada", "Reumatologia Clínica"],
    heroHeadlines: ["Cuidado reumatológico para uma vida com mais movimento e qualidade", "Reumatologia humanizada com diagnóstico preciso e tratamento eficaz"],
    heroSubtitles: ["Diagnóstico e tratamento das doenças reumáticas com atenção individualizada e abordagem moderna.", "Artrite, lúpus, fibromialgia e outras condições tratadas com ciência e cuidado próximo."],
    diferencialLabel: "Por que nos escolher",
    diferencialHeadline: "Reumatologia com precisão diagnóstica e cuidado humano",
    diferencialCards: [
      { kpi: "12+", title: "Anos em reumatologia", desc: "Especialização em doenças inflamatórias, autoimunes e musculoesqueléticas." },
      { kpi: "Precoce", title: "Diagnóstico cedo", desc: "Identificamos doenças reumáticas nas fases iniciais para melhor controle e prognóstico." },
      { kpi: "+3.000", title: "Pacientes acompanhados", desc: "Histórias de melhora funcional e qualidade de vida com tratamento especializado." },
      { kpi: "Moderno", title: "Terapias biológicas", desc: "Acesso às terapias biológicas e imunobiológicos mais modernos disponíveis." },
    ],
    sobreLabel: "Sobre o",
    sobreText: "Sou reumatologista com foco no diagnóstico precoce e tratamento personalizado das doenças reumáticas. Atendo com escuta ativa e dedicação, porque sei que condições como artrite, lúpus e fibromialgia impactam profundamente a qualidade de vida de cada paciente.",
    servicosLabel: "Especialidades",
    servicosHeadline: "Áreas de Atuação",
    servicosSubtitle: "Tratamento especializado das doenças reumáticas",
    servicoCards: [
      { title: "Artrite Reumatoide", desc: "Diagnóstico e tratamento da artrite reumatoide com terapias modernas e biológicas." },
      { title: "Lúpus Eritematoso", desc: "Acompanhamento especializado do lúpus com controle das crises e órgãos acometidos." },
      { title: "Fibromialgia", desc: "Diagnóstico e tratamento da fibromialgia com abordagem multimodal e integrativa." },
      { title: "Osteoartrite", desc: "Tratamento da artrose com foco em qualidade de vida, mobilidade e controle da dor." },
      { title: "Espondiloartrites", desc: "Diagnóstico e tratamento da espondilite anquilosante e outras espondiloartrites." },
      { title: "Síndrome de Sjögren", desc: "Tratamento das manifestações oculares, orais e sistêmicas da síndrome de Sjögren." },
    ],
    depoimentosSubtitle: "Histórias de controle da dor e retorno à qualidade de vida.",
    contatoLabel: "Vamos conversar",
    contatoHeadline: "Sua saúde reumática merece atenção especializada",
    contatoSubtitle: "Agende sua consulta e dê o primeiro passo para o controle da sua condição.",
    footerTagline: "Diagnóstico · Cuidado · Qualidade de vida",
    faq: [
      { question: "Quais sintomas levam ao reumatologista?", answer: "Dores articulares, rigidez matinal, inchaço nas juntas, fadiga, manchas na pele ou sintomas autoimunes — qualquer um destes justifica uma consulta." },
      { question: "Doenças reumáticas têm cura?", answer: "Algumas têm controle excelente com medicação. O objetivo é remissão da doença e qualidade de vida — o que é plenamente possível com tratamento correto." },
      { question: "Preciso de exames antes da primeira consulta?", answer: "Traga exames anteriores se tiver, mas não é obrigatório. Na consulta, solicitamos o que for necessário para o diagnóstico." },
    ],
  },
  geriatria: {
    heroLabels: ["Geriatria & Gerontologia", "Geriatria especializada", "Medicina do Idoso"],
    heroHeadlines: ["Envelhecimento saudável com cuidado especializado e humanizado", "Geriatria que garante qualidade de vida em cada fase do envelhecimento"],
    heroSubtitles: ["Acompanhamento geriátrico completo para uma longevidade com saúde, autonomia e bem-estar.", "Cuidado especializado para idosos — com foco na funcionalidade, independência e qualidade de vida."],
    diferencialLabel: "Por que nos escolher",
    diferencialHeadline: "Geriatria com olhar humano e abordagem integral",
    diferencialCards: [
      { kpi: "12+", title: "Anos em geriatria", desc: "Especialização em saúde do idoso com abordagem funcional e humanizada." },
      { kpi: "Integral", title: "Visão completa do paciente", desc: "Avaliação que vai além dos exames — considera função, cognição, humor e autonomia." },
      { kpi: "+3.000", title: "Pacientes acompanhados", desc: "Idosos e famílias que encontraram no cuidado geriátrico mais qualidade de vida." },
      { kpi: "Família", title: "Suporte à família", desc: "Orientamos cuidadores e familiares para o melhor cuidado no dia a dia." },
    ],
    sobreLabel: "Sobre o",
    sobreText: "Sou geriatra com dedicação ao envelhecimento saudável e à qualidade de vida do idoso. Minha abordagem é integral — avaliando função, cognição, medicamentos e suporte familiar para construir um plano de cuidados que preserve a autonomia e o bem-estar.",
    servicosLabel: "Especialidades",
    servicosHeadline: "Áreas de Atuação",
    servicosSubtitle: "Cuidado geriátrico completo para o idoso e sua família",
    servicoCards: [
      { title: "Avaliação Geriátrica Ampla", desc: "Avaliação multidimensional de saúde física, cognitiva, funcional e emocional." },
      { title: "Polifarmácia e Revisão Medicamentosa", desc: "Revisão dos medicamentos em uso para evitar interações e efeitos adversos." },
      { title: "Demências e Alzheimer", desc: "Diagnóstico precoce e acompanhamento especializado das demências e declínio cognitivo." },
      { title: "Prevenção de Quedas", desc: "Avaliação de risco e intervenções para prevenir quedas e manter a mobilidade." },
      { title: "Fragilidade e Sarcopenia", desc: "Diagnóstico e tratamento da perda muscular e fragilidade no envelhecimento." },
      { title: "Cuidados Paliativos", desc: "Suporte integral ao paciente e família em doenças avançadas com foco em conforto." },
    ],
    depoimentosSubtitle: "Histórias de idosos e famílias que encontraram cuidado e qualidade de vida.",
    contatoLabel: "Vamos conversar",
    contatoHeadline: "Seu familiar merece o melhor cuidado geriátrico",
    contatoSubtitle: "Agende a consulta e conheça como podemos melhorar a saúde e qualidade de vida do seu familiar.",
    footerTagline: "Longevidade · Cuidado · Qualidade de vida",
    faq: [
      { question: "A partir de que idade devo consultar um geriatra?", answer: "Recomenda-se a partir dos 60 anos, ou antes se houver múltiplas doenças crônicas, uso de muitos medicamentos ou declínio funcional." },
      { question: "Geriatra e clínico geral são diferentes?", answer: "Sim. O geriatra tem especialização específica na saúde do idoso, com foco na funcionalidade, cognição e envelhecimento saudável." },
      { question: "O geriatra também orienta a família?", answer: "Sim. Orientar cuidadores e familiares é parte essencial do cuidado geriátrico especializado." },
    ],
  },
  clinica_medica: {
    heroLabels: ["Clínica Médica", "Medicina Interna", "Clínica Geral especializada"],
    heroHeadlines: ["Cuidado médico completo para a sua saúde e bem-estar", "Clínica médica com diagnóstico preciso e acompanhamento próximo"],
    heroSubtitles: ["Atendimento clínico completo, com diagnóstico preciso e acompanhamento contínuo da sua saúde.", "Da prevenção ao tratamento de doenças complexas — com escuta ativa e medicina de qualidade."],
    diferencialLabel: "Por que nos escolher",
    diferencialHeadline: "Medicina interna com visão integral e humanizada",
    diferencialCards: [
      { kpi: "12+", title: "Anos de experiência", desc: "Trajetória sólida em clínica médica com foco em diagnóstico preciso e cuidado integral." },
      { kpi: "Preventivo", title: "Check-up completo", desc: "Avaliação preventiva abrangente para identificar riscos antes que se tornem problemas." },
      { kpi: "+5.000", title: "Pacientes atendidos", desc: "Histórias de saúde preservada com diagnóstico precoce e acompanhamento continuado." },
      { kpi: "Integral", title: "O médico que te conhece", desc: "Acompanhamento longitudinal que constrói vínculo e entende sua história de saúde." },
    ],
    sobreLabel: "Sobre o",
    sobreText: "Sou clínico médico com foco em diagnóstico preciso e acompanhamento longitudinal da saúde dos meus pacientes. Acredito na medicina preventiva e na construção de um vínculo de confiança — ser o médico que conhece você de verdade faz toda a diferença no cuidado.",
    servicosLabel: "Especialidades",
    servicosHeadline: "Áreas de Atuação",
    servicosSubtitle: "Atendimento clínico completo e integrado",
    servicoCards: [
      { title: "Check-up Preventivo", desc: "Avaliação clínica completa com exames para rastreamento precoce de doenças." },
      { title: "Doenças Crônicas", desc: "Acompanhamento de hipertensão, diabetes, dislipidemia e outras condições crónicas." },
      { title: "Medicina Interna", desc: "Diagnóstico e tratamento de doenças complexas que afetam múltiplos sistemas." },
      { title: "Saúde do Homem", desc: "Rastreamento e acompanhamento de doenças prevalentes no público masculino." },
      { title: "Medicina do Viajante", desc: "Orientação e vacinação para viagens internacionais, com prevenção de doenças tropicais." },
      { title: "Medicina Ocupacional", desc: "Exames admissionais, periódicos e demissionais para saúde no ambiente de trabalho." },
    ],
    depoimentosSubtitle: "Histórias de saúde preservada com acompanhamento médico de qualidade.",
    contatoLabel: "Vamos conversar",
    contatoHeadline: "Sua saúde merece acompanhamento especializado",
    contatoSubtitle: "Agende sua consulta e comece um acompanhamento médico de qualidade.",
    footerTagline: "Saúde · Prevenção · Excelência",
    faq: [
      { question: "Qual a diferença entre clínico geral e médico de família?", answer: "O clínico geral tem formação em medicina interna e diagnóstico. O médico de família tem ênfase no cuidado continuado e relação longitudinal. Ambos oferecem atenção integral." },
      { question: "Devo fazer check-up mesmo sem sintomas?", answer: "Sim. O check-up preventivo identifica riscos precocemente, antes que se tornem doenças — esta é a melhor medicina que existe." },
      { question: "O clínico pode me encaminhar para especialistas?", answer: "Sim. Uma das funções do clínico médico é coordenar o cuidado e encaminhar ao especialista adequado quando necessário." },
    ],
  },
  geral: {
    heroLabels: ["Atendimento Especializado", "Medicina especializada"],
    heroHeadlines: ["Cuidado especializado para a sua saúde", "Atendimento humanizado com diagnóstico preciso"],
    heroSubtitles: ["Atendimento médico especializado, humanizado e com atenção individualizada para cada paciente.", "Diagnóstico preciso e tratamento eficaz — cuidando da sua saúde com excelência."],
    diferencialLabel: "Por que nos escolher",
    diferencialHeadline: "Cuidado com técnica e sensibilidade",
    diferencialCards: [
      { kpi: "10+", title: "Anos de experiência", desc: "Trajetória dedicada ao atendimento de excelência com foco no paciente." },
      { kpi: "Humanizado", title: "Atenção individualizada", desc: "Escuta ativa e tempo de qualidade para entender cada caso em profundidade." },
      { kpi: "+3.000", title: "Pacientes atendidos", desc: "Histórias de cuidado e saúde que nos motivam a fazer sempre melhor." },
      { kpi: "Moderno", title: "Estrutura completa", desc: "Consultório equipado e parceiros para diagnóstico e tratamento completos." },
    ],
    sobreLabel: "Sobre o",
    sobreText: "Sou médico especialista com dedicação ao diagnóstico preciso e ao cuidado humanizado. Atendo com atenção individualizada, porque acredito que cada paciente merece tempo, escuta e um plano terapêutico construído especialmente para ele.",
    servicosLabel: "Especialidades",
    servicosHeadline: "Áreas de Atuação",
    servicosSubtitle: "Atendimento especializado em saúde",
    servicoCards: [
      { title: "Consultas de Rotina", desc: "Avaliação periódica completa para monitoramento da saúde e prevenção de doenças." },
      { title: "Diagnóstico Clínico", desc: "Avaliação criteriosa de sintomas e queixas com suporte de exames especializados." },
      { title: "Acompanhamento Crônico", desc: "Controle e acompanhamento de condições crônicas com consultas regulares." },
      { title: "Exames e Laudos", desc: "Solicitação e interpretação de exames laboratoriais e de imagem." },
      { title: "Prevenção e Check-up", desc: "Rastreamento preventivo para identificar riscos e agir antes do desenvolvimento da doença." },
    ],
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
    const wa = result.meta.whatsapp?.replace(/\D/g, "") ?? "";
    if (wa && wa.length <= 11) {
      result.meta = { ...result.meta, whatsapp: "55" + wa };
    }
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
    const name = result.meta?.doctorName?.split(" ").slice(0, 3).join(" ") ?? "";
    result.hero = { ...result.hero, cta2: name.startsWith("Dr") ? `Conhecer ${name}` : "Saiba mais sobre mim" };
  }

  // ── Diferenciais ─────────────────────────────────────────────────────────

  if (!result.diferenciais) result.diferenciais = {} as LandingCopy["diferenciais"];
  if (!result.diferenciais.label) result.diferenciais = { ...result.diferenciais, label: lib.diferencialLabel };
  if (!result.diferenciais.headline) result.diferenciais = { ...result.diferenciais, headline: lib.diferencialHeadline };
  if (!result.diferenciais.cards?.length) result.diferenciais = { ...result.diferenciais, cards: lib.diferencialCards };

  // ── Sobre ─────────────────────────────────────────────────────────────────

  if (!result.sobre) result.sobre = {} as LandingCopy["sobre"];
  if (!result.sobre.label && result.meta?.doctorName) {
    result.sobre = { ...result.sobre, label: `${lib.sobreLabel} ${result.meta.doctorName}` };
  } else if (!result.sobre.label) {
    result.sobre = { ...result.sobre, label: lib.sobreLabel };
  }
  if (!result.sobre.cta) {
    result.sobre = { ...result.sobre, cta: "Saiba mais sobre mim" };
  }
  if (!result.sobre.headline && result.meta?.doctorName) {
    result.sobre = { ...result.sobre, headline: `Muito prazer, eu sou ${result.meta.doctorName}` };
  } else if (!result.sobre.headline) {
    result.sobre = { ...result.sobre, headline: "Muito prazer, quem somos" };
  }
  if (!result.sobre.text) {
    result.sobre = { ...result.sobre, text: lib.sobreText };
  }

  // ── Serviços ──────────────────────────────────────────────────────────────

  if (!result.servicos) result.servicos = {} as LandingCopy["servicos"];
  if (!result.servicos.label) result.servicos = { ...result.servicos, label: lib.servicosLabel };
  if (!result.servicos.headline) result.servicos = { ...result.servicos, headline: lib.servicosHeadline };
  if (!result.servicos.subtitle) result.servicos = { ...result.servicos, subtitle: lib.servicosSubtitle };
  if (!result.servicos.cards?.length) result.servicos = { ...result.servicos, cards: lib.servicoCards };

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
  if (!result.localizacao.mapsEmbed && result.localizacao.address) {
    const q = encodeURIComponent(`${result.localizacao.address}, ${result.localizacao.city ?? ""}`);
    result.localizacao = { ...result.localizacao, mapsEmbed: `https://www.google.com/maps?q=${q}&output=embed` };
  }
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
