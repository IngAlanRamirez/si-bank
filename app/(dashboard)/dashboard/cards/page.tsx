"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/Card";
import { useAuth } from "@/providers/AuthProvider";
import {
  getCardsByAccountId,
  toggleCardLock,
  getAccountSpentTodayCents,
  formatBalance,
  seedDefaultCardsForAccount,
  getCardFullNumber,
  getCardExpiryFormatted,
  getDynamicCVV,
} from "@/lib/store";
import type { DigitalCard } from "@/lib/types";
import { ArrowLeft, Lock, Unlock, Eye, EyeOff, Copy, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

const CVV_INTERVAL_MINUTES = 5;
const CVV_INTERVAL_MS = CVV_INTERVAL_MINUTES * 60 * 1000;

function getCvvSecondsRemaining(): number {
  const now = Date.now();
  const nextSlot = (Math.floor(now / CVV_INTERVAL_MS) + 1) * CVV_INTERVAL_MS;
  return Math.max(0, Math.ceil((nextSlot - now) / 1000));
}

function formatCvvCountdown(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

function formatCardNumber(full: string): string {
  const digits = full.replace(/\D/g, "");
  return digits.replace(/(.{4})/g, "$1 ").trim();
}

function CardVisual({ card, usedTodayCents, onLockToggle }: { card: DigitalCard; usedTodayCents: number; onLockToggle: () => void }) {
  const [showNumber, setShowNumber] = useState(false);
  const [showCvv, setShowCvv] = useState(false);
  const [copied, setCopied] = useState<"number" | "expiry" | "cvv" | null>(null);
  const [cvvValue, setCvvValue] = useState<number | null>(null);
  const [cvvSecondsRemaining, setCvvSecondsRemaining] = useState(0);

  const fullNumber = getCardFullNumber(card);
  const formattedNumber = formatCardNumber(fullNumber);
  const expiry = getCardExpiryFormatted(card);
  const cvvSeed = card.cvvSeed ?? card.id;

  useEffect(() => {
    if (!showCvv) return;
    const tick = () => {
      setCvvValue(getDynamicCVV(cvvSeed, CVV_INTERVAL_MINUTES));
      setCvvSecondsRemaining(getCvvSecondsRemaining());
    };
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, [showCvv, cvvSeed]);

  function handleCopy(value: string, kind: "number" | "expiry" | "cvv") {
    navigator.clipboard?.writeText(value).then(() => {
      setCopied(kind);
      setTimeout(() => setCopied(null), 2000);
    });
  }

  function handleToggleLock(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    toggleCardLock(card.id);
    onLockToggle();
  }

  const limitCents = card.dailyLimitCents;
  const usedPct = limitCents > 0 ? Math.min(100, (usedTodayCents / limitCents) * 100) : 0;

  return (
    <Card
      className={cn(
        "overflow-hidden border-0 transition-all",
        card.isLocked && "opacity-80"
      )}
    >
      <div
        className="relative rounded-xl p-5 text-white"
        style={{
          background:
            card.brand === "visa"
              ? "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)"
              : "linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%)",
          boxShadow: "0 0 20px rgba(57, 255, 20, 0.15)",
        }}
      >
        <div className="flex items-start justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-si-primary">
            Si! Bank
          </span>
          <button
            type="button"
            onClick={handleToggleLock}
            className="flex items-center gap-1.5 rounded-lg bg-white/10 px-2.5 py-1.5 text-xs font-medium transition-colors hover:bg-white/20"
            aria-label={card.isLocked ? "Desbloquear tarjeta" : "Bloquear tarjeta"}
          >
            {card.isLocked ? (
              <>
                <Lock className="size-3.5" aria-hidden />
                Bloqueada
              </>
            ) : (
              <>
                <Unlock className="size-3.5" aria-hidden />
                Activa
              </>
            )}
          </button>
        </div>

        <div className="mt-6 flex items-center justify-between gap-2">
          <p className="font-mono text-lg tracking-[0.2em] text-white/90">
            {showNumber ? formattedNumber : `•••• •••• •••• ${card.last4}`}
          </p>
          <div className="flex shrink-0 gap-1">
            <button
              type="button"
              onClick={() => setShowNumber((v) => !v)}
              className="rounded p-1.5 text-white/60 hover:bg-white/20 hover:text-white"
              aria-label={showNumber ? "Ocultar número" : "Ver número"}
            >
              {showNumber ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
            <button
              type="button"
              onClick={() => handleCopy(fullNumber.replace(/\s/g, ""), "number")}
              className="rounded p-1.5 text-white/60 hover:bg-white/20 hover:text-white"
              aria-label="Copiar número"
            >
              <Copy className="size-4" />
            </button>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <span className="text-xs uppercase text-white/60">
            {card.brand === "visa" ? "Visa" : "Mastercard"}
          </span>
          <div className="flex items-center gap-2">
            <span className="text-xs text-white/70">Vence</span>
            <span className="font-mono text-xs text-white/90">{expiry}</span>
            <button
              type="button"
              onClick={() => handleCopy(expiry, "expiry")}
              className="rounded p-1 text-white/50 hover:bg-white/20 hover:text-white"
              aria-label="Copiar vencimiento"
            >
              <Copy className="size-3.5" />
            </button>
            {copied === "expiry" && (
              <span className="text-[10px] text-si-primary">Copiado</span>
            )}
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between rounded-lg bg-black/20 px-3 py-2">
          <span className="text-xs text-white/70">CVV dinámico</span>
          <div className="flex items-center gap-2">
            {showCvv && cvvValue !== null ? (
              <>
                <span className="font-mono text-sm font-semibold text-si-primary">
                  {cvvValue}
                </span>
                <button
                  type="button"
                  onClick={() => handleCopy(String(cvvValue), "cvv")}
                  className="rounded p-1 text-white/50 hover:bg-white/20 hover:text-white"
                  aria-label="Copiar CVV"
                >
                  <Copy className="size-3.5" />
                </button>
                {copied === "cvv" && (
                  <span className="text-[10px] text-si-primary">Copiado</span>
                )}
              </>
            ) : (
              <button
                type="button"
                onClick={() => setShowCvv(true)}
                className="flex items-center gap-1 rounded-lg border border-white/30 bg-white/10 px-2 py-1 text-xs font-medium text-white/90 hover:bg-white/20"
              >
                <RefreshCw className="size-3" aria-hidden />
                Ver CVV
              </button>
            )}
          </div>
        </div>
        {showCvv && (
          <p className="mt-1.5 text-[10px] text-white/50">
            Cambia en {formatCvvCountdown(cvvSecondsRemaining)}
          </p>
        )}

        <div className="mt-4 rounded-lg bg-black/20 p-3">
          <p className="text-xs text-white/70">Gastado hoy</p>
          <p className="text-sm font-semibold text-white">
            {formatBalance(usedTodayCents)} de {formatBalance(limitCents)} límite
          </p>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/20">
            <div
              className={cn(
                "h-full rounded-full transition-all",
                usedPct >= 100 ? "bg-danger" : "bg-si-primary"
              )}
              style={{ width: `${Math.min(100, usedPct)}%` }}
            />
          </div>
        </div>
      </div>
    </Card>
  );
}

export default function CardsPage() {
  const { account } = useAuth();
  const [cards, setCards] = useState<DigitalCard[]>([]);
  const usedTodayCents = account ? getAccountSpentTodayCents(account.id) : 0;

  useEffect(() => {
    if (!account) return;
    let list = getCardsByAccountId(account.id);
    if (list.length === 0) {
      seedDefaultCardsForAccount(account.id);
      list = getCardsByAccountId(account.id);
    }
    setCards(list);
  }, [account?.id]);

  const refreshCards = () => {
    if (account) setCards(getCardsByAccountId(account.id));
  };

  return (
    <main className="mx-auto max-w-lg px-4 pt-6 pb-8">
      <Link
        href="/dashboard"
        className="mb-6 inline-flex items-center gap-2 text-sm text-foreground-secondary hover:text-si-primary"
      >
        <ArrowLeft className="size-4" /> Volver
      </Link>

      <h1 className="mb-2 text-xl font-bold">Tarjetas digitales</h1>
      <p className="mb-6 text-sm text-muted">
        Gestiona tus tarjetas, bloqueo y límite diario.
      </p>

      {cards.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-foreground-secondary">No tienes tarjetas asociadas.</p>
          </CardContent>
        </Card>
      ) : (
        <ul className="space-y-4">
          {cards.map((card) => (
            <li key={card.id}>
              <CardVisual
                card={card}
                usedTodayCents={usedTodayCents}
                onLockToggle={refreshCards}
              />
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
