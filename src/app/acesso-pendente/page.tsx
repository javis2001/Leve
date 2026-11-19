import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Clock, Mail, MessageCircle } from "lucide-react";
import { SignOutButton } from "@/components/app/sign-out-button";
import { AuthLayout } from "@/components/auth/auth-layout";
import { CheckoutButton } from "@/components/landing/checkout-button";
import { Button } from "@/components/ui/button";
import { getViewer } from "@/lib/auth";
import { getPublicSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Acesso pendente", robots: { index: false } };

export default async function PendingPage() {
  const viewer = await getViewer();
  if (!viewer) redirect("/login");
  if (viewer.hasAccess) redirect("/app");
  const { offer, support } = await getPublicSettings();
  return (
    <AuthLayout title="Seu acesso ainda não foi liberado" subtitle={<>Conta: <strong className="text-ink">{viewer.email}</strong></>}>
      <div className="space-y-4">
        <div className="flex gap-3 rounded-2xl bg-mint p-4 text-sm text-forest">
          <Clock className="size-5 shrink-0" />
          <p>
            O acesso é liberado automaticamente assim que o pagamento é confirmado pelo provedor. Pagamentos por Pix e cartão costumam ser confirmados em poucos
            minutos; boletos podem levar até alguns dias úteis.
          </p>
        </div>
        <p className="text-sm text-muted">
          Verifique se você usou <strong>o mesmo e-mail</strong> na compra e no cadastro. Se comprou com outro e-mail, fale com o suporte.
        </p>
        <Button asChild size="lg" className="w-full">
          <Link href="/app">Já paguei — verificar novamente</Link>
        </Button>
        <CheckoutButton url={offer.checkoutUrl} priceCents={offer.priceCents} variant="outline" label="Ainda não comprei — garantir meu acesso" className="w-full" />
        {support.email || support.whatsapp ? (
          <div className="flex flex-wrap gap-2 pt-2 text-sm">
            {support.email ? (
              <a href={`mailto:${support.email}`} className="inline-flex items-center gap-1.5 font-semibold text-emerald">
                <Mail className="size-4" /> {support.email}
              </a>
            ) : null}
            {support.whatsapp ? (
              <a href={`https://wa.me/${support.whatsapp.replace(/\D/g, "")}`} className="inline-flex items-center gap-1.5 font-semibold text-emerald" target="_blank" rel="noopener">
                <MessageCircle className="size-4" /> WhatsApp
              </a>
            ) : null}
          </div>
        ) : null}
        <SignOutButton className="inline-flex items-center gap-2 text-sm font-semibold text-muted" />
      </div>
    </AuthLayout>
  );
}
