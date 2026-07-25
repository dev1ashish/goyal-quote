"use client";

import { use } from "react";
import { QuotationEditor } from "@/components/quotation/QuotationEditor";

export default function EditQuotationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  return <QuotationEditor id={Number(id)} />;
}
