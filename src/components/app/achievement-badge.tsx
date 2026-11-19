import { Lock } from "lucide-react";
import { DynIcon } from "@/components/brand/icon";
import { cn } from "@/lib/utils";

export function AchievementBadge({ icon, title, unlocked, value, description, size = "md" }: { icon: string; title: string; unlocked: boolean; value?: [number, number]; description?: string; size?: "sm" | "md" }) {
  return (
    <div className={cn("flex items-center gap-3 rounded-2xl border p-3", unlocked ? "border-gold/50 bg-gradient-to-br from-gold-soft to-white" : "border-line bg-white")}>
      <div
        className={cn(
          "relative grid shrink-0 place-items-center rounded-2xl",
          size === "sm" ? "size-10" : "size-12",
          unlocked ? "bg-gradient-to-br from-gold to-[#e8cd8f] text-forest-deep shadow-[0_6px_16px_-6px_rgb(214_179_106)]" : "bg-mint/70 text-forest/40",
        )}
      >
        <DynIcon name={icon} className={size === "sm" ? "size-5" : "size-6"} />
        {!unlocked && <Lock className="absolute -right-1 -bottom-1 size-4 rounded-full bg-white p-0.5 text-muted" />}
      </div>
      <div className="min-w-0">
        <p className={cn("font-bold leading-tight", !unlocked && "text-ink/70", size === "sm" && "text-sm")}>{title}</p>
        {description ? <p className="mt-0.5 text-xs text-muted">{description}</p> : null}
        {value && !unlocked ? (
          <p className="mt-1 text-xs font-semibold text-emerald">
            {value[0]} de {value[1]}
          </p>
        ) : null}
      </div>
    </div>
  );
}
