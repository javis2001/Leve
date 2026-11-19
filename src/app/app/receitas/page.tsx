import type { Metadata } from "next";
import { getRecipes } from "@/lib/content/server";
import { RecipeLibrary } from "./recipe-library";

export const metadata: Metadata = { title: "Receitas" };

export default async function RecipesPage() {
  return <RecipeLibrary recipes={await getRecipes()} />;
}
