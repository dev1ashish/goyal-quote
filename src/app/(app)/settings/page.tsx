"use client";

import { useEffect, useRef, useState } from "react";
import {
  Download,
  Upload,
  Check,
  ImagePlus,
  Trash2,
  DatabaseZap,
} from "lucide-react";
import {
  getSettings,
  putSettings,
  exportBackup,
  importBackup,
} from "@/lib/store";
import { readLegacyLocalData } from "@/lib/db";
import type { Settings } from "@/lib/types";
import { NeuButton } from "@/components/neu/NeuButton";
import { NeuCard } from "@/components/neu/NeuCard";
import { NeuInput, NeuTextarea, Field } from "@/components/neu/NeuInput";

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [saved, setSaved] = useState(false);
  const [importMsg, setImportMsg] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const signRef = useRef<HTMLInputElement>(null);

  const loadSignature = async (file: File) => {
    // downscale to keep the stored data URL small
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
    const img = new Image();
    await new Promise((res, rej) => {
      img.onload = res;
      img.onerror = rej;
      img.src = dataUrl;
    });
    const maxW = 600;
    const scale = Math.min(1, maxW / img.width);
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(img.width * scale);
    canvas.height = Math.round(img.height * scale);
    canvas.getContext("2d")!.drawImage(img, 0, 0, canvas.width, canvas.height);
    const resized = canvas.toDataURL("image/png");
    // save immediately so the image can't be lost by forgetting to hit Save
    setSettings((s) => {
      if (!s) return s;
      const next = { ...s, signatureImage: resized };
      putSettings(next);
      return next;
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 1800);
  };

  const removeSignature = async () => {
    if (!settings) return;
    const next = { ...settings, signatureImage: "" };
    setSettings(next);
    await putSettings(next);
    setSaved(true);
    setTimeout(() => setSaved(false), 1800);
  };

  useEffect(() => {
    getSettings().then(setSettings);
  }, []);

  const save = async () => {
    if (!settings) return;
    await putSettings(settings);
    setSaved(true);
    setTimeout(() => setSaved(false), 1800);
  };

  const migrateLocal = async () => {
    try {
      const data = await readLegacyLocalData();
      const count =
        (data.quotations?.length ?? 0) +
        (data.customers?.length ?? 0) +
        (data.products?.length ?? 0);
      if (count === 0) {
        setImportMsg("No old local data found in this browser.");
      } else if (
        confirm(
          `Found ${data.quotations.length} quotations, ${data.customers.length} customers and ${data.products.length} products saved in this browser. Upload them to the cloud? This replaces whatever is currently in the cloud.`
        )
      ) {
        await importBackup(data);
        const fresh = await getSettings();
        setSettings(fresh);
        setImportMsg("Local data uploaded to the cloud successfully.");
      }
    } catch (err) {
      setImportMsg(
        err instanceof Error ? err.message : "Could not read old local data."
      );
    }
    setTimeout(() => setImportMsg(null), 5000);
  };

  const doExport = async () => {
    const data = await exportBackup();
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const stamp = new Date().toISOString().slice(0, 10);
    a.href = url;
    a.download = `computer-solution-backup-${stamp}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const doImport = async (file: File) => {
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      if (
        !confirm(
          "Importing will REPLACE all current data with the backup. Continue?"
        )
      )
        return;
      await importBackup(data);
      const fresh = await getSettings();
      setSettings(fresh);
      setImportMsg("Backup restored successfully.");
    } catch (err) {
      setImportMsg(
        err instanceof Error ? err.message : "Could not read backup file."
      );
    }
    setTimeout(() => setImportMsg(null), 4000);
  };

  if (!settings) return null;

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="mb-8 text-2xl font-black tracking-wide text-teal">
        Settings
      </h1>

      <NeuCard className="mb-6 p-6">
        <h2 className="mb-4 text-xs font-black uppercase tracking-[0.18em] text-gold">
          Quotation Defaults
        </h2>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Ref No. Prefix">
            <NeuInput
              value={settings.refPrefix}
              onChange={(e) =>
                setSettings({ ...settings, refPrefix: e.target.value })
              }
            />
          </Field>
          <Field label="Default Validity (days)">
            <NeuInput
              type="number"
              min={1}
              value={settings.defaultValidityDays}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  defaultValidityDays: Number(e.target.value) || 15,
                })
              }
            />
          </Field>
          <Field label="Default Terms & Conditions" className="col-span-2">
            <NeuTextarea
              rows={6}
              value={settings.defaultTerms}
              onChange={(e) =>
                setSettings({ ...settings, defaultTerms: e.target.value })
              }
            />
          </Field>
          <Field
            label="Bank / Payment Details (printed on every quotation)"
            className="col-span-2"
          >
            <NeuTextarea
              rows={4}
              placeholder={
                "Bank Name: …\nA/c Name: Computer Solution\nA/c No: …\nIFSC: …\nUPI: …"
              }
              value={settings.bankDetails}
              onChange={(e) =>
                setSettings({ ...settings, bankDetails: e.target.value })
              }
            />
          </Field>
          <div className="col-span-2">
            <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.14em] text-ink-soft">
              Signature / Stamp Image (printed above &ldquo;Authorised
              Signatory&rdquo;)
            </span>
            <div className="flex flex-wrap items-center gap-4">
              {settings.signatureImage ? (
                <div className="neu-inset-sm rounded-xl bg-white p-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={settings.signatureImage}
                    alt="Signature / stamp preview"
                    className="max-h-28 w-auto"
                  />
                  <div className="mt-1 text-center text-[10px] font-semibold uppercase tracking-wider text-neutral-400">
                    Preview — as printed
                  </div>
                </div>
              ) : (
                <span className="text-sm text-ink-soft">
                  No image yet — upload a photo of your signature or stamp
                  (PNG with clear background looks best).
                </span>
              )}
              <div className="flex gap-2">
                <NeuButton size="sm" onClick={() => signRef.current?.click()}>
                  <ImagePlus size={14} />
                  {settings.signatureImage ? "Replace" : "Upload"}
                </NeuButton>
                {settings.signatureImage && (
                  <NeuButton size="sm" variant="danger" onClick={removeSignature}>
                    <Trash2 size={14} /> Remove
                  </NeuButton>
                )}
              </div>
              <input
                ref={signRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) loadSignature(f);
                  e.target.value = "";
                }}
              />
            </div>
          </div>
        </div>
        <div className="mt-5 flex items-center justify-end gap-3">
          {saved && (
            <span className="flex items-center gap-1 text-sm font-semibold text-emerald-700 dark:text-emerald-400">
              <Check size={14} /> Saved
            </span>
          )}
          <NeuButton variant="primary" onClick={save}>
            Save Settings
          </NeuButton>
        </div>
      </NeuCard>

      <NeuCard className="p-6">
        <h2 className="mb-2 text-xs font-black uppercase tracking-[0.18em] text-gold">
          Backup
        </h2>
        <p className="mb-5 text-sm leading-relaxed text-ink-soft">
          Your data is stored in the cloud and available on every device.
          Still, export a backup file now and then and keep it safe (e.g. in
          Google Drive) — you can restore it here any time.
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <NeuButton onClick={doExport}>
            <Download size={15} /> Export Backup
          </NeuButton>
          <NeuButton onClick={() => fileRef.current?.click()}>
            <Upload size={15} /> Import Backup
          </NeuButton>
          <input
            ref={fileRef}
            type="file"
            accept="application/json"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) doImport(f);
              e.target.value = "";
            }}
          />
          <NeuButton onClick={migrateLocal} title="Upload data saved in this browser before the cloud upgrade">
            <DatabaseZap size={15} /> Migrate Old Local Data
          </NeuButton>
          {importMsg && (
            <span className="text-sm font-semibold text-teal">{importMsg}</span>
          )}
        </div>
      </NeuCard>
    </div>
  );
}
