import type { MovementCategory } from "./types";

export const MOVEMENT_CATEGORIES: MovementCategory[] = [
  // Ingresos
  { id: "transfer-in", name: "Transferencia recibida", icon: "ArrowDownLeft", color: "text-success", type: "in" },
  { id: "deposit", name: "Depósito", icon: "Wallet", color: "text-success", type: "in" },
  { id: "salary", name: "Nómina", icon: "Briefcase", color: "text-success", type: "in" },
  { id: "income-other", name: "Otro ingreso", icon: "PlusCircle", color: "text-success", type: "in" },
  { id: "cashback", name: "Cashback", icon: "Percent", color: "text-success", type: "in" },
  // Gastos
  { id: "streaming", name: "Streaming", icon: "Tv", color: "text-danger", type: "out" },
  { id: "food", name: "Comida y restaurantes", icon: "UtensilsCrossed", color: "text-warning", type: "out" },
  { id: "transport", name: "Transporte", icon: "Car", color: "text-si-secondary", type: "out" },
  { id: "shopping", name: "Compras", icon: "ShoppingBag", color: "text-si-primary", type: "out" },
  { id: "services", name: "Servicios", icon: "Wrench", color: "text-info", type: "out" },
  { id: "health", name: "Salud", icon: "Heart", color: "text-danger", type: "out" },
  { id: "entertainment", name: "Entretenimiento", icon: "Gamepad2", color: "text-si-accent", type: "out" },
  { id: "transfer-out", name: "Transferencia enviada", icon: "ArrowUpRight", color: "text-foreground-secondary", type: "out" },
  { id: "out-other", name: "Otro gasto", icon: "CircleDollarSign", color: "text-muted", type: "out" },
];

export function getCategoryById(id: string | undefined): MovementCategory | undefined {
  if (!id) return undefined;
  return MOVEMENT_CATEGORIES.find((c) => c.id === id);
}

export function getCategoriesByType(type: "in" | "out"): MovementCategory[] {
  return MOVEMENT_CATEGORIES.filter((c) => c.type === type);
}
