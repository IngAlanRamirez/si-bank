"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useAuth } from "@/providers/AuthProvider";
import { executeServicePayment, formatBalance } from "@/lib/store";
import { getServiceBillers, getServiceById } from "@/lib/services-mock";
import { ArrowLeft, Zap, Phone, Tv, Droplet, Building2, Flame } from "lucide-react";
import { cn } from "@/lib/utils";

const ICON_MAP: Record<string, React.ComponentType<{ className?: string; size?: number }>> = {
  Zap,
  Phone,
  Tv,
  Droplet,
  Building2,
  Flame,
};

export default function PayServicesPage() {
  const router = useRouter();
  const { account } = useAuth();
  const services = getServiceBillers();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [reference, setReference] = useState("");
  const [amount, setAmount] = useState("");
  const [step, setStep] = useState<"list" | "form" | "confirm">("list");
  const [error, setError] = useState("");

  const selected = selectedId ? getServiceById(selectedId) : null;
  const amountNum = parseFloat(amount) || 0;
  const amountCents = Math.round(amountNum * 100);

  function handleSelect(id: string) {
    setSelectedId(id);
    setReference("");
    setAmount("");
    setStep("form");
    setError("");
  }

  function handleConfirmForm() {
    if (!reference.trim()) {
      setError("Ingresa la referencia o número de servicio.");
      return;
    }
    if (amountNum <= 0) {
      setError("Monto inválido.");
      return;
    }
    if (account && amountCents > account.balance) {
      setError("Saldo insuficiente.");
      return;
    }
    setStep("confirm");
    setError("");
  }

  function handlePay() {
    if (!account || !selected) return;
    if (amountCents <= 0 || amountCents > account.balance) return;
    try {
      const { movementId } = executeServicePayment({
        accountId: account.id,
        serviceName: selected.name,
        reference: reference.trim(),
        amountCents,
      });
      router.replace(`/dashboard/transfer/voucher?id=${movementId}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al procesar el pago.");
    }
  }

  if (!account) return null;

  return (
    <main className="mx-auto max-w-lg px-4 pt-6 pb-8">
      <Link
        href="/dashboard"
        className="mb-6 inline-flex items-center gap-2 text-sm text-foreground-secondary hover:text-si-primary"
      >
        <ArrowLeft className="size-4" /> Volver
      </Link>

      <h1 className="mb-2 text-xl font-bold">Pagar servicios</h1>
      <p className="mb-6 text-sm text-muted">
        Saldo disponible: {formatBalance(account.balance)}
      </p>

      {error && (
        <div className="mb-4 rounded-xl bg-danger/10 px-4 py-3 text-sm text-danger">
          {error}
        </div>
      )}

      {step === "list" && (
        <ul className="grid grid-cols-2 gap-3">
          {services.map((s) => {
            const Icon = ICON_MAP[s.icon] ?? Zap;
            return (
              <li key={s.id}>
                <button
                  type="button"
                  onClick={() => handleSelect(s.id)}
                  className="flex w-full flex-col items-center gap-2 rounded-xl border border-border bg-surface p-4 transition-colors hover:border-si-primary/50 hover:bg-surface-2"
                >
                  <div className="flex size-12 items-center justify-center rounded-xl bg-si-primary/20">
                    <Icon className="size-6 text-si-primary" aria-hidden />
                  </div>
                  <span className="text-sm font-medium text-foreground">{s.name}</span>
                  <span className="text-xs text-muted">{s.category}</span>
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {step === "form" && selected && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Pagar {selected.name}</CardTitle>
            <button
              type="button"
              onClick={() => setStep("list")}
              className="text-sm text-si-primary hover:underline"
            >
              Cambiar
            </button>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              label="Número de referencia / servicio"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              placeholder="Ej. número de contrato o medidor"
            />
            <Input
              label="Monto a pagar (MXN)"
              type="text"
              inputMode="decimal"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
            />
            <Button fullWidth onClick={handleConfirmForm}>
              Continuar
            </Button>
          </CardContent>
        </Card>
      )}

      {step === "confirm" && selected && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Confirmar pago</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted">Servicio</dt>
                <dd className="font-medium">{selected.name}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted">Referencia</dt>
                <dd className="font-mono">{reference}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted">Monto</dt>
                <dd className="text-lg font-bold text-si-primary">
                  {formatBalance(amountCents)}
                </dd>
              </div>
            </dl>
            <div className="flex gap-3">
              <Button variant="outline" fullWidth onClick={() => setStep("form")}>
                Atrás
              </Button>
              <Button fullWidth onClick={handlePay}>
                Pagar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </main>
  );
}
