import { Button } from "@/components/ui/Button";
import { ArrowRight, Shield, Zap, PieChart, CreditCard, Send } from "lucide-react";

export default function WelcomePage() {
  return (
    <main className="relative min-h-screen overflow-hidden">
      {/* Background gradient mesh */}
      <div
        className="pointer-events-none absolute inset-0 opacity-30"
        style={{
          background:
            "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(57, 255, 20, 0.25), transparent), radial-gradient(ellipse 60% 40% at 100% 50%, rgba(0, 229, 255, 0.15), transparent)",
        }}
      />

      <div className="relative mx-auto flex min-h-screen max-w-lg flex-col px-6 pb-24 pt-16">
        {/* Logo + headline */}
        <header className="animate-[si-slide-up_0.5s_ease-out]">
          <p className="text-sm font-medium uppercase tracking-widest text-si-primary">
            Banco 100% digital
          </p>
          <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">
            <span className="text-gradient-neon">Si!</span>
            <br />
            Bank
          </h1>
          <p className="mt-4 max-w-sm text-lg text-foreground-secondary">
            Simplifica cómo administras tu dinero. Cuenta digital, transferencias,
            pagos y estadísticas en tiempo real.
          </p>
        </header>

        {/* CTAs */}
        <div className="mt-10 flex flex-col gap-3 animate-[si-slide-up_0.6s_ease-out] [animation-fill-mode:backwards]">
          <Button href="/register" size="lg" fullWidth glow>
            Crear cuenta
            <ArrowRight className="ml-2 size-5" />
          </Button>
          <Button href="/login" variant="outline" size="lg" fullWidth>
            Iniciar sesión
          </Button>
        </div>

        {/* Feature pills */}
        <ul
          className="mt-14 grid grid-cols-2 gap-3 animate-[si-slide-up_0.7s_ease-out] [animation-fill-mode:backwards]"
          aria-label="Características"
        >
          {[
            { icon: Zap, label: "Cuenta inmediata" },
            { icon: Send, label: "Transferencias" },
            { icon: CreditCard, label: "Tarjetas digitales" },
            { icon: PieChart, label: "Estadísticas" },
            { icon: Shield, label: "Seguridad moderna" },
          ].map(({ icon: Icon, label }) => (
            <li
              key={label}
              className="flex items-center gap-2 rounded-xl border border-border bg-surface px-4 py-3"
            >
              <Icon className="size-5 text-si-primary" aria-hidden />
              <span className="text-sm font-medium text-foreground-secondary">
                {label}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
