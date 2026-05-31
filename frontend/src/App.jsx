import { Routes, Route, Link, useLocation } from "react-router-dom";
import RecordPage from "./pages/RecordPage";
import ResultPage from "./pages/ResultPage";
import ArchitecturePage from "./pages/ArchitecturePage";

export default function App() {
  const location = useLocation();

  if (location.pathname === "/architecture") {
    return <ArchitecturePage />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex flex-col">
      <header className="bg-white/80 backdrop-blur-sm border-b border-blue-100 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center gap-3">
          <Link to="/" className="flex items-center gap-3 no-underline">
            <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-semibold text-slate-800 leading-tight">MedVoice</h1>
              <p className="text-xs text-slate-400 leading-tight">Multilingual Medical Transcription</p>
            </div>
          </Link>
        </div>
      </header>

      <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-8">
        <Routes>
          <Route path="/" element={<RecordPage />} />
          <Route path="/result/:jobId" element={<ResultPage />} />
        </Routes>
      </main>

      <footer className="text-center text-xs text-slate-400 py-4 border-t border-blue-50">
        MedVoice &mdash; Medical Voice Processing System
      </footer>
    </div>
  );
}
