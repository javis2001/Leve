import type { Recipe, RecipeCategory } from "./types";

export const TIME_FILTERS = [
  { id: "all", label: "Qualquer tempo", test: () => true },
  { id: "10", label: "Até 10 min", test: (m: number) => m <= 10 },
  { id: "20", label: "Até 20 min", test: (m: number) => m <= 20 },
  { id: "40", label: "Até 40 min", test: (m: number) => m <= 40 },
  { id: "more", label: "Mais de 40 min", test: (m: number) => m > 40 },
] as const;
export type TimeFilter = (typeof TIME_FILTERS)[number]["id"];

export function normalize(s: string) {
  return s.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();
}

export interface RecipeFilter {
  category: RecipeCategory | "all";
  time: TimeFilter;
  query: string;
  favoritesOnly: boolean;
  favorites: string[];
}

/** Filtra por categoria, tempo, favoritos e termos (nome ou ingredientes, sem acentos). */
export function filterRecipes(recipes: Recipe[], f: RecipeFilter) {
  const q = normalize(f.query.trim());
  const terms = q.split(/[,\s]+/).filter((t) => t.length > 1);
  const timeTest = TIME_FILTERS.find((t) => t.id === f.time)!.test;
  return recipes.filter((r) => {
    if (f.category !== "all" && r.category !== f.category) return false;
    if (!timeTest(r.prepMinutes)) return false;
    if (f.favoritesOnly && !f.favorites.includes(r.slug)) return false;
    if (terms.length) {
      const hay = normalize([r.title, r.summary, ...r.keyIngredients, ...r.ingredients.map((i) => i.item)].join(" "));
      return terms.every((t) => hay.includes(t));
    }
    return true;
  });
}
