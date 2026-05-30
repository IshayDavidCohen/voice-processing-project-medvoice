function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

const LANG_BADGES = {
  he: { label: "HE", cls: "bg-amber-100 text-amber-700" },
  en: { label: "EN", cls: "bg-sky-100 text-sky-700" },
  la: { label: "LA", cls: "bg-purple-100 text-purple-700" },
};

function isHebrew(text) {
  return /[\u0590-\u05FF]/.test(text);
}

function highlightTerms(text, matchedTerms) {
  if (!matchedTerms || matchedTerms.length === 0) return text;

  const termsInSegment = matchedTerms.map((t) => t.term);
  const escaped = termsInSegment.map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  const pattern = new RegExp(`(${escaped.join("|")})`, "gi");
  const parts = text.split(pattern);

  return parts.map((part, i) => {
    const isMatch = termsInSegment.some(
      (t) => t.toLowerCase() === part.toLowerCase()
    );
    return isMatch ? (
      <mark key={i} className="bg-emerald-100 text-emerald-800 px-1 rounded font-medium">
        {part}
      </mark>
    ) : (
      part
    );
  });
}

export default function TranscriptView({ segments, terms = [] }) {
  const termsBySegment = {};
  for (const t of terms) {
    const idx = t.segment_index;
    if (idx != null) {
      if (!termsBySegment[idx]) termsBySegment[idx] = [];
      termsBySegment[idx].push(t);
    }
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <div className="px-5 py-3 border-b border-slate-100 flex items-center gap-2">
        <svg className="w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <h3 className="text-sm font-semibold text-slate-700">Transcript</h3>
      </div>

      <div className="divide-y divide-slate-50">
        {segments.map((seg) => {
          const badge = LANG_BADGES[seg.language] || LANG_BADGES.en;
          const rtl = isHebrew(seg.text);
          const matched = termsBySegment[seg.index] || [];

          return (
            <div key={seg.index} className="flex items-start gap-3 px-5 py-3 hover:bg-slate-50/50 transition-colors">
              <span className="text-xs font-mono text-slate-400 pt-0.5 w-12 shrink-0 text-right">
                [{formatTime(seg.start)}]
              </span>
              <p
                className="flex-1 text-sm text-slate-700 leading-relaxed"
                dir={rtl ? "rtl" : "ltr"}
              >
                {highlightTerms(seg.text, matched)}
              </p>
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded shrink-0 ${badge.cls}`}>
                {badge.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
