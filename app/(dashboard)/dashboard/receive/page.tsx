"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/Card";
import { useAuth } from "@/providers/AuthProvider";
import { getDisplayClabe } from "@/lib/store";
import { ArrowLeft, Copy, Share2 } from "lucide-react";

function formatClabe(clabe: string): string {
  return clabe.replace(/(.{4})/g, "$1 ").trim();
}

export default function ReceivePage() {
  const { user, account } = useAuth();
  const [copied, setCopied] = useState(false);
  const clabe = account ? getDisplayClabe(account) : "";
  const formattedClabe = formatClabe(clabe);

  const handleCopy = useCallback(() => {
    if (!clabe) return;
    navigator.clipboard.writeText(clabe.replace(/\s/g, "")).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [clabe]);

  const handleShare = useCallback(() => {
    if (!account || !user) return;
    const text = `Para enviarme dinero a Si! Bank:\nCLABE: ${clabe.replace(/\s/g, "")}\nBanco: Si! Bank\nTitular: ${user.name}`;
    if (typeof navigator !== "undefined" && navigator.share) {
      navigator.share({
        title: "Recibir transferencia - Si! Bank",
        text,
      }).catch(() => {
        navigator.clipboard?.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    } else {
      navigator.clipboard?.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [account, user, clabe]);

  if (!account) return null;

  return (
    <main className="mx-auto max-w-lg px-4 pt-6 pb-8">
      <Link
        href="/dashboard"
        className="mb-6 inline-flex items-center gap-2 text-sm text-foreground-secondary hover:text-si-primary"
      >
        <ArrowLeft className="size-4" /> Volver
      </Link>

      <h1 className="mb-2 text-xl font-bold">Recibir transferencias</h1>
      <p className="mb-6 text-sm text-muted">
        Comparte tu CLABE para que te envíen dinero a tu cuenta Si! Bank.
      </p>

      <Card className="border-si-primary/30">
        <CardContent className="p-5">
          <p className="mb-1 text-xs font-medium text-muted">CLABE interbancaria (18 dígitos)</p>
          <p className="mb-4 font-mono text-lg tracking-wide text-foreground">
            {formattedClabe}
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleCopy}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-border bg-surface-2 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-surface-3"
            >
              <Copy className="size-4" aria-hidden />
              {copied ? "Copiado" : "Copiar CLABE"}
            </button>
            <button
              type="button"
              onClick={handleShare}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-si-primary/20 py-2.5 text-sm font-medium text-si-primary transition-colors hover:bg-si-primary/30"
            >
              <Share2 className="size-4" aria-hidden />
              Compartir
            </button>
          </div>
        </CardContent>
      </Card>

      <Card className="mt-4">
        <CardContent className="p-4">
          <p className="text-xs text-muted">
            <strong className="text-foreground-secondary">Banco:</strong> Si! Bank
          </p>
          <p className="mt-1 text-xs text-muted">
            <strong className="text-foreground-secondary">Titular:</strong> {user?.name}
          </p>
          <p className="mt-3 text-xs text-muted">
            Cualquier persona puede enviarte dinero usando esta CLABE desde su banco o app.
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
