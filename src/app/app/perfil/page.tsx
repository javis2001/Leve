import type { Metadata } from "next";
import { getViewer } from "@/lib/auth";
import { ProfileView } from "./profile-view";

export const metadata: Metadata = { title: "Perfil" };

export default async function ProfilePage() {
  const viewer = await getViewer();
  return <ProfileView email={viewer?.email ?? ""} mode={viewer?.mode ?? "demo"} />;
}
