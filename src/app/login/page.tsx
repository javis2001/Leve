import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthLayout } from "@/components/auth/auth-layout";
import { getViewer } from "@/lib/auth";
import { isDemoMode } from "@/lib/env";
import { safeNext } from "@/lib/safe-redirect";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Entrar" };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string; erro?: string }> }) {
  const sp = await searchParams;
  const next = safeNext(sp.next);
  const viewer = await getViewer();
  if (viewer && viewer.mode === "supabase") redirect(next);
  return (
    <AuthLayout title="Que bom ter você aqui" subtitle="Entre para continuar sua jornada.">
      <LoginForm next={next} demo={isDemoMode} configError={sp.erro === "configuracao"} />
    </AuthLayout>
  );
}
