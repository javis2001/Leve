"use client";
import Script from "next/script";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { PUBLIC_CONFIG } from "@/lib/env";
import { captureAttribution, getConsent, track, type Consent } from "@/lib/tracking/client";

const UTMIFY_SCRIPT_URL = process.env.NEXT_PUBLIC_UTMIFY_SCRIPT_URL || "https://cdn.utmify.com.br/scripts/pixel/pixel.js";

/** Carrega Meta Pixel, GA4 e UTMify nas páginas públicas, exceto para quem recusou a medição. Nunca na área de membros. */
export function TrackingScripts() {
  const pathname = usePathname();
  // undefined = ainda não lido do navegador (não carrega nada até saber a escolha da pessoa)
  const [consent, setConsentState] = useState<Consent | null | undefined>(undefined);
  const isPublic = !pathname.startsWith("/app") && !pathname.startsWith("/admin");

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setConsentState(getConsent());
    const onChange = (e: Event) => setConsentState((e as CustomEvent<Consent>).detail);
    window.addEventListener("vl30:consent", onChange);
    return () => window.removeEventListener("vl30:consent", onChange);
  }, []);

  useEffect(() => {
    captureAttribution();
  }, [pathname, consent]);

  useEffect(() => {
    if (consent !== undefined && consent !== "denied" && isPublic) {
      const t = setTimeout(() => track("PageView", {}, pathname), 300);
      return () => clearTimeout(t);
    }
  }, [pathname, consent, isPublic]);

  if (consent === undefined || consent === "denied" || !isPublic) return null;
  const { metaPixelId, ga4Id, utmifyPixelId } = PUBLIC_CONFIG;

  return (
    <>
      {metaPixelId && (
        <Script id="meta-pixel" strategy="afterInteractive">
          {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${metaPixelId.replace(/\D/g, "")}');`}
        </Script>
      )}
      {ga4Id && (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(ga4Id)}`} strategy="afterInteractive" />
          <Script id="ga4" strategy="afterInteractive">
            {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${ga4Id.replace(/[^A-Z0-9-]/gi, "")}',{send_page_view:false,anonymize_ip:true});`}
          </Script>
        </>
      )}
      {utmifyPixelId && UTMIFY_SCRIPT_URL && (
        <>
          <Script id="utmify-id" strategy="afterInteractive">{`window.pixelId=${JSON.stringify(utmifyPixelId)};`}</Script>
          <Script src={UTMIFY_SCRIPT_URL} strategy="afterInteractive" />
        </>
      )}
      {utmifyPixelId && (
        // Script de UTMs da UTMify: guarda as UTMs do anúncio e as repassa ao checkout no formato que a UTMify usa para atribuir a venda.
        <Script
          src="https://cdn.utmify.com.br/scripts/utms/latest.js"
          strategy="afterInteractive"
          data-utmify-prevent-xcod-sck=""
          data-utmify-prevent-subids=""
        />
      )}
    </>
  );
}
