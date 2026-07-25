"use client";

import { use } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { ArrowLeft, Printer } from "lucide-react";
import { useStore, getQuotation, getSettings } from "@/lib/store";
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

  return (
    <div className="min-h-screen bg-surface-lo/60 pb-16">
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        className="no-print sticky top-0 z-10 mb-8 flex flex-wrap items-center gap-3 bg-surface/80 px-4 py-4 backdrop-blur sm:px-8"
      >
        <Link href={`/quotations/${id}`}>
          <NeuButton size="sm" tabIndex={-1}>
            <ArrowLeft size={14} /> Back to Editor
          </NeuButton>
        </Link>
        <span className="text-sm font-semibold text-ink-soft">
          {quotation.refNo}
        </span>
        <div className="ml-auto">
          <NeuButton variant="gold" onClick={() => window.print()}>
            <Printer size={15} /> Print / Save as PDF
          </NeuButton>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.08 }}
        className="overflow-x-auto px-2"
      >
        <PrintSheet quotation={quotation} settings={settings} />
      </motion.div>
    </div>
  );
}
