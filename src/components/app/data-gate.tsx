"use client";
import { CloudOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUserData } from "@/lib/data/provider";
import type { UserData } from "@/lib/data/types";

export function DataGate({ children, skeleton }: { children: (data: UserData) => React.ReactNode; skeleton?: React.ReactNode }) {
  const { status, data, reload } = useUserData();
  if (status === "error")
    return (
      <div role="alert" className="mx-auto mt-10 max-w-md rounded-3xl border border-line bg-white p-8 text-center shadow-soft">
        <CloudOff className="mx-auto size-10 text-gold-deep" />
        <p className="mt-3 text-lg font-bold">Não conseguimos carregar seus dados</p>
        <p className="mt-1 text-sm text-muted">Verifique sua conexão com a internet. Seu progresso está guardado com segurança.</p>
        <Button className="mt-5" onClick={() => reload()}>
          Tentar novamente
        </Button>
      </div>
    );
  if (status === "loading" || !data)
    return (
      skeleton ?? (
        <div aria-busy="true" aria-label="Carregando" className="space-y-4">
          <div className="skeleton h-10 w-2/3" />
          <div className="skeleton h-40 w-full" />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="skeleton h-32" />
            <div className="skeleton h-32" />
          </div>
        </div>
      )
    );
  return <>{children(data)}</>;
}
