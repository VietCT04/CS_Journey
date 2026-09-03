import { forwardRef } from "react";
import { cn } from "@/lib/utils";

export const Input = forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "flex h-10 w-full rounded-lg border border-white/[0.1] bg-[#0b0c12] px-3 text-sm text-zinc-100 outline-none transition-colors placeholder:text-zinc-600 focus:border-violet-300/50 focus:ring-2 focus:ring-violet-400/10",
        className,
      )}
      {...props}
    />
  ),
);

Input.displayName = "Input";
