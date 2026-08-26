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
    subtitle: "Project Manager AI",
    status: "cerrado",
    desc: "Track intensivo de gestión de proyectos con IA. Se realizó en un día de formación concentrada y una semana después tuvo su demo final — proyecto entregado.",
    bullets: [
      "Formación intensiva en un día",
      "Demo final a la semana",
      "Gestión de proyectos con IA",
    ],
    cta: "Ver historia",
  },
  {
    id: "batch-10",
    title: "Batch 10",
    subtitle: "Próxima convocatoria",
    status: "proximamente",
    desc: "Siguiente cohorte abriendo pronto. Mismo programa base de 4 semanas + ciclo de evaluación trimestral. Déjanos tu correo y te avisamos cuando abra.",
    bullets: [
      "Programa base 4 semanas",
      "Mentoría senior 1:1",
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
  batch?: string;      // batch id, e.g. "batch-7"
  batchExperience?: string; // texto corto de experiencia en el batch (reemplazar después)
  batchHeadline?: string; // headline solo para el modal de Batches (fallback → headline)
  batchBody?: string;  // body solo para el modal de Batches (fallback → body)
  batchQuote?: string; // quote solo para el modal de Batches (fallback → quote)
  batchOnly?: boolean; // si true, no aparece en el carrusel de Historias
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
    batch: "batch-7",
    batchExperience: "El Batch 7 fue intenso desde el primer día. Aprendí más en cuatro semanas que en meses por mi cuenta — el ritmo, la exigencia y el acompañamiento lo cambian todo.",
    tenure: "En CooWeb desde Diciembre 2025",
    headline: "De E1 a Junior 1 en cinco meses.",
    body: "Entré al Batch 7 sin saber bien qué esperar. Los primeros días fueron un golpe de realidad: el ritmo era otro, las exigencias eran otras, y yo tenía que estar a la altura. Pasé de recibir instrucciones paso a paso a tomar decisiones sobre piezas reales del ecosistema. No fue fácil — hubo semanas donde el código no salía y la frustración era real. Pero cada code review, cada pair programming con el mentor, me fue dando más criterio. En cinco meses ascendí a Junior 1. Hoy sostengo procesos en producción y ya no reconozco al que llegó desorientado aquel primer día.",
    quote:
      "Llegué a CooWeb desorientado y con la expectativa por el suelo. Hoy soy Junior del equipo — hace cinco meses no me reconocería.",
    batchHeadline: "Un ritmo real, y nunca lo enfrenté solo.",
    batchBody: "El batch me puso al ritmo real de la industria, y eso fue justo lo que me hizo crecer. Cada reto venía con acompañamiento: mentores que revisaban mi código y me daban criterio cuando me trababa, nunca me dejaron a la deriva. Trabajamos sobre proyectos reales — una landing para una óptica, toda enfocada en la experiencia de usuario, y una demo day donde montamos un chatbot conversacional para el negocio de un cliente. Ahí entendí algo que aplico hasta hoy: la eficiencia y la funcionalidad van sobre la perfección, lo importante es entregar valor sin quedarte atascado. Y nunca lo viví solo — el Discord siempre activo y la gente del batch hicieron que aprender se sintiera como un equipo, no como una carrera.",
    batchQuote:
      "Aprendí que entregar valor pesa más que perseguir la perfección — y que nunca tienes que hacerlo solo.",
    photo: "/image-ordo.png",
    accent: "#5EEAD4",
  },
  {
    id: "santiago-avendano",
    name: "Santiago Avendaño",
    badge: "Batch 7 · QA & Frontend",
    batch: "batch-7",
    batchExperience: "Mi primer rol en el Batch 7 fue QA en el proyecto Cava: documentos de requerimientos larguísimos y flujos que no sabía cómo abordar. Nunca llegué al colapso porque el equipo siempre me tiró un cable.",
    tenure: "Estudiante universitario · de asustado a disfrutar el proceso",
    headline: "Nunca más me quedo estático — lo mío es seguir empujando.",
    body: "Mientras estudiaba en la universidad sentía que me quedaba atrás comparado con mis compañeros, y cargaba un miedo enorme a no cumplir las expectativas de nadie. Fueron mis amigos y mis tías quienes me insistieron tanto que al final me empujaron a aplicar — confieso que entré dudando de mi propia capacidad. El primer golpe de realidad no fue tirando código, sino aprendiendo a ser QA en el proyecto Cava: documentos de requerimientos larguísimos y flujos nuevos que tenía que revisar con lupa para que la plataforma cuadrara exactamente con lo escrito en el papel. Luego pasé al frontend en Telemed, configurando módulos existentes y arreglando flujos en caliente. Había presión, pero nunca llegué al colapso porque mis compañeros siempre estuvieron ahí tirándome un cable cuando me trababa. Esa red de apoyo fue mi verdadero quiebre interno: entendí que no necesitaba saberlo todo de memoria para avanzar, que el equipo te sostiene. Hoy veo un antes y un después absoluto. Ya no soy el estudiante asustado — soy alguien que disfruta el proceso. Y me llevo una regla de vida muy clara: nunca más me quedo estático en un solo lugar.",
    quote: "Entendí que no necesitaba saberlo todo de memoria para avanzar — el equipo te sostiene, y eso lo cambia todo.",
    batchOnly: true,
    photo: "/img-avendano.png",
    accent: "#BAE6FD",
  },
  {
    id: "blas-casiano",
    name: "Blas Casiano",
    badge: "Batch 7 · hoy Semilla 2",
    batch: "batch-7",
    batchExperience: "Mi primera semana en el Batch 7 fue un golpe de realidad: el primer code review fue implacable y dudé de mí mismo. Pero el hambre de aprender fue más fuerte que el miedo.",
    tenure: "Estudiante de Ingeniería de Sistemas · trabajando y estudiando a la vez",
    headline: "El hambre de aprender fue más fuerte que el miedo.",
    body: "Antes de entrar era solo un estudiante de ingeniería de sistemas con la cabeza llena de sueños, cargando el miedo típico de pensar que nunca estás listo. Un amigo que ya trabajaba adentro me empujó a aplicar, recordándome que compartíamos las mismas capacidades. Mi primer choque fue el code review de la primera semana: me corrigieron tantas cosas que volví a dudar, pero el hambre de aprender fue más fuerte. El momento técnico que más me marcó fue un bug eterno con una app móvil que no corría en mi PC por culpa de las terminales — sufrimiento que equilibré con la experiencia presencial en el proyecto Raudoc. En lo humano, me quedo con las charlas con mi mentor y con la complicidad de Andrés Jaimes, el compañero con el que nos cuidamos la espalda en cada deploy. Equilibrar lo académico con lo laboral me obligó a madurar: cada minuto cuenta. Hoy, como Semilla 2, veo en el espejo una disciplina, un sentido de pertenencia y una responsabilidad totalmente diferentes.",
    quote: "Cargaba el miedo típico de pensar que nunca estás listo — hasta que entendí que ese miedo no desaparece, simplemente deja de mandarte.",
    batchOnly: true,
    photo: "/img-blas.png",
    accent: "#7DD3FC",
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
    accent: "#5EEAD4",
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
  {
    id: "manuel-diaz",
    name: "Manuel Díaz",
    badge: "Semilla · IA + desarrollo de software",
    tenure: "Cada reto, una experiencia gratificante",
    headline: "Crecimos juntos — código, IA y compañerismo.",
    body: "Desde el primer día, asumir retos nuevos lo fortaleció técnica y personalmente. Encontró un equipo que comparte conocimiento, apoya a los demás y empuja sus propios límites. Hoy participa en proyectos de software con IA donde innovación y aprendizaje van de la mano.",
    quote:
      "Aquí no solo desarrollamos software con IA — construimos juntos un entorno donde la innovación, el aprendizaje y el compañerismo van de la mano.",
    photo: "/img-manuel.png",
    accent: "#5EEAD4",
  },
  {
    id: "sebastian-gonzalez",
    name: "Sebastian Gonzalez Fornaris",
    badge: "Semilla · hoy Junior Developer",
    tenure: "Casi un año en esta familia",
    headline: "Del primer condicional en PSeInt a liderar.",
    body: "Empezó en primer semestre de universidad: apenas sabía escribir un condicional simple en PSeInt y se lanzó a la aventura sin red. El camino fue exigente — muchos retos de golpe y una carga enorme de información nueva — pero con esfuerzo y perseverancia lo logró. Hoy lidera, desarrolla y se desenvuelve en entornos profesionales de una forma que jamás imaginó.",
    quote:
      "Siempre pensé que no duraría nada en la empresa, que no tenía el conocimiento suficiente o que no daba la talla. Pero todos creyeron en mí, y me llené de valor para salir adelante.",
    photo: "/img-gonzalez.png",
    accent: "#38BDF8",
  },
  {
    id: "sebastian-arteta",
    name: "Sebastián Arteta De la Torre",
    badge: "Ex-Semilla AI · hoy Junior Developer",
    tenure: "Papá joven y desarrollador joven",
    headline: "De una afición al hardware a crear cosas magníficas.",
    body: "Una pequeña afición por el hardware y el software se volvió enorme y lo trajo hasta aquí: a construir cosas que, si se las hubieran contado hace ocho años, no habría creído posibles. Hoy es Junior Developer en el ecosistema AI de CooWeb.",
    quote:
      "Cuando tienes ganas, y tokens, siempre puedes. En CooWeb siempre puedes — y desde que empiezas como semilla, te das cuenta.",
    batch: "batch-7",
    batchExperience: "La primera semana fue un choque total: los code reviews me rompieron la cabeza al entender que programar no es solo que el código funcione, sino cómo se integra en un flujo profesional. El crecimiento fue técnico y colectivo a la vez.",
    batchHeadline: "De una afición al hardware a crear cosas magníficas.",
    batchBody: "Antes de empezar estaba sumergido en mi afición por el hardware y el ensamble de computadores, esperando que esa curiosidad técnica algún día se transformara en una carrera sólida. Me enteré del programa Semilla AI y lo que me empujó a aplicar fue esa chispa de querer construir cosas reales, saltando del simple interés por los componentes a la creación de software. La primera semana fue un choque total: los primeros code reviews y mentorías me rompieron la cabeza al entender que programar no es solo que el código funcione, sino cómo se integra en un flujo profesional. El reto técnico que más me marcó fue la integración de modelos de IA con lógica de backend — un bug en la gestión de tokens me tuvo horas probando hasta que ese deploy exitoso se sintió como una victoria personal. Pero más allá del código, los rituales de retroalimentación con mis compañeros me enseñaron que el crecimiento es colectivo. El quiebre llegó cuando dejé de verme como un estudiante para asumirme como alguien capaz de resolver problemas complejos. Hoy, como Junior Developer, miro hacia atrás y veo que el hardware fue solo el punto de partida para crear cosas magníficas.",
    batchQuote:
      "Cuando tienes ganas, y tokens, siempre puedes. En CooWeb siempre puedes — y desde que empiezas como semilla, te das cuenta.",
    photo: "/img-arteta.png",
    accent: "#2DD4BF",
  },
  {
    id: "sharikg-perez",
    name: "Sharikg Michel Pérez Montes",
    badge: "Pre-Semilla · Batch 9 · hoy Project Manager",
    batch: "batch-9",
    batchExperience: "El Batch 9 me demostró que gestionar con IA no es el futuro — es el presente. En un día aprendí a estructurar, priorizar y entregar. La demo final fue la prueba de que sí se puede.",
    tenure: "De “no sé si puedo” a gestionar equipos y clientes",
    headline: "De “no sé si puedo” a liderar equipos.",
    body: "Llegué al Batch 9 sin saber que en un solo día iba a cambiar la forma en que veía la gestión de proyectos. La metodología era nueva, la IA era nueva, el ritmo era intenso — pero todo tenía un propósito claro. Lo que más me sorprendió fue darme cuenta de cuánto podía lograr cuando tienes las herramientas correctas y alguien que te guía. La demo final fue el momento en que entendí que ya no era la misma persona que había entrado esa mañana. Hoy lidero equipos y gestiono clientes — y todo empezó con esa apuesta de un día.",
    quote:
      "Entré con miedo de no estar lista para algo tan grande, pero terminé descubriendo que sí soy capaz de aprender, liderar y crecer muchísimo más de lo que imaginaba.",
    photo: "/img-shari.png",
    accent: "#7DD3FC",
  },
  {
    id: "manuela-maiguel",
    name: "Manuela Maiguel",
    badge: "Semilla · Batch 8",
    batch: "batch-8",
    batchExperience: "Entrar al Batch 8 fue lanzarme sin red. Pero el entorno hace que confíes en el proceso — cada semana se siente el avance y eso te mantiene.",
    tenure: "Aprendizaje · Curiosidad · Crecimiento",
    headline: "Comenzando un camino de crecimiento.",
    body: "Entré al Batch 8 buscando algo más que clases. Quería un entorno donde aprender tuviera consecuencias reales, donde equivocarse no fuera el fin sino parte del proceso. Lo encontré. Desde la primera semana sentí que cada tarea importaba, que cada feedback tenía peso. Lo que más valoro es que nadie te deja solo: hay alguien siempre dispuesto a orientarte sin hacerte sentir menos. Apenas comienzo, pero ya siento que estoy en el lugar correcto en el momento correcto.",
    quote:
      "Semilla me recordó que cada gran proyecto empieza con una pequeña oportunidad para aprender y atreverse a crecer.",
    photo: "/img-maiguel.png",
    accent: "#5EEAD4",
  },
  {
    id: "maileth-vallejo",
    name: "Maileth Vallejo",
    badge: "Semilla · Batch 8",
    batch: "batch-8",
    batchExperience: "Lo que más me sorprendió del Batch 8 fue la comunidad. No estás solo aprendiendo — estás creciendo con personas que tienen las mismas ganas que tú.",
    tenure: "Colaboración · Aprendizaje · Nuevas oportunidades",
    headline: "Sembrando ideas para el futuro.",
    body: "No sabía exactamente qué iba a encontrar en el Batch 8, pero sabía que quería algo distinto. Desde el primer día el ambiente fue diferente: personas con ganas reales, conversaciones que van más allá del código, retos que te obligan a pensar. Me di cuenta rápido de que aquí no solo se aprende tecnología — se aprende a trabajar, a comunicarse, a crecer con otros. Cada semana descubro algo nuevo sobre lo que soy capaz de hacer. El camino apenas empieza y ya no quiero parar.",
    quote:
      "A veces no se trata de saber exactamente a dónde vas, sino de rodearte de personas y experiencias que te ayuden a descubrirlo.",
    photo: "/img-vallejo.png",
    accent: "#38BDF8",
  },
  {
    id: "andres-jaimes",
    name: "Andrés Camilo Jaimes Luna",
    badge: "Semilla · hoy Junior Developer",
    tenure: "Del call center al código",
    headline: "Renuncié a lo seguro para apostar por lo incierto.",
    body: "Estaba en capacitación para un call center — no por gusto, sino porque necesitaba el dinero. Un amigo lo animó a aplicar al Batch y tomó la decisión más difícil: renunciar y perder el pago de días ya trabajados para apostar por algo incierto. Desde el primer día sintió que era un lugar diferente: rodeado de personas con las mismas ganas de crecer. El reto que más lo marcó fue integrar un chatbot con n8n — herramientas nuevas, sin red, sintiéndose perdido. Pero no se rindió. En Discord siempre había alguien dispuesto a ayudar. Al terminar el Batch le asignaron proyectos que se convirtieron en el puente a su carrera. Hoy es desarrollador junior y toma decisiones pensando en la vida que quiere construir.",
    quote: "El punto Nemo es el lugar más alejado de cualquier costa, pero aprendí que incluso desde ahí se puede llegar. Lo importante es no dejar de avanzar aunque todavía no puedas ver la tierra firme.",
    batch: "batch-7",
    batchExperience: "Renuncié a mi trabajo en un call center para apostar por algo incierto. Me sentí perdido más de una vez — como lanzado al punto más profundo del mar. Pero aquí aprendí que avanzar sin ver la orilla es parte del proceso.",
    batchOnly: true,
    photo: "/img-jaimes.jpeg",
    accent: "#BAE6FD",
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
  title: "¿Tienes un proceso que te está frenando?",
  highlight: "frenando",
  subtitle:
    "CooWeb diagnostica y resuelve los cuellos de botella de tus procesos y operaciones digitales con una célula de desarrollo acompañada por talento Senior.",
  ctaPrimary: "Solicitar diagnóstico gratuito",
  ctaSecondary: "Ver cómo funciona",
};

export const empresaProblema = {
  title: "Esa tarea que llevas meses posponiendo.",
  body: "Falta de manos o presupuesto no debería frenar tu crecimiento. Nuestro equipo resuelve tu reto técnico mientras forma al próximo talento digital.",
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
