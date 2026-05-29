"use client";

import { use } from "react";
import { AdminShell } from "@/components/admin/admin-shell";
import {
  PostulacionDetail,
  type FieldSection,
} from "@/components/admin/postulacion-detail";

const sections: FieldSection[] = [
  {
    title: "Datos personales",
    fields: [
      { key: "nombre", label: "Nombre completo" },
      { key: "email", label: "Email" },
      { key: "whatsapp", label: "WhatsApp" },
      { key: "ciudad", label: "Ciudad" },
      { key: "direccion", label: "Dirección" },
    ],
  },
  {
    title: "Académico",
    fields: [
      {
        key: "estudia",
        label: "¿Estudia?",
        format: (v) => {
          const map: Record<string, string> = {
            tecnico: "Sí, técnico / tecnólogo",
            universitario: "Sí, universitario",
            no: "No estudia actualmente",
            otro: "Otro",
          };
          return v ? map[String(v)] ?? String(v) : "—";
        },
      },
      { key: "estudia_otro", label: "Otro (especificación)" },
      { key: "carrera", label: "Carrera / programa" },
    ],
  },
  {
    title: "Interés y origen",
    fields: [
      {
        key: "interes",
        label: "Motivación (respuesta abierta)",
        format: (v) => {
          if (!v) return "—";
          // Backward compat: docs viejos guardaban un keyword (tecnologia,
          // empresas, innovacion, primera_oportunidad, etc.). Si matchea
          // uno conocido, lo traducimos. Si no, asumimos texto libre.
          const legacyMap: Record<string, string> = {
            tecnologia: "Aprender tecnología e IA",
            empresas: "Conectar con empresas y mundo laboral",
            innovacion: "Resolver problemas con innovación",
            primera_oportunidad: "Primera oportunidad real en tech",
            autodidacta: "Ya aprende solo, busca mentoría Senior",
            cambio_carrera: "Cambio de carrera hacia desarrollo",
            impacto: "Crear tecnología con impacto real",
            otro: "Otro (ver legacy interes_otro)",
          };
          const s = String(v);
          if (legacyMap[s])
            return (
              <span className="italic text-[var(--color-fg-subtle)]">
                {legacyMap[s]} (legacy)
              </span>
            );
          return <span className="whitespace-pre-wrap">{s}</span>;
        },
      },
      // Mostramos interes_otro solo para preservar respuestas de docs viejos
      // que tenían la opción "Otro" del esquema previo.
      {
        key: "interes_otro",
        label: "Legacy: respuesta extendida (docs viejos)",
        format: (v) =>
          v ? (
            <span className="whitespace-pre-wrap italic text-[var(--color-fg-subtle)]">
              {String(v)}
            </span>
          ) : (
            "—"
          ),
      },
      {
        key: "origen",
        label: "¿Cómo nos conoció?",
        format: (v) => {
          const map: Record<string, string> = {
            feria: "Feria de empleo / Evento",
            redes: "Redes sociales",
            web: "Página web",
            referido: "Recomendación",
            otro: "Otro",
          };
          return v ? map[String(v)] ?? String(v) : "—";
        },
      },
      { key: "origen_referido", label: "Recomendado por" },
      { key: "origen_otro", label: "Otro (origen)" },
    ],
  },
];

export default function AspiranteDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  return (
    <AdminShell>
      <PostulacionDetail
        collectionName="aspirantes"
        docId={id}
        titleKey="nombre"
        subtitleKey="email"
        sections={sections}
        showCv
      />
    </AdminShell>
  );
}
