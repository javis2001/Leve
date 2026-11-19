import type { Metadata } from "next";
import { JournalView } from "./journal-view";

export const metadata: Metadata = { title: "Diário de bem-estar" };

export default function JournalPage() {
  return <JournalView />;
}
