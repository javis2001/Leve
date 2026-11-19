"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Download, KeyRound, RotateCcw, ShieldCheck, Trash2, UserRound } from "lucide-react";
import { DataGate } from "@/components/app/data-gate";
import { PageHeader } from "@/components/app/page-header";
import { SignOutButton } from "@/components/app/sign-out-button";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input, Label } from "@/components/ui/input";
import { useUserData } from "@/lib/data/provider";
import { getSupabaseBrowser } from "@/lib/supabase/client";

export function ProfileView({ email, mode }: { email: string; mode: "demo" | "supabase" }) {
  const { updateProfile, resetJourney, deleteAccount, data } = useUserData();
  const router = useRouter();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [typed, setTyped] = useState("");
  const [busy, setBusy] = useState(false);

  const exportData = () => {
    if (mode === "supabase") {
      const a = document.createElement("a");
      a.href = "/api/conta/exportar";
      a.click();
      return;
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "meus-dados-vida-leve-30.json";
    a.click();
  };

  const sendReset = async () => {
    const { error } = await getSupabaseBrowser().auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/auth/callback?next=/nova-senha` });
    if (error) toast.error("Não foi possível enviar o e-mail agora.");
    else toast.success("Enviamos um link para redefinir sua senha.");
  };

  return (
    <DataGate>
      {(d) => (
        <>
          <PageHeader eyebrow="Conta" title="Perfil e configurações" />
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            <Card>
              <CardContent>
                <h2 className="mb-4 flex items-center gap-2 font-bold">
                  <UserRound className="size-5 text-emerald" /> Seus dados
                </h2>
                <form
                  className="space-y-4"
                  onSubmit={async (e) => {
                    e.preventDefault();
                    const f = new FormData(e.currentTarget);
                    await updateProfile({
                      name: String(f.get("name") ?? "").trim().slice(0, 80),
                      journeyStartedAt: String(f.get("start") || "") || null,
                    });
                    toast.success("Perfil atualizado");
                  }}
                >
                  <div>
                    <Label htmlFor="name">Como você gostaria de ser chamada?</Label>
                    <Input id="name" name="name" defaultValue={d.profile.name} maxLength={80} autoComplete="given-name" />
                  </div>
                  <div>
                    <Label htmlFor="email">E-mail</Label>
                    <Input id="email" value={email || d.profile.email} disabled readOnly />
                  </div>
                  <div>
                    <Label htmlFor="start">Início da jornada</Label>
                    <Input id="start" name="start" type="date" defaultValue={d.profile.journeyStartedAt ?? ""} />
                  </div>
                  <Button type="submit">Salvar alterações</Button>
                </form>
              </CardContent>
            </Card>

            <div className="space-y-5">
              {mode === "supabase" ? (
                <Card>
                  <CardContent>
                    <h2 className="mb-2 flex items-center gap-2 font-bold">
                      <KeyRound className="size-5 text-emerald" /> Segurança
                    </h2>
                    <p className="mb-4 text-sm text-muted">Enviaremos um link seguro para o seu e-mail para criar uma nova senha.</p>
                    <div className="flex flex-wrap gap-2">
                      <Button variant="outline" onClick={sendReset}>
                        Alterar senha
                      </Button>
                      <SignOutButton className="inline-flex h-11 items-center gap-2 rounded-2xl px-4 font-semibold text-muted hover:bg-mint" />
                    </div>
                  </CardContent>
                </Card>
              ) : null}

              <Card>
                <CardContent>
                  <h2 className="mb-2 flex items-center gap-2 font-bold">
                    <ShieldCheck className="size-5 text-emerald" /> Privacidade e dados (LGPD)
                  </h2>
                  <p className="mb-4 text-sm text-muted">
                    Você pode baixar uma cópia dos seus dados ou excluir sua conta a qualquer momento. Leia a{" "}
                    <Link href="/privacidade" className="font-semibold text-emerald">
                      Política de Privacidade
                    </Link>
                    .
                  </p>
                  <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                    <Button variant="outline" onClick={exportData}>
                      <Download /> Exportar meus dados
                    </Button>
                    <Button
                      variant="outline"
                      onClick={async () => {
                        if (!confirm("Recomeçar a jornada? Os dias concluídos voltarão a ficar em aberto. Hábitos, diário e receitas são mantidos.")) return;
                        await resetJourney();
                        toast.success("Jornada reiniciada. Bom recomeço!");
                      }}
                    >
                      <RotateCcw /> Recomeçar jornada
                    </Button>
                    <Button variant="ghost" className="text-danger hover:bg-red-50" onClick={() => setConfirmDelete(true)}>
                      <Trash2 /> Excluir conta
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <Dialog open={confirmDelete} onOpenChange={setConfirmDelete}>
            <DialogContent title="Excluir conta definitivamente" description="Esta ação não pode ser desfeita.">
              <p className="text-sm text-ink/85">
                Seus dados pessoais (perfil, progresso, hábitos, diário, cardápios e listas) serão apagados permanentemente. Registros de compra podem ser mantidos
                pelo prazo exigido pela legislação fiscal, sem vínculo com a sua conta.
              </p>
              <Label htmlFor="confirm" className="mt-4">
                Digite <strong>EXCLUIR</strong> para confirmar
              </Label>
              <Input id="confirm" value={typed} onChange={(e) => setTyped(e.target.value)} autoComplete="off" />
              <Button
                variant="danger"
                className="mt-4 w-full"
                disabled={typed !== "EXCLUIR" || busy}
                onClick={async () => {
                  setBusy(true);
                  try {
                    await deleteAccount();
                    toast.success("Conta excluída.");
                    router.replace("/");
                    router.refresh();
                  } catch {
                    toast.error("Não foi possível excluir agora. Tente novamente ou fale com o suporte.");
                    setBusy(false);
                  }
                }}
              >
                Excluir minha conta
              </Button>
            </DialogContent>
          </Dialog>
        </>
      )}
    </DataGate>
  );
}
