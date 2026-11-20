"use client";

export type TrackEvent = "PageView" | "ViewContent" | "InitiateCheckout";
export type Consent = "granted" | "denied";

const CONSENT_KEY = "vl30-consent";
const UTM_KEY = "vl30-utm";
const SENT_KEY = "vl30-sent-events";

export const ATTRIBUTION_PARAMS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
  "utm_id",
  "src",
  "sck",
  "xcod",
  "fbclid",
  "gclid",
] as const;

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

export function getConsent(): Consent | null {
  try {
    const v = localStorage.getItem(CONSENT_KEY);
    return v === "granted" || v === "denied" ? v : null;
  } catch {
    return null;
  }
}

export function setConsent(v: Consent) {
  try {
    localStorage.setItem(CONSENT_KEY, v);
    if (v === "denied") localStorage.removeItem(UTM_KEY);
  } catch {
    /* ignore */
  }
  window.dispatchEvent(new CustomEvent("vl30:consent", { detail: v }));
}

/**
 * Lê parâmetros de campanha da URL atual. Eles são sempre repassados ao checkout
 * (necessário para atribuir a venda), mas só ficam salvos entre visitas com consentimento.
 */
export function captureAttribution(): Record<string, string> {
  const current: Record<string, string> = {};
  try {
    const sp = new URLSearchParams(window.location.search);
    for (const k of ATTRIBUTION_PARAMS) {
      const v = sp.get(k);
      if (v) current[k] = v.slice(0, 200);
    }
    if (Object.keys(current).length) sessionStorage.setItem(UTM_KEY, JSON.stringify(current));
    if (Object.keys(current).length && getConsent() !== "denied") {
      localStorage.setItem(UTM_KEY, JSON.stringify({ ...current, captured_at: new Date().toISOString() }));
    }
  } catch {
    /* ignore */
  }
  return current;
}

export function getAttribution(): Record<string, string> {
  try {
    const fromUrl = captureAttribution();
    if (Object.keys(fromUrl).length) return fromUrl;
    const s = sessionStorage.getItem(UTM_KEY) ?? (getConsent() !== "denied" ? localStorage.getItem(UTM_KEY) : null);
    if (!s) return {};
    const parsed = JSON.parse(s) as Record<string, string>;
    delete parsed.captured_at;
    return parsed;
  } catch {
    return {};
  }
}

/** Monta a URL do checkout preservando UTMs e identificadores de campanha. */
export function buildCheckoutUrl(base: string) {
  if (!base) return "";
  try {
    const url = new URL(base);
    for (const [k, v] of Object.entries(getAttribution())) if (!url.searchParams.has(k)) url.searchParams.set(k, v);
    return url.toString();
  } catch {
    return base;
  }
}

function alreadySent(key: string) {
  try {
    const set = new Set<string>(JSON.parse(sessionStorage.getItem(SENT_KEY) ?? "[]"));
    if (set.has(key)) return true;
    set.add(key);
    sessionStorage.setItem(SENT_KEY, JSON.stringify([...set].slice(-100)));
    return false;
  } catch {
    return false;
  }
}

const GA_NAMES: Record<TrackEvent, string> = {
  PageView: "page_view",
  ViewContent: "view_item",
  InitiateCheckout: "begin_checkout",
};

/**
 * Dispara um evento nas plataformas ativas, respeitando consentimento e evitando duplicidade.
 * Nunca envie dados de saúde, diário ou hábitos para plataformas de anúncio.
 * Purchase NÃO é disparado no navegador: é enviado pelo servidor após pagamento confirmado.
 */
export function track(event: TrackEvent, params: { value?: number; currency?: string; content_name?: string } = {}, dedupeKey?: string) {
  if (typeof window === "undefined" || getConsent() === "denied") return;
  const key = `${event}:${dedupeKey ?? window.location.pathname}`;
  if (alreadySent(key)) return;
  const eventID = `${event}-${Math.random().toString(36).slice(2, 10)}-${Date.now()}`;
  if (event === "PageView") window.fbq?.("track", "PageView", {}, { eventID });
  else window.fbq?.("track", event, params, { eventID });
  window.gtag?.("event", GA_NAMES[event], {
    ...(params.value !== undefined ? { value: params.value, currency: params.currency ?? "BRL" } : {}),
    ...(event === "PageView" ? { page_path: window.location.pathname } : {}),
  });
}
