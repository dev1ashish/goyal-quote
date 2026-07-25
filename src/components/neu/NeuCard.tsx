"use client";

import { motion, type HTMLMotionProps } from "motion/react";

interface NeuCardProps extends HTMLMotionProps<"div"> {
  inset?: boolean;
  hover?: boolean;
}

export function NeuCard({
  inset = false,
  hover = false,
  className = "",
  children,
  ...props
}: NeuCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 260, damping: 26 }}
      whileHover={hover ? { y: -3 } : undefined}
      className={`rounded-3xl ${inset ? "neu-inset" : "neu-raised"} ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  );
}
