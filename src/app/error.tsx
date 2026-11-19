"use client";
import { Button } from "@/components/ui/button";

export default function ErrorPage({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="grid min-h-[60dvh] place-items-center px-5 text-center">
      <div>
        <h1 className="text-2xl font-bold text-forest">Algo não saiu como esperado</h1>
        <p className="mt-2 text-muted">Seus dados estão seguros. Tente novamente em instantes.</p>
        <Button className="mt-5" onClick={reset}>Tentar novamente</Button>
      </div>
    </main>
  );
}
