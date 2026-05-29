# SeedProgram — Web Programa Semilla CooWeb

Sitio informativo del **Programa Semilla** de CooWeb: una cantera de talento joven
(17-25 años) que combina motivación + mentoría senior 1:1 para formar desarrolladores
con impacto social. La web comunica qué es el programa, su metodología, los batches
abiertos, testimonios reales y recibe postulaciones.

> _"Encontramos talento donde otros no miran."_

---

## Stack

- **Framework:** Next.js 16 (App Router) · React 19
- **Estilos:** Tailwind CSS v4 (tokens en `app/globals.css`, tema `theme-toon` neobrutalism)
- **Animaciones:** Framer Motion
- **Iconos:** lucide-react
- **Backend:** Firebase (Firestore + Auth) · Cloudinary (subida de CV)
- **Deploy:** Vercel

---

## Arranque rápido

```bash
npm install
cp .env.example .env.local   # completa las claves (ver abajo)
npm run dev                  # http://localhost:3000
```

### Scripts

| Comando | Qué hace |
|---|---|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Build de producción |
| `npm run start` | Sirve el build de producción |
| `npm run lint` | Revisión con ESLint |

---

## Variables de entorno

Copia `.env.example` a `.env.local` y completa:

```
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=
```

Sin estas claves el formulario de postulación y el panel admin no funcionan.

---

## Estructura

```
app/
  page.tsx              Landing (una sola página, todas las secciones)
  postular/             Formulario de postulación (aspirante / empresa)
  admin/                Panel privado (login + dashboard + listas + detalle)
  fuentes/              Página interna de prueba tipográfica (no es producto)
components/
  *.tsx                 Una sección de landing por archivo (hero, pilares, …)
  admin/                Componentes del panel admin
  reveal · magnetic …   Mejoras de interacción (scroll reveal, cursor, etc.)
lib/
  data.ts               Contenido del sitio (copys, niveles, batches, testimonios)
  firebase.ts           Init de Firebase
  auth-context.tsx      Contexto de autenticación + lista de admins
  cloudinary.ts         Subida de archivos
  admin-helpers.ts      Estados de postulación, CSV, fechas
public/                 Imágenes y logos
firestore.rules         Reglas de seguridad de Firestore
```

### Contenido del sitio

Todo el texto vive en [`lib/data.ts`](lib/data.ts) como arrays tipados
(`pilares`, `niveles`, `batches`, `testimonios`, `metrics`, …). Para cambiar copys
o agregar un testimonio, **se edita ahí** — no hay CMS ni llamadas a API.

---

## Postulaciones y panel admin

- **Público:** cualquiera puede enviar una postulación desde `/postular`. Se guarda
  en Firestore (colecciones `aspirantes` / `empresas`); el CV sube a Cloudinary.
- **Admin (`/admin`):** acceso restringido. Solo los emails listados como admin
  (ver `lib/auth-context.tsx`) pueden entrar, ver postulaciones, cambiar su estado
  y exportar a CSV.
- **Seguridad:** las reglas en [`firestore.rules`](firestore.rules) permiten crear
  postulaciones desde el cliente con guardas mínimas; leer/actualizar es solo para
  admins autenticados; borrar está bloqueado desde el cliente.

---

## Identidad visual

- **Paleta:** verdes aguamarina (acento, "semilla") + azules (estructura, tech).
  Mantenerse dentro de la paleta documentada en `CLAUDE.md`.
- **Tipografías:** Space Grotesk (display), Inter (body), JetBrains Mono (datos),
  Caveat (handwritten).
- **Tema activo:** `theme-toon` — neobrutalism con bordes negros y sombras duras.

---

## Equipo

Liderado por Sebastián (REN-ORDO) — equipo de 4. El líder aprueba diseño antes de
implementar y revisa los PRs.

Convenciones de trabajo y contexto completo del programa en [`CLAUDE.md`](CLAUDE.md).
