"use client";

import { use } from "react";
import { AdminShell } from "@/components/admin/admin-shell";
import {
  PostulacionDetail,
  type FieldSection,
} from "@/components/admin/postulacion-detail";

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
