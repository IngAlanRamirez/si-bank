export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string; // ISO
}

export interface Account {
  id: string;
  userId: string;
  accountNumber: string;
  balance: number; // centavos
  currency: string;
  createdAt: string;
}

export type MovementType = "in" | "out";

export interface Movement {
  id: string;
  accountId: string;
  type: MovementType;
  label: string;
  amount: number; // positivo siempre
  date: string; // ISO
  categoryId?: string; // id de MovementCategory
  description?: string; // opcional para detalle
  /** Si está diferido a MSI, id de la deuda */
  deferredToDebtId?: string;
}

export interface MovementCategory {
  id: string;
  name: string;
  icon: string; // nombre del icono Lucide
  color: string; // clase Tailwind para texto/bg (ej. text-si-primary)
  type: MovementType; // in | out
}

export const CURRENCY = "MXN";

export type CardBrand = "visa" | "mastercard";

export interface DigitalCard {
  id: string;
  accountId: string;
  last4: string;
  brand: CardBrand;
  isLocked: boolean;
  dailyLimitCents: number; // límite diario en centavos
  createdAt: string;
  /** Número completo 16 dígitos (para ver/copiar). Opcional: si no existe se deriva de last4. */
  fullNumber?: string;
  /** Mes de vencimiento 1-12 */
  expiryMonth?: number;
  /** Año de vencimiento 2 dígitos (ej. 28 = 2028) */
  expiryYear?: number;
  /** Semilla para generar CVV dinámico (cambia cada X minutos) */
  cvvSeed?: string;
}

export interface Beneficiary {
  id: string;
  accountId: string; // cuenta del usuario que lo tiene como beneficiario
  name: string;
  accountNumber: string; // CLABE o número de cuenta (enmascarado en UI)
  bankName?: string;
  createdAt: string;
}

export interface ServiceBiller {
  id: string;
  name: string;
  icon: string; // lucide name
  category: string; // luz, teléfono, etc.
}

export interface TransferVoucher {
  movementId: string;
  type: "transfer" | "service";
  amountCents: number;
  label: string;
  date: string;
  destination?: string; // nombre beneficiario o servicio
  reference?: string;
}

/** Sesión activa (dispositivo/navegador donde el usuario inició sesión) */
export interface Session {
  id: string;
  userId: string;
  deviceLabel: string;
  lastActiveAt: string; // ISO
  createdAt: string; // ISO
}

export type ActivityEventType =
  | "login"
  | "logout"
  | "login_failed"
  | "session_closed"
  | "password_changed";

export interface ActivityEvent {
  id: string;
  userId: string;
  type: ActivityEventType;
  label: string;
  detail?: string;
  createdAt: string; // ISO
}

export interface UserPreferences {
  theme: "dark" | "system";
  notificationsPush: boolean;
  notificationsEmail: boolean;
  language: "es" | "en";
}

/** Deuda diferida a meses sin intereses */
export interface DeferredDebt {
  id: string;
  accountId: string;
  originalMovementId: string;
  label: string;
  totalCents: number;
  months: number;
  monthlyCents: number;
  paidInstallments: number;
  createdAt: string;
}
