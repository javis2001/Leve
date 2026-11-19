import { cn } from "@/lib/utils";

export function PageHeader({ eyebrow, title, description, actions, className }: { eyebrow?: string; title: string; description?: React.ReactNode; actions?: React.ReactNode; className?: string }) {
  return (
    <div className={cn("mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-end sm:justify-between", className)}>
      <div>
        {eyebrow ? <p className="mb-1 text-xs font-bold tracking-[0.14em] text-emerald uppercase">{eyebrow}</p> : null}
        <h1 className="font-display text-[1.85rem] leading-tight font-semibold text-forest sm:text-4xl">{title}</h1>
        {description ? <div className="mt-2 max-w-2xl text-[0.95rem] text-muted">{description}</div> : null}
      </div>
      {actions ? <div className="flex shrink-0 flex-wrap gap-2">{actions}</div> : null}
    </div>
  );
}
