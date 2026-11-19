"use client";
import Link from "next/link";
import { useState } from "react";
import { Clock, Gauge } from "lucide-react";
import { PageHeader } from "@/components/app/page-header";
import { SafetyNotice } from "@/components/app/safety-notice";
import { ExercisePose } from "@/components/brand/exercise-pose";
import { EXERCISE_CATEGORIES, type Exercise, type ExerciseCategory } from "@/lib/content/types";
import { cn } from "@/lib/utils";

export function ExerciseLibrary({ exercises }: { exercises: Exercise[] }) {
  const [cat, setCat] = useState<ExerciseCategory | "all">("all");
  const cats = EXERCISE_CATEGORIES.filter((c) => cat === "all" || c.id === cat);
  return (
    <>
      <PageHeader
        eyebrow="Biblioteca"
        title="Exercícios leves para fazer em casa"
        description="Movimentos de baixo impacto para iniciantes, com passo a passo, adaptações e cuidados. Sem academia e sem equipamentos."
      />
      <SafetyNotice compact />
      <div className="no-scrollbar -mx-1 mt-5 mb-6 flex gap-2 overflow-x-auto px-1" role="group" aria-label="Categorias de exercício">
        {[{ id: "all" as const, label: "Todos" }, ...EXERCISE_CATEGORIES].map((c) => (
          <button
            key={c.id}
            type="button"
            aria-pressed={cat === c.id}
            onClick={() => setCat(c.id)}
            className={cn(
              "h-10 shrink-0 rounded-full border px-4 text-sm font-semibold transition",
              cat === c.id ? "border-forest bg-forest text-white" : "border-line bg-white text-ink/80",
            )}
          >
            {c.label}
          </button>
        ))}
      </div>
      <div className="space-y-8">
        {cats.map((c) => {
          const list = exercises.filter((e) => e.category === c.id);
          if (!list.length) return null;
          return (
            <section key={c.id} aria-labelledby={`cat-${c.id}`}>
              <h2 id={`cat-${c.id}`} className="font-display text-2xl font-semibold text-forest">
                {c.label}
              </h2>
              <p className="mb-3 text-sm text-muted">{c.description}</p>
              <ul className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-4">
                {list.map((e) => (
                  <li key={e.slug}>
                    <Link href={`/app/exercicios/${e.slug}`} className="group block overflow-hidden rounded-3xl border border-line/80 bg-white shadow-soft transition hover:-translate-y-0.5 hover:shadow-lift">
                      <div className="aspect-[5/4] overflow-hidden">
                        <ExercisePose pose={e.pose} label={e.name} className="transition duration-500 group-hover:scale-105" />
                      </div>
                      <div className="p-3.5">
                        <h3 className="line-clamp-2 font-bold leading-snug">{e.name}</h3>
                        <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs font-semibold text-muted">
                          <span className="inline-flex items-center gap-1">
                            <Clock className="size-3.5" /> {e.duration}
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <Gauge className="size-3.5" /> {e.level}
                          </span>
                        </div>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </div>
    </>
  );
}
