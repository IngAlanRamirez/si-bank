"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/providers/AuthProvider";
import { getOnboardingComplete } from "@/lib/store";
import { BottomNav } from "@/components/layout/BottomNav";
import { AppLoader } from "@/components/ui/AppLoader";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, isHydrated } = useAuth();

  useEffect(() => {
    if (!isHydrated) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    if (!getOnboardingComplete(user.id)) {
      router.replace("/onboarding");
    }
  }, [isHydrated, user, router]);

  if (!isHydrated) {
    return <AppLoader message="Cargando…" />;
  }

  if (!user) {
    return null;
  }

  return (
    <>
      <div className="min-h-screen pb-20">{children}</div>
      <BottomNav />
    </>
  );
}
