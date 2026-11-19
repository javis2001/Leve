import { getJourneyDays, getRecipes } from "@/lib/content/server";
import { getViewer } from "@/lib/auth";
import { Dashboard } from "./dashboard";

export default async function DashboardPage() {
  const [days, recipes, viewer] = await Promise.all([getJourneyDays(), getRecipes(), getViewer()]);
  return <Dashboard days={days} recipes={recipes} viewerName={viewer?.name ?? ""} />;
}
