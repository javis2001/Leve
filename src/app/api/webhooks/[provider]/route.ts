import { NextResponse } from "next/server";
import { ADAPTERS } from "@/lib/checkout/adapters";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { sendServerPurchase } from "@/lib/tracking/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Recebe webhooks de pagamento.
 * 1. Valida assinatura/segredo do provedor   2. Registra o evento (idempotência)
 * 3. Atualiza pedido e acesso de forma atômica (process_payment_event)
 * 4. Dispara Purchase no servidor somente na primeira confirmação de pagamento.
 */
export async function POST(req: Request, { params }: { params: Promise<{ provider: string }> }) {
  const { provider } = await params;
  const adapter = ADAPTERS[provider];
  if (!adapter) return NextResponse.json({ error: "Provedor desconhecido" }, { status: 404 });

  const raw = await req.text();
  if (raw.length > 256_000) return NextResponse.json({ error: "Payload muito grande" }, { status: 413 });

  const result = adapter.handle(raw, req.headers);
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: result.status });
  if ("ignored" in result) return NextResponse.json({ ok: true, ignored: result.ignored });

  const ev = result.event;
  const db = getSupabaseAdmin();
  if (!db) return NextResponse.json({ error: "Banco de dados não configurado" }, { status: 503 });

  // Idempotência: um registro por (provedor, chave do evento)
  const payload = JSON.parse(raw) as Record<string, unknown>;
  delete payload.secret;
  const ins = await db.from("webhook_events").insert({ provider: ev.provider, event_key: ev.eventKey, event_type: ev.eventType, payload }).select("id").single();
  let rowId = ins.data?.id as string | undefined;
  if (ins.error) {
    if (ins.error.code !== "23505") {
      console.error("[webhook] erro ao registrar", ins.error);
      return NextResponse.json({ error: "Erro ao registrar evento" }, { status: 500 });
    }
    const existing = await db.from("webhook_events").select("id, processed_at").eq("provider", ev.provider).eq("event_key", ev.eventKey).single();
    if (existing.data?.processed_at) return NextResponse.json({ ok: true, duplicate: true });
    rowId = existing.data?.id;
  }

  const { data, error } = await db.rpc("process_payment_event", {
    p_provider: ev.provider,
    p_provider_order_id: ev.orderId,
    p_email: ev.email,
    p_customer_name: ev.name,
    p_status: ev.status,
    p_amount_cents: ev.amountCents,
    p_utm: ev.utm,
    p_event_type: ev.eventType,
  });
  if (error) {
    console.error("[webhook] erro ao processar", error);
    await db.from("webhook_events").update({ error: error.message }).eq("id", rowId!);
    return NextResponse.json({ error: "Erro ao processar" }, { status: 500 });
  }
  await db.from("webhook_events").update({ processed_at: new Date().toISOString(), error: null }).eq("id", rowId!);

  const r = data as { order_id: string; first_paid: boolean; status: string; changed: boolean };
  if (r.first_paid) await sendServerPurchase({ orderId: r.order_id, valueCents: ev.amountCents, email: ev.email, utm: ev.utm });

  return NextResponse.json({ ok: true, status: r.status, changed: r.changed });
}
