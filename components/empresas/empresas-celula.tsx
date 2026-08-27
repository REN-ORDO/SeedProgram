"use client";

import { Sprout, ShieldCheck, Plus } from "lucide-react";
import { Reveal } from "@/components/reveal";
import { empresaCelula } from "@/lib/data";

export function EmpresasCelula() {
  const { title, desc, joven, mentor } = empresaCelula;
  return (
    <section
      id="celula"
      aria-label="Tu célula de desarrollo"
      className="relative px-5 py-16 md:px-10 md:py-32 toon-section toon-section--navy"
    >
      <div className="mx-auto max-w-5xl">
        <Reveal className="mb-3 flex items-center gap-3 font-mono text-xs uppercase tracking-[0.2em] text-[#7dd3fc]">
          <span className="font-bold text-[#0F172A]">03</span>
          <span className="h-[2px] w-12 bg-[#0F172A]" />
          <span>El equipo asignado</span>
        </Reveal>

        <Reveal delay={0.05}>
          <h2 className="max-w-3xl text-balance font-display text-4xl font-bold leading-[1.05] tracking-tight text-[#0C4A6E] md:text-5xl">
            {title}
          </h2>
        </Reveal>
        <Reveal delay={0.12}>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-[#475569] md:text-lg">
            {desc}
          </p>
        </Reveal>

        <div className="mt-12 grid items-stretch gap-6 md:grid-cols-[1fr_auto_1fr_auto_1fr]">
          <Reveal delay={0.12}>
            <DuplaCard Icon={ShieldCheck} bg="var(--color-surface)" label="Empresa" role="Reto y contexto" desc="Define el reto, comparte el contexto del negocio y valida el resultado." />
          </Reveal>
          <div className="flex items-center justify-center"><span className="text-[#5eead4]">+</span></div>
          <Reveal delay={0.18}>
            <DuplaCard
              Icon={Sprout}
              bg="var(--color-bg-elev)"
              label={joven.label}
              role={joven.role}
              desc={joven.desc}
            />
          </Reveal>

          <div className="flex items-center justify-center">
            <span className="text-[#5eead4]">
              <Plus size={20} strokeWidth={2} />
            </span>
          </div>

          <Reveal delay={0.24}>
            <DuplaCard
              Icon={ShieldCheck}
              bg="var(--color-surface)"
              label={mentor.label}
              role={mentor.role}
              desc={mentor.desc}
            />
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function DuplaCard({
  Icon,
  bg,
  label,
  role,
  desc,
}: {
  Icon: React.ComponentType<{ size?: number }>;
  bg: string;
  label: string;
  role: string;
  desc: string;
}) {
  return (
    <article className="toon-card h-full p-7" style={{ background: bg }} data-cursor="Rol">
      <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-elev)] text-[#f8fafc]">
        <Icon size={22} />
      </span>
      <h3 className="mt-5 font-display text-2xl font-bold leading-tight text-[#0F172A]">
        {label}
      </h3>
      <p className="mt-1 font-mono text-xs uppercase tracking-wider text-[var(--color-fg-muted)]">
        {role}
      </p>
       <p className="mt-3 text-base leading-relaxed text-[var(--color-fg-muted)]">{desc}</p>
    </article>
  );
}
