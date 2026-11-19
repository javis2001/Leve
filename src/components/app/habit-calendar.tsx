"use client";
import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { activeHabits, habitDoneOn } from "@/lib/data/stats";
import type { UserData } from "@/lib/data/types";
import { WEEKDAYS_SHORT, cn, toISODate } from "@/lib/utils";

/** Calendário mensal de conclusão: intensidade = proporção de hábitos marcados. */
export function HabitCalendar({ data }: { data: UserData }) {
  const [month, setMonth] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });
  const total = activeHabits(data).length || 1;
  const first = (month.getDay() + 6) % 7;
  const daysIn = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const today = toISODate();
  const cells = [...Array(first).fill(null), ...Array.from({ length: daysIn }, (_, i) => new Date(month.getFullYear(), month.getMonth(), i + 1))];
  const shades = ["bg-mint/40", "bg-[#bfe5d1]", "bg-[#7fc9a5]", "bg-[#3aa57c]", "bg-emerald"];
  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <button type="button" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))} className="grid size-9 place-items-center rounded-xl hover:bg-mint" aria-label="Mês anterior">
          <ChevronLeft className="size-5" />
        </button>
        <p className="font-bold first-letter:uppercase">{month.toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}</p>
        <button type="button" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))} className="grid size-9 place-items-center rounded-xl hover:bg-mint" aria-label="Próximo mês">
          <ChevronRight className="size-5" />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1.5 text-center">
        {WEEKDAYS_SHORT.map((d) => (
          <span key={d} className="text-[0.65rem] font-bold text-muted uppercase">{d}</span>
        ))}
        {cells.map((d, i) => {
          if (!d) return <span key={`e${i}`} />;
          const iso = toISODate(d);
          const done = habitDoneOn(data, iso);
          const level = done === 0 ? 0 : Math.min(4, Math.ceil((done / total) * 4));
          return (
            <span
              key={iso}
              title={`${d.toLocaleDateString("pt-BR")}: ${done} hábito(s)`}
              aria-label={`${d.getDate()}: ${done} de ${total} hábitos`}
              className={cn("grid aspect-square place-items-center rounded-lg text-xs font-bold", shades[level], level >= 3 ? "text-white" : "text-ink/70", iso === today && "ring-2 ring-gold ring-offset-1")}
            >
              {d.getDate()}
            </span>
          );
        })}
      </div>
      <div className="mt-3 flex items-center justify-end gap-1.5 text-[0.65rem] text-muted">
        menos {shades.map((s) => <span key={s} className={cn("size-3 rounded", s)} />)} mais
      </div>
    </div>
  );
}
