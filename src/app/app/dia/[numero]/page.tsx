import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getExercises, getJourneyDay, getRecipes } from "@/lib/content/server";
import { DayView } from "./day-view";

type Params = { params: Promise<{ numero: string }> };

function parse(numero: string) {
  const n = Number(numero);
  return Number.isInteger(n) && n >= 1 && n <= 30 ? n : null;
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const n = parse((await params).numero);
  return { title: n ? `Dia ${n}` : "Dia" };
}

export default async function DayPage({ params }: Params) {
  const n = parse((await params).numero);
  if (!n) notFound();
  const [day, exercises, recipes] = await Promise.all([getJourneyDay(n), getExercises(), getRecipes()]);
  if (!day) notFound();
  const dayExercises = day.activity.exerciseSlugs.map((s) => exercises.find((e) => e.slug === s)).filter((e) => e !== undefined);
  const recipe = day.food.recipeSlug ? (recipes.find((r) => r.slug === day.food.recipeSlug) ?? null) : null;
  return <DayView day={day} exercises={dayExercises} recipe={recipe} />;
}
