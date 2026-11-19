import type { Metadata } from "next";
import { getRecipes } from "@/lib/content/server";
import { MealPlanner } from "./meal-planner";

export const metadata: Metadata = { title: "Cardápio semanal" };

export default async function MealPlanPage() {
  return <MealPlanner recipes={await getRecipes()} />;
}
