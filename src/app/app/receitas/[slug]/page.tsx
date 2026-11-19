import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getRecipe } from "@/lib/content/server";
import { RecipeDetail } from "./recipe-detail";

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const r = await getRecipe((await params).slug);
  return { title: r?.title ?? "Receita" };
}

export default async function RecipePage({ params }: Params) {
  const recipe = await getRecipe((await params).slug);
  if (!recipe) notFound();
  return <RecipeDetail recipe={recipe} />;
}
