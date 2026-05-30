export type NavItem = { href: string; label: string; index: string };

export const navItems: NavItem[] = [
  { href: "#programa", label: "Programa", index: "01" },
  { href: "#niveles", label: "Niveles", index: "02" },
  { href: "#plan", label: "Plan", index: "03" },
  { href: "#cultura", label: "Cultura", index: "04" },
  { href: "#batches", label: "Batches", index: "05" },
];

export type Pilar = {
  title: string;
  desc: string;
  icon: "talent" | "mentor" | "leadership";
};

export const pilares: Pilar[] = [
  {
    title: "Talento no convencional",
    desc: "Buscamos motivación auténtica y ganas de crecer. La hoja de vida no decide tu lugar aquí.",
    icon: "talent",
  },
  {
    title: "Mentoría senior 1:1",
    desc: "Code reviews semanales, pair programming, career coaching. Un mentor real, no un foro abandonado.",
    icon: "mentor",
  },
  {
    title: "Liderazgo situacional",
    desc: "Modelo Hersey-Blanchard. Avanzas de E1 a E4 con criterios técnicos y de liderazgo claros.",
    icon: "leadership",
  },
];

export type Nivel = {
  num: string;
  name: string;
  role: string;
  leadership: string;
  desc: string;
  highlight?: boolean;
};

export const niveles: Nivel[] = [
  {
    num: "01",
    name: "Pre-Semilla",
    role: "Explorador/a",
    leadership: "E1 · Directivo",
    desc: "Aprende con guía, pregunta y participa activamente.",
  },
  {
    num: "02",
    name: "Semilla",
    role: "En formación",
    leadership: "E2 · Persuasivo",
    desc: "Comprende el por qué, se motiva y busca mejorar.",
  },
  {
    num: "03",
    name: "Junior 1",
    role: "Ejecutor guiado",
    leadership: "E2 · Persuasivo",
    desc: "Ejecuta tareas simples, asimila estándares de código.",
  },
  {
    num: "04",
    name: "Junior 2",
    role: "Ejecuta con apoyo",
    leadership: "E2–E3",
    desc: "Resuelve tareas con autonomía, propone soluciones.",
  },
  {
    num: "05",
    name: "Middle 1",
    role: "Colaborador activo",
    leadership: "E3 · Participativo",
    desc: "Ayuda a otros, documenta, comparte aprendizajes.",
  },
  {
    num: "06",
    name: "Middle 2",
    role: "Líder de módulo",
    leadership: "E3–E4",
    desc: "Coordina, toma decisiones y forma a otros.",
  },
  {
    num: "07",
    name: "Senior 1",
    role: "Mentor Técnico",
    leadership: "E4 · Delegativo",
    desc: "Lidera integraciones, guía niveles bajos, optimiza procesos.",
  },
  {
    num: "08",
    name: "Senior 2",
    role: "Arquitecto Estratégico",
    leadership: "E4 · Delegativo",
    desc: "Visión técnica global y diseño de sistemas complejos.",
  },
  {
    num: "09",
    name: "Director",
    role: "Líder Estratégico / Socio",
    leadership: "E4 · Directivo/Delegativo",
    desc: "Define visión tecnológica, alinea negocio y guía propósito.",
    highlight: true,
  },
];

export type Semana = {
  num: string;
  focus: string;
  title: string;
  desc: string;
};

export const semanas: Semana[] = [
  {
    num: "01",
    focus: "Enfoque y propósito",
    title: "Mi carta a CooWeb",
    desc: "Reunión 1:1, team sync grupal y ejercicio de propósito. Sales con un documento que orienta tus próximas semanas.",
  },
  {
    num: "02",
    focus: "Autonomía y tarea",
    title: "Quick Fix",
    desc: "Reto técnico personalizado, mini-proyecto individual y coaching 1:1. Entregas documentadas.",
  },
  {
    num: "03",
    focus: "Colaboración y liderazgo",
    title: "Código con causa",
    desc: "Retos por equipos mixtos y sesión de liderazgo delegativo. Proyecto colaborativo con impacto social.",
  },
  {
    num: "04",
    focus: "Medición y reflexión",
    title: "Retrospectiva",
    desc: "Encuesta de progreso, retrospectiva grupal y plan individual para el siguiente ciclo.",
  },
];

export type Valor = {
  title: string;
  desc: string;
  icon: "heart" | "spark" | "share" | "loop" | "eye" | "talk";
  featured?: boolean;
};

export const valores: Valor[] = [
  {
    title: "Respeto ante todo",
    desc: "Las ideas se discuten, las personas se cuidan.",
    icon: "heart",
  },
  {
    title: "Curiosidad constante",
    desc: "Preguntar es la clave para crecer.",
    icon: "spark",
  },
  {
    title: "Compartir conocimiento",
    desc: "Enseñar es aprender dos veces.",
    icon: "share",
  },
  {
    title: "Aprender del error",
    desc: "Valoramos la reflexión, no penalizamos fallar.",
    icon: "loop",
  },
  {
    title: "Transparencia",
    desc: "Tu voz importa en cada paso.",
    icon: "eye",
  },
  {
    title: "CooWeb Talks",
    desc: "Ritual obligatorio: una charla interna por ciclo. Compartes lo que aprendiste.",
    icon: "talk",
    featured: true,
  },
];

export type Batch = {
  id: string;
  title: string;
  subtitle: string;
  status: "abierto" | "proximamente" | "cerrado";
  desc: string;
  bullets: string[];
  featured?: boolean;
  cta: string;
};

export const batches: Batch[] = [
  {
    id: "batch-7",
    title: "Batch 7",
    subtitle: "Enero 2026 · Cohorte general",
    status: "cerrado",
    desc: "Primera cohorte del año con stack Full Stack + IA aplicada. Pasó las 4 semanas base y entró al segundo ciclo trimestral. Sebastián Ordoñez salió de aquí — hoy Junior 1 sosteniendo procesos en producción.",
    bullets: [
      "Stack: Next.js · TypeScript · IA aplicada",
      "Mentoría senior 1:1 semanal",
      "Primer ascenso E1 → Junior 1 confirmado",
    ],
    cta: "Ver historia",
  },
  {
    id: "batch-8",
    title: "Batch 8",
    subtitle: "Nivel Pro · Claude Code",
    status: "cerrado",
    desc: "Track avanzado en IA aplicada a código. Convocatoria cerrada — cohorte en marcha con certificación + proyecto final.",
    bullets: [
      "IA aplicada a desarrollo",
      "Certificación incluida",
      "Proyecto demo final",
    ],
    cta: "Ver silabus",
  },
  {
    id: "batch-9",
    title: "Batch 9",
    subtitle: "Próxima convocatoria",
    status: "proximamente",
    desc: "Siguiente cohorte abriendo pronto. Mismo programa base de 4 semanas + ciclo de evaluación trimestral. Déjanos tu correo y te avisamos cuando abra.",
    bullets: [
      "Programa base 4 semanas",
      "Mentoría senior 1:1",
      "Compensación desde día 1 ($)",
    ],
    featured: true,
    cta: "Avísame cuando abra",
  },
];

export type Testimonio = {
  id: string;
  name: string;
  badge: string;
  tenure: string;
  headline: string;
  body: string;
  quote: string;
  photo?: string;      // public path. If absent → fallback initial badge.
  initial?: string;    // letter for placeholder badge
  accent?: string;     // hex bg for placeholder card / pill
  placeholder?: boolean; // TODO marker for content team
};

// Orden carousel: Fanny (Coordinadora, voz institucional) abre; luego se
// intercala género en el resto del set.
export const testimonios: Testimonio[] = [
  {
    id: "fanny-tocora",
    name: "Fanny Tocora Yi",
    badge: "CooWeb · Coordinadora de Bienestar",
    tenure: "Bienestar, Desarrollo y Crecimiento",
    headline: "No solo formamos desarrolladores. Formamos propósito.",
    body: "Como Coordinadora de Bienestar, Desarrollo y Crecimiento, Fanny acompaña el crecimiento integral de cada joven del Semillero. Su mirada va más allá del código: liderazgo, visión de futuro e impacto positivo en la región a través de la tecnología y la inteligencia artificial.",
    quote:
      "El Semillero de CooWeb no solo forma desarrolladores; forma jóvenes con propósito, liderazgo y visión de futuro. Impulsamos su crecimiento integral para que generen innovación, oportunidades e impacto positivo en nuestra región y en la sociedad.",
    photo: "/img-fanny.png",
    accent: "#5EEAD4",
  },
  {
    id: "sebastian-ordonez",
    name: "Sebastian Ordoñez",
    badge: "Batch 7 · hoy Junior 1",
    tenure: "En CooWeb desde Diciembre 2025",
    headline: "De E1 a Junior 1 en cinco meses.",
    body: "Sebastian entró al Batch 7 sin etiquetas. En cinco meses pasó de seguir instrucciones a sostener piezas clave del ecosistema — moviéndose entre Full Stack, IA y QA según lo que pida el equipo. El mes pasado ascendió a Junior 1 y hoy mantiene procesos críticos donde participa.",
    quote:
      "Llegué a CooWeb desorientado y con la expectativa por el suelo. Hoy soy Junior del equipo — hace cinco meses no me reconocería.",
    photo: "/image-ordo.png",
    accent: "#5EEAD4",
  },
  {
    id: "erika-contreras",
    name: "Erika Contreras",
    badge: "Ex-Semilla · hoy Directora en MyCoin S.A.S.",
    tenure: "Mamá y profesional · sin elegir entre ambas",
    headline: "Mamá, líder y Directora — sin elegir.",
    body: "Entró buscando crecer profesionalmente sin renunciar a su familia. Pasó de desarrolladora a liderar un departamento de sistemas con clientes internacionales. Hoy es Directora en MyCoin S.A.S. — y dice que se transformó también como persona.",
    quote:
      "El semillero me demostró que no tenía que elegir entre ser mamá y crecer profesionalmente. Me dio la tranquilidad de avanzar sin sacrificar a mi familia.",
    photo: "/img-erika.png",
    accent: "#38BDF8",
  },
  {
    id: "juan-fernando",
    name: "Juan Fernando",
    badge: "Ex-Semilla · hoy Full Stack Developer",
    tenure: "Lidera equipos · proyectos internacionales",
    headline: "De cero experiencia a liderar equipos.",
    body: "Entró sin experiencia laboral real, solo con ganas de aprender. Encontró un entorno para equivocarse, crecer y recibir guía de desarrolladores senior. Hoy lidera equipos de desarrollo y gestiona proyectos con clientes de distintos países.",
    quote:
      "El semillero no solo te da una primera oportunidad — te da la experiencia que el mercado siempre exige pero rara vez regala.",
    photo: "/img-juanfer.png",
    accent: "#2DD4BF",
  },
  {
    id: "camilo-lopez",
    name: "Camilo López",
    badge: "Semilla · hoy Middle Developer",
    tenure: "Programando desde los 14 · CooWeb a los 18",
    headline: "De Semilla a Middle en 8 meses.",
    body: "Camilo entró con 18 años y años de curiosidad acumulada desde los 14. En tres meses alcanzó Junior. En ocho, Middle Developer. Hoy no solo escribe código — diseña sistemas que mueven operaciones reales.",
    quote:
      "Empecé a programar a los 14 sin saber a dónde me llevaría. Hoy con 20 años estoy construyendo sistemas que orquestan envíos reales para una de las cadenas más grandes del país.",
    photo: "/img-camilo.png",
    accent: "#7DD3FC",
  },
  {
    id: "karoll-marquez",
    name: "Karoll Marquez",
    badge: "Ex-Semilla · hoy Desarrollador de Soluciones IA",
    tenure: "Ingeniería de Sistemas · IA y automatización",
    headline: "De estudiante a construir soluciones con IA.",
    body: "Comenzó aprendiendo desarrollo web mientras estudiaba Ingeniería de Sistemas. Con el tiempo amplió sus conocimientos hacia IA, automatización y desarrollo de productos digitales. Hoy construye soluciones tecnológicas que ayudan a empresas a optimizar procesos y crecer.",
    quote:
      "Descubrí que podía crear mucho más que aplicaciones. La combinación de desarrollo, IA y automatización me permitió convertir ideas en soluciones con impacto real.",
    photo: "/img-karoll.png",
    accent: "#14B8A6",
  },
  {
    id: "antonio-perez",
    name: "Antonio Perez",
    badge: "Ex-Semilla · hoy CTO",
    tenure: "4 años en CooWeb",
    headline: "De buscar empleo en pandemia a CTO.",
    body: "Entró buscando empleo en plena pandemia y se quedó 4 años. Implementó cada tecnología de vanguardia que apareció en el camino, proponiendo soluciones innovadoras y funcionales. Hoy lidera la tecnología de una nueva startup como CTO — y va por más.",
    quote:
      "Implementábamos todas las tecnologías del momento, siempre proponiendo soluciones innovadoras. Esos conocimientos me llevaron al puesto de CTO.",
    photo: "/img-antonio.png",
    accent: "#BAE6FD",
  },
  {
    id: "anderson-prado",
    name: "Anderson Prado",
    badge: "Ex-Semilla · hoy Semi Senior Developer",
    tenure: "Llegó por un concurso universitario · hoy lidera equipos",
    headline: "De concurso universitario a liderar equipos.",
    body: "Llegó al semillero ganando un concurso universitario, dando sus primeros pasos en el desarrollo profesional. Trabajó en proyectos reales con distintos clientes, aprendiendo de profesionales con amplia trayectoria. Hoy es Semi Senior Developer y lidera equipos en proyectos para clientes de distintos países.",
    quote:
      "Cada proyecto, cada cliente y cada mentor aportó a mi crecimiento técnico y profesional. Hoy lidero equipos en proyectos internacionales.",
    photo: "/img-ander.png",
    accent: "#0D9488",
  },
];

// Back-compat — first testimonio
export const testimonio = testimonios[0];

export type Metric = { value: string; suffix?: string; label: string };

export const metrics: Metric[] = [
  { value: "54", suffix: "+", label: "Jóvenes transformados" },
  { value: "90", suffix: "%", label: "Tasa de permanencia" },
  { value: "4", label: "Semanas base" },
  { value: "100", suffix: "%", label: "Mentoría senior" },
];

export const taglines = [
  "Tecnología",
  "Liderazgo",
  "Propósito Social",
];

// ============================================================
// Landing de Empresas Patrocinadoras (/empresas)
// Fuente: "Empresas semillero.docx"
// ============================================================

export const empresaHero = {
  eyebrow: "Empresas patrocinadoras",
  title: "Transforma un reto técnico en una oportunidad de impacto social.",
  highlight: "impacto social",
  subtitle:
    "Conviértete en Empresa Patrocinadora del Semillero CooWeb: resuelve un “dolor” técnico de tu negocio mientras impulsas al próximo talento digital.",
  ctaPrimary: "Solicitar diagnóstico gratuito",
  ctaSecondary: "Ver cómo funciona",
};

export const empresaProblema = {
  title: "Esa tarea que llevas meses posponiendo.",
  body: "Toda empresa en crecimiento tiene procesos por optimizar, webs por mejorar o ideas por prototipar que se quedan en el tintero por falta de manos o presupuesto. Creamos un modelo donde tu empresa aporta un estímulo económico educativo para nuestros jóvenes y, a cambio, nuestro equipo resuelve una necesidad técnica real de tu negocio.",
};

export type EmpresaPaso = {
  num: string;
  title: string;
  desc: string;
};

export const empresaPasos: EmpresaPaso[] = [
  {
    num: "01",
    title: "Postulas tu “dolor” técnico",
    desc: "Nos cuentas qué proceso quieres automatizar, qué landing necesitas lanzar o qué problema digital quieres solucionar.",
  },
  {
    num: "02",
    title: "Evaluamos la viabilidad",
    desc: "Nuestro equipo Senior analiza tu caso para asegurar que el reto sea compatible con las habilidades de los estudiantes en etapa práctica.",
  },
  {
    num: "03",
    title: "Activamos tu célula de desarrollo",
    desc: "Si tu proyecto califica, asignamos una dupla: 1 Joven Talento (manos a la obra) + 1 Mentor Senior (garante de la calidad del entregable).",
  },
];

export type EmpresaArea = {
  title: string;
  desc: string;
  icon: "web" | "automation" | "mvp" | "support";
};

export const empresaAreas: EmpresaArea[] = [
  {
    title: "Presencia digital",
    desc: "Creación, rediseño o actualización de sitios web y landing pages de venta.",
    icon: "web",
  },
  {
    title: "Automatización de procesos",
    desc: "Conexión de herramientas (CRM, formularios, bases de datos) para eliminar tareas repetitivas.",
    icon: "automation",
  },
  {
    title: "Innovación y MVPs",
    desc: "Desarrollo de prototipos iniciales para validar nuevas ideas de negocio rápidamente.",
    icon: "mvp",
  },
  {
    title: "Soporte y optimización",
    desc: "Limpieza de código, corrección de bugs menores o mejoras de rendimiento web.",
    icon: "support",
  },
];

export type EmpresaBeneficio = {
  title: string;
  desc: string;
  icon: "cost" | "talent" | "hire";
};

export const empresaBeneficios: EmpresaBeneficio[] = [
  {
    title: "Resuelves a fracción del costo",
    desc: "Solucionas un problema interno real con acompañamiento Senior, muy por debajo del costo de mercado.",
    icon: "cost",
  },
  {
    title: "Ves trabajar a tu futuro talento",
    desc: "Observas en tiempo real cómo trabaja el joven: su criterio, su ritmo y su forma de resolver.",
    icon: "talent",
  },
  {
    title: "Contratas sin costo de reclutamiento",
    desc: "Si el joven hace “match” con tu cultura, puedes contratarlo directamente al finalizar el programa.",
    icon: "hire",
  },
];

export const empresaCelula = {
  title: "Tu célula de desarrollo",
  desc: "No mandamos a alguien solo. Cada proyecto lo sostiene una dupla diseñada para entregar calidad real.",
  joven: {
    label: "Joven Talento",
    role: "Manos a la obra",
    desc: "Ejecuta el proyecto con energía, criterio y ganas de demostrar lo que aprende.",
  },
  mentor: {
    label: "Mentor Senior",
    role: "Garante de calidad",
    desc: "Revisa, guía y responde por el entregable. Tu proyecto nunca queda solo.",
  },
};

export const empresaCTA = {
  title: "¿Quieres vincular a tu empresa?",
  body: "Los cupos de patrocinio por ciclo son limitados para garantizar el acompañamiento Senior de cada proyecto. Agenda una sesión de diagnóstico de 15 minutos (sin costo) para evaluar tu reto técnico y conocer los planes de patrocinio disponibles.",
  cta: "Solicitar diagnóstico gratuito",
  note: "Cupos limitados por ciclo",
};
