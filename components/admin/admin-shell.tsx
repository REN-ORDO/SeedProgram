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

      {/* Mobile menu button */}
      <button
        onClick={() => setOpen(true)}
        className="fixed left-4 top-4 z-40 inline-flex h-11 w-11 items-center justify-center rounded-full border-2 border-[var(--color-ink)] bg-white shadow-[3px_3px_0_var(--color-ink)] lg:hidden"
      >
        <Menu size={18} />
      </button>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setOpen(false)}
          />
          <aside className="absolute left-0 top-0 flex h-full w-72 flex-col border-r-2 border-[var(--color-ink)] bg-white p-5">
            <button
              onClick={() => setOpen(false)}
              className="absolute right-4 top-4 inline-flex h-9 w-9 items-center justify-center rounded-full border-2 border-[var(--color-ink)] bg-white"
            >
              <X size={16} />
            </button>
            <SidebarContent
              pathname={pathname}
              user={user}
              signOut={signOut}
              onNavigate={() => setOpen(false)}
            />
          </aside>
        </div>
      )}

      {/* Contenido principal */}
      <main className="flex-1 overflow-x-auto px-5 pb-12 pt-20 lg:px-10 lg:pt-10">
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
        <div className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-[var(--color-ink)] bg-[var(--color-accent)] text-base">
          🌱
        </div>
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
