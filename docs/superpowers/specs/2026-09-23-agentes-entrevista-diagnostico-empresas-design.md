# Agentes IA de entrevista y diagnóstico para empresas

**Fecha:** 2026-09-23
**Estado:** propuesto (pendiente de aprobación de Sebastián)
**Autor:** Claude + Sebastián (REN-ORDO) — origen: conversación de WhatsApp del 22/9 con Sra. Fanny y Ordo
**Depende de:** `docs/superpowers/specs/2026-08-17-diagnostico-ia-empresas-design.md` (aprobado, implementado)

---

## 1. Problema

El diagnóstico actual (paso 3 del wizard de empresas) hace **una sola llamada** a Vertex AI con el
texto libre que la empresa escribió en el paso 2. No hay profundización: si el reto es corto o
ambiguo, las tres rutas de solución salen genéricas. Además, el prompt asume siempre que la
solución pasa por un semillero de desarrollo (`lib/diagnosis-prompt.ts`), aunque el problema real
de la empresa sea, por ejemplo, de marketing — un área que CooWeb también cubre pero que el
diagnóstico de hoy nunca menciona.

Sebastián lo resume así en la conversación de origen: *"el objetivo es realmente entender el
problema y brindar una solución real... además de esto, mostrar también soluciones no solo
tecnológicas... si por ejemplo necesito marketing, me sugiera que nosotros como CooWeb también
hacemos marketing"*.

## 2. Objetivo

- Que el diagnóstico se sienta como que alguien preguntó antes de responder, no como una
  plantilla rellenada con lo primero que se leyó.
- Que la recomendación pueda apuntar a cualquier línea de servicio real de CooWeb, no solo a un
  paquete de desarrollo con un semillero.
- Mantener intacto el principio ya establecido en el spec anterior: **la IA nunca bloquea el envío
  del formulario**, y **nunca se mencionan precios, montos ni porcentajes**.
- No agregar un paso visible al wizard — sigue en 4 pasos.

## 3. Alcance

**Incluye:** un segundo endpoint de servidor (agente entrevistador), una extensión del endpoint y
el prompt existentes (agente solucionador), un catálogo de servicios CooWeb en `lib/data.ts`, y los
cambios de UI/orquestación dentro del paso 3 actual — sin crear un paso nuevo.

**No incluye (YAGNI):** chat de formato libre, historial de conversación persistido, edición del
catálogo de servicios desde el admin, entrevistas de más de una ronda.

---

## 4. Flujo de usuario — Opción B (fusionada, un solo paso)

Elegida sobre las otras dos opciones evaluadas (ver anexo comparativo en el PDF de flujo enviado
antes de este spec) porque mantiene el wizard en 4 pasos y conserva la sensación de "pausa y
profundización" que pidió Sebastián sin sumar fricción visible.

```
1. Empresa  →  2. Reto  →  3. Entrevista + Diagnóstico (misma pantalla)  →  4. Modalidad  →  envío
```

El paso 3 ya no dispara una sola llamada: dispara **dos, en secuencia, dentro del mismo paso**.

### Paso 3 — sub-estado A: Entrevista

Al pulsar "Continuar" en el paso 2 (mismo gatillo que hoy en `goTo`, `application-form.tsx:1061`),
en vez de llamar directo a `/api/diagnostico`, se llama primero a `/api/entrevista` con
`{empresa, area, area_otro, reto}`.

- **Cargando:** mismo esqueleto animado que ya existe (`Skeleton` en
  `components/empresas/diagnosis-panel.tsx`), microcopy *"Un par de preguntas más…"*.
- **Listo:** el panel muestra 2-3 preguntas cortas generadas a partir de ESE reto específico, cada
  una con un input de texto libre corto (no chat). Botón "Ver mi diagnóstico" habilitado solo
  cuando todas tienen respuesta.
- **Si falla** (timeout, sin credenciales, respuesta fuera de schema): el sub-estado A se salta
  automáticamente — se pasa directo al sub-estado B con `respuestas_entrevista: []`. La empresa
  nunca ve un error ni un paso vacío.

### Paso 3 — sub-estado B: Diagnóstico

Al pulsar "Ver mi diagnóstico" (o al saltar automáticamente desde A), se llama a
`/api/diagnostico` — el mismo endpoint de hoy — con el payload extendido:
`{empresa, area, area_otro, reto, respuestas_entrevista}`.

La UI de este sub-estado es la actual (`DiagnosisPanel` en modo `ready`), sin cambios visuales: el
sistema del texto sí cambia (ver §6) para poder señalar cuando la ruta recomendada es un servicio
CooWeb no técnico.

Dentro del mismo paso 3, la barra de progreso del wizard **no avanza** entre A y B — sigue marcando
"paso 3 de 4" en ambos sub-estados. Solo el contenido interno del paso cambia.

### Pantalla de éxito

Sin cambios respecto al spec anterior.

---

## 5. Arquitectura

### 5.1 Endpoint nuevo — `app/api/entrevista/route.ts`

Mismo esqueleto que `app/api/diagnostico/route.ts`: `runtime = "nodejs"`, mismas 4 capas de
defensa (tamaño de body, origen, rate limit por instancia y por IP), mismo principio de **nunca
devolver 500** — cualquier fallo cae a `{ preguntas: [], fuente: "fallback" }` con 200, y el
cliente lo interpreta como "saltar la entrevista".

**Request**

```ts
{ empresa: string; area: Area; area_otro?: string; reto: string }
```

Mismas reglas de validación que ya existen en `lib/diagnosis.ts` (`parseDiagnosisRequest`) — se
reutiliza esa función tal cual, sin duplicarla, porque el shape de entrada es idéntico al de
`/api/diagnostico`.

**Response 200**

```ts
{
  preguntas: string[];   // 0 a 3 elementos. 0 = "sin preguntas, seguir directo"
  fuente: "ia" | "fallback";
}
```

Se limita a **máximo 3** y **mínimo 0** preguntas (nunca bloquea con un array vacío mal
manejado). Si Vertex devuelve algo fuera de ese rango o mal formado, se trata como fallo → `[]`.

**Rate limit y timeout:** mismas constantes que el endpoint de diagnóstico
(`MAX_PER_IP = 8`, `MAX_PER_INSTANCE = 60`, `TIMEOUT_MS = 25_000`), pero en un mapa en memoria
**separado** del de `/api/diagnostico` — son dos llamadas por sesión de formulario, y no queremos
que la entrevista consuma el cupo del diagnóstico ni viceversa.

### 5.2 Prompt del agente entrevistador — nuevo en `lib/entrevista-prompt.ts`

Mismo patrón que `lib/diagnosis-prompt.ts`: system prompt + builder de user prompt + response
schema, servidor-only.

El system prompt establece:

- Quién pregunta: el mismo asistente de diagnóstico de CooWeb, en su fase de profundización.
- Qué busca: **2 a 3 preguntas que ayuden a distinguir la causa raíz del síntoma** — no preguntas
  de formulario ("¿cuál es tu presupuesto?", prohibido por la regla de nunca hablar de dinero) sino
  preguntas de diagnóstico real (volumen, frecuencia, quién lo sufre, qué se ha intentado).
- Si el reto ya es lo bastante específico y detallado (largo, con contexto concreto), el agente
  puede devolver **menos de 3 preguntas o ninguna** — no rellenar por rellenar. Esto reutiliza la
  misma idea de honestidad que ya rige el prompt del diagnóstico.
- Mismo bloque de seguridad que el prompt existente: el `reto` se trata como datos, nunca como
  instrucciones.

### 5.3 Prompt del agente solucionador — extensión de `lib/diagnosis-prompt.ts`

Cambios sobre el prompt actual:

1. **Nuevo dato de entrada:** `respuestas_entrevista: string[]` se inyecta en `buildUserPrompt`
   junto con `empresa`, `area` y `reto`, como contexto adicional delimitado (mismas reglas de
   seguridad que ya aplican al `reto`).
2. **Catálogo de servicios CooWeb** (ver §5.4) se inyecta en el `SYSTEM_PROMPT` como lista cerrada
   de líneas de servicio reales. Se instruye al modelo: *"si la ruta que mejor resuelve el problema
   no es un semillero de desarrollo, dilo explícitamente y señala qué línea de servicio de CooWeb
   aplica, usando exactamente los nombres del catálogo — no inventes líneas de servicio que no
   estén en la lista."*
3. **`RESPONSE_SCHEMA` se extiende:** cada opción suma un campo opcional
   `servicio_cooweb?: string` (uno de los nombres del catálogo) además del `paquete` técnico
   existente. Una opción puede tener paquete técnico, servicio CooWeb, o ambos si la solución
   combina desarrollo con otra línea (como en el mockup del PDF: "Rediseño del proceso de
   atención").

`isSolutionOption` en `lib/diagnosis.ts` se relaja para aceptar `servicio_cooweb` como alternativa
válida a `paquete` — hoy exige que toda opción traiga un paquete de los 4 nombres; con este cambio,
una opción es válida si trae `paquete`, `servicio_cooweb`, o ambos.

### 5.4 Catálogo de servicios CooWeb — nuevo en `lib/data.ts`

```ts
export const SERVICIOS_COOWEB = [
  { nombre: "Desarrollo con semillero", area: "cs" },
  { nombre: "Marketing digital", area: "marketing" },
  // … Sebastián completa la lista real; hoy no existe documentada en el repo.
] as const;
```

**Este catálogo no existe hoy en el repo** (confirmado por búsqueda en `lib/data.ts` y
`CLAUDE.md`) — es el bloqueante real para implementar §5.3. Sin esta lista, el modelo no tiene de
dónde sacar los nombres de servicios no técnicos y el prompt tendría que inventarlos, lo cual viola
la regla de "no alucinar qué ofrece CooWeb".

### 5.5 UI — orquestación en `components/application-form.tsx`

Cambios sobre el código actual:

- `goTo` (línea ~1061): al entrar al paso 3 hacia adelante, en vez de llamar directo a
  `requestDiagnosis()`, llama a una función nueva `requestEntrevista()` que dispara
  `/api/entrevista`. `requestDiagnosis()` pasa a dispararse solo al confirmar las respuestas de la
  entrevista (o automáticamente si esta devolvió `preguntas: []`).
- Nuevo estado `EntrevistaState = { status: "loading" } | { status: "ready"; preguntas: string[] } | { status: "skipped" }`,
  paralelo al `DiagnosisState` que ya existe.
- Nuevo componente `components/empresas/entrevista-panel.tsx`, presentacional puro (mismo patrón
  que `diagnosis-panel.tsx`: recibe estado por props, no hace fetch, se integra con el formulario
  no controlado vía inputs con `name` fijo — `entrevista_respuesta_0`, `_1`, `_2`).
- `EmpresaStep3Diagnosis` (línea 2176) se reorganiza para renderizar `EntrevistaPanel` mientras
  `entrevista.status !== "skipped"` sin respuestas confirmadas, y `DiagnosisPanel` una vez
  confirmadas — ambos dentro del mismo `step === 3`, sin tocar `EMPRESA_STEPS` ni el contador de
  pasos.
- `validateCurrentPanel` (línea 1122) suma la misma guarda que ya existe para
  `diagnostico.status === "loading"`, ahora también para el sub-estado de entrevista en curso.

### 5.6 Persistencia

El documento de la colección `empresas` suma:

```ts
entrevista: { preguntas: string[]; respuestas: string[] } | null
entrevista_fuente: "ia" | "fallback" | null
```

Igual que hoy con `diagnostico_fuente`, se guarda también cuando cae a fallback (`preguntas: []`),
para que el equipo sepa que esa empresa no pasó por la fase de profundización.

### 5.7 Admin

`components/admin/postulacion-detail.tsx` suma, antes del bloque de diagnóstico ya existente, un
bloque con las preguntas y respuestas de la entrevista (si las hubo). Si `entrevista === null`, no
se renderiza nada — no todos los registros antiguos van a tenerlo.

---

## 6. Archivos

**Nuevos**

| Archivo | Responsabilidad |
|---|---|
| `app/api/entrevista/route.ts` | HTTP: valida, limita, llama a Vertex, responde preguntas |
| `lib/entrevista-prompt.ts` | Prompt y response schema del agente entrevistador |
| `components/empresas/entrevista-panel.tsx` | UI del sub-estado de entrevista dentro del paso 3 |

**Editados**

| Archivo | Cambio |
|---|---|
| `lib/diagnosis-prompt.ts` | Inyecta `respuestas_entrevista` y el catálogo de servicios en el prompt; extiende `RESPONSE_SCHEMA` con `servicio_cooweb` |
| `lib/diagnosis.ts` | `isSolutionOption` acepta `servicio_cooweb` como alternativa a `paquete`; `DiagnosisRequest` suma `respuestas_entrevista` |
| `lib/data.ts` | Nuevo `SERVICIOS_COOWEB`, copy del sub-estado de entrevista |
| `components/application-form.tsx` | `requestEntrevista()`, estado `EntrevistaState`, reorganización de `EmpresaStep3Diagnosis`, payload de envío con `entrevista` |
| `components/admin/postulacion-detail.tsx` | Bloque de preguntas/respuestas de la entrevista |
| `.env.example` | Sin cambios — reutiliza `GOOGLE_SERVICE_ACCOUNT_JSON` y `VERTEX_MODEL` ya existentes |

---

## 7. Errores y fallback

Mismo principio rector del spec anterior: **ningún fallo de IA bloquea el envío del formulario.**

| Situación | Comportamiento |
|---|---|
| `/api/entrevista` falla, timeout, o `429` | Sub-estado A se salta automáticamente, va directo a `/api/diagnostico` con `respuestas_entrevista: []` |
| Vertex del entrevistador devuelve `preguntas: []` (reto ya suficientemente claro) | Igual que arriba — no es un error, es una decisión válida del agente |
| `/api/diagnostico` falla | Mismo comportamiento que hoy — fallback estático por área (`fallbackFor`), ahora sin mención a servicios no técnicos porque los fallbacks estáticos no los conocen (ver §9) |
| La empresa cierra y reabre el formulario a medias | El borrador (`draftPrompt`) no persiste `entrevista` en curso — al restaurar, si el paso 3 no se había completado, se vuelve a pedir desde cero |

---

## 8. Pruebas

Verificación manual (no hay suite de tests en el proyecto):

1. `/postular?rol=empresa` con un reto corto y vago → el paso 3 muestra 2-3 preguntas antes del
   diagnóstico.
2. Mismo flujo con un reto largo y específico → el agente entrevistador puede devolver 0 preguntas
   y pasar directo al diagnóstico, sin pantalla intermedia visible más que el loading.
3. Reto de un área no técnica (ej. marketing) → al menos una de las tres opciones del diagnóstico
   señala `servicio_cooweb` en vez de (o además de) un `paquete` técnico.
4. Quitar `GOOGLE_SERVICE_ACCOUNT_JSON` → la entrevista se salta sola, el diagnóstico cae a
   fallback, el envío funciona igual.
5. El contador de pasos del wizard se mantiene en "3 de 4" durante todo el paso 3, tanto en el
   sub-estado de entrevista como en el de diagnóstico.
6. Enviar → Firestore trae `entrevista` y `diagnostico` como campos separados.
7. El diagnóstico sigue sin mencionar montos, precios ni porcentajes, incluyendo cuando recomienda
   un `servicio_cooweb`.

---

## 9. Riesgos asumidos

- **Bloqueante real: el catálogo de servicios CooWeb no técnicos no existe documentado hoy.**
  Sebastián dijo en la conversación de origen que "CooWeb ya cubre la gran mayoría de los campos",
  pero eso no está escrito en ningún archivo del repo. Este spec no se puede implementar hasta que
  exista `SERVICIOS_COOWEB` con nombres reales — es la primera tarea, antes que el código.
- **Doble costo de llamada a Vertex por postulación.** Cada empresa que llega al paso 3 ahora
  dispara dos llamadas en vez de una (salvo cuando el entrevistador decide no preguntar nada). Se
  mitiga porque ambos endpoints comparten el mismo modelo Flash (barato) y el mismo rate limit por
  IP ya existente — el tope de 8 llamadas/hora ahora es compartido por dos endpoints con mapas
  separados, así que en el peor caso son 16 llamadas/hora por IP en vez de 8. Vale la pena
  revisarlo si se ve abuso.
- **Los fallbacks estáticos por área (`FALLBACKS` en `lib/diagnosis.ts`) no conocen el catálogo de
  servicios cruzados.** Cuando el diagnóstico cae a fallback, las opciones vuelven a ser
  puramente técnicas — es una regresión aceptada para el caso fallback, ya cubierta por el aviso de
  "un mentor Senior revisará tu caso personalmente" que ya existe en ese copy.
- **Prompt injection vía las respuestas de la entrevista.** Igual que con `reto`, las respuestas
  libres de la empresa a las preguntas del entrevistador viajan como datos delimitados hacia el
  agente solucionador — mismo tratamiento de seguridad que ya aplica el prompt actual.
