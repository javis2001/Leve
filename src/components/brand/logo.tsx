import { cn } from "@/lib/utils";

/** Símbolo: folha que nasce de uma curva ascendente — crescimento leve e contínuo. */
export function LogoMark({ className, title = "Vida Leve" }: { className?: string; title?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={cn("size-10", className)} role="img" aria-label={title}>
      <rect width="48" height="48" rx="14" fill="#0F7A5A" />
      <path d="M11 34c6.5 0 11.5-2.6 15.6-8.2" stroke="#D6B36A" strokeWidth="2.6" strokeLinecap="round" fill="none" />
      <path d="M24.2 27.6c-1.3-8.4 3.3-14.7 13.6-16.4.9 10.6-4.6 16.8-13.6 16.4Z" fill="#FFFFFF" />
      <path d="M25.3 26.4c2.6-4.3 5.8-7.6 9.6-10" stroke="#138A65" strokeWidth="1.6" strokeLinecap="round" fill="none" />
      <circle cx="11" cy="34" r="2.2" fill="#D6B36A" />
    </svg>
  );
}

export function Logo({ className, tone = "dark", compact = false }: { className?: string; tone?: "dark" | "light"; compact?: boolean }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <LogoMark className="size-9 shrink-0" />
      {!compact && (
        <span className={cn("font-display text-[1.4rem] leading-none font-semibold tracking-tight", tone === "light" ? "text-white" : "text-forest")}>
          Vida <em className={cn("font-medium", tone === "light" ? "text-gold" : "text-[#A8842F]")}>Leve</em>
        </span>
      )}
    </span>
  );
}
