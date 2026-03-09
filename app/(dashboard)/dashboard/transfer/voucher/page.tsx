"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/providers/AuthProvider";
import {
  findMovementById,
  formatBalance,
  formatMovementDateLong,
} from "@/lib/store";
import { getCategoryById } from "@/lib/categories";
import { CategoryIcon } from "@/components/features/movements/CategoryIcon";
import { ArrowLeft, Share2, Download } from "lucide-react";
import { useCallback } from "react";
import { exportVoucherPdf } from "./export-voucher";

export default function VoucherPage() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const { account, movements } = useAuth();
  const movement = id ? findMovementById(id) : null;

  const belongsToUser =
    account && movement && movement.accountId === account.id;

  const handleShare = useCallback(() => {
    if (!movement) return;
    const category = getCategoryById(movement.categoryId);
    const text = [
      "Comprobante Si! Bank",
      movement.label,
      `Monto: ${formatBalance(movement.amount)} ${movement.type === "in" ? "(ingreso)" : "(cargo)"}`,
      `Fecha: ${formatMovementDateLong(movement.date)}`,
      movement.description ? `Detalle: ${movement.description}` : "",
    ]
      .filter(Boolean)
      .join("\n");

    if (typeof navigator !== "undefined" && navigator.share) {
      navigator.share({
        title: "Comprobante Si! Bank",
        text,
      }).catch(() => {
        navigator.clipboard?.writeText(text);
      });
    } else {
      navigator.clipboard?.writeText(text);
    }
  }, [movement]);

  const handleDownloadPdf = useCallback(() => {
    if (movement) exportVoucherPdf(movement);
  }, [movement]);

  if (!movement || !belongsToUser) {
    return (
      <main className="mx-auto max-w-lg px-4 pt-6 pb-8">
        <Link
          href="/dashboard/transfer"
          className="mb-6 inline-flex items-center gap-2 text-sm text-foreground-secondary hover:text-si-primary"
        >
          <ArrowLeft className="size-4" /> Volver
        </Link>
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-foreground-secondary">Comprobante no encontrado.</p>
          </CardContent>
        </Card>
      </main>
    );
  }

  const category = getCategoryById(movement.categoryId);

  return (
    <main className="mx-auto max-w-lg px-4 pt-6 pb-8">
      <Link
        href="/dashboard/transfer"
        className="mb-6 inline-flex items-center gap-2 text-sm text-foreground-secondary hover:text-si-primary"
      >
        <ArrowLeft className="size-4" /> Volver a transferir
      </Link>

      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-bold">Comprobante</h1>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleShare}>
            <Share2 className="mr-1.5 size-4" aria-hidden />
            Compartir
          </Button>
          <Button variant="outline" size="sm" onClick={handleDownloadPdf}>
            <Download className="mr-1.5 size-4" aria-hidden />
            PDF
          </Button>
        </div>
      </div>

      <Card className="border-si-primary/30">
        <CardContent className="p-6">
          <div className="mb-6 flex justify-center">
            <div className="flex size-14 items-center justify-center rounded-2xl bg-si-primary/20">
              <CategoryIcon category={category} size={28} />
            </div>
          </div>
          <p className="text-center text-2xl font-bold text-si-primary">
            {movement.type === "in" ? "+" : "-"}
            {formatBalance(movement.amount)}
          </p>
          <p className="mt-1 text-center text-foreground-secondary">{movement.label}</p>
          {category && (
            <p className="mt-1 text-center text-sm text-muted">{category.name}</p>
          )}

          <dl className="mt-6 space-y-3 border-t border-border pt-6">
            <div className="flex justify-between text-sm">
              <dt className="text-muted">Fecha y hora</dt>
              <dd className="font-medium">{formatMovementDateLong(movement.date)}</dd>
            </div>
            <div className="flex justify-between text-sm">
              <dt className="text-muted">Folio</dt>
              <dd className="font-mono text-foreground-secondary">{movement.id.slice(0, 8).toUpperCase()}</dd>
            </div>
            {movement.description && (
              <div className="text-sm">
                <dt className="text-muted mb-1">Detalle</dt>
                <dd className="text-foreground-secondary">{movement.description}</dd>
              </div>
            )}
          </dl>
        </CardContent>
      </Card>

      <p className="mt-4 text-center text-xs text-muted">
        Guarda este comprobante. Puedes compartirlo con el destinatario.
      </p>
    </main>
  );
}
