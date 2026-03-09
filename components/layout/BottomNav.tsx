"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, ArrowLeftRight, CreditCard, BarChart3, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", icon: Home, label: "Inicio" },
  { href: "/dashboard/transfer", icon: ArrowLeftRight, label: "Transferir" },
  { href: "/dashboard/cards", icon: CreditCard, label: "Tarjetas" },
  { href: "/dashboard/statistics", icon: BarChart3, label: "Estadísticas" },
  { href: "/dashboard/settings", icon: Settings, label: "Ajustes" },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-surface/95 backdrop-blur supports-[backdrop-filter]:bg-surface/80"
      aria-label="Navegación principal"
    >
      <div className="mx-auto flex max-w-lg items-center justify-around px-2 py-2">
        {navItems.map(({ href, icon: Icon, label }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-col items-center gap-1 rounded-lg px-3 py-2 text-xs font-medium transition-colors",
                isActive
                  ? "text-si-primary"
                  : "text-muted hover:text-foreground-secondary"
              )}
              aria-current={isActive ? "page" : undefined}
            >
              <Icon
                className={cn("size-6", isActive && "drop-shadow-[0_0_6px_rgba(57,255,20,0.6)]")}
                aria-hidden
              />
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
