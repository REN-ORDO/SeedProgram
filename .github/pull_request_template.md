<!-- Título del PR: <tipo>: <qué cambia> — [CODIGO] opcional al inicio o al final. Ej. fix: [B04] no quedarse en skeleton si falla query Firestore -->

## Qué cambia

<!-- 1-3 líneas. Qué hace este PR, en lenguaje simple. -->

## Por qué

<!-- Causa raíz si es fix/hotfix, o motivación si es feature/refactor. No repitas "qué cambia" — esto es el contexto detrás. -->

## Ticket(s)

<!-- Link(s) a ClickUp. Si no hay ticket, decir por qué (hotfix directo, tooling interno, etc.) -->

<!-- Si este PR cierra un ticket, agregar línea SIN backticks, formato exacto: Closes: 86xxxxx
     (texto plano, una línea propia, sin "#", sin envolver en markdown — reservado para
     cuando montemos automatización que mueva el ticket a `done` al mergear) -->

## Tipo de cambio

<!-- Dejá TODAS las opciones en la lista. Marcá [x] solo las que aplican, las demás quedan [ ] — no borres las que no aplican, así se ve de un vistazo qué se evaluó y qué no. -->

- [ ] feat
- [ ] fix
- [ ] hotfix
- [ ] refactor
- [ ] docs
- [ ] chore
- [ ] test
- [ ] perf
- [ ] ci

## Módulos/áreas afectadas

<!-- Marca todo lo que el PR toca de verdad — ayuda a estimar blast radius sin leer el diff completo.
     Dejá TODAS las opciones en la lista, no borres las que no aplican — mismo criterio que "Tipo de cambio". -->

- [ ] Auth
- [ ] Partidos
- [ ] Vaca
- [ ] Teams
- [ ] Derbis
- [ ] Tournaments (formales)
- [ ] Torneos Abiertos (planillero, Firestore)
- [ ] Fields
- [ ] Profile y Gamificación
- [ ] La Previa
- [ ] Business
- [ ] Backoffice
- [ ] Socios
- [ ] Admin
- [ ] Infra (Vercel/Supabase/Firebase/WAHA)
- [ ] Otro: <!-- cuál -->

## Qué cambia técnicamente

<!-- Antes / Después. Si tocaste contratos de datos, rutas, env vars o APIs externas, decilo explícito acá — esto es lo que un reviewer (o un agente) necesita para no asumir mal. -->

- **Antes:**
- **Después:**

## Archivos clave

<!-- 3-8 rutas de archivo que concentran el cambio real. No listes todo el diff, solo donde está la lógica. -->

## Cómo probarlo

<!-- Pasos concretos y reproducibles. Si es UI, agregar screenshot/Loom. -->

## Riesgos / Dependencias

<!-- Qué se puede romper, flags involucrados, migraciones de datos, orden de deploy si importa. "Ninguno" es una respuesta válida si es cierto. -->

**¿Rompe compatibilidad con la versión actual?** Sí / No
<!-- Si Sí: describir el impacto y qué hay que hacer para no romper nada en prod. -->

## Fuera de alcance

<!-- Qué decidiste NO tocar a propósito, para que no se confunda con un olvido. -->

## Checklist de cierre

- [ ] `npm run build` (o `npm run typecheck` si el cambio es acotado) pasa
- [ ] `npm run lint` pasa
- [ ] `docs/codebase-derbiplay/` actualizado si el cambio toca módulo, ruta, API, infra o flujo
- [ ] Línea de **Responsable** agregada en el nodo del vault tocado (asignado del ticket ClickUp, no quien hizo el commit)
- [ ] Sin secrets/`.env*` commiteados
- [ ] Scope acotado a lo que pide el ticket — nada de "aproveché y..."
