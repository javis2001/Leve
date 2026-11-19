"use client";
import { useEffect, useRef } from "react";
import { track } from "@/lib/tracking/client";

/** Dispara ViewContent uma única vez por sessão quando a oferta aparece na tela. */
export function ViewContentTrigger({ priceCents }: { priceCents: number }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        track("ViewContent", { value: priceCents / 100, currency: "BRL", content_name: "Vida Leve 30" }, "offer");
        io.disconnect();
      }
    });
    io.observe(el);
    return () => io.disconnect();
  }, [priceCents]);
  return <div ref={ref} aria-hidden />;
}
