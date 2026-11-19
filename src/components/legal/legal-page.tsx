import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { SiteFooter } from "@/components/landing/site-footer";
import { getPublicSettings } from "@/lib/settings";

export async function LegalPage({ title, updated, children }: { title: string; updated: string; children: React.ReactNode }) {
  const { support } = await getPublicSettings();
  return (
    <div className="bg-cream">
      <header className="border-b border-line/60">
        <div className="mx-auto flex h-16 max-w-3xl items-center px-5">
          <Link href="/"><Logo /></Link>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-5 py-12">
        <h1 className="font-display text-4xl font-semibold text-forest">{title}</h1>
        <p className="mt-2 text-sm text-muted">Última atualização: {updated}</p>
        <div className="legal mt-8 space-y-4 leading-relaxed text-ink/85 [&_h2]:mt-8 [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-ink [&_li]:ml-5 [&_li]:list-disc">{children}</div>
      </main>
      <SiteFooter support={support} />
    </div>
  );
}
