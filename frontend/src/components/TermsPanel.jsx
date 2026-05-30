const CATEGORY_STYLES = {
  anatomy: { bg: "bg-sky-50", border: "border-sky-200", text: "text-sky-700", dot: "bg-sky-400" },
  procedure: { bg: "bg-violet-50", border: "border-violet-200", text: "text-violet-700", dot: "bg-violet-400" },
  condition: { bg: "bg-rose-50", border: "border-rose-200", text: "text-rose-700", dot: "bg-rose-400" },
  instrument: { bg: "bg-amber-50", border: "border-amber-200", text: "text-amber-700", dot: "bg-amber-400" },
};

const CATEGORY_LABELS = {
  anatomy: "Anatomy",
  procedure: "Procedures",
  condition: "Conditions",
  instrument: "Instruments",
};

function groupByCategory(terms) {
  const groups = {};
  const seen = new Set();
  for (const t of terms) {
    const key = `${t.term}-${t.category}`;
    if (seen.has(key)) continue;
    seen.add(key);
    const cat = t.category || "other";
    if (!groups[cat]) groups[cat] = [];
    groups[cat].push(t);
  }
  return groups;
}

export default function TermsPanel({ terms }) {
  const groups = groupByCategory(terms);
  const categories = Object.keys(CATEGORY_LABELS).filter((c) => groups[c]);
  const other = groups.other;

  if (terms.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-6 text-center text-sm text-slate-400">
        No medical terms detected.
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <div className="px-5 py-3 border-b border-slate-100 flex items-center gap-2">
        <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
        </svg>
        <h3 className="text-sm font-semibold text-slate-700">
          Detected Terms
          <span className="ml-2 text-xs font-normal text-slate-400">({terms.length})</span>
        </h3>
      </div>

      <div className="p-5 space-y-5">
        {categories.map((cat) => {
          const style = CATEGORY_STYLES[cat];
          return (
            <div key={cat}>
              <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                {CATEGORY_LABELS[cat]}
              </h4>
              <div className="flex flex-wrap gap-2">
                {groups[cat].map((t, i) => (
                  <span
                    key={i}
                    title={t.definition || t.term}
                    className={`group relative inline-flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-full border cursor-default transition-shadow hover:shadow-sm ${style.bg} ${style.border} ${style.text}`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
                    {t.term}
                    {t.match_type === "fuzzy" && (
                      <span className="text-[10px] opacity-60 ml-0.5">~{Math.round((t.score || 0) * 100)}%</span>
                    )}
                    {t.definition && (
                      <span className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 text-xs text-white bg-slate-800 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                        {t.definition}
                      </span>
                    )}
                  </span>
                ))}
              </div>
            </div>
          );
        })}

        {other && (
          <div>
            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Other</h4>
            <div className="flex flex-wrap gap-2">
              {other.map((t, i) => (
                <span
                  key={i}
                  title={t.definition || t.term}
                  className="inline-flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-full border bg-slate-50 border-slate-200 text-slate-600"
                >
                  {t.term}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
