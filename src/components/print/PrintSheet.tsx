"use client";

import type { Quotation, Settings } from "@/lib/types";
import { SHOP } from "@/lib/types";
import { computeTotals, fmtMoney, lineAmount, GST_RATE } from "@/lib/calc";
import { amountInWords } from "@/lib/amount-in-words";
import { fmtDate } from "@/lib/ref-number";

const TEAL = "#1d3a35";
const GOLD = "#b28d3e";

export function PrintSheet({
  quotation,
  settings,
}: {
  quotation: Quotation;
  settings?: Settings;
}) {
  const gstMode = quotation.gstMode ?? "add";
  const t = computeTotals(quotation.items, quotation.discount, gstMode);
  const items = quotation.items.filter(
    (it) => it.description.trim() || lineAmount(it) > 0
  );
  const customCols = (quotation.customColumns ?? []).filter((c) =>
    c.name.trim()
  );

  return (
    <div
      className="print-sheet mx-auto flex w-[210mm] min-h-[297mm] flex-col bg-white shadow-2xl"
      style={{
        color: "#26312e",
        printColorAdjust: "exact",
        WebkitPrintColorAdjust: "exact",
      }}
    >
      <div className="flex flex-1 flex-col px-[14mm] pt-[12mm]">
        {/* ===== Letterhead header ===== */}
        <div className="flex items-start justify-between">
          <div>
            <h1
              className="text-[26pt] font-black leading-none tracking-[0.06em]"
              style={{ color: TEAL }}
            >
              COMPUTER <span style={{ color: GOLD }}>SOLUTION</span>
            </h1>
            <p
              className="mt-[3mm] text-[8pt] font-semibold tracking-[0.28em]"
              style={{ color: "#4a5450" }}
            >
              {SHOP.tagline}
            </p>
          </div>
          <div
            className="border px-[5mm] py-[2.5mm] text-center"
            style={{ borderColor: TEAL }}
          >
            <div
              className="text-[7.5pt] font-bold tracking-[0.18em]"
              style={{ color: TEAL }}
            >
              GSTIN :
            </div>
            <div
              className="mt-[1mm] text-[8.5pt] font-bold tracking-[0.14em]"
              style={{ color: TEAL }}
            >
              {SHOP.gstin}
            </div>
          </div>
        </div>

        {/* divider with gold center dash */}
        <div className="relative mt-[7mm]">
          <hr style={{ borderColor: "#d8d5cf" }} />
          <span
            className="absolute left-1/2 top-1/2 h-[1.2mm] w-[12mm] -translate-x-1/2 -translate-y-1/2"
            style={{ background: GOLD }}
          />
        </div>

        {/* ===== Title ===== */}
        <h2
          className="mt-[8mm] text-center text-[14pt] font-black tracking-[0.45em]"
          style={{ color: TEAL }}
        >
          QUOTATION
        </h2>

        {/* ===== Ref / Date ===== */}
        <div className="mt-[8mm] flex items-end justify-between text-[10pt]">
          <div className="flex items-end gap-2">
            <span>Ref No. :</span>
            <span
              className="inline-block min-w-[45mm] border-b pb-[0.5mm] font-semibold"
              style={{ borderColor: "#b9b4aa" }}
            >
              {quotation.refNo}
            </span>
          </div>
          <div className="flex items-end gap-2">
            <span>Date :</span>
            <span
              className="inline-block min-w-[32mm] border-b pb-[0.5mm] font-semibold"
              style={{ borderColor: "#b9b4aa" }}
            >
              {fmtDate(quotation.date)}
            </span>
          </div>
        </div>

        {/* ===== Customer ===== */}
        {quotation.addressee === "twimc" ? (
          <div className="mt-[7mm] text-[10pt]">
            <div
              className="text-[8pt] font-bold tracking-[0.2em]"
              style={{ color: GOLD }}
            >
              TO
            </div>
            <div className="font-bold" style={{ color: TEAL }}>
              To Whom It May Concern
            </div>
          </div>
        ) : quotation.customer.name && (
          <div className="mt-[7mm] text-[10pt] leading-relaxed">
            <div
              className="text-[8pt] font-bold tracking-[0.2em]"
              style={{ color: GOLD }}
            >
              TO
            </div>
            <div className="font-bold" style={{ color: TEAL }}>
              {quotation.customer.name}
            </div>
            {quotation.customer.address && (
              <div className="whitespace-pre-line text-[9.5pt]">
                {quotation.customer.address}
              </div>
            )}
            <div className="text-[9.5pt]">
              {quotation.customer.phone && <>Ph: {quotation.customer.phone}</>}
              {quotation.customer.phone && quotation.customer.gstin && " · "}
              {quotation.customer.gstin && (
                <>GSTIN: {quotation.customer.gstin}</>
              )}
            </div>
          </div>
        )}

        {quotation.notes && (
          <p className="mt-[4mm] text-[9.5pt] italic">{quotation.notes}</p>
        )}

        {/* ===== Items table ===== */}
        <table className="mt-[6mm] w-full border-collapse text-[9.5pt]">
          <thead>
            <tr style={{ background: TEAL, color: "#ffffff" }}>
              <th className="w-[13mm] py-[2.5mm] pl-[2.5mm] pr-[3mm] text-left font-semibold">
                S.N.
              </th>
              <th className="py-[2.5mm] pl-[2mm] text-left font-semibold">
                Item &amp; Description
              </th>
              {customCols.map((col) => (
                <th
                  key={col.id}
                  className="w-[22mm] py-[2.5mm] text-left font-semibold"
                >
                  {col.name}
                </th>
              ))}
              <th className="w-[18mm] py-[2.5mm] text-left font-semibold">HSN</th>
              <th className="w-[13mm] py-[2.5mm] text-right font-semibold">Qty</th>
              <th className="w-[13mm] py-[2.5mm] pl-[2mm] text-left font-semibold">
                Unit
              </th>
              <th className="w-[24mm] py-[2.5mm] text-right font-semibold">
                Rate (₹)
              </th>
              <th className="w-[27mm] py-[2.5mm] pr-[2.5mm] text-right font-semibold">
                Amount (₹)
              </th>
            </tr>
          </thead>
          <tbody>
            {items.map((it, i) => (
              <tr
                key={it.id}
                style={{
                  borderBottom: "0.3mm solid #e2dfd9",
                  background: i % 2 === 1 ? "#f7f5f2" : "transparent",
                }}
              >
                <td className="py-[2.2mm] pl-[2.5mm] pr-[3mm] align-top">
                  {i + 1}
                </td>
                <td className="py-[2.2mm] pl-[2mm] pr-[3mm] align-top font-medium">
                  {it.description}
                </td>
                {customCols.map((col) => (
                  <td key={col.id} className="py-[2.2mm] pr-[2mm] align-top">
                    {it.custom?.[col.id] ?? ""}
                  </td>
                ))}
                <td className="py-[2.2mm] align-top">{it.hsn}</td>
                <td className="py-[2.2mm] text-right align-top tabular-nums">
                  {it.qty}
                </td>
                <td className="py-[2.2mm] pl-[2mm] align-top">{it.unit}</td>
                <td className="py-[2.2mm] text-right align-top tabular-nums">
                  {fmtMoney(it.rate)}
                </td>
                <td className="py-[2.2mm] pr-[2.5mm] text-right align-top font-semibold tabular-nums">
                  {fmtMoney(lineAmount(it))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* ===== Totals ===== */}
        <div className="mt-[5mm] flex justify-end">
          <table className="w-[80mm] text-[9.5pt]">
            <tbody>
              <TotalRow label="Subtotal" value={t.subtotal} />
              {t.discountAmt > 0 && (
                <>
                  <TotalRow label="Discount" value={-t.discountAmt} />
                  <TotalRow label="Taxable Value" value={t.taxable} />
                </>
              )}
              {gstMode === "add" && (
                <TotalRow label={`GST (${GST_RATE}%)`} value={t.gst} />
              )}
              {t.roundOff !== 0 && <TotalRow label="Round Off" value={t.roundOff} />}
              <tr>
                <td
                  className="py-[2.5mm] pl-[3mm] text-[10.5pt] font-black tracking-wide"
                  style={{ background: TEAL, color: "#fff" }}
                >
                  GRAND TOTAL
                </td>
                <td
                  className="py-[2.5mm] pr-[3mm] text-right text-[11pt] font-black tabular-nums"
                  style={{ background: TEAL, color: "#fff" }}
                >
                  ₹ {fmtMoney(t.grandTotal)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {gstMode === "included" && (
          <p className="mt-[2mm] text-right text-[8.5pt] italic">
            Prices inclusive of GST ({GST_RATE}%): ₹ {fmtMoney(t.gst)}
          </p>
        )}

        {t.grandTotal > 0 && (
          <p className="mt-[3mm] text-right text-[9pt] font-semibold italic">
            {amountInWords(t.grandTotal)}
          </p>
        )}

        {/* ===== Terms, payment details + signature ===== */}
        <div className="mt-[8mm] flex items-start justify-between gap-[10mm]">
          <div className="max-w-[110mm]">
            {quotation.terms && (
              <div>
                <div
                  className="text-[8pt] font-bold tracking-[0.2em]"
                  style={{ color: GOLD }}
                >
                  TERMS &amp; CONDITIONS
                </div>
                <ol className="mt-[2mm] list-decimal pl-[5mm] text-[8.5pt] leading-relaxed">
                  {quotation.terms
                    .split("\n")
                    .filter((l) => l.trim())
                    .map((line, i) => (
                      <li key={i}>{line.replace(/^\d+[.)]\s*/, "")}</li>
                    ))}
                </ol>
              </div>
            )}
            {quotation.showBankDetails !== false && settings?.bankDetails?.trim() && (
              <div className="mt-[5mm]">
                <div
                  className="text-[8pt] font-bold tracking-[0.2em]"
                  style={{ color: GOLD }}
                >
                  PAYMENT DETAILS
                </div>
                <div className="mt-[2mm] whitespace-pre-line text-[8.5pt] leading-relaxed">
                  {settings.bankDetails}
                </div>
              </div>
            )}
          </div>
          <div className="mt-[2mm] shrink-0 text-center text-[9pt]">
            <div className="font-bold" style={{ color: TEAL }}>
              For COMPUTER SOLUTION
            </div>
            {quotation.showSignature !== false && settings?.signatureImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={settings.signatureImage}
                alt="Signature / stamp"
                className="mx-auto mt-[3mm] h-auto max-h-[22mm] w-auto max-w-[45mm]"
              />
            ) : (
              <div className="h-[18mm]" />
            )}
            <div
              className="mt-[1.5mm] border-t pt-[1.5mm]"
              style={{ borderColor: "#b9b4aa" }}
            >
              Authorised Signatory
            </div>
          </div>
        </div>
      </div>

      {/* ===== Letterhead footer ===== */}
      <div className="mt-[10mm] px-[14mm]">
        <hr style={{ borderColor: "#d8d5cf" }} />
        <div className="flex items-start justify-between py-[5mm] text-[8.5pt] leading-relaxed">
          <div>
            <div
              className="text-[8pt] font-black tracking-[0.2em]"
              style={{ color: TEAL }}
            >
              VISIT US
            </div>
            <div className="mt-[1mm]">{SHOP.address}</div>
            <div>{SHOP.email}</div>
          </div>
          <div className="text-right">
            <div
              className="text-[8pt] font-black tracking-[0.2em]"
              style={{ color: TEAL }}
            >
              CONTACT
            </div>
            {SHOP.contacts.map((c) => (
              <div key={c.name} className="mt-[1mm]">
                {c.name} — {c.phone}
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="h-[6mm] w-full" style={{ background: GOLD }} />
    </div>
  );
}

function TotalRow({ label, value }: { label: string; value: number }) {
  return (
    <tr style={{ borderBottom: "0.3mm solid #e2dfd9" }}>
      <td className="py-[1.8mm] pl-[3mm]" style={{ color: "#4a5450" }}>
        {label}
      </td>
      <td className="py-[1.8mm] pr-[3mm] text-right font-semibold tabular-nums">
        {value < 0 ? `− ${fmtMoney(Math.abs(value))}` : fmtMoney(value)}
      </td>
    </tr>
  );
}
