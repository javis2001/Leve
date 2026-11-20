import { getViewer } from "@/lib/auth";
import { getSupabaseServer } from "@/lib/supabase/server";

export const runtime = "nodejs";

/** LGPD — portabilidade: exporta todos os dados pessoais da usuária em JSON. */
export async function GET() {
  const viewer = await getViewer();
  if (!viewer || viewer.mode !== "supabase") return new Response("Não autorizado", { status: 401 });
  const sb = (await getSupabaseServer())!;
  const tables = ["profiles", "entitlements", "day_progress", "favorites", "habits", "habit_logs", "journal_entries", "meal_plans", "shopping_items"] as const;
  const result: Record<string, unknown> = { exportado_em: new Date().toISOString(), email: viewer.email };
  for (const t of tables) {
    const { data, error } = await sb.from(t).select("*");
    result[t] = error ? { erro: error.message } : data;
  }
  return new Response(JSON.stringify(result, null, 2), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="meus-dados-vida-leve.json"`,
      "Cache-Control": "no-store",
    },
  });
}
