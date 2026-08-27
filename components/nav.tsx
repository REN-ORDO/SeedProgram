"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, ChevronDown, X } from "lucide-react";
import { Monogram } from "@/components/monogram";
import { MuteButton } from "@/components/mute-button";
import { navItems } from "@/lib/data";
import { cn } from "@/lib/utils";

const enterpriseNavItems = [
  { index: "01", label: "Problema", href: "#problema" },
  { index: "02", label: "Cómo funciona", href: "#modelo" },
  { index: "03", label: "Paquetes", href: "#paquetes" },
  { index: "04", label: "Soluciones", href: "#soluciones" },
  { index: "05", label: "Célula", href: "#celula" },
  { index: "06", label: "Beneficios", href: "#beneficios" },
] as const;

// Agrupación del dropdown "Explorar" para evitar que las secciones se junten.
const enterpriseNavGroups = [
  { label: "Descubrir", items: ["#problema", "#modelo"] },
  { label: "Servicios", items: ["#paquetes", "#soluciones", "#celula"] },
  { label: "Beneficios", items: ["#beneficios"] },
] as const;

export function Nav({ variant = "aspirantes" }: { variant?: "aspirantes" | "empresas" }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [exploreOpen, setExploreOpen] = useState<string | null>(null);
  const [active, setActive] = useState<string>("#programa");

  // El variant llega por prop desde cada página (determinístico en server y cliente),
  // para evitar hydration mismatch al branchar la estructura del menú.
  const isEmpresas = variant === "empresas";
  const currentNavItems = isEmpresas ? enterpriseNavItems : navItems;
  const crossLink = {
    href: isEmpresas ? "/" : "/empresas",
    label: isEmpresas ? "Para aspirantes" : "Para empresas",
    cursor: isEmpresas ? "Aspirantes" : "Empresas",
  };
  const cta = {
    label: isEmpresas ? "Diagnóstico" : "Postularme",
    cursor: isEmpresas ? "Diagnóstico" : "Aplicar",
  };
  const ctaHref = cta.label === "Diagnóstico" ? "/postular?rol=empresa" : "/postular";

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
    for (const item of currentNavItems) {
      const el = document.querySelector(item.href);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, [currentNavItems]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // Cierra los submenús de los tabs "Explorar" del desktop al hacer click fuera de ellos.
  useEffect(() => {
    if (!exploreOpen) return;
    const onClick = (e: MouseEvent) => {
      if (!(e.target as Element).closest("[data-explore-menu]")) setExploreOpen(null);
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [exploreOpen]);

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
              "nav-shell flex items-center justify-between px-3 py-2 transition-all duration-300",
              isEmpresas && "nav-shell--enterprise",
              isEmpresas
                ? scrolled
                  ? "nav-shell--solid"
                  : "nav-shell--ghost"
                : scrolled
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
              {isEmpresas ? (
                <div className="flex items-center gap-0.5" data-explore-menu>
                  {enterpriseNavGroups.map((group) => {
                    const isOpen = exploreOpen === group.label;
                    const groupActive = group.items.some((href) => active === href);
                    return (
                      <div
                        key={group.label}
                        className="relative"
                        onMouseEnter={() => setExploreOpen(group.label)}
                        onMouseLeave={() => setExploreOpen(null)}
                      >
                        <button
                          type="button"
                          aria-haspopup="true"
                          aria-expanded={isOpen}
                          onClick={() => setExploreOpen(isOpen ? null : group.label)}
                          className={cn(
                            "group flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold transition-colors rounded-lg",
                            isOpen || groupActive
                              ? "text-[--color-ink]"
                              : "text-[--color-fg-muted] hover:text-[--color-ink]"
                          )}
                        >
                          {group.label}
                          <ChevronDown
                            size={14}
                            strokeWidth={2.25}
                            aria-hidden
                            className={cn(
                              "text-current transition-transform duration-200",
                              isOpen && "rotate-180"
                            )}
                          />
                        </button>

                        <AnimatePresence>
                          {isOpen && (
                            <motion.div
                              initial={{ opacity: 0, y: 8 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: 8 }}
                              transition={{ duration: 0.16 }}
                              className="nav-dropdown absolute left-0 top-full z-50 mt-2 w-56 origin-top-left rounded-xl border border-[var(--color-border)] bg-white p-1.5 shadow-[0_12px_32px_rgba(15,23,42,.12)]"
                            >
                              {group.items.map((href) => {
                                const item = enterpriseNavItems.find((i) => i.href === href)!;
                                const isActive = active === item.href;
                                return (
                                  <a
                                    key={item.href}
                                    href={item.href}
                                    onClick={() => setExploreOpen(null)}
                                    className={cn(
                                      "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                                      isActive
                                        ? "bg-[var(--color-accent-soft)] text-[--color-ink]"
                                        : "text-[--color-fg-muted] hover:bg-[var(--color-bg-elev)] hover:text-[--color-ink]"
                                    )}
                                  >
                                    <span className="font-mono text-[10px] text-[--color-fg-subtle]">
                                      {item.index}
                                    </span>
                                    {item.label}
                                  </a>
                                );
                              })}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </div>
              ) : (
                currentNavItems.map((item) => {
                  const isActive = active === item.href;
                  return (
                    <a
                      key={item.href}
                      href={item.href}
                      className={cn(
                        cn("group relative px-3 py-1.5 text-sm font-semibold transition-colors", isEmpresas ? "rounded-lg" : "rounded-full"),
                        isActive ? "text-[--color-ink]" : "text-[--color-fg-muted] hover:text-[--color-ink]"
                      )}
                    >
                      {isActive && (
                        <motion.span
                          layoutId="nav-active"
                          className={cn(
                            cn("absolute inset-0 border-2 border-[--color-ink] bg-[var(--color-accent-soft)]", isEmpresas ? "rounded-md" : "rounded-full"),
                            isEmpresas && "nav-active--enterprise"
                          )}
                          transition={{ type: "spring", stiffness: 380, damping: 30 }}
                        />
                      )}
                      <span className="relative flex items-center gap-1.5">
                        <span className="font-mono text-[10px] text-[--color-fg-subtle]">{item.index}</span>
                        {item.label}
                      </span>
                    </a>
                  );
                })
              )}
            </nav>

            <a
              href={crossLink.href}
              data-cursor={crossLink.cursor}
              className={cn("hidden lg:inline-flex items-center px-3 py-1.5 text-sm font-semibold text-[--color-fg-muted] transition-colors hover:text-[--color-ink]", isEmpresas ? "rounded-lg" : "rounded-full")}
            >
              {crossLink.label}
            </a>

            <a
              href={ctaHref}
              data-cursor={cta.cursor}
              className={cn("hidden lg:inline-flex toon-btn", isEmpresas && "nav-cta--enterprise")}
              style={{ padding: "8px 18px", fontSize: 14 }}
            >
              {cta.label}
              <span className="text-base">→</span>
            </a>

            <div className="flex items-center gap-2">
              <MuteButton className={isEmpresas ? "nav-control--enterprise" : undefined} />

              <button
                type="button"
                aria-label="Abrir menú"
                aria-expanded={open}
                onClick={() => setOpen(true)}
                className={cn(
                  "lg:hidden inline-flex h-10 w-10 items-center justify-center rounded-full border-2 border-[--color-ink] bg-white shadow-[3px_3px_0_var(--color-ink)]",
                  isEmpresas && "nav-control--enterprise"
                )}
              >
                <Menu size={18} />
              </button>
            </div>
          </div>
        </div>
      </motion.header>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={cn("fixed inset-0 z-[60] bg-[var(--color-bg)] lg:hidden", isEmpresas && "nav-menu--enterprise")}
          >
            <div className="nav-menu__header flex items-center justify-between border-b-2 border-[--color-ink] p-6">
              <div className="flex items-center gap-2.5">
                <Monogram size={36} />
                <span className="font-display text-lg font-bold text-[--color-ink]">CooWeb</span>
              </div>
              <div className="flex items-center gap-2">
                <MuteButton className={isEmpresas ? "nav-control--enterprise" : undefined} />
                <button
                  type="button"
                  aria-label="Cerrar menú"
                  onClick={() => setOpen(false)}
                  className={cn(
                    "inline-flex h-10 w-10 items-center justify-center rounded-full border-2 border-[--color-ink] bg-white shadow-[3px_3px_0_var(--color-ink)]",
                    isEmpresas && "nav-control--enterprise"
                  )}
                >
                  <X size={18} />
                </button>
              </div>
            </div>
            <nav className="flex flex-col gap-3 p-6 pt-8">
              {currentNavItems.map((item, i) => (
                <motion.a
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 + i * 0.06, duration: 0.4 }}
                  className={cn(
                    "nav-menu__link group flex items-baseline justify-between rounded-2xl border-2 border-[--color-ink] bg-white px-5 py-4 shadow-[4px_4px_0_var(--color-ink)] transition-transform hover:-translate-y-0.5 hover:bg-[var(--color-accent-soft)]",
                    isEmpresas && "nav-menu__link--enterprise"
                  )}
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
                className={cn(
                  "nav-menu__link group mt-4 flex items-baseline justify-between rounded-2xl border-2 border-[--color-ink] bg-white px-5 py-4 shadow-[4px_4px_0_var(--color-ink)] transition-transform hover:-translate-y-0.5 hover:bg-[var(--color-accent-soft)]",
                  isEmpresas && "nav-menu__link--enterprise"
                )}
              >
                <span className="font-display text-2xl font-bold text-[--color-ink]">
                  {crossLink.label}
                </span>
                <span className="text-2xl text-[--color-ink] transition-transform group-hover:translate-x-1">
                  →
                </span>
              </a>
              <a
                href={ctaHref}
                onClick={() => setOpen(false)}
                className={cn("toon-btn mt-2 justify-center", isEmpresas && "nav-cta--enterprise")}
              >
                {cta.label} →
              </a>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
