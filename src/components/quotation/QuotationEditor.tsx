"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import {
  ArrowLeft,
  Printer,
  Copy,
  Trash2,
  Check,
  CloudUpload,
} from "lucide-react";
import {
  useStore,
  getSettings,
  getQuotation,
  addQuotation,
  putQuotation,
  deleteQuotation,
  listCustomers,
  addCustomer,
  putCustomer,
} from "@/lib/store";
import type { Quotation, QuotationStatus } from "@/lib/types";
import { nextRefNo, todayISO } from "@/lib/ref-number";
import { NeuButton } from "@/components/neu/NeuButton";
import { NeuCard } from "@/components/neu/NeuCard";
import { NeuInput, NeuSelect, NeuTextarea, Field } from "@/components/neu/NeuInput";
import { CustomerPicker } from "./CustomerPicker";
import { EditorSkeleton } from "./EditorSkeleton";
import { LineItemsTable, newLineItem } from "./LineItemsTable";
import { TotalsPanel } from "./TotalsPanel";
import { ToggleRow } from "./ToggleRow";

export function QuotationEditor({ id }: { id?: number }) {
  const router = useRouter();
  const [quotation, setQuotation] = useState<Quotation | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved">("idle");
  const appSettings = useStore(() => getSettings(), []);

  const idRef = useRef<number | undefined>(id);
  const dirtyRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (id !== undefined) {
        const existing = await getQuotation(id);
        if (cancelled) return;
        if (!existing) {
          setNotFound(true);
          return;
        }
        setQuotation(existing);
      } else {
        const settings = await getSettings();
        const refNo = await nextRefNo(settings);
        if (cancelled) return;
        setQuotation({
          refNo,
          date: todayISO(),
          validityDays: settings.defaultValidityDays,
          status: "draft",
          addressee: "customer",
          customer: { name: "", phone: "", address: "", gstin: "" },
          items: [newLineItem()],
          discount: { type: "flat", value: 0 },
          gstMode: "included",
          notes: "",
          terms: settings.defaultTerms,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        });
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const persist = useCallback(async (q: Quotation) => {
    setSaveState("saving");
    const record = { ...q, updatedAt: Date.now() };
    if (idRef.current === undefined) {
      const newId = await addQuotation(record);
      idRef.current = newId;
      window.history.replaceState(null, "", `/quotations/${newId}`);
    } else {
      await putQuotation({ ...record, id: idRef.current });
    }
    // Auto-save new customers into the directory once they have a name + phone/address
    const c = record.customer;
    if (record.addressee !== "twimc" && c.name.trim()) {
      const all = await listCustomers();
      const existing = all.find(
        (x) => x.name.toLowerCase() === c.name.trim().toLowerCase()
      );
      if (!existing) {
        await addCustomer({ ...c, name: c.name.trim(), createdAt: Date.now() });
      } else {
        await putCustomer({
          ...existing,
          phone: c.phone || existing.phone,
          address: c.address || existing.address,
          gstin: c.gstin || existing.gstin,
        });
      }
    }
    dirtyRef.current = false;
    setSaveState("saved");
  }, []);

  const change = useCallback(
    (patch: Partial<Quotation>) => {
      setQuotation((prev) => {
        if (!prev) return prev;
        const next = { ...prev, ...patch };
        dirtyRef.current = true;
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => persist(next), 900);
        return next;
      });
    },
    [persist]
  );

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const printNow = async () => {
    if (!quotation) return;
    if (timerRef.current) clearTimeout(timerRef.current);
    await persist(quotation);
    router.push(`/print/${idRef.current}`);
  };

  const duplicate = async () => {
    if (!quotation) return;
    const refNo = await nextRefNo();
    const copy: Quotation = {
      ...quotation,
      refNo,
      date: todayISO(),
      status: "draft",
      items: quotation.items.map((it) => ({ ...it, id: crypto.randomUUID() })),
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    delete copy.id;
    const newId = await addQuotation(copy);
    router.push(`/quotations/${newId}`);
  };

  const remove = async () => {
    if (idRef.current === undefined) {
      router.push("/quotations");
      return;
    }
    if (!confirm("Delete this quotation? This cannot be undone.")) return;
    await deleteQuotation(idRef.current);
    router.push("/quotations");
  };

  if (notFound) {
    return (
      <div className="flex flex-col items-center gap-4 py-24">
        <p className="text-ink-soft">Quotation not found.</p>
        <Link href="/quotations">
          <NeuButton>Back to Quotations</NeuButton>
        </Link>
      </div>
    );
  }

  if (!quotation) return <EditorSkeleton />;

  return (
    <div className="mx-auto max-w-5xl">
      {/* Top bar */}
      <div className="mb-8 flex flex-wrap items-center gap-3 sm:gap-4">
        <Link
          href="/quotations"
          className="neu-flat rounded-xl p-2.5 text-teal transition-transform hover:scale-105"
          aria-label="Back"
        >
          <ArrowLeft size={17} />
        </Link>
        <div>
          <h1 className="text-xl font-black tracking-wide text-teal">
            {id !== undefined ? "Edit Quotation" : "New Quotation"}
          </h1>
          <SaveIndicator state={saveState} />
        </div>
        <div className="ml-auto flex items-center gap-2.5">
          {idRef.current !== undefined && (
            <>
              <NeuButton size="sm" onClick={duplicate} title="Duplicate">
                <Copy size={13} /> Duplicate
              </NeuButton>
              <NeuButton size="sm" variant="danger" onClick={remove} title="Delete">
                <Trash2 size={13} />
              </NeuButton>
            </>
          )}
          <NeuButton variant="gold" size="md" onClick={printNow}>
            <Printer size={15} /> Print / PDF
          </NeuButton>
        </div>
      </div>

      {/* Meta */}
      <NeuCard className="mb-6 p-6">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <Field label="Ref No.">
            <NeuInput
              value={quotation.refNo}
              onChange={(e) => change({ refNo: e.target.value })}
            />
          </Field>
          <Field label="Date">
            <NeuInput
              type="date"
              value={quotation.date}
              onChange={(e) => change({ date: e.target.value })}
            />
          </Field>
          <Field label="Valid For (days)">
            <NeuInput
              type="number"
              min={1}
              value={quotation.validityDays}
              onChange={(e) =>
                change({ validityDays: Number(e.target.value) || 0 })
              }
            />
          </Field>
          <Field label="Status">
            <NeuSelect
              value={quotation.status}
              onChange={(e) =>
                change({ status: e.target.value as QuotationStatus })
              }
            >
              <option value="draft">Draft</option>
              <option value="sent">Sent</option>
              <option value="accepted">Accepted</option>
              <option value="rejected">Rejected</option>
            </NeuSelect>
          </Field>
        </div>
      </NeuCard>

      {/* Customer */}
      <NeuCard className="mb-6 p-5 sm:p-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xs font-black uppercase tracking-[0.18em] text-gold">
            Addressed To
          </h2>
          <div className="neu-inset-sm flex rounded-lg p-0.5">
            <button
              type="button"
              onClick={() => change({ addressee: "customer" })}
              className={`rounded-md px-3 py-1.5 text-xs font-bold transition-all ${
                quotation.addressee !== "twimc"
                  ? "neu-raised-xs text-gold"
                  : "text-ink-soft"
              }`}
            >
              Customer
            </button>
            <button
              type="button"
              onClick={() => change({ addressee: "twimc" })}
              className={`rounded-md px-3 py-1.5 text-xs font-bold transition-all ${
                quotation.addressee === "twimc"
                  ? "neu-raised-xs text-gold"
                  : "text-ink-soft"
              }`}
            >
              To Whom It May Concern
            </button>
          </div>
        </div>
        <AnimatePresence initial={false} mode="wait">
          {quotation.addressee === "twimc" ? (
            <motion.p
              key="twimc"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden text-sm text-ink-soft"
            >
              The quotation will be addressed to{" "}
              <span className="font-semibold text-teal">
                &ldquo;To Whom It May Concern&rdquo;
              </span>{" "}
              — no customer details needed. All fields below are optional
              anyway; fill only what you want printed.
            </motion.p>
          ) : (
            <motion.div
              key="customer"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <CustomerPicker
                value={quotation.customer}
                onChange={(customer) => change({ customer })}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </NeuCard>

      {/* Items */}
      <NeuCard className="mb-6 p-6">
        <h2 className="mb-4 text-xs font-black uppercase tracking-[0.18em] text-gold">
          Line Items
        </h2>
        <LineItemsTable
          items={quotation.items}
          onChange={(items) => change({ items })}
          customColumns={quotation.customColumns ?? []}
          onColumnsChange={(customColumns) => change({ customColumns })}
        />
      </NeuCard>

      {/* Totals + notes */}
      <div className="mb-6 grid gap-6 lg:grid-cols-2">
        <NeuCard className="p-6">
          <h2 className="mb-4 text-xs font-black uppercase tracking-[0.18em] text-gold">
            Notes &amp; Terms
          </h2>
          <Field label="Notes (shown on quotation)" className="mb-4">
            <NeuTextarea
              rows={2}
              placeholder="Anything specific to this quote…"
              value={quotation.notes}
              onChange={(e) => change({ notes: e.target.value })}
            />
          </Field>
          <Field label="Terms & Conditions" className="mb-5">
            <NeuTextarea
              rows={6}
              value={quotation.terms}
              onChange={(e) => change({ terms: e.target.value })}
            />
          </Field>

          <h2 className="mb-3 text-xs font-black uppercase tracking-[0.18em] text-gold">
            Printed on this Quote
          </h2>
          <div className="flex flex-col gap-3">
            <ToggleRow
              label="Bank / payment details"
              on={quotation.showBankDetails !== false}
              onChange={(v) => change({ showBankDetails: v })}
              missing={!appSettings?.bankDetails?.trim()}
              missingHint="not added yet — set it once in Settings"
            />
            <ToggleRow
              label="Signature / stamp image"
              on={quotation.showSignature !== false}
              onChange={(v) => change({ showSignature: v })}
              missing={!appSettings?.signatureImage}
              missingHint="no image yet — upload it once in Settings"
            />
          </div>
        </NeuCard>

        <NeuCard className="p-6">
          <h2 className="mb-4 text-xs font-black uppercase tracking-[0.18em] text-gold">
            Totals
          </h2>
          <TotalsPanel
            items={quotation.items}
            discount={quotation.discount}
            gstMode={quotation.gstMode ?? "add"}
            onDiscountChange={(discount) => change({ discount })}
            onGstModeChange={(gstMode) => change({ gstMode })}
          />
        </NeuCard>
      </div>
    </div>
  );
}

function SaveIndicator({ state }: { state: "idle" | "saving" | "saved" }) {
  return (
    <div className="h-4 text-[11px] font-semibold text-ink-soft">
      <AnimatePresence mode="wait">
        {state === "saving" && (
          <motion.span
            key="saving"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-1"
          >
            <CloudUpload size={11} /> Saving…
          </motion.span>
        )}
        {state === "saved" && (
          <motion.span
            key="saved"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-1 text-emerald-700 dark:text-emerald-400"
          >
            <Check size={11} /> Saved
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  );
}
