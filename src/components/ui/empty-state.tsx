import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function EmptyState({ icon: Icon, title, children, className }: { icon: LucideIcon; title: string; children?: React.ReactNode; className?: string }) {
  return (
    <div className={cn("flex flex-col items-center rounded-3xl border border-dashed border-emerald/30 bg-mint/30 px-6 py-10 text-center", className)}>
      <div className="mb-3 grid size-12 place-items-center rounded-2xl bg-white text-emerald shadow-soft">
        <Icon className="size-6" />
      </div>
      <p className="font-bold">{title}</p>
      {children ? <div className="mt-1 max-w-sm text-sm text-muted">{children}</div> : null}
    </div>
  );
}
