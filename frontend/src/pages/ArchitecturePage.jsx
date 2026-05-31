export default function ArchitecturePage() {
  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-8">
      <div className="w-full max-w-[720px]">
        <h2 className="text-2xl font-bold text-slate-900 text-center mb-1">
          MedVoice — System Architecture
        </h2>
        <p className="text-sm text-slate-500 text-center mb-6">
          Multilingual Medical Voice Processing Pipeline
        </p>

        <svg
          viewBox="0 0 720 600"
          className="w-full"
          xmlns="http://www.w3.org/2000/svg"
          fontFamily="Inter, system-ui, sans-serif"
        >
          <defs>
            <marker id="ah" viewBox="0 0 10 10" refX="8" refY="5"
              markerWidth="7" markerHeight="7" orient="auto-start-reverse">
              <path d="M2 1L8 5L2 9" fill="none" stroke="context-stroke"
                strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </marker>
          </defs>

          {/* ── BROWSER ── */}
          <rect x="210" y="0" width="300" height="55" rx="10"
            fill="#FFFBEB" stroke="#F59E0B" strokeWidth="2" />
          <text x="360" y="22" textAnchor="middle" fontSize="14" fontWeight="700" fill="#78350F">
            Browser (React)
          </text>
          <text x="310" y="42" textAnchor="middle" fontSize="11" fill="#92400E">
            🎤 Mic recording
          </text>
          <text x="420" y="42" textAnchor="middle" fontSize="11" fill="#92400E">
            📁 File upload
          </text>

          {/* ── ARROW: Browser → Backend ── */}
          <line x1="360" y1="57" x2="360" y2="88"
            stroke="#64748B" strokeWidth="2" markerEnd="url(#ah)" />
          <text x="372" y="77" fontSize="10" fill="#64748B" fontWeight="600">
            audio upload
          </text>

          {/* ── BACKEND CONTAINER (dashed) ── */}
          <rect x="230" y="90" width="260" height="375" rx="14"
            fill="none" stroke="#94A3B8" strokeWidth="1.5" strokeDasharray="8 5" />
          <text x="360" y="106" textAnchor="middle" fontSize="10"
            fill="#64748B" fontWeight="600" letterSpacing="0.5">
            BACKEND (PYTHON · FASTAPI)
          </text>

          {/* ── API ROUTER ── */}
          <rect x="260" y="114" width="200" height="46" rx="8"
            fill="#EFF6FF" stroke="#60A5FA" strokeWidth="1.5" />
          <text x="360" y="133" textAnchor="middle" fontSize="13" fontWeight="700" fill="#1E3A5F">
            API router
          </text>
          <text x="360" y="150" textAnchor="middle" fontSize="10" fill="#3B82F6">
            POST /api/jobs
          </text>

          {/* ↓ */}
          <line x1="360" y1="162" x2="360" y2="180"
            stroke="#93C5FD" strokeWidth="1.5" markerEnd="url(#ah)" />

          {/* ── AUDIO PROCESSING ── */}
          <rect x="260" y="182" width="200" height="46" rx="8"
            fill="#EFF6FF" stroke="#60A5FA" strokeWidth="1.5" />
          <text x="360" y="201" textAnchor="middle" fontSize="13" fontWeight="700" fill="#1E3A5F">
            Audio processing
          </text>
          <text x="360" y="218" textAnchor="middle" fontSize="10" fill="#3B82F6">
            pydub + FFmpeg → 16kHz WAV
          </text>

          {/* ↓ */}
          <line x1="360" y1="230" x2="360" y2="248"
            stroke="#93C5FD" strokeWidth="1.5" markerEnd="url(#ah)" />

          {/* ── WHISPER ASR ── */}
          <rect x="260" y="250" width="200" height="46" rx="8"
            fill="#EFF6FF" stroke="#60A5FA" strokeWidth="1.5" />
          <text x="360" y="269" textAnchor="middle" fontSize="13" fontWeight="700" fill="#1E3A5F">
            Whisper ASR
          </text>
          <text x="360" y="286" textAnchor="middle" fontSize="10" fill="#3B82F6">
            faster-whisper · auto-detect
          </text>

          {/* ↓ */}
          <line x1="360" y1="298" x2="360" y2="316"
            stroke="#93C5FD" strokeWidth="1.5" markerEnd="url(#ah)" />

          {/* ── LEXICON MATCHER ── */}
          <rect x="260" y="318" width="200" height="46" rx="8"
            fill="#EFF6FF" stroke="#60A5FA" strokeWidth="1.5" />
          <text x="360" y="337" textAnchor="middle" fontSize="13" fontWeight="700" fill="#1E3A5F">
            Lexicon matcher
          </text>
          <text x="360" y="354" textAnchor="middle" fontSize="10" fill="#3B82F6">
            rapidfuzz · exact + fuzzy
          </text>

          {/* ↓ */}
          <line x1="360" y1="366" x2="360" y2="384"
            stroke="#93C5FD" strokeWidth="1.5" markerEnd="url(#ah)" />

          {/* ── REPORT GENERATOR ── */}
          <rect x="260" y="386" width="200" height="46" rx="8"
            fill="#EFF6FF" stroke="#60A5FA" strokeWidth="1.5" />
          <text x="360" y="405" textAnchor="middle" fontSize="13" fontWeight="700" fill="#1E3A5F">
            Report generator
          </text>
          <text x="360" y="422" textAnchor="middle" fontSize="10" fill="#3B82F6">
            structured output
          </text>

          {/* ── ARROW: Backend → Results ── */}
          <line x1="360" y1="467" x2="360" y2="502"
            stroke="#64748B" strokeWidth="2" markerEnd="url(#ah)" />
          <text x="372" y="490" fontSize="10" fill="#64748B" fontWeight="600">
            JSON response
          </text>

          {/* ── RESULTS ── */}
          <rect x="210" y="504" width="300" height="55" rx="10"
            fill="#F0FDF4" stroke="#4ADE80" strokeWidth="2" />
          <text x="360" y="526" textAnchor="middle" fontSize="14" fontWeight="700" fill="#14532D">
            Results display
          </text>
          <text x="290" y="546" textAnchor="middle" fontSize="11" fill="#15803D">
            📝 Transcript
          </text>
          <text x="365" y="546" textAnchor="middle" fontSize="11" fill="#6D28D9">
            🏷️ Terms
          </text>
          <text x="430" y="546" textAnchor="middle" fontSize="11" fill="#B45309">
            📄 Report
          </text>

          {/* ════════════════════════════════════════════ */}
          {/* ── LEFT SIDE: FILE STORAGE ── */}
          <rect x="25" y="182" width="155" height="46" rx="8"
            fill="#F1F5F9" stroke="#94A3B8" strokeWidth="1.5" />
          <text x="102" y="201" textAnchor="middle" fontSize="13" fontWeight="700" fill="#334155">
            File storage
          </text>
          <text x="102" y="218" textAnchor="middle" fontSize="10" fill="#64748B" fontFamily="monospace">
            uploads/*.wav
          </text>

          {/* ARROW: Audio Proc → File Storage */}
          <line x1="258" y1="205" x2="182" y2="205"
            stroke="#64748B" strokeWidth="1.5" markerEnd="url(#ah)" />
          <text x="220" y="197" textAnchor="middle" fontSize="10" fill="#64748B" fontWeight="600">
            save
          </text>

          {/* ── LEFT SIDE: CLAUDE API ── */}
          <rect x="25" y="386" width="155" height="46" rx="8"
            fill="#FAF5FF" stroke="#C084FC" strokeWidth="1.5" />
          <text x="102" y="405" textAnchor="middle" fontSize="13" fontWeight="700" fill="#581C87">
            Claude API
          </text>
          <text x="102" y="422" textAnchor="middle" fontSize="10" fill="#9333EA">
            clinical summary
          </text>

          {/* ARROW: Report Gen → Claude API */}
          <line x1="258" y1="409" x2="182" y2="409"
            stroke="#64748B" strokeWidth="1.5" markerEnd="url(#ah)" />
          <text x="220" y="401" textAnchor="middle" fontSize="10" fill="#64748B" fontWeight="600">
            call
          </text>

          {/* ════════════════════════════════════════════ */}
          {/* ── RIGHT SIDE: SQLITE DATABASE ── */}
          <rect x="540" y="234" width="155" height="210" rx="8"
            fill="#F0FDFA" stroke="#2DD4BF" strokeWidth="1.5" />
          <text x="617" y="256" textAnchor="middle" fontSize="14" fontWeight="700" fill="#134E4A">
            SQLite
          </text>
          <line x1="552" y1="266" x2="683" y2="266"
            stroke="#99F6E4" strokeWidth="1" />
          <text x="560" y="288" fontSize="11" fill="#0F766E" fontFamily="monospace">jobs</text>
          <text x="560" y="308" fontSize="11" fill="#0F766E" fontFamily="monospace">segments</text>
          <text x="560" y="328" fontSize="11" fill="#0F766E" fontFamily="monospace">lexicon</text>
          <text x="560" y="348" fontSize="11" fill="#0F766E" fontFamily="monospace">matches</text>
          <text x="560" y="368" fontSize="11" fill="#0F766E" fontFamily="monospace">reports</text>

          {/* ARROW: Whisper → DB (write segments) */}
          <line x1="462" y1="273" x2="538" y2="273"
            stroke="#64748B" strokeWidth="1.5" markerEnd="url(#ah)" />
          <text x="500" y="265" textAnchor="middle" fontSize="10" fill="#64748B" fontWeight="600">
            segments
          </text>

          {/* ARROW: DB → Lexicon (read lexicon) */}
          <line x1="538" y1="341" x2="462" y2="341"
            stroke="#64748B" strokeWidth="1.5" markerEnd="url(#ah)" />
          <text x="500" y="333" textAnchor="middle" fontSize="10" fill="#64748B" fontWeight="600">
            lexicon
          </text>

          {/* ARROW: Report Gen → DB (write report) */}
          <line x1="462" y1="409" x2="538" y2="409"
            stroke="#64748B" strokeWidth="1.5" markerEnd="url(#ah)" />
          <text x="500" y="401" textAnchor="middle" fontSize="10" fill="#64748B" fontWeight="600">
            report
          </text>

          {/* ── TECH STACK FOOTER ── */}
          <text x="360" y="585" textAnchor="middle" fontSize="10" fill="#94A3B8">
            React 19 + Vite · FastAPI + SQLAlchemy · faster-whisper (CTranslate2) · rapidfuzz · SQLite · Anthropic Claude API
          </text>
        </svg>
      </div>
    </div>
  );
}