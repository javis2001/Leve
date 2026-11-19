import Link from "next/link";
import { AdminTitle, StatusPill, Table } from "@/components/admin/ui";
import { getViewer } from "@/lib/auth";
import { EXERCISES } from "@/lib/content/exercises";
import { RECIPES } from "@/lib/content/recipes";
import { getSupabaseServer } from "@/lib/supabase/server";
import { formatBRL } from "@/lib/utils";

export default async function AdminHome() {
  const viewer = await getViewer();
  const sb = viewer?.mode === "supabase" ? await getSupabaseServer() : null;
  let stats = { users: 0, active: 0, paid: 0, revenue: 0, refunds: 0 };
  let recent: { id: string; email: string; status: string; amount_cents: number | null; created_at: string; provider: string }[] = [];
  if (sb) {
    const [users, ents, orders] = await Promise.all([
      sb.from("profiles").select("id", { count: "exact", head: true }),
      sb.from("entitlements").select("id", { count: "exact", head: true }).eq("status", "active"),
      sb.from("orders").select("id, email, status, amount_cents, created_at, provider").order("created_at", { ascending: false }).limit(500),
    ]);
    const all = orders.data ?? [];
    stats = {
      users: users.count ?? 0,
      active: ents.count ?? 0,
      paid: all.filter((o) => o.status === "paid").length,
      revenue: all.filter((o) => o.status === "paid").reduce((a, o) => a + (o.amount_cents ?? 0), 0),
      refunds: all.filter((o) => ["refunded", "chargeback"].includes(o.status)).length,
    };
    recent = all.slice(0, 8);
  }
  const tiles = [
    ["Contas criadas", stats.users],
    ["Acessos ativos", stats.active],
    ["Pedidos pagos", stats.paid],
    ["Receita confirmada", formatBRL(stats.revenue)],
    ["Reembolsos/chargebacks", stats.refunds],
    ["Receitas · Exercícios", `${RECIPES.length} · ${EXERCISES.length}`],
  ];
  return (
    <>
      <AdminTitle title="Visão geral" description="Resumo da plataforma. Valores consideram apenas pedidos confirmados por webhook." />
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        {tiles.map(([l, v]) => (
          <div key={String(l)} className="rounded-2xl border border-line bg-white p-4">
            <p className="text-2xl font-extrabold text-forest">{v}</p>
            <p className="text-xs font-semibold text-muted">{l}</p>
          </div>
        ))}
      </div>
      <h2 className="mt-8 mb-3 font-bold">Últimas transações</h2>
      {recent.length ? (
        <Table head={["Data", "E-mail", "Provedor", "Valor", "Status"]}>
          {recent.map((o) => (
            <tr key={o.id}>
              <td className="px-3 py-2 whitespace-nowrap">{new Date(o.created_at).toLocaleString("pt-BR")}</td>
              <td className="px-3 py-2">{o.email}</td>
              <td className="px-3 py-2">{o.provider}</td>
              <td className="px-3 py-2">{o.amount_cents != null ? formatBRL(o.amount_cents) : "—"}</td>
              <td className="px-3 py-2"><StatusPill status={o.status} /></td>
            </tr>
          ))}
        </Table>
      ) : (
        <p className="rounded-2xl border border-dashed border-line bg-white p-6 text-sm text-muted">
          Nenhuma transação registrada ainda. Configure o webhook do checkout em <Link className="font-semibold text-emerald" href="/admin/configuracoes">Oferta e checkout</Link>.
        </p>
      )}
    </>
  );
}
