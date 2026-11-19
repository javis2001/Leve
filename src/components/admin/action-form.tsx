"use client";
import { useActionState } from "react";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ActionState } from "@/app/admin/actions";
import { cn } from "@/lib/utils";

export function ActionForm({
  action,
  children,
  submitLabel = "Salvar",
  className,
  inline = false,
  variant = "primary",
  showMessage = true,
}: {
  action: (prev: ActionState, fd: FormData) => Promise<ActionState>;
  children?: React.ReactNode;
  submitLabel?: string;
  className?: string;
  inline?: boolean;
  variant?: "primary" | "outline" | "ghost" | "danger" | "secondary";
  showMessage?: boolean;
}) {
  const [state, formAction, pending] = useActionState(action, {});
  return (
    <form action={formAction} className={cn(inline ? "inline-flex items-center gap-2" : "space-y-4", className)}>
      {children}
      <Button type="submit" disabled={pending} variant={variant} size={inline ? "sm" : "md"}>
        {pending ? <Loader2 className="animate-spin" /> : null} {submitLabel}
      </Button>
      {showMessage && state.error ? (
        <p role="alert" className="flex items-start gap-2 rounded-xl bg-red-50 p-3 text-sm text-danger">
          <XCircle className="mt-0.5 size-4 shrink-0" /> {state.error}
        </p>
      ) : null}
      {showMessage && state.ok ? (
        <p role="status" className="flex items-start gap-2 rounded-xl bg-mint p-3 text-sm break-all text-forest">
          <CheckCircle2 className="mt-0.5 size-4 shrink-0" /> {state.message ?? "Salvo."}
        </p>
      ) : null}
    </form>
  );
}
