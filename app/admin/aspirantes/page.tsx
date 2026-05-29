"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { AdminShell } from "@/components/admin/admin-shell";
import {
  PostulacionList,
  type ColumnConfig,
  type PostulacionRow,
} from "@/components/admin/postulacion-list";
import type { AppStatus } from "@/lib/admin-helpers";

const columns: ColumnConfig<PostulacionRow>[] = [
  {
    key: "nombre",
    label: "Nombre",
    render: (r) => (
      <span className="font-display font-semibold text-[var(--color-ink)]">
        {String(r.nombre ?? "—")}
      </span>
    ),
  },
  {
    key: "email",
    label: "Email",
    render: (r) => (
      <span className="text-[var(--color-fg-muted)]">{String(r.email ?? "—")}</span>
    ),
  },
  {
    key: "ciudad",
    label: "Ciudad",
    render: (r) => (
      <span className="text-[var(--color-fg-muted)]">{String(r.ciudad ?? "—")}</span>
    ),
  },
  {
    key: "estudia",
    label: "Estudia",
    render: (r) => {
      const map: Record<string, string> = {
        tecnico: "Técnico",
        universitario: "Universitario",
        no: "No estudia",
        otro: "Otro",
      };
      const v = r.estudia as string | undefined;
      return (
        <span className="text-[var(--color-fg-muted)]">
          {v ? map[v] ?? v : "—"}
        </span>
      );
    },
  },
];

function AspirantesListInner() {
  const search = useSearchParams();
  const initialStatus = (search.get("status") as AppStatus | null) ?? "all";

  return (
    <PostulacionList
      collectionName="aspirantes"
      title="Aspirantes"
      subtitle="Jóvenes postulando al Programa Semilla."
      columns={columns}
      searchFields={["nombre", "email", "ciudad", "carrera", "whatsapp"]}
      csvFilename="aspirantes"
      initialStatusFilter={initialStatus}
    />
  );
}

export default function AspirantesListPage() {
  return (
    <AdminShell>
      <Suspense fallback={null}>
        <AspirantesListInner />
      </Suspense>
    </AdminShell>
  );
}
