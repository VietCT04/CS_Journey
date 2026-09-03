import { forwardRef } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400/70 disabled:pointer-events-none disabled:opacity-45",
  {
    variants: {
      variant: {
        primary:
          "bg-[#eeeafe] text-[#15101d] shadow-[0_0_0_1px_rgba(255,255,255,.35)_inset] hover:bg-white",
        secondary:
          "border border-white/[0.09] bg-white/[0.04] text-zinc-200 hover:border-violet-300/30 hover:bg-white/[0.08]",
        ghost: "text-zinc-400 hover:bg-white/[0.06] hover:text-white",
        danger:
          "border border-red-400/20 bg-red-400/[0.07] text-red-200 hover:border-red-300/35 hover:bg-red-400/[0.12]",
      },
      size: {
        sm: "h-8 px-3 text-xs",
        md: "h-10 px-4",
        icon: "size-9",
      },
    },
    defaultVariants: { variant: "secondary", size: "md" },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, type = "button", ...props }, ref) => (
    <button
      ref={ref}
      type={type}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  ),
);

Button.displayName = "Button";
