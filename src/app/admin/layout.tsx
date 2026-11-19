import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ChefHat, FileText, Image as ImageIcon, LayoutDashboard, Map, PersonStanding, Receipt, Settings, Users } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Administração", robots: { index: false, follow: false } };

const ITEMS = [
  { href: "/admin", label: "Visão geral", icon: LayoutDashboard },
  { href: "/admin/usuarios", label: "Usuários e acesso", icon: Users },
  { href: "/admin/pedidos", label: "Transações", icon: Receipt },
  { href: "/admin/receitas", label: "Receitas", icon: ChefHat },
  { href: "/admin/exercicios", label: "Exercícios", icon: PersonStanding },
  { href: "/admin/jornada", label: "Jornada (30 dias)", icon: Map },
  { href: "/admin/materiais", label: "Materiais PDF", icon: FileText },
  { href: "/admin/imagens", label: "Imagens", icon: ImageIcon },
  { href: "/admin/configuracoes", label: "Oferta e checkout", icon: Settings },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const viewer = await requireAdmin();
  return (
    <div className="min-h-dvh bg-[#f6f8f7] lg:grid lg:grid-cols-[250px_1fr]">
      <aside className="border-b border-line bg-white p-4 lg:sticky lg:top-0 lg:h-dvh lg:border-r lg:border-b-0">
        <div className="flex items-center justify-between lg:block">
          <Logo />
          <p className="text-xs font-bold tracking-wider text-gold-deep uppercase lg:mt-2">Painel admin</p>
        </div>
        <nav className="no-scrollbar mt-4 flex gap-1 overflow-x-auto lg:flex-col" aria-label="Administração">
          {ITEMS.map((i) => (
            <Link key={i.href} href={i.href} className="flex shrink-0 items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-semibold text-ink/75 hover:bg-mint hover:text-forest">
              <i.icon className="size-4" /> {i.label}
            </Link>
          ))}
          <Link href="/app" className="flex shrink-0 items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-semibold text-muted hover:bg-mint lg:mt-4">
            <ArrowLeft className="size-4" /> Voltar ao app
          </Link>
        </nav>
      </aside>
      <main className="min-w-0 p-4 sm:p-8">
        {viewer.mode === "demo" ? (
          <p className="mb-6 rounded-2xl bg-gold-soft p-3 text-sm font-semibold text-gold-deep">
            Modo demonstração: o painel mostra o conteúdo padrão, mas salvar alterações exige o Supabase configurado.
          </p>
        ) : null}
        {children}
      </main>
    </div>
  );
}
