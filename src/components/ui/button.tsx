import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";
import { cn } from "@/lib/utils";

export const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-semibold transition-all duration-200 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98] [&_svg]:size-[1.15em] [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        primary: "bg-emerald text-white shadow-glow hover:bg-forest",
        secondary: "bg-mint text-forest hover:bg-mint-strong",
        outline: "border border-line bg-white text-ink hover:border-emerald/40 hover:bg-mint/50",
        ghost: "text-ink hover:bg-mint/70",
        gold: "bg-gold text-forest-deep shadow-[0_10px_30px_-10px_rgb(214_179_106/0.8)] hover:bg-[#cba65a]",
        danger: "bg-danger text-white hover:bg-[#912018]",
        link: "text-emerald underline-offset-4 hover:underline px-0",
      },
      size: {
        sm: "h-9 rounded-xl px-3.5 text-sm",
        md: "h-11 rounded-2xl px-5 text-[0.95rem]",
        lg: "h-14 rounded-2xl px-7 text-base tracking-wide",
        icon: "size-11 rounded-2xl",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({ className, variant, size, asChild, ...props }, ref) => {
  const Comp = asChild ? Slot : "button";
  return <Comp ref={ref} className={cn(buttonVariants({ variant, size }), className)} {...props} />;
});
Button.displayName = "Button";
