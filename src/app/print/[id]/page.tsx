"use client";

import { use, useRef, useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { ArrowLeft, Printer, Share2, Download } from "lucide-react";
import { useStore, getQuotation, getSettings } from "@/lib/store";
import { downloadPdf, sharePdf } from "@/lib/pdf";
import { PrintSheet } from "@/components/print/PrintSheet";
import { NeuButton } from "@/components/neu/NeuButton";

export default function PrintPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const result = useStore(
    async () => ({ quotation: await getQuotation(Number(id)) }),
    [id]
  );
  const settings = useStore(() => getSettings(), []);
  const sheetRef = useRef<HTMLDivElement>(null);
  const [busy, setBusy] = useState<"share" | "download" | null>(null);

  if (result === undefined) return null; // still loading
  const quotation = result.quotation;
  if (!quotation) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4">
        <p className="text-ink-soft">Quotation not found.</p>
        <Link href="/quotations">
          <NeuButton>Back to Quotations</NeuButton>
        </Link>
      </div>
    );
  }

  const fileName = `Quotation-${quotation.refNo.replace(/[\/\s]+/g, "-")}`;

  const doShare = async () => {
    if (!sheetRef.current || busy) return;
    setBusy("share");
    try {
      await sharePdf(
        sheetRef.current,
        fileName,
        `Quotation ${quotation.refNo} from Computer Solution`
      );
    } finally {
      setBusy(null);
    }
  };

  const doDownload = async () => {
    if (!sheetRef.current || busy) return;
    setBusy("download");
    try {
      await downloadPdf(sheetRef.current, fileName);
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="min-h-screen bg-surface-lo/60 pb-16">
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        className="no-print sticky top-0 z-10 mb-8 flex flex-wrap items-center gap-3 bg-surface/80 px-4 py-4 backdrop-blur sm:px-8"
      >
        <Link href={`/quotations/${id}`}>
          <NeuButton size="sm" tabIndex={-1}>
            <ArrowLeft size={14} /> Back
          </NeuButton>
        </Link>
        <span className="text-sm font-semibold text-ink-soft">
          {quotation.refNo}
        </span>
        <div className="ml-auto flex flex-wrap items-center gap-2.5">
          <NeuButton onClick={() => window.print()} size="sm">
            <Printer size={14} /> Print
          </NeuButton>
          <NeuButton onClick={doDownload} size="sm" disabled={busy !== null}>
            <Download size={14} />
            {busy === "download" ? "Making PDF…" : "Download PDF"}
          </NeuButton>
          <NeuButton
            variant="gold"
            onClick={doShare}
            disabled={busy !== null}
          >
            <Share2 size={15} />
            {busy === "share" ? "Making PDF…" : "Share PDF"}
          </NeuButton>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.08 }}
        className="overflow-x-auto px-2"
      >
        <div ref={sheetRef} className="mx-auto w-[210mm]">
          <PrintSheet quotation={quotation} settings={settings} />
        </div>
      </motion.div>
    </div>
  );
}
