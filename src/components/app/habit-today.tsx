"use client";
import { Check } from "lucide-react";
import { motion } from "motion/react";
import { DynIcon } from "@/components/brand/icon";
import { useUserData } from "@/lib/data/provider";
import { activeHabits } from "@/lib/data/stats";
import type { UserData } from "@/lib/data/types";
import { cn, toISODate } from "@/lib/utils";

export function HabitToday({ data, date = toISODate(), compact = false }: { data: UserData; date?: string; compact?: boolean }) {
  const { toggleHabit } = useUserData();
  const habits = activeHabits(data);
  const done = new Set(data.habitLogs[date] ?? []);
  if (!habits.length) return <p className="text-sm text-muted">Nenhum hábito ativo. Adicione um em Hábitos.</p>;
  return (
    <ul className={cn("grid grid-cols-1 gap-2", !compact && "sm:grid-cols-2")}>
      {habits.map((h) => {
        const on = done.has(h.id);
        return (
          <li key={h.id}>
            <button
              type="button"
              role="checkbox"
              aria-checked={on}
              onClick={() => toggleHabit(h.id, date)}
              className={cn(
                "flex w-full items-center gap-3 rounded-2xl border p-3 text-left transition",
                on ? "border-emerald/30 bg-mint" : "border-line bg-white hover:border-emerald/40",
              )}
            >
              <span className={cn("grid size-10 shrink-0 place-items-center rounded-xl", on ? "bg-emerald text-white" : "bg-mint text-emerald")}>
                <DynIcon name={h.icon} className="size-5" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-bold">{h.label}</span>
                {h.goal && !compact ? <span className="block truncate text-xs text-muted">{h.goal}</span> : null}
              </span>
              <motion.span
                animate={on ? { scale: [0.6, 1.15, 1] } : { scale: 1 }}
                className={cn("grid size-7 shrink-0 place-items-center rounded-full border-2", on ? "border-emerald bg-emerald text-white" : "border-line")}
              >
                {on ? <Check className="size-4" strokeWidth={3} /> : null}
              </motion.span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
