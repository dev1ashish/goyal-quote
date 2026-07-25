"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import {
  FileText,
  IndianRupee,
  BadgeCheck,
  Send,
  Plus,
  Printer,
  ArrowRight,
} from "lucide-react";
import { useStore, listQuotations } from "@/lib/store";
import { computeTotals, fmtMoney, fmtMoneyWhole } from "@/lib/calc";
import { fmtDate } from "@/lib/ref-number";
import { AnimatedNumber } from "@/components/neu/AnimatedNumber";
import { StatusChip } from "@/components/neu/StatusChip";
import { NeuButton } from "@/components/neu/NeuButton";

export default function DashboardPage() {
  const router = useRouter();

  const stats = useStore(async () => {
    const all = await listQuotations();
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime();

    let monthCount = 0;
    let monthValue = 0;
    let acceptedValue = 0;
    let sentCount = 0;

    for (const q of all) {
      const total = computeTotals(q.items, q.discount).grandTotal;
      if (q.createdAt >= monthStart) {
        monthCount++;
        monthValue += total;
      }
      if (q.status === "accepted") acceptedValue += total;
      if (q.status === "sent") sentCount++;
    }

    return { monthCount, monthValue, acceptedValue, sentCount, total: all.length };
  }, []);

  const recent = useStore(
    async () => (await listQuotations()).slice(0, 6),
    []
  );

  const monthName = new Date().toLocaleString("en-IN", { month: "long" });

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-wide text-teal">
            Dashboard
          </h1>
          <p className="mt-0.5 text-sm text-ink-soft">
            Welcome back — here&apos;s how {monthName} is going.
          </p>
        </div>
        <Link href="/quotations/new">
          <NeuButton variant="gold" size="lg" tabIndex={-1}>
            <Plus size={17} strokeWidth={3} /> New Quotation
          </NeuButton>
        </Link>
      </div>

      {/* Stat cards */}
      <div className="mb-10 grid grid-cols-2 gap-6 lg:grid-cols-4">
        <StatCard
          icon={<FileText size={18} />}
          label={`Quotes in ${monthName}`}
          delay={0}
        >
          <AnimatedNumber value={stats?.monthCount ?? 0} />
        </StatCard>
        <StatCard
          icon={<IndianRupee size={18} />}
          label={`Quoted in ${monthName}`}
          delay={0.06}
        >
          ₹<AnimatedNumber value={stats?.monthValue ?? 0} format={fmtMoneyWhole} />
        </StatCard>
        <StatCard
          icon={<BadgeCheck size={18} />}
          label="Accepted (all time)"
          delay={0.12}
        >
          ₹
          <AnimatedNumber
            value={stats?.acceptedValue ?? 0}
            format={fmtMoneyWhole}
          />
        </StatCard>
        <StatCard
          icon={<Send size={18} />}
          label="Awaiting reply"
          delay={0.18}
        >
          <AnimatedNumber value={stats?.sentCount ?? 0} />
        </StatCard>
      </div>

      {/* Recent quotations */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xs font-black uppercase tracking-[0.18em] text-gold">
          Recent Quotations
        </h2>
        {(stats?.total ?? 0) > 0 && (
          <Link
            href="/quotations"
            className="flex items-center gap-1 text-sm font-semibold text-teal hover:text-gold"
          >
            View all <ArrowRight size={14} />
          </Link>
        )}
      </div>

      {recent && recent.length === 0 && (
        <div className="neu-inset flex flex-col items-center gap-3 rounded-3xl py-16 text-center">
          <FileText size={32} className="text-gold" />
          <p className="font-semibold text-teal">No quotations yet</p>
          <p className="mb-2 text-sm text-ink-soft">
            Create your first quotation — it takes under a minute.
          </p>
          <Link href="/quotations/new">
            <NeuButton variant="gold" tabIndex={-1}>
              <Plus size={15} strokeWidth={3} /> New Quotation
            </NeuButton>
          </Link>
        </div>
      )}

      <ul className="flex flex-col gap-4">
        {recent?.map((q, i) => {
          const total = computeTotals(q.items, q.discount).grandTotal;
          return (
            <motion.li
              key={q.id}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: 0.1 + i * 0.05,
                type: "spring",
                stiffness: 300,
                damping: 28,
              }}
            >
              <Link
                href={`/quotations/${q.id}`}
                className="neu-raised group flex flex-wrap items-center gap-x-5 gap-y-2 rounded-3xl px-5 py-4 transition-transform hover:-translate-y-0.5 sm:px-6"
              >
                <div className="min-w-36">
                  <div className="font-mono text-xs font-bold text-gold">
                    {q.refNo}
                  </div>
                  <div className="mt-0.5 text-xs text-ink-soft">
                    {fmtDate(q.date)}
                  </div>
                </div>
                <div className="min-w-0 flex-1 truncate font-bold text-teal">
                  {q.customer.name || "—"}
                </div>
                <StatusChip status={q.status} />
                <div className="w-32 text-right font-black tabular-nums text-teal">
                  ₹{fmtMoney(total)}
                </div>
                <button
                  type="button"
                  title="Print / PDF"
                  onClick={(e) => {
                    e.preventDefault();
                    router.push(`/print/${q.id}`);
                  }}
                  className="rounded-xl p-2 text-ink-soft/50 transition-all hover:text-teal lg:opacity-0 lg:group-hover:opacity-100"
                >
                  <Printer size={15} />
                </button>
              </Link>
            </motion.li>
          );
        })}
      </ul>
    </div>
  );
}

function StatCard({
  icon,
  label,
  delay,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  delay: number;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, type: "spring", stiffness: 260, damping: 24 }}
      whileHover={{ y: -3 }}
      className="neu-raised rounded-3xl p-5"
    >
      <div className="neu-pressed inline-flex rounded-xl p-2.5 text-gold">
        {icon}
      </div>
      <div className="mt-3 text-2xl font-black tabular-nums text-teal">
        {children}
      </div>
      <div className="mt-1 text-xs font-semibold text-ink-soft">{label}</div>
    </motion.div>
  );
}
