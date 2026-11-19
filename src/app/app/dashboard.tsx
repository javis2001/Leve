"use client";
import Link from "next/link";
import { ArrowRight, CalendarDays, ChefHat, CircleCheckBig, Clock, PersonStanding, Sparkles, Trophy } from "lucide-react";
import { AchievementBadge } from "@/components/app/achievement-badge";
import { DataGate } from "@/components/app/data-gate";
import { HabitToday } from "@/components/app/habit-today";
import { JourneyBar } from "@/components/app/journey-bar";
import { FadeIn } from "@/components/app/motion";
import { WeekStrip } from "@/components/app/week-strip";
import { RecipeArt } from "@/components/brand/recipe-art";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ProgressRing } from "@/components/ui/progress";
import { RECIPE_CATEGORIES, type JourneyDay, type Recipe } from "@/lib/content/types";
import { achievementStates, activeHabits, completedDayNumbers, currentDay, habitDoneOn, journeyPercent } from "@/lib/data/stats";
import { firstName, hashString, toISODate } from "@/lib/utils";

export function Dashboard({ days, recipes, viewerName }: { days: JourneyDay[]; recipes: Recipe[]; viewerName: string }) {
  return (
    <DataGate>
      {(data) => {
        const cur = currentDay(data);
        const day = days.find((d) => d.day === cur) ?? days[0];
        const completed = completedDayNumbers(data).length;
        const pct = journeyPercent(data);
        const allDone = completed === 30;
        const recipe =
          recipes.find((r) => r.slug === day.food.recipeSlug) ?? recipes[hashString(toISODate()) % Math.max(1, recipes.length)];
        const achievements = achievementStates(data);
        const unlocked = achievements.filter((a) => a.unlocked);
        const nextLocked = achievements.find((a) => !a.unlocked);
        const today = toISODate();
        const habitsDone = habitDoneOn(data, today);
        const habitsTotal = activeHabits(data).length;
        const name = firstName(data.profile.name || viewerName);

        return (
          <div className="space-y-5 sm:space-y-6">
            <FadeIn>
              <p className="text-sm font-semibold text-muted">{name ? `Olá, ${name}!` : "Olá!"}</p>
              <h1 className="mt-1 font-display text-[1.7rem] leading-tight font-semibold text-forest sm:text-4xl">
                Seu próximo passo para uma vida mais leve começa hoje!
              </h1>
            </FadeIn>

            {/* Destaque da jornada */}
            <FadeIn delay={0.05}>
              <section
                aria-labelledby="jornada-hoje"
                className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-forest via-forest to-emerald p-5 text-white shadow-lift sm:p-8"
              >
                <div className="pointer-events-none absolute -top-16 -right-10 size-56 rounded-full bg-emerald/40 blur-2xl" />
                <div className="pointer-events-none absolute right-6 bottom-6 hidden size-24 rounded-full border border-white/10 sm:block" />
                <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center">
                  <ProgressRing value={pct} size={112}>
                    <div>
                      <p className="text-2xl font-extrabold">{pct}%</p>
                      <p className="text-[0.65rem] font-semibold text-white/70 uppercase">concluído</p>
                    </div>
                  </ProgressRing>
                  <div className="flex-1">
                    <p className="text-xs font-bold tracking-[0.16em] text-gold uppercase">
                      {allDone ? "Jornada concluída" : `Dia ${cur} de 30 · Semana ${day.week}`}
                    </p>
                    <h2 id="jornada-hoje" className="mt-1 font-display text-2xl font-semibold sm:text-3xl">
                      {allDone ? "Você completou os 30 dias!" : day.title}
                    </h2>
                    <p className="mt-2 max-w-xl text-sm text-white/80">{allDone ? "Revise seus dias favoritos e siga com seu plano de continuidade." : day.objective}</p>
                    <Button asChild variant="gold" size="lg" className="mt-5 w-full sm:w-auto">
                      <Link href={`/app/dia/${cur}`}>
                        CONTINUAR MINHA JORNADA <ArrowRight />
                      </Link>
                    </Button>
                  </div>
                </div>
                <div className="relative mt-6 border-t border-white/10 pt-5">
                  <div className="mb-2 flex justify-between text-xs font-semibold text-white/70">
                    <span>{completed} de 30 dias concluídos</span>
                    <Link href="/app/jornada" className="underline-offset-2 hover:underline">
                      Ver jornada
                    </Link>
                  </div>
                  <JourneyBar data={data} current={cur} light />
                </div>
              </section>
            </FadeIn>

            <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1.4fr_1fr]">
              {/* Semana + hábitos */}
              <FadeIn delay={0.1}>
                <Card>
                  <CardContent>
                    <div className="mb-4 flex items-center justify-between">
                      <h2 className="flex items-center gap-2 font-bold">
                        <CalendarDays className="size-5 text-emerald" /> Sua semana
                      </h2>
                      <Link href="/app/progresso" className="text-sm font-semibold text-emerald">
                        Evolução
                      </Link>
                    </div>
                    <WeekStrip data={data} />
                    <div className="mt-6 mb-3 flex items-center justify-between">
                      <h2 className="flex items-center gap-2 font-bold">
                        <CircleCheckBig className="size-5 text-emerald" /> Hábitos de hoje
                      </h2>
                      <span className="rounded-full bg-mint px-2.5 py-1 text-xs font-bold text-forest">
                        {habitsDone}/{habitsTotal}
                      </span>
                    </div>
                    <HabitToday data={data} />
                  </CardContent>
                </Card>
              </FadeIn>

              <div className="space-y-5">
                {/* Próxima atividade */}
                <FadeIn delay={0.15}>
                  <Card>
                    <CardContent>
                      <h2 className="flex items-center gap-2 font-bold">
                        <PersonStanding className="size-5 text-emerald" /> Próxima atividade
                      </h2>
                      <p className="mt-3 text-lg font-bold">{day.activity.title}</p>
                      <p className="mt-1 text-sm text-muted">{day.activity.description}</p>
                      <div className="mt-4 flex items-center justify-between">
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-mint px-3 py-1 text-xs font-bold text-forest">
                          <Clock className="size-3.5" /> {day.activity.minutes} min
                        </span>
                        <Link href={`/app/dia/${cur}#atividade`} className="inline-flex items-center gap-1 text-sm font-bold text-emerald">
                          Começar <ArrowRight className="size-4" />
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                </FadeIn>

                {/* Receita sugerida */}
                {recipe ? (
                  <FadeIn delay={0.2}>
                    <Link href={`/app/receitas/${recipe.slug}`} className="group flex overflow-hidden rounded-3xl border border-line/80 bg-white shadow-soft transition hover:shadow-lift">
                      <div className="w-28 shrink-0 overflow-hidden sm:w-36">
                        <RecipeArt recipe={recipe} className="transition duration-500 group-hover:scale-105" />
                      </div>
                      <div className="p-4">
                        <p className="flex items-center gap-1.5 text-xs font-bold tracking-wider text-emerald uppercase">
                          <ChefHat className="size-4" /> Receita sugerida
                        </p>
                        <p className="mt-1 font-bold leading-snug">{recipe.title}</p>
                        <p className="mt-1 text-xs text-muted">
                          {RECIPE_CATEGORIES.find((c) => c.id === recipe.category)?.short} · {recipe.prepMinutes} min
                        </p>
                      </div>
                    </Link>
                  </FadeIn>
                ) : null}
              </div>
            </div>

            {/* Conquistas */}
            <FadeIn delay={0.25}>
              <Card>
                <CardContent>
                  <div className="mb-4 flex items-center justify-between">
                    <h2 className="flex items-center gap-2 font-bold">
                      <Trophy className="size-5 text-gold-deep" /> Conquistas desbloqueadas
                    </h2>
                    <Link href="/app/progresso#conquistas" className="text-sm font-semibold text-emerald">
                      Ver todas
                    </Link>
                  </div>
                  {unlocked.length ? (
                    <div className="no-scrollbar -mx-1 flex gap-3 overflow-x-auto px-1 pb-1">
                      {unlocked.map((a) => (
                        <div key={a.id} className="w-60 shrink-0">
                          <AchievementBadge icon={a.icon} title={a.title} unlocked description={a.message} size="sm" />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="flex items-center gap-2 rounded-2xl bg-mint/50 p-4 text-sm text-forest">
                      <Sparkles className="size-5 shrink-0 text-gold-deep" />
                      Conclua o dia 1 para desbloquear sua primeira conquista: <strong>Primeiro passo</strong>.
                    </p>
                  )}
                  {nextLocked && unlocked.length > 0 ? (
                    <p className="mt-3 text-xs text-muted">
                      Próxima: <strong className="text-ink">{nextLocked.title}</strong> — {nextLocked.description.toLowerCase()}
                    </p>
                  ) : null}
                </CardContent>
              </Card>
            </FadeIn>
          </div>
        );
      }}
    </DataGate>
  );
}
