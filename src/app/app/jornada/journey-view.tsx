"use client";
import Link from "next/link";
import { Check, ChevronRight, Clock } from "lucide-react";
import { DataGate } from "@/components/app/data-gate";
import { FadeIn } from "@/components/app/motion";
import { PageHeader } from "@/components/app/page-header";
import { Progress } from "@/components/ui/progress";
import type { JourneyDay, JourneyWeek } from "@/lib/content/types";
import { completedDayNumbers, currentDay } from "@/lib/data/stats";
import { cn } from "@/lib/utils";

export function JourneyView({ days, weeks }: { days: JourneyDay[]; weeks: JourneyWeek[] }) {
  return (
    <DataGate>
      {(data) => {
        const cur = currentDay(data);
        const done = new Set(completedDayNumbers(data));
        return (
          <>
            <PageHeader
              eyebrow="Programa"
              title="Sua jornada de 30 dias"
              description="Um dia de cada vez. Você pode revisar qualquer dia quando quiser, sem perder o progresso."
            />
            <div className="space-y-8">
              {weeks.map((w, wi) => {
                const wDays = days.filter((d) => d.week === w.week);
                const wDone = wDays.filter((d) => done.has(d.day)).length;
                return (
                  <FadeIn key={w.week} delay={wi * 0.05}>
                    <section aria-labelledby={`semana-${w.week}`}>
                      <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                          <p className="text-xs font-bold tracking-[0.14em] text-gold-deep uppercase">Semana {w.week}</p>
                          <h2 id={`semana-${w.week}`} className="font-display text-2xl font-semibold text-forest">
                            {w.title}
                          </h2>
                          <p className="text-sm text-muted">{w.focus}</p>
                        </div>
                        <div className="w-full sm:w-48">
                          <p className="mb-1 text-right text-xs font-semibold text-muted">
                            {wDone}/{wDays.length} dias
                          </p>
                          <Progress value={(wDone / wDays.length) * 100} label={`Semana ${w.week}`} />
                        </div>
                      </div>
                      <ol className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
                        {wDays.map((d) => {
                          const isDone = done.has(d.day);
                          const isCur = d.day === cur && !isDone;
                          return (
                            <li key={d.day}>
                              <Link
                                href={`/app/dia/${d.day}`}
                                className={cn(
                                  "group flex items-center gap-3 rounded-2xl border bg-white p-3.5 shadow-soft transition hover:-translate-y-0.5 hover:shadow-lift",
                                  isCur ? "border-emerald ring-2 ring-emerald/20" : "border-line/80",
                                )}
                              >
                                <span
                                  className={cn(
                                    "grid size-12 shrink-0 place-items-center rounded-2xl text-lg font-extrabold",
                                    isDone ? "bg-emerald text-white" : isCur ? "bg-gold text-forest-deep" : "bg-mint text-forest",
                                  )}
                                >
                                  {isDone ? <Check className="size-6" strokeWidth={3} aria-label="Concluído" /> : d.day}
                                </span>
                                <span className="min-w-0 flex-1">
                                  <span className="block text-[0.7rem] font-bold text-muted uppercase">
                                    Dia {d.day}
                                    {isCur ? " · hoje" : ""}
                                  </span>
                                  <span className="block truncate font-bold">{d.title}</span>
                                  <span className="mt-0.5 flex items-center gap-1 text-xs text-muted">
                                    <Clock className="size-3" /> {d.activity.minutes} min de movimento
                                  </span>
                                </span>
                                <ChevronRight className="size-5 text-muted transition group-hover:translate-x-0.5" />
                              </Link>
                            </li>
                          );
                        })}
                      </ol>
                    </section>
                  </FadeIn>
                );
              })}
            </div>
          </>
        );
      }}
    </DataGate>
  );
}
