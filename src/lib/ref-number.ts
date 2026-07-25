import { getSettings, putSettings } from "./store";

/** Financial year string like "2026-27" for a given date. */
export function financialYear(d: Date = new Date()): string {
  const y = d.getFullYear();
  const startYear = d.getMonth() >= 3 ? y : y - 1; // FY starts in April
  return `${startYear}-${String((startYear + 1) % 100).padStart(2, "0")}`;
}

/** Reserve the next ref number, e.g. CS/2026-27/0007. */
export async function nextRefNo(): Promise<string> {
  const settings = await getSettings();
  const fy = financialYear();
  const next = (settings.refCounters[fy] ?? 0) + 1;
  await putSettings({
    ...settings,
    refCounters: { ...settings.refCounters, [fy]: next },
  });
  return `${settings.refPrefix}/${fy}/${String(next).padStart(4, "0")}`;
}

export function todayISO(): string {
  const d = new Date();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

export function fmtDate(iso: string): string {
  if (!iso) return "";
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}
