"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";
import {
  LayoutDashboard,
  FileText,
  Users,
  Package,
  Settings,
  Plus,
} from "lucide-react";
import { NeuButton } from "./neu/NeuButton";
import { ThemeToggle } from "./ThemeToggle";

const NAV = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/quotations", label: "Quotations", icon: FileText },
  { href: "/customers", label: "Customers", icon: Users },
  { href: "/products", label: "Products", icon: Package },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Brand() {
  return (
    <Link href="/" className="block">
      <div className="text-xl font-black tracking-[0.08em] leading-none">
        <span className="text-teal">COMPUTER</span>{" "}
        <span className="text-gold">SOLUTION</span>
      </div>
      <div className="mt-1.5 text-[9px] font-semibold tracking-[0.22em] text-ink-soft">
        COMPUTERS · LAPTOPS · CCTV
      </div>
    </Link>
  );
}

export function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col gap-8 p-6">
      <div className="pt-2">
        <Brand />
      </div>

      <Link href="/quotations/new" className="block" onClick={onNavigate}>
        <NeuButton variant="gold" size="md" className="w-full" tabIndex={-1}>
          <Plus size={16} strokeWidth={3} />
          New Quotation
        </NeuButton>
      </Link>

      <nav className="flex flex-col gap-1.5">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active =
            href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              onClick={onNavigate}
              className={`relative flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition-colors ${
                active ? "text-teal" : "text-ink-soft hover:text-teal"
              }`}
            >
              {active && (
                <motion.span
                  layoutId="nav-active"
                  className="absolute inset-0 rounded-2xl neu-pressed"
                  transition={{ type: "spring", stiffness: 400, damping: 32 }}
                />
              )}
              <Icon size={17} className="relative z-10" />
              <span className="relative z-10">{label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto flex items-end justify-between gap-3">
        <div className="text-[10px] leading-relaxed text-ink-soft/70">
          Shop No. 13, Capri Trade Center,
          <br />
          Chakrata Road, Dehradun
        </div>
        <ThemeToggle />
      </div>
    </div>
  );
}
