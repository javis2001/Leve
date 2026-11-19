import { describe, expect, it } from "vitest";
import { caktoAdapter, genericAdapter, perfectPayAdapter, signGeneric } from "@/lib/checkout/adapters";

const env = { GENERIC_WEBHOOK_SECRET: "s3cr3t", CAKTO_WEBHOOK_SECRET: "cakto-secret" } as unknown as NodeJS.ProcessEnv;
const now = () => Math.floor(Date.now() / 1000);

function genericBody(status = "paid") {
  return JSON.stringify({ id: "evt_1", type: "order.updated", order: { id: "ord_1", status, amount_cents: 2990, customer: { email: "Ana@Exemplo.com", name: "Ana" } }, utm: { utm_source: "meta", foo: "x" } });
}

describe("adaptador genérico", () => {
  it("aceita assinatura válida e normaliza", () => {
    const body = genericBody();
    const ts = now();
    const h = new Headers({ "x-vl30-signature": signGeneric("s3cr3t", ts, body), "x-vl30-timestamp": String(ts) });
    const r = genericAdapter.handle(body, h, env);
    expect(r.ok && "event" in r && r.event).toMatchObject({ email: "ana@exemplo.com", status: "paid", amountCents: 2990, utm: { utm_source: "meta" } });
  });
  it("rejeita assinatura inválida", () => {
    const ts = now();
    const r = genericAdapter.handle(genericBody(), new Headers({ "x-vl30-signature": "sha256=00", "x-vl30-timestamp": String(ts) }), env);
    expect(r).toMatchObject({ ok: false, status: 401 });
  });
  it("rejeita corpo adulterado", () => {
    const ts = now();
    const sig = signGeneric("s3cr3t", ts, genericBody("pending"));
    const r = genericAdapter.handle(genericBody("paid"), new Headers({ "x-vl30-signature": sig, "x-vl30-timestamp": String(ts) }), env);
    expect(r).toMatchObject({ ok: false, status: 401 });
  });
  it("rejeita timestamp antigo (replay)", () => {
    const ts = now() - 3600;
    const body = genericBody();
    const r = genericAdapter.handle(body, new Headers({ "x-vl30-signature": signGeneric("s3cr3t", ts, body), "x-vl30-timestamp": String(ts) }), env);
    expect(r).toMatchObject({ ok: false, status: 401 });
  });
  it("sem segredo configurado não processa", () => {
    expect(genericAdapter.handle(genericBody(), new Headers(), {} as NodeJS.ProcessEnv)).toMatchObject({ ok: false, status: 503 });
  });
});

describe("adaptador Cakto", () => {
  const body = (event: string, secret = "cakto-secret") =>
    JSON.stringify({ secret, event, data: { id: "81b408ee", refId: "AUAe5xK", status: "paid", amount: 29.9, customer: { name: "Bia", email: "bia@exemplo.com" } } });
  it("compra aprovada vira paid", () => {
    const r = caktoAdapter.handle(body("purchase_approved"), new Headers(), env);
    expect(r.ok && "event" in r && r.event).toMatchObject({ status: "paid", amountCents: 2990, orderId: "81b408ee", eventKey: "purchase_approved:81b408ee" });
  });
  it("reembolso e chargeback", () => {
    for (const [e, s] of [["refund", "refunded"], ["chargeback", "chargeback"], ["subscription_canceled", "canceled"]]) {
      const r = caktoAdapter.handle(body(e), new Headers(), env);
      expect(r.ok && "event" in r && r.event.status).toBe(s);
    }
  });
  it("segredo errado é rejeitado", () => {
    expect(caktoAdapter.handle(body("purchase_approved", "x"), new Headers(), env)).toMatchObject({ ok: false, status: 401 });
  });
  it("eventos que não alteram acesso são ignorados", () => {
    expect(caktoAdapter.handle(body("pix_gerado"), new Headers(), env)).toMatchObject({ ok: true, ignored: expect.any(String) });
  });
});

describe("Perfect Pay", () => {
  it("permanece pendente até a configuração", () => {
    expect(perfectPayAdapter.handle("{}", new Headers())).toMatchObject({ ok: false, status: 501 });
  });
});
