import { AdminTitle, StatusPill, Table } from "@/components/admin/ui";
import { getViewer } from "@/lib/auth";
import { getSupabaseServer } from "@/lib/supabase/server";
import { formatBRL } from "@/lib/utils";

export default async function OrdersAdmin() {
  const viewer = await getViewer();
  const sb = viewer?.mode === "supabase" ? await getSupabaseServer() : null;
  type Ord = { id: string; provider: string; provider_order_id: string; email: string; status: string; amount_cents: number | null; utm: Record<string, string>; created_at: string };
  type Ev = { id: string; order_id: string; from_status: string | null; to_status: string; event_type: string; created_at: string };
  type Wh = { id: string; provider: string; event_type: string | null; received_at: string; processed_at: string | null; error: string | null };
  let orders: Ord[] = [];
  let events: Ev[] = [];
  let hooks: Wh[] = [];
  if (sb) {
    orders = ((await sb.from("orders").select("*").order("created_at", { ascending: false }).limit(200)).data ?? []) as Ord[];
    events = ((await sb.from("order_events").select("*").order("created_at", { ascending: false }).limit(300)).data ?? []) as Ev[];
    hooks = ((await sb.from("webhook_events").select("id, provider, event_type, received_at, processed_at, error").order("received_at", { ascending: false }).limit(50)).data ?? []) as Wh[];
  }
  return (
    <>
      <AdminTitle title="Histórico de transações" description="Pedidos recebidos por webhook, mudanças de status e eventos brutos." />
      <Table head={["Data", "Pedido", "E-mail", "Valor", "Origem (UTM)", "Status", "Histórico"]}>
        {orders.map((o) => (
          <tr key={o.id} className="align-top">
            <td className="px-3 py-2 text-xs whitespace-nowrap">{new Date(o.created_at).toLocaleString("pt-BR")}</td>
            <td className="px-3 py-2 text-xs">{o.provider}<br /><span className="text-muted">{o.provider_order_id}</span></td>
            <td className="px-3 py-2">{o.email}</td>
            <td className="px-3 py-2">{o.amount_cents != null ? formatBRL(o.amount_cents) : "—"}</td>
            <td className="px-3 py-2 text-xs">{[o.utm?.utm_source, o.utm?.utm_campaign].filter(Boolean).join(" / ") || "—"}</td>
            <td className="px-3 py-2"><StatusPill status={o.status} /></td>
            <td className="px-3 py-2 text-xs text-muted">
              {events.filter((e) => e.order_id === o.id).map((e) => (
                <div key={e.id}>{new Date(e.created_at).toLocaleDateString("pt-BR")}: {e.from_status ?? "novo"} → {e.to_status} ({e.event_type})</div>
              ))}
            </td>
          </tr>
        ))}
        {!orders.length && <tr><td colSpan={7} className="px-3 py-6 text-center text-muted">Nenhum pedido registrado.</td></tr>}
      </Table>
      <h2 className="mt-8 mb-3 font-bold">Webhooks recebidos</h2>
      <Table head={["Recebido", "Provedor", "Evento", "Processado", "Erro"]}>
        {hooks.map((h) => (
          <tr key={h.id}>
            <td className="px-3 py-2 text-xs">{new Date(h.received_at).toLocaleString("pt-BR")}</td>
            <td className="px-3 py-2">{h.provider}</td>
            <td className="px-3 py-2">{h.event_type}</td>
            <td className="px-3 py-2">{h.processed_at ? "Sim" : "Não"}</td>
            <td className="px-3 py-2 text-xs text-danger">{h.error}</td>
          </tr>
        ))}
        {!hooks.length && <tr><td colSpan={5} className="px-3 py-6 text-center text-muted">Nenhum webhook recebido.</td></tr>}
      </Table>
    </>
  );
}
