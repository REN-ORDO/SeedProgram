"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  collection,
  query,
  orderBy,
  limit,
  onSnapshot,
  getCountFromServer,
  where,
  type Timestamp,
} from "firebase/firestore";
import { Users, Building2, ArrowRight, Inbox, Loader2 } from "lucide-react";
import { db } from "@/lib/firebase";
import { AdminShell } from "@/components/admin/admin-shell";
import { formatFirestoreDate, timeAgo, STATUS_META } from "@/lib/admin-helpers";
import type { AppStatus } from "@/lib/admin-helpers";

type RecentItem = {
  id: string;
  collection: "aspirantes" | "empresas";
  title: string;
  subtitle: string;
  status: AppStatus;
  createdAt: Timestamp | undefined;
};

export default function AdminDashboardPage() {
  return (
    <AdminShell>
      <Dashboard />
    </AdminShell>
  );
}

function Dashboard() {
  const [stats, setStats] = useState({
    totalAspirantes: 0,
    totalEmpresas: 0,
    pendingAspirantes: 0,
    pendingEmpresas: 0,
    loading: true,
  });
  const [recent, setRecent] = useState<RecentItem[]>([]);
  const [recentLoading, setRecentLoading] = useState(true);

  // Fetch counts una sola vez (no en tiempo real, suficiente)
  useEffect(() => {
    (async () => {
      try {
        const aspirantesCol = collection(db, "aspirantes");
        const empresasCol = collection(db, "empresas");
        const [aTotal, aPending, eTotal, ePending] = await Promise.all([
          getCountFromServer(aspirantesCol),
          getCountFromServer(
            query(aspirantesCol, where("status", "==", "pending")),
          ),
          getCountFromServer(empresasCol),
          getCountFromServer(
            query(empresasCol, where("status", "==", "pending")),
          ),
        ]);
        setStats({
          totalAspirantes: aTotal.data().count,
          totalEmpresas: eTotal.data().count,
          pendingAspirantes: aPending.data().count,
          pendingEmpresas: ePending.data().count,
          loading: false,
        });
      } catch (err) {
        // Si la query con where falla (sin docs con status), los conteos
        // simples siguen funcionando
        console.error("Error fetching stats:", err);
        setStats((s) => ({ ...s, loading: false }));
      }
    })();
  }, []);

  // Recent items en tiempo real (combina ambas colecciones)
  useEffect(() => {
    const unsubs: Array<() => void> = [];
    const buffer: { aspirantes: RecentItem[]; empresas: RecentItem[] } = {
      aspirantes: [],
      empresas: [],
    };

    const merge = () => {
      const all = [...buffer.aspirantes, ...buffer.empresas];
      all.sort((a, b) => {
        const tA = a.createdAt?.toMillis() ?? 0;
        const tB = b.createdAt?.toMillis() ?? 0;
        return tB - tA;
      });
      setRecent(all.slice(0, 8));
      setRecentLoading(false);
    };

    unsubs.push(
      onSnapshot(
        query(
          collection(db, "aspirantes"),
          orderBy("createdAt", "desc"),
          limit(5),
        ),
        (snap) => {
          buffer.aspirantes = snap.docs.map((d) => {
            const data = d.data();
            return {
              id: d.id,
              collection: "aspirantes",
              title: (data.nombre as string) ?? "Sin nombre",
              subtitle: (data.email as string) ?? "",
              status: (data.status as AppStatus) ?? "pending",
              createdAt: data.createdAt as Timestamp | undefined,
            };
          });
          merge();
        },
        (err) => {
          console.error("Aspirantes snapshot error:", err);
          setRecentLoading(false);
        },
      ),
    );

    unsubs.push(
      onSnapshot(
        query(
          collection(db, "empresas"),
          orderBy("createdAt", "desc"),
          limit(5),
        ),
        (snap) => {
          buffer.empresas = snap.docs.map((d) => {
            const data = d.data();
            return {
              id: d.id,
              collection: "empresas",
              title: (data.empresa as string) ?? "Sin nombre",
              subtitle: (data.contacto as string) ?? "",
              status: (data.status as AppStatus) ?? "pending",
              createdAt: data.createdAt as Timestamp | undefined,
            };
          });
          merge();
        },
        (err) => {
          console.error("Empresas snapshot error:", err);
          setRecentLoading(false);
        },
      ),
    );

    return () => unsubs.forEach((u) => u());
  }, []);

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
          loading={stats.loading}
          icon={<Users size={20} />}
          accent="var(--color-bg-teal)"
          href="/admin/aspirantes"
        />
        <StatCard
          title="Aspirantes pendientes"
          value={stats.pendingAspirantes}
          loading={stats.loading}
          icon={<Inbox size={20} />}
          accent="var(--color-bg-sky)"
          href="/admin/aspirantes?status=pending"
        />
        <StatCard
          title="Empresas totales"
          value={stats.totalEmpresas}
          loading={stats.loading}
          icon={<Building2 size={20} />}
          accent="var(--color-accent-soft)"
          href="/admin/empresas"
        />
        <StatCard
          title="Empresas pendientes"
          value={stats.pendingEmpresas}
          loading={stats.loading}
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

        {recentLoading ? (
          <div className="flex items-center justify-center py-10">
            <Loader2
              size={20}
              className="animate-spin text-[var(--color-accent)]"
            />
          </div>
        ) : recent.length === 0 ? (
          <div className="rounded-xl border-2 border-dashed border-[var(--color-bg-soft)] bg-[var(--color-bg-soft)] p-8 text-center text-sm text-[var(--color-fg-muted)]">
            Aún no hay postulaciones. Cuando lleguen aparecerán aquí en tiempo real.
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
