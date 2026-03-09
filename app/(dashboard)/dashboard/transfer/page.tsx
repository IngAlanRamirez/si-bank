"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useAuth } from "@/providers/AuthProvider";
import {
  getBeneficiariesByAccountId,
  findBeneficiaryById,
  executeTransfer,
  formatBalance,
} from "@/lib/store";
import {
  transferStepAmountSchema,
  type TransferAmountForm,
} from "@/lib/validations/transfer";
import { ArrowLeft, UserPlus, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

type Step = 1 | 2 | 3;

type TransferState = {
  beneficiaryId?: string;
  destinationName: string;
  destinationAccount: string;
};

export default function TransferPage() {
  const router = useRouter();
  const { account } = useAuth();
  const beneficiaries = account ? getBeneficiariesByAccountId(account.id) : [];
  const [step, setStep] = useState<Step>(1);
  const [transferState, setTransferState] = useState<TransferState | null>(null);
  const [error, setError] = useState<string>("");

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<TransferAmountForm>({
    resolver: zodResolver(transferStepAmountSchema),
    defaultValues: { amount: "", concept: "" },
  });

  const amountValue = watch("amount");

  function handleSelectBeneficiary(beneficiaryId: string) {
    const b = findBeneficiaryById(beneficiaryId);
    if (!b) return;
    setTransferState({
      beneficiaryId,
      destinationName: b.name,
      destinationAccount: b.accountNumber,
    });
    setStep(2);
    setError("");
  }

  function handleNewTransfer(name: string, accountNumber: string) {
    setTransferState({
      destinationName: name.trim(),
      destinationAccount: accountNumber.replace(/\s/g, ""),
    });
    setStep(2);
    setError("");
  }

  function onAmountSubmit(data: TransferAmountForm) {
    if (!transferState || !account) return;
    const amountCents = Math.round(parseFloat(data.amount) * 100);
    if (amountCents > account.balance) {
      setError("Saldo insuficiente.");
      return;
    }
    setTransferState((s) => s ? { ...s, amountCents, concept: data.concept } : null);
    setStep(3);
  }

  function onConfirm() {
    if (!account || !transferState || !("amountCents" in transferState)) return;
    const { amountCents, concept } = transferState as TransferState & {
      amountCents: number;
      concept?: string;
    };
    try {
      const { movementId } = executeTransfer({
        accountId: account.id,
        destinationName: transferState.destinationName,
        destinationAccount: transferState.destinationAccount,
        amountCents,
        concept: concept ?? "",
      });
      router.replace(`/dashboard/transfer/voucher?id=${movementId}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al transferir.");
    }
  }

  if (!account) return null;

  const balanceCents = account.balance;

  return (
    <main className="mx-auto max-w-lg px-4 pt-6 pb-8">
      <Link
        href="/dashboard"
        className="mb-6 inline-flex items-center gap-2 text-sm text-foreground-secondary hover:text-si-primary"
      >
        <ArrowLeft className="size-4" /> Volver
      </Link>

      <h1 className="mb-2 text-xl font-bold">Transferir</h1>
      <p className="mb-6 text-sm text-muted">
        Saldo disponible: {formatBalance(balanceCents)}
      </p>

      <div className="mb-6">
        <Button
          variant="outline"
          size="md"
          fullWidth
          className="mb-3 justify-start"
          href="/dashboard/payments"
        >
          Pagar servicios (luz, teléfono, etc.)
        </Button>
      </div>

      {error && (
        <div className="mb-4 rounded-xl bg-danger/10 px-4 py-3 text-sm text-danger">
          {error}
        </div>
      )}

      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">¿A quién transferir?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              variant="outline"
              size="md"
              fullWidth
              className="justify-start"
              href="/dashboard/beneficiaries"
            >
              <UserPlus className="mr-2 size-5" aria-hidden />
              Gestionar beneficiarios
            </Button>
            {beneficiaries.length === 0 ? (
              <p className="text-center text-sm text-muted">
                Agrega un beneficiario o ingresa datos abajo.
              </p>
            ) : (
              <ul className="space-y-2">
                {beneficiaries.map((b) => (
                  <li key={b.id}>
                    <button
                      type="button"
                      onClick={() => handleSelectBeneficiary(b.id)}
                      className="flex w-full items-center justify-between rounded-xl border border-border bg-surface-2 px-4 py-3 text-left transition-colors hover:border-si-primary/50 hover:bg-surface-3"
                    >
                      <div>
                        <p className="font-medium text-foreground">{b.name}</p>
                        <p className="text-xs text-muted">
                          •••• {b.accountNumber.slice(-4)}
                          {b.bankName && ` · ${b.bankName}`}
                        </p>
                      </div>
                      <ChevronRight className="size-5 text-muted" aria-hidden />
                    </button>
                  </li>
                ))}
              </ul>
            )}
            <div className="border-t border-border pt-4">
              <p className="mb-3 text-xs font-medium text-muted">
                Nueva transferencia (sin guardar)
              </p>
              <NewTransferForm onSubmit={handleNewTransfer} />
            </div>
          </CardContent>
        </Card>
      )}

      {step === 2 && transferState && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Monto y concepto</CardTitle>
            <button
              type="button"
              onClick={() => setStep(1)}
              className="text-sm text-si-primary hover:underline"
            >
              Cambiar destino
            </button>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-sm text-muted">
              A: {transferState.destinationName} (•••• {transferState.destinationAccount.slice(-4)})
            </p>
            <form onSubmit={handleSubmit(onAmountSubmit)} className="space-y-4">
              <Input
                label="Monto (MXN)"
                type="text"
                inputMode="decimal"
                placeholder="0.00"
                error={errors.amount?.message}
                {...register("amount")}
              />
              <Input
                label="Concepto (opcional)"
                type="text"
                placeholder="Ej. Pago de renta"
                {...register("concept")}
              />
              <Button type="submit" size="lg" fullWidth>
                Continuar
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {step === 3 && transferState && "amountCents" in transferState && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Confirmar transferencia</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted">Destinatario</dt>
                <dd className="font-medium">{transferState.destinationName}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted">Cuenta</dt>
                <dd className="font-mono">•••• {transferState.destinationAccount.slice(-4)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted">Monto</dt>
                <dd className="text-lg font-bold text-si-primary">
                  {formatBalance((transferState as { amountCents: number }).amountCents)}
                </dd>
              </div>
              {(transferState as { concept?: string }).concept && (
                <div className="flex justify-between">
                  <dt className="text-muted">Concepto</dt>
                  <dd>{(transferState as { concept?: string }).concept}</dd>
                </div>
              )}
            </dl>
            <div className="flex gap-3">
              <Button variant="outline" fullWidth onClick={() => setStep(2)}>
                Atrás
              </Button>
              <Button fullWidth onClick={onConfirm}>
                Confirmar y enviar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </main>
  );
}

function NewTransferForm({
  onSubmit,
}: {
  onSubmit: (name: string, accountNumber: string) => void;
}) {
  const [name, setName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [localError, setLocalError] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const n = name.trim();
    const a = accountNumber.replace(/\s/g, "");
    if (n.length < 2) {
      setLocalError("Nombre mínimo 2 caracteres");
      return;
    }
    if (a.length < 10) {
      setLocalError("CLABE o cuenta mínimo 10 dígitos");
      return;
    }
    setLocalError("");
    onSubmit(n, a);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <Input
        label="Nombre del destinatario"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Nombre completo"
      />
      <Input
        label="CLABE o número de cuenta"
        value={accountNumber}
        onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, "").slice(0, 18))}
        placeholder="18 dígitos"
      />
      {localError && (
        <p className="text-sm text-danger">{localError}</p>
      )}
      <Button type="submit" variant="secondary" size="md" fullWidth>
        Continuar con este destino
      </Button>
    </form>
  );
}
