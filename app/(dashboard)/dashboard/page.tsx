"use client";

import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import {
  ArrowUpRight,
  ArrowDownLeft,
  CreditCard,
  BarChart3,
  ChevronRight,
  Percent,
  Calendar,
} from "lucide-react";
import { useAuth } from "@/providers/AuthProvider";
import {
  formatBalance,
  formatMovementAmount,
  formatMovementDate,
} from "@/lib/store";
import { getCategoryById } from "@/lib/categories";
import { CategoryIcon } from "@/components/features/movements/CategoryIcon";

export default function DashboardHomePage() {
  const { user, account, movements } = useAuth();
  const displayName = user?.name?.split(" ")[0] ?? "Usuario";
  const recentMovements = movements.slice(0, 5);

  return (
    <main className="mx-auto max-w-lg px-4 pt-6 pb-8">
      <header className="mb-6">
        <p className="text-sm text-foreground-secondary">Bienvenido de nuevo</p>
        <h1 className="text-xl font-bold text-foreground">
          {displayName}, tu cuenta Si! Bank
        </h1>
      </header>

      <Card className="mb-6 overflow-hidden border-si-primary/40 bg-surface-2 glow-primary">
        <CardHeader className="pb-1">
          <CardDescription>Saldo disponible</CardDescription>
          <CardTitle className="text-3xl font-black text-si-primary">
            {account ? formatBalance(account.balance) : "—"}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <p className="text-xs text-muted">
            Cuenta digital {account?.accountNumber ?? "—"}
          </p>
        </CardContent>
      </Card>

      <div className="mb-8 flex gap-3">
        <Button variant="secondary" size="md" className="flex-1" href="/dashboard/transfer">
          <ArrowUpRight className="mr-2 size-5" aria-hidden />
          Transferir
        </Button>
        <Button variant="outline" size="md" className="flex-1" href="/dashboard/receive">
          <ArrowDownLeft className="mr-2 size-5" aria-hidden />
          Recibir
        </Button>
      </div>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-base font-semibold">Movimientos recientes</h2>
          <Link
            href="/dashboard/movements"
            className="text-sm font-medium text-si-primary hover:underline"
          >
            Ver todo
            <ChevronRight className="inline size-4" />
          </Link>
        </div>
        <Card>
          <CardContent className="p-0">
            {recentMovements.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-muted">
                Aún no hay movimientos.
              </div>
            ) : (
              recentMovements.map((mov) => {
                const category = getCategoryById(mov.categoryId);
                return (
                  <Link
                    key={mov.id}
                    href={`/dashboard/movements/${mov.id}`}
                    className="flex items-center gap-3 border-b border-border px-4 py-3 last:border-0 transition-colors hover:bg-surface-2 active:bg-surface-3"
                  >
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-surface-2">
                      <CategoryIcon category={category} size={18} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-foreground">{mov.label}</p>
                      <p className="text-xs text-muted">{formatMovementDate(mov.date)}</p>
                    </div>
                    <span
                      className={
                        mov.type === "in"
                          ? "text-sm font-semibold text-success"
                          : "text-sm font-semibold text-foreground"
                      }
                    >
                      {formatMovementAmount(mov.type, mov.amount)}
                    </span>
                  </Link>
                );
              })
            )}
          </CardContent>
        </Card>
      </section>

      <section className="mt-8">
        <h2 className="mb-3 text-base font-semibold">Accesos rápidos</h2>
        <div className="grid grid-cols-2 gap-3">
          <Link href="/dashboard/cashback">
            <Card className="transition-colors hover:border-si-primary/50 hover:bg-surface-2">
              <CardContent className="flex items-center gap-3 p-4">
                <div className="rounded-lg bg-si-primary/20 p-2">
                  <Percent className="size-5 text-si-primary" aria-hidden />
                </div>
                <span className="text-sm font-medium">Cashback</span>
              </CardContent>
            </Card>
          </Link>
          <Link href="/dashboard/msi">
            <Card className="transition-colors hover:border-si-secondary/50 hover:bg-surface-2">
              <CardContent className="flex items-center gap-3 p-4">
                <div className="rounded-lg bg-si-secondary/20 p-2">
                  <Calendar className="size-5 text-si-secondary" aria-hidden />
                </div>
                <span className="text-sm font-medium">MSI</span>
              </CardContent>
            </Card>
          </Link>
          <Link href="/dashboard/cards">
            <Card className="transition-colors hover:border-si-primary/50 hover:bg-surface-2">
              <CardContent className="flex items-center gap-3 p-4">
                <div className="rounded-lg bg-si-primary/20 p-2">
                  <CreditCard className="size-5 text-si-primary" aria-hidden />
                </div>
                <span className="text-sm font-medium">Tarjetas digitales</span>
              </CardContent>
            </Card>
          </Link>
          <Link href="/dashboard/statistics">
            <Card className="transition-colors hover:border-si-secondary/50 hover:bg-surface-2">
              <CardContent className="flex items-center gap-3 p-4">
                <div className="rounded-lg bg-si-secondary/20 p-2">
                  <BarChart3 className="size-5 text-si-secondary" aria-hidden />
                </div>
                <span className="text-sm font-medium">Estadísticas</span>
              </CardContent>
            </Card>
          </Link>
        </div>
      </section>
    </main>
  );
}
