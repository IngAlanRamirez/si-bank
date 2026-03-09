import { z } from "zod";

const passwordMin = 8;

export const registerSchema = z
  .object({
    name: z
      .string()
      .min(2, "Al menos 2 caracteres")
      .max(80, "Máximo 80 caracteres"),
    email: z
      .string()
      .min(1, "Ingresa tu correo")
      .email("Correo no válido"),
    password: z
      .string()
      .min(passwordMin, `Mínimo ${passwordMin} caracteres`)
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "Incluye mayúscula, minúscula y número"
      ),
    confirmPassword: z.string().min(1, "Confirma tu contraseña"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });

export type RegisterFormData = z.infer<typeof registerSchema>;
