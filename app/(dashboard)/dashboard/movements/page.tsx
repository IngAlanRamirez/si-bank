"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/Card";
import { useAuth } from "@/providers/AuthProvider";
import { filterMovements, formatMovementAmount, formatMovementDate } from "@/lib/store";
import { getCategoryById, MOVEMENT_CATEGORIES } from "@/lib/categories";
import { CategoryIcon } from "@/components/features/movements/CategoryIcon";
import { ArrowLeft, Filter, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const DATE_PRESETS = [
  { id: "all", label: "Todos", dateFrom: undefined, dateTo: undefined },
  {
    id: "7d",
    label: "Últimos 7 días",
    dateFrom: () => {
      const d = new Date();
      d.setDate(d.getDate() - 6);
      d.setHours(0, 0, 0, 0);
      return d.toISOString().slice(0, 10);
    },
    dateTo: () => new Date().toISOString().slice(0, 10),
  },
  {
    id: "month",
    label: "Este mes",
    dateFrom: () => {
      const d = new Date();
      d.setDate(1);
      d.setHours(0, 0, 0, 0);
      return d.toISOString().slice(0, 10);
    },
    dateTo: () => new Date().toISOString().slice(0, 10),
  },
  {
    id: "last-month",
    label: "Mes pasado",
    dateFrom: () => {
      const d = new Date();
      d.setMonth(d.getMonth() - 1);
      d.setDate(1);
      d.setHours(0, 0, 0, 0);
      return d.toISOString().slice(0, 10);
    },
    dateTo: () => {
      const d = new Date();
      d.setDate(0); // último día del mes pasado
      return d.toISOString().slice(0, 10);
    },
  },
] as const;

export default function MovementsPage() {
  const { movements } = useAuth();
  const [categoryId, setCategoryId] = useState<string>("");
  const [datePreset, setDatePreset] = useState<string>("all");
  const [showFilters, setShowFilters] = useState(false);

  const filters = useMemo(() => {
    const preset = DATE_PRESETS.find((p) => p.id === datePreset);
    return {
      categoryId: categoryId || undefined,
      dateFrom: preset?.dateFrom && typeof preset.dateFrom === "function" ? preset.dateFrom() : undefined,
      dateTo: preset?.dateTo && typeof preset.dateTo === "function" ? preset.dateTo() : undefined,
    };
  }, [categoryId, datePreset]);

  const filteredMovements = useMemo(
    () => filterMovements(movements, filters),
    [movements, filters]
  );

  return (
    <main className="mx-auto max-w-lg px-4 pt-6 pb-8">
      <Link
        href="/dashboard"
        className="mb-6 inline-flex items-center gap-2 text-sm text-foreground-secondary hover:text-si-primary"
      >
        <ArrowLeft className="size-4" /> Volver
      </Link>

      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-bold">Movimientos</h1>
        <button
          type="button"
          onClick={() => setShowFilters((s) => !s)}
          className={cn(
            "flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-colors",
            showFilters
              ? "border-si-primary bg-si-primary/10 text-si-primary"
              : "border-border bg-surface text-foreground-secondary hover:text-foreground"
          )}
          aria-expanded={showFilters}
        >
          <Filter className="size-4" aria-hidden />
          Filtros
        </button>
      </div>

      {showFilters && (
        <Card className="mb-4 border-border">
          <CardContent className="space-y-4 p-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted">
                Período
              </label>
              <div className="flex flex-wrap gap-2">
                {DATE_PRESETS.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setDatePreset(p.id)}
                    className={cn(
                      "rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
                      datePreset === p.id
                        ? "bg-si-primary text-primary-foreground"
                        : "bg-surface-2 text-foreground-secondary hover:bg-surface-3 hover:text-foreground"
                    )}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label htmlFor="filter-category" className="mb-1.5 block text-xs font-medium text-muted">
                Categoría
              </label>
              <select
                id="filter-category"
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full rounded-xl border border-border bg-surface-2 px-4 py-2.5 text-sm text-foreground focus:border-si-primary focus:outline-none focus:ring-2 focus:ring-si-primary/50"
              >
                <option value="">Todas las categorías</option>
                {MOVEMENT_CATEGORIES.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="p-0">
          {filteredMovements.length === 0 ? (
            <div className="px-4 py-12 text-center text-sm text-muted">
              {movements.length === 0
                ? "Aún no hay movimientos en tu cuenta."
                : "No hay movimientos con los filtros seleccionados."}
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {filteredMovements.map((mov) => {
                const category = getCategoryById(mov.categoryId);
                return (
                  <li key={mov.id}>
                    <Link
                      href={`/dashboard/movements/${mov.id}`}
                      className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-surface-2 active:bg-surface-3"
                    >
                      <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-surface-2">
                        <CategoryIcon category={category} size={22} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-foreground">
                          {mov.label}
                        </p>
                        <p className="text-xs text-muted">
                          {formatMovementDate(mov.date)}
                          {category && ` · ${category.name}`}
                        </p>
                      </div>
                      <span
                        className={cn(
                          "shrink-0 text-sm font-semibold",
                          mov.type === "in" ? "text-success" : "text-foreground"
                        )}
                      >
                        {formatMovementAmount(mov.type, mov.amount)}
                      </span>
                      <ChevronRight className="size-5 shrink-0 text-muted" aria-hidden />
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
