# Review · PR #25 — Sección de batches interactiva + Voces del Semillero

| | |
|---|---|
| **PR** | [#25](https://github.com/REN-ORDO/SeedProgram/pull/25) — `feat(batches): sección de batches interactiva + Voces del Semillero + testimonios por batch` |
| **Rama** | `feat/batches-update` → `main` |
| **Autor** | Maileth Vallejo (`maivp22`) |
| **Fecha review** | 2026-06-03 |
| **Tamaño** | 10 archivos · +451 / −147 |
| **Stack** | Next.js 16 (App Router) · React 19 · Tailwind v4 · Framer Motion · TS |

## Veredicto

🟠 **Aprobar con cambios.** El PR funciona (build y TypeScript pasan, lint limpio en los archivos tocados) y la feature está bien armada. Hay **2 hallazgos medios** (modal sin scroll-lock / `z-index` por debajo del Nav, y FAQ desincronizada con la renumeración de batches) que conviene resolver antes de mergear. El resto son nits y sugerencias.

## Resumen ejecutivo

- Renumera los batches: el antiguo "Nivel Pro · Claude Code" pasa de Batch 8 → **Batch 9**, se inserta un nuevo **Batch 8 "Project Manager AI"**, y "Próximamente" pasa de 9 → **Batch 10**. Actualiza todas las referencias de UI (hero, CTA, OG image).
- Convierte las tarjetas de batch en un **acordeón** (una abierta a la vez) con grid de 4 columnas y banner "Próximamente" rediseñado.
- Agrega una sección nueva **"Voces del Semillero"** (`batch-testimonios.tsx`) con tabs por batch, grid de tarjetas y modal de detalle, conectada al acordeón de batches vía un `CustomEvent` (`filter-testimonios`).
- Suma el testimonio de **Andrés Camilo Jaimes Luna** (`batchOnly: true`, solo visible en la sección nueva) y reescribe en primera persona los textos de Sebastián, Sharikg, Manuela y Maileth.
- **Verificaciones automáticas:** `npm run build` ✅ (compila, TS OK, 16 páginas estáticas) · `npm run lint` ✅ en los archivos del PR (los 6 errores de lint del repo son preexistentes en `plant-cursor.tsx`/`seed-cursor.tsx`).

## Tabla de hallazgos

| Sev | Ubicación | Dimensión | Descripción |
|---|---|---|---|
| 🟠 | `components/batch-testimonios.tsx:182-243` | A11y / UX | Modal sin scroll-lock, sin `role="dialog"`/`aria-modal`, y con `z-50` queda al mismo nivel o por debajo del Nav (`z-50`/`z-[60]`). |
| 🟠 | `components/faq.tsx:64` | Correctness / Contenido | La FAQ atribuye la certificación al "Batch 8", pero tras la renumeración ese batch es ahora "Project Manager AI". La certificación corresponde al Batch 9. |
| 🟡 | `programa-semilla-cooweb.md` | Docs | Fuente canónica de contenido quedó desincronizada: sigue diciendo "Batch 8 — Nivel Pro con Claude Code" y "Batch 9 — Próximamente". |
| 🟡 | `components/batch-testimonios.tsx:136,215` | Performance | `<Image fill>` sin prop `sizes` → Next sirve la imagen a ~100vw aunque se renderice a 56/80px. |
| 🟡 | `components/batch-testimonios.tsx:159,212` (modal) | Estilo | Comillas literales `"..."` en JSX en vez de las entidades `&ldquo;`/`&rdquo;` que usa el resto del repo (`testimonio.tsx`). |
| 🟡 | `components/batch-testimonios.tsx` + `testimonio.tsx` | UX / Contenido | Sebastián, Sharikg, Manuela y Maileth aparecen dos veces en la landing (carrusel "Historias" + "Voces del Semillero"), con `quote` repetido. Decisión de producto a confirmar. |
| 🟡 | `components/batch-testimonios.tsx:147` | Robustez | `t.badge.split("·").slice(-1)[0].trim()` para derivar el "nivel" es frágil; depende del formato exacto del badge. |
| 💡 | `components/batches.tsx:93` · `batch-testimonios.tsx:11` | Performance | `.some()`/`.filter()` sobre `testimonios` recalculado en cada render (impacto despreciable hoy, ~10 items). |
| 💡 | Proyecto | Tests | No hay tests (consistente con el repo); al menos la lógica `batchOnly`/filtrado por batch sería testeable. |
| ✅ | `components/testimonio.tsx:10` | Correctness | Filtro `batchOnly` bien resuelto: Andrés sale del carrusel y solo aparece en la sección nueva. |
| ✅ | `lib/data.ts:243-246` | Contenido | Se quitó el bullet "Compensación desde día 1 ($)" — alineado con la regla de no exponer montos; el símbolo `$` ya no se arrastra. |

---

## Detalle por hallazgo

### 🟠 1 · Modal de testimonio: scroll-lock, semántica ARIA y `z-index`
**`components/batch-testimonios.tsx:182-243`**

El modal nuevo no sigue el patrón de modal ya establecido en el repo (`components/niveles-animacion.tsx:28-50`), que sí bloquea el scroll del body, declara `role="dialog"` + `aria-modal="true"` y usa `z-[120]` para superar al Nav.

Tres problemas concretos:
1. **Scroll del fondo no bloqueado:** con el modal abierto, el body sigue scrolleable detrás del backdrop.
2. **Sin semántica de diálogo:** falta `role="dialog"`, `aria-modal="true"` y un `aria-label`/`aria-labelledby`. Tampoco hay focus trap ni foco inicial al panel.
3. **`z-index` insuficiente:** backdrop y panel usan `z-50`. El Nav es `fixed … z-50` (`components/nav.tsx:62`) y su menú móvil es `z-[60]` (`nav.tsx:154`). El backdrop no cubre el Nav, y el menú móvil quedaría por encima del modal.

**Por qué importa:** el Nav clickeable sobre el backdrop y el fondo scrolleable rompen la sensación de modal y son inconsistentes con el otro modal del sitio. La falta de ARIA degrada accesibilidad (lectores de pantalla, navegación por teclado).

**Fix sugerido** (replicando el patrón de `niveles-animacion.tsx`):
```tsx
// dentro de BatchTestimonios, reemplazar el useEffect de Escape:
useEffect(() => {
  if (!selected) return;
  const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setSelected(null); };
  window.addEventListener("keydown", onKey);
  const prev = document.body.style.overflow;
  document.body.style.overflow = "hidden";
  return () => {
    window.removeEventListener("keydown", onKey);
    document.body.style.overflow = prev;
  };
}, [selected]);

// backdrop y panel: subir z-index por encima del Nav (z-[60])
className="fixed inset-0 z-[110] bg-black/60 backdrop-blur-sm"   // backdrop
className="... z-[120] ..."                                       // panel
// y en el panel: role="dialog" aria-modal="true" aria-label={selected.name}
```

---

### 🟠 2 · FAQ desincronizada con la renumeración de batches
**`components/faq.tsx:64`**

```
a: "Sí. Al completar cada fase recibes reconocimiento formal de tu nivel.
    El Batch 8 ya integró certificación oficial vinculada a proyectos reales
    del ecosistema CooWeb."
```

Tras este PR, el batch con certificación + proyecto pasó a ser el **Batch 9** (`lib/data.ts:225-235`, "Nivel Pro · Claude Code"). El nuevo **Batch 8** es "Project Manager AI" (`data.ts:212-222`), cuya descripción no menciona certificación. La FAQ ahora afirma algo que ya no corresponde a ese número de batch.

**Por qué importa:** es contenido de cara al usuario (audiencia secundaria = padres, que leen FAQ buscando legitimidad). Una incoherencia entre secciones de la misma página resta credibilidad.

**Fix sugerido:** actualizar a "El Batch 9 ya integró certificación…" (o redactar sin número: "Los batches avanzados ya integran certificación oficial…").

---

### 🟡 3 · Fuente canónica de contenido sin actualizar
**`programa-semilla-cooweb.md`**

CLAUDE.md sí se actualizó con la nueva numeración, pero la fuente de verdad documentada (`programa-semilla-cooweb.md`, §"Batch 8 — Nivel Pro con Claude Code") quedó con la numeración vieja. Por convención del repo (CLAUDE.md §9: "Contenido siempre vs `programa-semilla-cooweb.md` como fuente de verdad"), conviene sincronizarla o anotar que la web es ahora la referencia.

**Fix sugerido:** actualizar las líneas de batches en `programa-semilla-cooweb.md`, o agregar una nota de que la numeración vigente vive en `lib/data.ts`.

---

### 🟡 4 · `<Image fill>` sin `sizes`
**`components/batch-testimonios.tsx:136` y `:215`**

```tsx
<Image src={t.photo} alt={t.name} fill className="object-cover" />
```

Sin `sizes`, Next.js asume `100vw` y puede descargar una variante mucho más grande que los 56px (tarjeta) / 80px (modal) reales. Las fotos de testimonios pesan ~900 KB–1 MB (PNG), así que el desperdicio es real en móvil.

**Fix sugerido:**
```tsx
<Image src={t.photo} alt={t.name} fill sizes="56px" className="object-cover" />  // tarjeta
<Image src={selected.photo} alt={selected.name} fill sizes="80px" className="object-cover" /> // modal
```

---

### 🟡 5 · Comillas literales en JSX
**`components/batch-testimonios.tsx:159` (grid) y `:212` del diff (modal)**

```tsx
"{t.batchExperience ?? t.quote}"
```

Usa comillas dobles ASCII. El resto del repo usa entidades tipográficas (`testimonio.tsx:185`: `&ldquo;{t.quote}&rdquo;`). No rompe el build (la regla `react/no-unescaped-entities` no está disparando), pero es inconsistente y produce comillas rectas en vez de tipográficas.

**Fix sugerido:** `&ldquo;{t.batchExperience ?? t.quote}&rdquo;`.

---

### 🟡 6 · Contenido duplicado entre "Historias" y "Voces del Semillero"
**`components/batch-testimonios.tsx` + `components/testimonio.tsx`**

Los testimonios con `batch` (Sebastián, Sharikg, Manuela, Maileth) se muestran tanto en el carrusel "Historias" como en la nueva sección, y el modal de "Voces del Semillero" repite el mismo `quote`. El usuario ve a las mismas personas dos veces en la página.

**Por qué importa:** puede percibirse como relleno o falta de contenido. No es un bug — es una decisión de producto. **A confirmar con el líder** si la duplicación es intencional (carrusel = vista rápida, sección = profundidad por batch).

---

### 🟡 7 · Derivación frágil del "nivel" desde el badge
**`components/batch-testimonios.tsx:147`** (también preexistente en `testimonio.tsx`)

```tsx
{t.badge.split("·").slice(-1)[0].trim()}
```

Toma el último segmento del badge separado por `·` como "nivel". Funciona con los datos actuales ("Pre-Semilla · Batch 8 · hoy Project Manager" → "hoy Project Manager"), pero se rompe silenciosamente si el formato del badge cambia. Es un patrón ya presente en el repo, así que es deuda heredada, no introducida aquí.

**Fix sugerido (a futuro):** un campo explícito `level` en el tipo `Testimonio` en vez de parsear el badge.

---

## Por dimensión

### 🐛 Correctness / Bugs
- Build y TypeScript pasan limpios. La lógica del acordeón (`openIndex`, toggle, una sola abierta) es correcta. El `CustomEvent` `filter-testimonios` está bien tipado (`CustomEvent<{ batchId: string }>`) y el listener se limpia en el unmount.
- El botón "Ver testimonios" solo se renderiza cuando `hasTesimonios` es true, así que nunca se dispara el evento para un batch sin testimonios → no hay estado inconsistente de tabs. ✅
- `stopPropagation` en el botón interno evita que el click de "Ver testimonios" colapse el acordeón. ✅
- **Único hallazgo de correctness de cara al usuario:** la FAQ (#2). El resto son a11y/UX (#1).
- **A confirmar:** el grid de `RevealStagger` vive dentro de un `motion.div` con `key={activeBatch}` y `AnimatePresence mode="wait"`. Al cambiar de tab se remonta y los `RevealItem` arrancan en `hidden`; dependen de `whileInView` para animar a visible. Si la sección ya está en viewport debería re-disparar correctamente, pero conviene verificarlo manualmente al cambiar de tab estando scrolleado en la sección.

### 🔒 Seguridad
- Sin hallazgos. No hay input de usuario, ni fetch, ni `dangerouslySetInnerHTML`. El `CustomEvent` viaja dentro de la misma página (sin origen externo). Todo el contenido es estático desde `lib/data.ts`.

### ⚡ Performance
- `<Image fill>` sin `sizes` (#4) — el único punto con impacto real, en móvil.
- Recálculos de `.some()`/`.filter()` por render (#8) — despreciable a esta escala.
- Las animaciones de altura (`height: auto`) en el acordeón fuerzan layout, pero es el costo esperado de la feature y está acotado a un elemento a la vez.

### 🧪 Tests
- El repo no tiene suite de tests (consistente con CLAUDE.md). El PR no agrega ninguno. La lógica de filtrado (`batchOnly`, `batch === activeBatch`, `batchesConTestimonios`) es pura y fácilmente testeable si en algún momento se introduce Vitest/Jest. No bloquea.

### 🧹 Estilo / Mantenibilidad
- Código limpio, consistente con los componentes existentes (toon-card, Reveal, paleta). Buen uso de `cn()` y de los tokens de tema.
- La función `ProximamenteBanner` se movió y rediseñó dentro de `batches.tsx` — bien.
- Nits: comillas literales (#5), derivación del nivel por split (#7).
- **Paleta:** los colores introducidos (`#BAE6FD` sky-200, `#5EEAD4`/`#2DD4BF`/`#38BDF8`/`#7DD3FC` teal/sky) están todos dentro de las familias documentadas. ✅ Sin desvíos.

### 📚 Docs / DX
- CLAUDE.md actualizado con la nueva numeración. ✅
- Falta sincronizar `programa-semilla-cooweb.md` (#3) y la FAQ (#2).
- Los nuevos campos del tipo `Testimonio` (`batch`, `batchExperience`, `batchOnly`) están comentados en `lib/data.ts`. ✅
- **Nota de proceso:** el cuerpo del PR incluye `🤖 Generated with Claude Code`, que contradice la convención del repo de no atribuir IA en PRs/commits (ver memoria del proyecto). Conviene quitarlo del PR body.

---

## Checklist de merge

- [ ] **(🟠 #2)** Actualizar `faq.tsx:64`: la certificación ahora es del Batch 9, no del 8.
- [ ] **(🟠 #1)** Modal: agregar scroll-lock + `role="dialog"`/`aria-modal` + subir `z-index` por encima de `z-[60]`.
- [ ] **(🟡 #3)** Sincronizar `programa-semilla-cooweb.md` con la nueva numeración.
- [ ] **(🟡 #4)** Agregar `sizes` a los `<Image fill>` de la sección nueva.
- [ ] **(🟡 #6)** Confirmar con el líder si la duplicación de testimonios entre las dos secciones es intencional.
- [ ] **(nit #5)** Usar entidades tipográficas para las comillas en JSX.
- [ ] Quitar la línea de atribución a IA del cuerpo del PR.
- [ ] Verificación manual: cambiar de tab en "Voces del Semillero" estando scrolleado en la sección (que las tarjetas reaparezcan) y probar el flujo "Ver testimonios" desde el acordeón.

---

_Verificado localmente sobre `feat/batches-update`: `npm run build` ✅, `npm run lint` (archivos del PR) ✅._
