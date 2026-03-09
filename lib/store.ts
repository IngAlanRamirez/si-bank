"use client";

import type { User, Account, Movement, DigitalCard, Beneficiary, Session, ActivityEvent, UserPreferences, DeferredDebt } from "./types";
import { getCategoryById } from "./categories";
import { getCashbackRateForCategory } from "./cashback";

const STORAGE_KEYS = {
  users: "sibank_users",
  accounts: "sibank_accounts",
  movements: "sibank_movements",
  cards: "sibank_cards",
  beneficiaries: "sibank_beneficiaries",
  currentUserId: "sibank_current_user_id",
  sessions: "sibank_sessions",
  activity: "sibank_activity",
  preferences: "sibank_preferences",
  currentSessionId: "sibank_current_session_id",
  onboardingComplete: "sibank_onboarding_complete",
  cashbackCredited: "sibank_cashback_credited",
  deferredDebts: "sibank_deferred_debts",
} as const;

function getJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function setJson(key: string, value: unknown): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(value));
}

export function getStoredUsers(): User[] {
  return getJson<User[]>(STORAGE_KEYS.users, []);
}

export function getStoredAccounts(): Account[] {
  return getJson<Account[]>(STORAGE_KEYS.accounts, []);
}

export function getStoredMovements(): Movement[] {
  return getJson<Movement[]>(STORAGE_KEYS.movements, []);
}

export function getStoredCards(): DigitalCard[] {
  return getJson<DigitalCard[]>(STORAGE_KEYS.cards, []);
}

export function getStoredBeneficiaries(): Beneficiary[] {
  return getJson<Beneficiary[]>(STORAGE_KEYS.beneficiaries, []);
}

export function getCurrentUserId(): string | null {
  return getJson<string | null>(STORAGE_KEYS.currentUserId, null);
}

export function setCurrentUserId(userId: string | null): void {
  setJson(STORAGE_KEYS.currentUserId, userId);
}

export function getOnboardingComplete(userId: string): boolean {
  const data = getJson<Record<string, boolean>>(STORAGE_KEYS.onboardingComplete, {});
  return data[userId] === true;
}

export function setOnboardingComplete(userId: string): void {
  const data = getJson<Record<string, boolean>>(STORAGE_KEYS.onboardingComplete, {});
  data[userId] = true;
  setJson(STORAGE_KEYS.onboardingComplete, data);
}

export function getStoredSessions(): Session[] {
  return getJson<Session[]>(STORAGE_KEYS.sessions, []);
}

export function getStoredActivity(): ActivityEvent[] {
  return getJson<ActivityEvent[]>(STORAGE_KEYS.activity, []);
}

export function getCurrentSessionId(): string | null {
  return getJson<string | null>(STORAGE_KEYS.currentSessionId, null);
}

export function setCurrentSessionId(sessionId: string | null): void {
  setJson(STORAGE_KEYS.currentSessionId, sessionId);
}

export function getSessionsByUserId(userId: string): Session[] {
  return getStoredSessions()
    .filter((s) => s.userId === userId)
    .sort((a, b) => new Date(b.lastActiveAt).getTime() - new Date(a.lastActiveAt).getTime());
}

export function addSession(session: Session): void {
  const sessions = getStoredSessions();
  sessions.push(session);
  setJson(STORAGE_KEYS.sessions, sessions);
}

export function removeSession(sessionId: string): void {
  const sessions = getStoredSessions().filter((s) => s.id !== sessionId);
  setJson(STORAGE_KEYS.sessions, sessions);
}

export function getActivityByUserId(userId: string, limit = 50): ActivityEvent[] {
  return getStoredActivity()
    .filter((e) => e.userId === userId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, limit);
}

export function addActivity(event: Omit<ActivityEvent, "id" | "createdAt">): void {
  const full: ActivityEvent = {
    ...event,
    id: generateId(),
    createdAt: new Date().toISOString(),
  };
  const list = getStoredActivity();
  list.push(full);
  setJson(STORAGE_KEYS.activity, list);
}

const DEFAULT_PREFERENCES: UserPreferences = {
  theme: "dark",
  notificationsPush: true,
  notificationsEmail: true,
  language: "es",
};

export function getPreferences(userId: string): UserPreferences {
  const all = getJson<Record<string, UserPreferences>>(STORAGE_KEYS.preferences, {});
  return all[userId] ?? DEFAULT_PREFERENCES;
}

export function setPreferences(userId: string, prefs: Partial<UserPreferences>): void {
  const all = getJson<Record<string, UserPreferences>>(STORAGE_KEYS.preferences, {});
  all[userId] = { ...DEFAULT_PREFERENCES, ...all[userId], ...prefs };
  setJson(STORAGE_KEYS.preferences, all);
}

/** Etiqueta del dispositivo actual para sesiones (solo cliente). */
function getDeviceLabel(): string {
  if (typeof navigator === "undefined") return "Dispositivo";
  const ua = navigator.userAgent;
  if (/mobile|android|iphone|ipad/i.test(ua)) return "Móvil";
  const platform = (navigator as { userAgentData?: { platform?: string } }).userAgentData?.platform;
  if (platform) return `Navegador - ${platform}`;
  if (/Mac/.test(ua)) return "Navegador - macOS";
  if (/Win/.test(ua)) return "Navegador - Windows";
  return "Este dispositivo";
}

/** Registrar inicio de sesión: crea sesión, marca actual y añade evento. */
export function recordLogin(userId: string, deviceLabel: string): string {
  const session: Session = {
    id: generateId(),
    userId,
    deviceLabel,
    lastActiveAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  };
  addSession(session);
  setCurrentSessionId(session.id);
  addActivity({
    userId,
    type: "login",
    label: "Inicio de sesión",
    detail: deviceLabel,
  });
  return session.id;
}

/** Registrar cierre de sesión y limpiar sesión actual. */
export function recordLogout(userId: string): void {
  const sessionId = getCurrentSessionId();
  addActivity({ userId, type: "logout", label: "Cierre de sesión" });
  if (sessionId) removeSession(sessionId);
  setCurrentSessionId(null);
}

/** Cerrar todas las sesiones del usuario excepto la actual. */
export function closeOtherSessions(userId: string): void {
  const currentId = getCurrentSessionId();
  const sessions = getSessionsByUserId(userId).filter((s) => s.id !== currentId);
  for (const s of sessions) {
    removeSession(s.id);
    addActivity({
      userId,
      type: "session_closed",
      label: "Sesión cerrada",
      detail: s.deviceLabel,
    });
  }
}

export function findUserByEmail(email: string): User | undefined {
  return getStoredUsers().find((u) => u.email.toLowerCase() === email.toLowerCase());
}

export function findUserById(id: string): User | undefined {
  return getStoredUsers().find((u) => u.id === id);
}

export function findAccountByUserId(userId: string): Account | undefined {
  return getStoredAccounts().find((a) => a.userId === userId);
}

/** CLABE de 18 dígitos para mostrar en "Recibir" (derivada de la cuenta, consistente) */
export function getDisplayClabe(account: Account): string {
  const h = stringHash(account.id);
  const mid = String(h).padStart(10, "0").slice(-10);
  const last4 = String(Math.abs(stringHash(account.id + "y") % 10000)).padStart(4, "0");
  return "4521" + mid + last4;
}

export function getMovementsByAccountId(accountId: string): Movement[] {
  return getStoredMovements()
    .filter((m) => m.accountId === accountId)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function getCardsByAccountId(accountId: string): DigitalCard[] {
  return getStoredCards()
    .filter((c) => c.accountId === accountId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

function stringHash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = ((h << 5) - h + s.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

/** CVV dinámico 3 dígitos (100-999) que cambia cada `intervalMinutes` minutos */
export function getDynamicCVV(seed: string, intervalMinutes = 5): number {
  const timeSlot = Math.floor(Date.now() / (intervalMinutes * 60 * 1000));
  const n = (stringHash(seed) + timeSlot) % 900;
  return n + 100;
}

/** Número completo de la tarjeta (16 dígitos). Si no está guardado, se deriva de last4 + id. */
export function getCardFullNumber(card: DigitalCard): string {
  if (card.fullNumber && /^\d{16}$/.test(card.fullNumber.replace(/\s/g, ""))) {
    return card.fullNumber.replace(/\s/g, "");
  }
  const prefix = card.brand === "visa" ? "4" : "5";
  const mid = String(stringHash(card.id + card.last4)).padStart(11, "0").slice(-11);
  return prefix + mid + card.last4;
}

/** Formato vencimiento MM/AA */
export function getCardExpiryFormatted(card: DigitalCard): string {
  const month = card.expiryMonth ?? 12;
  const year = card.expiryYear ?? 30;
  return `${String(month).padStart(2, "0")}/${String(year).padStart(2, "0")}`;
}

function buildCardDisplayData(cardId: string, accountId: string, last4: string, brand: CardBrand): Partial<DigitalCard> {
  const seed = cardId + last4 + accountId;
  const prefix = brand === "visa" ? "4" : "5";
  const mid = String(stringHash(seed)).padStart(11, "0").slice(-11);
  const fullNumber = prefix + mid + last4;
  const expiryMonth = (stringHash(seed + "m") % 12) + 1;
  const expiryYear = 28 + (stringHash(seed + "y") % 5);
  const cvvSeed = seed;
  return { fullNumber, expiryMonth, expiryYear, cvvSeed };
}

/** Crea tarjetas por defecto para una cuenta (p. ej. usuarios que ya existían antes de la fase de tarjetas) */
export function seedDefaultCardsForAccount(accountId: string): void {
  const existing = getCardsByAccountId(accountId);
  if (existing.length > 0) return;
  const visaId = generateId();
  const mcId = generateId();
  const cards: DigitalCard[] = [
    {
      id: visaId,
      accountId,
      last4: "4521",
      brand: "visa",
      isLocked: false,
      dailyLimitCents: 5_000_00,
      createdAt: new Date().toISOString(),
      ...buildCardDisplayData(visaId, accountId, "4521", "visa"),
    },
    {
      id: mcId,
      accountId,
      last4: "8832",
      brand: "mastercard",
      isLocked: false,
      dailyLimitCents: 10_000_00,
      createdAt: new Date().toISOString(),
      ...buildCardDisplayData(mcId, accountId, "8832", "mastercard"),
    },
  ];
  const all = getStoredCards();
  all.push(...cards);
  setJson(STORAGE_KEYS.cards, all);
}

export function toggleCardLock(cardId: string): void {
  const cards = getStoredCards();
  const index = cards.findIndex((c) => c.id === cardId);
  if (index === -1) return;
  cards[index] = { ...cards[index], isLocked: !cards[index].isLocked };
  setJson(STORAGE_KEYS.cards, cards);
}

/** Gastos de hoy para la cuenta (centavos), para mostrar vs límite de tarjeta */
export function getAccountSpentTodayCents(accountId: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  return getStoredMovements()
    .filter(
      (m) =>
        m.accountId === accountId &&
        m.type === "out" &&
        new Date(m.date) >= today &&
        new Date(m.date) < tomorrow
    )
    .reduce((sum, m) => sum + m.amount, 0);
}

export function getBeneficiariesByAccountId(accountId: string): Beneficiary[] {
  return getStoredBeneficiaries()
    .filter((b) => b.accountId === accountId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function addBeneficiary(data: {
  accountId: string;
  name: string;
  accountNumber: string;
  bankName?: string;
}): Beneficiary {
  const list = getStoredBeneficiaries();
  const beneficiary: Beneficiary = {
    id: generateId(),
    accountId: data.accountId,
    name: data.name.trim(),
    accountNumber: data.accountNumber.trim().replace(/\s/g, ""),
    bankName: data.bankName?.trim(),
    createdAt: new Date().toISOString(),
  };
  list.push(beneficiary);
  setJson(STORAGE_KEYS.beneficiaries, list);
  return beneficiary;
}

export function deleteBeneficiary(beneficiaryId: string): void {
  const list = getStoredBeneficiaries().filter((b) => b.id !== beneficiaryId);
  setJson(STORAGE_KEYS.beneficiaries, list);
}

export function findBeneficiaryById(id: string): Beneficiary | undefined {
  return getStoredBeneficiaries().find((b) => b.id === id);
}

/** Ejecuta transferencia: resta saldo, crea movimiento. Devuelve id del movimiento. */
export function executeTransfer(params: {
  accountId: string;
  destinationName: string;
  destinationAccount: string;
  amountCents: number;
  concept: string;
}): { movementId: string } {
  const accounts = getStoredAccounts();
  const accountIndex = accounts.findIndex((a) => a.id === params.accountId);
  if (accountIndex === -1) throw new Error("Cuenta no encontrada");
  const account = accounts[accountIndex];
  if (account.balance < params.amountCents) throw new Error("Saldo insuficiente");
  if (params.amountCents <= 0) throw new Error("Monto inválido");

  accounts[accountIndex] = { ...account, balance: account.balance - params.amountCents };
  setJson(STORAGE_KEYS.accounts, accounts);

  const movement: Movement = {
    id: generateId(),
    accountId: params.accountId,
    type: "out",
    label: `Transferencia a ${params.destinationName}`,
    amount: params.amountCents,
    date: new Date().toISOString(),
    categoryId: "transfer-out",
    description: params.concept
      ? `Concepto: ${params.concept}. Destino: ${params.destinationAccount}`
      : `Destino: ${params.destinationAccount}`,
  };
  const movements = getStoredMovements();
  movements.push(movement);
  setJson(STORAGE_KEYS.movements, movements);

  return { movementId: movement.id };
}

/** Pago de servicio: resta saldo, crea movimiento. Devuelve id del movimiento. */
export function executeServicePayment(params: {
  accountId: string;
  serviceName: string;
  reference: string;
  amountCents: number;
}): { movementId: string } {
  const accounts = getStoredAccounts();
  const accountIndex = accounts.findIndex((a) => a.id === params.accountId);
  if (accountIndex === -1) throw new Error("Cuenta no encontrada");
  const account = accounts[accountIndex];
  if (account.balance < params.amountCents) throw new Error("Saldo insuficiente");
  if (params.amountCents <= 0) throw new Error("Monto inválido");

  accounts[accountIndex] = { ...account, balance: account.balance - params.amountCents };
  setJson(STORAGE_KEYS.accounts, accounts);

  const movement: Movement = {
    id: generateId(),
    accountId: params.accountId,
    type: "out",
    label: `Pago ${params.serviceName}`,
    amount: params.amountCents,
    date: new Date().toISOString(),
    categoryId: "services",
    description: `Referencia: ${params.reference}`,
  };
  const movements = getStoredMovements();
  movements.push(movement);
  setJson(STORAGE_KEYS.movements, movements);

  return { movementId: movement.id };
}

export type MovementFilters = {
  categoryId?: string;
  dateFrom?: string; // ISO date (YYYY-MM-DD)
  dateTo?: string;
};

export function filterMovements(
  movements: Movement[],
  filters: MovementFilters
): Movement[] {
  let result = [...movements];
  if (filters.categoryId) {
    result = result.filter((m) => m.categoryId === filters.categoryId);
  }
  if (filters.dateFrom) {
    const from = new Date(filters.dateFrom);
    from.setHours(0, 0, 0, 0);
    result = result.filter((m) => new Date(m.date) >= from);
  }
  if (filters.dateTo) {
    const to = new Date(filters.dateTo);
    to.setHours(23, 59, 59, 999);
    result = result.filter((m) => new Date(m.date) <= to);
  }
  return result;
}

function generateId(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function maskAccountNumber(full: string): string {
  return "•••• " + full.slice(-4);
}

export function createUser(data: { name: string; email: string }): User {
  const users = getStoredUsers();
  const existing = users.find((u) => u.email.toLowerCase() === data.email.toLowerCase());
  if (existing) throw new Error("Ya existe una cuenta con este correo.");

  const user: User = {
    id: generateId(),
    name: data.name.trim(),
    email: data.email.trim().toLowerCase(),
    createdAt: new Date().toISOString(),
  };
  users.push(user);
  setJson(STORAGE_KEYS.users, users);

  const accountNumber = "4521" + Date.now().toString(36).slice(-4).toUpperCase();
  const account: Account = {
    id: generateId(),
    userId: user.id,
    accountNumber: maskAccountNumber(accountNumber),
    balance: 12_450_00, // 12450.00 en centavos para evitar floats
    currency: "MXN",
    createdAt: new Date().toISOString(),
  };
  const accounts = getStoredAccounts();
  accounts.push(account);
  setJson(STORAGE_KEYS.accounts, accounts);

  const cards: DigitalCard[] = [
    {
      id: generateId(),
      accountId: account.id,
      last4: "4521",
      brand: "visa",
      isLocked: false,
      dailyLimitCents: 5_000_00,
      createdAt: new Date().toISOString(),
    },
    {
      id: generateId(),
      accountId: account.id,
      last4: "8832",
      brand: "mastercard",
      isLocked: false,
      dailyLimitCents: 10_000_00,
      createdAt: new Date().toISOString(),
    },
  ];
  cards[0] = { ...cards[0], ...buildCardDisplayData(cards[0].id, account.id, "4521", "visa") };
  cards[1] = { ...cards[1], ...buildCardDisplayData(cards[1].id, account.id, "8832", "mastercard") };
  const allCards = getStoredCards();
  allCards.push(...cards);
  setJson(STORAGE_KEYS.cards, allCards);

  const movements: Movement[] = [
    {
      id: generateId(),
      accountId: account.id,
      type: "in",
      label: "Transferencia recibida",
      amount: 500_00,
      date: new Date().toISOString(),
      categoryId: "transfer-in",
    },
    {
      id: generateId(),
      accountId: account.id,
      type: "out",
      label: "Pago Netflix",
      amount: 199_00,
      date: new Date(Date.now() - 86400 * 1000).toISOString(),
      categoryId: "streaming",
    },
    {
      id: generateId(),
      accountId: account.id,
      type: "in",
      label: "Depósito",
      amount: 3_000_00,
      date: new Date(Date.now() - 86400 * 2 * 1000).toISOString(),
      categoryId: "deposit",
    },
  ];
  const allMovements = getStoredMovements();
  allMovements.push(...movements);
  setJson(STORAGE_KEYS.movements, allMovements);

  return user;
}

export function loginUser(email: string, _password: string): User | null {
  const user = findUserByEmail(email);
  if (!user) return null;
  setCurrentUserId(user.id);
  recordLogin(user.id, getDeviceLabel());
  return user;
}

export function logoutUser(): void {
  const userId = getCurrentUserId();
  if (userId) recordLogout(userId);
  setCurrentUserId(null);
}

export function formatBalance(cents: number): string {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    minimumFractionDigits: 2,
  }).format(cents / 100);
}

export function formatMovementAmount(type: Movement["type"], cents: number): string {
  const formatted = new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    minimumFractionDigits: 2,
  }).format(cents / 100);
  return type === "in" ? `+${formatted}` : `-${formatted}`;
}

export function formatMovementDate(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today.getTime() - 86400 * 1000);
  const dDate = new Date(d.getFullYear(), d.getMonth(), d.getDate());

  if (dDate.getTime() === today.getTime()) {
    return "Hoy, " + d.toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" });
  }
  if (dDate.getTime() === yesterday.getTime()) return "Ayer";
  return d.toLocaleDateString("es-MX", { day: "numeric", month: "short" });
}

export function formatMovementDateLong(iso: string): string {
  return new Date(iso).toLocaleDateString("es-MX", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function findMovementById(movementId: string): Movement | undefined {
  return getStoredMovements().find((m) => m.id === movementId);
}

export type CategorySummary = { categoryId: string; name: string; totalCents: number };

export function getExpensesByCategory(movements: Movement[]): CategorySummary[] {
  const byCategory = new Map<string, number>();
  const outMovements = movements.filter((m) => m.type === "out");
  for (const m of outMovements) {
    const key = m.categoryId ?? "out-other";
    byCategory.set(key, (byCategory.get(key) ?? 0) + m.amount);
  }
  return Array.from(byCategory.entries())
    .map(([categoryId, totalCents]) => ({
      categoryId,
      name: getCategoryById(categoryId)?.name ?? "Otro",
      totalCents,
    }))
    .sort((a, b) => b.totalCents - a.totalCents);
}

export type MonthlySummary = {
  year: number;
  month: number;
  label: string;
  incomeCents: number;
  expenseCents: number;
};

export function getMonthlyEvolution(movements: Movement[], monthsBack = 6): MonthlySummary[] {
  const now = new Date();
  const result: MonthlySummary[] = [];
  for (let i = monthsBack - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const start = new Date(d.getFullYear(), d.getMonth(), 1);
    const end = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999);
    const inMonth = movements.filter((m) => {
      const date = new Date(m.date);
      return date >= start && date <= end;
    });
    const incomeCents = inMonth.filter((m) => m.type === "in").reduce((s, m) => s + m.amount, 0);
    const expenseCents = inMonth.filter((m) => m.type === "out").reduce((s, m) => s + m.amount, 0);
    result.push({
      year: d.getFullYear(),
      month: d.getMonth(),
      label: d.toLocaleDateString("es-MX", { month: "short", year: "2-digit" }),
      incomeCents,
      expenseCents,
    });
  }
  return result;
}

export type CashbackBreakdownItem = {
  categoryId: string;
  name: string;
  spentCents: number;
  rate: number;
  cashbackCents: number;
};

export function getCashbackCredited(accountId: string): number {
  const data = getJson<Record<string, number>>(STORAGE_KEYS.cashbackCredited, {});
  return data[accountId] ?? 0;
}

function setCashbackCredited(accountId: string, cents: number): void {
  const data = getJson<Record<string, number>>(STORAGE_KEYS.cashbackCredited, {});
  data[accountId] = cents;
  setJson(STORAGE_KEYS.cashbackCredited, data);
}

/** Cashback total ganado por gastos (out) según porcentaje por categoría */
export function getCashbackEarnedForAccount(accountId: string): number {
  const movements = getMovementsByAccountId(accountId);
  let total = 0;
  for (const m of movements) {
    if (m.type !== "out" || !m.categoryId) continue;
    const rate = getCashbackRateForCategory(m.categoryId);
    if (rate <= 0) continue;
    total += Math.floor((m.amount * rate) / 100);
  }
  return total;
}

/** Desglose por categoría: gastado y cashback generado */
export function getCashbackBreakdown(accountId: string): CashbackBreakdownItem[] {
  const movements = getMovementsByAccountId(accountId).filter((m) => m.type === "out");
  const byCategory = new Map<string, { spentCents: number }>();
  for (const m of movements) {
    const key = m.categoryId ?? "out-other";
    const prev = byCategory.get(key) ?? { spentCents: 0 };
    prev.spentCents += m.amount;
    byCategory.set(key, prev);
  }
  return Array.from(byCategory.entries())
    .map(([categoryId, { spentCents }]) => {
      const rate = getCashbackRateForCategory(categoryId);
      const cashbackCents = rate > 0 ? Math.floor((spentCents * rate) / 100) : 0;
      return {
        categoryId,
        name: getCategoryById(categoryId)?.name ?? "Otro",
        spentCents,
        rate,
        cashbackCents,
      };
    })
    .filter((row) => row.cashbackCents > 0)
    .sort((a, b) => b.cashbackCents - a.cashbackCents);
}

/** Acredita el cashback disponible a la cuenta (suma al saldo y crea movimiento). Devuelve los centavos acreditados. */
export function creditCashback(accountId: string): number {
  const earned = getCashbackEarnedForAccount(accountId);
  const credited = getCashbackCredited(accountId);
  const available = earned - credited;
  if (available <= 0) return 0;

  const accounts = getStoredAccounts();
  const idx = accounts.findIndex((a) => a.id === accountId);
  if (idx === -1) return 0;
  accounts[idx] = { ...accounts[idx], balance: accounts[idx].balance + available };
  setJson(STORAGE_KEYS.accounts, accounts);

  const movement: Movement = {
    id: generateId(),
    accountId,
    type: "in",
    label: "Cashback campaña",
    amount: available,
    date: new Date().toISOString(),
    categoryId: "cashback",
    description: "Acreditación por compras con cashback",
  };
  const movements = getStoredMovements();
  movements.push(movement);
  setJson(STORAGE_KEYS.movements, movements);

  setCashbackCredited(accountId, earned);
  return available;
}

export function getStoredDeferredDebts(): DeferredDebt[] {
  return getJson<DeferredDebt[]>(STORAGE_KEYS.deferredDebts, []);
}

export function getDeferredDebtsByAccountId(accountId: string): DeferredDebt[] {
  return getStoredDeferredDebts()
    .filter((d) => d.accountId === accountId && d.paidInstallments < d.months)
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
}

/** Diferir un gasto a N meses sin intereses. Revierte el movimiento y crea el plan de cuotas. */
export function createDeferredDebt(
  accountId: string,
  movementId: string,
  months: number
): DeferredDebt | null {
  if (months < 2 || months > 24) return null;
  const movements = getStoredMovements();
  const movIndex = movements.findIndex((m) => m.id === movementId && m.accountId === accountId);
  if (movIndex === -1) return null;
  const mov = movements[movIndex];
  if (mov.type !== "out" || mov.deferredToDebtId) return null;

  const totalCents = mov.amount;
  const monthlyCents = Math.floor(totalCents / months);
  if (monthlyCents <= 0) return null;

  const accounts = getStoredAccounts();
  const accIndex = accounts.findIndex((a) => a.id === accountId);
  if (accIndex === -1) return null;
  accounts[accIndex] = { ...accounts[accIndex], balance: accounts[accIndex].balance + totalCents };
  setJson(STORAGE_KEYS.accounts, accounts);

  const debtId = generateId();
  movements[movIndex] = { ...mov, deferredToDebtId: debtId };
  setJson(STORAGE_KEYS.movements, movements);

  const debt: DeferredDebt = {
    id: debtId,
    accountId,
    originalMovementId: movementId,
    label: mov.label,
    totalCents,
    months,
    monthlyCents,
    paidInstallments: 0,
    createdAt: new Date().toISOString(),
  };
  const debts = getStoredDeferredDebts();
  debts.push(debt);
  setJson(STORAGE_KEYS.deferredDebts, debts);
  return debt;
}

/** Pagar la siguiente cuota de una deuda diferida. */
export function payNextInstallment(debtId: string): boolean {
  const debts = getStoredDeferredDebts();
  const index = debts.findIndex((d) => d.id === debtId);
  if (index === -1) return false;
  const debt = debts[index];
  if (debt.paidInstallments >= debt.months) return true;

  const isLast = debt.paidInstallments === debt.months - 1;
  const amountThisMonth = isLast
    ? debt.totalCents - debt.monthlyCents * (debt.months - 1)
    : debt.monthlyCents;

  const accounts = getStoredAccounts();
  const accIndex = accounts.findIndex((a) => a.id === debt.accountId);
  if (accIndex === -1) return false;
  const account = accounts[accIndex];
  if (account.balance < amountThisMonth) return false;

  accounts[accIndex] = { ...account, balance: account.balance - amountThisMonth };
  setJson(STORAGE_KEYS.accounts, accounts);

  const movement: Movement = {
    id: generateId(),
    accountId: debt.accountId,
    type: "out",
    label: `Cuota ${debt.paidInstallments + 1}/${debt.months} MSI - ${debt.label}`,
    amount: amountThisMonth,
    date: new Date().toISOString(),
    categoryId: "out-other",
    description: `Meses sin intereses (${debt.months} meses)`,
  };
  const movements = getStoredMovements();
  movements.push(movement);
  setJson(STORAGE_KEYS.movements, movements);

  debts[index] = { ...debt, paidInstallments: debt.paidInstallments + 1 };
  setJson(STORAGE_KEYS.deferredDebts, debts);
  return true;
}

/** Gastos que se pueden diferir (out, sin diferir aún) */
export function getDeferrableMovements(accountId: string, limit = 20): Movement[] {
  return getMovementsByAccountId(accountId)
    .filter((m) => m.type === "out" && !m.deferredToDebtId)
    .slice(0, limit);
}
