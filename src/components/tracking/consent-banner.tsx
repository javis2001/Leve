"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Cookie } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getConsent, setConsent } from "@/lib/tracking/client";

export function ConsentBanner() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setOpen(getConsent() === null);
    const reopen = () => setOpen(true);
    window.addEventListener("vl30:open-consent", reopen);
    return () => window.removeEventListener("vl30:open-consent", reopen);
  }, []);

  if (!open) return null;
  return (
    <div role="dialog" aria-live="polite" aria-label="Preferências de cookies" className="fixed inset-x-3 bottom-3 z-[60] mx-auto max-w-xl rounded-3xl border border-line bg-white p-5 shadow-lift sm:bottom-5">
      <div className="flex gap-3">
        <div className="grid size-10 shrink-0 place-items-center rounded-2xl bg-gold-soft text-gold-deep">
          <Cookie className="size-5" />
        </div>
        <div className="text-sm text-ink/85">
          <p className="font-bold text-ink">Sua privacidade importa</p>
          <p className="mt-1">
            Usamos cookies essenciais para o site funcionar. Com sua permissão, também usamos cookies de medição de campanhas (Meta, Google e UTMify). Nenhum dado
            de saúde ou do seu diário é compartilhado.{" "}
            <Link href="/privacidade" className="font-semibold text-emerald underline underline-offset-2">
              Saiba mais
            </Link>
          </p>
        </div>
      </div>
      <div className="mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button variant="outline" onClick={() => (setConsent("denied"), setOpen(false))}>
          Somente essenciais
        </Button>
        <Button onClick={() => (setConsent("granted"), setOpen(false))}>Aceitar todos</Button>
      </div>
    </div>
  );
}

export function OpenConsentButton({ className }: { className?: string }) {
  return (
    <button type="button" className={className} onClick={() => window.dispatchEvent(new Event("vl30:open-consent"))}>
      Preferências de cookies
    </button>
  );
}
