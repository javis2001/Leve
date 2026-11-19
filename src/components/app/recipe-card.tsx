"use client";
import Link from "next/link";
import { Clock, Heart, Users } from "lucide-react";
import { RecipeArt } from "@/components/brand/recipe-art";
import { useUserData } from "@/lib/data/provider";
import { RECIPE_CATEGORIES, type Recipe } from "@/lib/content/types";
import { cn } from "@/lib/utils";

export function RecipeCard({ recipe, className }: { recipe: Recipe; className?: string }) {
  const { data, toggleFavorite } = useUserData();
  const fav = data?.favorites.includes(recipe.slug) ?? false;
  const cat = RECIPE_CATEGORIES.find((c) => c.id === recipe.category)?.short;
  return (
    <article className={cn("group relative overflow-hidden rounded-3xl border border-line/80 bg-white shadow-soft transition hover:-translate-y-0.5 hover:shadow-lift", className)}>
      <Link href={`/app/receitas/${recipe.slug}`} className="block">
        <div className="aspect-[4/3] overflow-hidden">
          <RecipeArt recipe={recipe} className="transition duration-500 group-hover:scale-105" />
        </div>
        <div className="p-4">
          <p className="text-[0.7rem] font-bold tracking-wider text-emerald uppercase">{cat}</p>
          <h3 className="mt-1 line-clamp-2 font-bold leading-snug">{recipe.title}</h3>
          <div className="mt-3 flex items-center gap-4 text-xs font-semibold text-muted">
            <span className="inline-flex items-center gap-1">
              <Clock className="size-3.5" /> {recipe.prepMinutes} min
            </span>
            <span className="inline-flex items-center gap-1 truncate">
              <Users className="size-3.5 shrink-0" /> <span className="truncate">{recipe.servings}</span>
            </span>
          </div>
        </div>
      </Link>
      <button
        type="button"
        onClick={() => toggleFavorite(recipe.slug)}
        aria-pressed={fav}
        aria-label={fav ? `Remover ${recipe.title} dos favoritos` : `Favoritar ${recipe.title}`}
        className="absolute top-3 right-3 grid size-10 place-items-center rounded-full bg-white/90 shadow-soft backdrop-blur transition hover:scale-105"
      >
        <Heart className={cn("size-5", fav ? "fill-coral text-coral" : "text-ink/60")} />
      </button>
    </article>
  );
}
