"use client";

import Link from "next/link";
import { motion } from "motion/react";

export function ToggleRow({
  label,
  on,
  onChange,
  missing = false,
  missingHint = "",
}: {
  label: string;
  on: boolean;
  onChange: (v: boolean) => void;
  missing?: boolean;
  missingHint?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-sm text-ink">
        {label}
        {missing && (
          <Link
            href="/settings"
            className="ml-2 text-xs font-semibold text-gold underline decoration-dotted underline-offset-2"
          >
            ({missingHint})
          </Link>
        )}
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={on}
        onClick={() => onChange(!on)}
        className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
          on ? "bg-gold" : "neu-inset-sm"
        }`}
      >
        <motion.span
          layout
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-surface-hi shadow-md ${
            on ? "left-[22px]" : "left-0.5"
          }`}
        />
      </button>
    </div>
  );
}
