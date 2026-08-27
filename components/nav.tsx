"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, animate, motion, useReducedMotion } from "framer-motion";
import { Menu, X } from "lucide-react";
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

// Versión reducida para el segmented pill del toolbar de la ventana.
// El resto de secciones queda disponible en el menú móvil.
const enterprisePillItems = [
  { index: "00", label: "Inicio", href: "#inicio" },
  { index: "01", label: "Problema", href: "#problema" },
  { index: "02", label: "Modelo", href: "#modelo" },
  { index: "03", label: "Paquetes", href: "#paquetes" },
  { index: "04", label: "Soluciones", href: "#soluciones" },
] as const;

const DESKTOP_QUERY = "(min-width: 1024px)";

export function Nav({ variant = "aspirantes" }: { variant?: "aspirantes" | "empresas" }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<string>(variant === "empresas" ? "#inicio" : "#programa");
  const reduce = useReducedMotion() ?? false;

  // El variant llega por prop desde cada página (determinístico en server y cliente),
  // para evitar hydration mismatch al branquear la estructura del menú.
  const isEmpresas = variant === "empresas";

  // Estado del modo "chrome" (empresas): la nav es la barra de herramientas de la
  // ventana del hero y, al pasar el umbral de scroll, "sale" de la ventana y flota.
  const headerRef = useRef<HTMLElement | null>(null);
  const [floating, setFloating] = useState(false);
  const [fixed, setFixed] = useState(false);
  const [fixedTop, setFixedTop] = useState(16);
  const transitionInFlight = useRef(false);

  const currentNavItems = isEmpresas ? enterpriseNavItems : navItems;
  const scrollSpyItems = isEmpresas ? enterprisePillItems : navItems;
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

  // Scroll: en modo estándar la nav pasa a sólida; en chrome el pill abandona la
  // ventana cuando su toolbar llega al borde superior y vuelve cuando reaparece.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    const onChromeScroll = () => {
      // En <lg el pill está oculto (hamburguesa como fallback): nunca flota.
      if (!window.matchMedia(DESKTOP_QUERY).matches) {
        setFloating(false);
        return;
      }
      if (transitionInFlight.current) return;
      if (fixed) {
        // La nav ya flota (position:fixed). Para volver a la ventana esperamos
        // a que el usuario retorne al inicio (scroll ~0): ahí la ventana
        // vuelve a reposar perfil a la vista y la nav se reúne con ella.
        // Usamos scrollY (no el top de la ventana) porque al tocar el top el
        // windowTop es 96 rizado por la inercia y un umbral frágil fallaría.
        if (window.scrollY <= 4) setFloating(false);
      } else {
        // Nav dentro de la ventana: sale a flotar cuando su toolbar roza el
        // borde superior del viewport.
        const titlebar = headerRef.current;
        if (!titlebar) return;
        const top = titlebar.getBoundingClientRect().top;
        if (top <= 8) setFloating(true);
      }
    };
    const handler = isEmpresas ? onChromeScroll : onScroll;
    handler();
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, [isEmpresas, fixed]);

  // Al cruzar a escritorio, la nav flota desde donde estaba el toolbar (fade out,
  // salta a position:fixed y fade in arriba). Respeta prefers-reduced-motion.
  useEffect(() => {
    if (!isEmpresas || !floating || fixed) return;
    if (!window.matchMedia(DESKTOP_QUERY).matches) return;
    let alive = true;
    transitionInFlight.current = true;
    const el = headerRef.current;
    const run = async () => {
      if (el && !reduce) {
        await animate(el, { opacity: 0, y: -16 }, { duration: 0.18, ease: "easeOut" });
      }
      if (!alive) return;
      setFixedTop(16);
      setFixed(true);
      if (el && !reduce) {
        await animate(el, { opacity: 1, y: 0 }, { duration: 0.22, ease: "easeOut" });
      }
      transitionInFlight.current = false;
    };
    run();
    return () => {
      alive = false;
    };
  }, [isEmpresas, floating, fixed, reduce]);

  // Al volver al hero, la nav vuelve al toolbar de la ventana (mismo patrón inverso).
  useEffect(() => {
    if (!isEmpresas || floating || !fixed) return;
    let alive = true;
    transitionInFlight.current = true;
    const el = headerRef.current;
    const run = async () => {
      if (el && !reduce) {
        await animate(el, { opacity: 0, y: -16 }, { duration: 0.18, ease: "easeOut" });
      }
      if (!alive) return;
      const windowEl = document.querySelector(".empresas-window");
      const slotTop = windowEl ? windowEl.getBoundingClientRect().top + 1 : 80;
      setFixedTop(slotTop);
      setFixed(false);
      if (el && !reduce) {
        await animate(el, { opacity: 1, y: 0 }, { duration: 0.22, ease: "easeOut" });
      }
      transitionInFlight.current = false;
    };
    run();
    return () => {
      alive = false;
    };
  }, [isEmpresas, floating, fixed, reduce]);

  // Si la ventana pasa a <lg mientras flota, libera el pill (vuelve al flujo).
  useEffect(() => {
    const mq = window.matchMedia(DESKTOP_QUERY);
    const onChange = (e: MediaQueryListEvent) => {
      if (!e.matches) setFloating(false);
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
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
    for (const item of scrollSpyItems) {
      const el = document.querySelector(item.href);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, [scrollSpyItems]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      {isEmpresas ? (
        <header
          ref={headerRef}
          style={fixed ? { top: fixedTop } : undefined}
          className={cn("empresas-chrome-nav", fixed && "empresas-chrome-nav--fixed")}
        >
          <div className="empresas-chrome-nav__side justify-self-start">
            <span className="empresas-traffic" aria-hidden="true">
              <span className="empresas-traffic__dot empresas-traffic__red" />
              <span className="empresas-traffic__dot empresas-traffic__amber" />
              <span className="empresas-traffic__dot empresas-traffic__green" />
            </span>
            <a
              href="#inicio"
              aria-label="CooWeb · Ir al inicio"
              className="empresas-chrome-nav__brand group flex items-center gap-2"
            >
              <Monogram size={30} />
              <span className="hidden sm:flex flex-col leading-none">
                <span className="font-display text-sm font-bold text-[--color-fg]">CooWeb</span>
                <span className="text-[9px] uppercase tracking-[0.16em] text-[--color-fg-subtle]">
                  Programa Semilla
                </span>
              </span>
            </a>
          </div>

          <div className="empresas-pill">
            <nav className="flex items-center gap-1" aria-label="Secciones">
              {enterprisePillItems.map((item) => {
                const isActive = active === item.href;
                return (
                  <a
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "relative px-3.5 py-2 text-sm font-semibold transition-colors",
                      isActive
                        ? "text-[--color-ink]"
                        : "text-[--color-fg-muted] hover:text-[--color-ink]"
                    )}
                  >
                    {isActive && (
                      <motion.span
                        layoutId="nav-active-pill"
                        className="absolute inset-0 rounded-full border border-[var(--color-accent-strong)] bg-[var(--color-accent-soft)]"
                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                      />
                    )}
                    <span className="relative flex items-center gap-1.5">
                      <span className="font-mono text-[10px] text-[--color-fg-subtle]">
                        {item.index}
                      </span>
                      {item.label}
                    </span>
                  </a>
                );
              })}
            </nav>
            <span className="empresas-pill__divider" aria-hidden="true" />
            <a href={ctaHref} data-cursor={cta.cursor} className="toon-btn nav-cta--enterprise empresas-pill__cta">
              {cta.label}
              <span className="text-base">→</span>
            </a>
          </div>

          <div className="empresas-chrome-nav__side justify-self-end">
            <span className="hidden sm:inline-flex">
              <MuteButton className="nav-control--enterprise" />
            </span>
            <a
              href={ctaHref}
              data-cursor={cta.cursor}
              className="lg:hidden inline-flex items-center gap-1 rounded-full bg-[#2dd4bf] px-3.5 py-2 text-sm font-semibold text-[#0f172a] hover:bg-[#14b8a6]"
            >
              {cta.label}
              <span aria-hidden="true">→</span>
            </a>
            <button
              type="button"
              aria-label="Abrir menú"
              aria-expanded={open}
              onClick={() => setOpen(true)}
              className="lg:hidden inline-flex h-10 w-10 items-center justify-center rounded-full border-2 border-[--color-ink] bg-white shadow-[3px_3px_0_var(--color-ink)] nav-control--enterprise"
            >
              <Menu size={18} />
            </button>
          </div>
        </header>
      ) : (
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
                {currentNavItems.map((item) => {
                  const isActive = active === item.href;
                  return (
                    <a
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "group relative px-3 py-1.5 text-sm font-semibold transition-colors rounded-full",
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
                className="hidden lg:inline-flex items-center px-3 py-1.5 text-sm font-semibold text-[--color-fg-muted] transition-colors hover:text-[--color-ink]"
              >
                {crossLink.label}
              </a>

              <a
                href={ctaHref}
                data-cursor={cta.cursor}
                className="hidden lg:inline-flex toon-btn"
                style={{ padding: "8px 18px", fontSize: 14 }}
              >
                {cta.label}
                <span className="text-base">→</span>
              </a>

              <div className="flex items-center gap-2">
                <MuteButton />
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
          </div>
        </motion.header>
      )}

      {typeof document !== "undefined" &&
        createPortal(
          <AnimatePresence>
            {open && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className={cn(
                  "fixed inset-0 z-[60] bg-[var(--color-bg)] lg:hidden",
                  isEmpresas && "nav-menu--enterprise"
                )}
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
        </AnimatePresence>,
        document.body
      )}
    </>
  );
}