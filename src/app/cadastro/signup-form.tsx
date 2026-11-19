"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { MailCheck, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FieldError, Input, Label } from "@/components/ui/input";
import { getSupabaseBrowser } from "@/lib/supabase/client";

export function SignupForm({ demo }: { demo: boolean }) {
  const router = useRouter();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState("");

  if (sent)
    return (
      <div className="rounded-3xl bg-mint p-6 text-center">
        <MailCheck className="mx-auto size-10 text-emerald" />
        <p className="mt-3 text-lg font-bold">Confira seu e-mail</p>
        <p className="mt-1 text-sm text-muted">Enviamos um link de confirmação para {sent}. Depois de confirmar, é só entrar.</p>
        <Button asChild variant="outline" className="mt-5">
          <Link href="/login">Ir para o login</Link>
        </Button>
      </div>
    );

  return (
    <form
      noValidate
      className="space-y-4"
      onSubmit={async (e) => {
        e.preventDefault();
        const f = new FormData(e.currentTarget);
        const name = String(f.get("name") ?? "").trim().slice(0, 80);
        const email = String(f.get("email") ?? "").trim().toLowerCase();
        const password = String(f.get("password") ?? "");
        const terms = f.get("terms") === "on";
        const errs: Record<string, string> = {};
        if (name.length < 2) errs.name = "Informe seu nome.";
        if (!/^\S+@\S+\.\S+$/.test(email)) errs.email = "Informe um e-mail válido.";
        if (password.length < 8) errs.password = "A senha precisa ter pelo menos 8 caracteres.";
        if (!terms) errs.terms = "É preciso aceitar os Termos de Uso e a Política de Privacidade.";
        setErrors(errs);
        if (Object.keys(errs).length) return;
        if (demo) return router.push("/app");
        setLoading(true);
        const { data, error } = await getSupabaseBrowser().auth.signUp({
          email,
          password,
          options: { data: { full_name: name }, emailRedirectTo: `${window.location.origin}/auth/callback?next=/app` },
        });
        setLoading(false);
        if (error) {
          setErrors({ form: /registered|exists/i.test(error.message) ? "Este e-mail já tem cadastro. Faça login." : "Não foi possível criar a conta agora. Tente novamente." });
          return;
        }
        if (data.session) {
          router.replace("/app");
          router.refresh();
        } else setSent(email);
      }}
    >
      <div>
        <Label htmlFor="name">Nome</Label>
        <Input id="name" name="name" autoComplete="given-name" aria-invalid={Boolean(errors.name)} />
        <FieldError>{errors.name}</FieldError>
      </div>
      <div>
        <Label htmlFor="email">E-mail da compra</Label>
        <Input id="email" name="email" type="email" autoComplete="email" inputMode="email" aria-invalid={Boolean(errors.email)} />
        <FieldError>{errors.email}</FieldError>
      </div>
      <div>
        <Label htmlFor="password">Senha</Label>
        <Input id="password" name="password" type="password" autoComplete="new-password" aria-invalid={Boolean(errors.password)} aria-describedby="pw-hint" />
        <p id="pw-hint" className="mt-1 text-xs text-muted">
          Mínimo de 8 caracteres.
        </p>
        <FieldError>{errors.password}</FieldError>
      </div>
      <label className="flex items-start gap-3 text-sm">
        <input type="checkbox" name="terms" className="mt-0.5 size-5 accent-emerald" />
        <span>
          Li e aceito os{" "}
          <Link href="/termos" target="_blank" className="font-semibold text-emerald">
            Termos de Uso
          </Link>{" "}
          e a{" "}
          <Link href="/privacidade" target="_blank" className="font-semibold text-emerald">
            Política de Privacidade
          </Link>
          .
        </span>
      </label>
      <FieldError>{errors.terms}</FieldError>
      <FieldError>{errors.form}</FieldError>
      <Button type="submit" size="lg" className="w-full" disabled={loading}>
        {loading ? <Loader2 className="animate-spin" /> : null} Criar minha conta
      </Button>
      <p className="text-center text-sm text-muted">
        Já tem conta?{" "}
        <Link href="/login" className="font-semibold text-emerald">
          Entrar
        </Link>
      </p>
    </form>
  );
}
