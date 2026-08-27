"use client";

/**
 * Formulario de postulación al Programa Semilla.
 *
 * Dos flujos en una sola vista (selector arriba):
 *  - Aspirante: nombre + contacto · datos académicos + CV · interés
 *  - Empresa:   datos · diagnóstico del reto · modalidad de apoyo
 *
 * Submit → Firestore (colecciones `aspirantes` / `empresas`).
 * CV de aspirante → Cloudinary (cualquier formato, ver lib/cloudinary.ts).
 *
 * Estilo: usa los tokens .theme-toon + helpers .toon-* de globals.css.
 */

import {
  useState,
  useMemo,
  useRef,
  useEffect,
  useContext,
  createContext,
  type ChangeEvent,
  type FormEvent,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";
import Image from "next/image";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  FileUp,
  Building2,
  Sprout,
  Send,
  History,
  X,
  ChevronDown,
  List,
  ExternalLink,
  MessageCircle,
} from "lucide-react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { uploadCvToCloudinary } from "@/lib/cloudinary";
import { COOWEB_WHATSAPP, HAS_COOWEB_WHATSAPP } from "@/lib/data";
import { Magnetic } from "@/components/magnetic";
import {
  saveDraft,
  loadDraft,
  clearDraft,
  draftAge,
  type FormDraft,
} from "@/lib/form-draft";
import { cn } from "@/lib/utils";
import {
  DiagnosisPanel,
  type DiagnosisState,
} from "@/components/empresas/diagnosis-panel";
import {
  CHALLENGE_MAX,
  CHALLENGE_MIN,
  fallbackFor,
  normalizeDiagnosis,
  normalizeArea,
  type Diagnosis,
} from "@/lib/diagnosis";

// Easing canónico del sitio
const EASE = [0.22, 1, 0.36, 1] as const;

// Deadline del cliente para /api/diagnostico. Se queda por debajo del
// timeout de la propia ruta (25s) para que, en el caso normal, sea el
// servidor el que gane la carrera y devuelva su fallback; este timeout
// solo debe activarse cuando la respuesta nunca llega al cliente.
const CLIENT_TIMEOUT_MS = 15_000;

// ============================================================
// Validadores por campo
// ============================================================
// Cada validador recibe el valor (ya trimmed) y devuelve:
//   null  → valor válido
//   string → mensaje de error a mostrar
// Solo se aplican si el valor NO está vacío (la check de "required"
// se hace por separado antes).

type Validator = (value: string) => string | null;

const RX = {
  // Letras (incluye tildes / ñ vía \p{L}) + espacios + apóstrofes + guion
  onlyLetters: /^[\p{L}\s'’\-]+$/u,
  // Letras + números + espacios + caracteres comunes en nombres legales/programas
  alphanumName: /^[\p{L}\p{N}\s'’\-.,&·/]+$/u,
  // Email — regex pragmática (no perfecta pero suficiente)
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
} as const;

const validators: Record<string, Validator> = {
  nombre: (v) => {
    if (v.length < 3) return "El nombre es muy corto.";
    if (v.length > 100) return "El nombre es muy largo.";
    if (!RX.onlyLetters.test(v))
      return "El nombre solo puede tener letras, espacios y guiones.";
    if (!/\s/.test(v)) return "Escribe tu nombre completo (nombre y apellido).";
    return null;
  },
  whatsapp: (v) => {
    const digits = v.replace(/\D/g, "");
    if (digits.length < 7) return "El WhatsApp es muy corto.";
    if (digits.length > 15) return "El WhatsApp es muy largo.";
    return null;
  },
  telefono: (v) => {
    const digits = v.replace(/\D/g, "");
    if (digits.length < 7) return "El teléfono es muy corto.";
    if (digits.length > 15) return "El teléfono es muy largo.";
    return null;
  },
  email: (v) => {
    if (v.length > 200) return "El correo es muy largo.";
    if (!RX.email.test(v)) return "El correo no tiene un formato válido.";
    return null;
  },
  carrera: (v) => {
    if (v.length > 150) return "El nombre del programa es muy largo.";
    return null;
  },
  empresa: (v) => {
    if (v.length < 2) return "El nombre de la empresa es muy corto.";
    if (v.length > 150) return "El nombre de la empresa es muy largo.";
    if (!RX.alphanumName.test(v))
      return "El nombre tiene caracteres no permitidos.";
    return null;
  },
  contacto: (v) => {
    if (v.length < 3) return "El nombre del contacto es muy corto.";
    if (v.length > 200) return "El nombre del contacto es muy largo.";
    return null;
  },
  reto: (v) => {
    if (v.length < 20)
      return "Cuéntanos un poco más sobre el reto (mínimo 20 caracteres).";
    if (v.length > 2000) return "El texto es muy largo (máximo 2000 caracteres).";
    return null;
  },
  // Motivación (textarea libre — es el signal más importante para hiring)
  interes: (v) => {
    if (v.length < 20)
      return "Cuéntanos un poco más sobre tu motivación (mínimo 20 caracteres).";
    if (v.length > 1500) return "Es muy largo (máximo 1500 caracteres).";
    return null;
  },
  // Campos "otro" — solo limitamos length, ya validamos no-vacío arriba
  estudia_otro: (v) =>
    v.length > 100 ? "El texto es muy largo." : null,
  origen_referido: (v) =>
    v.length > 100 ? "El nombre es muy largo." : null,
  origen_otro: (v) =>
    v.length > 100 ? "El texto es muy largo." : null,
  area_otro: (v) =>
    v.length > 100 ? "El texto es muy largo." : null,
  modalidad_otro: (v) =>
    v.length > 100 ? "El texto es muy largo." : null,
};

// Labels amigables para mensaje genérico de "campo requerido"
const fieldLabels: Record<string, string> = {
  nombre: "el nombre completo",
  ciudad: "la ciudad",
  whatsapp: "el WhatsApp",
  telefono: "el teléfono",
  email: "el correo electrónico",
  carrera: "la carrera",
  empresa: "el nombre de la empresa",
  contacto: "la persona de contacto",
  reto: "la descripción del reto",
  interes: "tu motivación",
};

// ============================================================
// Traducción de errores de envío → mensaje accionable
// ============================================================
// El submit puede fallar por: (1) red caída antes de llegar al servidor
// —fetch lanza "Failed to fetch" / "Load failed" (Safari) o un AbortError
// por timeout—, (2) Cloudinary mal configurado, (3) reglas/cuota de
// Firestore. Nunca mostramos el mensaje técnico crudo: confunde al usuario
// y no le dice cómo recuperarse.

function friendlySubmitError(err: unknown): string {
  const raw = err instanceof Error ? err.message : "";

  // Error de red: la petición ni siquiera llegó al servidor.
  const isNetwork =
    (typeof err === "object" &&
      err !== null &&
      "code" in err &&
      (err as { code?: string }).code === "network") ||
    (err instanceof DOMException && err.name === "AbortError") ||
    /failed to fetch|load failed|networkerror|network request failed/i.test(
      raw,
    );
  if (isNetwork) {
    return "No pudimos conectar. Revisa tu conexión a internet e inténtalo de nuevo. Tus datos quedaron guardados como borrador.";
  }

  // Configuración faltante de Cloudinary (CV).
  if (/cloudinary no está configurado/i.test(raw)) {
    return "Ahora mismo no podemos recibir tu hoja de vida. Escríbenos y lo solucionamos enseguida.";
  }

  // Permisos / reglas de Firestore.
  if (/permission|insufficient|unauthorized/i.test(raw)) {
    return "No pudimos guardar tu postulación por un problema de permisos. Ya estamos al tanto; inténtalo más tarde.";
  }

  // Fallback genérico (sin filtrar detalles técnicos).
  return "Hubo un problema enviando tu postulación. Inténtalo de nuevo en unos minutos; tus datos quedaron guardados como borrador.";
}

// ============================================================
// Types
// ============================================================

type Role = "aspirante" | "empresa";
type Direction = "forward" | "back";

type StepConfig = { id: number; label: string };

const ASPIRANTE_STEPS: StepConfig[] = [
  { id: 1, label: "Contacto" },
  { id: 2, label: "Académico" },
  { id: 3, label: "Interés" },
];

const EMPRESA_STEPS: StepConfig[] = [
  { id: 1, label: "Empresa" },
  { id: 2, label: "Reto" },
  { id: 3, label: "Diagnóstico" },
  { id: 4, label: "Modalidad" },
];

// ============================================================
// Helpers de estilo (clases tailwind reusables como strings)
// ============================================================

const inputCls =
  "w-full rounded-xl border-2 border-[var(--color-ink)] bg-white px-4 py-3.5 text-[15px] text-[var(--color-ink)] " +
  "shadow-[3px_3px_0_var(--color-ink)] outline-none transition-all duration-150 " +
  "placeholder:text-[var(--color-fg-subtle)] " +
  "hover:-translate-x-px hover:-translate-y-px hover:shadow-[4px_4px_0_var(--color-ink)] " +
  "focus:-translate-x-0.5 focus:-translate-y-0.5 focus:shadow-[5px_5px_0_var(--color-accent)]";

const labelCls =
  "mb-2.5 block font-display text-sm font-semibold tracking-tight text-[var(--color-ink)]";

const optionCls =
  "flex cursor-pointer flex-wrap items-center gap-x-3.5 gap-y-2.5 rounded-xl border-2 border-[var(--color-ink)] bg-white " +
  "px-4 py-3.5 shadow-[3px_3px_0_var(--color-ink)] transition-all duration-150 " +
  "hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[5px_5px_0_var(--color-ink)] " +
  "has-[input:checked]:-translate-x-0.5 has-[input:checked]:-translate-y-0.5 " +
  "has-[input:checked]:bg-[var(--color-bg-teal)] has-[input:checked]:shadow-[5px_5px_0_var(--color-ink)]";

// ============================================================
// Sub-componentes pequeños
// ============================================================

function Stepper({
  steps,
  current,
}: {
  steps: StepConfig[];
  current: number;
}) {
  return (
    <div className="mb-9 flex items-center gap-2">
      {steps.map((step, i) => {
        const isActive = current === step.id;
        const isDone = current > step.id;
        return (
          <div key={step.id} className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            <motion.div
              animate={
                isActive
                  ? { scale: [1, 1.08, 1], rotate: -3 }
                  : isDone
                    ? { scale: 1, rotate: 0 }
                    : { scale: 1, rotate: 0 }
              }
              transition={
                isActive
                  ? {
                      scale: { duration: 0.6, ease: EASE, times: [0, 0.5, 1] },
                      rotate: { type: "spring", stiffness: 240, damping: 14 },
                    }
                  : { duration: 0.35, ease: EASE }
              }
              className={cn(
                "flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full border-2 border-[var(--color-ink)]",
                "shadow-[3px_3px_0_var(--color-ink)] font-display text-sm font-bold",
                isActive && "bg-[var(--color-accent)] text-white",
                isDone && "bg-[var(--color-bg-teal)] text-[var(--color-ink)]",
                !isActive && !isDone && "bg-white text-[var(--color-ink)]",
              )}
            >
              <AnimatePresence mode="wait" initial={false}>
                {isDone ? (
                  <motion.span
                    key="check"
                    initial={{ scale: 0, rotate: -90 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 320, damping: 16 }}
                  >
                    <Check size={16} strokeWidth={3} />
                  </motion.span>
                ) : (
                  <motion.span
                    key="num"
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    {step.id}
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.div>
            <span
              className={cn(
                "hidden font-display text-sm font-semibold whitespace-nowrap transition-colors duration-300 sm:block",
                isActive ? "text-[var(--color-ink)]" : "text-[var(--color-fg-subtle)]",
                isDone && "text-[var(--color-fg-muted)]",
              )}
            >
              {step.label}
            </span>
            {i < steps.length - 1 && (
              <div className="relative mx-1 h-[3px] w-6 min-w-4 sm:w-10 overflow-hidden border-y-2 border-[var(--color-ink)] bg-[var(--color-bg-soft)]">
                <motion.div
                  initial={false}
                  animate={{ scaleX: isDone ? 1 : 0 }}
                  transition={{ duration: 0.55, ease: EASE }}
                  className="absolute inset-0 origin-left bg-[var(--color-accent)]"
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function RoleSelector({
  role,
  onChange,
}: {
  role: Role;
  onChange: (r: Role) => void;
}) {
  const opts = [
    { id: "aspirante" as Role, label: "Soy aspirante", Icon: Sprout },
    { id: "empresa" as Role, label: "Soy empresa", Icon: Building2 },
  ];
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: EASE }}
      className="mb-9 flex justify-center"
    >
      <div className="inline-flex rounded-full border-2 border-[var(--color-ink)] bg-white p-1.5 shadow-[6px_6px_0_var(--color-ink)]">
        {opts.map((opt) => (
          <button
            key={opt.id}
            type="button"
            onClick={() => onChange(opt.id)}
            className={cn(
              "relative inline-flex items-center gap-2 rounded-full px-5 py-3 font-body text-sm font-semibold transition-colors",
              role === opt.id
                ? "text-white"
                : "text-[var(--color-fg-muted)] hover:text-[var(--color-ink)]",
            )}
          >
            {role === opt.id && (
              <motion.span
                layoutId="role-pill"
                className="absolute inset-0 rounded-full bg-[var(--color-ink)]"
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
              />
            )}
            <opt.Icon className="relative z-10" size={16} strokeWidth={2.5} />
            <span className="relative z-10 hidden xs:inline sm:inline">{opt.label}</span>
            <span className="relative z-10 inline xs:hidden sm:hidden">
              {opt.id === "aspirante" ? "Aspirante" : "Empresa"}
            </span>
          </button>
        ))}
      </div>
    </motion.div>
  );
}

/**
 * Field con animación de entrada en stagger.
 * El padre (panel) controla el timing con `staggerChildren`.
 */
function Field({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 14 },
        show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE } },
      }}
      className="mb-5"
    >
      {children}
    </motion.div>
  );
}

function Hand({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="font-handwritten font-bold text-[var(--color-accent-strong)]"
      style={{ fontSize: "1.2em" }}
    >
      {children}
    </span>
  );
}

function PanelHeader({
  title,
  desc,
}: {
  title: string;
  desc: React.ReactNode;
}) {
  return (
    <div className="mb-7">
      <h2 className="font-display text-2xl font-bold leading-tight tracking-tight text-[var(--color-heading)] sm:text-[28px]">
        {title}
      </h2>
      <p className="mt-1.5 text-[15px] text-[var(--color-fg-muted)]">{desc}</p>
    </div>
  );
}

// Radio personalizado al estilo toon (consume FormCtx para persistir entre pasos)
function Radio({
  name,
  value,
  label,
  required,
  withOtherInput,
  otherName,
  otherPlaceholder,
}: {
  name: string;
  value: string;
  label: string;
  required?: boolean;
  withOtherInput?: boolean;
  otherName?: string;
  otherPlaceholder?: string;
}) {
  const ctx = useFormCtx();
  return (
    <label className={optionCls}>
      <input
        {...radioProps(name, value, ctx)}
        type="radio"
        required={required}
        className="peer sr-only"
      />
      <span className="relative flex h-[22px] w-[22px] flex-shrink-0 items-center justify-center rounded-full border-2 border-[var(--color-ink)] bg-white peer-checked:bg-[var(--color-accent)]">
        <span className="h-2 w-2 rounded-full bg-white opacity-0 peer-checked:opacity-100" />
      </span>
      <span className="flex-1 text-[15px] font-medium text-[var(--color-fg)]">
        {label}
      </span>
      {withOtherInput && otherName && (
        <input
          {...textProps(otherName, ctx)}
          type="text"
          placeholder={otherPlaceholder ?? "Especifica..."}
          className={cn(
            "rounded-lg border-2 border-[var(--color-ink)] bg-white px-3 py-1.5",
            "text-[13px] shadow-[2px_2px_0_var(--color-ink)] outline-none focus:shadow-[3px_3px_0_var(--color-accent)]",
            // Móvil: full width en su propia línea. Desktop: inline, alineado a la derecha, capado.
            "w-full sm:ml-auto sm:w-auto sm:max-w-[220px]",
          )}
          onClick={(e) => e.preventDefault()}
        />
      )}
    </label>
  );
}

// ============================================================
// Panel transition wrapper (slide direccional)
// ============================================================

function PanelMotion({
  step,
  direction,
  children,
}: {
  step: number;
  direction: Direction;
  children: React.ReactNode;
}) {
  const reduce = useReducedMotion();
  if (reduce) return <div>{children}</div>;

  return (
    <AnimatePresence mode="wait" custom={direction}>
      <motion.div
        key={step}
        custom={direction}
        initial="hidden"
        animate="show"
        exit="exit"
        variants={{
          hidden: {
            opacity: 0,
            x: direction === "forward" ? 36 : -36,
            filter: "blur(2px)",
          },
          show: {
            opacity: 1,
            x: 0,
            filter: "blur(0px)",
            transition: {
              duration: 0.4,
              ease: EASE,
              when: "beforeChildren",
              staggerChildren: 0.07,
              delayChildren: 0.05,
            },
          },
          exit: {
            opacity: 0,
            x: direction === "forward" ? -36 : 36,
            filter: "blur(2px)",
            transition: { duration: 0.25, ease: EASE },
          },
        }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

// ============================================================
// Form Context — para persistir valores entre transiciones de paso
// ============================================================

type FormCtxValue = {
  defaults: Record<string, string>;
  onChange: (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => void;
};

const FormCtx = createContext<FormCtxValue | null>(null);

function useFormCtx(): FormCtxValue {
  const ctx = useContext(FormCtx);
  if (!ctx) throw new Error("useFormCtx debe usarse dentro de FormCtx.Provider");
  return ctx;
}

/** Helper que mergea defaults + onChange a inputs de texto/email/tel/select/textarea */
function textProps(name: string, ctx: FormCtxValue) {
  return {
    name,
    defaultValue: ctx.defaults[name] ?? "",
    onChange: ctx.onChange,
  };
}

/**
 * Formatea dígitos al patrón "333 333 3333" (grupos 3-3-4, luego overflow).
 * Solo para mostrar; en valuesRef/BD se guardan los dígitos puros.
 */
function formatPhone(raw: string): string {
  const d = raw.replace(/\D/g, "").slice(0, 15);
  const parts = [d.slice(0, 3), d.slice(3, 6), d.slice(6, 10), d.slice(10)];
  return parts.filter(Boolean).join(" ");
}

/**
 * Helper para inputs de teléfono. En cada cambio (teclear, pegar,
 * autocompletar) reformatea el input al patrón "333 333 3333", quitando
 * cualquier carácter que no sea dígito. valuesRef guarda el texto formateado;
 * los validadores ignoran espacios y el payload final normaliza a dígitos.
 */
function phoneProps(name: string, ctx: FormCtxValue) {
  return {
    name,
    defaultValue: formatPhone(ctx.defaults[name] ?? ""),
    onChange: (e: ChangeEvent<HTMLInputElement>) => {
      e.target.value = formatPhone(e.target.value);
      ctx.onChange(e);
    },
  };
}

/** Helper para radio buttons con restore */
function radioProps(name: string, value: string, ctx: FormCtxValue) {
  return {
    name,
    value,
    defaultChecked: ctx.defaults[name] === value,
    onChange: ctx.onChange,
  };
}

/**
 * Dropdown custom estilo neobrutalism (reemplaza <select> nativo).
 *
 * Se integra con el form no-controlado vía un <input hidden name={name}>:
 *   - captureCurrentPanel() y handleSubmit lo leen como cualquier input.
 *   - validateCurrentPanel() lo valida con [required] + .focus()/.value.
 * Restaura su valor desde ctx.defaults al remontar (igual que textProps).
 */
function SelectField({
  name,
  options,
  placeholder,
  required,
  otherValue,
  otherPlaceholder = "Escribe aquí",
}: {
  name: string;
  options: string[];
  placeholder: string;
  required?: boolean;
  /** Si el usuario elige este valor, el recuadro se vuelve un input de texto. */
  otherValue?: string;
  otherPlaceholder?: string;
}) {
  const ctx = useFormCtx();
  const initial = ctx.defaults[name] ?? "";
  // Opciones reales seleccionables del dropdown (sin contar "Otra").
  const realOptions = otherValue
    ? options.filter((o) => o !== otherValue)
    : options;
  // Modo libre si el valor restaurado NO está en las opciones reales
  // (ej: una ciudad escrita a mano que se guardó en un borrador).
  const [custom, setCustom] = useState(
    initial !== "" && !realOptions.includes(initial),
  );
  const [value, setValue] = useState(custom ? "" : initial);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const hiddenRef = useRef<HTMLInputElement>(null);
  const customRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  // Escribe en valuesRef (sin un input real) usando el onChange del contexto.
  const writeValue = (v: string) => {
    ctx.onChange({
      target: { name, value: v, type: "text" },
    } as unknown as ChangeEvent<HTMLInputElement>);
  };

  const select = (opt: string) => {
    setOpen(false);
    // Si eligen "Otra", el recuadro se transforma en input de texto libre.
    if (otherValue !== undefined && opt === otherValue) {
      setCustom(true);
      setValue("");
      writeValue(""); // limpiar para que escriban desde cero
      requestAnimationFrame(() => customRef.current?.focus());
      return;
    }
    setValue(opt);
    const input = hiddenRef.current;
    if (input) {
      input.value = opt;
      ctx.onChange({ target: input } as ChangeEvent<HTMLInputElement>);
    }
  };

  const backToList = () => {
    setCustom(false);
    setValue("");
    writeValue("");
    setOpen(true);
  };

  // ---- Modo texto libre: el recuadro ES el input ----
  if (custom) {
    return (
      <div ref={ref} className="relative">
        <input
          ref={customRef}
          name={name}
          type="text"
          required={required}
          defaultValue={
            initial !== "" && !realOptions.includes(initial) ? initial : ""
          }
          maxLength={100}
          placeholder={otherPlaceholder}
          onChange={ctx.onChange}
          className={cn(inputCls, "pr-14")}
        />
        {otherValue && (
          <button
            type="button"
            onClick={backToList}
            aria-label="Ver lista de opciones"
            title="Ver lista de opciones"
            className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg border-2 border-[var(--color-ink)] bg-[var(--color-bg-soft)] text-[var(--color-ink)] transition-colors hover:bg-[var(--color-bg-sky)]"
          >
            <List size={16} />
          </button>
        )}
      </div>
    );
  }

  // ---- Modo dropdown ----
  return (
    <div ref={ref} className="relative">
      {/* Input real: lo ven captura/submit/validación del form */}
      <input
        ref={hiddenRef}
        type="text"
        name={name}
        required={required}
        defaultValue={value}
        readOnly
        tabIndex={-1}
        aria-hidden
        className="sr-only"
        onFocus={(e) => {
          // Si la validación hace .focus() (campo vacío), abrimos el dropdown.
          e.currentTarget.blur();
          setOpen(true);
        }}
      />
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={cn(inputCls, "flex cursor-pointer items-center justify-between pr-11 text-left")}
      >
        <span className={cn(!value && "text-[var(--color-fg-subtle)]")}>
          {value || placeholder}
        </span>
        <ChevronDown
          size={18}
          className={cn(
            "absolute right-4 text-[var(--color-ink)] transition-transform",
            open && "rotate-180",
          )}
        />
      </button>

      {open && (
        <ul
          role="listbox"
          className="scrollbar-hidden absolute left-0 right-0 z-30 mt-2 max-h-64 overflow-auto rounded-xl border-2 border-[var(--color-ink)] bg-white shadow-[5px_5px_0_var(--color-ink)]"
        >
          {options.map((opt) => {
            const active = opt === value;
            return (
              <li key={opt} role="option" aria-selected={active}>
                <button
                  type="button"
                  onClick={() => select(opt)}
                  className={cn(
                    "flex w-full items-center justify-between px-4 py-3 text-left text-[15px] font-medium transition-colors",
                    active
                      ? "bg-[var(--color-bg-teal)] text-[var(--color-ink)]"
                      : "text-[var(--color-fg-muted)] hover:bg-[var(--color-bg-soft)] hover:text-[var(--color-ink)]",
                  )}
                >
                  {opt}
                  {active && <Check size={16} strokeWidth={3} className="shrink-0" />}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

// ============================================================
// Componente principal
// ============================================================

export function ApplicationForm() {
  const [role, setRole] = useState<Role>("aspirante");
  const [step, setStep] = useState(1);

  // Preselección de rol vía query (?rol=empresa) — deep-link desde /empresas.
  // Se sincroniza tras montar (no en el init) para que el HTML del server y la
  // primera render del cliente coincidan y no haya hydration mismatch. Usamos
  // window (no useSearchParams) para no requerir un Suspense boundary.
  useEffect(() => {
    const rol = new URLSearchParams(window.location.search).get("rol");
    // eslint-disable-next-line react-hooks/set-state-in-effect -- sync URL→estado al montar
    if (rol === "empresa") setRole("empresa");
  }, []);

  const [direction, setDirection] = useState<Direction>("forward");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  // Nombre de la empresa capturado al enviar, para la pantalla de éxito.
  // No se lee valuesRef.current directamente en el render (son refs).
  const [successEmpresa, setSuccessEmpresa] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [cvFileName, setCvFileName] = useState<string | null>(null);

  // ---- Diagnóstico IA (solo empresas, paso 3) ----
  const [diagnostico, setDiagnosis] = useState<DiagnosisState>({
    status: "loading",
  });
  // Cuántas veces regeneró. Tope de 2 para no quemar llamadas al modelo.
  const [regens, setRegens] = useState(0);
  const MAX_REGENS = 2;
  // Aborta la petición anterior si el usuario regenera antes de que llegue.
  const diagAbortRef = useRef<AbortController | null>(null);

  // Borrador detectado al montar (banner "Tienes un borrador guardado").
  const [draftPrompt, setDraftPrompt] = useState<FormDraft | null>(null);
  // Nombre del CV que tenía un borrador restaurado — recordatorio de re-subir.
  const [cvReminderName, setCvReminderName] = useState<string | null>(null);

  const formRef = useRef<HTMLFormElement>(null);
  const cvInputRef = useRef<HTMLInputElement>(null);
  // Guardamos el File object aparte. El input se desmonta al cambiar de paso
  // y los browsers no permiten re-asignar files vía JS, así que el ref del
  // input pierde el archivo. Este ref persiste entre transiciones.
  const cvFileRef = useRef<File | null>(null);

  /**
   * Persistencia de valores entre transiciones de paso:
   *   - valuesRef: source of truth, escrita en cada onChange (sin re-render)
   *   - defaults: snapshot del ref pasado al Context, actualizado SOLO en
   *     transiciones (para que el remount de un panel lea valores frescos
   *     vía defaultValue/defaultChecked).
   * Sin esto, AnimatePresence desmonta paneles y los datos se perderían
   * (FormData solo captura lo del DOM actual).
   */
  const valuesRef = useRef<Record<string, string>>({});
  const [defaults, setDefaults] = useState<Record<string, string>>({});

  // stepRef mirrors `step` para que handleSubmit pueda chequear el valor
  // real sin closures rancios. Se actualiza en useEffect (no en render).
  const stepRef = useRef(step);
  useEffect(() => {
    stepRef.current = step;
  }, [step]);

  // Lock para evitar que un submit rebote justo después de un cambio
  // de paso (cuando el botón "Continuar" se transforma en "Enviar" en
  // la misma posición DOM y un doble-click cae en el segundo).
  const lastTransitionAtRef = useRef(0);
  const TRANSITION_LOCK_MS = 600;

  // ---- Persistencia de borrador (localStorage) ----

  const draftTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Al montar: si hay un borrador válido (< 48h) lo ofrecemos vía banner.
  // setState-in-effect es intencional acá: leer localStorage solo es seguro
  // en cliente (no SSR), y hacerlo en effect evita hydration mismatch.
  useEffect(() => {
    const d = loadDraft();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (d) setDraftPrompt(d);
    return () => {
      if (draftTimerRef.current) clearTimeout(draftTimerRef.current);
    };
  }, []);

  // Guarda el borrador con debounce (evita escribir en cada keystroke).
  const persistDraftDebounced = () => {
    if (draftTimerRef.current) clearTimeout(draftTimerRef.current);
    draftTimerRef.current = setTimeout(() => {
      saveDraft({ role, values: valuesRef.current, cvFileName });
    }, 600);
  };

  // ---- Captura de inputs del panel actual ----

  const captureCurrentPanel = () => {
    const panel = formRef.current?.querySelector<HTMLElement>(
      "[data-active-panel]",
    );
    if (!panel) return;
    const inputs = panel.querySelectorAll<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >("input[name], select[name], textarea[name]");
    for (const el of Array.from(inputs)) {
      if (el instanceof HTMLInputElement && el.type === "file") continue;
      if (el instanceof HTMLInputElement && el.type === "radio") {
        if (el.checked) valuesRef.current[el.name] = el.value;
        continue;
      }
      valuesRef.current[el.name] = el.value;
    }
    setDefaults({ ...valuesRef.current });
    persistDraftDebounced();
  };

  // Handler global de cambios (registra en valuesRef sin re-render)
  const handleFieldChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const el = e.target;
    if (el instanceof HTMLInputElement && el.type === "file") return;
    if (el instanceof HTMLInputElement && el.type === "radio") {
      if (el.checked) valuesRef.current[el.name] = el.value;
      persistDraftDebounced();
      return;
    }
    valuesRef.current[el.name] = el.value;
    persistDraftDebounced();
  };

  /**
   * Pide el diagnóstico al endpoint. No lanza nunca: cualquier fallo cae al
   * fallback local para que el usuario pueda seguir y enviar su postulación.
   * Guarda el resultado en valuesRef (no en el DOM) porque el panel se
   * desmonta al cambiar de paso.
   */
  const requestDiagnosis = async () => {
    diagAbortRef.current?.abort();
    const ctrl = new AbortController();
    diagAbortRef.current = ctrl;

    setDiagnosis({ status: "loading" });
    // Al pedir un diagnóstico nuevo, la opción elegida antes ya no
    // corresponde a estas opciones: hay que borrarla de valuesRef Y del
    // snapshot `defaults`, o los radios se remontan con la vieja marcada.
    delete valuesRef.current.opcion_elegida;
    setDefaults((d) => {
      const next = { ...d };
      delete next.opcion_elegida;
      return next;
    });

    const v = valuesRef.current;
    const area = normalizeArea(v.area);

    // Deadline propio del cliente: si el fetch se cuelga (handoff móvil,
    // portal cautivo, pestaña en background) nada del lado del servidor
    // puede rescatarnos, así que abortamos nosotros. `timedOut` distingue
    // ese abort del abort intencional que dispara handleRegenerate.
    let timedOut = false;
    const timer = setTimeout(() => {
      timedOut = true;
      ctrl.abort();
    }, CLIENT_TIMEOUT_MS);

    try {
      const res = await fetch("/api/diagnostico", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: ctrl.signal,
        body: JSON.stringify({
          empresa: v.empresa ?? "",
          area,
          area_otro: v.area_otro ?? "",
          reto: v.reto ?? "",
        }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      // `fuente` no forma parte del schema que valida isDiagnosis: se lee
      // antes de la guarda para no depender del tipo ya angostado a
      // Diagnosis (que no tiene esa propiedad).
      const fuente = json.fuente === "ia" ? "ia" : "fallback";
      // Un 200 con forma inesperada (proxy, CDN, cambio futuro de la ruta)
      // no puede tumbar el formulario: lo tratamos como fallo y caemos al
      // fallback local.
       const normalized = normalizeDiagnosis(json);
       if (!normalized) throw new Error("Respuesta con forma inválida");
       clearTimeout(timer);
       const data = normalized;
      valuesRef.current.diagnostico_json = JSON.stringify(data);
      valuesRef.current.diagnostico_fuente = fuente;
      setDiagnosis({ status: "ready", data, fuente });
    } catch (err) {
      clearTimeout(timer);
      // Un abort del usuario (pidió regenerar) no debe pisar el estado: ya
      // hay otra petición en curso. Un abort por timeout sí, porque no viene
      // nada más.
      if (ctrl.signal.aborted && !timedOut) return;
      console.error("Error pidiendo diagnóstico:", err);
      const fb = fallbackFor(area);
      valuesRef.current.diagnostico_json = JSON.stringify(fb);
      valuesRef.current.diagnostico_fuente = "fallback";
      setDiagnosis({ status: "ready", data: fb, fuente: "fallback" });
    }
  };

  const handleRegenerate = () => {
    if (regens >= MAX_REGENS) return;
    setRegens((n) => n + 1);
    void requestDiagnosis();
  };

  const steps = useMemo(
    () => (role === "aspirante" ? ASPIRANTE_STEPS : EMPRESA_STEPS),
    [role],
  );

  // ---- Navegación ----

  const goTo = (next: number, dir: Direction) => {
    if (next < 1 || next > steps.length) return;
    // ANTES de cambiar de paso, capturar valores del panel actual
    captureCurrentPanel();
    // Entrando al paso de diagnóstico desde el reto → pedirlo.
    // Va acá (y no en handleNext) para cubrir también el submit accidental
    // y el Enter, que también navegan vía goTo. La guarda depende solo del
    // destino y la dirección (parámetros de goTo), nunca del `step`
    // cerrado sobre el closure, que puede quedar desactualizado.
    if (role === "empresa" && next === 3 && dir === "forward") {
      setRegens(0);
      void requestDiagnosis();
    }
    lastTransitionAtRef.current = Date.now();
    setDirection(dir);
    setStep(next);
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const changeRole = (r: Role) => {
    if (r === role) return;
    setRole(r);
    setStep(1);
    setDirection("forward");
    setSuccess(false);
    setSuccessEmpresa(null);
    setErrorMsg(null);
    setCvFileName(null);
    cvFileRef.current = null;
    setCvReminderName(null);
    valuesRef.current = {};
    setDefaults({}); // limpia el snapshot también
    diagAbortRef.current?.abort();
    setDiagnosis({ status: "loading" });
    setRegens(0);
  };

  // ---- Borrador: restaurar / descartar ----

  const restoreDraft = () => {
    if (!draftPrompt) return;
    valuesRef.current = { ...draftPrompt.values };
    setDefaults({ ...draftPrompt.values });
    setRole(draftPrompt.role);
    setStep(1); // siempre arranca en paso 1
    setDirection("forward");
    // El CV no se puede restaurar (File no serializable) → recordatorio.
    setCvReminderName(draftPrompt.cvFileName);
    setCvFileName(null);
    cvFileRef.current = null;
    setDraftPrompt(null);
  };

  const discardDraft = () => {
    clearDraft();
    setDraftPrompt(null);
  };

  // ---- Validación por paso (lee el DOM del form actual) ----

  const validateCurrentPanel = (): boolean => {
    const form = formRef.current;
    if (!form) return true;
    const panel = form.querySelector<HTMLElement>("[data-active-panel]");
    if (!panel) return true;

    // El paso de diagnóstico no se puede pasar mientras el modelo responde:
    // todavía no hay opciones que elegir.
    if (role === "empresa" && step === 3 && diagnostico.status === "loading") {
      setErrorMsg("Dale un segundo, todavía estamos leyendo tu reto.");
      return false;
    }

    // 1) Validar campos requeridos vacíos + formatos de los campos requeridos
    const required = panel.querySelectorAll<HTMLElement>("[required]");
    const validatedRadioGroups = new Set<string>();

    for (const el of Array.from(required)) {
      if (el instanceof HTMLInputElement && el.type === "radio") {
        if (validatedRadioGroups.has(el.name)) continue;
        validatedRadioGroups.add(el.name);

        const group = panel.querySelectorAll<HTMLInputElement>(
          `input[name="${el.name}"]`,
        );
        const checkedRadio = Array.from(group).find((r) => r.checked);
        if (!checkedRadio) {
          setErrorMsg("Por favor selecciona una opción antes de continuar.");
          return false;
        }
        if (
          checkedRadio.value === "otro" ||
          checkedRadio.value === "referido"
        ) {
          // Buscar primero en el mismo label (patrón legacy inline input)
          let related: HTMLInputElement | HTMLTextAreaElement | null =
            checkedRadio
              .closest("label")
              ?.querySelector<HTMLInputElement>('input[type="text"]') ?? null;

          // Si no está en el label, buscar textarea/input hermano con el
          // nombre patrón {name}_otro o {name}_referido (patrón expandido).
          if (!related) {
            const suffix =
              checkedRadio.value === "otro" ? "_otro" : "_referido";
            related = panel.querySelector<HTMLTextAreaElement>(
              `textarea[name="${checkedRadio.name}${suffix}"]`,
            );
            if (!related) {
              related = panel.querySelector<HTMLInputElement>(
                `input[type="text"][name="${checkedRadio.name}${suffix}"]`,
              );
            }
          }

          if (related && !related.value.trim()) {
            related.focus();
            setErrorMsg(
              "Especifica la opción seleccionada antes de continuar.",
            );
            return false;
          }
          // Validación de longitud mínima para el textarea de motivación
          if (
            related instanceof HTMLTextAreaElement &&
            related.value.trim().length < 20
          ) {
            related.focus();
            setErrorMsg(
              "Cuéntanos un poco más (mínimo 20 caracteres). Tu motivación es lo más importante para nosotros.",
            );
            return false;
          }
        }
      } else if (el instanceof HTMLInputElement && el.type === "file") {
        // El input se desmonta al navegar, así que también aceptamos el ref.
        const hasFile =
          (el.files && el.files.length > 0) || cvFileRef.current !== null;
        if (!hasFile) {
          setErrorMsg("Por favor adjunta tu hoja de vida.");
          return false;
        }
      } else if (
        el instanceof HTMLInputElement ||
        el instanceof HTMLSelectElement ||
        el instanceof HTMLTextAreaElement
      ) {
        const value = el.value.trim();
        if (!value) {
          el.focus();
          const label = fieldLabels[el.name] ?? "este campo";
          setErrorMsg(`Por favor completa ${label}.`);
          return false;
        }
        // Validación de formato (si hay validador para este name)
        const validator = validators[el.name];
        if (validator) {
          const err = validator(value);
          if (err) {
            el.focus();
            setErrorMsg(err);
            return false;
          }
        }
      }
    }

    // 2) Validar formato de campos OPCIONALES que SÍ tienen valor
    //    (ej: "carrera" opcional pero si la escriben mal, avisar)
    const allInputs = panel.querySelectorAll<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >("input[name], select[name], textarea[name]");
    for (const el of Array.from(allInputs)) {
      if (el.hasAttribute("required")) continue; // ya validado arriba
      if (el instanceof HTMLInputElement && el.type === "radio") continue;
      if (el instanceof HTMLInputElement && el.type === "file") continue;
      const value = el.value.trim();
      if (!value) continue;
      const validator = validators[el.name];
      if (validator) {
        const err = validator(value);
        if (err) {
          el.focus();
          setErrorMsg(err);
          return false;
        }
      }
    }

    setErrorMsg(null);
    return true;
  };

  const handleNext = () => {
    if (!validateCurrentPanel()) return;
    goTo(step + 1, "forward");
  };

  const handleBack = () => goTo(step - 1, "back");

  // ---- File upload feedback ----

  const onCvChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    // Si no hay file (usuario canceló el picker), NO limpiamos el ref —
    // mantenemos el CV previo. Solo asignamos cuando hay archivo nuevo.
    if (!file) return;
    cvFileRef.current = file;
    setCvFileName(file.name);
    setCvReminderName(null); // ya re-adjuntó, ocultar recordatorio
  };

  // ---- Submit a Firebase ----

  /**
   * Bloquea el Enter key en pasos intermedios.
   * Evita submits accidentales cuando el usuario escribe en un input
   * y presiona Enter (default behavior del form).
   */
  const handleKeyDown = (e: ReactKeyboardEvent<HTMLFormElement>) => {
    if (e.key !== "Enter") return;
    // Permitir Enter en textarea (saltos de línea naturales)
    if (e.target instanceof HTMLTextAreaElement) return;
    // En pasos intermedios: bloquear submit, avanzar paso
    if (step < steps.length) {
      e.preventDefault();
      handleNext();
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Defensa 1: si acabamos de cambiar de paso (en los últimos ~600ms),
    // ignorar el submit. Esto evita que un doble-click o el rebote del
    // click sobre "Continuar" caiga sobre el botón submit recién renderizado.
    if (Date.now() - lastTransitionAtRef.current < TRANSITION_LOCK_MS) {
      return;
    }

    // Defensa 2: usar stepRef (sincrono) en vez del `step` cerrado.
    if (stepRef.current < steps.length) {
      goTo(stepRef.current + 1, "forward");
      return;
    }
    if (!validateCurrentPanel()) return;

    setSubmitting(true);
    setErrorMsg(null);

    try {
      // Captura final del panel actual (paso 3) antes de armar payload
      captureCurrentPanel();

      // Usamos valuesRef, NO FormData — porque AnimatePresence desmonta
      // los paneles anteriores y FormData solo vería el último.
      const data: Record<string, unknown> = { ...valuesRef.current };

      // El campo ciudad ya viene limpio: en modo "Otra" el recuadro se
      // convierte en input de texto y escribe directo sobre `ciudad`.
      // (Por compat con borradores viejos, descartamos ciudad_otro si existe.)
      delete data.ciudad_otro;

      // Teléfonos: guardar solo dígitos (el input los muestra formateados).
      for (const k of ["whatsapp", "telefono"]) {
        if (typeof data[k] === "string") {
          data[k] = (data[k] as string).replace(/\D/g, "");
        }
      }

      // El diagnóstico viaja como string JSON en valuesRef (el formulario
      // solo maneja strings, y así el borrador de localStorage sigue siendo
      // serializable). Acá lo volvemos objeto para Firestore.
      if (role === "empresa") {
        const rawDiag = data.diagnostico_json;
        delete data.diagnostico_json;
        try {
          const parsed =
            typeof rawDiag === "string" && rawDiag ? JSON.parse(rawDiag) : null;
           data.diagnostico = normalizeDiagnosis(parsed);
        } catch {
          data.diagnostico = null;
        }
        data.diagnostico_fuente = data.diagnostico ? (data.diagnostico_fuente ?? null) : null;
        // El índice solo es válido si hay diagnóstico Y cae dentro de sus
        // opciones reales: sin diagnóstico, un `opcion_elegida` numérico
        // sería un índice apuntando a nada.
        const idx = Number(data.opcion_elegida);
        const diag = data.diagnostico as Diagnosis | null;
        data.opcion_elegida =
          diag && Number.isInteger(idx) && idx >= 0 && idx < diag.opciones.length
            ? idx
            : null;
      }

      if (role === "aspirante") {
        // Subir CV a Cloudinary. Usamos cvFileRef (no cvInputRef.files) porque
        // el input se desmonta al navegar de paso y el File se perdería.
        const cvFile = cvFileRef.current ?? cvInputRef.current?.files?.[0];
        if (cvFile) {
          const upload = await uploadCvToCloudinary(cvFile);
          // Solo guardamos los campos que Cloudinary devolvió definidos.
          // Firestore RECHAZA valores undefined (sí acepta null).
          if (upload.secureUrl) data.cvUrl = upload.secureUrl;
          if (upload.publicId) data.cvPublicId = upload.publicId;
          if (upload.resourceType) data.cvResourceType = upload.resourceType;
          if (upload.format) data.cvFormat = upload.format;
          if (typeof upload.bytes === "number") data.cvBytes = upload.bytes;
          data.cvFilename = cvFile.name;
        }
      }

      // Limpieza final: nunca enviar undefined a Firestore.
      const cleanData = Object.fromEntries(
        Object.entries(data).filter(([, v]) => v !== undefined),
      );

      const payload = {
        ...cleanData,
        createdAt: serverTimestamp(),
        source: "web-postular",
        status: "pending" as const,
      };

      const collectionName = role === "aspirante" ? "aspirantes" : "empresas";
      await addDoc(collection(db, collectionName), payload);

      // Postulación enviada con éxito → limpiar borrador persistido.
      clearDraft();
      setCvReminderName(null);
      setSuccessEmpresa(role === "empresa" ? valuesRef.current.empresa ?? null : null);
      setSuccess(true);
    } catch (err) {
      // Log técnico completo para diagnosticar en producción...
      console.error("Error guardando postulación:", err);
      // ...pero al usuario le mostramos un mensaje claro y accionable.
      setErrorMsg(friendlySubmitError(err));
    } finally {
      setSubmitting(false);
    }
  };

  // ============================================================
  // Render: estado de éxito
  // ============================================================

  if (success) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.55, ease: EASE }}
        className="toon-card relative mx-auto max-w-2xl overflow-hidden p-10 text-center sm:p-12"
      >
        {/* Confetti-ish dots de fondo */}
        <motion.span
          className="pointer-events-none absolute -top-8 -left-6 h-20 w-20 rounded-full bg-[var(--color-bg-sky)] opacity-60"
          animate={{ y: [0, -10, 0], rotate: [0, 6, 0] }}
          transition={{ duration: 5.2, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.span
          className="pointer-events-none absolute -bottom-6 -right-4 h-16 w-16 rounded-full bg-[var(--color-bg-teal)] opacity-60"
          animate={{ y: [0, 8, 0], rotate: [0, -8, 0] }}
          transition={{ duration: 6.4, repeat: Infinity, ease: "easeInOut", delay: 0.6 }}
        />

        <motion.div
          initial={{ scale: 0, rotate: -90 }}
          animate={{ scale: 1, rotate: -5 }}
          transition={{ type: "spring", stiffness: 220, damping: 14, delay: 0.1 }}
          className="relative mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full border-2 border-[var(--color-ink)] bg-[var(--color-accent)] text-white shadow-[6px_6px_0_var(--color-ink)]"
        >
          <Check size={36} strokeWidth={3.5} />
        </motion.div>
        <motion.h2
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: EASE, delay: 0.25 }}
          className="relative font-display text-3xl font-bold leading-tight tracking-tight text-[var(--color-heading)]"
        >
          ¡Gracias por <Hand>escribirnos</Hand>!
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: EASE, delay: 0.35 }}
          className="relative mx-auto mt-3 max-w-md text-[15px] text-[var(--color-fg-muted)]"
        >
          {role === "aspirante"
            ? "Recibimos tu postulación. Si haces match con el batch, te contactamos pronto."
            : "Un mentor Senior de CooWeb ya tiene tu diagnóstico y te contacta en las próximas 24-48 horas hábiles. Acompañamos todo el proceso, de principio a fin."}
        </motion.p>

        {role === "empresa" && HAS_COOWEB_WHATSAPP && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: EASE, delay: 0.4 }}
            className="relative mt-6"
          >
            <a
              href={`https://wa.me/${COOWEB_WHATSAPP}?text=${encodeURIComponent(
                `Hola, acabo de enviar el diagnóstico de ${
                  successEmpresa ?? "mi empresa"
                } desde la web.`,
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="toon-btn toon-btn--white inline-flex"
            >
              <MessageCircle size={16} />
              Hablar con un Senior ahora
            </a>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: EASE, delay: 0.45 }}
          className="relative"
        >
          <Magnetic strength={0.25}>
            <button
              type="button"
              onClick={() => {
                setSuccess(false);
                setSuccessEmpresa(null);
                setStep(1);
                setCvFileName(null);
                cvFileRef.current = null;
                valuesRef.current = {};
                setDefaults({});
                formRef.current?.reset();
              }}
              className="toon-btn mt-8"
              style={{ background: "var(--color-accent-soft)" }}
            >
              Enviar otra postulación
              <ArrowRight size={16} />
            </button>
          </Magnetic>
        </motion.div>
      </motion.div>
    );
  }

  // ============================================================
  // Render principal
  // ============================================================

  return (
    <div className="mx-auto w-full max-w-2xl">
      {/* Banner de borrador guardado.
          Sin overflow-hidden ni animación de height: eso recortaba la
          sombra offset de la caja. Solo fade + slide. El padding-bottom/right
          del contenedor deja aire para que la sombra nunca se corte. */}
      <AnimatePresence>
        {draftPrompt && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.35, ease: EASE }}
            className="mb-6 pr-1 pb-1"
          >
            <div className="flex flex-col gap-3 rounded-2xl border-2 border-[var(--color-ink)] bg-[var(--color-bg-sky)] p-4 shadow-[4px_4px_0_var(--color-ink)] sm:flex-row sm:items-center">
              {/* Icono + texto */}
              <div className="flex min-w-0 flex-1 items-center gap-3">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border-2 border-[var(--color-ink)] bg-white">
                  <History size={18} />
                </div>
                <div className="min-w-0">
                  <div className="font-display text-sm font-bold text-[var(--color-ink)]">
                    Tienes un borrador guardado
                  </div>
                  <div className="text-xs text-[var(--color-ink)]/70">
                    Lo guardamos {draftAge(draftPrompt.savedAt)} ·{" "}
                    {draftPrompt.role === "aspirante" ? "Aspirante" : "Empresa"}
                    {draftPrompt.cvFileName
                      ? " · vuelve a adjuntar el CV"
                      : ""}
                  </div>
                </div>
              </div>
              {/* Acciones */}
              <div className="flex flex-shrink-0 items-center gap-2">
                <button
                  type="button"
                  onClick={restoreDraft}
                  className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-full border-2 border-[var(--color-ink)] bg-[var(--color-accent)] px-4 py-2 font-display text-xs font-bold text-white shadow-[2px_2px_0_var(--color-ink)] transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[3px_3px_0_var(--color-ink)] sm:flex-none"
                >
                  Continuar
                </button>
                <button
                  type="button"
                  onClick={discardDraft}
                  aria-label="Descartar borrador"
                  className="inline-flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full border-2 border-[var(--color-ink)] bg-white text-[var(--color-ink)] transition-transform hover:-translate-y-0.5"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <RoleSelector role={role} onChange={changeRole} />

      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: EASE, delay: 0.1 }}
        className="toon-card relative p-7 sm:p-10"
      >
        {/* Sticker decorativo con floater */}
        <AnimatePresence mode="wait">
          <motion.div
            key={role}
            initial={{ opacity: 0, scale: 0.6, rotate: 14 }}
            animate={{
              opacity: 1,
              scale: 1,
              rotate: [4, 7, 4],
              y: [0, -4, 0],
            }}
            exit={{ opacity: 0, scale: 0.6, rotate: -8 }}
            transition={{
              opacity: { duration: 0.3 },
              scale: { type: "spring", stiffness: 280, damping: 14 },
              rotate: { duration: 5, repeat: Infinity, ease: "easeInOut" },
              y: { duration: 5, repeat: Infinity, ease: "easeInOut" },
            }}
            className="absolute -top-4 right-6 inline-flex items-center gap-1 rounded-full border-2 border-[var(--color-ink)] px-3 py-1 font-display text-[11px] font-bold uppercase tracking-wider shadow-[3px_3px_0_var(--color-ink)]"
            style={{
              background:
                role === "aspirante" ? "var(--color-accent)" : "var(--color-bg-sky)",
              color: role === "aspirante" ? "#fff" : "var(--color-ink)",
            }}
          >
            {role === "aspirante" ? "¡Gratis!" : "+48h respuesta"}
          </motion.div>
        </AnimatePresence>

        <FormCtx.Provider
          value={{
            defaults,
            onChange: handleFieldChange,
          }}
        >
        <form
          ref={formRef}
          onSubmit={handleSubmit}
          onKeyDown={handleKeyDown}
          noValidate
        >
          <Stepper steps={steps} current={step} />

          <PanelMotion step={`${role}-${step}` as unknown as number} direction={direction}>
            <div data-active-panel="">
              {role === "aspirante" && step === 1 && <AspiranteStep1 />}
              {role === "aspirante" && step === 2 && (
                <AspiranteStep2
                  cvFileName={cvFileName}
                  onCvChange={onCvChange}
                  cvInputRef={cvInputRef}
                  cvReminderName={cvReminderName}
                />
              )}
              {role === "aspirante" && step === 3 && <AspiranteStep3 />}

              {role === "empresa" && step === 1 && <EmpresaStep1 />}
              {role === "empresa" && step === 2 && <EmpresaStep2 />}
              {role === "empresa" && step === 3 && (
                <EmpresaStep3Diagnosis
                  state={diagnostico}
                  generation={regens}
                  canRegenerate={
                    regens < MAX_REGENS && diagnostico.status === "ready"
                  }
                  onRegenerate={handleRegenerate}
                />
              )}
              {role === "empresa" && step === 4 && <EmpresaStep4 />}
            </div>
          </PanelMotion>

          {/* Mensaje de error con AnimatePresence */}
          <AnimatePresence>
            {errorMsg && (
              <motion.div
                key="err"
                initial={{ opacity: 0, height: 0, marginTop: 0 }}
                animate={{ opacity: 1, height: "auto", marginTop: 20 }}
                exit={{ opacity: 0, height: 0, marginTop: 0 }}
                transition={{ duration: 0.35, ease: EASE }}
                className="overflow-hidden"
              >
                <motion.div
                  initial={{ x: 0 }}
                  animate={{ x: [0, -6, 6, -4, 4, 0] }}
                  transition={{ duration: 0.5, ease: EASE }}
                  className="rounded-xl border-2 border-red-500 bg-red-50 px-4 py-3 text-sm font-medium text-red-700 shadow-[3px_3px_0_#ef4444]"
                >
                  {errorMsg}
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navegación.
              Móvil: stack vertical full-width, acción principal arriba
              (col-reverse). Desktop: fila — Atrás a la izquierda, principal
              a la derecha. */}
          <div className="mt-8 flex flex-col-reverse gap-3 border-t-2 border-dashed border-[var(--color-bg-soft)] pt-6 sm:flex-row sm:items-center">
            {step > 1 && (
              <button
                type="button"
                onClick={handleBack}
                disabled={submitting}
                className="toon-btn toon-btn--white w-full justify-center disabled:opacity-50 sm:w-auto"
              >
                <ArrowLeft size={16} />
                Atrás
              </button>
            )}

            {step < steps.length ? (
              <button
                key="btn-next"
                type="button"
                onClick={handleNext}
                className="toon-btn w-full justify-center sm:ml-auto sm:w-auto"
                style={{ background: "var(--color-ink)", color: "#fff" }}
              >
                Continuar
                <motion.span
                  animate={{ x: [0, 3, 0] }}
                  transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
                  className="inline-flex"
                >
                  <ArrowRight size={16} />
                </motion.span>
              </button>
            ) : (
              <button
                key="btn-submit"
                type="submit"
                disabled={submitting}
                className="toon-btn w-full justify-center disabled:cursor-not-allowed disabled:opacity-60 sm:ml-auto sm:w-auto"
                style={{ background: "var(--color-ink)", color: "#fff" }}
              >
                {submitting ? (
                  <>
                    <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Enviando...
                  </>
                ) : (
                  <>
                    {role === "aspirante" ? "Enviar postulación" : "Enviar solicitud"}
                    <motion.span
                      animate={{ rotate: [0, -8, 0, 8, 0] }}
                      transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
                      className="inline-flex"
                    >
                      <Send size={16} />
                    </motion.span>
                  </>
                )}
              </button>
            )}
          </div>

          {step === steps.length && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.4 }}
              className="mt-4 text-center text-xs text-[var(--color-fg-subtle)]"
            >
              {role === "aspirante"
                ? "Al enviar aceptas el tratamiento de datos según nuestra política de privacidad."
                : "Te contactaremos en menos de 48 horas para coordinar una llamada."}
            </motion.p>
          )}
        </form>
        </FormCtx.Provider>
      </motion.div>
    </div>
  );
}

// ============================================================
// Paneles (separados para legibilidad)
// ============================================================

function AspiranteStep1() {
  const ctx = useFormCtx();
  return (
    <>
      <PanelHeader
        title="Hola, ¿quién eres?"
        desc={
          <>
            Cuéntanos cómo contactarte <Hand>cuando te aceptemos</Hand>.
          </>
        }
      />
      <Field>
        <label className={labelCls}>
          Nombre completo<span className="ml-0.5 text-[var(--color-accent-strong)]">*</span>
        </label>
        <input
          {...textProps("nombre", ctx)}
          type="text"
          required
          autoComplete="name"
          inputMode="text"
          maxLength={100}
          placeholder="Ej: María Fernanda López"
          className={inputCls}
        />
      </Field>

      <Field>
        <label className={labelCls}>
          Ciudad<span className="ml-0.5 text-[var(--color-accent-strong)]">*</span>
        </label>
        <SelectField
          name="ciudad"
          required
          placeholder="Selecciona tu ciudad"
          otherValue="Otra"
          otherPlaceholder="Escribe tu ciudad"
          options={[
            "Barranquilla",
            "Bogotá",
            "Medellín",
            "Cali",
            "Cartagena",
            "Santa Marta",
            "Bucaramanga",
            "Otra",
          ]}
        />
      </Field>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field>
          <label className={labelCls}>
            WhatsApp<span className="ml-0.5 text-[var(--color-accent-strong)]">*</span>
          </label>
          <input
            {...phoneProps("whatsapp", ctx)}
            type="tel"
            required
            autoComplete="tel"
            inputMode="numeric"
            maxLength={18}
            placeholder="300 123 4567"
            className={inputCls}
          />
        </Field>
        <Field>
          <label className={labelCls}>
            Correo electrónico<span className="ml-0.5 text-[var(--color-accent-strong)]">*</span>
          </label>
          <input
            {...textProps("email", ctx)}
            type="email"
            required
            autoComplete="email"
            inputMode="email"
            maxLength={200}
            placeholder="tu@correo.com"
            className={inputCls}
          />
        </Field>
      </div>
    </>
  );
}

function AspiranteStep2({
  cvFileName,
  onCvChange,
  cvInputRef,
  cvReminderName,
}: {
  cvFileName: string | null;
  onCvChange: (e: ChangeEvent<HTMLInputElement>) => void;
  cvInputRef: React.RefObject<HTMLInputElement | null>;
  cvReminderName?: string | null;
}) {
  const ctx = useFormCtx();
  return (
    <>
      <PanelHeader
        title="Tu perfil académico"
        desc={
          <>
            Queremos conocer tu formación — <Hand>no te preocupes si recién empiezas</Hand>.
          </>
        }
      />

      <Field>
        <label className={labelCls}>
          ¿Actualmente estudias?<span className="ml-0.5 text-[var(--color-accent-strong)]">*</span>
        </label>
        <div className="flex flex-col gap-2.5">
          <Radio name="estudia" value="tecnico" label="Sí, técnico / tecnólogo" required />
          <Radio name="estudia" value="universitario" label="Sí, universitario" />
          <Radio name="estudia" value="no" label="No estudio actualmente" />
          <Radio
            name="estudia"
            value="otro"
            label="Otro"
            withOtherInput
            otherName="estudia_otro"
          />
        </div>
      </Field>

      <Field>
        <label className={labelCls}>¿Qué carrera o programa estudias?</label>
        <input
          {...textProps("carrera", ctx)}
          type="text"
          maxLength={150}
          placeholder="Si aplica"
          className={inputCls}
        />
      </Field>

      <Field>
        <label className={labelCls}>
          Tu Hoja de Vida<span className="ml-0.5 text-[var(--color-accent-strong)]">*</span>
        </label>
        <label
          htmlFor="cv-upload"
          className="flex cursor-pointer items-center gap-4 rounded-2xl border-[2.5px] border-dashed border-[var(--color-ink)] bg-[var(--color-bg-soft)] p-5 shadow-[3px_3px_0_var(--color-ink)] transition-all duration-200 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:bg-[var(--color-bg-sky)] hover:shadow-[5px_5px_0_var(--color-ink)]"
        >
          <div className="flex h-11 w-11 -rotate-[4deg] flex-shrink-0 items-center justify-center rounded-xl border-2 border-[var(--color-ink)] bg-white text-[var(--color-ink)] shadow-[3px_3px_0_var(--color-ink)]">
            <FileUp size={20} strokeWidth={2.2} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate font-display text-[15px] font-bold text-[var(--color-ink)]">
              {cvFileName ?? "Cargar CV (cualquier formato)"}
            </div>
            <div className="font-handwritten text-base font-semibold leading-tight text-[var(--color-accent-strong)]">
              ¡queremos conocer tu potencial!
            </div>
          </div>
          <input
            id="cv-upload"
            ref={cvInputRef}
            type="file"
            name="cv"
            onChange={onCvChange}
            required
            className="hidden"
          />
        </label>
        {cvReminderName && !cvFileName && (
          <span className="mt-2 block rounded-lg border-2 border-amber-400 bg-amber-50 px-3 py-2 text-[13px] font-medium text-amber-800">
            Tenías “{cvReminderName}” adjunto antes — por seguridad no podemos
            guardar archivos, vuelve a subirlo.
          </span>
        )}

        {/* Helper: crear CV con Salto AI */}
        <a
          href="https://salto-ai.vercel.app/auth?next=%2Fjoven%2Fchat&role=joven"
          target="_blank"
          rel="noopener noreferrer"
          className="group mt-3 flex items-center gap-3 rounded-xl border-2 border-[var(--color-ink)] bg-[var(--color-bg-teal)] p-3.5 shadow-[3px_3px_0_var(--color-ink)] transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[5px_5px_0_var(--color-ink)]"
        >
          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center overflow-hidden rounded-lg border-2 border-[var(--color-ink)] bg-white">
            <Image
              src="/img-salto-ia.png"
              alt="Salto AI"
              width={36}
              height={36}
              className="h-full w-full object-contain p-0.5"
            />
          </div>
          <div className="min-w-0 flex-1">
            <div className="font-display text-[13.5px] font-bold leading-tight text-[var(--color-ink)]">
              ¿Aún no tienes un CV?
            </div>
            <div className="text-[12.5px] leading-tight text-[var(--color-ink)]/75">
              Créalo gratis en minutos con Salto AI.
            </div>
          </div>
          <ExternalLink
            size={16}
            className="flex-shrink-0 text-[var(--color-ink)] transition-transform group-hover:translate-x-0.5"
          />
        </a>
      </Field>
    </>
  );
}

function AspiranteStep3() {
  const ctx = useFormCtx();

  return (
    <>
      <PanelHeader
        title="Tu motivación"
        desc={
          <>
            La parte <Hand>más importante</Hand> — cuéntanos en tus palabras por qué este programa, por qué ahora.
          </>
        }
      />

      <Field>
        <label className={labelCls}>
          ¿Qué te motiva a postular al Programa Semilla?
          <span className="ml-0.5 text-[var(--color-accent-strong)]">*</span>
        </label>
        <textarea
          {...textProps("interes", ctx)}
          placeholder="¿Qué buscas obtener? ¿En qué momento de tu vida estás? ¿Por qué CooWeb y no otro programa? Tomate el tiempo — esta respuesta es la que más leemos."
          required
          minLength={20}
          maxLength={1500}
          rows={6}
          className={cn(
            inputCls,
            "min-h-[180px] resize-y leading-relaxed",
          )}
        />
        <span className="mt-2 block text-[13px] text-[var(--color-fg-subtle)]">
          Mínimo 20 caracteres. No hay respuesta correcta — sé honesto/a.
        </span>
      </Field>

      <Field>
        <label className={labelCls}>
          ¿Cómo te enteraste de nosotros?<span className="ml-0.5 text-[var(--color-accent-strong)]">*</span>
        </label>
        <div className="flex flex-col gap-2.5">
          <Radio name="origen" value="feria" label="Feria de empleo / Evento" required />
          <Radio
            name="origen"
            value="redes"
            label="Redes sociales (Instagram, TikTok, LinkedIn)"
          />
          <Radio name="origen" value="web" label="Página web" />
          <Radio
            name="origen"
            value="referido"
            label="Me lo recomendó alguien"
            withOtherInput
            otherName="origen_referido"
            otherPlaceholder="¿Quién?"
          />
          <Radio
            name="origen"
            value="otro"
            label="Otro"
            withOtherInput
            otherName="origen_otro"
          />
        </div>
      </Field>
    </>
  );
}

function EmpresaStep1() {
  const ctx = useFormCtx();
  return (
    <>
      <PanelHeader
        title="Cuéntanos de tu empresa"
        desc={
          <>
            Datos de contacto para <Hand>coordinar una llamada</Hand>.
          </>
        }
      />

      <Field>
        <label className={labelCls}>
          <Building2 size={14} className="mr-1 inline align-text-bottom" />
          Nombre de la empresa o startup
          <span className="ml-0.5 text-[var(--color-accent-strong)]">*</span>
        </label>
        <input
          {...textProps("empresa", ctx)}
          type="text"
          required
          autoComplete="organization"
          maxLength={150}
          placeholder="Ej: Acme S.A.S."
          className={inputCls}
        />
      </Field>

      <Field>
        <label className={labelCls}>
          Persona de contacto y cargo
          <span className="ml-0.5 text-[var(--color-accent-strong)]">*</span>
        </label>
        <input
          {...textProps("contacto", ctx)}
          type="text"
          required
          autoComplete="name"
          maxLength={200}
          placeholder="Ej: Juan Pérez — CTO"
          className={inputCls}
        />
      </Field>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field>
          <label className={labelCls}>
            Correo corporativo
            <span className="ml-0.5 text-[var(--color-accent-strong)]">*</span>
          </label>
          <input
            {...textProps("email", ctx)}
            type="email"
            required
            autoComplete="email"
            inputMode="email"
            maxLength={200}
            placeholder="tu@empresa.com"
            className={inputCls}
          />
        </Field>
        <Field>
          <label className={labelCls}>
            Teléfono<span className="ml-0.5 text-[var(--color-accent-strong)]">*</span>
          </label>
          <input
            {...phoneProps("telefono", ctx)}
            type="tel"
            required
            autoComplete="tel"
            inputMode="numeric"
            maxLength={18}
            placeholder="300 123 4567"
            className={inputCls}
          />
        </Field>
      </div>
    </>
  );
}

function EmpresaStep2() {
  const ctx = useFormCtx();
  return (
    <>
      <PanelHeader
        title="¿Cuál es el reto?"
        desc={
          <>
            Cuéntanos qué problema <Hand>quieres resolver con IA</Hand>.
          </>
        }
      />

      <Field>
        <label className={labelCls}>
          ¿Qué área te gustaría potenciar?
          <span className="ml-0.5 text-[var(--color-accent-strong)]">*</span>
        </label>
        <div className="flex flex-col gap-2.5">
          <Radio name="area" value="cs" label="Servicio al cliente / Soporte" required />
          <Radio
            name="area"
            value="operaciones"
            label="Procesos internos / Operaciones"
          />
          <Radio name="area" value="datos" label="Análisis de datos / Reportes" />
          <Radio name="area" value="marketing" label="Marketing / Ventas" />
          <Radio
            name="area"
            value="otro"
            label="Otro"
            withOtherInput
            otherName="area_otro"
          />
        </div>
      </Field>

      <Field>
        <label className={labelCls}>
          Describe el reto interno
          <span className="ml-0.5 text-[var(--color-accent-strong)]">*</span>
        </label>
        <textarea
          {...textProps("reto", ctx)}
          required
          minLength={CHALLENGE_MIN}
          maxLength={CHALLENGE_MAX}
          placeholder="Ej: Pasamos mucho tiempo respondiendo preguntas frecuentes de clientes..."
          className={cn(inputCls, "min-h-[120px] resize-y leading-relaxed")}
        />
        <span className="mt-2 block text-[13px] text-[var(--color-fg-subtle)]">
          ¿Qué problema crees que podría resolverse con tecnología o IA? (mínimo 20 caracteres)
        </span>
      </Field>
    </>
  );
}

/**
 * Wrapper del paso de diagnóstico: vive acá (y no dentro del panel) porque
 * necesita `useFormCtx`, que es privado de este archivo. Le pasa al panel una
 * fábrica de props de radio ya conectada al contexto, para que la opción
 * elegida se persista entre pasos igual que cualquier otro campo.
 */
function EmpresaStep3Diagnosis({
  state,
  generation,
  canRegenerate,
  onRegenerate,
}: {
  state: DiagnosisState;
  generation: number;
  canRegenerate: boolean;
  onRegenerate: () => void;
}) {
  const ctx = useFormCtx();
  return (
    <DiagnosisPanel
      state={state}
      generation={generation}
      canRegenerate={canRegenerate}
      onRegenerate={onRegenerate}
      radioProps={(value) => radioProps("opcion_elegida", value, ctx)}
    />
  );
}

function EmpresaStep4() {
  return (
    <>
      <PanelHeader
        title="¿Cómo te sumas?"
        desc={
          <>
            Elige <Hand>la modalidad que prefieras</Hand>.
          </>
        }
      />

      <Field>
        <div className="flex flex-col gap-2.5">
          <Radio
            name="modalidad"
            value="patrocinio"
            label="Patrocinando un semillero para resolver nuestro reto"
            required
          />
          <Radio
            name="modalidad"
            value="mentoria"
            label="Brindando mentoría o charlas técnicas"
          />
          <Radio
            name="modalidad"
            value="empleo"
            label="Abriendo prácticas o vacantes para egresados"
          />
          <Radio
            name="modalidad"
            value="otro"
            label="Otro"
            withOtherInput
            otherName="modalidad_otro"
          />
        </div>
      </Field>
    </>
  );
}
