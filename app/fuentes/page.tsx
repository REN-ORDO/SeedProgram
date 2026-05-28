import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Test fuentes · CooWeb",
};

const accent = { color: "var(--color-accent)" };

const phrase = (
  <>
    Construimos <span style={accent}>software</span>
    <br />
    con <span style={accent}>inteligencia</span>
    <br />
    <span style={accent}>artificial</span>.
  </>
);

const candidates: { name: string; family: string; weight: string; note: string }[] = [
  {
    name: "Satoshi Black",
    family: "'Satoshi', system-ui, sans-serif",
    weight: "900",
    note: "Fontshare. Geométrica, terminales redondeadas. Top match visual.",
  },
  {
    name: "Cabinet Grotesk Black",
    family: "'Cabinet Grotesk', system-ui, sans-serif",
    weight: "900",
    note: "Fontshare. Más editorial, contadores anchos.",
  },
  {
    name: "Manrope ExtraBold",
    family: "var(--font-manrope), system-ui, sans-serif",
    weight: "800",
    note: "Google Fonts. Humanista, suave. Fácil de mantener.",
  },
  {
    name: "Plus Jakarta Sans ExtraBold",
    family: "var(--font-jakarta), system-ui, sans-serif",
    weight: "800",
    note: "Google Fonts. Moderna, ligeramente más estrecha.",
  },
  {
    name: "Inter ExtraBold (actual)",
    family: "var(--font-inter), system-ui, sans-serif",
    weight: "800",
    note: "Ya cargada. Baseline para comparar.",
  },
  {
    name: "Space Grotesk Bold",
    family: "var(--font-space-grotesk), system-ui, sans-serif",
    weight: "700",
    note: "Google Fonts. Más tech, condensada.",
  },
];

export default function FuentesPage() {
  return (
    <main className="mx-auto max-w-6xl px-6 py-24 md:px-10">
      <header className="mb-16">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-[--color-fg-subtle]">
          Test interno
        </p>
        <h1 className="mt-2 font-display text-4xl font-extrabold text-[--color-heading] md:text-5xl">
          Comparativa de tipografías
        </h1>
        <p className="mt-4 max-w-2xl text-[--color-fg-muted]">
          Misma frase de referencia en 6 candidatas. Elige cuál usar como
          <code className="mx-1 rounded bg-[--color-bg-elev] px-1.5 py-0.5 font-mono text-sm">--font-display</code>
          de la web.
        </p>
      </header>

      <div className="space-y-12">
        {candidates.map((c) => (
          <section
            key={c.name}
            className="rounded-2xl border border-[--color-border] bg-[--color-bg-elev]/40 p-8 backdrop-blur-md md:p-10"
          >
            <div className="mb-6 flex flex-wrap items-baseline justify-between gap-3">
              <h2 className="font-mono text-sm uppercase tracking-[0.15em] text-[--color-accent]">
                {c.name}
              </h2>
              <span className="font-mono text-xs text-[--color-fg-subtle]">
                weight: {c.weight}
              </span>
            </div>
            <p
              className="text-balance leading-[0.95] tracking-tight text-[--color-heading]"
              style={{
                fontFamily: c.family,
                fontWeight: c.weight,
                fontSize: "clamp(2.5rem, 7vw, 5.5rem)",
              }}
            >
              {phrase}
            </p>
            <p className="mt-6 text-sm text-[--color-fg-muted]">{c.note}</p>
          </section>
        ))}
      </div>

      <footer className="mt-20 border-t border-[--color-border] pt-8 text-sm text-[--color-fg-muted]">
        <p>
          Cuando decidas, dime el nombre y la aplico globalmente en
          <code className="mx-1 rounded bg-[--color-bg-elev] px-1.5 py-0.5 font-mono text-xs">app/globals.css</code>.
        </p>
      </footer>
    </main>
  );
}
