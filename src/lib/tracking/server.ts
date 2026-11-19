import "server-only";
import { createHash } from "node:crypto";

const sha256 = (s: string) => createHash("sha256").update(s.trim().toLowerCase()).digest("hex");

async function post(url: string, body: unknown) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 5000);
  try {
    const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body), signal: ctrl.signal });
    if (!res.ok) console.error("[tracking] resposta", res.status, await res.text().catch(() => ""));
  } catch (e) {
    console.error("[tracking] falha", e);
  } finally {
    clearTimeout(t);
  }
}

/**
 * Envia o evento Purchase pelo servidor, apenas após pagamento confirmado e uma única vez por pedido
 * (garantido por orders.purchase_tracked_at). Nenhum dado de saúde é enviado.
 */
export async function sendServerPurchase(p: { orderId: string; valueCents: number | null; email: string; utm: Record<string, string> }) {
  const value = (p.valueCents ?? Number(process.env.NEXT_PUBLIC_PRICE_CENTS ?? 2990)) / 100;
  const jobs: Promise<void>[] = [];

  const pixel = process.env.NEXT_PUBLIC_META_PIXEL_ID;
  const token = process.env.META_CAPI_ACCESS_TOKEN;
  if (pixel && token) {
    const version = process.env.META_GRAPH_API_VERSION || "v23.0";
    const user_data: Record<string, unknown> = {};
    if (process.env.META_CAPI_SEND_EMAIL_HASH === "true") user_data.em = [sha256(p.email)];
    jobs.push(
      post(`https://graph.facebook.com/${version}/${pixel.replace(/\D/g, "")}/events?access_token=${encodeURIComponent(token)}`, {
        data: [
          {
            event_name: "Purchase",
            event_time: Math.floor(Date.now() / 1000),
            event_id: `purchase_${p.orderId}`,
            action_source: "website",
            user_data,
            custom_data: { currency: "BRL", value, content_name: "Vida Leve 30" },
          },
        ],
        ...(process.env.META_TEST_EVENT_CODE ? { test_event_code: process.env.META_TEST_EVENT_CODE } : {}),
      }),
    );
  }

  const ga = process.env.NEXT_PUBLIC_GA4_ID;
  const gaSecret = process.env.GA4_API_SECRET;
  if (ga && gaSecret) {
    jobs.push(
      post(`https://www.google-analytics.com/mp/collect?measurement_id=${encodeURIComponent(ga)}&api_secret=${encodeURIComponent(gaSecret)}`, {
        client_id: `${sha256(p.orderId).slice(0, 10)}.${Math.floor(Date.now() / 1000)}`,
        events: [
          {
            name: "purchase",
            params: {
              transaction_id: p.orderId,
              currency: "BRL",
              value,
              campaign: p.utm.utm_campaign,
              source: p.utm.utm_source,
              medium: p.utm.utm_medium,
              items: [{ item_id: "vida-leve-30", item_name: "Vida Leve 30", price: value, quantity: 1 }],
            },
          },
        ],
      }),
    );
  }
  await Promise.all(jobs);
}
