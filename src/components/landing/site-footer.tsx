import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { OpenConsentButton } from "@/components/tracking/consent-banner";
import { PUBLIC_CONFIG } from "@/lib/env";
import type { SupportSettings } from "@/lib/settings";

export function SiteFooter({ support }: { support: SupportSettings }) {
  return (
    <footer className="bg-forest-deep text-white/80">
      <div className="mx-auto grid grid-cols-1 max-w-6xl gap-10 px-5 py-14 sm:grid-cols-3 sm:px-8">
        <div>
          <Logo tone="light" />
          <p className="mt-4 max-w-xs text-sm">Programa digital educativo de bem-estar. Não substitui acompanhamento médico, nutricional ou de educação física.</p>
        </div>
        <nav aria-label="Links institucionais" className="text-sm">
          <p className="mb-3 font-bold text-white">Institucional</p>
          <ul className="space-y-2">
            <li><Link href="/termos" className="hover:text-gold">Termos de Uso</Link></li>
            <li><Link href="/privacidade" className="hover:text-gold">Política de Privacidade</Link></li>
            <li><OpenConsentButton className="hover:text-gold" /></li>
            <li><Link href="/login" className="hover:text-gold">Área de membros</Link></li>
          </ul>
        </nav>
        <div className="text-sm">
          <p className="mb-3 font-bold text-white">Contato</p>
          {support.email || support.whatsapp ? (
            <ul className="space-y-2">
              {support.email ? <li><a href={`mailto:${support.email}`} className="hover:text-gold">{support.email}</a></li> : null}
              {support.whatsapp ? (
                <li><a href={`https://wa.me/${support.whatsapp.replace(/\D/g, "")}`} target="_blank" rel="noopener" className="hover:text-gold">WhatsApp</a></li>
              ) : null}
              {support.hours ? <li className="text-white/60">{support.hours}</li> : null}
            </ul>
          ) : (
            <p className="text-white/60">Canal de contato a ser configurado pelo administrador.</p>
          )}
        </div>
      </div>
      <div className="border-t border-white/10 px-5 py-6 text-center text-xs text-white/50">
        © {new Date().getFullYear()} Vida Leve 30
        {PUBLIC_CONFIG.companyName ? ` · ${PUBLIC_CONFIG.companyName}` : ""}
        {PUBLIC_CONFIG.companyDocument ? ` · CNPJ ${PUBLIC_CONFIG.companyDocument}` : ""}. Todos os direitos reservados.
      </div>
    </footer>
  );
}
