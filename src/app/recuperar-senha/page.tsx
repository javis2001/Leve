"use client";
import Link from "next/link";
import { useState } from "react";
import { AuthLayout } from "@/components/auth/auth-layout";
import { Button } from "@/components/ui/button";
import { FieldError, Input, Label } from "@/components/ui/input";
import { isSupabaseConfigured } from "@/lib/env";
import { getSupabaseBrowser } from "@/lib/supabase/client";

export default function RecoverPage() {
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  return (
    <AuthLayout title="Recuperar senha" subtitle="Informe seu e-mail e enviaremos um link para criar uma nova senha.">
      {sent ? (
        <p className="rounded-2xl bg-mint p-4 text-forest">Se houver uma conta com este e-mail, você receberá o link em instantes. Confira também a caixa de spam.</p>
      ) : (
        <form
          className="space-y-4"
          noValidate
          onSubmit={async (e) => {
            e.preventDefault();
            const email = String(new FormData(e.currentTarget).get("email") ?? "").trim();
            if (!/^\S+@\S+\.\S+$/.test(email)) return setError("Informe um e-mail válido.");
            if (isSupabaseConfigured) await getSupabaseBrowser().auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/auth/callback?next=/nova-senha` });
            setSent(true);
          }}
        >
          <div>
            <Label htmlFor="email">E-mail</Label>
            <Input id="email" name="email" type="email" autoComplete="email" />
            <FieldError>{error}</FieldError>
          </div>
          <Button type="submit" size="lg" className="w-full">
            Enviar link
          </Button>
        </form>
      )}
      <p className="mt-6 text-center text-sm">
        <Link href="/login" className="font-semibold text-emerald">
          Voltar para o login
        </Link>
      </p>
    </AuthLayout>
  );
}
