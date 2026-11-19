import type { Metadata } from "next";
import { JOURNEY_WEEKS } from "@/lib/content/journey";
import { ProgressView } from "./progress-view";

export const metadata: Metadata = { title: "Progresso" };

export default function ProgressPage() {
  return <ProgressView weeks={JOURNEY_WEEKS} />;
}
