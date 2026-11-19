import { createHmac, timingSafeEqual } from "node:crypto";
import { z } from "zod";

export type PaymentStatus = "pending" | "paid" | "refused" | "refunded" | "chargeback" | "canceled";

export interface NormalizedEvent {
  provider: string;
  /** Chave única do evento para idempotência */
  eventKey: string;
  eventType: string;
  orderId: string;
  email: string;
  name: string | null;
  status: PaymentStatus;
  amountCents: number | null;
  utm: Record<string, string>;
}

export type AdapterResult =
  | { ok: true; event: NormalizedEvent }
  | { ok: true; ignored: string }
  | { ok: false; status: number; error: string };

export interface CheckoutAdapter {
  id: string;
  configured: () => boolean;
  handle: (rawBody: string, headers: Headers, env?: NodeJS.ProcessEnv) => AdapterResult;
}

export function safeEqual(a: string, b: string) {
  const ba = Buffer.from(a);
  const bb = Buffer.from(b);
  return ba.length === bb.length && timingSafeEqual(ba, bb);
}

const UTM_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "utm_id", "src", "sck", "xcod"];
export function pickUtm(...sources: unknown[]) {
  const out: Record<string, string> = {};
  for (const s of sources) {
    if (!s || typeof s !== "object") continue;
    for (const k of UTM_KEYS) {
      const v = (s as Record<string, unknown>)[k];
      if (typeof v === "string" && v && !out[k]) out[k] = v.slice(0, 200);
    }
  }
  return out;
}

// ─────────────────────────────────────────────────────────────
// Adaptador genérico (formato próprio documentado no README).
// Assinatura: header x-vl30-signature = "sha256=" + HMAC_SHA256(secret, `${timestamp}.${corpo}`)
//             header x-vl30-timestamp = segundos Unix (tolerância de 5 minutos)
// ─────────────────────────────────────────────────────────────
const GenericBody = z.object({
  id: z.string().min(1).max(200),
  type: z.string().min(1).max(100),
  order: z.object({
    id: z.string().min(1).max(200),
    status: z.enum(["pending", "paid", "refused", "refunded", "chargeback", "canceled"]),
    amount_cents: z.number().int().nonnegative().optional(),
    customer: z.object({ email: z.string().email().max(254), name: z.string().max(200).optional() }),
  }),
  utm: z.record(z.string(), z.string()).optional(),
});

export function signGeneric(secret: string, timestamp: number, body: string) {
  return "sha256=" + createHmac("sha256", secret).update(`${timestamp}.${body}`).digest("hex");
}

export const genericAdapter: CheckoutAdapter = {
  id: "generic",
  configured: () => Boolean(process.env.GENERIC_WEBHOOK_SECRET),
  handle(raw, headers, env = process.env) {
    const secret = env.GENERIC_WEBHOOK_SECRET;
    if (!secret) return { ok: false, status: 503, error: "Webhook genérico não configurado" };
    const sig = headers.get("x-vl30-signature") ?? "";
    const ts = Number(headers.get("x-vl30-timestamp") ?? "0");
    if (!ts || Math.abs(Date.now() / 1000 - ts) > 300) return { ok: false, status: 401, error: "Timestamp inválido" };
    if (!safeEqual(sig, signGeneric(secret, ts, raw))) return { ok: false, status: 401, error: "Assinatura inválida" };
    let json: unknown;
    try {
      json = JSON.parse(raw);
    } catch {
      return { ok: false, status: 400, error: "JSON inválido" };
    }
    const p = GenericBody.safeParse(json);
    if (!p.success) return { ok: false, status: 400, error: "Payload inválido" };
    const b = p.data;
    return {
      ok: true,
      event: {
        provider: "generic",
        eventKey: b.id,
        eventType: b.type,
        orderId: b.order.id,
        email: b.order.customer.email.toLowerCase(),
        name: b.order.customer.name ?? null,
        status: b.order.status,
        amountCents: b.order.amount_cents ?? null,
        utm: pickUtm(b.utm),
      },
    };
  },
};

// ─────────────────────────────────────────────────────────────
// Cakto — conforme a documentação pública de webhooks da Cakto:
// corpo JSON com { secret, event, data: { id, customer: { name, email }, status, amount, ... } }.
// O campo `secret` é comparado com CAKTO_WEBHOOK_SECRET (definido ao criar o webhook no painel).
// Valide com o “Enviar evento de teste” do painel antes de ir para produção.
// ─────────────────────────────────────────────────────────────
const CAKTO_EVENTS: Record<string, PaymentStatus> = {
  purchase_approved: "paid",
  purchase_refused: "refused",
  refund: "refunded",
  chargeback: "chargeback",
  subscription_canceled: "canceled",
};

const CaktoBody = z.object({
  secret: z.string(),
  event: z.string(),
  data: z
    .object({
      id: z.union([z.string(), z.number()]).transform(String),
      refId: z.string().optional(),
      amount: z.union([z.number(), z.string()]).optional(),
      customer: z.object({ email: z.string().email(), name: z.string().nullish() }).passthrough(),
    })
    .passthrough(),
});

export const caktoAdapter: CheckoutAdapter = {
  id: "cakto",
  configured: () => Boolean(process.env.CAKTO_WEBHOOK_SECRET),
  handle(raw, _headers, env = process.env) {
    const secret = env.CAKTO_WEBHOOK_SECRET;
    if (!secret) return { ok: false, status: 503, error: "Webhook Cakto não configurado" };
    let json: unknown;
    try {
      json = JSON.parse(raw);
    } catch {
      return { ok: false, status: 400, error: "JSON inválido" };
    }
    const p = CaktoBody.safeParse(json);
    if (!p.success) return { ok: false, status: 400, error: "Payload inválido" };
    if (!safeEqual(p.data.secret, secret)) return { ok: false, status: 401, error: "Segredo inválido" };
    const status = CAKTO_EVENTS[p.data.event];
    if (!status) return { ok: true, ignored: `Evento ${p.data.event} não altera acesso` };
    const d = p.data.data;
    const amount = d.amount === undefined ? null : Math.round(Number(d.amount) * 100);
    return {
      ok: true,
      event: {
        provider: "cakto",
        eventKey: `${p.data.event}:${d.id}`,
        eventType: p.data.event,
        orderId: d.id,
        email: d.customer.email.toLowerCase(),
        name: d.customer.name ?? null,
        status,
        amountCents: Number.isFinite(amount) ? amount : null,
        utm: pickUtm(d, (d as Record<string, unknown>).utm, (d as Record<string, unknown>).tracking),
      },
    };
  },
};

// ─────────────────────────────────────────────────────────────
// Perfect Pay — PENDENTE. O formato do postback e o método de validação devem ser
// confirmados na documentação/painel da Perfect Pay antes da implementação.
// Veja "Integrações pendentes" no README.
// ─────────────────────────────────────────────────────────────
export const perfectPayAdapter: CheckoutAdapter = {
  id: "perfectpay",
  configured: () => false,
  handle: () => ({ ok: false, status: 501, error: "Integração Perfect Pay pendente de configuração (veja o README)" }),
};

export const ADAPTERS: Record<string, CheckoutAdapter> = {
  generic: genericAdapter,
  cakto: caktoAdapter,
  perfectpay: perfectPayAdapter,
};
