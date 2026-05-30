const STEPS = [
  { key: "pending", label: "Preparing audio…" },
  { key: "processing", label: "Transcribing & analyzing…" },
  { key: "completed", label: "Complete" },
];

export default function JobStatus({ status }) {
  const activeIdx = STEPS.findIndex((s) => s.key === status);

  return (
    <div className="flex flex-col items-center gap-6 py-12">
      {status !== "completed" && status !== "failed" && (
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full border-4 border-blue-100" />
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-500 animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <svg className="w-6 h-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
          </div>
        </div>
      )}

      <div className="flex items-center gap-3">
        {STEPS.map((step, i) => (
          <div key={step.key} className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div
                className={`w-3 h-3 rounded-full transition-colors ${
                  i < activeIdx
                    ? "bg-green-400"
                    : i === activeIdx
                    ? "bg-blue-500 animate-pulse"
                    : "bg-slate-200"
                }`}
              />
              <span
                className={`text-sm ${
                  i === activeIdx ? "text-blue-700 font-medium" : "text-slate-400"
                }`}
              >
                {step.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`w-8 h-px ${i < activeIdx ? "bg-green-300" : "bg-slate-200"}`} />
            )}
          </div>
        ))}
      </div>

      {status !== "completed" && status !== "failed" && (
        <div className="w-full max-w-lg space-y-3 mt-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex gap-3 animate-pulse">
              <div className="w-12 h-4 bg-slate-200 rounded" />
              <div className="flex-1 h-4 bg-slate-100 rounded" />
              <div className="w-8 h-4 bg-slate-200 rounded" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
