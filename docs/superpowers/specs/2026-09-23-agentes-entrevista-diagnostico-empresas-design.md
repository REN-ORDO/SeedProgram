# Agentes IA de entrevista y diagnóstico para empresas

**Fecha:** 2026-09-23
**Estado:** implementado (pendiente de revisión de Sebastián y de probar con credenciales reales de Vertex)
**Autor:** Claude + Sebastián (REN-ORDO) — origen: conversación de WhatsApp del 22/9 con Sra. Fanny y
Ordo, más la conversación de Ordo con Luis Carlos (CooWeb) el mismo día sobre el alcance real de
los servicios.
**Depende de:** `docs/superpowers/specs/2026-08-17-diagnostico-ia-empresas-design.md` (aprobado, implementado)

---

## 0. Revisión 2 (23/9, tarde) — el reto y la entrevista se fusionan en un chat

Tras implementar la Opción B tal como describen las §4-5.5 originales (entrevista como sub-estado
del paso 3), Sebastián dio feedback directo:

> *"siento que el reto y el entrevistador deberían ser iguales... yo lo visualizo como un chat que
> toma requerimientos de forma inteligente, que en vez de escribir el reto y seguir a un paso 2.5,
> directamente el chat en el mismo paso del reto analice lo que le mencionó la empresa y ahí mismo
> le haga las preguntas. Ojo, tienen que ser preguntas realmente útiles."*

Esto cambia dónde vive la entrevista — **del paso 3 al paso 2** — y cómo se ve: un chat con
burbujas (empresa a la derecha, agente a la izquierda), no el panel de tarjetas Q&A que describían
las §4 y §5.5 originales. El selector de área se mantiene como radio aparte, arriba del chat — no
se conversacionaliza.

**Las §4, 5.1 (UI), 5.5 y 5.7 de más abajo describen la versión ANTERIOR (entrevista como paso 3.A)
y quedan desactualizadas en la parte de UI/orquestación** — se dejan tal cual para no reescribir el
documento entero, pero el flujo real implementado es este:

```
1. Empresa  →  2. Reto + entrevista (chat con burbujas, un solo paso)  →  3. Diagnóstico  →  4. Modalidad  →  envío
```

Paso 2: la empresa elige el área (radio) y escribe el reto en un textarea. Al pulsar "Enviar"
(botón propio del chat, no el "Continuar" del wizard), el reto se convierte en una burbuja propia y
se llama a `/api/entrevista` — sin cambios en el endpoint ni en el contrato §5.1-§5.2 originales,
solo en cuándo y desde dónde se llama. Si hay preguntas, se revelan una por una en burbujas del
agente, cada una con su input de respuesta; al responder la última, el chat queda "hecho" y aparece
un cierre breve ("Perfecto, ya tengo lo que necesito") más un enlace para "Cambiar el reto" que
reinicia la conversación. El botón "Continuar" del wizard (siempre visible, sin texto especial)
queda bloqueado mientras el chat no llegue a ese estado — igual que cualquier otro paso con campos
requeridos sin completar.

Paso 3 vuelve a ser exactamente el diagnóstico de siempre (una sola pantalla, una sola llamada a
`/api/diagnostico`), disparado al entrar al paso — sin sub-estados. Las respuestas de la entrevista
viajan igual que antes (`respuestas_entrevista: string[]` en el body), solo que ahora se recolectan
en el paso 2 en vez del paso 3.

**Archivos que cambian respecto a §6 más abajo:**

| Archivo | Cambio |
|---|---|
| `components/empresas/reto-chat.tsx` (nuevo) | Reemplaza a `components/empresas/entrevista-panel.tsx` (eliminado). Chat con burbujas, máquina de estados `writing → thinking → asking → done`. |
| `components/application-form.tsx` | La orquestación de `/api/entrevista` se mueve del `goTo` (entrada al paso 3) al chat del paso 2 (`handleSendReto`, `handleAnswerPregunta`, `handleEditReto`). `EmpresaStep3Diagnosis` vuelve a ser el único contenido del paso 3, sin `EmpresaStep3Entrevista`. |

Todo lo demás del spec (el prompt del entrevistador, el nuevo eje "dolor operativo" del
solucionador, el catálogo descartado, la persistencia en Firestore, los campos `entrevista`/
`entrevista_fuente`) sigue exactamente igual — este cambio es solo de UI/orquestación, no de los
agentes en sí.

---

## 1. Problema

El diagnóstico actual (paso 3 del wizard de empresas) hace **una sola llamada** a Vertex AI con el
texto libre que la empresa escribió en el paso 2. No hay profundización: si el reto es corto o
ambiguo, las tres rutas de solución salen genéricas. Además, el prompt fuerza siempre la forma de
un paquete de desarrollo con semillero (`lib/diagnosis-prompt.ts`), aunque el problema real de la
empresa no se resuelva mejor así.

Sebastián lo resume así en la conversación de origen: *"el objetivo es realmente entender el
problema y brindar una solución real... además de esto, mostrar también soluciones no solo
tecnológicas... si por ejemplo necesito marketing, me sugiera que nosotros como CooWeb también
hacemos marketing"*.

**Corrección de alcance tras hablar con Luis Carlos (CooWeb):** la hipótesis inicial de este spec
era un catálogo cerrado de líneas de servicio (desarrollo, marketing, etc.). Ordo le preguntó
directamente si los servicios de CooWeb se limitan a eso, y la respuesta fue que no hay una lista
cerrada — el posicionamiento de CooWeb es *"todo lo de IA"*: cualquier tarea operativa dolorosa se
puede resolver aplicando IA, y el pitch comercial (ver hooks por sector que compartió Luis Carlos)
se arma **por el dolor de la empresa, no por una categoría de servicio predefinida**. Esto cambia
el diseño de §5.3/§5.4 más abajo: no hay catálogo que mantener ni que esperar — el agente
solucionador debe razonar en términos de "qué tarea le duele a esta empresa", no de "a cuál de
nuestras N líneas de servicio pertenece este reto".

## 2. Objetivo

- Que el diagnóstico se sienta como que alguien preguntó antes de responder, no como una
  plantilla rellenada con lo primero que se leyó.
- Que la recomendación se ancle al **dolor operativo real** de la empresa (la tarea que más horas
  le roba, el proceso que se cae, lo que nadie quiere hacer a mano) y no se fuerce siempre a la
  forma de un paquete de desarrollo con semillero — sin necesitar un catálogo cerrado de líneas de
  servicio, porque CooWeb no vende por categoría, vende por problema resuelto con IA.
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

**Reemplaza el enfoque de catálogo cerrado** que tenía la primera versión de este spec. Tras
confirmar con Luis Carlos que CooWeb no vende por línea de servicio fija sino por "cualquier dolor
resuelto con IA", el prompt no necesita — ni debe — mapear el reto a una lista predefinida.

Cambios sobre el prompt actual:

1. **Nuevo dato de entrada:** `respuestas_entrevista: string[]` se inyecta en `buildUserPrompt`
   junto con `empresa`, `area` y `reto`, como contexto adicional delimitado (mismas reglas de
   seguridad que ya aplican al `reto`).
2. **El `SYSTEM_PROMPT` cambia de eje:** en vez de "elige un paquete de desarrollo", se instruye
   *"identifica el dolor operativo concreto detrás del reto — la tarea repetitiva, el cuello de
   botella, lo que le roba horas al equipo — y propone cómo resolverlo con IA aplicada. No fuerces
   la solución a la forma de un semillero de desarrollo si el dolor real es de otra naturaleza
   (proceso, datos, atención, ventas, etc.); nómbralo en lenguaje llano, como lo haría un
   consultor que ya resolvió ese mismo dolor en otra empresa del sector."* Esto reutiliza
   directamente el tono de los "hooks por sector" que compartió Luis Carlos (logística, retail,
   salud, inmobiliaria, contable, RRHH…) como referencia de estilo, sin convertirlos en una lista
   cerrada — son ejemplos de tono, no categorías a las que haya que encajar el reto.
3. **`RESPONSE_SCHEMA` cambia:** el campo `paquete` (Chispa/Impulso/Celda/Cantera) se mantiene
   porque sigue orientando la conversación comercial sobre alcance/duración, pero deja de ser lo
   único que describe la opción. Cada opción suma un campo nuevo **obligatorio**
   `dolor_resuelto: string` — una frase corta (máx. ~80 caracteres) que nombra el problema
   operativo puntual que esa ruta ataca, en el lenguaje de los hooks ("dejar de cuadrar rutas a
   mano los lunes", "que ningún lead de WhatsApp se enfríe de noche"). Esto reemplaza al
   `servicio_cooweb` de la versión anterior del spec — no hay que validarlo contra ninguna lista
   cerrada, es texto libre generado por el modelo a partir del reto real.

`isSolutionOption` en `lib/diagnosis.ts` se extiende para exigir `dolor_resuelto` no vacío en toda
opción, además de la validación de `paquete` que ya existe — no se relaja nada, se agrega un campo
requerido más.

### 5.4 Catálogo de servicios CooWeb — descartado

La versión anterior de este spec proponía un `SERVICIOS_COOWEB` cerrado en `lib/data.ts` y lo
marcaba como bloqueante pendiente de que Sebastián lo completara. Ya no aplica: Luis Carlos
confirmó que no existe tal lista porque el modelo de negocio de CooWeb es resolver el dolor que
traiga la empresa, no venderle desde un catálogo de categorías. **Esto elimina el bloqueante** que
tenía la versión anterior — la implementación puede arrancar sin esperar ninguna lista externa.

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

`app/admin/empresas/[id]/page.tsx` (la configuración de secciones que consume el `PostulacionDetail`
genérico de `components/admin/postulacion-detail.tsx`) suma, antes de la sección de diagnóstico ya
existente, una sección "Entrevista IA" con las preguntas y respuestas (si las hubo). Si el registro
es anterior a este cambio y no trae `entrevista`, se muestra un texto indicándolo — mismo patrón que
ya usa el bloque de diagnóstico para registros previos a esa feature.

---

## 6. Archivos

**Nuevos**

| Archivo | Responsabilidad |
|---|---|
| `app/api/entrevista/route.ts` | HTTP: valida, limita, llama a Vertex, responde preguntas |
| `lib/entrevista.ts` | Núcleo de dominio compartido cliente/servidor: `normalizePreguntas` — mismo patrón que `lib/diagnosis.ts` frente a `lib/diagnosis-prompt.ts` |
| `lib/entrevista-prompt.ts` | Prompt y response schema del agente entrevistador |
| `components/empresas/entrevista-panel.tsx` | UI del sub-estado de entrevista dentro del paso 3 |

**Editados**

| Archivo | Cambio |
|---|---|
| `lib/diagnosis-prompt.ts` | Inyecta `respuestas_entrevista`; cambia el eje del `SYSTEM_PROMPT` de "paquete de desarrollo" a "dolor operativo resuelto con IA"; extiende `RESPONSE_SCHEMA` con `dolor_resuelto` |
| `lib/diagnosis.ts` | `isSolutionOption` exige `dolor_resuelto` no vacío; `DiagnosisRequest` suma `respuestas_entrevista` |
| `lib/data.ts` | Copy del sub-estado de entrevista (sin catálogo de servicios — descartado, ver §5.4) |
| `components/application-form.tsx` | `requestEntrevista()`, estado `EntrevistaState`, reorganización de `EmpresaStep3Diagnosis`, payload de envío con `entrevista` |
| `app/admin/empresas/[id]/page.tsx` | Sección "Entrevista IA" con preguntas/respuestas; ajuste del bloque de diagnóstico para mostrar `dolor_resuelto` |
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
3. Reto de un área no técnica (ej. marketing, atención al cliente, logística) → las tres opciones
   del diagnóstico describen el `dolor_resuelto` en lenguaje llano y específico al reto, no en
   términos de "desarrollo de software" genérico.
4. Quitar `GOOGLE_SERVICE_ACCOUNT_JSON` → la entrevista se salta sola, el diagnóstico cae a
   fallback, el envío funciona igual.
5. El contador de pasos del wizard se mantiene en "3 de 4" durante todo el paso 3, tanto en el
   sub-estado de entrevista como en el de diagnóstico.
6. Enviar → Firestore trae `entrevista` y `diagnostico` como campos separados.
7. El diagnóstico sigue sin mencionar montos, precios ni porcentajes, incluyendo cuando el
   `dolor_resuelto` es de un área no técnica.

---

## 9. Riesgos asumidos

- **Sin catálogo cerrado, el modelo tiene más margen para desviarse.** Al pedirle "nombra el dolor
  en lenguaje llano" en vez de "elige de esta lista", el riesgo se mueve de "alucinar una línea de
  servicio inexistente" a "describir un dolor genérico o poco creíble". Se mitiga con los ejemplos
  de tono de los hooks de Luis Carlos dentro del prompt (§5.3) y con el mismo principio de
  honestidad que ya rige el resto del prompt: si el reto es vago, el `dolor_resuelto` debe
  reflejar esa vaguedad en vez de inventar precisión que no hay.
- **Doble costo de llamada a Vertex por postulación.** Cada empresa que llega al paso 3 ahora
  dispara dos llamadas en vez de una (salvo cuando el entrevistador decide no preguntar nada). Se
  mitiga porque ambos endpoints comparten el mismo modelo Flash (barato) y el mismo rate limit por
  IP ya existente — el tope de 8 llamadas/hora ahora es compartido por dos endpoints con mapas
  separados, así que en el peor caso son 16 llamadas/hora por IP en vez de 8. Vale la pena
  revisarlo si se ve abuso.
- **Los fallbacks estáticos por área (`FALLBACKS` en `lib/diagnosis.ts`) son genéricos por
  construcción.** Cuando el diagnóstico cae a fallback, las opciones vuelven a ser plantillas fijas
  sin `dolor_resuelto` específico al reto — es una regresión aceptada para el caso fallback, ya
  cubierta por el aviso de "un mentor Senior revisará tu caso personalmente" que ya existe en ese
  copy. Requiere sumar un `dolor_resuelto` genérico por opción en `FALLBACKS` para que el nuevo
  campo obligatorio del schema no quede vacío en ese camino.
- **Prompt injection vía las respuestas de la entrevista.** Igual que con `reto`, las respuestas
  libres de la empresa a las preguntas del entrevistador viajan como datos delimitados hacia el
  agente solucionador — mismo tratamiento de seguridad que ya aplica el prompt actual.
