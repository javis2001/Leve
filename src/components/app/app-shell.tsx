"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { FlaskConical, Menu } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { UserDataProvider } from "@/lib/data/provider";
import { cn } from "@/lib/utils";
import { BOTTOM_NAV, NAV, isActive } from "./nav";
import { SignOutButton } from "./sign-out-button";

export function AppShell({ mode, isAdmin, children }: { mode: "demo" | "supabase"; isAdmin: boolean; children: React.ReactNode }) {
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = useState(false);
  const items = NAV.filter((n) => !n.adminOnly || isAdmin);
  const bottom = items.filter((n) => BOTTOM_NAV.includes(n.href));
  const more = items.filter((n) => !BOTTOM_NAV.includes(n.href));

  return (
    <UserDataProvider mode={mode}>
      <a href="#conteudo" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[70] focus:rounded-xl focus:bg-white focus:px-4 focus:py-2">
        Pular para o conteúdo
      </a>
      <div className="min-h-dvh bg-cream lg:grid lg:grid-cols-[272px_1fr]">
        {/* Barra lateral (desktop) */}
        <aside className="sticky top-0 hidden h-dvh flex-col border-r border-line/70 bg-white/70 px-4 py-6 backdrop-blur lg:flex">
          <Link href="/app" className="px-2">
            <Logo />
          </Link>
          <nav aria-label="Menu principal" className="mt-8 flex flex-1 flex-col gap-1 overflow-y-auto">
            {items.map((n) => {
              const active = isActive(pathname, n.href);
              return (
                <Link
                  key={n.href}
                  href={n.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex items-center gap-3 rounded-2xl px-3 py-2.5 text-[0.95rem] font-semibold transition",
                    active ? "bg-forest text-white shadow-soft" : "text-ink/75 hover:bg-mint hover:text-forest",
                  )}
                >
                  <n.icon className="size-5" aria-hidden />
                  {n.label}
                </Link>
              );
            })}
          </nav>
          {mode === "supabase" ? (
            <SignOutButton className="mt-4 flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-semibold text-muted hover:bg-mint" />
          ) : null}
        </aside>

        <div className="flex min-h-dvh min-w-0 flex-col">
          {/* Cabeçalho (mobile) */}
          <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-line/60 bg-cream/85 px-4 backdrop-blur-md lg:hidden">
            <Link href="/app" aria-label="Início">
              <Logo />
            </Link>
            <Link href="/app/perfil" className="grid size-10 place-items-center rounded-2xl bg-white text-forest shadow-soft" aria-label="Perfil">
              <NavIcon href="/app/perfil" />
            </Link>
          </header>

          {mode === "demo" && (
            <div data-demo-banner className="flex items-center justify-center gap-2 bg-gold-soft px-4 py-2 text-center text-xs font-semibold text-gold-deep">
              <FlaskConical className="size-4 shrink-0" />
              Modo demonstração: seus dados ficam salvos apenas neste navegador.
            </div>
          )}

          <main id="conteudo" className="mx-auto w-full max-w-6xl flex-1 px-4 pt-5 pb-28 sm:px-6 lg:px-10 lg:pt-10 lg:pb-12">
            {children}
          </main>
        </div>
      </div>

      {/* Navegação inferior (mobile) */}
      <nav aria-label="Navegação rápida" className="fixed inset-x-0 bottom-0 z-40 border-t border-line/70 bg-white/95 backdrop-blur-md safe-bottom lg:hidden">
        <ul className="mx-auto grid max-w-md grid-cols-5">
          {bottom.map((n) => {
            const active = isActive(pathname, n.href);
            return (
              <li key={n.href}>
                <Link href={n.href} aria-current={active ? "page" : undefined} className="flex h-16 flex-col items-center justify-center gap-1 text-[0.7rem] font-semibold">
                  <span className={cn("grid h-8 w-12 place-items-center rounded-full transition", active ? "bg-mint text-forest" : "text-muted")}>
                    <n.icon className="size-[1.35rem]" aria-hidden />
                  </span>
                  <span className={active ? "text-forest" : "text-muted"}>{n.label}</span>
                </Link>
              </li>
            );
          })}
          <li>
            <button
              type="button"
              onClick={() => setMoreOpen(true)}
              className="flex h-16 w-full flex-col items-center justify-center gap-1 text-[0.7rem] font-semibold text-muted"
              aria-haspopup="dialog"
            >
              <span className={cn("grid h-8 w-12 place-items-center rounded-full", more.some((m) => isActive(pathname, m.href)) && "bg-mint text-forest")}>
                <Menu className="size-[1.35rem]" aria-hidden />
              </span>
              Mais
            </button>
          </li>
        </ul>
      </nav>

      <Dialog open={moreOpen} onOpenChange={setMoreOpen}>
        <DialogContent title="Menu" side="bottom">
          <div className="grid grid-cols-3 gap-2">
            {more.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                onClick={() => setMoreOpen(false)}
                className={cn(
                  "flex flex-col items-center gap-2 rounded-2xl border border-line p-3 text-center text-xs font-semibold",
                  isActive(pathname, n.href) ? "border-emerald bg-mint text-forest" : "text-ink",
                )}
              >
                <n.icon className="size-6 text-emerald" aria-hidden />
                {n.label}
              </Link>
            ))}
          </div>
          {mode === "supabase" ? (
            <SignOutButton className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl border border-line py-3 text-sm font-semibold text-muted" />
          ) : null}
        </DialogContent>
      </Dialog>
    </UserDataProvider>
  );
}

function NavIcon({ href }: { href: string }) {
  const item = NAV.find((n) => n.href === href)!;
  return <item.icon className="size-5" aria-hidden />;
}

