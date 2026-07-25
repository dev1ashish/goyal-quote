"use client";

import { useState, useRef, useEffect } from "react";
import { Reorder, useDragControls, AnimatePresence, motion } from "motion/react";
import { GripVertical, Trash2, Plus, PackageSearch, X, Columns3 } from "lucide-react";
import { useStore, listProducts } from "@/lib/store";
import type { CustomColumn, LineItem, Product } from "@/lib/types";
import { UNITS } from "@/lib/types";
import { lineAmount, fmtMoney } from "@/lib/calc";
import { NeuButton } from "@/components/neu/NeuButton";

interface LineItemsTableProps {
  items: LineItem[];
  onChange: (items: LineItem[]) => void;
  customColumns: CustomColumn[];
  onColumnsChange: (cols: CustomColumn[]) => void;
}

export function newLineItem(): LineItem {
  return {
    id: crypto.randomUUID(),
    description: "",
    hsn: "",
    qty: 1,
    unit: "Pcs",
    rate: 0,
    custom: {},
  };
}

const cellInput =
  "w-full rounded-lg neu-cell px-2.5 py-2 text-[15px] text-ink placeholder:text-ink-soft/50 focus:shadow-[inset_1.5px_1.5px_3.5px_var(--neu-dark),inset_-1.5px_-1.5px_3.5px_var(--neu-light),0_0_0_2px_var(--gold-soft)] transition-shadow";

const headTh =
  "py-3 text-xs font-black uppercase tracking-[0.1em] text-ink-soft whitespace-nowrap";

export function LineItemsTable({
  items,
  onChange,
  customColumns,
  onColumnsChange,
}: LineItemsTableProps) {
  const update = (id: string, patch: Partial<LineItem>) =>
    onChange(items.map((it) => (it.id === id ? { ...it, ...patch } : it)));

  const remove = (id: string) => onChange(items.filter((it) => it.id !== id));

  const addRow = () => onChange([...items, newLineItem()]);

  const addColumn = () =>
    onColumnsChange([...customColumns, { id: crypto.randomUUID(), name: "" }]);

  const renameColumn = (id: string, name: string) =>
    onColumnsChange(
      customColumns.map((c) => (c.id === id ? { ...c, name } : c))
    );

  const removeColumn = (id: string) => {
    onColumnsChange(customColumns.filter((c) => c.id !== id));
    onChange(
      items.map((it) => {
        if (!it.custom || !(id in it.custom)) return it;
        const custom = { ...it.custom };
        delete custom[id];
        return { ...it, custom };
      })
    );
  };

  return (
    <div>
      {/* Custom columns manager — separate from the table so it never breaks layout */}
      <AnimatePresence initial={false}>
        {customColumns.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="mb-4 flex flex-wrap items-center gap-2.5">
              <span className="text-xs font-black uppercase tracking-[0.1em] text-ink-soft">
                Extra Columns:
              </span>
              {customColumns.map((col) => (
                <span
                  key={col.id}
                  className="neu-inset-sm flex items-center gap-1 rounded-xl py-1.5 pl-3 pr-1.5"
                >
                  <input
                    className="w-28 bg-transparent text-sm font-bold text-gold placeholder:font-medium placeholder:text-ink-soft/60"
                    value={col.name}
                    placeholder="Column name…"
                    autoFocus={!col.name}
                    onChange={(e) => renameColumn(col.id, e.target.value)}
                  />
                  <button
                    type="button"
                    title="Remove this column"
                    onClick={() => removeColumn(col.id)}
                    className="rounded-lg p-1 text-ink-soft/60 hover:text-red-700 dark:hover:text-red-400"
                  >
                    <X size={14} />
                  </button>
                </span>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="neu-inset overflow-x-auto rounded-2xl px-2 py-1">
        <table
          className="w-full border-separate border-spacing-x-1 border-spacing-y-1.5"
          style={{ minWidth: `${700 + customColumns.length * 130}px` }}
        >
          <thead>
            <tr>
              <th className="w-8" />
              <th className={`${headTh} w-8 text-left`}>#</th>
              <th className={`${headTh} pl-2 text-left`}>
                Item &amp; Description
              </th>
              {customColumns.map((col, i) => (
                <th key={col.id} className={`${headTh} w-32 pl-2 text-left`}>
                  {col.name || `Column ${i + 1}`}
                </th>
              ))}
              <th className={`${headTh} w-24 text-left`}>HSN</th>
              <th className={`${headTh} w-16 text-right`}>Qty</th>
              <th className={`${headTh} w-20 pl-2 text-left`}>Unit</th>
              <th className={`${headTh} w-28 text-right`}>Rate (₹)</th>
              <th className={`${headTh} w-32 pr-2 text-right`}>Amount (₹)</th>
              <th className="w-10" />
            </tr>
          </thead>
          <Reorder.Group
            as="tbody"
            axis="y"
            values={items}
            onReorder={onChange}
          >
            <AnimatePresence initial={false}>
              {items.map((item, idx) => (
                <Row
                  key={item.id}
                  item={item}
                  index={idx}
                  customColumns={customColumns}
                  update={update}
                  remove={remove}
                  isLast={idx === items.length - 1}
                  addRow={addRow}
                />
              ))}
            </AnimatePresence>
          </Reorder.Group>
        </table>

        {items.length === 0 && (
          <div className="flex flex-col items-center gap-2 py-10 text-ink-soft">
            <PackageSearch size={28} className="text-gold" />
            <p className="text-sm">No items yet — add your first line item.</p>
          </div>
        )}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <NeuButton variant="default" size="sm" onClick={addRow}>
          <Plus size={14} strokeWidth={3} />
          Add Item
        </NeuButton>
        <NeuButton variant="ghost" size="sm" onClick={addColumn}>
          <Columns3 size={14} />
          Add Custom Column
        </NeuButton>
      </div>
    </div>
  );
}

function Row({
  item,
  index,
  customColumns,
  update,
  remove,
  isLast,
  addRow,
}: {
  item: LineItem;
  index: number;
  customColumns: CustomColumn[];
  update: (id: string, patch: Partial<LineItem>) => void;
  remove: (id: string) => void;
  isLast: boolean;
  addRow: () => void;
}) {
  const controls = useDragControls();

  return (
    <Reorder.Item
      as="tr"
      value={item}
      dragListener={false}
      dragControls={controls}
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -24, transition: { duration: 0.18 } }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      className="group bg-surface"
    >
      <td className="py-1 align-middle">
        <button
          type="button"
          onPointerDown={(e) => controls.start(e)}
          className="cursor-grab touch-none px-1 text-ink-soft/50 opacity-70 transition-opacity hover:text-gold lg:opacity-0 lg:group-hover:opacity-100 active:cursor-grabbing"
          tabIndex={-1}
          aria-label="Drag to reorder"
        >
          <GripVertical size={15} />
        </button>
      </td>
      <td className="py-1 text-[15px] font-semibold text-ink-soft">
        {index + 1}
      </td>
      <td className="py-1 pl-1">
        <DescriptionCell item={item} update={update} />
      </td>
      {customColumns.map((col) => (
        <td key={col.id} className="py-1 pl-2">
          <input
            className={cellInput}
            value={item.custom?.[col.id] ?? ""}
            placeholder="—"
            onChange={(e) =>
              update(item.id, {
                custom: { ...item.custom, [col.id]: e.target.value },
              })
            }
          />
        </td>
      ))}
      <td className="py-1">
        <input
          className={`${cellInput} font-mono text-sm`}
          value={item.hsn}
          placeholder="8471"
          onChange={(e) => update(item.id, { hsn: e.target.value })}
        />
      </td>
      <td className="py-1">
        <input
          type="number"
          min={0}
          className={`${cellInput} text-right tabular-nums`}
          value={item.qty === 0 ? "" : item.qty}
          placeholder="0"
          onChange={(e) => update(item.id, { qty: Number(e.target.value) || 0 })}
        />
      </td>
      <td className="py-1 pl-2">
        <select
          className={`${cellInput} cursor-pointer text-sm`}
          value={item.unit}
          onChange={(e) => update(item.id, { unit: e.target.value })}
        >
          {UNITS.map((u) => (
            <option key={u}>{u}</option>
          ))}
        </select>
      </td>
      <td className="py-1">
        <input
          type="number"
          min={0}
          step="0.01"
          className={`${cellInput} text-right tabular-nums`}
          value={item.rate === 0 ? "" : item.rate}
          placeholder="0.00"
          onChange={(e) => update(item.id, { rate: Number(e.target.value) || 0 })}
          onKeyDown={(e) => {
            if (e.key === "Enter" && isLast) {
              e.preventDefault();
              addRow();
            }
          }}
        />
      </td>
      <td className="py-1 pr-2 text-right text-[15px] font-bold tabular-nums text-teal">
        {fmtMoney(lineAmount(item))}
      </td>
      <td className="py-1 text-center">
        <button
          type="button"
          onClick={() => remove(item.id)}
          className="rounded-lg p-1.5 text-ink-soft/40 opacity-70 transition-all hover:text-red-700 lg:opacity-0 lg:group-hover:opacity-100 dark:hover:text-red-400"
          aria-label="Remove item"
          tabIndex={-1}
        >
          <Trash2 size={15} />
        </button>
      </td>
    </Reorder.Item>
  );
}

function DescriptionCell({
  item,
  update,
}: {
  item: LineItem;
  update: (id: string, patch: Partial<LineItem>) => void;
}) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<{ top: number; left: number; width: number } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const allProducts = useStore(() => listProducts(), []);
  const q = item.description.trim().toLowerCase();
  const matches =
    q.length >= 2
      ? (allProducts ?? [])
          .filter((p) => p.name.toLowerCase().includes(q))
          .slice(0, 6)
      : [];

  // The dropdown is position:fixed so the table's scroll container can't clip
  // it — recompute its anchor whenever it opens, and close on scroll/resize.
  useEffect(() => {
    if (!open) return;
    const place = () => {
      const r = inputRef.current?.getBoundingClientRect();
      if (r) setPos({ top: r.bottom + 6, left: r.left, width: Math.max(r.width, 300) });
    };
    place();
    const close = (e: Event) => {
      if (listRef.current && e.target instanceof Node && listRef.current.contains(e.target)) return;
      setOpen(false);
    };
    window.addEventListener("scroll", close, true);
    window.addEventListener("resize", close);
    const onClickOutside = (e: MouseEvent) => {
      if (
        inputRef.current?.contains(e.target as Node) ||
        listRef.current?.contains(e.target as Node)
      )
        return;
      setOpen(false);
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => {
      window.removeEventListener("scroll", close, true);
      window.removeEventListener("resize", close);
      document.removeEventListener("mousedown", onClickOutside);
    };
  }, [open]);

  const pick = (p: Product) => {
    update(item.id, {
      description: p.name,
      hsn: p.hsn,
      rate: p.rate,
      unit: p.unit,
    });
    setOpen(false);
  };

  return (
    <>
      <input
        ref={inputRef}
        className={`${cellInput} font-medium`}
        value={item.description}
        placeholder="e.g. HP 240 G9 Laptop, i5 12th Gen, 8GB/512GB"
        onChange={(e) => {
          update(item.id, { description: e.target.value });
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={(e) => {
          if (e.key === "Escape") setOpen(false);
          if (e.key === "Enter" && open && matches && matches.length > 0) {
            e.preventDefault();
            pick(matches[0]);
          }
        }}
      />
      <AnimatePresence>
        {open && pos && matches && matches.length > 0 && (
          <motion.ul
            ref={listRef}
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.13 }}
            className="neu-raised fixed z-50 overflow-hidden rounded-xl py-1"
            style={{ top: pos.top, left: pos.left, width: pos.width }}
          >
            {matches.map((p) => (
              <li key={p.id}>
                <button
                  type="button"
                  className="flex w-full items-center gap-2 px-3.5 py-2 text-left text-sm hover:bg-surface-lo/60"
                  onClick={() => pick(p)}
                >
                  <span className="font-semibold text-teal">{p.name}</span>
                  <span className="ml-auto text-xs tabular-nums text-ink-soft">
                    ₹{fmtMoney(p.rate)}
                  </span>
                </button>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </>
  );
}
