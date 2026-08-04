import type { Discount, LineItem } from "./types";

/** Flat GST applied to the taxable value of every quotation. */
export const GST_RATE = 18;

/** "add" puts GST on top of the taxable value; "included" treats entered prices as GST-inclusive. */
export type GstMode = "add" | "included";

export interface Totals {
  subtotal: number;
  discountAmt: number;
  taxable: number;
  gst: number;
  gross: number;
  roundOff: number;
  grandTotal: number;
}

export function lineAmount(item: LineItem): number {
  return round2((item.qty || 0) * (item.rate || 0));
}

export function computeTotals(
  items: LineItem[],
  discount: Discount,
  gstMode: GstMode = "add"
): Totals {
  const subtotal = round2(items.reduce((s, it) => s + lineAmount(it), 0));

  let discountAmt =
    discount.type === "pct"
      ? round2((subtotal * (discount.value || 0)) / 100)
      : round2(discount.value || 0);
  discountAmt = Math.min(discountAmt, subtotal);

  const taxable = round2(subtotal - discountAmt);

  // "included": nothing is added — gst is the amount already contained in the price
  const gst =
    gstMode === "included"
      ? round2((taxable * GST_RATE) / (100 + GST_RATE))
      : round2((taxable * GST_RATE) / 100);

  const gross = gstMode === "included" ? taxable : round2(taxable + gst);
  const grandTotal = Math.round(gross);
  const roundOff = round2(grandTotal - gross);

  return { subtotal, discountAmt, taxable, gst, gross, roundOff, grandTotal };
}

function round2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

const inr = new Intl.NumberFormat("en-IN", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const inrWhole = new Intl.NumberFormat("en-IN", {
  maximumFractionDigits: 0,
});

export function fmtMoney(n: number): string {
  return inr.format(n || 0);
}

export function fmtMoneyWhole(n: number): string {
  return inrWhole.format(n || 0);
}
