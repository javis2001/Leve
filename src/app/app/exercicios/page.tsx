import type { Metadata } from "next";
import { getExercises } from "@/lib/content/server";
import { ExerciseLibrary } from "./exercise-library";

export const metadata: Metadata = { title: "Exercícios" };

export default async function ExercisesPage() {
  return <ExerciseLibrary exercises={await getExercises()} />;
}
