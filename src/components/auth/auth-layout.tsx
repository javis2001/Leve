import Link from "next/link";
import { Logo } from "@/components/brand/logo";

export function AuthLayout({ title, subtitle, children }: { title: string; subtitle?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-1 min-h-dvh lg:grid-cols-2">
      <div className="relative hidden overflow-hidden bg-gradient-to-br from-forest via-forest to-emerald p-12 text-white lg:flex lg:flex-col">
        <div className="absolute -top-24 -right-24 size-96 rounded-full bg-emerald/40 blur-3xl" />
        <svg className="absolute bottom-0 left-0 w-full opacity-70" viewBox="0 0 600 300" fill="none" aria-hidden>
          <path d="M0 260C180 260 320 210 460 60" stroke="#D6B36A" strokeWidth="3" />
          <circle cx="0" cy="260" r="8" fill="#D6B36A" />
        </svg>
        <Link href="/" className="relative">
          <Logo tone="light" />
        </Link>
        <div className="relative mt-auto mb-24 max-w-md">
          <p className="font-display text-4xl leading-tight font-semibold">Uma vida mais leve começa com pequenos passos.</p>
          <p className="mt-4 text-white/75">Jornada de 30 dias, receitas práticas, exercícios em casa e ferramentas para cuidar melhor de você.</p>
        </div>
      </div>
      <div className="flex flex-col px-5 py-8 sm:px-10">
        <Link href="/" className="lg:hidden">
          <Logo />
        </Link>
        <div className="mx-auto my-auto w-full max-w-md py-10">
          <h1 className="font-display text-3xl font-semibold text-forest sm:text-4xl">{title}</h1>
          {subtitle ? <div className="mt-2 text-muted">{subtitle}</div> : null}
          <div className="mt-8">{children}</div>
        </div>
      </div>
    </div>
  );
}
