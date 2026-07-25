"use client";

import type { Discount, LineItem } from "@/lib/types";
import { computeTotals, fmtMoney, GST_RATE } from "@/lib/calc";
import { amountInWords } from "@/lib/amount-in-words";
import { AnimatedNumber } from "@/components/neu/AnimatedNumber";
import { NeuInput } from "@/components/neu/NeuInput";

interface TotalsPanelProps {
  items: LineItem[];
  discount: Discount;
  onDiscountChange: (d: Discount) => void;
}

export function TotalsPanel({
  items,
  discount,
  onDiscountChange,
}: TotalsPanelProps) {
  const t = computeTotals(items, discount);

  return (
    <div className="flex flex-col gap-3">
      <Line label="Subtotal" value={fmtMoney(t.subtotal)} />

      <div className="flex items-center justify-between gap-3">
        <span className="text-sm text-ink-soft">Discount</span>
        <div className="flex items-center gap-2">
          <div className="neu-inset-sm flex rounded-lg p-0.5">
            {(["flat", "pct"] as const).map((ty) => (
              <button
                key={ty}
                type="button"
                onClick={() => onDiscountChange({ ...discount, type: ty })}
                className={`rounded-md px-2 py-1 text-xs font-bold transition-all ${
                  discount.type === ty
                    ? "neu-raised-xs text-gold"
                    : "text-ink-soft"
                }`}
              >
                {ty === "flat" ? "₹" : "%"}
              </button>
            ))}
          </div>
          <NeuInput
            type="number"
            min={0}
            className="w-24 text-right tabular-nums"
            value={discount.value === 0 ? "" : discount.value}
            placeholder="0"
            onChange={(e) =>
              onDiscountChange({
                ...discount,
                value: Number(e.target.value) || 0,
              })
            }
          />
        </div>
      </div>

      {t.discountAmt > 0 && (
        <Line label="Taxable Value" value={fmtMoney(t.taxable)} />
      )}

      <Line label={`GST (${GST_RATE}%)`} value={fmtMoney(t.gst)} />

      {t.roundOff !== 0 && (
        <Line
          label="Round Off"
          value={`${t.roundOff > 0 ? "+" : "−"}${fmtMoney(Math.abs(t.roundOff))}`}
        />
      )}

      <div className="neu-pressed mt-1 flex items-center justify-between rounded-2xl px-4 py-3.5">
        <span className="text-sm font-black uppercase tracking-wider text-teal">
          Grand Total
        </span>
        <span className="text-2xl font-black text-teal">
          ₹<AnimatedNumber value={t.grandTotal} format={fmtMoney} />
        </span>
      </div>

      <p className="px-1 text-xs italic leading-relaxed text-ink-soft">
        {t.grandTotal > 0 ? amountInWords(t.grandTotal) : " "}
      </p>
    </div>
  );
}

function Line({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-ink-soft">{label}</span>
      <span className="text-sm font-semibold tabular-nums text-ink">
        ₹{value}
      </span>
    </div>
  );
}
