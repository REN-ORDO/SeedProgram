import { Check, X } from "lucide-react";
import { comparativoCopy, paqueteComparativo } from "@/lib/data";
import type { Diagnosis } from "@/lib/diagnosis";

/**
 * Plantilla de columnas compartida entre las tarjetas de opciones
 * (diagnosis-panel) y esta tabla en desktop: columna de etiqueta de 180px +
 * 3 columnas iguales. La tabla usa el mismo 180px vía `LABEL_COL_LG`.
 * Literales completos a propósito: Tailwind no detecta clases concatenadas.
 */
export const OPTIONS_GRID_LG = "lg:grid-cols-[180px_repeat(3,minmax(0,1fr))]";
export const LABEL_COL_LG = "lg:w-[180px]";

type Props = { opciones: Diagnosis["opciones"] };

// Tabla comparativa de las 3 opciones: qué incluye y qué no cada paquete.
// Presentacional; el paquete cae a "Impulso" igual que en el panel.
export function PackageComparison({ opciones }: Props) {
  const columnas = opciones.map((op, i) => ({
    key: i,
    paquete: op.paquete ?? "Impulso",
    entregable: op.entregable,
  }));

  return (
    <section className="mt-8">
      <h3 className="font-display text-lg font-bold leading-tight tracking-tight text-[var(--color-heading)]">
        {comparativoCopy.title}
      </h3>
      <p className="mt-1 text-[13px] text-[var(--color-fg-muted)]">
        {comparativoCopy.desc}
      </p>

      {/* El scroll horizontal vive en el contenedor, nunca en la página */}
      <div className="mt-3 overflow-x-auto rounded-xl border-2 border-[var(--color-ink)] bg-white shadow-[3px_3px_0_var(--color-ink)]">
        <table className="w-full min-w-[460px] sm:min-w-[560px] lg:min-w-0 lg:table-fixed border-collapse text-left text-[13px] text-[var(--color-ink)]">
          <thead>
            <tr className="bg-[var(--color-bg-sky)]">
              <td className="sticky left-0 z-10 w-[112px] sm:w-[34%] lg:w-[180px] bg-[var(--color-bg-sky)] p-3" />
              {columnas.map((c) => (
                <th
                  key={c.key}
                  scope="col"
                  className="border-l-2 border-[var(--color-ink)] p-3 align-top"
                >
                  <span className="block font-display text-[12px] font-bold">
                    Opción {c.key + 1}
                  </span>
                  <span className="mt-1 inline-block rounded-full border border-[var(--color-ink)] bg-[var(--color-bg-teal)] px-2.5 py-0.5 text-[11px] font-bold">
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
            {paqueteComparativo.map((row) => (
              <tr key={row.label} className="border-t border-[var(--color-ink)]">
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
    </section>
  );
}
