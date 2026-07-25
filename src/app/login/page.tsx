"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { Lock, ArrowRight } from "lucide-react";
import { NeuButton } from "@/components/neu/NeuButton";
import { NeuInput } from "@/components/neu/NeuInput";

export default function LoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password || busy) return;
    setBusy(true);
    setError(false);
    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    }).catch(() => null);
    if (res?.ok) {
      router.replace("/");
      router.refresh();
    } else {
      setError(true);
      setBusy(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 24 }}
        className="neu-raised w-full max-w-sm rounded-3xl p-8"
      >
        <div className="mb-2 text-center text-2xl font-black tracking-[0.08em]">
          <span className="text-teal">COMPUTER</span>{" "}
          <span className="text-gold">SOLUTION</span>
        </div>
        <p className="mb-8 text-center text-[10px] font-semibold tracking-[0.24em] text-ink-soft">
          COMPUTERS · LAPTOPS · CCTV · ACCESSORIES
        </p>

        <div className="neu-pressed mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl text-gold">
          <Lock size={22} />
        </div>

        <form onSubmit={submit} className="flex flex-col gap-4">
          <motion.div
            animate={error ? { x: [0, -8, 8, -6, 6, -3, 3, 0] } : {}}
            transition={{ duration: 0.4 }}
          >
            <NeuInput
              type="password"
              placeholder="Enter password"
              value={password}
              autoFocus
              onChange={(e) => {
                setPassword(e.target.value);
                setError(false);
              }}
              className="text-center"
            />
          </motion.div>
          {error && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center text-xs font-semibold text-red-700 dark:text-red-400"
            >
              Wrong password — try again.
            </motion.p>
          )}
          <NeuButton
            variant="gold"
            size="lg"
            type="submit"
            disabled={!password || busy}
            className="w-full"
          >
            {busy ? "Checking…" : "Enter"}
            {!busy && <ArrowRight size={16} />}
          </NeuButton>
        </form>
      </motion.div>
    </div>
  );
}
