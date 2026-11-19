import { describe, expect, it } from "vitest";
import { RECIPES, RECIPE_BY_SLUG } from "@/lib/content/recipes";
import { EXERCISES, EXERCISE_BY_SLUG } from "@/lib/content/exercises";
import { JOURNEY_DAYS } from "@/lib/content/journey";
import { RECIPE_CATEGORIES, EXERCISE_CATEGORIES } from "@/lib/content/types";
import { aggregateIngredients } from "@/lib/content/shopping";

describe("receitas", () => {
  it("tem 50 receitas, 10 por categoria, slugs únicos", () => {
    expect(RECIPES).toHaveLength(50);
    for (const c of RECIPE_CATEGORIES) expect(RECIPES.filter((r) => r.category === c.id)).toHaveLength(10);
    expect(new Set(RECIPES.map((r) => r.slug)).size).toBe(50);
    expect(new Set(RECIPES.map((r) => r.title)).size).toBe(50);
  });
  it("cada receita está completa", () => {
    for (const r of RECIPES) {
      expect(r.ingredients.length, r.slug).toBeGreaterThanOrEqual(3);
      expect(r.steps.length, r.slug).toBeGreaterThanOrEqual(3);
      expect(r.substitutions.length, r.slug).toBeGreaterThanOrEqual(2);
      expect(r.prepMinutes).toBeGreaterThan(0);
      expect(r.slug).toMatch(/^[a-z0-9-]+$/);
      for (const i of r.ingredients) expect(i.qty && i.item, r.slug).toBeTruthy();
    }
  });
  it("alergênicos declarados batem com os ingredientes", () => {
    const rules: [string, RegExp][] = [
      ["ovos", /\bovos?\b/i],
      ["peixe", /tilápia|atum|peixe/i],
      ["amendoim", /amendoim/i],
      ["castanhas", /castanha|amêndoa|nozes/i],
      ["gluten", /trigo|pão|macarrão(?! de arroz)|aveia/i],
      ["leite", /\bleite\b(?! de coco)|iogurte|queijo|requeijão|ricota|manteiga|parmesão|muçarela/i],
    ];
    for (const r of RECIPES) {
      const text = r.ingredients.map((i) => `${i.item} ${i.note ?? ""}`).join(" ");
      for (const [allergen, re] of rules) {
        if (re.test(r.ingredients.map((i) => i.item).join(" | "))) {
          expect(r.allergens, `${r.slug} deveria declarar ${allergen}`).toContain(allergen);
        }
      }
      void text;
    }
  });
});

describe("exercícios", () => {
  it("cobre todas as categorias com pelo menos 4", () => {
    for (const c of EXERCISE_CATEGORIES) expect(EXERCISES.filter((e) => e.category === c.id).length).toBeGreaterThanOrEqual(4);
    expect(new Set(EXERCISES.map((e) => e.slug)).size).toBe(EXERCISES.length);
  });
  it("tem passos, adaptações e cuidados", () => {
    for (const e of EXERCISES) {
      expect(e.steps.length, e.slug).toBeGreaterThanOrEqual(3);
      expect(e.adaptations.length, e.slug).toBeGreaterThanOrEqual(1);
      expect(e.safety.length, e.slug).toBeGreaterThanOrEqual(1);
    }
  });
});

describe("jornada", () => {
  it("tem 30 dias em ordem, 4 semanas", () => {
    expect(JOURNEY_DAYS.map((d) => d.day)).toEqual(Array.from({ length: 30 }, (_, i) => i + 1));
    expect(new Set(JOURNEY_DAYS.map((d) => d.week))).toEqual(new Set([1, 2, 3, 4]));
  });
  it("conteúdo não se repete", () => {
    const fields = ["title", "objective", "habit", "motivation"] as const;
    for (const f of fields) expect(new Set(JOURNEY_DAYS.map((d) => d[f])).size, f).toBe(30);
    const paragraphs = JOURNEY_DAYS.flatMap((d) => d.education);
    expect(new Set(paragraphs).size).toBe(paragraphs.length);
    expect(new Set(JOURNEY_DAYS.flatMap((d) => d.checklist)).size).toBeGreaterThan(80);
  });
  it("referências a receitas e exercícios existem", () => {
    for (const d of JOURNEY_DAYS) {
      if (d.food.recipeSlug) expect(RECIPE_BY_SLUG[d.food.recipeSlug], `dia ${d.day}`).toBeDefined();
      for (const s of d.activity.exerciseSlugs) expect(EXERCISE_BY_SLUG[s], `dia ${d.day}: ${s}`).toBeDefined();
      expect(d.checklist.length).toBeGreaterThanOrEqual(3);
    }
  });
});

describe("lista de compras", () => {
  it("agrega ingredientes por seção", () => {
    const agg = aggregateIngredients(RECIPES.slice(0, 5));
    expect(agg.length).toBeGreaterThan(10);
    const aveia = agg.find((a) => a.item === "aveia em flocos");
    expect(aveia?.section).toBe("Grãos, cereais e massas");
    expect(aveia!.uses.length).toBeGreaterThan(1);
    expect(agg.find((a) => a.item === "ovos")?.section).toBe("Laticínios e ovos");
  });
});

import { filterRecipes } from "@/lib/content/filters";
describe("filtros de receitas", () => {
  const base = { category: "all" as const, time: "all" as const, query: "", favoritesOnly: false, favorites: [] as string[] };
  it("filtra por categoria", () => {
    expect(filterRecipes(RECIPES, { ...base, category: "sobremesa" })).toHaveLength(10);
  });
  it("filtra por tempo", () => {
    const r = filterRecipes(RECIPES, { ...base, time: "10" });
    expect(r.length).toBeGreaterThan(0);
    expect(r.every((x) => x.prepMinutes <= 10)).toBe(true);
  });
  it("busca ingredientes sem acento e com vários termos", () => {
    const r = filterRecipes(RECIPES, { ...base, query: "abobora" });
    expect(r.some((x) => x.slug === "creme-de-abobora-com-gengibre")).toBe(true);
    const both = filterRecipes(RECIPES, { ...base, query: "banana, aveia" });
    expect(both.length).toBeGreaterThan(2);
    expect(both.every((x) => /banana/i.test(JSON.stringify(x)) && /aveia/i.test(JSON.stringify(x)))).toBe(true);
  });
  it("filtra favoritas", () => {
    const r = filterRecipes(RECIPES, { ...base, favoritesOnly: true, favorites: ["sorvete-de-banana"] });
    expect(r.map((x) => x.slug)).toEqual(["sorvete-de-banana"]);
  });
});
