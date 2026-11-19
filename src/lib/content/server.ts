import "server-only";
import { cache } from "react";
import { getSupabaseServer } from "@/lib/supabase/server";
import { EXERCISES } from "./exercises";
import { JOURNEY_DAYS } from "./journey";
import { RECIPES } from "./recipes";
import type { Exercise, JourneyDay, Recipe } from "./types";

/**
 * O conteúdo padrão vem do código (src/lib/content). Quando o Supabase está configurado,
 * registros cadastrados/editados no painel admin substituem ou complementam o padrão.
 */
async function overrides<T>(table: "recipes" | "exercises", key: "slug") {
  const sb = await getSupabaseServer();
  if (!sb) return null;
  const { data, error } = await sb.from(table).select(`${key}, data, published, position`);
  if (error) {
    console.error(`[conteúdo] falha ao ler ${table}:`, error.message);
    return null;
  }
  return (data ?? []) as { slug: string; data: T; published: boolean; position: number }[];
}

function merge<T extends { slug: string }>(base: T[], rows: { slug: string; data: T; published: boolean; position: number }[] | null) {
  if (!rows || rows.length === 0) return base;
  const bySlug = new Map(rows.map((r) => [r.slug, r]));
  const merged: T[] = [];
  for (const item of base) {
    const row = bySlug.get(item.slug);
    if (!row) merged.push(item);
    else if (row.published) merged.push({ ...item, ...row.data, slug: item.slug });
    bySlug.delete(item.slug);
  }
  const extra = [...bySlug.values()].filter((r) => r.published).sort((a, b) => a.position - b.position);
  for (const r of extra) merged.push({ ...r.data, slug: r.slug });
  return merged;
}

export const getRecipes = cache(async (): Promise<Recipe[]> => merge(RECIPES, await overrides<Recipe>("recipes", "slug")));
export const getRecipe = cache(async (slug: string) => (await getRecipes()).find((r) => r.slug === slug) ?? null);

export const getExercises = cache(async (): Promise<Exercise[]> => merge(EXERCISES, await overrides<Exercise>("exercises", "slug")));

export const getJourneyDays = cache(async (): Promise<JourneyDay[]> => {
  const sb = await getSupabaseServer();
  if (!sb) return JOURNEY_DAYS;
  const { data, error } = await sb.from("journey_days").select("day, data");
  if (error || !data?.length) return JOURNEY_DAYS;
  const byDay = new Map((data as { day: number; data: JourneyDay }[]).map((r) => [r.day, r.data]));
  return JOURNEY_DAYS.map((d) => (byDay.has(d.day) ? { ...d, ...byDay.get(d.day), day: d.day, week: d.week } : d));
});

export const getJourneyDay = cache(async (n: number) => (await getJourneyDays()).find((d) => d.day === n) ?? null);
