"use client";

import { use } from "react";
import { AdminShell } from "@/components/admin/admin-shell";
import {
  PostulacionDetail,
  type FieldSection,
} from "@/components/admin/postulacion-detail";
import type { Diagnosis, SolutionOption } from "@/lib/diagnosis";

const sections: FieldSection[] = [
  {
    title: "Datos de la empresa",
    fields: [
      { key: "empresa", label: "Empresa" },
      { key: "contacto", label: "Persona de contacto" },
      { key: "email", label: "Email" },
      { key: "telefono", label: "Teléfono" },
    ],
  },
  {
    title: "Diagnóstico del reto",
    fields: [
      {
        key: "area",
        label: "Área a potenciar",
        format: (v) => {
          const map: Record<string, string> = {
            cs: "Servicio al cliente / Soporte",
            operaciones: "Procesos internos / Operaciones",
            datos: "Análisis de datos / Reportes",
            marketing: "Marketing / Ventas",
            otro: "Otro",
          };
          return v ? map[String(v)] ?? String(v) : "—";
        },
      },
      { key: "area_otro", label: "Otro (área)" },
      {
        key: "reto",
        label: "Descripción del reto",
        format: (v) =>
          v ? (
            <span className="whitespace-pre-wrap">{String(v)}</span>
          ) : (
            "—"
          ),
      },
    ],
  },
  {
    title: "Diagnóstico IA",
    fields: [
      {
        key: "diagnostico",
        label: "Rutas propuestas",
        fullWidth: true,
        format: (v, data) => {
          const diag = v as Diagnosis | null | undefined;
          if (!diag?.opciones?.length) {
            return "— (esta postulación se envió antes del diagnóstico IA)";
          }
          const elegida =
            typeof data.opcion_elegida === "number" ? data.opcion_elegida : -1;
          const esFallback = data.diagnostico_fuente === "fallback";
          return (
            <div className="flex flex-col gap-3">
              {esFallback && (
                <span className="inline-flex w-fit items-center rounded-full border-2 border-[var(--color-ink)] bg-[var(--color-bg-sky)] px-2.5 py-1 font-display text-[10px] font-bold uppercase tracking-wider">
                  Sin IA — diagnosticar a mano
                </span>
              )}
              <p className="whitespace-pre-wrap text-sm text-[var(--color-fg-muted)]">
                {diag.resumen}
              </p>
              <ul className="flex flex-col gap-2">
                {diag.opciones.map((op: SolutionOption, i: number) => (
                  <li
                    key={i}
                    className={
                      i === elegida
                        ? "rounded-xl border-2 border-[var(--color-ink)] bg-[var(--color-bg-teal)] p-3 shadow-[3px_3px_0_var(--color-ink)]"
                        : "rounded-xl border-2 border-dashed border-[var(--color-bg-soft)] p-3"
                    }
                  >
                    <div className="font-display text-sm font-bold">
                      {op.titulo}
                      {i === elegida && (
                        <span className="ml-2 font-body text-[11px] font-semibold uppercase tracking-wider text-[var(--color-accent-strong)]">
                          Elegida
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-sm text-[var(--color-fg-muted)]">
                      {op.descripcion}
                    </p>
                    <p className="mt-1.5 text-xs text-[var(--color-ink)]">
                      {op.entregable} · {op.duracion_semanas} semanas
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          );
        },
      },
    ],
  },
  {
    title: "Modalidad",
    fields: [
      {
        key: "modalidad",
        label: "Modalidad de apoyo",
        format: (v) => {
          const map: Record<string, string> = {
            patrocinio: "Patrocinar semillero",
            mentoria: "Mentoría / charlas técnicas",
            empleo: "Prácticas / vacantes",
            otro: "Otro",
          };
          return v ? map[String(v)] ?? String(v) : "—";
        },
      },
      { key: "modalidad_otro", label: "Otro (modalidad)" },
    ],
  },
];

export default function EmpresaDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  return (
    <AdminShell>
      <PostulacionDetail
        collectionName="empresas"
        docId={id}
        titleKey="empresa"
        subtitleKey="contacto"
        sections={sections}
      />
    </AdminShell>
  );
}
