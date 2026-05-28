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
    key: "empresa",
    label: "Empresa",
    render: (r) => (
      <span className="font-display font-semibold text-[var(--color-ink)]">
        {String(r.empresa ?? "—")}
      </span>
    ),
  },
  {
    key: "contacto",
    label: "Contacto",
    render: (r) => (
      <span className="text-[var(--color-fg-muted)]">{String(r.contacto ?? "—")}</span>
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
    key: "area",
    label: "Área",
    render: (r) => {
      const map: Record<string, string> = {
        cs: "Soporte",
        operaciones: "Operaciones",
        datos: "Datos",
        marketing: "Marketing",
        otro: "Otro",
      };
      const v = r.area as string | undefined;
      return (
        <span className="text-[var(--color-fg-muted)]">
          {v ? map[v] ?? v : "—"}
        </span>
      );
    },
  },
];

function EmpresasListInner() {
  const search = useSearchParams();
  const initialStatus = (search.get("status") as AppStatus | null) ?? "all";

  return (
    <PostulacionList
      collectionName="empresas"
      title="Empresas"
      subtitle="Aliados interesados en apadrinar talento."
      columns={columns}
      searchFields={["empresa", "contacto", "email", "telefono"]}
      csvFilename="empresas"
      initialStatusFilter={initialStatus}
    />
  );
}

export default function EmpresasListPage() {
  return (
    <AdminShell>
      <Suspense fallback={null}>
        <EmpresasListInner />
      </Suspense>
    </AdminShell>
  );
}
