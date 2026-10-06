"use client";

import { useId, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Check, ChevronDown, X } from "lucide-react";
import { comparativoCopy, packageTiers, paqueteComparativo } from "@/lib/data";
import type { Diagnosis } from "@/lib/diagnosis";

type Props = { opciones: Diagnosis["opciones"] };

// Tabla comparativa de las opciones (ya ordenadas por nivel): qué incluye y
// qué no cada paquete. Colapsada por defecto. Presentacional; el paquete cae
// a "Impulso" igual que en el panel.
export function PackageComparison({ opciones }: Props) {
  const [open, setOpen] = useState(false);
  const reduce = useReducedMotion();
  const panelId = useId();

  const columnas = opciones.map((op, i) => {
    const paquete = op.paquete ?? "Impulso";
    return {
      key: i,
      paquete,
      kicker: packageTiers[paquete].kicker,
      entregable: op.entregable,
    };
  });

  // Una fila que dice lo mismo para las tres opciones no ayuda a elegir: se oculta.
  const filas = paqueteComparativo.filter((row) =>
    columnas.some((c) => row.values[c.paquete] !== row.values[columnas[0].paquete]),
  );

  return (
    <section className="mt-8">
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
        <div>
          <h3 className="font-display text-lg font-bold leading-tight tracking-tight text-[var(--color-heading)]">
            {comparativoCopy.title}
          </h3>
          <p className="mt-1 text-[13px] text-[var(--color-fg-muted)]">
            {comparativoCopy.desc}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls={panelId}
          className="inline-flex items-center gap-2 rounded-full border-2 border-[var(--color-ink)] bg-white px-4 py-2 font-display text-[13px] font-bold text-[var(--color-ink)] shadow-[3px_3px_0_var(--color-ink)] transition-all duration-150 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[5px_5px_0_var(--color-ink)]"
        >
          {open ? comparativoCopy.ocultar : comparativoCopy.verMas}
          <ChevronDown
            size={16}
            aria-hidden="true"
            className={`transition-transform duration-200 motion-reduce:transition-none ${open ? "rotate-180" : ""}`}
          />
        </button>
      </div>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            id={panelId}
            key="tabla"
            initial={reduce ? false : { height: 0, opacity: 0 }}
            animate={reduce ? undefined : { height: "auto", opacity: 1 }}
            exit={reduce ? undefined : { height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="overflow-hidden"
          >
            {/* Padding para que la sombra offset no se recorte por overflow-hidden */}
            <div className="pb-1.5 pr-1.5 pt-3">
              {/* El scroll horizontal vive en el contenedor, nunca en la página */}
              <div className="overflow-x-auto rounded-2xl border-2 border-[var(--color-ink)] bg-white shadow-[3px_3px_0_var(--color-ink)]">
                <table className="w-full min-w-[520px] border-collapse text-left text-[13px] text-[var(--color-ink)] lg:min-w-0 lg:table-fixed">
                  <thead>
                    <tr className="bg-[var(--color-bg-sky)]">
                      <td className="sticky left-0 z-10 w-[112px] bg-[var(--color-bg-sky)] p-3 sm:w-[34%] lg:w-[200px]" />
                      {columnas.map((c) => (
                        <th
                          key={c.key}
                          scope="col"
                          className="border-l-2 border-[var(--color-ink)] p-3 align-top"
                        >
                          <span className="block font-mono text-[10px] font-semibold uppercase tracking-widest text-[var(--color-fg-muted)]">
                            {c.kicker}
                          </span>
                          <span className="mt-0.5 block font-display text-[15px] font-bold">
                            {c.paquete}
                          </span>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-t-2 border-[var(--color-ink)]">
                      <th
                        scope="row"
                        className="sticky left-0 z-10 bg-white p-3 align-top font-display text-[13px] font-bold"
                      >
                        {comparativoCopy.entregable}
                      </th>
                      {columnas.map((c) => (
                        <td
                          key={c.key}
                          className="border-l-2 border-[var(--color-ink)] p-3 align-top text-[12px] leading-snug text-[var(--color-fg-muted)]"
                        >
                          {c.entregable}
                        </td>
                      ))}
                    </tr>
                    {filas.map((row) => (
                      <tr
                        key={row.label}
                        className="border-t border-[var(--color-ink)]"
                      >
                        <th
                          scope="row"
                          className="sticky left-0 z-10 bg-white p-3 align-top text-[13px] font-medium"
                        >
                          {row.label}
                        </th>
                        {columnas.map((c) => {
                          const value = row.values[c.paquete];
                          return (
                            <td
                              key={c.key}
                              className="border-l-2 border-[var(--color-ink)] p-3 align-top"
                            >
                              {value === true ? (
                                <>
                                  <Check
                                    size={16}
                                    aria-hidden="true"
                                    className="text-[var(--color-accent-strong)]"
                                  />
                                  <span className="sr-only">Incluido</span>
                                </>
                              ) : value === false ? (
                                <>
                                  <X
                                    size={16}
                                    aria-hidden="true"
                                    className="text-[var(--color-fg-muted)] opacity-60"
                                  />
                                  <span className="sr-only">No incluido</span>
                                </>
                              ) : (
                                <span className="font-medium">{value}</span>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
