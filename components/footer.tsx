import { Monogram } from "@/components/monogram";

export function Footer() {
  return (
    <footer
      className="border-t-2 border-[--color-ink] px-6 py-16 md:px-10"
      style={{ background: "var(--color-bg-soft)" }}
    >
      <div className="mx-auto grid max-w-6xl gap-10 md:grid-cols-4">
        <div className="md:col-span-2">
          <div className="flex items-center gap-3">
            <Monogram size={44} />
            <span className="font-display text-xl font-bold text-[--color-ink]">CooWeb</span>
          </div>
          <p className="mt-5 max-w-sm text-sm text-[--color-fg-muted]">
            Ecosistema AI-First. Encontramos talento donde otros no miran y lo formamos con propósito.
          </p>
          <p className="mt-4 text-xs text-[--color-fg-subtle]">
            Barranquilla, Colombia · v0.5.0 · © 2026
          </p>
        </div>

        <div>
          <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-[--color-ink]">
            Programa
          </div>
          <ul className="mt-4 space-y-2 text-sm text-[--color-fg-muted]">
            <li><a href="#niveles" className="font-semibold transition-colors hover:text-[--color-ink] hover:underline">Niveles</a></li>
            <li><a href="#plan" className="font-semibold transition-colors hover:text-[--color-ink] hover:underline">Plan 4 semanas</a></li>
            <li><a href="#cultura" className="font-semibold transition-colors hover:text-[--color-ink] hover:underline">Cultura</a></li>
            <li><a href="#batches" className="font-semibold transition-colors hover:text-[--color-ink] hover:underline">Batches</a></li>
          </ul>
        </div>

        <div>
          <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-[--color-ink]">
            Contacto
          </div>
          <ul className="mt-4 space-y-2 text-sm text-[--color-fg-muted]">
            <li>semilla@cooweb.co</li>
            <li>Barranquilla, CO</li>
            <li>@cooweb.co</li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
