"use client";

import { cn } from "@/lib/utils";

export function SwooshLoader({
  className,
  size = 48,
}: {
  className?: string;
  size?: number;
}) {
  return (
    <div
      className={cn("flex items-center justify-center", className)}
      role="status"
      aria-label="Cargando"
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="text-si-primary"
        aria-hidden
      >
        <path
          d="M8 24 Q 14 14, 24 20 T 40 24"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray="60 60"
          className="animate-[si-swoosh-dash_1.4s_ease-in-out_infinite]"
          style={{
            filter: "drop-shadow(0 0 4px rgba(57, 255, 20, 0.6))",
          }}
        />
      </svg>
    </div>
  );
}
