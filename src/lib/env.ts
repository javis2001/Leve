export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

/**
 * Modo demonstração: usado quando o Supabase ainda não foi configurado.
 * Em desenvolvimento fica ativo automaticamente; em produção, só com NEXT_PUBLIC_DEMO_MODE=true.
 * Os dados ficam salvos apenas no navegador.
 */
export const isDemoMode =
  !isSupabaseConfigured &&
  (process.env.NEXT_PUBLIC_DEMO_MODE === "true" || process.env.NODE_ENV !== "production");

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");

export const PUBLIC_CONFIG = {
  checkoutUrl: process.env.NEXT_PUBLIC_CHECKOUT_URL || "https://pay.cakto.com.br/yojcohy_1348277",
  priceCents: Number(process.env.NEXT_PUBLIC_PRICE_CENTS ?? 2990),
  supportEmail: process.env.NEXT_PUBLIC_SUPPORT_EMAIL ?? "",
  supportWhatsapp: process.env.NEXT_PUBLIC_SUPPORT_WHATSAPP ?? "",
  companyName: process.env.NEXT_PUBLIC_COMPANY_NAME ?? "",
  companyDocument: process.env.NEXT_PUBLIC_COMPANY_DOCUMENT ?? "",
  metaPixelId: process.env.NEXT_PUBLIC_META_PIXEL_ID ?? "",
  ga4Id: process.env.NEXT_PUBLIC_GA4_ID ?? "",
  utmifyPixelId: process.env.NEXT_PUBLIC_UTMIFY_PIXEL_ID ?? "",
};
