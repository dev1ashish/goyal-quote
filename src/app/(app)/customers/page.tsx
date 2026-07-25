"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Search, Trash2, Plus, Users, Pencil, X, Check } from "lucide-react";
import {
  useStore,
  listCustomers,
  addCustomer,
  putCustomer,
  deleteCustomer,
} from "@/lib/store";
import type { Customer } from "@/lib/types";
import { NeuButton } from "@/components/neu/NeuButton";
import { NeuCard } from "@/components/neu/NeuCard";
import { NeuInput, NeuTextarea, Field } from "@/components/neu/NeuInput";

const EMPTY: Omit<Customer, "id" | "createdAt"> = {
  name: "",
  phone: "",
  address: "",
  gstin: "",
};

export default function CustomersPage() {
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<Customer | null>(null);
  const [form, setForm] = useState(EMPTY);
  const [formOpen, setFormOpen] = useState(false);

  const customers = useStore(async () => {
    const all = await listCustomers();
    const q = query.trim().toLowerCase();
    if (!q) return all;
    return all.filter(
      (c) =>
        c.name.toLowerCase().includes(q) || c.phone.toLowerCase().includes(q)
    );
  }, [query]);

  const openNew = () => {
    setEditing(null);
    setForm(EMPTY);
    setFormOpen(true);
  };

  const openEdit = (c: Customer) => {
    setEditing(c);
    setForm({ name: c.name, phone: c.phone, address: c.address, gstin: c.gstin });
    setFormOpen(true);
  };

  const save = async () => {
    if (!form.name.trim()) return;
    if (editing) {
      await putCustomer({ ...editing, ...form, name: form.name.trim() });
    } else {
      await addCustomer({
        ...form,
        name: form.name.trim(),
        createdAt: Date.now(),
      });
    }
    setFormOpen(false);
  };

  const remove = async (c: Customer) => {
    if (!confirm(`Delete customer "${c.name}"?`)) return;
    await deleteCustomer(c.id!);
  };

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-8 flex flex-wrap items-center gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-wide text-teal">
            Customers
          </h1>
          <p className="mt-0.5 text-sm text-ink-soft">
            {customers?.length ?? 0} saved
          </p>
        </div>
        <div className="ml-auto flex flex-wrap items-center gap-3">
          <div className="neu-inset-sm flex items-center gap-2 rounded-xl px-3.5 py-2.5">
            <Search size={15} className="text-ink-soft" />
            <input
              className="w-48 bg-transparent text-sm placeholder:text-ink-soft/60"
              placeholder="Search name or phone…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <NeuButton variant="gold" onClick={openNew}>
            <Plus size={15} strokeWidth={3} /> Add Customer
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
                  {editing ? `Edit — ${editing.name}` : "New Customer"}
                </h2>
                <button
                  onClick={() => setFormOpen(false)}
                  className="text-ink-soft hover:text-teal"
                >
                  <X size={16} />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Name">
                  <NeuInput
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    autoFocus
                  />
                </Field>
                <Field label="Phone">
                  <NeuInput
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  />
                </Field>
                <Field label="Address">
                  <NeuTextarea
                    rows={2}
                    value={form.address}
                    onChange={(e) =>
                      setForm({ ...form, address: e.target.value })
                    }
                  />
                </Field>
                <Field label="GSTIN">
                  <NeuInput
                    value={form.gstin}
                    onChange={(e) =>
                      setForm({ ...form, gstin: e.target.value.toUpperCase() })
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

      {customers && customers.length === 0 && !formOpen && (
        <div className="neu-inset mx-auto flex max-w-md flex-col items-center gap-3 rounded-3xl py-16 text-center">
          <Users size={32} className="text-gold" />
          <p className="font-semibold text-teal">
            {query ? "No matches found" : "No customers yet"}
          </p>
          <p className="text-sm text-ink-soft">
            Customers are also saved automatically when you create quotations.
          </p>
        </div>
      )}

      <ul className="grid gap-4 sm:grid-cols-2">
        <AnimatePresence initial={false}>
          {customers?.map((c) => (
            <motion.li
              key={c.id}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="neu-raised group rounded-3xl px-5 py-4"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="truncate font-bold text-teal">{c.name}</div>
                  {c.phone && (
                    <div className="text-xs text-ink-soft">{c.phone}</div>
                  )}
                  {c.address && (
                    <div className="mt-1 line-clamp-2 text-xs text-ink-soft/80">
                      {c.address}
                    </div>
                  )}
                  {c.gstin && (
                    <div className="mt-1 font-mono text-[10px] text-gold">
                      {c.gstin}
                    </div>
                  )}
                </div>
                <div className="flex shrink-0 gap-1 transition-opacity lg:opacity-0 lg:group-hover:opacity-100">
                  <button
                    onClick={() => openEdit(c)}
                    className="rounded-lg p-1.5 text-ink-soft/60 hover:text-teal"
                    title="Edit"
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    onClick={() => remove(c)}
                    className="rounded-lg p-1.5 text-ink-soft/60 hover:text-red-700"
                    title="Delete"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>
    </div>
  );
}
