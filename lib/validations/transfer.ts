import { z } from "zod";

export const transferStepDestinationSchema = z.object({
  beneficiaryId: z.string().optional(),
  newName: z.string().min(2, "Mínimo 2 caracteres").optional(),
  newAccountNumber: z.string().min(10, "CLABE o cuenta (mín. 10 dígitos)").optional(),
}).refine(
  (data) => data.beneficiaryId || (data.newName && data.newAccountNumber),
  { message: "Elige un beneficiario o ingresa nombre y cuenta" }
);

export const transferStepAmountSchema = z.object({
  amount: z.string().min(1, "Ingresa el monto").refine(
    (v) => /^\d+(\.\d{1,2})?$/.test(v) && parseFloat(v) > 0,
    "Monto inválido"
  ),
  concept: z.string().max(100).optional(),
});

export type TransferDestinationForm = z.infer<typeof transferStepDestinationSchema>;
export type TransferAmountForm = z.infer<typeof transferStepAmountSchema>;
