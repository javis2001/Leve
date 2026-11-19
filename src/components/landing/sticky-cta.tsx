"use client";
import { useEffect, useState } from "react";
import { formatBRL } from "@/lib/utils";
import { CheckoutButton } from "./checkout-button";

export function StickyCta({ url, priceCents }: { url: string; priceCents: number }) {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const on = () => setShow(window.scrollY > 700 && window.innerHeight + window.scrollY < document.body.scrollHeight - 900);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);
  if (!url) return null;
  return (
    <div className={`fixed inset-x-0 bottom-0 z-40 border-t border-line bg-white/95 px-4 py-3 backdrop-blur safe-bottom transition-transform duration-300 sm:hidden ${show ? "translate-y-0" : "translate-y-full"}`}>
      <div className="flex items-center gap-3">
        <div className="shrink-0">
          <p className="text-[0.65rem] font-bold text-muted uppercase">Acesso completo</p>
          <p className="text-lg font-extrabold text-forest">{formatBRL(priceCents)}</p>
        </div>
        <CheckoutButton url={url} priceCents={priceCents} label="COMEÇAR" size="md" className="flex-1" placement="sticky" />
      </div>
    </div>
  );
}
