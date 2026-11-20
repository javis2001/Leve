import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Clock, Gauge, HandHelping, ShieldCheck } from "lucide-react";
import { SafetyNotice } from "@/components/app/safety-notice";
import { ExercisePose } from "@/components/brand/exercise-pose";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { getExercises } from "@/lib/content/server";
import { exerciseVisual } from "@/lib/content/exercise-visuals";
import { EXERCISE_CATEGORIES } from "@/lib/content/types";

type Params = { params: Promise<{ slug: string }> };

async function find(slug: string) {
  return (await getExercises()).find((e) => e.slug === slug) ?? null;
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const e = await find((await params).slug);
  return { title: e?.name ?? "Exercício" };
}

export default async function ExercisePage({ params }: Params) {
  const e = await find((await params).slug);
  if (!e) notFound();
  const cat = EXERCISE_CATEGORIES.find((c) => c.id === e.category);
  const visual = exerciseVisual(e.slug, e.pose);
  return (
    <article className="mx-auto max-w-3xl">
      <Link href="/app/exercicios" className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-muted hover:text-forest">
        <ArrowLeft className="size-4" /> Exercícios
      </Link>
      <div className="overflow-hidden rounded-[2rem] bg-white shadow-soft">
        <div className="aspect-[5/4] bg-[#e9efec] sm:aspect-[5/3]">
          {e.videoUrl ? (
            <video src={e.videoUrl} controls playsInline preload="metadata" className="h-full w-full bg-black object-contain" aria-label={`Vídeo: ${e.name}`} />
          ) : e.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={e.imageUrl} alt={`Ilustração: ${e.name}`} className="h-full w-full object-contain bg-[#eef2f0]" />
          ) : (
            <ExercisePose pose={e.pose} slug={e.slug} label={`Ilustração: ${e.name}`} />
          )}
        </div>
        <div className="p-6 sm:p-8">
          <p className="text-xs font-bold tracking-[0.14em] text-emerald uppercase">{cat?.label}</p>
          <h1 className="mt-1 font-display text-3xl font-semibold text-forest sm:text-4xl">{e.name}</h1>
          <p className="mt-2 text-ink/80">{e.summary}</p>
          <div className="mt-4 rounded-2xl bg-[#fdeeea] p-3 text-[#7c1a14]">
            <p className="text-sm font-semibold">Trabalha:</p>
            <p className="text-lg font-extrabold">{visual.muscles}</p>
            <p className="mt-1 text-xs text-[#7c1a14]/80">Na ilustração: em vermelho, a parte do corpo trabalhada. As setas mostram a direção do movimento.</p>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <Badge>
              <Clock /> {e.duration}
            </Badge>
            <Badge variant="gold">
              <Gauge /> {e.level}
            </Badge>
          </div>
        </div>
      </div>

      <Card className="mt-5">
        <CardContent>
          <h2 className="text-lg font-bold">Passo a passo</h2>
          <ol className="mt-4 space-y-4">
            {e.steps.map((s, i) => (
              <li key={i} className="flex gap-3">
                <span className="grid size-8 shrink-0 place-items-center rounded-full bg-forest text-sm font-extrabold text-white">{i + 1}</span>
                <span className="pt-1 text-[1.05rem] leading-relaxed">{s}</span>
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>

      <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Card>
          <CardContent>
            <h2 className="flex items-center gap-2 text-lg font-bold">
              <HandHelping className="size-5 text-emerald" /> Adaptações
            </h2>
            <ul className="mt-3 space-y-2 text-ink/85">
              {e.adaptations.map((a) => (
                <li key={a} className="flex gap-2">
                  <span className="mt-2 size-1.5 shrink-0 rounded-full bg-emerald" />
                  {a}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <h2 className="flex items-center gap-2 text-lg font-bold">
              <ShieldCheck className="size-5 text-gold-deep" /> Cuidados
            </h2>
            <ul className="mt-3 space-y-2 text-ink/85">
              {e.safety.map((a) => (
                <li key={a} className="flex gap-2">
                  <span className="mt-2 size-1.5 shrink-0 rounded-full bg-gold-deep" />
                  {a}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
      <div className="mt-5">
        <SafetyNotice />
      </div>
    </article>
  );
}
