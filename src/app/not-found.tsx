import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="grid min-h-dvh place-items-center bg-cream px-5 text-center">
      <div>
        <Logo className="justify-center" />
        <p className="mt-10 font-display text-7xl font-semibold text-gold italic">404</p>
        <h1 className="mt-2 text-2xl font-bold text-forest">Página não encontrada</h1>
        <p className="mt-2 text-muted">O endereço pode ter mudado. Que tal voltar ao início?</p>
        <div className="mt-6 flex justify-center gap-2">
          <Button asChild><Link href="/app">Minha área</Link></Button>
          <Button asChild variant="outline"><Link href="/">Página inicial</Link></Button>
        </div>
      </div>
    </main>
  );
}
