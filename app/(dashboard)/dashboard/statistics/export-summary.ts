"use client";

import { jsPDF } from "jspdf";
import type { Movement } from "@/lib/types";
import type { CategorySummary, MonthlySummary } from "@/lib/store";
import { formatBalance, formatMovementDate } from "@/lib/store";

type ExportParams = {
  balance: number;
  movements: Movement[];
  byCategory: CategorySummary[];
  monthly: MonthlySummary[];
};

export function exportSummaryPdf(params: ExportParams): void {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const pageW = doc.getPageWidth();
  const margin = 20;
  let y = 20;

  doc.setFontSize(18);
  doc.setTextColor(57, 255, 20); // si-primary
  doc.text("Si! Bank", margin, y);
  y += 8;

  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  doc.text("Resumen de cuenta", margin, y);
  y += 10;

  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(
    `Generado el ${new Date().toLocaleDateString("es-MX", { dateStyle: "long" })}`,
    margin,
    y
  );
  y += 12;

  doc.setFontSize(11);
  doc.setTextColor(0, 0, 0);
  doc.text("Saldo disponible", margin, y);
  doc.text(formatBalance(params.balance), pageW - margin - 40, y, { align: "right" });
  y += 15;

  if (params.movements.length > 0) {
    doc.setFontSize(11);
    doc.text("Últimos movimientos", margin, y);
    y += 8;

    const colW = (pageW - 2 * margin) / 4;
    doc.setFontSize(9);
    doc.setTextColor(120, 120, 120);
    doc.text("Fecha", margin, y);
    doc.text("Concepto", margin + colW, y);
    doc.text("Tipo", margin + colW * 2, y);
    doc.text("Monto", margin + colW * 3, y);
    y += 6;

    doc.setDrawColor(220, 220, 220);
    doc.line(margin, y, pageW - margin, y);
    y += 5;

    doc.setTextColor(0, 0, 0);
    for (const m of params.movements.slice(0, 12)) {
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
      doc.setFontSize(8);
      doc.text(formatMovementDate(m.date), margin, y);
      doc.text(m.label.slice(0, 22), margin + colW, y);
      doc.text(m.type === "in" ? "Ingreso" : "Gasto", margin + colW * 2, y);
      doc.text(
        (m.type === "in" ? "+" : "-") + formatBalance(m.amount),
        margin + colW * 3,
        y,
        { align: "right" }
      );
      y += 6;
    }
    y += 10;
  }

  if (params.byCategory.length > 0 && y < 240) {
    doc.setFontSize(11);
    doc.text("Gastos por categoría", margin, y);
    y += 6;
    doc.setFontSize(9);
    for (const c of params.byCategory.slice(0, 8)) {
      doc.text(c.name, margin, y);
      doc.text(formatBalance(c.totalCents), pageW - margin - 35, y, { align: "right" });
      y += 5;
    }
    y += 5;
  }

  doc.save(`SiBank-Resumen-${new Date().toISOString().slice(0, 10)}.pdf`);
}
