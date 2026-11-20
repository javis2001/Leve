import "server-only";
import { cache } from "react";
import { createClient } from "@supabase/supabase-js";
import { PUBLIC_CONFIG, SUPABASE_ANON_KEY, SUPABASE_URL, isSupabaseConfigured } from "@/lib/env";

export interface OfferSettings {
  productName: string;
  priceCents: number;
  checkoutUrl: string;
  guaranteeEnabled: boolean;
  guaranteeText: string;
}
export interface SupportSettings {
  email: string;
  whatsapp: string;
  hours: string;
}

/** Configurações públicas: banco (painel admin) tem prioridade sobre variáveis de ambiente. */
export const getPublicSettings = cache(async () => {
  let offer: Partial<OfferSettings> = {};
  let support: Partial<SupportSettings> = {};
  // Cliente anônimo (sem cookies): permite que páginas públicas sejam estáticas/ISR.
  const sb = isSupabaseConfigured ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY, { auth: { persistSession: false } }) : null;
  if (sb) {
    const { data } = await sb.from("site_settings").select("key, value").in("key", ["offer", "support"]);
    for (const row of data ?? []) {
      if (row.key === "offer") offer = row.value as Partial<OfferSettings>;
      if (row.key === "support") support = row.value as Partial<SupportSettings>;
    }
  }
  return {
    offer: {
      productName: offer.productName || "Vida Leve",
      priceCents: offer.priceCents || PUBLIC_CONFIG.priceCents,
      checkoutUrl: offer.checkoutUrl || PUBLIC_CONFIG.checkoutUrl,
      guaranteeEnabled: Boolean(offer.guaranteeEnabled && offer.guaranteeText),
      guaranteeText: offer.guaranteeText ?? "",
    } satisfies OfferSettings,
    support: {
      email: support.email || PUBLIC_CONFIG.supportEmail,
      whatsapp: support.whatsapp || PUBLIC_CONFIG.supportWhatsapp,
      hours: support.hours ?? "",
    } satisfies SupportSettings,
  };
});
