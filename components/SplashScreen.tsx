"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

const SPLASH_DURATION_MS = 2200;
const FADE_OUT_MS = 400;

export function SplashScreen({ onFinish }: { onFinish?: () => void }) {
  const [visible, setVisible] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => {
      setFadeOut(true);
    }, SPLASH_DURATION_MS);

    const t2 = setTimeout(() => {
      setVisible(false);
      onFinish?.();
    }, SPLASH_DURATION_MS + FADE_OUT_MS);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [onFinish]);

  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background"
      aria-hidden={!visible}
      style={{
        animation: fadeOut ? `si-splash-fade-out ${FADE_OUT_MS}ms ease-out forwards` : undefined,
      }}
    >
      <div
        className="relative flex flex-col items-center justify-center"
        style={{
          animation: "si-splash-scale-in 0.6s ease-out both",
        }}
      >
        <div
          className="relative animate-[si-splash-glow_2.5s_ease-in-out_infinite]"
          style={{ animationDelay: "0.3s" }}
        >
          <Image
            src="/logo.png"
            alt="Si! Bank"
            width={180}
            height={80}
            priority
            className="h-auto w-[180px] object-contain"
          />
        </div>
        <p className="mt-4 text-sm font-medium uppercase tracking-[0.35em] text-si-primary/90">
          Banco 100% digital
        </p>
      </div>
    </div>
  );
}
