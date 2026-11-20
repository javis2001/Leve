"use client";
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
  if (!url)
    return (
      <div className={cn("text-center", className)}>
        <Button variant={variant} size={size} disabled className="w-full">
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
      className={cn("group", className)}
      data-placement={placement}
    >
      <a
        href={url}
        rel="noopener"
        onClick={(e) => {
          const finalUrl = buildCheckoutUrl(url);
          track("InitiateCheckout", { value: priceCents / 100, currency: "BRL", content_name: "Vida Leve" }, "checkout");
          e.preventDefault();
          window.location.href = finalUrl;
        }}
      >
        {label} <ArrowRight className="transition group-hover:translate-x-0.5" />
      </a>
    </Button>
  );
}
