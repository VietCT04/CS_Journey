import { forwardRef } from "react";
import { cn } from "@/lib/utils";

export const Textarea = forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(
      "flex min-h-24 w-full resize-y rounded-lg border border-white/[0.1] bg-[#0b0c12] px-3 py-2.5 text-sm leading-6 text-zinc-100 outline-none transition-colors placeholder:text-zinc-600 focus:border-violet-300/50 focus:ring-2 focus:ring-violet-400/10",
      className,
    )}
    {...props}
  />
));

Textarea.displayName = "Textarea";
