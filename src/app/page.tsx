import { existsSync } from "node:fs";
import path from "node:path";
import Image from "next/image";
import Link from "next/link";
import {
  BadgeCheck, BookHeart, CalendarDays, ChefHat, CircleCheckBig, Clock, Dumbbell, Footprints, Home, Leaf, Map, Smartphone, Sparkles, Sprout, Trophy, Zap,
} from "lucide-react";
import { RecipeArt } from "@/components/brand/recipe-art";
import { Logo } from "@/components/brand/logo";
import { CheckoutButton } from "@/components/landing/checkout-button";
import { Phone } from "@/components/landing/phone";
import { Reveal } from "@/components/landing/reveal";
import { ScreensCarousel } from "@/components/landing/screens-carousel";
import { SiteFooter } from "@/components/landing/site-footer";
import { StickyCta } from "@/components/landing/sticky-cta";
import { ViewContentTrigger } from "@/components/landing/view-content";
import { Button } from "@/components/ui/button";
import { RECIPE_BY_SLUG } from "@/lib/content/recipes";
import { getPublicSettings } from "@/lib/settings";
import { formatBRL } from "@/lib/utils";

export const revalidate = 300;

const HERO_PHOTO = existsSync(path.join(process.cwd(), "public/images/hero.jpg")) ? "/images/hero.jpg" : null;

const INCLUDED = [
  { icon: Map, title: "Jornada de 30 dias", text: "Um passo por dia: tema educativo, atividade, alimentação, hábito e checklist.", tone: "bg-mint text-forest" },
  { icon: ChefHat, title: "50 receitas saudáveis", text: "Cafés, almoços, jantares, lanches e sobremesas com ingredientes do dia a dia.", tone: "bg-gold-soft text-gold-deep" },
  { icon: Dumbbell, title: "Exercícios em casa", text: "Movimentos leves e progressivos, com adaptações e cuidados de segurança.", tone: "bg-[#e7ecf7] text-[#2f4c99]" },
  { icon: CalendarDays, title: "Cardápio semanal", text: "Monte a semana, gere a lista de compras e exporte em PDF.", tone: "bg-mint text-forest" },
  { icon: CircleCheckBig, title: "Planner de hábitos", text: "Hidratação, movimento, sono e autocuidado — do seu jeito, sem cobranças.", tone: "bg-gold-soft text-gold-deep" },
  { icon: BookHeart, title: "Diário de bem-estar", text: "Registre humor, energia, sono e pequenas conquistas em um espaço privado.", tone: "bg-[#f6e9f0] text-[#8a3d64]" },
];

const FAQ = [
  ["Como acesso o conteúdo?", "Após a confirmação do pagamento, crie sua conta em “Criar conta” usando o mesmo e-mail da compra. O acesso é liberado automaticamente e você entra pela área de membros, no celular ou no computador."],
  ["Preciso de academia ou equipamentos?", "Não. Os exercícios usam o peso do próprio corpo, uma cadeira firme e uma parede. A caminhada pode ser feita na rua ou dentro de casa."],
  ["Como funciona o programa?", "São 30 dias divididos em 4 semanas. Cada dia traz um conteúdo curto, uma atividade física adaptável, uma sugestão de alimentação, um hábito e um checklist. Você segue no seu ritmo e pode revisar os dias anteriores quando quiser."],
  ["Posso usar pelo celular?", "Sim. A plataforma foi desenhada primeiro para o celular, com navegação inferior e botões grandes. Também funciona em tablets e computadores, e seu progresso fica salvo na sua conta."],
  ["Como baixo os PDFs?", "Na área de membros, abra “Materiais” e toque em “Baixar”. São 7 PDFs com capa e paginação, prontos para ler no celular ou imprimir em A4."],
  ["E se eu não conseguir fazer um exercício?", "Todo exercício tem adaptações (inclusive versões sentadas). Faça a versão mais confortável e pare se sentir dor, tontura ou falta de ar. Se você tem alguma condição de saúde, converse com um profissional antes de começar."],
  ["Como funciona o suporte?", "Você pode falar com a equipe pelos canais de contato informados no rodapé desta página. Respondemos dúvidas sobre acesso, pagamentos e uso da plataforma."],
  ["O programa promete emagrecimento?", "Não. O Vida Leve é educativo e foca em bem-estar, consistência e autonomia. Não fazemos promessas de resultados físicos e não propomos dietas restritivas."],
];

export default async function LandingPage() {
  const { offer, support } = await getPublicSettings();
  const price = formatBRL(offer.priceCents);
  const bowl = RECIPE_BY_SLUG["iogurte-com-frutas-e-granola-caseira"];

  return (
    <div className="overflow-x-clip bg-cream">
      {/* Navegação */}
      <header className="sticky top-0 z-40 border-b border-line/50 bg-cream/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-8">
          <Link href="/" aria-label="Vida Leve — início">
            <Logo />
          </Link>
          <nav className="flex items-center gap-1 sm:gap-2" aria-label="Principal">
            <a href="#como-funciona" className="hidden rounded-xl px-3 py-2 text-sm font-semibold text-ink/75 hover:text-forest md:block">Como funciona</a>
            <a href="#incluido" className="hidden rounded-xl px-3 py-2 text-sm font-semibold text-ink/75 hover:text-forest md:block">O que inclui</a>
            <a href="#duvidas" className="hidden rounded-xl px-3 py-2 text-sm font-semibold text-ink/75 hover:text-forest md:block">Dúvidas</a>
            <Button asChild variant="outline" size="sm">
              <Link href="/login">Entrar</Link>
            </Button>
          </nav>
        </div>
      </header>

      <main>
        {/* HERO */}
        <section className="relative">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-[38rem] bg-[radial-gradient(60%_60%_at_80%_10%,#cdeedd_0%,transparent_70%)]" />
          <div className="relative mx-auto grid grid-cols-1 max-w-6xl items-center gap-12 px-5 pt-10 pb-16 sm:px-8 lg:grid-cols-[1.05fr_1fr] lg:pt-16 lg:pb-24">
            <Reveal>
              <p className="inline-flex items-center gap-2 rounded-full border border-emerald/20 bg-white px-3 py-1.5 text-xs font-bold text-forest shadow-soft">
                <Leaf className="size-4 text-emerald" /> Jornada de bem-estar em 30 dias
              </p>
              <h1 className="mt-5 font-display text-[2.6rem] leading-[1.05] font-semibold text-forest sm:text-6xl">
                Uma vida mais leve começa com <em className="text-emerald">pequenos passos.</em>
              </h1>
              <p className="mt-5 max-w-xl text-lg text-ink/75">
                Descubra uma jornada de 30 dias com receitas práticas, exercícios para fazer em casa e ferramentas para cuidar melhor de você.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
                <CheckoutButton url={offer.checkoutUrl} priceCents={offer.priceCents} placement="hero" className="w-full sm:w-auto" />
                <p className="text-sm text-muted">
                  Acesso completo por <strong className="text-forest">{price}</strong>
                </p>
              </div>
              <ul className="mt-8 grid grid-cols-1 gap-3 text-sm font-semibold text-ink/80 sm:grid-cols-3">
                {[
                  { icon: Smartphone, t: "100% digital" },
                  { icon: Zap, t: "Acesso imediato após pagamento" },
                  { icon: Sprout, t: "Conteúdo para iniciantes" },
                ].map((b) => (
                  <li key={b.t} className="flex items-center gap-2">
                    <span className="grid size-8 shrink-0 place-items-center rounded-xl bg-mint text-emerald">
                      <b.icon className="size-4" />
                    </span>
                    {b.t}
                  </li>
                ))}
              </ul>
            </Reveal>

            <Reveal delay={0.15} className="relative mx-auto w-full max-w-md lg:max-w-none">
              <div className="relative aspect-[4/5] overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-gold-soft via-[#f7efe0] to-mint shadow-lift sm:aspect-[5/5]">
                {HERO_PHOTO ? (
                  <Image src={HERO_PHOTO} alt="Mulher preparando uma refeição saudável em casa" fill priority sizes="(max-width: 1024px) 90vw, 560px" className="object-cover" />
                ) : (
                  <>
                    <div className="grain absolute inset-0" />
                    <div className="absolute -bottom-10 -left-10 size-[72%] overflow-hidden rounded-full opacity-95 shadow-lift">
                      {bowl ? <RecipeArt recipe={bowl} /> : null}
                    </div>
                    <svg className="absolute top-8 left-8 w-32 text-emerald/70" viewBox="0 0 120 120" fill="none" aria-hidden>
                      <path d="M20 100C40 60 70 30 110 14" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                      <path d="M60 60c-6-20 6-36 30-40 2 24-10 40-30 40Z" fill="currentColor" opacity=".55" />
                      <path d="M38 82c-14-12-14-28 2-40 12 14 12 30-2 40Z" fill="currentColor" opacity=".35" />
                    </svg>
                  </>
                )}
              </div>
              <div className="absolute -top-4 right-2 w-[52%] animate-float sm:right-6">
                <Phone src="/screens/dashboard.png" alt="Tela real do dashboard da plataforma" priority />
              </div>
              <div className="absolute bottom-10 left-3 flex items-center gap-2.5 rounded-2xl bg-white/95 px-3.5 py-2.5 shadow-lift backdrop-blur sm:left-6">
                <span className="grid size-9 place-items-center rounded-xl bg-emerald text-white">
                  <Footprints className="size-5" />
                </span>
                <span className="text-xs leading-tight">
                  <strong className="block text-sm text-forest">Caminhada de hoje</strong>10 minutos no seu ritmo
                </span>
              </div>
              <div className="absolute right-0 bottom-28 hidden items-center gap-2 rounded-2xl bg-forest px-3 py-2 text-xs font-bold text-white shadow-lift sm:flex">
                <Trophy className="size-4 text-gold" /> Primeira semana
              </div>
            </Reveal>
          </div>
        </section>

        {/* COMO FUNCIONA */}
        <section id="como-funciona" className="scroll-mt-20 bg-white py-20">
          <div className="mx-auto max-w-6xl px-5 sm:px-8">
            <Reveal className="mx-auto max-w-2xl text-center">
              <p className="text-xs font-bold tracking-[0.16em] text-emerald uppercase">Como funciona?</p>
              <h2 className="mt-2 font-display text-4xl font-semibold text-forest sm:text-5xl">Simples de começar, fácil de manter</h2>
            </Reveal>
            <ol className="mt-12 grid grid-cols-1 gap-5 md:grid-cols-3">
              {[
                { n: "01", t: "Comece sua jornada", d: "Crie sua conta, abra o dia 1 e defina o seu motivo. Leva menos de 5 minutos.", icon: Home },
                { n: "02", t: "Siga pequenas atividades diariamente", d: "Conteúdo curto, movimento adaptável, sugestão de refeição e um hábito por dia.", icon: Footprints },
                { n: "03", t: "Acompanhe seus hábitos e conquistas", d: "Marque o que fez, registre como se sente e veja sua evolução crescer.", icon: Trophy },
              ].map((s, i) => (
                <Reveal key={s.n} delay={i * 0.1}>
                  <li className="relative h-full rounded-[2rem] border border-line bg-cream p-7">
                    <span className="font-display text-5xl font-semibold text-gold italic">{s.n}</span>
                    <s.icon className="absolute top-7 right-7 size-7 text-emerald" />
                    <h3 className="mt-4 text-xl font-bold">{s.t}</h3>
                    <p className="mt-2 text-muted">{s.d}</p>
                  </li>
                </Reveal>
              ))}
            </ol>
          </div>
        </section>

        {/* O QUE ESTÁ INCLUÍDO */}
        <section id="incluido" className="scroll-mt-20 py-20">
          <div className="mx-auto max-w-6xl px-5 sm:px-8">
            <Reveal className="max-w-2xl">
              <p className="text-xs font-bold tracking-[0.16em] text-emerald uppercase">O que está incluído?</p>
              <h2 className="mt-2 font-display text-4xl font-semibold text-forest sm:text-5xl">Tudo o que você precisa, em um só lugar</h2>
            </Reveal>
            <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {INCLUDED.map((c, i) => (
                <Reveal key={c.title} delay={(i % 3) * 0.08}>
                  <article className="group h-full rounded-[2rem] border border-line/80 bg-white p-6 shadow-soft transition hover:-translate-y-1 hover:shadow-lift">
                    <div className={`relative grid h-28 place-items-center overflow-hidden rounded-3xl ${c.tone}`}>
                      <div className="grain absolute inset-0 opacity-70" />
                      <c.icon className="relative size-12 transition duration-500 group-hover:scale-110" strokeWidth={1.6} />
                    </div>
                    <h3 className="mt-5 text-lg font-bold">{c.title}</h3>
                    <p className="mt-1.5 text-muted">{c.text}</p>
                  </article>
                </Reveal>
              ))}
            </div>
            <Reveal className="mt-6">
              <p className="text-center text-sm font-semibold text-forest">
                <Sparkles className="mr-1.5 inline size-4 align-[-3px] text-gold-deep" />E mais: 7 materiais em PDF, lista de compras automática e sistema de conquistas.
              </p>
            </Reveal>
          </div>
        </section>

        {/* POR DENTRO */}
        <section className="overflow-hidden bg-gradient-to-b from-mint to-cream py-20">
          <Reveal className="mx-auto max-w-2xl px-5 text-center">
            <p className="text-xs font-bold tracking-[0.16em] text-emerald uppercase">Conheça a plataforma por dentro</p>
            <h2 className="mt-2 font-display text-4xl font-semibold text-forest sm:text-5xl">Um aplicativo pensado para o seu dia a dia</h2>
            <p className="mt-3 text-muted">Capturas reais das telas da plataforma, com dados de exemplo.</p>
          </Reveal>
          <div className="mt-12">
            <ScreensCarousel />
          </div>
        </section>

        {/* PARA QUEM É */}
        <section className="py-20">
          <div className="mx-auto grid grid-cols-1 max-w-6xl items-center gap-12 px-5 sm:px-8 lg:grid-cols-2">
            <Reveal>
              <p className="text-xs font-bold tracking-[0.16em] text-emerald uppercase">Para quem é?</p>
              <h2 className="mt-2 font-display text-4xl font-semibold text-forest sm:text-5xl">Feito para quem quer começar — de verdade</h2>
              <p className="mt-4 text-muted">Sem fórmulas mágicas, sem cobranças. Um programa acolhedor para quem quer cuidar de si com mais organização e leveza.</p>
            </Reveal>
            <ul className="grid gap-3">
              {[
                "Pessoas que desejam organizar a alimentação.",
                "Quem prefere se exercitar em casa.",
                "Quem quer desenvolver hábitos consistentes.",
                "Quem procura um programa simples para iniciantes.",
              ].map((t, i) => (
                <Reveal key={t} delay={i * 0.06}>
                  <li className="flex items-center gap-4 rounded-3xl border border-line bg-white p-5 shadow-soft">
                    <BadgeCheck className="size-7 shrink-0 text-emerald" />
                    <span className="text-lg font-semibold">{t}</span>
                  </li>
                </Reveal>
              ))}
            </ul>
          </div>
        </section>

        {/* OFERTA */}
        <section id="oferta" className="scroll-mt-20 px-5 py-20 sm:px-8">
          <ViewContentTrigger priceCents={offer.priceCents} />
          <Reveal className="relative mx-auto max-w-4xl overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-forest via-forest to-emerald p-8 text-white shadow-lift sm:p-12">
            <div className="pointer-events-none absolute -top-20 -right-20 size-72 rounded-full bg-emerald/50 blur-3xl" />
            <div className="relative grid grid-cols-1 gap-10 md:grid-cols-[1.2fr_1fr] md:items-center">
              <div>
                <p className="text-xs font-bold tracking-[0.16em] text-gold uppercase">Oferta</p>
                <h2 className="mt-2 font-display text-4xl font-semibold sm:text-5xl">{offer.productName}</h2>
                <ul className="mt-6 space-y-3">
                  {["Todos os módulos", "Acesso à plataforma", "Materiais digitais em PDF", "Atualizações de conteúdo quando disponibilizadas", "Acesso imediato após confirmação do pagamento"].map((t) => (
                    <li key={t} className="flex items-center gap-3">
                      <span className="grid size-6 shrink-0 place-items-center rounded-full bg-gold text-forest-deep">
                        <CircleCheckBig className="size-4" />
                      </span>
                      {t}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-[2rem] bg-white p-7 text-center text-ink">
                <p className="text-sm font-semibold text-muted">Pagamento único</p>
                <p className="mt-1 font-display text-6xl font-semibold text-forest">{price}</p>
                <p className="mt-1 flex items-center justify-center gap-1 text-xs text-muted">
                  <Clock className="size-3.5" /> Acesso liberado após a confirmação
                </p>
                <CheckoutButton url={offer.checkoutUrl} priceCents={offer.priceCents} label="QUERO GARANTIR MEU ACESSO" className="mt-6 w-full" placement="offer" />
                {offer.guaranteeEnabled ? <p className="mt-4 text-xs text-ink/75">{offer.guaranteeText}</p> : null}
              </div>
            </div>
          </Reveal>
        </section>

        {/* FAQ */}
        <section id="duvidas" className="scroll-mt-20 bg-white py-20">
          <div className="mx-auto max-w-3xl px-5 sm:px-8">
            <Reveal className="text-center">
              <p className="text-xs font-bold tracking-[0.16em] text-emerald uppercase">Perguntas frequentes</p>
              <h2 className="mt-2 font-display text-4xl font-semibold text-forest sm:text-5xl">Ficou com alguma dúvida?</h2>
            </Reveal>
            <div className="mt-10 space-y-3">
              {FAQ.map(([q, a]) => (
                <details key={q} className="group rounded-3xl border border-line bg-cream p-5 open:bg-white open:shadow-soft">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-lg font-bold">
                    {q}
                    <span className="grid size-8 shrink-0 place-items-center rounded-full bg-mint text-forest transition group-open:rotate-45" aria-hidden>
                      +
                    </span>
                  </summary>
                  <p className="mt-3 text-ink/80">{a}</p>
                </details>
              ))}
            </div>
            <div className="mt-12 text-center">
              <CheckoutButton url={offer.checkoutUrl} priceCents={offer.priceCents} placement="faq" />
            </div>
          </div>
        </section>
      </main>

      <SiteFooter support={support} />
      <StickyCta url={offer.checkoutUrl} priceCents={offer.priceCents} />
    </div>
  );
}
