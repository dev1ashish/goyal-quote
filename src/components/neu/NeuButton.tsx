"use client";

import { motion, type HTMLMotionProps } from "motion/react";
import { forwardRef } from "react";

type Variant = "default" | "primary" | "gold" | "danger" | "ghost";

interface NeuButtonProps extends HTMLMotionProps<"button"> {
  variant?: Variant;
  size?: "sm" | "md" | "lg";
}

const variantClasses: Record<Variant, string> = {
  default: "neu-flat text-teal hover:text-teal-soft",
  primary: "bg-teal text-on-accent shadow-[5px_5px_12px_var(--neu-dark),-5px_-5px_12px_var(--neu-light)]",
  gold: "bg-gold text-on-accent shadow-[5px_5px_12px_var(--neu-dark),-5px_-5px_12px_var(--neu-light)]",
  danger: "neu-flat text-red-800 dark:text-red-400",
  ghost: "text-ink-soft hover:text-teal",
};

const sizeClasses = {
  sm: "px-3 py-1.5 text-xs rounded-xl gap-1.5",
  md: "px-5 py-2.5 text-sm rounded-2xl gap-2",
  lg: "px-7 py-3.5 text-base rounded-2xl gap-2.5",
};

export const NeuButton = forwardRef<HTMLButtonElement, NeuButtonProps>(
  function NeuButton(
    { variant = "default", size = "md", className = "", children, ...props },
    ref
  ) {
    return (
      <motion.button
        ref={ref}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.96 }}
        transition={{ type: "spring", stiffness: 500, damping: 25 }}
        className={`inline-flex items-center justify-center font-semibold tracking-wide cursor-pointer select-none disabled:opacity-40 disabled:pointer-events-none ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
        {...props}
      >
        {children}
      </motion.button>
    );
  }
);
