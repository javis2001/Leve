"use client";
import { useMemo, useState } from "react";
import { Heart, Search, SlidersHorizontal, X } from "lucide-react";
import { PageHeader } from "@/components/app/page-header";
import { RecipeCard } from "@/components/app/recipe-card";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { useUserData } from "@/lib/data/provider";
import { RECIPE_CATEGORIES, type Recipe, type RecipeCategory } from "@/lib/content/types";
import { TIME_FILTERS, filterRecipes, type TimeFilter } from "@/lib/content/filters";
import { cn } from "@/lib/utils";

export function RecipeLibrary({ recipes }: { recipes: Recipe[] }) {
  const { data } = useUserData();
  const [category, setCategory] = useState<RecipeCategory | "all">("all");
  const [time, setTime] = useState<TimeFilter>("all");
  const [query, setQuery] = useState("");
  const [favoritesOnly, setFavoritesOnly] = useState(false);

  const favorites = useMemo(() => data?.favorites ?? [], [data?.favorites]);
  const list = useMemo(() => filterRecipes(recipes, { category, time, query, favoritesOnly, favorites }), [recipes, category, time, query, favoritesOnly, favorites]);
  const popular = ["banana", "aveia", "frango", "ovo", "abóbora", "grão-de-bico", "iogurte"];
  const hasFilters = category !== "all" || time !== "all" || query || favoritesOnly;

  return (
    <>
      <PageHeader eyebrow="Biblioteca" title="50 receitas para o dia a dia" description="Práticas, caseiras e com ingredientes fáceis de encontrar. Filtre por refeição, tempo ou pelo que você tem em casa." />

      <div className="sticky top-16 z-20 -mx-4 mb-5 space-y-3 bg-cream/90 px-4 py-3 backdrop-blur-md sm:mx-0 sm:rounded-3xl sm:border sm:border-line sm:bg-white sm:p-4 sm:shadow-soft lg:top-4">
        <div className="relative">
          <Search className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-muted" />
          <Input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por nome ou ingrediente (ex.: banana, aveia)"
            aria-label="Buscar receitas por nome ou ingrediente"
            className="pl-12"
          />
        </div>
        <div className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1" role="group" aria-label="Categorias">
          {[{ id: "all" as const, label: "Todas" }, ...RECIPE_CATEGORIES.map((c) => ({ id: c.id, label: c.short }))].map((c) => (
            <button
              key={c.id}
              type="button"
              aria-pressed={category === c.id}
              onClick={() => setCategory(c.id)}
              className={cn(
                "h-10 shrink-0 rounded-full border px-4 text-sm font-semibold transition",
                category === c.id ? "border-forest bg-forest text-white" : "border-line bg-white text-ink/80 hover:border-emerald/40",
              )}
            >
              {c.label}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <label className="relative inline-flex items-center">
            <SlidersHorizontal className="pointer-events-none absolute left-3 size-4 text-muted" />
            <span className="sr-only">Tempo de preparo</span>
            <select
              value={time}
              onChange={(e) => setTime(e.target.value as typeof time)}
              className="h-10 appearance-none rounded-full border border-line bg-white pr-4 pl-9 text-sm font-semibold"
            >
              {TIME_FILTERS.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.label}
                </option>
              ))}
            </select>
          </label>
          <button
            type="button"
            aria-pressed={favoritesOnly}
            onClick={() => setFavoritesOnly((v) => !v)}
            className={cn(
              "inline-flex h-10 items-center gap-1.5 rounded-full border px-4 text-sm font-semibold transition",
              favoritesOnly ? "border-coral bg-coral/10 text-coral" : "border-line bg-white text-ink/80",
            )}
          >
            <Heart className={cn("size-4", favoritesOnly && "fill-coral")} /> Favoritas ({favorites.length})
          </button>
          {hasFilters ? (
            <button
              type="button"
              onClick={() => (setCategory("all"), setTime("all"), setQuery(""), setFavoritesOnly(false))}
              className="inline-flex h-10 items-center gap-1 rounded-full px-3 text-sm font-semibold text-muted hover:text-ink"
            >
              <X className="size-4" /> Limpar
            </button>
          ) : null}
        </div>
        {!query ? (
          <div className="no-scrollbar flex gap-1.5 overflow-x-auto text-xs">
            <span className="shrink-0 py-1 font-semibold text-muted">Tenho em casa:</span>
            {popular.map((p) => (
              <button key={p} type="button" onClick={() => setQuery(p)} className="shrink-0 rounded-full bg-mint px-2.5 py-1 font-semibold text-forest">
                {p}
              </button>
            ))}
          </div>
        ) : null}
      </div>

      <p className="mb-3 text-sm font-semibold text-muted" aria-live="polite">
        {list.length} {list.length === 1 ? "receita encontrada" : "receitas encontradas"}
      </p>
      {list.length ? (
        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-4">
          {list.map((r) => (
            <RecipeCard key={r.slug} recipe={r} />
          ))}
        </div>
      ) : (
        <EmptyState icon={Search} title="Nenhuma receita com esses filtros">
          Tente remover algum filtro ou buscar por outro ingrediente.
        </EmptyState>
      )}
    </>
  );
}
