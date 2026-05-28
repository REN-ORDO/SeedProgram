"use client";

/**
 * Formulario de postulación al Programa Semilla.
 *
 * Dos flujos en una sola vista (selector arriba):
 *  - Aspirante: nombre + contacto · datos académicos + CV · interés
 *  - Empresa:   datos · diagnóstico del reto · modalidad de apoyo
 *
 * Submit → Firestore (colecciones `aspirantes` / `empresas`).
 * CV de aspirante → Firebase Storage bajo `cvs/`.
 *
 * Estilo: usa los tokens .theme-toon + helpers .toon-* de globals.css.
 */

import { useState, useMemo, useRef, type ChangeEvent, type FormEvent } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  FileUp,
  Building2,
  Send,
} from "lucide-react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { uploadCvToCloudinary } from "@/lib/cloudinary";
import { cn } from "@/lib/utils";

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
  { id: 3, label: "Modalidad" },
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
  "flex cursor-pointer items-center gap-3.5 rounded-xl border-2 border-[var(--color-ink)] bg-white " +
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
            <div
              className={cn(
                "flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full border-2 border-[var(--color-ink)]",
                "shadow-[3px_3px_0_var(--color-ink)] font-display text-sm font-bold transition-all duration-300",
                isActive && "bg-[var(--color-accent)] text-white -rotate-3",
                isDone && "bg-[var(--color-bg-teal)] text-[var(--color-ink)]",
                !isActive && !isDone && "bg-white text-[var(--color-ink)]",
              )}
            >
              {isDone ? <Check size={16} strokeWidth={3} /> : step.id}
            </div>
            <span
              className={cn(
                "hidden font-display text-sm font-semibold whitespace-nowrap sm:block",
                isActive ? "text-[var(--color-ink)]" : "text-[var(--color-fg-subtle)]",
                isDone && "text-[var(--color-fg-muted)]",
              )}
            >
              {step.label}
            </span>
            {i < steps.length - 1 && (
              <div className="relative mx-1 h-[3px] w-6 min-w-4 sm:w-10 overflow-hidden border-y-2 border-[var(--color-ink)] bg-[var(--color-bg-soft)]">
                <div
                  className={cn(
                    "absolute inset-0 origin-left bg-[var(--color-accent)] transition-transform duration-500",
                    isDone ? "scale-x-100" : "scale-x-0",
                  )}
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
  return (
    <div className="mb-9 flex justify-center">
      <div className="inline-flex rounded-full border-2 border-[var(--color-ink)] bg-white p-1.5 shadow-[6px_6px_0_var(--color-ink)]">
        {(
          [
            { id: "aspirante" as Role, label: "Soy aspirante", icon: "🌱" },
            { id: "empresa" as Role, label: "Soy empresa", icon: "🏢" },
          ]
        ).map((opt) => (
          <button
            key={opt.id}
            type="button"
            onClick={() => onChange(opt.id)}
            className={cn(
              "inline-flex items-center gap-2 rounded-full px-5 py-3 font-body text-sm font-semibold transition-colors",
              role === opt.id
                ? "bg-[var(--color-ink)] text-white"
                : "text-[var(--color-fg-muted)] hover:text-[var(--color-ink)]",
            )}
          >
            <span className="text-base">{opt.icon}</span>
            <span className="hidden xs:inline sm:inline">{opt.label}</span>
            <span className="inline xs:hidden sm:hidden">
              {opt.id === "aspirante" ? "Aspirante" : "Empresa"}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

function Field({ children }: { children: React.ReactNode }) {
  return <div className="mb-5">{children}</div>;
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

// Radio personalizado al estilo toon
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
  return (
    <label className={optionCls}>
      <input
        type="radio"
        name={name}
        value={value}
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
          type="text"
          name={otherName}
          placeholder={otherPlaceholder ?? "Especifica..."}
          className={cn(
            "ml-auto max-w-[220px] rounded-lg border-2 border-[var(--color-ink)] bg-white px-3 py-1.5",
            "text-[13px] shadow-[2px_2px_0_var(--color-ink)] outline-none focus:shadow-[3px_3px_0_var(--color-accent)]",
            "w-full sm:w-auto",
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
        initial={{ opacity: 0, x: direction === "forward" ? 36 : -36 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: direction === "forward" ? -36 : 36 }}
        transition={{ duration: 0.35, ease: [0.22, 0.61, 0.36, 1] }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

// ============================================================
// Componente principal
// ============================================================

export function ApplicationForm() {
  const [role, setRole] = useState<Role>("aspirante");
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState<Direction>("forward");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [cvFileName, setCvFileName] = useState<string | null>(null);

  const formRef = useRef<HTMLFormElement>(null);
  const cvInputRef = useRef<HTMLInputElement>(null);

  const steps = useMemo(
    () => (role === "aspirante" ? ASPIRANTE_STEPS : EMPRESA_STEPS),
    [role],
  );

  // ---- Navegación ----

  const goTo = (next: number, dir: Direction) => {
    if (next < 1 || next > steps.length) return;
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
    setErrorMsg(null);
    setCvFileName(null);
  };

  // ---- Validación por paso (lee el DOM del form actual) ----

  const validateCurrentPanel = (): boolean => {
    const form = formRef.current;
    if (!form) return true;
    const panel = form.querySelector<HTMLElement>("[data-active-panel]");
    if (!panel) return true;

    const required = panel.querySelectorAll<HTMLElement>("[required]");
    for (const el of Array.from(required)) {
      if (el instanceof HTMLInputElement && el.type === "radio") {
        const group = panel.querySelectorAll<HTMLInputElement>(
          `input[name="${el.name}"]`,
        );
        const checked = Array.from(group).some((r) => r.checked);
        if (!checked) {
          setErrorMsg("Por favor selecciona una opción antes de continuar.");
          return false;
        }
      } else if (el instanceof HTMLInputElement && el.type === "file") {
        if (!el.files || el.files.length === 0) {
          setErrorMsg("Por favor adjunta tu hoja de vida.");
          return false;
        }
      } else if (
        (el instanceof HTMLInputElement ||
          el instanceof HTMLSelectElement ||
          el instanceof HTMLTextAreaElement) &&
        !el.value.trim()
      ) {
        el.focus();
        setErrorMsg("Faltan campos requeridos en este paso.");
        return false;
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
    setCvFileName(file?.name ?? null);
  };

  // ---- Submit a Firebase ----

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validateCurrentPanel()) return;

    setSubmitting(true);
    setErrorMsg(null);

    try {
      const form = e.currentTarget;
      const fd = new FormData(form);
      const data: Record<string, unknown> = {};
      for (const [key, value] of fd.entries()) {
        if (value instanceof File) continue;
        data[key] = value;
      }

      if (role === "aspirante") {
        // Subir CV a Cloudinary primero
        const cvFile = cvInputRef.current?.files?.[0];
        if (cvFile) {
          const upload = await uploadCvToCloudinary(cvFile);
          data.cvUrl = upload.secureUrl;
          data.cvPublicId = upload.publicId;
          data.cvResourceType = upload.resourceType;
          data.cvFormat = upload.format;
          data.cvBytes = upload.bytes;
          data.cvFilename = cvFile.name;
        }

        await addDoc(collection(db, "aspirantes"), {
          ...data,
          createdAt: serverTimestamp(),
          source: "web-postular",
        });
      } else {
        await addDoc(collection(db, "empresas"), {
          ...data,
          createdAt: serverTimestamp(),
          source: "web-postular",
        });
      }

      setSuccess(true);
    } catch (err) {
      console.error("Error guardando postulación:", err);
      setErrorMsg(
        "Hubo un problema enviando tu postulación. Intenta de nuevo en unos segundos.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  // ============================================================
  // Render: estado de éxito
  // ============================================================

  if (success) {
    return (
      <div className="toon-card mx-auto max-w-2xl p-10 text-center sm:p-12">
        <motion.div
          initial={{ scale: 0, rotate: -5 }}
          animate={{ scale: 1, rotate: -5 }}
          transition={{ type: "spring", stiffness: 200, damping: 14 }}
          className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full border-2 border-[var(--color-ink)] bg-[var(--color-accent)] text-white shadow-[6px_6px_0_var(--color-ink)]"
        >
          <Check size={36} strokeWidth={3.5} />
        </motion.div>
        <h2 className="font-display text-3xl font-bold leading-tight tracking-tight text-[var(--color-heading)]">
          ¡Gracias por <Hand>escribirnos</Hand>!
        </h2>
        <p className="mx-auto mt-3 max-w-md text-[15px] text-[var(--color-fg-muted)]">
          {role === "aspirante"
            ? "Recibimos tu postulación. Si haces match con el batch, te contactamos pronto. 🌱"
            : "Recibimos tu solicitud. Un mentor senior te contactará en menos de 48 horas."}
        </p>
        <button
          type="button"
          onClick={() => {
            setSuccess(false);
            setStep(1);
            setCvFileName(null);
            formRef.current?.reset();
          }}
          className="toon-btn mt-8"
          style={{ background: "var(--color-accent-soft)" }}
        >
          Enviar otra postulación
          <ArrowRight size={16} />
        </button>
      </div>
    );
  }

  // ============================================================
  // Render principal
  // ============================================================

  return (
    <div className="mx-auto w-full max-w-2xl">
      <RoleSelector role={role} onChange={changeRole} />

      <div className="toon-card relative p-7 sm:p-10">
        {/* Sticker decorativo */}
        <div
          className="absolute -top-4 right-6 inline-flex rotate-[4deg] items-center gap-1 rounded-full border-2 border-[var(--color-ink)] px-3 py-1 font-display text-[11px] font-bold uppercase tracking-wider shadow-[3px_3px_0_var(--color-ink)]"
          style={{
            background:
              role === "aspirante" ? "var(--color-accent)" : "var(--color-bg-sky)",
            color: role === "aspirante" ? "#fff" : "var(--color-ink)",
          }}
        >
          {role === "aspirante" ? "¡Gratis!" : "+48h respuesta"}
        </div>

        <form ref={formRef} onSubmit={handleSubmit} noValidate>
          <Stepper steps={steps} current={step} />

          <PanelMotion step={`${role}-${step}` as unknown as number} direction={direction}>
            <div data-active-panel="">
              {role === "aspirante" && step === 1 && <AspiranteStep1 />}
              {role === "aspirante" && step === 2 && (
                <AspiranteStep2
                  cvFileName={cvFileName}
                  onCvChange={onCvChange}
                  cvInputRef={cvInputRef}
                />
              )}
              {role === "aspirante" && step === 3 && <AspiranteStep3 />}

              {role === "empresa" && step === 1 && <EmpresaStep1 />}
              {role === "empresa" && step === 2 && <EmpresaStep2 />}
              {role === "empresa" && step === 3 && <EmpresaStep3 />}
            </div>
          </PanelMotion>

          {/* Mensaje de error */}
          {errorMsg && (
            <div className="mt-5 rounded-xl border-2 border-red-500 bg-red-50 px-4 py-3 text-sm font-medium text-red-700 shadow-[3px_3px_0_#ef4444]">
              {errorMsg}
            </div>
          )}

          {/* Navegación */}
          <div className="mt-8 flex flex-wrap gap-3 border-t-2 border-dashed border-[var(--color-bg-soft)] pt-6">
            {step > 1 && (
              <button
                type="button"
                onClick={handleBack}
                disabled={submitting}
                className="toon-btn toon-btn--white disabled:opacity-50"
              >
                <ArrowLeft size={16} />
                Atrás
              </button>
            )}

            {step < steps.length ? (
              <button
                type="button"
                onClick={handleNext}
                className="toon-btn ml-auto"
                style={{ background: "var(--color-ink)", color: "#fff" }}
              >
                Continuar
                <ArrowRight size={16} />
              </button>
            ) : (
              <button
                type="submit"
                disabled={submitting}
                className="toon-btn ml-auto disabled:opacity-60"
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
                    <Send size={16} />
                  </>
                )}
              </button>
            )}
          </div>

          {step === steps.length && (
            <p className="mt-4 text-center text-xs text-[var(--color-fg-subtle)]">
              {role === "aspirante"
                ? "Al enviar aceptas el tratamiento de datos según nuestra política de privacidad."
                : "Te contactaremos en menos de 48 horas para coordinar una llamada."}
            </p>
          )}
        </form>
      </div>
    </div>
  );
}

// ============================================================
// Paneles (separados para legibilidad)
// ============================================================

function AspiranteStep1() {
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
          type="text"
          name="nombre"
          required
          placeholder="Ej: María Fernanda López"
          className={inputCls}
        />
      </Field>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field>
          <label className={labelCls}>
            Ciudad<span className="ml-0.5 text-[var(--color-accent-strong)]">*</span>
          </label>
          <select name="ciudad" required className={cn(inputCls, "cursor-pointer pr-11")}>
            <option value="">Selecciona tu ciudad</option>
            <option>Barranquilla</option>
            <option>Bogotá</option>
            <option>Medellín</option>
            <option>Cali</option>
            <option>Cartagena</option>
            <option>Santa Marta</option>
            <option>Bucaramanga</option>
            <option>Otra</option>
          </select>
        </Field>
        <Field>
          <label className={labelCls}>
            Dirección<span className="ml-0.5 text-[var(--color-accent-strong)]">*</span>
          </label>
          <input
            type="text"
            name="direccion"
            required
            placeholder="Calle, número, barrio"
            className={inputCls}
          />
        </Field>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field>
          <label className={labelCls}>
            WhatsApp<span className="ml-0.5 text-[var(--color-accent-strong)]">*</span>
          </label>
          <input
            type="tel"
            name="whatsapp"
            required
            placeholder="300 123 4567"
            className={inputCls}
          />
        </Field>
        <Field>
          <label className={labelCls}>
            Correo electrónico<span className="ml-0.5 text-[var(--color-accent-strong)]">*</span>
          </label>
          <input
            type="email"
            name="email"
            required
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
}: {
  cvFileName: string | null;
  onCvChange: (e: ChangeEvent<HTMLInputElement>) => void;
  cvInputRef: React.RefObject<HTMLInputElement | null>;
}) {
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
          type="text"
          name="carrera"
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
              {cvFileName ?? "Cargar CV (PDF o Word)"}
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
            accept=".pdf,.doc,.docx"
            onChange={onCvChange}
            required
            className="hidden"
          />
        </label>
      </Field>
    </>
  );
}

function AspiranteStep3() {
  return (
    <>
      <PanelHeader
        title="Tu motivación"
        desc={
          <>
            Último paso — <Hand>cuéntanos qué te trae aquí</Hand>.
          </>
        }
      />

      <Field>
        <label className={labelCls}>
          ¿Por qué te interesa unirte?<span className="ml-0.5 text-[var(--color-accent-strong)]">*</span>
        </label>
        <div className="flex flex-col gap-2.5">
          <Radio
            name="interes"
            value="tecnologia"
            label="Quiero aprender sobre tecnología e IA"
            required
          />
          <Radio
            name="interes"
            value="empresas"
            label="Busco conectar con empresas y el mundo laboral"
          />
          <Radio
            name="interes"
            value="innovacion"
            label="Me apasiona resolver problemas reales con innovación"
          />
          <Radio
            name="interes"
            value="otro"
            label="Otro"
            withOtherInput
            otherName="interes_otro"
          />
        </div>
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
          type="text"
          name="empresa"
          required
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
          type="text"
          name="contacto"
          required
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
            type="email"
            name="email"
            required
            placeholder="tu@empresa.com"
            className={inputCls}
          />
        </Field>
        <Field>
          <label className={labelCls}>
            Teléfono<span className="ml-0.5 text-[var(--color-accent-strong)]">*</span>
          </label>
          <input
            type="tel"
            name="telefono"
            required
            placeholder="+57 300 123 4567"
            className={inputCls}
          />
        </Field>
      </div>
    </>
  );
}

function EmpresaStep2() {
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
          name="reto"
          required
          placeholder="Ej: Pasamos mucho tiempo respondiendo preguntas frecuentes de clientes..."
          className={cn(inputCls, "min-h-[120px] resize-y leading-relaxed")}
        />
        <span className="mt-2 block text-[13px] text-[var(--color-fg-subtle)]">
          ¿Qué problema crees que podría resolverse con tecnología o IA?
        </span>
      </Field>
    </>
  );
}

function EmpresaStep3() {
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
