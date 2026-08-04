"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { Search, Printer, Copy, Trash2, Plus, FileText } from "lucide-react";
import {
  useStore,
  listQuotations,
  addQuotation,
  deleteQuotation,
} from "@/lib/store";
import type { Quotation } from "@/lib/types";
import { computeTotals, fmtMoney } from "@/lib/calc";
import { fmtDate, nextRefNo, todayISO } from "@/lib/ref-number";
import { StatusChip } from "@/components/neu/StatusChip";
import { NeuButton } from "@/components/neu/NeuButton";

export default function QuotationsPage() {
  const [query, setQuery] = useState("");
  const router = useRouter();

  const quotations = useStore(async () => {
    const all = await listQuotations();
    const q = query.trim().toLowerCase();
    if (!q) return all;
    return all.filter(
      (x) =>
        x.refNo.toLowerCase().includes(q) ||
        x.customer.name.toLowerCase().includes(q)
    );
  }, [query]);

  const duplicate = async (q: Quotation) => {
    const refNo = await nextRefNo();
    const copy: Quotation = {
      ...q,
      refNo,
      date: todayISO(),
      status: "draft",
      items: q.items.map((it) => ({ ...it, id: crypto.randomUUID() })),
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    delete copy.id;
    const newId = await addQuotation(copy);
    router.push(`/quotations/${newId}`);
  };

  const remove = async (q: Quotation) => {
    if (!confirm(`Delete quotation ${q.refNo}? This cannot be undone.`)) return;
    await deleteQuotation(q.id!);
  };

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-8 flex flex-wrap items-center gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-wide text-teal">
            Quotations
          </h1>
          <p className="mt-0.5 text-sm text-ink-soft">
            {quotations?.length ?? 0} quotation
            {(quotations?.length ?? 0) === 1 ? "" : "s"}
          </p>
        </div>
        <div className="ml-auto flex flex-wrap items-center gap-3">
          <div className="neu-inset-sm flex items-center gap-2 rounded-xl px-3.5 py-2.5">
            <Search size={15} className="text-ink-soft" />
            <input
              className="w-52 bg-transparent text-sm placeholder:text-ink-soft/60"
              placeholder="Search ref no. or customer…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <Link href="/quotations/new">
            <NeuButton variant="gold" tabIndex={-1}>
              <Plus size={15} strokeWidth={3} /> New
            </NeuButton>
          </Link>
        </div>
      </div>

      {quotations && quotations.length === 0 && (
        <div className="neu-inset mx-auto flex max-w-md flex-col items-center gap-3 rounded-3xl py-16 text-center">
          <FileText size={32} className="text-gold" />
          <p className="font-semibold text-teal">
            {query ? "No matches found" : "No quotations yet"}
          </p>
          <p className="text-sm text-ink-soft">
            {query
              ? "Try a different search."
              : "Create your first quotation to get started."}
          </p>
        </div>
      )}

      <ul className="flex flex-col gap-4">
        <AnimatePresence initial={false}>
          {quotations?.map((q) => {
            const total = computeTotals(q.items, q.discount, q.gstMode ?? "add").grandTotal;
            return (
              <motion.li
                key={q.id}
                layout
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={{ type: "spring", stiffness: 300, damping: 28 }}
              >
                <Link
                  href={`/quotations/${q.id}`}
                  className="neu-raised group flex flex-wrap items-center gap-x-5 gap-y-2 rounded-3xl px-5 py-4 transition-transform hover:-translate-y-0.5 sm:px-6 sm:py-5"
                >
                  <div className="min-w-36">
                    <div className="font-mono text-xs font-bold text-gold">
                      {q.refNo}
                    </div>
                    <div className="mt-0.5 text-xs text-ink-soft">
                      {fmtDate(q.date)}
                    </div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-bold text-teal">
                      {q.customer.name || "—"}
                    </div>
                    <div className="text-xs text-ink-soft">
                      {q.items.length} item{q.items.length === 1 ? "" : "s"}
                    </div>
                  </div>
                  <StatusChip status={q.status} />
                  <div className="w-32 text-right text-lg font-black tabular-nums text-teal">
                    ₹{fmtMoney(total)}
                  </div>
                  <div
                    className="flex items-center gap-1 transition-opacity lg:opacity-0 lg:group-hover:opacity-100"
                    onClick={(e) => e.preventDefault()}
                  >
                    <IconBtn
                      title="Print / PDF"
                      onClick={() => router.push(`/print/${q.id}`)}
                    >
                      <Printer size={15} />
                    </IconBtn>
                    <IconBtn title="Duplicate" onClick={() => duplicate(q)}>
                      <Copy size={15} />
                    </IconBtn>
                    <IconBtn title="Delete" danger onClick={() => remove(q)}>
                      <Trash2 size={15} />
                    </IconBtn>
                  </div>
                </Link>
              </motion.li>
            );
          })}
        </AnimatePresence>
      </ul>
    </div>
  );
}

function IconBtn({
  children,
  title,
  danger = false,
  onClick,
}: {
  children: React.ReactNode;
  title: string;
  danger?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className={`rounded-xl p-2 transition-colors ${
        danger
          ? "text-ink-soft/60 hover:text-red-700"
          : "text-ink-soft/60 hover:text-teal"
      }`}
    >
      {children}
    </button>
  );
}
