import { ShieldAlert } from "lucide-react";
import { GENERAL_SAFETY } from "@/lib/content/exercises";

export function SafetyNotice({ compact = false }: { compact?: boolean }) {
  return (
    <aside role="note" className="rounded-3xl border border-gold/40 bg-gold-soft/50 p-4 sm:p-5">
      <p className="flex items-center gap-2 font-bold text-ink">
        <ShieldAlert className="size-5 text-gold-deep" /> Sua segurança vem primeiro
      </p>
      <ul className="mt-2 space-y-1.5 text-sm text-ink/85">
        {(compact ? GENERAL_SAFETY.slice(0, 1) : GENERAL_SAFETY).map((s) => (
          <li key={s} className="flex gap-2">
            <span className="mt-2 size-1.5 shrink-0 rounded-full bg-gold-deep" />
            {s}
          </li>
        ))}
      </ul>
    </aside>
  );
}
