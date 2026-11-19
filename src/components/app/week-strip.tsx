"use client";
import { activeHabits, habitDoneOn } from "@/lib/data/stats";
import type { UserData } from "@/lib/data/types";
import { WEEKDAYS_SHORT, addDays, cn, startOfWeek, toISODate } from "@/lib/utils";

export function WeekStrip({ data }: { data: UserData }) {
  const today = toISODate();
  const start = startOfWeek();
  const total = activeHabits(data).length;
  return (
    <ol className="grid grid-cols-7 gap-1.5" aria-label="Calendário da semana">
      {Array.from({ length: 7 }, (_, i) => {
        const d = addDays(start, i);
        const iso = toISODate(d);
        const done = habitDoneOn(data, iso);
        const pct = total ? done / total : 0;
        const isToday = iso === today;
        return (
          <li
            key={iso}
            className={cn("flex flex-col items-center gap-1.5 rounded-2xl py-2.5", isToday ? "bg-forest text-white shadow-soft" : "bg-mint/50")}
            aria-label={`${WEEKDAYS_SHORT[i]} ${d.getDate()}: ${done} de ${total} hábitos`}
          >
            <span className={cn("text-[0.65rem] font-bold uppercase", isToday ? "text-white/70" : "text-muted")}>{WEEKDAYS_SHORT[i]}</span>
            <span className="text-sm font-extrabold">{d.getDate()}</span>
            <span className="relative size-2.5 overflow-hidden rounded-full bg-black/10" aria-hidden>
              <span
                className={cn("absolute inset-0 rounded-full", isToday ? "bg-gold" : "bg-emerald")}
                style={{ opacity: pct === 0 ? 0 : 0.35 + pct * 0.65 }}
              />
            </span>
          </li>
        );
      })}
    </ol>
  );
}
