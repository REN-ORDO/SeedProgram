"use client";

/**
 * AdminShell — protege rutas /admin/* y provee sidebar + header.
 *
 * Comportamiento:
 *   - Si no hay usuario  → redirige a /admin/login
 *   - Si user.email NO está en la lista de admins → muestra "sin permiso"
 *   - Si autorizado → renderiza children dentro del shell con sidebar
 */

import { useEffect, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
  LayoutDashboard,
  Users,
  Building2,
  LogOut,
  Loader2,
  ShieldAlert,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { Monogram } from "@/components/monogram";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/aspirantes", label: "Aspirantes", icon: Users },
  { href: "/admin/empresas", label: "Empresas", icon: Building2 },
];

export function AdminShell({ children }: { children: ReactNode }) {
  const { user, loading, isAdmin, signOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // Si no hay user, mandar a login
  useEffect(() => {
    if (!loading && !user) {
      router.replace("/admin/login");
    }
  }, [loading, user, router]);

  if (loading) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-[var(--color-bg)]">
        <Loader2
          size={28}
          className="animate-spin text-[var(--color-accent)]"
        />
      </div>
    );
  }

  if (!user) return null; // redirigiendo

  if (!isAdmin) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-[var(--color-bg)] px-4 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-[var(--color-ink)] bg-red-100">
          <ShieldAlert size={28} className="text-red-700" />
        </div>
        <h1 className="font-display text-2xl font-bold text-[var(--color-heading)]">
          Sin permiso
        </h1>
        <p className="max-w-md text-sm text-[var(--color-fg-muted)]">
          Tu cuenta ({user.email}) no está autorizada para acceder al panel de
          admin. Si crees que es un error, contacta al equipo CooWeb.
        </p>
        <button
          onClick={signOut}
          className="toon-btn toon-btn--white mt-2"
        >
          <LogOut size={16} />
          Cerrar sesión
        </button>
      </div>
    );
  }

  return (
    <div className="flex min-h-dvh bg-[var(--color-bg)]">
      {/* Sidebar desktop */}
      <aside className="hidden w-64 flex-col border-r-2 border-[var(--color-ink)] bg-white p-5 lg:flex">
        <SidebarContent pathname={pathname} user={user} signOut={signOut} />
      </aside>

      {/* Mobile top bar — estilo landing (píldora flotante) */}
      <header className="fixed left-0 right-0 top-0 z-40 px-4 py-3 lg:hidden">
        <div className="mx-auto flex max-w-6xl items-center justify-between rounded-full border-2 border-[var(--color-ink)] bg-white px-3 py-2 shadow-[4px_4px_0_var(--color-ink)]">
          <Link
            href="/admin"
            className="flex items-center gap-2.5 transition-transform duration-300 hover:rotate-[-3deg]"
          >
            <Monogram size={36} />
            <span className="flex flex-col leading-none">
              <span className="font-display text-base font-bold text-[var(--color-ink)]">
                CooWeb
              </span>
              <span className="text-[10px] uppercase tracking-[0.18em] text-[var(--color-fg-subtle)]">
                Admin Panel
              </span>
            </span>
          </Link>
          <button
            type="button"
            aria-label="Abrir menú"
            aria-expanded={open}
            onClick={() => setOpen(true)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border-2 border-[var(--color-ink)] bg-white shadow-[3px_3px_0_var(--color-ink)] transition-transform hover:-translate-y-0.5"
          >
            <Menu size={18} />
          </button>
        </div>
      </header>

      {/* Mobile drawer — full screen, estilo landing */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-[var(--color-bg)] lg:hidden"
          >
            <div className="flex items-center justify-between border-b-2 border-[var(--color-ink)] p-6">
              <div className="flex items-center gap-2.5">
                <Monogram size={36} />
                <span className="font-display text-lg font-bold text-[var(--color-ink)]">
                  CooWeb
                </span>
              </div>
              <button
                type="button"
                aria-label="Cerrar menú"
                onClick={() => setOpen(false)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border-2 border-[var(--color-ink)] bg-white shadow-[3px_3px_0_var(--color-ink)]"
              >
                <X size={18} />
              </button>
            </div>

            <nav className="flex flex-col gap-3 p-6 pt-8">
              {NAV.map((item, i) => {
                const Icon = item.icon;
                const isActive = item.exact
                  ? pathname === item.href
                  : pathname === item.href ||
                    pathname.startsWith(item.href + "/");
                return (
                  <motion.div
                    key={item.href}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.05 + i * 0.06, duration: 0.4 }}
                  >
                    <Link
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className={cn(
                        "group flex items-center justify-between rounded-2xl border-2 border-[var(--color-ink)] px-5 py-4 shadow-[4px_4px_0_var(--color-ink)] transition-transform hover:-translate-y-0.5",
                        isActive
                          ? "bg-[var(--color-bg-teal)]"
                          : "bg-white hover:bg-[var(--color-accent-soft)]",
                      )}
                    >
                      <span className="flex items-center gap-3">
                        <Icon size={22} className="text-[var(--color-ink)]" />
                        <span className="font-display text-2xl font-bold text-[var(--color-ink)]">
                          {item.label}
                        </span>
                      </span>
                      <span className="text-2xl text-[var(--color-ink)] transition-transform group-hover:translate-x-1">
                        →
                      </span>
                    </Link>
                  </motion.div>
                );
              })}

              {/* Footer: user + logout */}
              <div className="mt-6 border-t-2 border-dashed border-[var(--color-bg-soft)] pt-5">
                <div className="mb-3 text-xs text-[var(--color-fg-muted)]">
                  <div className="font-semibold text-[var(--color-ink)]">
                    Sesión activa
                  </div>
                  <div className="mt-0.5 truncate">{user.email}</div>
                </div>
                <button
                  onClick={() => {
                    setOpen(false);
                    signOut();
                  }}
                  className="toon-btn toon-btn--white w-full justify-center"
                >
                  <LogOut size={16} />
                  Cerrar sesión
                </button>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Contenido principal */}
      <main className="flex-1 overflow-x-auto px-5 pb-12 pt-24 lg:px-10 lg:pt-10">
        {children}
      </main>
    </div>
  );
}

function SidebarContent({
  pathname,
  user,
  signOut,
  onNavigate,
}: {
  pathname: string;
  user: { email: string | null };
  signOut: () => Promise<void>;
  onNavigate?: () => void;
}) {
  return (
    <>
      {/* Logo */}
      <Link
        href="/admin"
        onClick={onNavigate}
        className="mb-8 inline-flex items-center gap-2.5 group"
      >
        <Monogram size={36} />
        <div className="leading-none">
          <div className="font-display text-base font-bold text-[var(--color-ink)]">
            CooWeb
          </div>
          <div className="mt-1 text-[10px] uppercase tracking-[0.2em] text-[var(--color-fg-subtle)]">
            Admin Panel
          </div>
        </div>
      </Link>

      {/* Nav */}
      <nav className="flex flex-col gap-1.5">
        {NAV.map((item) => {
          const Icon = item.icon;
          const isActive = item.exact
            ? pathname === item.href
            : pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "inline-flex items-center gap-2.5 rounded-xl border-2 px-3.5 py-2.5 font-display text-sm font-semibold transition-all duration-150",
                isActive
                  ? "border-[var(--color-ink)] bg-[var(--color-bg-teal)] text-[var(--color-ink)] shadow-[3px_3px_0_var(--color-ink)]"
                  : "border-transparent text-[var(--color-fg-muted)] hover:border-[var(--color-ink)] hover:bg-[var(--color-bg-soft)] hover:text-[var(--color-ink)]",
              )}
            >
              <Icon size={16} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Footer del sidebar: user + logout */}
      <div className="mt-auto border-t-2 border-dashed border-[var(--color-bg-soft)] pt-5">
        <div className="mb-3 truncate text-xs text-[var(--color-fg-muted)]">
          <div className="font-semibold text-[var(--color-ink)]">
            Sesión activa
          </div>
          <div className="mt-0.5 truncate">{user.email}</div>
        </div>
        <button
          onClick={() => {
            onNavigate?.();
            signOut();
          }}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl border-2 border-[var(--color-ink)] bg-white px-3.5 py-2 font-display text-sm font-semibold text-[var(--color-ink)] shadow-[3px_3px_0_var(--color-ink)] transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[5px_5px_0_var(--color-ink)]"
        >
          <LogOut size={15} />
          Cerrar sesión
        </button>
      </div>
    </>
  );
}
