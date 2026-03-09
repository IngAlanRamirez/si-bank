"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/Card";
import { useAuth } from "@/providers/AuthProvider";
import {
  findMovementById,
  formatMovementAmount,
  formatMovementDateLong,
} from "@/lib/store";
import { getCategoryById } from "@/lib/categories";
import { CategoryIcon } from "@/components/features/movements/CategoryIcon";
import { ArrowLeft } from "lucide-react";

export default function MovementDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const { account } = useAuth();
  const movement = findMovementById(id);

  if (!movement || (account && movement.accountId !== account.id)) {
    return (
      <main className="mx-auto max-w-lg px-4 pt-6 pb-8">
        <Link
          href="/dashboard/movements"
          className="mb-6 inline-flex items-center gap-2 text-sm text-foreground-secondary hover:text-si-primary"
        >
          <ArrowLeft className="size-4" /> Volver a movimientos
        </Link>
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-foreground-secondary">Movimiento no encontrado.</p>
          </CardContent>
        </Card>
      </main>
    );
  }

  const category = getCategoryById(movement.categoryId);

  return (
    <main className="mx-auto max-w-lg px-4 pt-6 pb-8">
      <Link
        href="/dashboard/movements"
        className="mb-6 inline-flex items-center gap-2 text-sm text-foreground-secondary hover:text-si-primary"
      >
        <ArrowLeft className="size-4" /> Volver a movimientos
      </Link>

      <Card className="mb-6 overflow-hidden border-border">
        <CardContent className="p-6">
          <div className="mb-6 flex justify-center">
            <div className="flex size-16 items-center justify-center rounded-2xl bg-surface-2">
              <CategoryIcon category={category} size={32} />
            </div>
          </div>
          <p className="text-center text-2xl font-bold text-foreground">
            {formatMovementAmount(movement.type, movement.amount)}
          </p>
          <p className="mt-1 text-center text-foreground-secondary">
            {movement.label}
          </p>
          {category && (
            <p className="mt-1 text-center text-sm text-muted">
              {category.name}
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <dl className="divide-y divide-border">
            <div className="flex justify-between px-4 py-3">
              <dt className="text-sm text-muted">Fecha y hora</dt>
              <dd className="text-sm font-medium text-foreground">
                {formatMovementDateLong(movement.date)}
              </dd>
            </div>
            <div className="flex justify-between px-4 py-3">
              <dt className="text-sm text-muted">Tipo</dt>
              <dd className="text-sm font-medium text-foreground">
                {movement.type === "in" ? "Ingreso" : "Gasto"}
              </dd>
            </div>
            {movement.description && (
              <div className="px-4 py-3">
                <dt className="mb-1 text-sm text-muted">Descripción</dt>
                <dd className="text-sm text-foreground">{movement.description}</dd>
              </div>
            )}
          </dl>
        </CardContent>
      </Card>
    </main>
  );
}
