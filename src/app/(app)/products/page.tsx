"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Search, Trash2, Plus, Package, Pencil, X, Check } from "lucide-react";
import {
  useStore,
  listProducts,
  addProduct,
  putProduct,
  deleteProduct,
} from "@/lib/store";
import type { Product } from "@/lib/types";
import { UNITS } from "@/lib/types";
import { fmtMoney } from "@/lib/calc";
import { NeuButton } from "@/components/neu/NeuButton";
import { NeuCard } from "@/components/neu/NeuCard";
import { NeuInput, NeuSelect, Field } from "@/components/neu/NeuInput";

const EMPTY = { name: "", hsn: "", rate: 0, unit: "Pcs" };

export default function ProductsPage() {
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState(EMPTY);
  const [formOpen, setFormOpen] = useState(false);

  const products = useStore(async () => {
    const all = await listProducts();
    const q = query.trim().toLowerCase();
    if (!q) return all;
    return all.filter(
      (p) => p.name.toLowerCase().includes(q) || p.hsn.includes(q)
    );
  }, [query]);

  const openNew = () => {
    setEditing(null);
    setForm(EMPTY);
    setFormOpen(true);
  };

  const openEdit = (p: Product) => {
    setEditing(p);
    setForm({ name: p.name, hsn: p.hsn, rate: p.rate, unit: p.unit });
    setFormOpen(true);
  };

  const save = async () => {
    if (!form.name.trim()) return;
    if (editing) {
      await putProduct({ ...editing, ...form, name: form.name.trim() });
    } else {
      await addProduct({
        ...form,
        name: form.name.trim(),
        createdAt: Date.now(),
      });
    }
    setFormOpen(false);
  };

  const remove = async (p: Product) => {
    if (!confirm(`Delete product "${p.name}"?`)) return;
    await deleteProduct(p.id!);
  };

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-8 flex flex-wrap items-center gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-wide text-teal">
            Products
          </h1>
          <p className="mt-0.5 text-sm text-ink-soft">
            {products?.length ?? 0} in catalog — these autofill line items as
            you type
          </p>
        </div>
        <div className="ml-auto flex flex-wrap items-center gap-3">
          <div className="neu-inset-sm flex items-center gap-2 rounded-xl px-3.5 py-2.5">
            <Search size={15} className="text-ink-soft" />
            <input
              className="w-44 bg-transparent text-sm placeholder:text-ink-soft/60"
              placeholder="Search name or HSN…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <NeuButton variant="gold" onClick={openNew}>
            <Plus size={15} strokeWidth={3} /> Add Product
          </NeuButton>
        </div>
      </div>

      <AnimatePresence>
        {formOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <NeuCard className="mb-6 p-6">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xs font-black uppercase tracking-[0.18em] text-gold">
                  {editing ? `Edit — ${editing.name}` : "New Product"}
                </h2>
                <button
                  onClick={() => setFormOpen(false)}
                  className="text-ink-soft hover:text-teal"
                >
                  <X size={16} />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                <Field label="Product Name" className="col-span-2">
                  <NeuInput
                    value={form.name}
                    placeholder="e.g. Logitech K120 Keyboard"
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    autoFocus
                  />
                </Field>
                <Field label="HSN Code">
                  <NeuInput
                    value={form.hsn}
                    placeholder="8471"
                    onChange={(e) => setForm({ ...form, hsn: e.target.value })}
                  />
                </Field>
                <Field label="Unit">
                  <NeuSelect
                    value={form.unit}
                    onChange={(e) => setForm({ ...form, unit: e.target.value })}
                  >
                    {UNITS.map((u) => (
                      <option key={u}>{u}</option>
                    ))}
                  </NeuSelect>
                </Field>
                <Field label="Default Rate (₹)">
                  <NeuInput
                    type="number"
                    min={0}
                    step="0.01"
                    value={form.rate === 0 ? "" : form.rate}
                    placeholder="0.00"
                    onChange={(e) =>
                      setForm({ ...form, rate: Number(e.target.value) || 0 })
                    }
                  />
                </Field>
              </div>
              <div className="mt-5 flex justify-end gap-3">
                <NeuButton size="sm" onClick={() => setFormOpen(false)}>
                  Cancel
                </NeuButton>
                <NeuButton
                  size="sm"
                  variant="primary"
                  onClick={save}
                  disabled={!form.name.trim()}
                >
                  <Check size={13} /> Save
                </NeuButton>
              </div>
            </NeuCard>
          </motion.div>
        )}
      </AnimatePresence>

      {products && products.length === 0 && !formOpen && (
        <div className="neu-inset mx-auto flex max-w-md flex-col items-center gap-3 rounded-3xl py-16 text-center">
          <Package size={32} className="text-gold" />
          <p className="font-semibold text-teal">
            {query ? "No matches found" : "No products yet"}
          </p>
          <p className="text-sm text-ink-soft">
            Add your regular items once — they will autofill quotations.
          </p>
        </div>
      )}

      <ul className="flex flex-col gap-3">
        <AnimatePresence initial={false}>
          {products?.map((p) => (
            <motion.li
              key={p.id}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97 }}
              className="neu-raised group flex items-center gap-5 rounded-2xl px-5 py-3.5"
            >
              <div className="min-w-0 flex-1">
                <div className="truncate font-bold text-teal">{p.name}</div>
                <div className="text-xs text-ink-soft">
                  {p.hsn ? `HSN ${p.hsn} · ` : ""}
                  {p.unit}
                </div>
              </div>
              <div className="text-right font-black tabular-nums text-teal">
                ₹{fmtMoney(p.rate)}
              </div>
              <div className="flex shrink-0 gap-1 transition-opacity lg:opacity-0 lg:group-hover:opacity-100">
                <button
                  onClick={() => openEdit(p)}
                  className="rounded-lg p-1.5 text-ink-soft/60 hover:text-teal"
                  title="Edit"
                >
                  <Pencil size={14} />
                </button>
                <button
                  onClick={() => remove(p)}
                  className="rounded-lg p-1.5 text-ink-soft/60 hover:text-red-700"
                  title="Delete"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>
    </div>
  );
}
