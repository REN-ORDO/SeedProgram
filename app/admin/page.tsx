"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  type Timestamp,
} from "firebase/firestore";
import { Users, Building2, ArrowRight, Inbox, Loader2 } from "lucide-react";
import { db } from "@/lib/firebase";
import { AdminShell } from "@/components/admin/admin-shell";
import { formatFirestoreDate, timeAgo, STATUS_META } from "@/lib/admin-helpers";
import type { AppStatus } from "@/lib/admin-helpers";

type DocLite = {
  id: string;
  status: AppStatus;
  createdAt?: Timestamp;
  title: string;
  subtitle: string;
};

export default function AdminDashboardPage() {
  return (
    <AdminShell>
      <Dashboard />
    </AdminShell>
  );
}

function Dashboard() {
  const [aspirantes, setAspirantes] = useState<DocLite[]>([]);
  const [empresas, setEmpresas] = useState<DocLite[]>([]);
  const [loadingA, setLoadingA] = useState(true);
  const [loadingE, setLoadingE] = useState(true);

  // Subscripción reactiva a ambas colecciones (orden descendente por fecha).
  // En vez de getCountFromServer con where (que tiene quirks de permisos en
  // aggregation queries), contamos del lado cliente sobre el snapshot.
  useEffect(() => {
    const unsubs: Array<() => void> = [];

    unsubs.push(
      onSnapshot(
        query(collection(db, "aspirantes"), orderBy("createdAt", "desc")),
        (snap) => {
          setAspirantes(
            snap.docs.map((d) => {
              const data = d.data();
              return {
                id: d.id,
                status: (data.status as AppStatus) ?? "pending",
                createdAt: data.createdAt as Timestamp | undefined,
                title: (data.nombre as string) ?? "Sin nombre",
                subtitle: (data.email as string) ?? "",
              };
            }),
          );
          setLoadingA(false);
        },
        (err) => {
          console.error("Aspirantes snapshot error:", err);
          setLoadingA(false);
        },
      ),
    );

    unsubs.push(
      onSnapshot(
        query(collection(db, "empresas"), orderBy("createdAt", "desc")),
        (snap) => {
          setEmpresas(
            snap.docs.map((d) => {
              const data = d.data();
              return {
                id: d.id,
                status: (data.status as AppStatus) ?? "pending",
                createdAt: data.createdAt as Timestamp | undefined,
                title: (data.empresa as string) ?? "Sin nombre",
                subtitle: (data.contacto as string) ?? "",
              };
            }),
          );
          setLoadingE(false);
        },
        (err) => {
          console.error("Empresas snapshot error:", err);
          setLoadingE(false);
        },
      ),
    );

    return () => unsubs.forEach((u) => u());
  }, []);

  const loading = loadingA || loadingE;

  const stats = useMemo(() => {
    return {
      totalAspirantes: aspirantes.length,
      pendingAspirantes: aspirantes.filter((d) => d.status === "pending").length,
      totalEmpresas: empresas.length,
      pendingEmpresas: empresas.filter((d) => d.status === "pending").length,
    };
  }, [aspirantes, empresas]);

  const recent = useMemo(() => {
    const all: Array<DocLite & { collection: "aspirantes" | "empresas" }> = [
      ...aspirantes.slice(0, 8).map((d) => ({
        ...d,
        collection: "aspirantes" as const,
      })),
      ...empresas.slice(0, 8).map((d) => ({
        ...d,
        collection: "empresas" as const,
      })),
    ];
    all.sort(
      (a, b) =>
        (b.createdAt?.toMillis() ?? 0) - (a.createdAt?.toMillis() ?? 0),
    );
    return all.slice(0, 8);
  }, [aspirantes, empresas]);

  return (
    <div className="mx-auto max-w-6xl">
      <header className="mb-8">
        <h1 className="font-display text-3xl font-bold tracking-tight text-[var(--color-heading)] sm:text-4xl">
          Dashboard
        </h1>
        <p className="mt-2 text-sm text-[var(--color-fg-muted)]">
          Vista general de postulaciones al Programa Semilla.
        </p>
      </header>

      {/* Stats grid */}
      <div className="mb-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Aspirantes totales"
          value={stats.totalAspirantes}
          loading={loading}
          icon={<Users size={20} />}
          accent="var(--color-bg-teal)"
          href="/admin/aspirantes"
        />
        <StatCard
          title="Aspirantes pendientes"
          value={stats.pendingAspirantes}
          loading={loading}
          icon={<Inbox size={20} />}
          accent="var(--color-bg-sky)"
          href="/admin/aspirantes?status=pending"
        />
        <StatCard
          title="Empresas totales"
          value={stats.totalEmpresas}
          loading={loading}
          icon={<Building2 size={20} />}
          accent="var(--color-accent-soft)"
          href="/admin/empresas"
        />
        <StatCard
          title="Empresas pendientes"
          value={stats.pendingEmpresas}
          loading={loading}
          icon={<Inbox size={20} />}
          accent="#fef3c7"
          href="/admin/empresas?status=pending"
        />
      </div>

      {/* Recent activity */}
      <section className="rounded-2xl border-2 border-[var(--color-ink)] bg-white p-6 shadow-[6px_6px_0_var(--color-ink)] sm:p-7">
        <div className="mb-5 flex items-center justify-between gap-3">
          <h2 className="font-display text-lg font-bold tracking-tight text-[var(--color-ink)]">
            Actividad reciente
          </h2>
          <div className="text-xs text-[var(--color-fg-muted)]">
            últimas 8 postulaciones
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-10">
            <Loader2
              size={20}
              className="animate-spin text-[var(--color-accent)]"
            />
          </div>
        ) : recent.length === 0 ? (
          <div className="rounded-xl border-2 border-dashed border-[var(--color-bg-soft)] bg-[var(--color-bg-soft)] p-8 text-center text-sm text-[var(--color-fg-muted)]">
            Aún no hay postulaciones. Cuando lleguen aparecerán aquí en tiempo
            real.
          </div>
        ) : (
          <ul className="flex flex-col divide-y-2 divide-dashed divide-[var(--color-bg-soft)]">
            {recent.map((item) => {
              const meta = STATUS_META[item.status];
              return (
                <li key={`${item.collection}-${item.id}`}>
                  <Link
                    href={`/admin/${item.collection}/${item.id}`}
                    className="group flex items-center justify-between gap-3 py-3 transition-colors hover:bg-[var(--color-bg-soft)] rounded-lg px-2 -mx-2"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full border-2 border-[var(--color-ink)] bg-white text-[var(--color-ink)]">
                        {item.collection === "aspirantes" ? (
                          <Users size={14} />
                        ) : (
                          <Building2 size={14} />
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="truncate font-display text-sm font-semibold text-[var(--color-ink)]">
                          {item.title}
                        </div>
                        <div className="truncate text-xs text-[var(--color-fg-muted)]">
                          {item.subtitle}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-shrink-0 items-center gap-3">
                      <span
                        className="rounded-full border-2 border-[var(--color-ink)] px-2.5 py-1 font-display text-[10px] font-bold uppercase tracking-wider"
                        style={{ background: meta.bg, color: meta.text }}
                      >
                        {meta.label}
                      </span>
                      <span
                        className="hidden text-xs text-[var(--color-fg-muted)] sm:inline"
                        title={formatFirestoreDate(item.createdAt)}
                      >
                        {timeAgo(item.createdAt)}
                      </span>
                      <ArrowRight
                        size={16}
                        className="text-[var(--color-fg-muted)] transition-transform group-hover:translate-x-0.5 group-hover:text-[var(--color-ink)]"
                      />
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}

function StatCard({
  title,
  value,
  loading,
  icon,
  accent,
  href,
}: {
  title: string;
  value: number;
  loading: boolean;
  icon: React.ReactNode;
  accent: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="group block rounded-2xl border-2 border-[var(--color-ink)] bg-white p-5 shadow-[3px_3px_0_var(--color-ink)] transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0_var(--color-ink)]"
    >
      <div className="mb-3 flex items-center justify-between">
        <div
          className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-[var(--color-ink)]"
          style={{ background: accent }}
        >
          {icon}
        </div>
        <ArrowRight
          size={16}
          className="text-[var(--color-fg-subtle)] transition-transform group-hover:translate-x-0.5 group-hover:text-[var(--color-ink)]"
        />
      </div>
      <div className="font-display text-3xl font-bold tracking-tight text-[var(--color-heading)] sm:text-4xl">
        {loading ? (
          <Loader2 size={22} className="animate-spin" />
        ) : (
          value.toLocaleString("es-CO")
        )}
      </div>
      <div className="mt-1 text-xs font-semibold uppercase tracking-wider text-[var(--color-fg-muted)]">
        {title}
      </div>
    </Link>
  );
}
