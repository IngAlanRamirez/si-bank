"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/providers/AuthProvider";
import {
  getSessionsByUserId,
  getActivityByUserId,
  getCurrentSessionId,
  closeOtherSessions,
} from "@/lib/store";
import {
  ArrowLeft,
  Shield,
  Monitor,
  Smartphone,
  LogIn,
  LogOut,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

function formatRelative(dateStr: string): string {
  const d = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60_000);
  const diffHours = Math.floor(diffMs / 3_600_000);
  const diffDays = Math.floor(diffMs / 86_400_000);
  if (diffMins < 1) return "Hace un momento";
  if (diffMins < 60) return `Hace ${diffMins} min`;
  if (diffHours < 24) return `Hace ${diffHours} h`;
  if (diffDays === 1) return "Ayer";
  if (diffDays < 7) return `Hace ${diffDays} días`;
  return d.toLocaleDateString("es-MX", { day: "numeric", month: "short" });
}

const ACTIVITY_ICONS: Record<string, React.ComponentType<{ className?: string; size?: number }>> = {
  login: LogIn,
  logout: LogOut,
  session_closed: Monitor,
  login_failed: AlertCircle,
  password_changed: Shield,
};

export default function SecurityPage() {
  const { user } = useAuth();
  const [refresh, setRefresh] = useState(0);
  const currentSessionId = getCurrentSessionId();
  const sessions = user ? getSessionsByUserId(user.id) : [];
  const activity = user ? getActivityByUserId(user.id, 30) : [];
  const [closing, setClosing] = useState(false);
  const otherSessions = sessions.filter((s) => s.id !== currentSessionId);

  const handleCloseOthers = useCallback(() => {
    if (!user || otherSessions.length === 0) return;
    setClosing(true);
    closeOtherSessions(user.id);
    setRefresh((r) => r + 1);
    setClosing(false);
  }, [user, otherSessions.length]);

  if (!user) return null;

  return (
    <main className="mx-auto max-w-lg px-4 pt-6 pb-8">
      <Link
        href="/dashboard/settings"
        className="mb-6 inline-flex items-center gap-2 text-sm text-foreground-secondary hover:text-si-primary"
      >
        <ArrowLeft className="size-4" /> Volver a Ajustes
      </Link>

      <h1 className="mb-2 text-xl font-bold">Seguridad</h1>
      <p className="mb-6 text-sm text-muted">
        Sesiones activas y actividad reciente de tu cuenta.
      </p>

      <Card className="mb-6">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <Shield className="size-5 text-si-primary" aria-hidden />
            Sesiones activas
          </CardTitle>
          {otherSessions.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleCloseOthers}
              disabled={closing}
              className="border-danger/50 text-danger hover:bg-danger/10"
            >
              Cerrar otras ({otherSessions.length})
            </Button>
          )}
        </CardHeader>
        <CardContent className="space-y-3">
          {sessions.length === 0 ? (
            <p className="text-sm text-muted">No hay sesiones registradas.</p>
          ) : (
            sessions.map((s) => {
              const isCurrent = s.id === currentSessionId;
              return (
                <div
                  key={s.id}
                  className={cn(
                    "flex items-center justify-between rounded-lg border px-3 py-2.5",
                    isCurrent
                      ? "border-si-primary/40 bg-si-primary/5"
                      : "border-border bg-surface-2"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        "flex size-10 items-center justify-center rounded-xl",
                        isCurrent ? "bg-si-primary/20" : "bg-surface-3"
                      )}
                    >
                      <Smartphone
                        className={cn("size-5", isCurrent ? "text-si-primary" : "text-muted")}
                        aria-hidden
                      />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{s.deviceLabel}</p>
                      <p className="text-xs text-muted">
                        {isCurrent ? "Este dispositivo" : formatRelative(s.lastActiveAt)}
                      </p>
                    </div>
                  </div>
                  {isCurrent && (
                    <span className="rounded-full bg-si-primary/20 px-2 py-0.5 text-xs font-medium text-si-primary">
                      Actual
                    </span>
                  )}
                </div>
              );
            })
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Monitor className="size-5 text-si-primary" aria-hidden />
            Actividad reciente
          </CardTitle>
        </CardHeader>
        <CardContent>
          {activity.length === 0 ? (
            <p className="text-sm text-muted">Sin actividad reciente.</p>
          ) : (
            <ul className="space-y-2">
              {activity.map((e) => {
                const Icon = ACTIVITY_ICONS[e.type] ?? AlertCircle;
                return (
                  <li
                    key={e.id}
                    className="flex items-start gap-3 rounded-lg border border-border bg-surface-2 px-3 py-2.5"
                  >
                    <Icon className="mt-0.5 size-4 shrink-0 text-muted" aria-hidden />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-foreground">{e.label}</p>
                      {e.detail && (
                        <p className="text-xs text-muted">{e.detail}</p>
                      )}
                      <p className="mt-0.5 text-xs text-muted">
                        {formatRelative(e.createdAt)}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
