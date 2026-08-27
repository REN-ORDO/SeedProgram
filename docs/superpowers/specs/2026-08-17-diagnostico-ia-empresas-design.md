# Diagnóstico IA para empresas patrocinadoras

**Fecha:** 2026-08-17
**Estado:** aprobado (pendiente de plan de implementación)
**Autor:** Claude + Sebastián (REN-ORDO)

---

## 1. Problema

El formulario de `/postular?rol=empresa` ya pide el reto de la empresa en un textarea
(`components/application-form.tsx`, `EmpresaStep2`), pero ese texto muere en Firestore hasta que
alguien del equipo lo lee. La empresa no recibe nada a cambio en el momento, así que el formulario
no genera ningún compromiso ni conversación.

Queremos que describir el reto tenga una recompensa inmediata: un diagnóstico generado con IA y
tres rutas concretas para resolverlo con un semillero. La empresa elige una ruta y eso se convierte
en el punto de partida de la conversación con un mentor Senior de CooWeb.

## 2. Objetivo

- Captar más empresas inversionistas dándoles valor antes de pedirles nada.
- Convertir un texto libre en una propuesta accionable que el equipo comercial pueda retomar.
- Dejar explícito, en cada pantalla del proceso, que **CooWeb respalda el proceso y siempre hay un
  mentor Senior acompañando**. La IA propone; el Senior valida y responde.

## 3. Alcance

**Incluye:** un paso nuevo en el wizard de empresas, un endpoint de servidor que llama a Vertex AI,
persistencia del diagnóstico y la opción elegida en Firestore, visualización en el admin, y el
copy de respaldo en el paso y en la pantalla de éxito.

**No incluye (YAGNI):** protección anti-bot con Turnstile/captcha, envío del diagnóstico por correo,
edición del diagnóstico desde el admin, ni historial de regeneraciones.

---

## 4. Flujo de usuario

El wizard de empresas pasa de 3 a 4 pasos:

```
1. Empresa  →  2. Reto  →  3. Diagnóstico  →  4. Modalidad  →  envío
```

### Paso 3 — Diagnóstico

Al pulsar "Continuar" en el paso 2, el formulario dispara la llamada al endpoint y navega al paso 3,
que renderiza uno de tres estados:

**Cargando** — esqueleto animado + microcopy: *"Estamos leyendo tu reto…"*. Duración esperada 3-6 s.

**Listo** — el panel muestra:

1. **Lo que entendemos** — 2 a 3 frases que reformulan el problema de la empresa en sus propios
   términos. Sirve de prueba de que fue leído.
2. **Tres rutas de solución**, cada una con:
   - `titulo` — nombre corto de la ruta (máx. 60 caracteres).
   - `descripcion` — qué construiría el semillero, en 2-3 frases.
   - `entregable` — el resultado concreto que la empresa recibe.
   - `duracion_semanas` — entero entre 4 y 16.
3. **Selección obligatoria** de una ruta (radio, `name="opcion_elegida"`). No se puede avanzar sin
   elegir.
4. **Botón "Ver otras opciones"** — regenera el diagnóstico. Máximo 2 regeneraciones por sesión;
   al agotarse, el botón se deshabilita con el texto *"Un Senior revisará tu caso"*.
5. **Banner de respaldo**, siempre visible dentro del paso:
   > Esta es una primera lectura hecha con IA. Un mentor Senior de CooWeb la revisa y acompaña
   > todo el proceso, de principio a fin.

**Error / fallback** — ver §7.

### Pantalla de éxito

Tras el envío, además del mensaje actual de confirmación:

- Refuerzo del respaldo: *"Un mentor Senior de CooWeb ya tiene tu diagnóstico y te contacta en
  las próximas 24-48 horas hábiles."*
- Botón a WhatsApp de CooWeb, con el mensaje prellenado
  `Hola, acabo de enviar el diagnóstico de <empresa> desde la web.`

El número vive en `lib/data.ts` como constante `COOWEB_WHATSAPP`, con un **valor placeholder y un
comentario `TODO`**. El botón queda funcional pero apunta a un número falso hasta que Sebastián lo
reemplace.

---

## 5. Arquitectura

### 5.1 Endpoint — `app/api/diagnostico/route.ts`

Route handler POST, `runtime = "nodejs"` (Vertex necesita el SDK de Node, no corre en Edge).

**Request**

```ts
{ area: string; area_otro?: string; reto: string; empresa: string }
```

**Response 200**

```ts
{
  resumen: string;
  opciones: Array<{
    titulo: string;
    descripcion: string;
    entregable: string;
    duracion_semanas: number;
  }>;              // exactamente 3
  fuente: "ia" | "fallback";
}
```

**Validación de entrada** — `reto` entre 20 y 2000 caracteres, `empresa` entre 2 y 150, `area` dentro
del conjunto conocido (`cs | operaciones | datos | marketing | otro`). Si algo falla, `400` sin
llamar a Vertex.

**Rate limit** — mapa en memoria por IP (`x-forwarded-for`), 8 llamadas por hora. Es *best-effort*:
en serverless cada instancia tiene su propio mapa, así que el límite real es más alto. Sirve para
frenar un bucle accidental, no un ataque. Al superarlo devuelve `429` y el cliente cae al fallback.

**Timeout** — 25 s con `AbortController`. Al vencer, fallback.

### 5.2 Vertex AI

- SDK: `@google/genai` con `vertexai: true`.
- Proyecto: `seed-program` (el mismo de Firebase — un proyecto Firebase *es* un proyecto GCP).
- Región: `us-central1`.
- Modelo: Gemini Flash (`gemini-2.5-flash` como valor por defecto, configurable vía
  `VERTEX_MODEL`). Se elige Flash por latencia y costo; el diagnóstico no requiere razonamiento
  profundo.
- Salida estructurada: `responseMimeType: "application/json"` + `responseSchema` con el shape de
  §5.1, para no parsear texto libre.
- Temperatura 0.8 — queremos variedad entre regeneraciones.

**Credenciales.** Service account con rol *Vertex AI User*, su JSON codificado en base64 en la env
var `GOOGLE_SERVICE_ACCOUNT_JSON`. El handler la decodifica y la pasa al SDK vía `googleAuthOptions.credentials`.
Nunca lleva prefijo `NEXT_PUBLIC_` y nunca se importa desde un componente cliente.

Tareas manuales que quedan del lado de Sebastián, fuera del código:
1. Habilitar la Vertex AI API en el proyecto `seed-program`.
2. Crear la service account con rol *Vertex AI User* y descargar su JSON.
3. Cargar `GOOGLE_SERVICE_ACCOUNT_JSON` (base64) y opcionalmente `VERTEX_MODEL` en Vercel.

### 5.3 Prompt

Vive en `lib/diagnostico.ts` como constante, no incrustado en el handler, para poder ajustarlo sin
tocar la lógica HTTP.

El system prompt establece:

- Quién responde: CooWeb, programa Semilla, semilleros de jóvenes desarrolladores con mentoría
  senior 1:1.
- Qué es realista entregar: proyectos de 4 a 16 semanas — automatizaciones, integraciones, chatbots
  de soporte, dashboards, scrapers, herramientas internas. **No** migraciones core, ni sistemas
  críticos de misión, ni nada que requiera certificaciones o compliance pesado.
- Tono: cercano, tuteo, sin paternalismo, sin jerga vacía de consultoría.
- **Prohibido mencionar precios, montos, porcentajes o rangos económicos** — regla de marca vigente
  en `CLAUDE.md` §3.
- Las tres opciones deben diferenciarse en ambición: una acotada y rápida, una intermedia, una más
  ambiciosa. No tres variantes de lo mismo.
- Si el reto es demasiado vago para diagnosticar, el resumen debe decirlo con honestidad y las
  opciones se orientan a descubrimiento (auditoría, mapeo de procesos, prototipo exploratorio).

El user prompt inyecta `empresa`, `area` (resuelta con `area_otro` cuando aplica) y `reto`. El texto
de la empresa se pasa como dato delimitado, y el system prompt instruye explícitamente ignorar
cualquier instrucción que venga dentro de ese texto.

### 5.4 UI — `components/empresas/diagnostico-panel.tsx`

Componente cliente, presentacional, sin fetch propio: recibe por props el estado
(`loading | ready | fallback`), los datos y `onSelect`. La llamada HTTP la orquesta
`application-form.tsx`, que ya es el dueño del estado del wizard.

Se integra con el formulario no controlado igual que el resto de campos: la opción elegida se
refleja en un `<input type="hidden" name="opcion_elegida">`, y el diagnóstico completo en otro
hidden serializado como JSON, siguiendo el patrón ya usado por el `Select` custom del formulario
(ver `components/application-form.tsx` ~línea 604).

Estilo: reusa `optionCls`, `labelCls` e `inputCls` del formulario para mantener el neobrutalism de
`theme-toon`. Paleta dentro de las familias documentadas (teal / sky / neutros).

### 5.5 Persistencia

El documento de la colección `empresas` suma tres campos:

```ts
diagnostico: { resumen: string; opciones: Opcion[] } | null
diagnostico_fuente: "ia" | "fallback" | null
opcion_elegida: number | null   // índice 0-2 dentro de diagnostico.opciones
```

Cuando el diagnóstico cae al fallback, se guarda igual con `diagnostico_fuente: "fallback"` — al
equipo le sirve saber que ese caso no fue leído por la IA.

### 5.6 Admin

`components/admin/postulacion-detail.tsx` renderiza, para postulaciones de empresa, un bloque con el
resumen, las tres opciones y la elegida resaltada. Si `diagnostico_fuente === "fallback"`, muestra
una etiqueta de aviso para que el Senior sepa que debe diagnosticar a mano.

---

## 6. Archivos

**Nuevos**

| Archivo | Responsabilidad |
|---|---|
| `app/api/diagnostico/route.ts` | HTTP: valida, limita, llama a Vertex, responde |
| `lib/diagnostico.ts` | Tipos, prompt, response schema, fallbacks por área |
| `components/empresas/diagnostico-panel.tsx` | UI del paso 3 |

**Editados**

| Archivo | Cambio |
|---|---|
| `components/application-form.tsx` | `EMPRESA_STEPS` a 4, orquestación del fetch, paso 3, payload de envío, pantalla de éxito |
| `lib/data.ts` | Copy del paso, banner de respaldo, `COOWEB_WHATSAPP`, textos de fallback |
| `components/admin/postulacion-detail.tsx` | Bloque de diagnóstico |
| `.env.example` | `GOOGLE_SERVICE_ACCOUNT_JSON`, `VERTEX_MODEL` |

`application-form.tsx` ya tiene 2003 líneas. Este cambio no lo hace crecer de forma significativa
porque el paso nuevo vive en su propio archivo, pero conviene registrar que el archivo está en el
límite de lo manejable; partirlo es trabajo aparte, fuera de este spec.

---

## 7. Errores y fallback

**Principio rector: la IA nunca bloquea el envío del formulario.** Si Vertex falla, la empresa
igual completa su postulación.

| Situación | Comportamiento |
|---|---|
| Vertex responde error, timeout, o `429` del rate limit | El paso 3 renderiza 3 rutas plantilla según el área elegida, con el aviso: *"Preferimos que un mentor Senior lea tu caso personalmente. Estas son rutas típicas para empezar la conversación."* |
| Respuesta de Vertex no cumple el schema | Igual que el anterior — se trata como error |
| Falta `GOOGLE_SERVICE_ACCOUNT_JSON` (local sin `.env`) | El endpoint devuelve fallback sin intentar la llamada, y loguea un warning en servidor. `npm run build` y `npm run dev` funcionan sin credenciales |
| La empresa agota las 2 regeneraciones | Botón deshabilitado, copy: *"Un Senior revisará tu caso"* |

Los fallbacks por área viven en `lib/diagnostico.ts` como datos estáticos: cuatro juegos de tres
opciones (CS, operaciones, datos, marketing) más uno genérico para `otro`.

---

## 8. Pruebas

No hay suite de tests en el proyecto y este spec no la introduce. Verificación manual:

1. `/postular?rol=empresa` → completar 4 pasos con un reto real → el diagnóstico responde con 3
   opciones coherentes y distintas entre sí.
2. Sin elegir opción, "Continuar" no avanza.
3. Regenerar dos veces → tercer intento deshabilitado.
4. Quitar `GOOGLE_SERVICE_ACCOUNT_JSON` del `.env.local` → aparecen las opciones de fallback con su
   aviso, y el envío funciona igual.
5. Reto de 5 caracteres → el paso 2 no deja avanzar (validación ya existente).
6. Enviar → el documento en Firestore trae `diagnostico`, `diagnostico_fuente` y `opcion_elegida`.
7. Admin → el detalle de esa empresa muestra el diagnóstico y la opción elegida resaltada.
8. Pantalla de éxito → el botón de WhatsApp abre el chat con el mensaje prellenado.
9. El diagnóstico nunca menciona montos, precios ni porcentajes (probar con un reto que pregunte
   explícitamente por costos).

---

## 9. Riesgos asumidos

- **Endpoint público con costo por llamada.** El rate limit en memoria es aproximado en serverless.
  Si aparece abuso, el siguiente paso es Turnstile o un token de sesión emitido al iniciar el
  formulario — queda fuera de este spec por decisión explícita.
- **Calidad variable del diagnóstico.** Un reto vago produce opciones genéricas. Se mitiga con la
  instrucción de honestidad en el prompt y con el mentor Senior como filtro humano real, no como
  adorno de copy.
- **Prompt injection desde el textarea.** El reto se delimita y el system prompt instruye ignorar
  instrucciones embebidas. El daño potencial es bajo: la salida solo la ve la propia empresa y el
  admin.
