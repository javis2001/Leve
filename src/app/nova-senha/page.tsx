"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { AuthLayout } from "@/components/auth/auth-layout";
import { Button } from "@/components/ui/button";
import { FieldError, Input, Label } from "@/components/ui/input";
import { getSupabaseBrowser } from "@/lib/supabase/client";

export default function NewPasswordPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  return (
    <AuthLayout title="Crie uma nova senha">
      <form
        className="space-y-4"
        noValidate
        onSubmit={async (e) => {
          e.preventDefault();
          const f = new FormData(e.currentTarget);
          const p1 = String(f.get("p1") ?? "");
          const p2 = String(f.get("p2") ?? "");
          if (p1.length < 8) return setError("A senha precisa ter pelo menos 8 caracteres.");
          if (p1 !== p2) return setError("As senhas não conferem.");
          const { error } = await getSupabaseBrowser().auth.updateUser({ password: p1 });
          if (error) return setError("O link expirou. Solicite um novo em “Esqueci minha senha”.");
          toast.success("Senha atualizada!");
          router.replace("/app");
        }}
      >
        <div>
          <Label htmlFor="p1">Nova senha</Label>
          <Input id="p1" name="p1" type="password" autoComplete="new-password" />
        </div>
        <div>
          <Label htmlFor="p2">Confirme a nova senha</Label>
          <Input id="p2" name="p2" type="password" autoComplete="new-password" />
          <FieldError>{error}</FieldError>
        </div>
        <Button type="submit" size="lg" className="w-full">
          Salvar nova senha
        </Button>
      </form>
    </AuthLayout>
  );
}
