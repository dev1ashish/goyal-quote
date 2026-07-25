"use client";

import type { QuotationStatus } from "@/lib/types";

export const STATUS_META: Record<
  QuotationStatus,
  { label: string; dot: string; text: string }
> = {
  draft: { label: "Draft", dot: "bg-ink-soft", text: "text-ink-soft" },
  sent: { label: "Sent", dot: "bg-gold", text: "text-gold" },
  accepted: {
    label: "Accepted",
    dot: "bg-emerald-700 dark:bg-emerald-400",
    text: "text-emerald-700 dark:text-emerald-400",
  },
  rejected: {
    label: "Rejected",
    dot: "bg-red-700 dark:bg-red-400",
    text: "text-red-700 dark:text-red-400",
  },
};

export function StatusChip({ status }: { status: QuotationStatus }) {
  const meta = STATUS_META[status];
  return (
    <span
      className={`neu-inset-sm inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wider ${meta.text}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
      {meta.label}
    </span>
  );
}
