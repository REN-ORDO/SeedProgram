import Image from "next/image";
import { cn } from "@/lib/utils";

export function Monogram({
  className,
  size = 40,
}: {
  className?: string;
  size?: number;
}) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-[--color-ink] bg-white shadow-[3px_3px_0_var(--color-ink)]",
        className
      )}
      style={{ width: size, height: size }}
    >
      <Image
        src="/logo-cooweb.png"
        alt="CooWeb · Programa Semilla"
        width={size}
        height={size}
        priority
        unoptimized
        className="block h-full w-full object-contain p-0.5"
      />
    </span>
  );
}
