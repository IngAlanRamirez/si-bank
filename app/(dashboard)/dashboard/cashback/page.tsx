"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/providers/AuthProvider";
import {
  getCashbackEarnedForAccount,
  getCashbackCredited,
  getCashbackBreakdown,
  creditCashback,
  formatBalance,
} from "@/lib/store";
import { CASHBACK_RATES } from "@/lib/cashback";
import { getCategoryById } from "@/lib/categories";
import { CategoryIcon } from "@/components/features/movements/CategoryIcon";
import { ArrowLeft, Percent, Sparkles } from "lucide-react";

export default function CashbackPage() {
  const { account, refreshMovements } = useAuth();
  const [credited, setCredited] = useState(false);
  if (!account) return null;

  const earned = getCashbackEarnedForAccount(account.id);
  const alreadyCredited = getCashbackCredited(account.id);
  const available = earned - alreadyCredited;
  const breakdown = getCashbackBreakdown(account.id);

  function handleCredit() {
    if (!account) return;
    const amount = creditCashback(account.id);
    if (amount > 0) {
      setCredited(true);
      refreshMovements?.();
    }
  }

  const categoriesWithRate = Object.entries(CASHBACK_RATES)
    .filter(([, rate]) => rate > 0)
    .map(([id]) => ({ id, name: getCategoryById(id)?.name ?? id, rate: CASHBACK_RATES[id] }));

  return (
    <main className="mx-auto max-w-lg px-4 pt-6 pb-8">
      <Link
        href="/dashboard"
        className="mb-6 inline-flex items-center gap-2 text-sm text-foreground-secondary hover:text-si-primary"
      >
        <ArrowLeft className="size-4" /> Volver
      </Link>

      <div className="mb-6 flex items-center gap-3">
        <div className="flex size-12 items-center justify-center rounded-2xl bg-si-primary/20">
          <Percent className="size-6 text-si-primary" aria-hidden />
        </div>
        <div>
          <h1 className="text-xl font-bold">Campaña Cashback</h1>
          <p className="text-sm text-muted">Recibe un poco de vuelta por tus compras</p>
        </div>
      </div>

      <Card className="mb-6 border-si-primary/30 bg-gradient-to-br from-si-primary/5 to-transparent">
        <CardContent className="p-5">
          <div className="flex items-center gap-2 text-sm text-muted">
            <Sparkles className="size-4 text-si-primary" aria-hidden />
            Gana hasta 5% de vuelta según el tipo de gasto
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-sm text-foreground-secondary">Cashback disponible</span>
            <span className="text-2xl font-bold text-si-primary">
              {formatBalance(available)}
            </span>
          </div>
          {alreadyCredited > 0 && (
            <p className="mt-1 text-xs text-muted">
              Ya acreditado: {formatBalance(alreadyCredited)}
            </p>
          )}
          <Button
            size="lg"
            fullWidth
            className="mt-4"
            onClick={handleCredit}
            disabled={available <= 0 || credited}
          >
            {credited ? "Acreditado" : "Acreditar a mi cuenta"}
          </Button>
        </CardContent>
      </Card>

      <section className="mb-6">
        <h2 className="mb-3 text-base font-semibold">Porcentajes por categoría</h2>
        <Card>
          <CardContent className="p-0">
            <ul className="divide-y divide-border">
              {categoriesWithRate.map(({ id, name, rate }) => {
                const category = getCategoryById(id);
                return (
                  <li
                    key={id}
                    className="flex items-center justify-between px-4 py-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex size-9 items-center justify-center rounded-lg bg-surface-2">
                        <CategoryIcon category={category} size={18} />
                      </div>
                      <span className="text-sm font-medium text-foreground">{name}</span>
                    </div>
                    <span className="rounded-full bg-si-primary/20 px-2.5 py-0.5 text-sm font-semibold text-si-primary">
                      {rate}%
                    </span>
                  </li>
                );
              })}
            </ul>
          </CardContent>
        </Card>
      </section>

      {breakdown.length > 0 && (
        <section>
          <h2 className="mb-3 text-base font-semibold">Tu cashback por tipo de gasto</h2>
          <Card>
            <CardContent className="p-0">
              <ul className="divide-y divide-border">
                {breakdown.map((row) => (
                  <li
                    key={row.categoryId}
                    className="flex items-center justify-between px-4 py-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex size-9 items-center justify-center rounded-lg bg-surface-2">
                        <CategoryIcon
                          category={getCategoryById(row.categoryId)}
                          size={18}
                        />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{row.name}</p>
                        <p className="text-xs text-muted">
                          {formatBalance(row.spentCents)} gastado · {row.rate}%
                        </p>
                      </div>
                    </div>
                    <span className="text-sm font-semibold text-si-primary">
                      +{formatBalance(row.cashbackCents)}
                    </span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </section>
      )}

      {breakdown.length === 0 && earned === 0 && (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-sm text-muted">
              Todavía no tienes cashback. Usa tu tarjeta en compras de streaming, comida, compras y más para ir ganando.
            </p>
          </CardContent>
        </Card>
      )}
    </main>
  );
}
