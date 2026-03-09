"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema, type RegisterFormData } from "@/lib/validations/register";
import { useAuth } from "@/providers/AuthProvider";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ArrowLeft, CheckCircle2 } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const { register: doRegister } = useAuth();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  async function onSubmit(data: RegisterFormData) {
    const result = doRegister({
      name: data.name,
      email: data.email,
      password: data.password,
    });
    if (!result.ok) {
      setError("root", { message: result.error });
      return;
    }
    router.replace("/onboarding");
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-12">
      <Link
        href="/"
        className="absolute left-4 top-6 inline-flex items-center gap-2 text-sm text-foreground-secondary hover:text-si-primary"
      >
        <ArrowLeft className="size-4" /> Volver
      </Link>

      <div className="mb-2 inline-flex w-fit items-center gap-2 rounded-full border border-si-primary/40 bg-si-primary/10 px-3 py-1 text-xs font-medium text-si-primary">
        <CheckCircle2 className="size-3.5" aria-hidden />
        Cuenta digital inmediata
      </div>
      <h1 className="text-2xl font-bold text-foreground">Crear cuenta</h1>
      <p className="mt-2 text-foreground-secondary">
        Sin sucursales. Registro rápido y listo para usar.
      </p>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="mt-8 flex w-full flex-col gap-4"
        noValidate
      >
        {errors.root && (
          <p className="rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger" role="alert">
            {errors.root.message}
          </p>
        )}

        <Input
          label="Nombre completo"
          type="text"
          autoComplete="name"
          placeholder="Tu nombre"
          error={errors.name?.message}
          {...register("name")}
        />

        <Input
          label="Correo electrónico"
          type="email"
          autoComplete="email"
          placeholder="tu@correo.com"
          error={errors.email?.message}
          {...register("email")}
        />

        <Input
          label="Contraseña"
          type="password"
          autoComplete="new-password"
          placeholder="Mín. 8 caracteres, mayúscula, minúscula y número"
          error={errors.password?.message}
          {...register("password")}
        />

        <Input
          label="Confirmar contraseña"
          type="password"
          autoComplete="new-password"
          placeholder="Repite tu contraseña"
          error={errors.confirmPassword?.message}
          {...register("confirmPassword")}
        />

        <Button type="submit" size="lg" fullWidth disabled={isSubmitting}>
          {isSubmitting ? "Creando cuenta…" : "Crear cuenta"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted">
        ¿Ya tienes cuenta?{" "}
        <Link href="/login" className="font-medium text-si-primary hover:underline">
          Iniciar sesión
        </Link>
      </p>
    </main>
  );
}
