"use client";

import { forwardRef } from "react";

const baseField =
  "neu-inset-sm rounded-xl px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-soft/60 focus:shadow-[inset_2px_2px_4px_var(--neu-dark),inset_-2px_-2px_4px_var(--neu-light),0_0_0_2px_var(--gold-soft)] transition-shadow w-full";

export const NeuInput = forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(function NeuInput({ className = "", ...props }, ref) {
  return <input ref={ref} className={`${baseField} ${className}`} {...props} />;
});

export const NeuTextarea = forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(function NeuTextarea({ className = "", ...props }, ref) {
  return (
    <textarea ref={ref} className={`${baseField} resize-y ${className}`} {...props} />
  );
});

export const NeuSelect = forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement>
>(function NeuSelect({ className = "", children, ...props }, ref) {
  return (
    <select ref={ref} className={`${baseField} cursor-pointer ${className}`} {...props}>
      {children}
    </select>
  );
});

export function Field({
  label,
  children,
  className = "",
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={`flex flex-col gap-1.5 ${className}`}>
      <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-ink-soft">
        {label}
      </span>
      {children}
    </label>
  );
}
