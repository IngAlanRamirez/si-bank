"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/providers/AuthProvider";
import { getPreferences, setPreferences } from "@/lib/store";
import type { UserPreferences } from "@/lib/types";
import {
  ArrowLeft,
  LogOut,
  User,
  Shield,
  Moon,
  Bell,
  Globe,
} from "lucide-react";
import { cn } from "@/lib/utils";

const LABELS = {
  es: {
    back: "Volver",
    account: "Cuenta",
    settings: "Ajustes",
    security: "Seguridad",
    securityDesc: "Sesiones activas y actividad reciente.",
    theme: "Apariencia",
    themeDark: "Oscuro",
    themeSystem: "Sistema",
    notifications: "Notificaciones",
    push: "Notificaciones push",
    email: "Resumen por correo",
    language: "Idioma",
    langEs: "Español",
    langEn: "English",
    logout: "Cerrar sesión",
  },
  en: {
    back: "Back",
    account: "Account",
    settings: "Settings",
    security: "Security",
    securityDesc: "Active sessions and recent activity.",
    theme: "Appearance",
    themeDark: "Dark",
    themeSystem: "System",
    notifications: "Notifications",
    push: "Push notifications",
    email: "Email summary",
    language: "Language",
    langEs: "Español",
    langEn: "English",
    logout: "Sign out",
  },
} as const;

export default function SettingsPage() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [prefs, setPrefs] = useState<UserPreferences | null>(null);

  useEffect(() => {
    if (user) setPrefs(getPreferences(user.id));
  }, [user?.id]);

  const updatePrefs = useCallback(
    (partial: Partial<UserPreferences>) => {
      if (!user) return;
      const next = { ...getPreferences(user.id), ...partial };
      setPreferences(user.id, partial);
      setPrefs(next);
      if (partial.language !== undefined) {
        document.documentElement.lang = partial.language;
      }
    },
    [user]
  );

  useEffect(() => {
    if (prefs?.language) document.documentElement.lang = prefs.language;
  }, [prefs?.language]);

  function handleLogout() {
    logout();
    router.replace("/");
  }

  if (!user) return null;

  const t = LABELS[prefs?.language ?? "es"] ?? LABELS.es;

  return (
    <main className="mx-auto max-w-lg px-4 pt-6 pb-8">
      <Link
        href="/dashboard"
        className="mb-6 inline-flex items-center gap-2 text-sm text-foreground-secondary hover:text-si-primary"
      >
        <ArrowLeft className="size-4" /> {t.back}
      </Link>

      <Card className="mb-4">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="size-5" aria-hidden />
            {t.account}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-1">
          <p className="text-sm font-medium text-foreground">{user.name}</p>
          <p className="text-sm text-muted">{user.email}</p>
        </CardContent>
      </Card>

      <Card className="mb-4">
        <CardHeader>
          <CardTitle>{t.settings}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Link
            href="/dashboard/security"
            className="flex items-center justify-between rounded-lg border border-border bg-surface-2 px-3 py-2.5 transition-colors hover:border-si-primary/40 hover:bg-surface-3"
          >
            <div className="flex items-center gap-3">
              <Shield className="size-5 text-si-primary" aria-hidden />
              <div>
                <p className="text-sm font-medium text-foreground">{t.security}</p>
                <p className="text-xs text-muted">{t.securityDesc}</p>
              </div>
            </div>
            <span className="text-muted" aria-hidden>→</span>
          </Link>

          <div>
            <p className="mb-2 flex items-center gap-2 text-sm font-medium text-foreground">
              <Moon className="size-4" aria-hidden /> {t.theme}
            </p>
            <div className="flex gap-2">
              {(["dark", "system"] as const).map((theme) => (
                <button
                  key={theme}
                  type="button"
                  onClick={() => updatePrefs({ theme })}
                  className={cn(
                    "rounded-lg border px-3 py-2 text-sm font-medium transition-colors",
                    prefs?.theme === theme
                      ? "border-si-primary bg-si-primary/20 text-si-primary"
                      : "border-border bg-surface-2 text-muted hover:bg-surface-3"
                  )}
                >
                  {theme === "dark" ? t.themeDark : t.themeSystem}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <p className="flex items-center gap-2 text-sm font-medium text-foreground">
              <Bell className="size-4" aria-hidden /> {t.notifications}
            </p>
            <label className="flex cursor-pointer items-center justify-between rounded-lg border border-border bg-surface-2 px-3 py-2.5">
              <span className="text-sm text-foreground">{t.push}</span>
              <input
                type="checkbox"
                checked={prefs?.notificationsPush ?? true}
                onChange={(e) => updatePrefs({ notificationsPush: e.target.checked })}
                className="h-4 w-4 rounded border-border accent-si-primary"
              />
            </label>
            <label className="flex cursor-pointer items-center justify-between rounded-lg border border-border bg-surface-2 px-3 py-2.5">
              <span className="text-sm text-foreground">{t.email}</span>
              <input
                type="checkbox"
                checked={prefs?.notificationsEmail ?? true}
                onChange={(e) => updatePrefs({ notificationsEmail: e.target.checked })}
                className="h-4 w-4 rounded border-border accent-si-primary"
              />
            </label>
          </div>

          <div>
            <p className="mb-2 flex items-center gap-2 text-sm font-medium text-foreground">
              <Globe className="size-4" aria-hidden /> {t.language}
            </p>
            <div className="flex gap-2">
              {(["es", "en"] as const).map((lang) => (
                <button
                  key={lang}
                  type="button"
                  onClick={() => updatePrefs({ language: lang })}
                  className={cn(
                    "rounded-lg border px-3 py-2 text-sm font-medium transition-colors",
                    prefs?.language === lang
                      ? "border-si-primary bg-si-primary/20 text-si-primary"
                      : "border-border bg-surface-2 text-muted hover:bg-surface-3"
                  )}
                >
                  {lang === "es" ? t.langEs : t.langEn}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Button
        variant="outline"
        size="lg"
        fullWidth
        className="border-danger/50 text-danger hover:bg-danger/10"
        onClick={handleLogout}
      >
        <LogOut className="mr-2 size-5" aria-hidden />
        {t.logout}
      </Button>
    </main>
  );
}
