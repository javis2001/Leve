"use client";
import { BookHeart, CalendarCheck, CircleCheckBig, Flame, Heart, Trophy } from "lucide-react";
import { AchievementBadge } from "@/components/app/achievement-badge";
import { PercentBars, WellbeingLines } from "@/components/app/charts";
import { DataGate } from "@/components/app/data-gate";
import { JourneyBar } from "@/components/app/journey-bar";
import { FadeIn } from "@/components/app/motion";
import { PageHeader } from "@/components/app/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Progress, ProgressRing } from "@/components/ui/progress";
import type { JourneyWeek } from "@/lib/content/types";
import { achievementInput, achievementStates, completedDayNumbers, currentDay, habitStats, journeyPercent, weeklyEvolution } from "@/lib/data/stats";
import type { UserData } from "@/lib/data/types";
import { addDays, formatDateBR, startOfWeek, toISODate } from "@/lib/utils";

function wellbeingByWeek(data: UserData, weeks = 6) {
  const start = startOfWeek();
  return Array.from({ length: weeks }, (_, i) => {
    const ws = addDays(start, -7 * (weeks - 1 - i));
    const es = Array.from({ length: 7 }, (_, d) => data.journal[toISODate(addDays(ws, d))]).filter(Boolean);
    const avg = (k: "mood" | "energy" | "sleep") => {
      const v = es.map((e) => e[k]).filter((x): x is number => x != null);
      return v.length ? Math.round((v.reduce((a, b) => a + b, 0) / v.length) * 10) / 10 : null;
    };
    return { label: formatDateBR(ws, { day: "2-digit", month: "2-digit" }), humor: avg("mood"), energia: avg("energy"), sono: avg("sleep") };
  });
}

export function ProgressView({ weeks }: { weeks: JourneyWeek[] }) {
  return (
    <DataGate>
      {(data) => {
        const done = new Set(completedDayNumbers(data));
        const pct = journeyPercent(data);
        const hs = habitStats(data);
        const input = achievementInput(data);
        const ach = achievementStates(data);
        const unlocked = ach.filter((a) => a.unlocked).length;
        const tiles = [
          { icon: CircleCheckBig, label: "Dias concluídos", value: `${done.size}/30` },
          { icon: Flame, label: "Dias com hábitos", value: hs.activeDays },
          { icon: BookHeart, label: "Registros no diário", value: input.journalEntries },
          { icon: Heart, label: "Receitas favoritas", value: input.favorites },
          { icon: CalendarCheck, label: "Refeições planejadas", value: input.mealPlanSlots },
          { icon: Trophy, label: "Conquistas", value: `${unlocked}/${ach.length}` },
        ];
        return (
          <>
            <PageHeader eyebrow="Evolução" title="Seu progresso" description="Cada número aqui representa um momento em que você escolheu cuidar de si." />
            <FadeIn>
              <Card>
                <CardContent className="flex flex-col items-center gap-6 sm:flex-row">
                  <ProgressRing value={pct} size={140} stroke={12}>
                    <div>
                      <p className="text-3xl font-extrabold text-forest">{pct}%</p>
                      <p className="text-xs font-semibold text-muted">da jornada</p>
                    </div>
                  </ProgressRing>
                  <div className="w-full flex-1">
                    <p className="mb-3 font-bold">Próximo passo: dia {currentDay(data)}</p>
                    <JourneyBar data={data} current={currentDay(data)} />
                    <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
                      {weeks.map((w) => {
                        const total = w.days[1] - w.days[0] + 1;
                        let c = 0;
                        for (let d = w.days[0]; d <= w.days[1]; d++) if (done.has(d)) c++;
                        return (
                          <div key={w.week}>
                            <p className="mb-1 flex justify-between text-xs font-semibold">
                              <span>Semana {w.week} · {w.title}</span>
                              <span className="text-muted">{c}/{total}</span>
                            </p>
                            <Progress value={(c / total) * 100} label={`Semana ${w.week}`} />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </FadeIn>

            <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
              {tiles.map((t) => (
                <div key={t.label} className="rounded-3xl border border-line bg-white p-4 shadow-soft">
                  <t.icon className="size-5 text-emerald" />
                  <p className="mt-2 text-2xl font-extrabold text-forest">{t.value}</p>
                  <p className="text-xs font-semibold text-muted">{t.label}</p>
                </div>
              ))}
            </div>

            <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-2">
              <Card>
                <CardContent>
                  <h2 className="font-bold">Hábitos por semana</h2>
                  <p className="mb-4 text-xs text-muted">Percentual de hábitos marcados</p>
                  <PercentBars data={weeklyEvolution(data)} label="Percentual de hábitos concluídos por semana" />
                </CardContent>
              </Card>
              <Card>
                <CardContent>
                  <h2 className="font-bold">Bem-estar por semana</h2>
                  <p className="mb-4 text-xs text-muted">Média dos registros do diário (1 a 5)</p>
                  <WellbeingLines data={wellbeingByWeek(data)} label="Média semanal de humor, energia e sono" />
                </CardContent>
              </Card>
            </div>

            <section id="conquistas" className="mt-8 scroll-mt-24">
              <h2 className="mb-4 font-display text-2xl font-semibold text-forest">Conquistas</h2>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {ach.map((a) => (
                  <AchievementBadge key={a.id} icon={a.icon} title={a.title} unlocked={a.unlocked} value={a.value} description={a.unlocked ? a.message : a.description} />
                ))}
              </div>
            </section>
          </>
        );
      }}
    </DataGate>
  );
}
