"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AlertCircle, FlaskConical, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FieldError, Input, Label } from "@/components/ui/input";
import { getSupabaseBrowser } from "@/lib/supabase/client";

export function LoginForm({ next, demo, configError }: { next: string; demo: boolean; configError: boolean }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (demo)
    return (
      <div className="space-y-4">
        <div className="flex gap-3 rounded-2xl bg-gold-soft p-4 text-sm text-ink/85">
          <FlaskConical className="size-5 shrink-0 text-gold-deep" />
          <p>
            O Supabase ainda não foi configurado. Você pode explorar a plataforma no <strong>modo demonstração</strong>: os dados ficam salvos apenas neste navegador.
          </p>
        </div>
        <Button size="lg" className="w-full" onClick={() => router.push(next)}>
          Entrar no modo demonstração
        </Button>
      </div>
    );

  if (configError)
    return (
      <p role="alert" className="flex gap-2 rounded-2xl bg-red-50 p-4 text-sm text-danger">
        <AlertCircle className="size-5 shrink-0" /> A plataforma está em configuração. Tente novamente em alguns minutos.
      </p>
    );

  return (
    <form
      noValidate
      className="space-y-4"
      onSubmit={async (e) => {
        e.preventDefault();
        setError("");
        const f = new FormData(e.currentTarget);
        const email = String(f.get("email") ?? "").trim();
        const password = String(f.get("password") ?? "");
        if (!/^\S+@\S+\.\S+$/.test(email) || !password) return setError("Informe seu e-mail e sua senha.");
        setLoading(true);
        const { error } = await getSupabaseBrowser().auth.signInWithPassword({ email, password });
        setLoading(false);
        if (error) {
          setError(/confirm/i.test(error.message) ? "Confirme seu e-mail pelo link que enviamos antes de entrar." : "E-mail ou senha incorretos. Confira e tente novamente.");
          return;
        }
        router.replace(next);
        router.refresh();
      }}
    >
      <div>
        <Label htmlFor="email">E-mail</Label>
        <Input id="email" name="email" type="email" autoComplete="email" inputMode="email" required aria-invalid={Boolean(error)} />
      </div>
      <div>
        <div className="flex items-center justify-between">
          <Label htmlFor="password">Senha</Label>
          <Link href="/recuperar-senha" className="mb-1.5 text-sm font-semibold text-emerald">
            Esqueci minha senha
          </Link>
        </div>
        <Input id="password" name="password" type="password" autoComplete="current-password" required aria-invalid={Boolean(error)} />
        <FieldError>{error}</FieldError>
      </div>
      <Button type="submit" size="lg" className="w-full" disabled={loading}>
        {loading ? <Loader2 className="animate-spin" /> : null} Entrar
      </Button>
      <p className="text-center text-sm text-muted">
        Primeiro acesso?{" "}
        <Link href="/cadastro" className="font-semibold text-emerald">
          Crie sua conta com o e-mail da compra
        </Link>
      </p>
    </form>
  );
}
