import { saveSettings } from "../actions";
import { ActionForm } from "@/components/admin/action-form";
import { AdminTitle } from "@/components/admin/ui";
import { Input, Label, Textarea } from "@/components/ui/input";
import { ADAPTERS } from "@/lib/checkout/adapters";
import { PUBLIC_CONFIG, SITE_URL } from "@/lib/env";
import { getPublicSettings } from "@/lib/settings";

export default async function SettingsAdmin() {
  const { offer, support } = await getPublicSettings();
  const integrations = [
    ["Supabase (service role para webhooks)", Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY)],
    ["Webhook Cakto (CAKTO_WEBHOOK_SECRET)", ADAPTERS.cakto.configured()],
    ["Webhook genérico (GENERIC_WEBHOOK_SECRET)", ADAPTERS.generic.configured()],
    ["Webhook Perfect Pay", false],
    ["Meta Pixel (navegador)", Boolean(PUBLIC_CONFIG.metaPixelId)],
    ["Meta Conversions API (Purchase no servidor)", Boolean(PUBLIC_CONFIG.metaPixelId && process.env.META_CAPI_ACCESS_TOKEN)],
    ["Google Analytics 4", Boolean(PUBLIC_CONFIG.ga4Id)],
    ["GA4 Measurement Protocol (Purchase no servidor)", Boolean(PUBLIC_CONFIG.ga4Id && process.env.GA4_API_SECRET)],
    ["UTMify (pixel)", Boolean(PUBLIC_CONFIG.utmifyPixelId)],
  ] as const;
  return (
    <>
      <AdminTitle title="Oferta e checkout" description="Valores salvos aqui têm prioridade sobre as variáveis de ambiente." />
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_380px]">
        <ActionForm action={saveSettings} className="space-y-4 rounded-2xl border border-line bg-white p-5">
          <h2 className="font-bold">Oferta</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div><Label htmlFor="productName">Produto</Label><Input id="productName" name="productName" defaultValue={offer.productName} required /></div>
            <div><Label htmlFor="price">Preço (R$)</Label><Input id="price" name="price" inputMode="decimal" defaultValue={(offer.priceCents / 100).toFixed(2).replace(".", ",")} required /></div>
          </div>
          <div><Label htmlFor="checkoutUrl">URL do checkout (https)</Label><Input id="checkoutUrl" name="checkoutUrl" type="url" defaultValue={offer.checkoutUrl} placeholder="https://pay.seuprovedor.com/..." /></div>
          <label className="flex items-center gap-2 text-sm font-semibold"><input type="checkbox" name="guaranteeEnabled" defaultChecked={offer.guaranteeEnabled} className="size-4 accent-emerald" /> Exibir garantia na página de vendas</label>
          <div>
            <Label htmlFor="guaranteeText">Condições reais da garantia</Label>
            <Textarea id="guaranteeText" name="guaranteeText" rows={3} defaultValue={offer.guaranteeText} placeholder="Descreva exatamente as condições oferecidas." />
          </div>
          <h2 className="pt-2 font-bold">Suporte</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div><Label htmlFor="supportEmail">E-mail</Label><Input id="supportEmail" name="supportEmail" type="email" defaultValue={support.email} /></div>
            <div><Label htmlFor="supportWhatsapp">WhatsApp (com DDI e DDD)</Label><Input id="supportWhatsapp" name="supportWhatsapp" defaultValue={support.whatsapp} placeholder="5591999999999" /></div>
          </div>
          <div><Label htmlFor="supportHours">Horário de atendimento</Label><Input id="supportHours" name="supportHours" defaultValue={support.hours} /></div>
        </ActionForm>
        <div className="h-fit space-y-4">
          <div className="rounded-2xl border border-line bg-white p-5">
            <h2 className="mb-3 font-bold">Status das integrações</h2>
            <ul className="space-y-2 text-sm">
              {integrations.map(([l, ok]) => (
                <li key={l} className="flex items-start justify-between gap-3">
                  <span>{l}</span>
                  <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-bold ${ok ? "bg-mint text-forest" : "bg-gold-soft text-gold-deep"}`}>{ok ? "Ativo" : "Pendente"}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl border border-line bg-white p-5 text-sm">
            <h2 className="mb-2 font-bold">URLs de webhook</h2>
            <p className="text-muted">Cadastre no painel do provedor:</p>
            <code className="mt-2 block rounded-lg bg-mint/60 p-2 text-xs break-all">{SITE_URL}/api/webhooks/cakto</code>
            <code className="mt-2 block rounded-lg bg-mint/60 p-2 text-xs break-all">{SITE_URL}/api/webhooks/generic</code>
            <p className="mt-2 text-xs text-muted">Eventos Cakto usados: purchase_approved, purchase_refused, refund, chargeback, subscription_canceled.</p>
          </div>
        </div>
      </div>
    </>
  );
}
