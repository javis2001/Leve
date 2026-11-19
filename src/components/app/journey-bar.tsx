import Link from "next/link";
import type { UserData } from "@/lib/data/types";
import { cn } from "@/lib/utils";

/** Barra visual dos 30 dias: cada segmento leva ao respectivo dia. */
export function JourneyBar({ data, current, light = false }: { data: UserData; current: number; light?: boolean }) {
  return (
    <ol className="grid grid-cols-10 gap-1.5 sm:gap-2" aria-label="Progresso dos 30 dias">
      {Array.from({ length: 30 }, (_, i) => {
        const day = i + 1;
        const done = Boolean(data.days[day]?.completedAt);
        const isCurrent = day === current && !done;
        return (
          <li key={day}>
            <Link
              href={`/app/dia/${day}`}
              aria-label={`Dia ${day}${done ? ", concluído" : isCurrent ? ", dia atual" : ""}`}
              className={cn(
                "grid h-7 place-items-center rounded-lg text-[0.65rem] font-bold transition hover:scale-105 sm:h-8 sm:text-xs",
                done
                  ? light
                    ? "bg-gold text-forest-deep"
                    : "bg-emerald text-white"
                  : isCurrent
                    ? light
                      ? "bg-white text-forest ring-2 ring-gold"
                      : "bg-white text-forest ring-2 ring-emerald"
                    : light
                      ? "bg-white/15 text-white/70"
                      : "bg-mint text-forest/60",
              )}
            >
              {day}
            </Link>
          </li>
        );
      })}
    </ol>
  );
}
