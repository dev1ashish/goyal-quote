export type QuotationStatus = "draft" | "sent" | "accepted" | "rejected";

export interface LineItem {
  id: string;
  description: string;
  hsn: string;
  qty: number;
  unit: string;
  rate: number;
  /** legacy per-item GST rate — tax is now a flat GST_RATE on the total */
  gstPct?: number;
  /** values for user-defined columns, keyed by CustomColumn id */
  custom?: Record<string, string>;
}

export interface CustomColumn {
  id: string;
  name: string;
}

export interface CustomerInfo {
  name: string;
  phone: string;
  address: string;
  gstin: string;
}

export interface Discount {
  type: "flat" | "pct";
  value: number;
}

export interface Quotation {
  id?: number;
  refNo: string;
  date: string; // yyyy-mm-dd
  validityDays: number;
  status: QuotationStatus;
  /** "twimc" prints "To Whom It May Concern" instead of customer details */
  addressee?: "customer" | "twimc";
  /** print the bank/payment details from Settings on this quote (default true) */
  showBankDetails?: boolean;
  /** print the signature/stamp image from Settings on this quote (default true) */
  showSignature?: boolean;
  /** "add" puts GST on top of prices; "included" treats entered prices as GST-inclusive. undefined → "add" (legacy) */
  gstMode?: "add" | "included";
  customer: CustomerInfo;
  items: LineItem[];
  /** user-defined extra columns shown in the items table and on the print */
  customColumns?: CustomColumn[];
  discount: Discount;
  /** legacy field — tax is now a single flat GST line */
  taxMode?: "cgst_sgst" | "igst";
  notes: string;
  terms: string;
  createdAt: number;
  updatedAt: number;
}

export interface Customer extends CustomerInfo {
  id?: number;
  createdAt: number;
}

export interface Product {
  id?: number;
  name: string;
  hsn: string;
  rate: number;
  /** legacy field — tax is now a flat GST rate on quotation totals */
  gstPct?: number;
  unit: string;
  createdAt: number;
}

export interface Settings {
  id: string; // always "app"
  refPrefix: string;
  refCounters: Record<string, number>; // financial year -> last seq
  defaultTerms: string;
  defaultValidityDays: number;
  /** free-form payment details printed on the quotation (bank a/c, IFSC, UPI…) */
  bankDetails: string;
  /** signature / stamp image as a data URL; empty = signature line only */
  signatureImage: string;
}

export const DEFAULT_TERMS = [
  "Prices are valid for the period mentioned above.",
  "Payment: 100% advance along with purchase order.",
  "Delivery within 3–5 working days from date of order.",
  "Warranty as per manufacturer's terms.",
  "GST extra as applicable, if not mentioned.",
].join("\n");

export const SHOP = {
  name1: "COMPUTER",
  name2: "SOLUTION",
  tagline: "COMPUTERS · LAPTOPS · CCTV · ACCESSORIES",
  gstin: "05AFNPG1904R1Z6",
  address: "Shop No. 13, Capri Trade Center, Chakrata Road, Dehradun (Uttarakhand)",
  email: "computersolutionddn@rediffmail.com",
  contacts: [
    { name: "Praveen Goyal", phone: "94120 52392" },
    { name: "Danish", phone: "73006 66672" },
  ],
};

export const UNITS = ["Pcs", "Nos", "Set", "Box", "Mtr", "Pkt", "Job"];
