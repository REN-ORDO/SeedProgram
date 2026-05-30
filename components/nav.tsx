"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { Monogram } from "@/components/monogram";
import { navItems } from "@/lib/data";
import { cn } from "@/lib/utils";

export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<string>("#programa");

  // En /empresas el enlace cruzado apunta al home (aspirantes); en el resto, a /empresas.
  const pathname = usePathname();
  const isEmpresas = pathname === "/empresas";
  const crossLink = {
    href: isEmpresas ? "/" : "/empresas",
    label: isEmpresas ? "Para aspirantes" : "Para empresas",
    cursor: isEmpresas ? "Aspirantes" : "Empresas",
  };

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(`#${entry.target.id}`);
        }
      },
      { rootMargin: "-40% 0px -55% 0px", threshold: 0 }
    );
    for (const item of navItems) {
      const el = document.querySelector(item.href);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <motion.header
        initial={{ y: -24, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
          scrolled ? "py-3" : "py-5"
        )}
      >
        <div className="mx-auto max-w-6xl px-4">
          <div
            className={cn(
              "flex items-center justify-between rounded-full px-3 py-2 transition-all duration-300",
              scrolled
                ? "border-2 border-[--color-ink] bg-white shadow-[4px_4px_0_var(--color-ink)]"
                : "border-2 border-transparent"
            )}
          >
            <a
              href="#inicio"
              className="group flex items-center gap-2.5 transition-transform duration-300 hover:rotate-[-3deg]"
              aria-label="CooWeb · Inicio"
            >
              <Monogram size={36} />
              <span className="hidden sm:flex flex-col leading-none">
                <span className="font-display text-base font-bold text-[--color-ink]">CooWeb</span>
                <span className="text-[10px] uppercase tracking-[0.18em] text-[--color-fg-subtle]">
                  Programa Semilla
                </span>
              </span>
            </a>

            <nav className="hidden lg:flex items-center gap-1">
              {navItems.map((item) => {
                const isActive = active === item.href;
                return (
                  <a
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "group relative rounded-full px-3 py-1.5 text-sm font-semibold transition-colors",
                      isActive ? "text-[--color-ink]" : "text-[--color-fg-muted] hover:text-[--color-ink]"
                    )}
                  >
                    {isActive && (
                      <motion.span
                        layoutId="nav-active"
                        className="absolute inset-0 rounded-full border-2 border-[--color-ink] bg-[var(--color-accent-soft)]"
                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                      />
                    )}
                    <span className="relative flex items-center gap-1.5">
                      <span className="font-mono text-[10px] text-[--color-fg-subtle]">{item.index}</span>
                      {item.label}
                    </span>
                  </a>
                );
              })}
            </nav>

            <a
              href={crossLink.href}
              data-cursor={crossLink.cursor}
              className="hidden lg:inline-flex items-center rounded-full px-3 py-1.5 text-sm font-semibold text-[--color-fg-muted] transition-colors hover:text-[--color-ink]"
            >
              {crossLink.label}
            </a>

            <a
              href="/postular"
              data-cursor="Aplicar"
              className="hidden lg:inline-flex toon-btn"
              style={{ padding: "8px 18px", fontSize: 14 }}
            >
              Postularme
              <span className="text-base">→</span>
            </a>

            <button
              type="button"
              aria-label="Abrir menú"
              aria-expanded={open}
              onClick={() => setOpen(true)}
              className="lg:hidden inline-flex h-10 w-10 items-center justify-center rounded-full border-2 border-[--color-ink] bg-white shadow-[3px_3px_0_var(--color-ink)]"
            >
              <Menu size={18} />
            </button>
          </div>
        </div>
      </motion.header>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-[var(--color-bg)] lg:hidden"
          >
            <div className="flex items-center justify-between border-b-2 border-[--color-ink] p-6">
              <div className="flex items-center gap-2.5">
                <Monogram size={36} />
                <span className="font-display text-lg font-bold text-[--color-ink]">CooWeb</span>
              </div>
              <button
                type="button"
                aria-label="Cerrar menú"
                onClick={() => setOpen(false)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border-2 border-[--color-ink] bg-white shadow-[3px_3px_0_var(--color-ink)]"
              >
                <X size={18} />
              </button>
            </div>
            <nav className="flex flex-col gap-3 p-6 pt-8">
              {navItems.map((item, i) => (
                <motion.a
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 + i * 0.06, duration: 0.4 }}
                  className="group flex items-baseline justify-between rounded-2xl border-2 border-[--color-ink] bg-white px-5 py-4 shadow-[4px_4px_0_var(--color-ink)] transition-transform hover:-translate-y-0.5 hover:bg-[var(--color-accent-soft)]"
                >
                  <span className="flex items-baseline gap-3">
                    <span className="font-mono text-xs text-[--color-fg-subtle]">{item.index}</span>
                    <span className="font-display text-2xl font-bold text-[--color-ink]">{item.label}</span>
                  </span>
                  <span className="text-2xl text-[--color-ink] transition-transform group-hover:translate-x-1">
                    →
                  </span>
                </motion.a>
              ))}
              <a
                href={crossLink.href}
                onClick={() => setOpen(false)}
                className="group mt-4 flex items-baseline justify-between rounded-2xl border-2 border-[--color-ink] bg-white px-5 py-4 shadow-[4px_4px_0_var(--color-ink)] transition-transform hover:-translate-y-0.5 hover:bg-[var(--color-accent-soft)]"
              >
                <span className="font-display text-2xl font-bold text-[--color-ink]">
                  {crossLink.label}
                </span>
                <span className="text-2xl text-[--color-ink] transition-transform group-hover:translate-x-1">
                  →
                </span>
              </a>
              <a
                href="/postular"
                onClick={() => setOpen(false)}
                className="toon-btn mt-2 justify-center"
              >
                Postularme →
              </a>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
