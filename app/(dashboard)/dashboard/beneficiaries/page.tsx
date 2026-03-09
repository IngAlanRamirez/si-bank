"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useAuth } from "@/providers/AuthProvider";
import {
  getBeneficiariesByAccountId,
  addBeneficiary,
  deleteBeneficiary,
} from "@/lib/store";
import { ArrowLeft, UserPlus, Trash2 } from "lucide-react";

export default function BeneficiariesPage() {
  const { account } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [success, setSuccess] = useState("");
  const beneficiaries = account ? getBeneficiariesByAccountId(account.id) : [];

  if (!account) return null;

  return (
    <main className="mx-auto max-w-lg px-4 pt-6 pb-8">
      <Link
        href="/dashboard/transfer"
        className="mb-6 inline-flex items-center gap-2 text-sm text-foreground-secondary hover:text-si-primary"
      >
        <ArrowLeft className="size-4" /> Volver a transferir
      </Link>

      <h1 className="mb-2 text-xl font-bold">Beneficiarios</h1>
      <p className="mb-6 text-sm text-muted">
        Gestiona los destinatarios a los que puedes transferir.
      </p>

      {success && (
        <div className="mb-4 rounded-xl bg-success/10 px-4 py-3 text-sm text-success">
          {success}
        </div>
      )}

      <Button
        variant="outline"
        size="md"
        fullWidth
        className="mb-6 justify-start"
        onClick={() => setShowForm((s) => !s)}
      >
        <UserPlus className="mr-2 size-5" aria-hidden />
        {showForm ? "Cancelar" : "Agregar beneficiario"}
      </Button>

      {showForm && (
        <AddBeneficiaryForm
          accountId={account.id}
          onSuccess={() => {
            setSuccess("Beneficiario agregado.");
            setShowForm(false);
          }}
          onCancel={() => setShowForm(false)}
        />
      )}

      {beneficiaries.length === 0 && !showForm ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-foreground-secondary">
              Aún no tienes beneficiarios. Agrégalos para transferir más rápido.
            </p>
          </CardContent>
        </Card>
      ) : (
        <ul className="space-y-3">
          {beneficiaries.map((b) => (
            <li key={b.id}>
              <Card>
                <CardContent className="flex items-center justify-between py-4">
                  <div>
                    <p className="font-medium text-foreground">{b.name}</p>
                    <p className="text-sm text-muted">
                      •••• {b.accountNumber.slice(-4)}
                      {b.bankName && ` · ${b.bankName}`}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      deleteBeneficiary(b.id);
                      setSuccess("Beneficiario eliminado.");
                    }}
                    className="rounded-lg p-2 text-muted transition-colors hover:bg-danger/10 hover:text-danger"
                    aria-label="Eliminar beneficiario"
                  >
                    <Trash2 className="size-5" aria-hidden />
                  </button>
                </CardContent>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}

function AddBeneficiaryForm({
  accountId,
  onSuccess,
  onCancel,
}: {
  accountId: string;
  onSuccess: () => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [bankName, setBankName] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const n = name.trim();
    const a = accountNumber.replace(/\s/g, "");
    if (n.length < 2) {
      setError("Nombre mínimo 2 caracteres");
      return;
    }
    if (a.length < 10) {
      setError("CLABE o cuenta mínimo 10 dígitos");
      return;
    }
    setError("");
    addBeneficiary({
      accountId,
      name: n,
      accountNumber: a,
      bankName: bankName.trim() || undefined,
    });
    onSuccess();
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-base">Nuevo beneficiario</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Nombre completo"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nombre del destinatario"
            required
          />
          <Input
            label="CLABE o número de cuenta"
            value={accountNumber}
            onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, "").slice(0, 18))}
            placeholder="18 dígitos"
            required
          />
          <Input
            label="Banco (opcional)"
            value={bankName}
            onChange={(e) => setBankName(e.target.value)}
            placeholder="Ej. BBVA, Santander"
          />
          {error && <p className="text-sm text-danger">{error}</p>}
          <div className="flex gap-3">
            <Button type="button" variant="ghost" fullWidth onClick={onCancel}>
              Cancelar
            </Button>
            <Button type="submit" fullWidth>
              Agregar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
