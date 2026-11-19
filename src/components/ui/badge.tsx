import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";
import { cn } from "@/lib/utils";

const badgeVariants = cva("inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold [&_svg]:size-3.5", {
  variants: {
    variant: {
      mint: "bg-mint text-forest",
      gold: "bg-gold-soft text-gold-deep",
      outline: "border border-line bg-white text-muted",
      dark: "bg-forest text-white",
      danger: "bg-red-50 text-danger",
    },
  },
  defaultVariants: { variant: "mint" },
});

export function Badge({ className, variant, ...props }: React.HTMLAttributes<HTMLSpanElement> & VariantProps<typeof badgeVariants>) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}
