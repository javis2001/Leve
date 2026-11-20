"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowLeft, ArrowRight, BookOpen, Check, ChefHat, CircleCheckBig, Clock, Heart, Lightbulb, PartyPopper, PersonStanding, Quote, RotateCcw, Target } from "lucide-react";
import { DataGate } from "@/components/app/data-gate";
import { FadeIn } from "@/components/app/motion";
import { ExercisePose } from "@/components/brand/exercise-pose";
import { RecipeArt } from "@/components/brand/recipe-art";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { Exercise, JourneyDay, Recipe } from "@/lib/content/types";
import { useUserData } from "@/lib/data/provider";
import { cn } from "@/lib/utils";
import { isPhotoImage } from "@/lib/content/exercise-visuals";

export function DayView({ day, exercises, recipe }: { day: JourneyDay; exercises: Exercise[]; recipe: Recipe | null }) {
  const { saveDay } = useUserData();
  const router = useRouter();
  const [celebrate, setCelebrate] = useState(false);

  return (
    <DataGate>
      {(data) => {
        const progress = data.days[day.day] ?? { checklist: [], completedAt: null };
        const checked = new Set(progress.checklist);
        const isDone = Boolean(progress.completedAt);
        const pct = (checked.size / day.checklist.length) * 100;

        const toggle = (i: number) => {
          const next = new Set(checked);
          if (next.has(i)) next.delete(i);
          else next.add(i);
          void saveDay(day.day, { checklist: [...next].sort(), completedAt: progress.completedAt });
        };
        const complete = async () => {
          await saveDay(day.day, { checklist: day.checklist.map((_, i) => i), completedAt: new Date().toISOString() });
          setCelebrate(true);
        };
        const reopen = () => saveDay(day.day, { checklist: progress.checklist, completedAt: null });

        return (
          <article className="mx-auto max-w-3xl">
            <div className="mb-4 flex items-center justify-between">
              <Link href="/app/jornada" className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted hover:text-forest">
                <ArrowLeft className="size-4" /> Jornada
              </Link>
              <Badge variant={isDone ? "mint" : "outline"}>{isDone ? "Dia concluído" : `Semana ${day.week}`}</Badge>
            </div>

            <FadeIn>
              <header className="relative overflow-hidden rounded-[2rem] bg-white p-6 shadow-soft sm:p-8">
                <div className="grain pointer-events-none absolute inset-0 opacity-60" />
                <div className="relative">
                  <p className="font-display text-6xl leading-none font-semibold text-gold italic sm:text-7xl">{String(day.day).padStart(2, "0")}</p>
                  <h1 className="mt-2 font-display text-3xl font-semibold text-forest sm:text-4xl">{day.title}</h1>
                  <p className="mt-3 flex gap-2 text-ink/80">
                    <Target className="mt-0.5 size-5 shrink-0 text-emerald" />
                    <span>
                      <strong className="text-ink">Objetivo:</strong> {day.objective}
                    </span>
                  </p>
                </div>
              </header>
            </FadeIn>

            <div className="mt-5 space-y-5">
              <FadeIn delay={0.05}>
                <Card>
                  <CardContent>
                    <h2 className="mb-3 flex items-center gap-2 text-lg font-bold">
                      <BookOpen className="size-5 text-emerald" /> Para entender
                    </h2>
                    <div className="prose-vl">
                      {day.education.map((p, i) => (
                        <p key={i}>{p}</p>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </FadeIn>

              <FadeIn delay={0.1}>
                <Card id="atividade" className="scroll-mt-24">
                  <CardContent>
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h2 className="flex items-center gap-2 text-lg font-bold">
                        <PersonStanding className="size-5 text-emerald" /> Atividade física
                      </h2>
                      <Badge>
                        <Clock /> {day.activity.minutes} min
                      </Badge>
                    </div>
                    <p className="mt-3 font-bold">{day.activity.title}</p>
                    <p className="mt-1 text-ink/80">{day.activity.description}</p>
                    <ul className="mt-4 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                      {exercises.map((e) => (
                        <li key={e.slug}>
                          <Link href={`/app/exercicios/${e.slug}`} className="flex items-center gap-3 rounded-2xl border border-line p-2.5 transition hover:border-emerald/40 hover:bg-mint/40">
                            <span className="h-14 w-16 shrink-0 overflow-hidden rounded-xl">
                              {e.imageUrl ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={e.imageUrl} alt={e.name} className={isPhotoImage(e.imageUrl) ? "h-full w-full object-cover" : "h-full w-full bg-[#eef2f0] object-contain"} loading="lazy" />
                              ) : (
                                <ExercisePose pose={e.pose} slug={e.slug} label={e.name} />
                              )}
                            </span>
                            <span className="min-w-0">
                              <span className="block truncate text-sm font-bold">{e.name}</span>
                              <span className="block text-xs text-muted">{e.duration}</span>
                            </span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                    <p className="mt-4 flex gap-2 rounded-2xl bg-gold-soft/60 p-3 text-sm text-ink/85">
                      <Lightbulb className="mt-0.5 size-4 shrink-0 text-gold-deep" />
                      <span>
                        <strong>Adaptação:</strong> {day.activity.adaptation}
                      </span>
                    </p>
                  </CardContent>
                </Card>
              </FadeIn>

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <FadeIn delay={0.15}>
                  <Card className="h-full">
                    <CardContent>
                      <h2 className="flex items-center gap-2 text-lg font-bold">
                        <ChefHat className="size-5 text-emerald" /> Alimentação
                      </h2>
                      <p className="mt-2 text-ink/80">{day.food.text}</p>
                      {recipe ? (
                        <Link href={`/app/receitas/${recipe.slug}`} className="mt-4 flex items-center gap-3 rounded-2xl bg-mint/50 p-2.5 transition hover:bg-mint">
                          <span className="size-14 shrink-0 overflow-hidden rounded-xl">
                            <RecipeArt recipe={recipe} />
                          </span>
                          <span className="text-sm font-bold">{recipe.title}</span>
                        </Link>
                      ) : (
                        <Button asChild variant="secondary" size="sm" className="mt-4">
                          <Link href="/app/cardapio">Abrir cardápio semanal</Link>
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                </FadeIn>
                <FadeIn delay={0.2}>
                  <Card className="h-full">
                    <CardContent>
                      <h2 className="flex items-center gap-2 text-lg font-bold">
                        <Heart className="size-5 text-emerald" /> Hábito do dia
                      </h2>
                      <p className="mt-2 text-ink/80">{day.habit}</p>
                      <Button asChild variant="secondary" size="sm" className="mt-4">
                        <Link href="/app/diario">Abrir diário</Link>
                      </Button>
                    </CardContent>
                  </Card>
                </FadeIn>
              </div>

              <FadeIn delay={0.25}>
                <figure className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-forest to-emerald p-6 text-white sm:p-8">
                  <Quote className="absolute top-4 right-4 size-16 text-white/10" />
                  <blockquote className="font-display text-2xl leading-snug italic sm:text-[1.7rem]">“{day.motivation}”</blockquote>
                </figure>
              </FadeIn>

              <FadeIn delay={0.3}>
                <Card>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <h2 className="flex items-center gap-2 text-lg font-bold">
                        <CircleCheckBig className="size-5 text-emerald" /> Checklist do dia
                      </h2>
                      <span className="text-sm font-bold text-emerald">
                        {checked.size}/{day.checklist.length}
                      </span>
                    </div>
                    <Progress value={pct} className="mt-3" label="Checklist do dia" />
                    <ul className="mt-4 space-y-2">
                      {day.checklist.map((item, i) => {
                        const on = checked.has(i);
                        return (
                          <li key={i}>
                            <button
                              type="button"
                              role="checkbox"
                              aria-checked={on}
                              onClick={() => toggle(i)}
                              className={cn("flex w-full items-center gap-3 rounded-2xl border p-3.5 text-left transition", on ? "border-emerald/30 bg-mint" : "border-line hover:border-emerald/40")}
                            >
                              <span className={cn("grid size-7 shrink-0 place-items-center rounded-lg border-2", on ? "border-emerald bg-emerald text-white" : "border-line")}>
                                {on && <Check className="size-4" strokeWidth={3} />}
                              </span>
                              <span className={cn("font-medium", on && "text-forest")}>{item}</span>
                            </button>
                          </li>
                        );
                      })}
                    </ul>

                    <div className="mt-6">
                      {isDone ? (
                        <div className="flex flex-col gap-2 sm:flex-row">
                          <div className="flex flex-1 items-center gap-2 rounded-2xl bg-mint p-3.5 font-bold text-forest">
                            <Check className="size-5" /> Dia concluído! Excelente trabalho.
                          </div>
                          <Button variant="ghost" onClick={reopen}>
                            <RotateCcw /> Reabrir dia
                          </Button>
                        </div>
                      ) : (
                        <Button size="lg" className="w-full" onClick={complete}>
                          <Check /> CONCLUIR DIA
                        </Button>
                      )}
                      {!isDone && checked.size < day.checklist.length ? (
                        <p className="mt-2 text-center text-xs text-muted">Fez só parte? Tudo bem — você pode concluir o dia mesmo assim.</p>
                      ) : null}
                    </div>
                  </CardContent>
                </Card>
              </FadeIn>

              <nav className="flex justify-between gap-3 pt-2" aria-label="Navegação entre dias">
                {day.day > 1 ? (
                  <Button asChild variant="outline">
                    <Link href={`/app/dia/${day.day - 1}`}>
                      <ArrowLeft /> Dia {day.day - 1}
                    </Link>
                  </Button>
                ) : (
                  <span />
                )}
                {day.day < 30 ? (
                  <Button asChild variant="outline">
                    <Link href={`/app/dia/${day.day + 1}`}>
                      Dia {day.day + 1} <ArrowRight />
                    </Link>
                  </Button>
                ) : null}
              </nav>
            </div>

            <AnimatePresence>
              {celebrate && (
                <motion.div
                  className="fixed inset-0 z-50 grid place-items-center bg-forest-deep/50 p-4 backdrop-blur-sm"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  role="dialog"
                  aria-modal="true"
                  aria-labelledby="celebra-titulo"
                >
                  <motion.div
                    initial={{ scale: 0.9, y: 20 }}
                    animate={{ scale: 1, y: 0 }}
                    className="w-full max-w-sm rounded-[2rem] bg-white p-7 text-center shadow-lift"
                  >
                    <motion.div
                      initial={{ rotate: -20, scale: 0.5 }}
                      animate={{ rotate: 0, scale: 1 }}
                      transition={{ type: "spring", stiffness: 260, damping: 12 }}
                      className="mx-auto grid size-20 place-items-center rounded-full bg-gradient-to-br from-gold to-[#efd79d] text-forest-deep"
                    >
                      <PartyPopper className="size-10" />
                    </motion.div>
                    <h2 id="celebra-titulo" className="mt-4 font-display text-2xl font-semibold text-forest">
                      Dia {day.day} concluído!
                    </h2>
                    <p className="mt-2 text-muted">{day.motivation}</p>
                    <div className="mt-6 flex flex-col gap-2">
                      {day.day < 30 ? (
                        <Button size="lg" onClick={() => router.push(`/app/dia/${day.day + 1}`)}>
                          Ver o dia {day.day + 1} <ArrowRight />
                        </Button>
                      ) : null}
                      <Button variant="ghost" onClick={() => (setCelebrate(false), router.push("/app"))}>
                        Voltar ao início
                      </Button>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </article>
        );
      }}
    </DataGate>
  );
}
