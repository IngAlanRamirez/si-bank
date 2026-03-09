"use client";

import { useState } from "react";
import { SplashScreen } from "@/components/SplashScreen";

export function SplashWrapper({ children }: { children: React.ReactNode }) {
  const [splashDone, setSplashDone] = useState(false);

  return (
    <>
      {!splashDone && (
        <SplashScreen onFinish={() => setSplashDone(true)} />
      )}
      {children}
    </>
  );
}
