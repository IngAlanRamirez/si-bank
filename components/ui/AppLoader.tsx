"use client";

import Image from "next/image";
import { DotsLoader } from "@/components/ui/DotsLoader";

export function AppLoader({
  message = "Cargando…",
  showLogo = true,
}: {
  message?: string;
  showLogo?: boolean;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background px-4">
      {showLogo && (
        <div className="relative opacity-90">
          <Image
            src="/logo.png"
            alt=""
            width={120}
            height={53}
            className="h-auto w-[120px] object-contain"
            aria-hidden
          />
        </div>
      )}
      <DotsLoader size="lg" />
      {message && (
        <p className="text-sm text-muted animate-[si-fade-in_0.4s_ease-out]">
          {message}
        </p>
      )}
    </div>
  );
}
