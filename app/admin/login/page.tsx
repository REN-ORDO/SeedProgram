"use client";

import { Suspense, useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { Loader2, LogIn } from "lucide-react";
import { useAuth, isAdminEmail } from "@/lib/auth-context";
import { Monogram } from "@/components/monogram";

export default function AdminLoginPage() {
  return (
    <Suspense fallback={null}>
      <AdminLoginInner />
    </Suspense>
  );
}

function AdminLoginInner() {
  const router = useRouter();
  const search = useSearchParams();
  const { user, loading, signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const redirectTo = search.get("from") ?? "/admin";

  // Si ya está logueado y es admin, mandar al destino
  useEffect(() => {
    if (!loading && user && isAdminEmail(user.email)) {
      router.replace(redirectTo);
    }
  }, [loading, user, redirectTo, router]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await signIn(email, password);
      // El effect del onAuthStateChanged redirigirá
    } catch (err) {
      const code = (err as { code?: string })?.code;
      const message =
        code === "auth/invalid-credential" ||
        code === "auth/wrong-password" ||
        code === "auth/user-not-found"
          ? "Email o contraseña incorrectos."
          : code === "auth/too-many-requests"
            ? "Demasiados intentos. Intenta en unos minutos."
            : err instanceof Error
              ? err.message
              : "Error al iniciar sesión.";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="flex min-h-dvh items-center justify-center bg-[var(--color-bg)] px-5 py-12">
      <div className="relative w-full max-w-md">
        {/* Decoración */}
        <div
          aria-hidden
          className="pointer-events-none absolute -top-12 -right-8 h-32 w-32 rounded-full border-2 border-[var(--color-ink)] bg-[var(--color-bg-sky)] opacity-90"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-8 -left-8 h-24 w-24 rounded-[30%_70%_70%_30%/30%_30%_70%_70%] border-2 border-[var(--color-ink)] bg-[var(--color-bg-teal)] opacity-90"
        />

        <div className="toon-card relative p-8 sm:p-10">
          {/* Logo */}
          <div className="mb-6 flex items-center gap-2.5">
            <Monogram size={40} />
            <div className="leading-none">
              <div className="font-display text-base font-bold text-[var(--color-ink)]">
                CooWeb
              </div>
              <div className="mt-1 text-[10px] uppercase tracking-[0.2em] text-[var(--color-fg-subtle)]">
                Admin Panel
              </div>
            </div>
          </div>

          <h1 className="mb-1 font-display text-2xl font-bold leading-tight tracking-tight text-[var(--color-heading)]">
            Inicia sesión
          </h1>
          <p className="mb-6 text-sm text-[var(--color-fg-muted)]">
            Acceso restringido al equipo CooWeb.
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="mb-2 block font-display text-sm font-semibold text-[var(--color-ink)]">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                placeholder="admin@cooweb.ai"
                className="w-full rounded-xl border-2 border-[var(--color-ink)] bg-white px-4 py-3 text-[15px] shadow-[3px_3px_0_var(--color-ink)] outline-none transition-all focus:-translate-x-0.5 focus:-translate-y-0.5 focus:shadow-[5px_5px_0_var(--color-accent)]"
              />
            </div>

            <div>
              <label className="mb-2 block font-display text-sm font-semibold text-[var(--color-ink)]">
                Contraseña
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                placeholder="••••••••"
                className="w-full rounded-xl border-2 border-[var(--color-ink)] bg-white px-4 py-3 text-[15px] shadow-[3px_3px_0_var(--color-ink)] outline-none transition-all focus:-translate-x-0.5 focus:-translate-y-0.5 focus:shadow-[5px_5px_0_var(--color-accent)]"
              />
            </div>

            {error && (
              <div className="rounded-xl border-2 border-red-500 bg-red-50 px-4 py-3 text-sm font-medium text-red-700 shadow-[3px_3px_0_#ef4444]">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="toon-btn mt-2 justify-center disabled:opacity-60"
              style={{ background: "var(--color-ink)", color: "#fff" }}
            >
              {submitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Entrando...
                </>
              ) : (
                <>
                  <LogIn size={16} />
                  Entrar al admin
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
