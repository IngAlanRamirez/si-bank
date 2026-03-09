"use client";

import { jsPDF } from "jspdf";
import type { Movement } from "@/lib/types";
import { formatBalance, formatMovementDateLong } from "@/lib/store";
import { getCategoryById } from "@/lib/categories";

export function exportVoucherPdf(movement: Movement): void {
  const category = getCategoryById(movement.categoryId);
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const pageW = doc.getPageWidth();
  const margin = 20;
  let y = 24;

  doc.setFontSize(18);
  doc.setTextColor(57, 255, 20);
  doc.text("Si! Bank", margin, y);
  y += 10;

  doc.setFontSize(14);
  doc.setTextColor(0, 0, 0);
  doc.text("Comprobante", margin, y);
  y += 12;

  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(
    `Generado el ${new Date().toLocaleDateString("es-MX", { dateStyle: "long" })} a las ${new Date().toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" })}`,
    margin,
    y
  );
  y += 14;

  doc.setDrawColor(57, 255, 20);
  doc.setLineWidth(0.5);
  doc.line(margin, y, pageW - margin, y);
  y += 12;

  doc.setFontSize(20);
  doc.setTextColor(57, 255, 20);
  doc.text(
    (movement.type === "in" ? "+" : "-") + formatBalance(movement.amount),
    margin,
    y
  );
  y += 8;

  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  doc.text(movement.label, margin, y);
  y += 6;

  if (category) {
    doc.setFontSize(10);
    doc.setTextColor(120, 120, 120);
    doc.text(category.name, margin, y);
    y += 10;
  } else {
    y += 6;
  }

  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  doc.text("Fecha y hora", margin, y);
  doc.text(formatMovementDateLong(movement.date), pageW - margin - 60, y, { align: "right" });
  y += 6;

  doc.text("Folio", margin, y);
  doc.text(movement.id.slice(0, 8).toUpperCase(), pageW - margin - 30, y, { align: "right" });
  y += 6;

  if (movement.description) {
    doc.text("Detalle", margin, y);
    y += 5;
    doc.setFontSize(9);
    doc.setTextColor(80, 80, 80);
    const lines = doc.splitTextToSize(movement.description, pageW - 2 * margin);
    doc.text(lines, margin, y);
  }

  doc.save(`SiBank-Comprobante-${movement.id.slice(0, 8)}.pdf`);
}
