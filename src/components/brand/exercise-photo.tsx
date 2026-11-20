/* eslint-disable @next/next/no-img-element */
import { cn } from "@/lib/utils";

/**
 * Foto quadrada de exercício em um quadro de qualquer proporção: a foto inteira fica visível
 * (sem cortar cabeça ou pés) e as laterais são preenchidas com a própria foto desfocada.
 */
export function ExercisePhoto({ src, alt, className, lazy = true }: { src: string; alt: string; className?: string; lazy?: boolean }) {
  return (
    <span className={cn("relative block h-full w-full overflow-hidden bg-[#efe7dc]", className)}>
      <img src={src} alt="" aria-hidden className="absolute inset-0 h-full w-full scale-110 object-cover opacity-70 blur-xl" loading={lazy ? "lazy" : undefined} />
      <img src={src} alt={alt} className="relative h-full w-full object-contain" loading={lazy ? "lazy" : undefined} />
    </span>
  );
}
