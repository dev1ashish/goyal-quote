"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { UserRound } from "lucide-react";
import { useStore, listCustomers } from "@/lib/store";
import type { CustomerInfo } from "@/lib/types";
import { NeuInput, NeuTextarea, Field } from "@/components/neu/NeuInput";

interface CustomerPickerProps {
  value: CustomerInfo;
  onChange: (c: CustomerInfo) => void;
}

export function CustomerPicker({ value, onChange }: CustomerPickerProps) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  const allCustomers = useStore(() => listCustomers(), []);
  const q = value.name.trim().toLowerCase();
  const matches = q
    ? (allCustomers ?? [])
        .filter((c) => c.name.toLowerCase().includes(q))
        .slice(0, 6)
    : [];

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  return (
    <div className="grid grid-cols-2 gap-4">
      <div ref={wrapRef} className="relative col-span-2 sm:col-span-1">
        <Field label="Customer Name">
          <NeuInput
            value={value.name}
            placeholder="Start typing to search…"
            onChange={(e) => {
              onChange({ ...value, name: e.target.value });
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
          />
        </Field>
        <AnimatePresence>
          {open && matches && matches.length > 0 && (
            <motion.ul
              initial={{ opacity: 0, y: -6, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.98 }}
              transition={{ duration: 0.15 }}
              className="neu-raised absolute z-30 mt-2 w-full overflow-hidden rounded-2xl py-1.5"
            >
              {matches.map((c) => (
                <li key={c.id}>
                  <button
                    type="button"
                    className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm hover:bg-surface-lo/60"
                    onClick={() => {
                      onChange({
                        name: c.name,
                        phone: c.phone,
                        address: c.address,
                        gstin: c.gstin,
                      });
                      setOpen(false);
                    }}
                  >
                    <UserRound size={14} className="shrink-0 text-gold" />
                    <span className="font-semibold text-teal">{c.name}</span>
                    {c.phone && (
                      <span className="ml-auto text-xs text-ink-soft">
                        {c.phone}
                      </span>
                    )}
                  </button>
                </li>
              ))}
            </motion.ul>
          )}
        </AnimatePresence>
      </div>

      <Field label="Phone" className="col-span-2 sm:col-span-1">
        <NeuInput
          value={value.phone}
          placeholder="Mobile number"
          onChange={(e) => onChange({ ...value, phone: e.target.value })}
        />
      </Field>

      <Field label="Address" className="col-span-2 sm:col-span-1">
        <NeuTextarea
          rows={2}
          value={value.address}
          placeholder="Billing address"
          onChange={(e) => onChange({ ...value, address: e.target.value })}
        />
      </Field>

      <Field label="Customer GSTIN (optional)" className="col-span-2 sm:col-span-1">
        <NeuInput
          value={value.gstin}
          placeholder="e.g. 05XXXXXXXXXXXXX"
          onChange={(e) =>
            onChange({ ...value, gstin: e.target.value.toUpperCase() })
          }
        />
      </Field>
    </div>
  );
}
