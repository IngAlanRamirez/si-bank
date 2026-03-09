"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/providers/AuthProvider";
import { getOnboardingComplete, setOnboardingComplete } from "@/lib/store";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent } from "@/components/ui/Card";
import { Camera, Phone, MessageCircle, Shield } from "lucide-react";
import { cn } from "@/lib/utils";

type Step = 1 | 2 | 3;

function generateSmsCode(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export default function OnboardingPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [step, setStep] = useState<Step>(1);
  const [inePreview, setInePreview] = useState<string | null>(null);
  const [ineValidating, setIneValidating] = useState(false);
  const [phone, setPhone] = useState("");
  const [smsCode, setSmsCode] = useState("");
  const [sentCode, setSentCode] = useState<string | null>(null);
  const [codeSending, setCodeSending] = useState(false);
  const [codeValue, setCodeValue] = useState("");
  const [codeError, setCodeError] = useState("");
  const [verifying, setVerifying] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!user) {
      router.replace("/login");
      return;
    }
    if (getOnboardingComplete(user.id)) {
      router.replace("/dashboard");
    }
  }, [user, router]);

  const handleIneChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith("image/")) return;
    const url = URL.createObjectURL(file);
    setInePreview(url);
  }, []);

  const handleValidateIne = useCallback(() => {
    if (!inePreview) return;
    setIneValidating(true);
    setTimeout(() => {
      setIneValidating(false);
      setStep(2);
    }, 2000);
  }, [inePreview]);

  const handleSendCode = useCallback(() => {
    const digits = phone.replace(/\D/g, "");
    if (digits.length !== 10) return;
    setCodeSending(true);
    const code = generateSmsCode();
    setSentCode(code);
    setTimeout(() => {
      setCodeSending(false);
    }, 1500);
  }, [phone]);

  const handleVerifyCode = useCallback(() => {
    if (!user || !sentCode) return;
    if (codeValue.trim() !== sentCode) {
      setCodeError("Código incorrecto. Revisa e intenta de nuevo.");
      return;
    }
    setCodeError("");
    setVerifying(true);
    setOnboardingComplete(user.id);
    setTimeout(() => {
      router.replace("/dashboard");
    }, 800);
  }, [user, sentCode, codeValue, router]);

  if (!user) return null;

  const phoneDigits = phone.replace(/\D/g, "");
  const canSendCode = phoneDigits.length === 10;
  const canVerify = codeValue.replace(/\D/g, "").length === 6;

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col px-6 py-10">
      <div className="mb-8 flex items-center gap-2">
        <div className="flex size-10 items-center justify-center rounded-xl bg-si-primary/20">
          <Shield className="size-5 text-si-primary" aria-hidden />
        </div>
        <div>
          <h1 className="text-lg font-bold text-foreground">Verificación de identidad</h1>
          <p className="text-xs text-muted">Paso {step} de 3</p>
        </div>
      </div>

      <div className="mb-6 flex gap-2">
        {([1, 2, 3] as const).map((s) => (
          <div
            key={s}
            className={cn(
              "h-1 flex-1 rounded-full transition-colors",
              step >= s ? "bg-si-primary" : "bg-surface-3"
            )}
            aria-hidden
          />
        ))}
      </div>

      {step === 1 && (
        <Card className="mb-6 border-si-primary/30">
          <CardContent className="p-5">
            <div className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-surface-2">
              <Camera className="size-7 text-si-primary" aria-hidden />
            </div>
            <h2 className="text-base font-semibold text-foreground">
              Fotografía de tu INE
            </h2>
            <p className="mt-1 text-sm text-muted">
              Toma una foto del frente de tu INE. Asegúrate de que se vea nítida y completa.
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="sr-only"
              aria-label="Seleccionar foto de INE"
              onChange={handleIneChange}
            />
            {!inePreview ? (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="mt-4 flex w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border bg-surface-2 py-8 text-foreground-secondary transition-colors hover:border-si-primary/50 hover:bg-surface-3 hover:text-foreground"
              >
                <Camera className="size-10 text-muted" aria-hidden />
                <span className="text-sm font-medium">Tocar para tomar foto o elegir imagen</span>
              </button>
            ) : (
              <div className="mt-4 space-y-3">
                <div className="relative overflow-hidden rounded-xl bg-surface-2">
                  <img
                    src={inePreview}
                    alt="Vista previa INE"
                    className="h-48 w-full object-contain"
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="md"
                    fullWidth
                    onClick={() => fileInputRef.current?.click()}
                    disabled={ineValidating}
                  >
                    Otra foto
                  </Button>
                  <Button
                    type="button"
                    size="md"
                    fullWidth
                    onClick={handleValidateIne}
                    disabled={ineValidating}
                  >
                    {ineValidating ? "Validando…" : "Validar identidad"}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {step === 2 && (
        <Card className="mb-6 border-si-primary/30">
          <CardContent className="p-5">
            <div className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-surface-2">
              <Phone className="size-7 text-si-primary" aria-hidden />
            </div>
            <h2 className="text-base font-semibold text-foreground">
              Número de teléfono
            </h2>
            <p className="mt-1 text-sm text-muted">
              Ingresa tu número a 10 dígitos. Te enviaremos un código por SMS.
            </p>
            <div className="mt-4">
              <Input
                label="Teléfono (10 dígitos)"
                type="tel"
                inputMode="numeric"
                placeholder="55 1234 5678"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                maxLength={10}
              />
            </div>
            {!sentCode ? (
              <Button
                type="button"
                size="lg"
                fullWidth
                className="mt-4"
                onClick={handleSendCode}
                disabled={!canSendCode || codeSending}
              >
                {codeSending ? "Enviando código…" : "Enviar código por SMS"}
              </Button>
            ) : (
              <div className="mt-4 space-y-3 rounded-xl border border-si-primary/40 bg-si-primary/5 p-4">
                <p className="text-sm text-foreground-secondary">
                  Simulación: en producción recibirías el código por SMS. Para esta demo tu código es:
                </p>
                <p className="font-mono text-xl font-bold tracking-widest text-si-primary">
                  {sentCode}
                </p>
                <Button
                  type="button"
                  size="md"
                  fullWidth
                  onClick={() => setStep(3)}
                >
                  Continuar
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {step === 3 && (
        <Card className="mb-6 border-si-primary/30">
          <CardContent className="p-5">
            <div className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-surface-2">
              <MessageCircle className="size-7 text-si-primary" aria-hidden />
            </div>
            <h2 className="text-base font-semibold text-foreground">
              Código de verificación
            </h2>
            <p className="mt-1 text-sm text-muted">
              Ingresa el código de 6 dígitos que te enviamos por SMS.
            </p>
            <div className="mt-4">
              <Input
                label="Código SMS (6 dígitos)"
                type="text"
                inputMode="numeric"
                placeholder="000000"
                value={codeValue}
                onChange={(e) => {
                  setCodeValue(e.target.value.replace(/\D/g, "").slice(0, 6));
                  setCodeError("");
                }}
                maxLength={6}
                error={codeError}
              />
            </div>
            <Button
              type="button"
              size="lg"
              fullWidth
              className="mt-4"
              onClick={handleVerifyCode}
              disabled={!canVerify || verifying}
            >
              {verifying ? "Verificando…" : "Verificar y continuar"}
            </Button>
          </CardContent>
        </Card>
      )}

      <p className="mt-auto text-center text-xs text-muted">
        Tus datos se usan solo para verificar tu identidad. Este flujo es una simulación.
      </p>
    </main>
  );
}
