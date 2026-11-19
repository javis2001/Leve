import type { Metadata } from "next";
import { getJourneyDays } from "@/lib/content/server";
import { JOURNEY_WEEKS } from "@/lib/content/journey";
import { JourneyView } from "./journey-view";

export const metadata: Metadata = { title: "Jornada de 30 dias" };

export default async function JourneyPage() {
  const days = await getJourneyDays();
  return <JourneyView days={days} weeks={JOURNEY_WEEKS} />;
}
