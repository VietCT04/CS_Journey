import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Badge({ className, ...props }: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border border-white/[0.1] bg-white/[0.035] px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.13em] text-zinc-400",
        className,
      )}
      {...props}
    />
  );
}
