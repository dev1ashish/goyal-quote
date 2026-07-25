"use client";

import { useEffect, useRef } from "react";
import { animate, useMotionValue, useTransform, motion } from "motion/react";

interface AnimatedNumberProps {
  value: number;
  format?: (n: number) => string;
  className?: string;
}

export function AnimatedNumber({
  value,
  format = (n) => new Intl.NumberFormat("en-IN").format(Math.round(n)),
  className = "",
}: AnimatedNumberProps) {
  const mv = useMotionValue(0);
  const display = useTransform(mv, (v) => format(v));
  const first = useRef(true);

  useEffect(() => {
    const controls = animate(mv, value, {
      duration: first.current ? 0.9 : 0.4,
      ease: [0.22, 1, 0.36, 1],
    });
    first.current = false;
    return controls.stop;
  }, [value, mv]);

  return <motion.span className={`tabular-nums ${className}`}>{display}</motion.span>;
}
