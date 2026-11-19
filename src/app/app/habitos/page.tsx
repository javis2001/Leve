import type { Metadata } from "next";
import { HabitsView } from "./habits-view";

export const metadata: Metadata = { title: "Hábitos" };

export default function HabitsPage() {
  return <HabitsView />;
}
