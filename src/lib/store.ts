"use client";

import { useEffect, useRef, useState } from "react";
import type { Customer, Product, Quotation, Settings } from "./types";
import { DEFAULT_TERMS } from "./types";

/* ---------- tiny reactive layer: refetch everything after any mutation ---------- */

const listeners = new Set<() => void>();

export function bump() {
  listeners.forEach((l) => l());
}

/**
 * Fetch data and keep it fresh: re-runs after any store mutation (bump).
 * Drop-in replacement for Dexie's useLiveQuery in this app.
 */
export function useStore<T>(
  fetcher: () => Promise<T>,
  deps: unknown[] = []
): T | undefined {
  const [data, setData] = useState<T | undefined>(undefined);
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  useEffect(() => {
    let on = true;
    const run = () =>
      fetcherRef
        .current()
        .then((d) => {
          if (on) setData(d);
        })
        .catch(() => {});
    run();
    listeners.add(run);
    return () => {
      on = false;
      listeners.delete(run);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return data;
}

/* ---------- fetch helper ---------- */

async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    headers: { "Content-Type": "application/json" },
    ...init,
  });
  if (res.status === 401) {
    window.location.href = "/login";
    throw new Error("unauthorized");
  }
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed (${res.status})`);
  }
  return res.json();
}

/* ---------- quotations ---------- */

export async function listQuotations(): Promise<Quotation[]> {
  const all = await api<Quotation[]>("/api/store/quotations");
  return all.sort((a, b) => (b.updatedAt ?? 0) - (a.updatedAt ?? 0));
}

export async function getQuotation(id: number): Promise<Quotation | undefined> {
  const all = await listQuotations();
  return all.find((q) => q.id === id);
}

export async function addQuotation(q: Quotation): Promise<number> {
  const { id } = await api<{ id: number }>("/api/store/quotations", {
    method: "POST",
    body: JSON.stringify(q),
  });
  bump();
  return id;
}

export async function putQuotation(q: Quotation): Promise<void> {
  await api("/api/store/quotations", { method: "PUT", body: JSON.stringify(q) });
  bump();
}

export async function deleteQuotation(id: number): Promise<void> {
  await api(`/api/store/quotations?id=${id}`, { method: "DELETE" });
  bump();
}

/* ---------- customers ---------- */

export async function listCustomers(): Promise<Customer[]> {
  const all = await api<Customer[]>("/api/store/customers");
  return all.sort((a, b) => a.name.localeCompare(b.name));
}

export async function addCustomer(c: Customer): Promise<number> {
  const { id } = await api<{ id: number }>("/api/store/customers", {
    method: "POST",
    body: JSON.stringify(c),
  });
  bump();
  return id;
}

export async function putCustomer(c: Customer): Promise<void> {
  await api("/api/store/customers", { method: "PUT", body: JSON.stringify(c) });
  bump();
}

export async function deleteCustomer(id: number): Promise<void> {
  await api(`/api/store/customers?id=${id}`, { method: "DELETE" });
  bump();
}

/* ---------- products ---------- */

export async function listProducts(): Promise<Product[]> {
  const all = await api<Product[]>("/api/store/products");
  return all.sort((a, b) => a.name.localeCompare(b.name));
}

export async function addProduct(p: Product): Promise<number> {
  const { id } = await api<{ id: number }>("/api/store/products", {
    method: "POST",
    body: JSON.stringify(p),
  });
  bump();
  return id;
}

export async function putProduct(p: Product): Promise<void> {
  await api("/api/store/products", { method: "PUT", body: JSON.stringify(p) });
  bump();
}

export async function deleteProduct(id: number): Promise<void> {
  await api(`/api/store/products?id=${id}`, { method: "DELETE" });
  bump();
}

/* ---------- settings ---------- */

export function defaultSettings(): Settings {
  return {
    id: "app",
    refPrefix: "CS",
    refCounters: {},
    defaultTerms: DEFAULT_TERMS,
    defaultValidityDays: 15,
    bankDetails: "",
    signatureImage: "",
  };
}

export async function getSettings(): Promise<Settings> {
  const remote = await api<Settings | null>("/api/store/settings");
  return { ...defaultSettings(), ...(remote ?? {}) };
}

export async function putSettings(s: Settings): Promise<void> {
  await api("/api/store/settings", { method: "PUT", body: JSON.stringify(s) });
  bump();
}

/* ---------- backup ---------- */

export interface BackupData {
  app: string;
  exportedAt: string;
  quotations: Quotation[];
  customers: Customer[];
  products: Product[];
  settings: Settings[];
}

export async function exportBackup(): Promise<BackupData> {
  const [quotations, customers, products, settings] = await Promise.all([
    listQuotations(),
    listCustomers(),
    listProducts(),
    getSettings(),
  ]);
  return {
    app: "computer-solution-quotations",
    exportedAt: new Date().toISOString(),
    quotations,
    customers,
    products,
    settings: [settings],
  };
}

export async function importBackup(data: BackupData): Promise<void> {
  if (data.app !== "computer-solution-quotations") {
    throw new Error("This file is not a Computer Solution backup.");
  }
  await Promise.all([
    api("/api/store/quotations?all=true", { method: "DELETE" }),
    api("/api/store/customers?all=true", { method: "DELETE" }),
    api("/api/store/products?all=true", { method: "DELETE" }),
  ]);
  if (data.quotations?.length)
    await api("/api/store/quotations", {
      method: "POST",
      body: JSON.stringify(data.quotations),
    });
  if (data.customers?.length)
    await api("/api/store/customers", {
      method: "POST",
      body: JSON.stringify(data.customers),
    });
  if (data.products?.length)
    await api("/api/store/products", {
      method: "POST",
      body: JSON.stringify(data.products),
    });
  const s = data.settings?.[0];
  if (s) await putSettings({ ...defaultSettings(), ...s });
  bump();
}
