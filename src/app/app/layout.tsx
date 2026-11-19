import type { Metadata } from "next";
import { AppShell } from "@/components/app/app-shell";
import { requireMember } from "@/lib/auth";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Minha área", robots: { index: false, follow: false } };

export default async function MemberLayout({ children }: { children: React.ReactNode }) {
  const viewer = await requireMember();
  return (
    <AppShell mode={viewer.mode} isAdmin={viewer.isAdmin}>
      {children}
    </AppShell>
  );
}
