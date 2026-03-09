"use client";

import { useState, useRef, useCallback } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/providers/AuthProvider";
import {
  getDeferrableMovements,
  getDeferredDebtsByAccountId,
  createDeferredDebt,
  payNextInstallment,
  formatBalance,
} from "@/lib/store";
import { getCategoryById } from "@/lib/categories";
import { CategoryIcon } from "@/components/features/movements/CategoryIcon";
import { ArrowLeft, Calendar, Download } from "lucide-react";
import { cn } from "@/lib/utils";
import type { DeferredDebt } from "@/lib/types";

const MSI_OPTIONS = [3, 6, 12] as const;

export default function MSIPage() {
  const { account, refreshMovements } = useAuth();
  const [deferringId, setDeferringId] = useState<string | null>(null);
  const [months, setMonths] = useState<number>(6);
  const [refresh, setRefresh] = useState(0);
  const [receiptDebt, setReceiptDebt] = useState<DeferredDebt | null>(null);
  const receiptRef = useRef<HTMLDivElement>(null);

  if (!account) return null;

  const deferrable = getDeferrableMovements(account.id);
  const debts = getDeferredDebtsByAccountId(account.id);

  function handleDefer(movementId: string) {
    setDeferringId(movementId);
  }

  const handleDownloadPdf = useCallback(async () => {
    if (!receiptRef.current || !receiptDebt) return;
    const html2canvas = (await import("html2canvas")).default;
    const { jsPDF } = await import("jspdf");
    const canvas = await html2canvas(receiptRef.current, {
      scale: 2,
      useCORS: true,
      backgroundColor: "#121212",
      logging: false,
    });
    const w = canvas.width;
    const h = canvas.height;
    const ratio = Math.min(595 / w, 842 / h);
    const doc = new jsPDF({
      unit: "px",
      format: [w * ratio, h * ratio],
      hotfixes: ["pxScaling"],
    });
    doc.addImage(canvas.toDataURL("image/png"), "PNG", 0, 0, w * ratio, h * ratio);
    doc.save(`SiBank-MSI-${receiptDebt.id.slice(0, 8)}.pdf`);
  }, [receiptDebt]);

  function handleConfirmDefer(movementId: string) {
    const debt = createDeferredDebt(account!.id, movementId, months);
    if (debt) {
      setDeferringId(null);
      setReceiptDebt(debt);
      setRefresh((r) => r + 1);
      refreshMovements?.();
    }
  }

  function handlePayInstallment(debtId: string) {
    if (payNextInstallment(debtId)) {
      setRefresh((r) => r + 1);
      refreshMovements?.();
    }
  }

  return (
    <main className="mx-auto max-w-lg px-4 pt-6 pb-8">
      {receiptDebt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="flex max-h-full w-full max-w-md flex-col gap-4">
            <div
              ref={receiptRef}
              style={{
                width: 400,
                borderRadius: 16,
                border: "1px solid rgba(57, 255, 20, 0.3)",
                background: "#121212",
                padding: 24,
                color: "#ffffff",
                fontFamily: "system-ui, sans-serif",
              }}
            >
              <p
                style={{
                  textAlign: "center",
                  fontSize: 12,
                  fontWeight: 600,
                  letterSpacing: "0.05em",
                  textTransform: "uppercase",
                  color: "#39ff14",
                  margin: 0,
                }}
              >
                Si! Bank
              </p>
              <h2
                style={{
                  textAlign: "center",
                  fontSize: 18,
                  fontWeight: 700,
                  color: "#ffffff",
                  margin: "12px 0 0 0",
                }}
              >
                Comprobante de diferimiento
              </h2>
              <p
                style={{
                  textAlign: "center",
                  fontSize: 12,
                  color: "#707070",
                  margin: "4px 0 0 0",
                }}
              >
                Meses sin intereses
              </p>
              <div
                style={{
                  marginTop: 24,
                  paddingTop: 16,
                  borderTop: "1px solid #2c2c2c",
                  display: "flex",
                  flexDirection: "column",
                  gap: 12,
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14 }}>
                  <span style={{ color: "#707070" }}>Concepto</span>
                  <span style={{ fontWeight: 500, color: "#ffffff" }}>{receiptDebt.label}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14 }}>
                  <span style={{ color: "#707070" }}>Monto total</span>
                  <span style={{ fontWeight: 600, color: "#39ff14" }}>
                    {formatBalance(receiptDebt.totalCents)}
                  </span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14 }}>
                  <span style={{ color: "#707070" }}>Plazo</span>
                  <span style={{ color: "#ffffff" }}>{receiptDebt.months} meses</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14 }}>
                  <span style={{ color: "#707070" }}>Cuota mensual</span>
                  <span style={{ color: "#ffffff" }}>
                    {formatBalance(receiptDebt.monthlyCents)}
                  </span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14 }}>
                  <span style={{ color: "#707070" }}>Fecha</span>
                  <span style={{ color: "#ffffff" }}>
                    {new Date(receiptDebt.createdAt).toLocaleDateString("es-MX", {
                      dateStyle: "long",
                    })}
                  </span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14 }}>
                  <span style={{ color: "#707070" }}>Folio</span>
                  <span style={{ fontFamily: "monospace", color: "#b0b0b0" }}>
                    {receiptDebt.id.slice(0, 8).toUpperCase()}
                  </span>
                </div>
              </div>
              <p
                style={{
                  marginTop: 16,
                  textAlign: "center",
                  fontSize: 11,
                  color: "#707070",
                }}
              >
                Documento generado electrónicamente. Sin valor fiscal.
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                size="lg"
                fullWidth
                onClick={() => setReceiptDebt(null)}
              >
                Cerrar
              </Button>
              <Button size="lg" fullWidth onClick={handleDownloadPdf}>
                <Download className="mr-2 size-5" aria-hidden />
                Descargar PDF
              </Button>
            </div>
          </div>
        </div>
      )}

      <Link
        href="/dashboard"
        className="mb-6 inline-flex items-center gap-2 text-sm text-foreground-secondary hover:text-si-primary"
      >
        <ArrowLeft className="size-4" /> Volver
      </Link>

      <div className="mb-6 flex items-center gap-3">
        <div className="flex size-12 items-center justify-center rounded-2xl bg-si-primary/20">
          <Calendar className="size-6 text-si-primary" aria-hidden />
        </div>
        <div>
          <h1 className="text-xl font-bold">Meses sin intereses</h1>
          <p className="text-sm text-muted">Diferir compras y pagar en cuotas fijas</p>
        </div>
      </div>

      {debts.length > 0 && (
        <section className="mb-8">
          <h2 className="mb-3 text-base font-semibold">Tus deudas diferidas</h2>
          <ul className="space-y-3">
            {debts.map((debt) => {
              const remaining = debt.months - debt.paidInstallments;
              const nextAmount =
                debt.paidInstallments === debt.months - 1
                  ? debt.totalCents - debt.monthlyCents * (debt.months - 1)
                  : debt.monthlyCents;
              return (
                <Card key={debt.id} className="border-si-primary/20">
                  <CardContent className="p-4">
                    <p className="font-medium text-foreground">{debt.label}</p>
                    <p className="mt-1 text-sm text-muted">
                      {formatBalance(debt.totalCents)} en {debt.months} MSI · Cuota{" "}
                      {formatBalance(debt.monthlyCents)}/mes
                    </p>
                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-sm text-foreground-secondary">
                        Pagado {debt.paidInstallments}/{debt.months} · Quedan {remaining} cuota
                        {remaining !== 1 ? "s" : ""}
                      </span>
                      <Button
                        size="sm"
                        onClick={() => handlePayInstallment(debt.id)}
                        disabled={account.balance < nextAmount}
                      >
                        Pagar siguiente ({formatBalance(nextAmount)})
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </ul>
        </section>
      )}

      <section>
        <h2 className="mb-3 text-base font-semibold">Diferir un gasto</h2>
        <p className="mb-4 text-sm text-muted">
          Elige un gasto reciente para convertirlo en cuotas sin intereses. Se devolverá el monto a tu saldo y pagarás en cuotas fijas.
        </p>
        {deferrable.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-sm text-muted">
                No hay gastos recientes para diferir, o todos ya están en MSI.
              </p>
              <Link
                href="/dashboard/movements"
                className="mt-2 inline-block text-sm font-medium text-si-primary hover:underline"
              >
                Ver movimientos
              </Link>
            </CardContent>
          </Card>
        ) : (
          <ul className="space-y-2">
            {deferrable.map((mov) => {
              const category = getCategoryById(mov.categoryId);
              const isOpen = deferringId === mov.id;
              return (
                <li key={mov.id}>
                  <Card
                    className={cn(
                      "transition-colors",
                      isOpen && "border-si-primary/40 ring-1 ring-si-primary/20"
                    )}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-surface-2">
                            <CategoryIcon category={category} size={20} />
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-foreground truncate">{mov.label}</p>
                            <p className="text-sm text-muted">
                              {formatBalance(mov.amount)}
                            </p>
                          </div>
                        </div>
                        {!isOpen ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDefer(mov.id)}
                          >
                            Diferir
                          </Button>
                        ) : (
                          <div className="flex flex-col items-end gap-2">
                            <div className="flex gap-2">
                              {MSI_OPTIONS.map((n) => (
                                <button
                                  key={n}
                                  type="button"
                                  onClick={() => setMonths(n)}
                                  className={cn(
                                    "rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors",
                                    months === n
                                      ? "border-si-primary bg-si-primary/20 text-si-primary"
                                      : "border-border bg-surface-2 text-muted hover:bg-surface-3"
                                  )}
                                >
                                  {n} MSI
                                </button>
                              ))}
                            </div>
                            <div className="flex gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setDeferringId(null)}
                              >
                                Cancelar
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => handleConfirmDefer(mov.id)}
                              >
                                Confirmar · {formatBalance(Math.floor(mov.amount / months))}/mes
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </main>
  );
}
