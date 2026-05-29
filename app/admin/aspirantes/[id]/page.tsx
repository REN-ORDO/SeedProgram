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
        label: "Motivación principal",
        format: (v) => {
          const map: Record<string, string> = {
            primera_oportunidad:
              "Primera oportunidad real en tech",
            autodidacta:
              "Ya aprende solo, busca mentoría Senior + estructura",
            cambio_carrera:
              "Cambio de carrera hacia desarrollo de software",
            impacto: "Crear tecnología con impacto real",
            otro: "Otro (ver respuesta extendida)",
            // Backward compat con docs viejos
            tecnologia: "Aprender tecnología e IA (legacy)",
            empresas: "Conectar con empresas (legacy)",
            innovacion: "Resolver problemas con innovación (legacy)",
          };
          return v ? map[String(v)] ?? String(v) : "—";
        },
      },
      {
        key: "interes_otro",
        label: "Respuesta abierta (motivación)",
        format: (v) =>
          v ? (
            <span className="whitespace-pre-wrap">{String(v)}</span>
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
