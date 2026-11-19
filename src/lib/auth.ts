import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { getSupabaseServer } from "@/lib/supabase/server";
import { isDemoMode, isSupabaseConfigured } from "@/lib/env";

export type Viewer =
  | { mode: "demo"; isAdmin: true; hasAccess: true; name: string; email: string; userId: "demo" }
  | {
      mode: "supabase";
      userId: string;
      email: string;
      name: string;
      isAdmin: boolean;
      hasAccess: boolean;
      journeyStartedAt: string | null;
    };

export const getViewer = cache(async (): Promise<Viewer | null> => {
  if (!isSupabaseConfigured) {
    return isDemoMode
      ? { mode: "demo", isAdmin: true, hasAccess: true, name: "Visitante", email: "demo@vidaleve30.local", userId: "demo" }
      : null;
  }
  const supabase = await getSupabaseServer();
  if (!supabase) return null;
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const [{ data: profile }, { data: access }] = await Promise.all([
    supabase.from("profiles").select("full_name, role, journey_started_at").eq("id", user.id).maybeSingle(),
    supabase.rpc("has_access"),
  ]);

  return {
    mode: "supabase",
    userId: user.id,
    email: user.email ?? "",
    name: profile?.full_name ?? "",
    isAdmin: profile?.role === "admin",
    hasAccess: Boolean(access),
    journeyStartedAt: profile?.journey_started_at ?? null,
  };
});

/** Garante usuária autenticada e com acesso liberado. */
export async function requireMember(next = "/app") {
  const viewer = await getViewer();
  if (!viewer) redirect(`/login?next=${encodeURIComponent(next)}`);
  if (!viewer.hasAccess) redirect("/acesso-pendente");
  return viewer;
}

/** Garante administradora. Verificação feita no servidor a cada requisição. */
export async function requireAdmin() {
  const viewer = await getViewer();
  if (!viewer) redirect("/login?next=/admin");
  if (!viewer.isAdmin) redirect("/app");
  return viewer;
}

/** Para Server Actions / Route Handlers: lança erro em vez de redirecionar. */
export async function assertAdmin() {
  const viewer = await getViewer();
  if (!viewer || !viewer.isAdmin) throw new Error("Acesso negado");
  return viewer;
}
