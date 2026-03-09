"use client";

import { useMemo } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { useAuth } from "@/providers/AuthProvider";
import {
  getExpensesByCategory,
  getMonthlyEvolution,
  formatBalance,
} from "@/lib/store";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { ArrowLeft, Download, Share2 } from "lucide-react";
import { exportSummaryPdf } from "./export-summary";

const CHART_COLORS = [
  "#39ff14", // si-primary
  "#00e5ff", // si-secondary
  "#ff5252", // danger
  "#ffc107", // warning
  "#00e676", // success
  "#29b6f6", // info
  "#b3ff00", // accent
  "#b0b0b0",
  "#707070",
];

export default function StatisticsPage() {
  const { account, movements } = useAuth();

  const byCategory = useMemo(() => getExpensesByCategory(movements), [movements]);
  const monthly = useMemo(() => getMonthlyEvolution(movements), [movements]);

  const pieData = useMemo(
    () =>
      byCategory.map((c) => ({
        name: c.name,
        value: c.totalCents / 100,
      })),
    [byCategory]
  );

  const barData = useMemo(
    () =>
      monthly.map((m) => ({
        mes: m.label,
        Ingresos: m.incomeCents / 100,
        Gastos: m.expenseCents / 100,
      })),
    [monthly]
  );

  async function handleShare() {
    const balance = account ? formatBalance(account.balance) : "—";
    const totalIn = movements
      .filter((m) => m.type === "in")
      .reduce((s, m) => s + m.amount, 0);
    const totalOut = movements
      .filter((m) => m.type === "out")
      .reduce((s, m) => s + m.amount, 0);
    const text = [
      "Resumen Si! Bank",
      `Saldo: ${balance}`,
      `Ingresos totales: ${formatBalance(totalIn)}`,
      `Gastos totales: ${formatBalance(totalOut)}`,
      `Movimientos: ${movements.length}`,
    ].join("\n");

    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: "Resumen Si! Bank",
          text,
        });
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          await navigator.clipboard?.writeText(text);
        }
      }
    } else {
      await navigator.clipboard?.writeText(text);
    }
  }

  function handleDownloadPdf() {
    exportSummaryPdf({
      balance: account?.balance ?? 0,
      movements: movements.slice(0, 15),
      byCategory,
      monthly,
    });
  }

  return (
    <main className="mx-auto max-w-lg px-4 pt-6 pb-8">
      <Link
        href="/dashboard"
        className="mb-6 inline-flex items-center gap-2 text-sm text-foreground-secondary hover:text-si-primary"
      >
        <ArrowLeft className="size-4" /> Volver
      </Link>

      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-bold">Estadísticas</h1>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleShare}
            className="flex items-center gap-2 rounded-xl border border-border bg-surface px-3 py-2 text-sm font-medium text-foreground-secondary transition-colors hover:bg-surface-2 hover:text-foreground"
          >
            <Share2 className="size-4" aria-hidden />
            Compartir
          </button>
          <button
            type="button"
            onClick={handleDownloadPdf}
            className="flex items-center gap-2 rounded-xl border border-si-primary bg-si-primary/10 px-3 py-2 text-sm font-medium text-si-primary transition-colors hover:bg-si-primary/20"
          >
            <Download className="size-4" aria-hidden />
            PDF
          </button>
        </div>
      </div>

      {movements.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-foreground-secondary">
              Aún no hay movimientos para mostrar estadísticas.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {pieData.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Gastos por categoría</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={2}
                        dataKey="value"
                        nameKey="name"
                        label={({ name, percent }) =>
                          `${name} ${(percent * 100).toFixed(0)}%`
                        }
                      >
                        {pieData.map((_, i) => (
                          <Cell
                            key={i}
                            fill={CHART_COLORS[i % CHART_COLORS.length]}
                            stroke="transparent"
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value: number) => formatBalance(value * 100)}
                        contentStyle={{
                          backgroundColor: "#121212",
                          border: "1px solid #2c2c2c",
                          borderRadius: "8px",
                        }}
                        labelStyle={{ color: "#b0b0b0" }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          )}

          {barData.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Evolución mensual</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={barData} margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
                      <XAxis
                        dataKey="mes"
                        tick={{ fill: "#b0b0b0", fontSize: 11 }}
                        axisLine={{ stroke: "#2c2c2c" }}
                      />
                      <YAxis
                        tick={{ fill: "#b0b0b0", fontSize: 11 }}
                        axisLine={{ stroke: "#2c2c2c" }}
                        tickFormatter={(v) => `$${v}`}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#121212",
                          border: "1px solid #2c2c2c",
                          borderRadius: "8px",
                        }}
                        formatter={(value: number) => [formatBalance(value * 100), ""]}
                        labelStyle={{ color: "#b0b0b0" }}
                      />
                      <Legend
                        wrapperStyle={{ fontSize: 12 }}
                        formatter={(value) => (
                          <span className="text-foreground-secondary">{value}</span>
                        )}
                      />
                      <Bar
                        dataKey="Ingresos"
                        fill="#00e676"
                        radius={[4, 4, 0, 0]}
                        name="Ingresos"
                      />
                      <Bar
                        dataKey="Gastos"
                        fill="#ff5252"
                        radius={[4, 4, 0, 0]}
                        name="Gastos"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </main>
  );
}
