// Legacy local database (Dexie / IndexedDB) — kept only so existing data in
// this browser can be migrated to the cloud from the Settings page.
import Dexie, { type EntityTable } from "dexie";
import type { Quotation, Customer, Product, Settings } from "./types";
import type { BackupData } from "./store";

const legacyDb = new Dexie("computer-solution-quotations") as Dexie & {
  quotations: EntityTable<Quotation, "id">;
  customers: EntityTable<Customer, "id">;
  products: EntityTable<Product, "id">;
  settings: EntityTable<Settings, "id">;
};

legacyDb.version(1).stores({
  quotations: "++id, refNo, date, status, updatedAt, customer.name",
  customers: "++id, name, phone",
  products: "++id, name, hsn",
  settings: "id",
});

/** Read everything from the old browser-local database (throws if absent). */
export async function readLegacyLocalData(): Promise<BackupData> {
  const exists = await Dexie.exists("computer-solution-quotations");
  if (!exists) throw new Error("No old local data found in this browser.");
  const [quotations, customers, products, settings] = await Promise.all([
    legacyDb.quotations.toArray(),
    legacyDb.customers.toArray(),
    legacyDb.products.toArray(),
    legacyDb.settings.toArray(),
  ]);
  return {
    app: "computer-solution-quotations",
    exportedAt: new Date().toISOString(),
    quotations,
    customers,
    products,
    settings,
  };
}
