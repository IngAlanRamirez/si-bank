"use client";

import { cn } from "@/lib/utils";

export function DotsLoader({
  className,
  size = "md",
}: {
  className?: string;
  size?: "sm" | "md" | "lg";
}) {
  const dotSize = size === "sm" ? "w-2 h-2" : size === "lg" ? "w-3 h-3" : "w-2.5 h-2.5";
  const gap = size === "sm" ? "gap-1" : size === "lg" ? "gap-2" : "gap-1.5";

  return (
    <div
      className={cn("flex items-center justify-center", gap, className)}
      role="status"
      aria-label="Cargando"
    >
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className={cn(
            "rounded-full bg-si-primary shadow-[0_0_8px_rgba(57,255,20,0.6)]",
            dotSize,
            "animate-[si-dots-bounce_1.2s_ease-in-out_infinite]"
          )}
          style={{ animationDelay: `${i * 0.15}s` }}
        />
      ))}
    </div>
  );
}
