"use client";
import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import { Button, type ButtonProps } from "@/components/ui/button";
import { buildCheckoutUrl, track } from "@/lib/tracking/client";
import { cn } from "@/lib/utils";

export function CheckoutButton({
  url,
  priceCents,
  label = "QUERO COMEÇAR MEUS 30 DIAS",
  className,
  variant = "gold",
  size = "lg",
  placement = "default",
}: {
  url: string;
  priceCents: number;
  label?: string;
  className?: string;
  variant?: ButtonProps["variant"];
  size?: ButtonProps["size"];
  placement?: string;
}) {
  // O link já sai com as UTMs; o clique segue o link normalmente (sem redirecionar via JS),
  // para que o pixel da UTMify e o da Meta consigam registrar o InitiateCheckout antes da troca de página.
  const [href, setHref] = useState(url);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (url) setHref(buildCheckoutUrl(url));
  }, [url]);

  if (!url)
    return (
      <div className={cn("text-center", className)}>
        <Button variant={variant} size={size} disabled className="h-auto min-h-14 w-full whitespace-normal py-3 leading-snug">
          {label}
        </Button>
        <p className="mt-2 text-xs text-muted">Checkout em configuração. Volte em breve.</p>
      </div>
    );
  return (
    <Button
      asChild
      variant={variant}
      size={size}
      className={cn("botao-checkout group h-auto min-h-14 whitespace-normal py-3 text-center leading-snug sm:whitespace-nowrap", className)}
      data-placement={placement}
    >
      <a
        href={href}
        rel="noopener"
        id={`botao-checkout-${placement}`}
        data-checkout="true"
        onClick={(e) => {
          // Parte do link atual (que pode já ter parâmetros adicionados pelo script de UTMs da UTMify) e só completa o que faltar.
          const finalUrl = buildCheckoutUrl(e.currentTarget.href || url);
          if (e.currentTarget.href !== finalUrl) e.currentTarget.href = finalUrl;
          track("InitiateCheckout", { value: priceCents / 100, currency: "BRL", content_name: "Vida Leve" }, "checkout");
        }}
      >
        {label} <ArrowRight className="transition group-hover:translate-x-0.5" />
      </a>
    </Button>
  );
}
