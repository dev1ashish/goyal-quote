function Bar({ className = "" }: { className?: string }) {
  return <div className={`neu-inset-sm rounded-lg ${className}`} />;
}

/** Placeholder mirroring the QuotationEditor layout, shown while it loads. */
export function EditorSkeleton() {
  return (
    <div className="mx-auto max-w-5xl motion-safe:animate-pulse" aria-busy="true" aria-label="Loading quotation…">
      {/* Top bar */}
      <div className="mb-8 flex flex-wrap items-center gap-3 sm:gap-4">
        <div className="neu-flat h-[38px] w-[38px] rounded-xl" />
        <div>
          <Bar className="h-6 w-40" />
          <Bar className="mt-1.5 h-3 w-24" />
        </div>
        <div className="ml-auto">
          <Bar className="h-10 w-32 rounded-xl" />
        </div>
      </div>

      {/* Meta card */}
      <div className="neu-raised mb-6 rounded-3xl p-6">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i}>
              <Bar className="mb-2 h-3 w-16" />
              <Bar className="h-10 w-full rounded-xl" />
            </div>
          ))}
        </div>
      </div>

      {/* Customer card */}
      <div className="neu-raised mb-6 rounded-3xl p-6">
        <Bar className="mb-4 h-3 w-28" />
        <div className="grid gap-4 sm:grid-cols-2">
          <Bar className="h-10 w-full rounded-xl" />
          <Bar className="h-10 w-full rounded-xl" />
        </div>
      </div>

      {/* Line items card */}
      <div className="neu-raised mb-6 rounded-3xl p-6">
        <Bar className="mb-4 h-3 w-24" />
        <Bar className="h-12 w-full rounded-xl" />
        <Bar className="mt-3 h-12 w-full rounded-xl" />
      </div>

      {/* Notes + totals */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="neu-raised rounded-3xl p-6">
          <Bar className="mb-4 h-3 w-32" />
          <Bar className="h-24 w-full rounded-xl" />
        </div>
        <div className="neu-raised rounded-3xl p-6">
          <Bar className="mb-4 h-3 w-16" />
          <Bar className="h-24 w-full rounded-xl" />
        </div>
      </div>
    </div>
  );
}
