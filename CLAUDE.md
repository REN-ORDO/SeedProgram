# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

## Commands

```bash
npm run dev       # Dev server at localhost:3000 (Next.js Turbopack)
npm run build     # Production build
npm run lint      # ESLint check
npm run start     # Serve production build
```

No test suite exists yet.

---

## Architecture

**Stack:** Next.js 15 App Router · React 19 · Tailwind CSS v4 · Framer Motion · TypeScript

**Routes:**
- `/` — single-page landing, all sections rendered in `app/page.tsx`
- `/fuentes` — internal typography test page, not part of the product

**Data flow:** All content lives in `lib/data.ts` as typed arrays (`pilares`, `niveles`, `batches`, `testimonios`, `metrics`, etc.). Section components import directly from there — no API calls, no CMS. To change copy, update `lib/data.ts`.

**Component pattern:** Each landing section is a standalone file in `components/` (e.g. `hero.tsx`, `pilares.tsx`). Scroll reveal animations use the shared `components/reveal.tsx` wrapper (Framer Motion). The `components/magnetic.tsx` and `components/cursor-spotlight.tsx` are interaction enhancements, not content.

**Styling:** Tailwind v4 with custom theme tokens defined in `app/globals.css` via `@theme`. Two named themes: `theme-toon` (neobrutalism with hand-drawn shadows, currently active) and `theme-dark`. All color usage must stay within the documented palette families — see §4 below. Use `cn()` from `lib/utils.ts` for conditional classnames.

**Fonts:** Loaded in `app/layout.tsx` via `next/font/google`. CSS variables: `--font-sans` (Inter), `--font-display` (Space Grotesk), `--font-mono` (JetBrains Mono), `--font-handwritten` (Caveat).

---

## 1. Proyecto (contexto)

**Nombre:** SeedProgram — Web Informativa Programa Semilla CooWeb
**Tipo:** Sitio web informativo (landing/multipage)
**Objetivo:** Comunicar qué es el Programa Semilla, atraer postulantes, mostrar metodología, batches abiertos, testimonios y CTA hacia formulario de aplicación.

**Fuente canónica de contenido:** `programa-semilla-cooweb.md` (extraído de https://www.cooweb.co/programas/semilla)
**Activo previo:** `Presentación Programa Semilla CooWeb con IA.html` (deck stack Tailwind dark) — usar como referencia narrativa, no como base de código.

---

## 2. Equipo

- **Líder:** Sebastián (REN-ORDO) — dirige decisiones, prioridades, revisión final.
- **Devs:** 3 colaboradores adicionales (roles por definir).
- **Flujo:** Líder aprueba diseño antes de implementar. PRs revisados por líder.

---

## 3. Conceptualización Programa Semilla

### Tesis
"Encontramos talento donde otros no miran." Cantera de jóvenes con motivación + mentoría senior → desarrolladores productivos con impacto social.

### Pilares
1. **Talento no convencional** — selección por motivación, no por credenciales.
2. **Mentoría senior 1:1** — code review, pair programming, career coaching.
3. **Liderazgo situacional Hersey-Blanchard** — niveles E1 (Directivo) → E2 (Persuasivo) → E3 (Participativo) → E4 (Delegativo).
4. **Ciclos cortos medibles** — programa base 4 semanas, ciclo evaluación 3 meses.
5. **Compensación desde día 1** — sin costo inscripción, auxilio económico ($) base presemilla.

### Estructura producto

**Escalera completa (9 niveles)** — actualizada Batch 7+ (fuente: deck IA v2):

| Nivel | Rol | Liderazgo | Comportamiento clave |
|---|---|---|---|
| Pre-Semilla | Explorador/a | E1 Directivo | Aprende con guía, pregunta, participa |
| Semilla | En formación | E2 Persuasivo | Comprende el "por qué", busca mejorar |
| Junior 1 | Ejecutor guiado | E2 Persuasivo | Ejecuta tareas simples, asimila estándares de código |
| Junior 2 | Ejecuta con apoyo | E2–E3 | Resuelve con autonomía, propone |
| Middle 1 | Colaborador activo | E3 Participativo | Ayuda, documenta, comparte |
| Middle 2 | Líder de módulo | E3–E4 | Coordina, decide, forma a otros |
| Senior 1 | Mentor Técnico | E4 Delegativo | Lidera integraciones, guía niveles bajos, optimiza procesos |
| Senior 2 | Arquitecto Estratégico | E4 Delegativo | Visión técnica global, diseño de sistemas complejos |
| Director | Líder Estratégico / Socio | E4 Directivo/Delegativo | Define visión tecnológica, alinea negocio, guía propósito |

**Compensación Presemilla:** auxilio económico mensual ($) + bonos trimestrales por desempeño + mentorías + entrenamiento habilidades blandas + formación emocional + posibilidad ascenso interno. **NUNCA publicar montos ni porcentajes en la web** — solo símbolo `$` si se menciona dinero.

**Ejes evaluación duales** (ambos determinan compensación y nuevas responsabilidades):
- **Técnico:** calidad de código, entregas a tiempo, documentación, mejora continua.
- **Liderazgo situacional:** autonomía, comunicación, capacidad de guiar (E1→E4).

**Ciclo evaluación trimestral (3 meses) → 3 outcomes:**
- **Ascenso:** cumple criterios → siguiente nivel + nuevos beneficios.
- **Refuerzo:** ciclo extra para fortalecer áreas detectadas.
- **Salida:** no hay alineación con objetivos o cultura.

**Postulación interna a vacantes:** revisar requisitos de la vacante → validar nivel actual con mentor → enviar postulación vía plataforma interna.

### Batches
- **Batch 7** — Enero 2026, cerrado, en formación activa.
- **Batch 8** — Nivel Pro con Claude Code, cerrado, certificación + proyecto en curso.
- **Batch 9** — Próximamente. Próxima convocatoria general.

### Cultura CooWeb (ADN, 5 valores)
1. **Respeto ante todo** — ideas se discuten, personas se cuidan.
2. **Curiosidad constante** — preguntar es la clave para crecer.
3. **Compartir conocimiento** — enseñar es aprender dos veces.
4. **Aprender del error** — valoramos reflexión, no penalizamos fallar.
5. **Transparencia** — tu voz importa en cada paso.

**Ritual cultural obligatorio:** *CooWeb Talks* — ≥1 charla interna por ciclo de 3 meses.

### Taglines disponibles
- "Encontramos talento donde otros no miran." (web)
- "Tecnología, Liderazgo y Propósito Social." (deck)
- "Apoyamos a jóvenes que construyen el futuro con propósito y tecnología." (deck)
- "Aquí no solo creces profesionalmente, creces como persona." (deck cierre)

### Métricas vivas
54+ jóvenes transformados · 90% permanencia · 100% mentoría senior · 4 semanas programa base.

### Tono comunicacional
- Cercano, empático, ambicioso.
- Evitar paternalismo. Joven que crece, no joven que rescatamos.
- Bilingüe friendly (términos técnicos en inglés OK: pair programming, code review).
- Voz: "tú", no "usted".

### Audiencia
- **Primaria:** jóvenes 17-25, Barranquilla/Colombia, interés en tech sin formación formal.
- **Secundaria:** padres/tutores (legitimidad, compensación, seguridad).
- **Terciaria:** mentores potenciales, aliados, empresas que contraten egresados.

---

## 4. Identidad Visual

### Marca base
CooWeb · AI-First Ecosystem · Barranquilla, Colombia.

### Paleta — direccionada por líder
**Familia 1: Verdes aguamarina** (acento principal, vida/crecimiento, "semilla")
- `#2DD4BF` aquamarine vivo (Tailwind teal-400)
- `#14B8A6` aquamarine medio (teal-500)
- `#0D9488` aquamarine profundo (teal-600)
- `#5EEAD4` aquamarine claro (teal-300)

**Familia 2: Azules** (estructura, confianza, tech)
- **Claros:** `#BAE6FD` (sky-200), `#7DD3FC` (sky-300), `#38BDF8` (sky-400)
- **Oscuros:** `#0369A1` (sky-700), `#0C4A6E` (sky-900), `#0F172A` (slate-900 fondo profundo)

**Neutros:**
- `#F8FAFC` blanco hueso (slate-50)
- `#E2E8F0` gris claro (slate-200)
- `#1E293B` slate-800 (cards dark mode)

### Tipografía propuesta
- **Display:** Inter / Manrope / Space Grotesk (decidir en propuesta).
- **Body:** Inter / IBM Plex Sans.
- **Code/mono (testimonios técnicos, badges):** JetBrains Mono.

---

## 5. Propuestas de Diseño

Tres propuestas para escoger. Cada una mantiene paleta aquamarine + azules pero varía estilo, layout y energía.

### Propuesta A — "Brote Digital" (Tech-Orgánico)

**Concepto:** Mezcla orgánica (semilla, raíces, ramas) + grid tech. Verdes aguamarina dominan, azules de soporte estructural.

- **Fondo:** claro `#F8FAFC` con secciones alternas slate-50 / slate-800.
- **Acento:** teal-400/500 en CTAs, links, badges.
- **Azul:** sky-700 para títulos hero, sky-300 para fondos de cards informativos.
- **Estilo visual:** ilustraciones SVG líneas finas tipo botánico, gradientes suaves teal→sky.
- **Tipografía:** Manrope display + Inter body.
- **Animación:** scroll reveal suave, partículas tipo "semillas flotando" en hero.
- **Layout:** hero asimétrico, secciones en bento grid, timeline serpentina para plan 4 semanas.
- **Vibe:** humano, esperanzador, premium.
- **Inspiración:** Linear.app + Stripe + Webflow templates ecológicos.

### Propuesta B — "Terminal Verde" (Dev-First Brutalist Soft)

**Concepto:** Estética desarrollador. Fondo oscuro `#0F172A`, neón aquamarine, monospace destacado. Apunta directo al perfil técnico.

- **Fondo:** dark slate-900 default, sin light mode en MVP.
- **Acento principal:** teal-300/400 glow.
- **Azul:** sky-400 para estados hover/focus, sky-900 para gradientes profundos.
- **Estilo visual:** bordes 1px teal con glow sutil, badges tipo `[E2 → E3]`, snippets de código en cards.
- **Tipografía:** Space Grotesk display + JetBrains Mono para datos clave/cifras + Inter body.
- **Animación:** typing effect en hero, cursor blink, micro-interacciones tipo terminal.
- **Layout:** sidebar fija tipo IDE, secciones como "archivos abiertos", roadmap como árbol git.
- **Vibe:** hacker, exclusivo, "esto es serio".
- **Inspiración:** vercel.com, raycast.com, supabase.com.

### Propuesta C — "Aula Abierta" (Editorial Cálido)

**Concepto:** Editorial educativo. Más texto, más historia, fotos reales (cuando existan) de mentores y semillas. Azul claro domina, aquamarine de acento.

- **Fondo:** blanco `#F8FAFC` + bloques sky-200 muy lavados.
- **Acento:** sky-700 para títulos, teal-500 solo para CTAs y números destacados.
- **Estilo visual:** tipografía grande, mucho whitespace, dividers con texturas suaves, fotografía editorial b/n con tinte sky.
- **Tipografía:** Fraunces o Tiempos para display (serif) + Inter body — contraste editorial.
- **Animación:** mínima, scroll suave, fade de imágenes.
- **Layout:** columnas tipo revista, citas grandes en bloques, testimonios como entrevistas largas.
- **Vibe:** legitimidad, calidez, padres/aliados-friendly.
- **Inspiración:** medium.com premium, nytimes.com, on-deck.com.

---

## 6. Criterios de Decisión (líder elige)

Comparar propuestas contra:
1. **Audiencia primaria** — ¿conecta con joven 17-25?
2. **Audiencia secundaria** — ¿legitima ante padres?
3. **Diferenciación** — ¿se ve distinto al resto de bootcamps?
4. **Esfuerzo de implementación** — ¿realista para 3 devs?
5. **Escalabilidad** — ¿soporta crecer a multipage (silabus, batch 8, aplicar)?

---

## 7. Stack

- **Framework:** Next.js 15 App Router — SEO, multipage, Vercel deploy.
- **Estilo:** Tailwind CSS v4 + tokens en `app/globals.css`.
- **Animaciones:** Framer Motion (scroll reveal, magnetic, loading screen).
- **Iconos:** lucide-react.
- **Deploy:** Vercel.
- **Forms:** server action → destino por definir (email/Sheet/Notion).

---

## 7b. Feature opcional — Asistente IA embebido

El deck original integra Gemini para 4 usos. Idea reutilizable como feature diferenciador en la web:

- **Visión de carrera personalizada** — usuario indica pasión (IA, frontend, ciberseguridad…) → IA describe evolución Presemilla→Senior.
- **Sugerir tema para CooWeb Talk** — 3 ideas (técnica, crecimiento personal, impacto social).
- **Simulador de entrevista** — preguntas tipo + consejos para postular a vacante interna.
- **Coach de cultura** — explica los 5 valores aplicados a situaciones reales.

Si se implementa: usar API propia (no exponer key cliente), considerar Claude/Anthropic vía AI SDK Vercel.

---

## 8. Estado Actual

- ✅ Contenido extraído (`programa-semilla-cooweb.md`)
- ✅ Conceptualización + paleta (este archivo)
- ✅ Stack configurado (Next.js + Tailwind v4)
- ✅ Landing v1 implementada — tema `theme-toon` activo (neobrutalism)
- ⏳ Formulario de postulación (server action → destino por definir)
- ⏳ Páginas internas (silabus detallado, batch individual)

---

## 9. Convenciones para Claude

- Idioma: respuestas en español, código en inglés.
- Antes de implementar UI nueva, confirmar con líder la propuesta elegida.
- Mantener consistencia con paleta documentada — no introducir colores fuera de Familia 1/2/Neutros sin aprobación.
- Contenido siempre vs `programa-semilla-cooweb.md` como fuente de verdad. Si la web fuente cambia, re-extraer.
