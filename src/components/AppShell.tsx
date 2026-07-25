"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Menu, X } from "lucide-react";
import { Brand, SidebarContent } from "./Sidebar";
import { ThemeToggle } from "./ThemeToggle";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setDrawerOpen(false);
  }, [pathname]);

  return (
    <div className="min-h-screen">
      {/* Desktop sidebar */}
      <aside className="no-print fixed inset-y-0 left-0 z-20 hidden w-60 lg:block">
        <SidebarContent />
      </aside>

      {/* Mobile top bar */}
      <header className="no-print sticky top-0 z-20 flex items-center gap-3 bg-surface/85 px-4 py-3 backdrop-blur lg:hidden">
        <button
          type="button"
          onClick={() => setDrawerOpen(true)}
          className="neu-flat rounded-xl p-2.5 text-teal"
          aria-label="Open menu"
        >
          <Menu size={18} />
        </button>
        <Brand />
        <div className="ml-auto">
          <ThemeToggle />
        </div>
      </header>

      {/* Mobile drawer */}
      <AnimatePresence>
        {drawerOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDrawerOpen(false)}
              className="no-print fixed inset-0 z-30 bg-black/40 lg:hidden"
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 380, damping: 36 }}
              className="no-print fixed inset-y-0 left-0 z-40 w-72 bg-surface shadow-2xl lg:hidden"
            >
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                className="absolute right-4 top-4 rounded-xl p-2 text-ink-soft hover:text-teal"
                aria-label="Close menu"
              >
                <X size={18} />
              </button>
              <SidebarContent onNavigate={() => setDrawerOpen(false)} />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <main className="min-h-screen px-4 py-6 sm:px-8 lg:ml-60 lg:px-10 lg:py-8">
        {children}
      </main>
    </div>
  );
}
