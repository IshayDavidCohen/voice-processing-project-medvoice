import { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { getJob, getTranscript, getTerms, getReport } from "../api";
import JobStatus from "../components/JobStatus";
import TranscriptView from "../components/TranscriptView";
import TermsPanel from "../components/TermsPanel";
import ReportView from "../components/ReportView";

export default function ResultPage() {
  const { jobId } = useParams();
  const [job, setJob] = useState(null);
  const [transcript, setTranscript] = useState(null);
  const [terms, setTerms] = useState(null);
  const [report, setReport] = useState(null);
  const [error, setError] = useState(null);
  const pollingRef = useRef(null);

  useEffect(() => {
    let cancelled = false;

    async function poll() {
      try {
        const data = await getJob(jobId);
        if (cancelled) return;
        setJob(data);

        if (data.status === "completed" || data.status === "failed") {
          clearInterval(pollingRef.current);
          if (data.status === "completed") {
            const [t, te, r] = await Promise.all([
              getTranscript(jobId),
              getTerms(jobId),
              getReport(jobId).catch(() => null),
            ]);
            if (!cancelled) {
              setTranscript(t);
              setTerms(te);
              setReport(r);
            }
          }
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message);
          clearInterval(pollingRef.current);
        }
      }
    }

    poll();
    pollingRef.current = setInterval(poll, 2000);

    return () => {
      cancelled = true;
      clearInterval(pollingRef.current);
    };
  }, [jobId]);

  if (error) {
    return (
      <div className="text-center py-16 space-y-4">
        <div className="w-14 h-14 mx-auto rounded-full bg-red-50 flex items-center justify-center">
          <svg className="w-7 h-7 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <p className="text-red-600 font-medium">Something went wrong</p>
        <p className="text-sm text-slate-500 max-w-md mx-auto">{error}</p>
        <Link to="/" className="inline-block text-sm text-blue-600 hover:underline mt-2">
          &larr; Back to recording
        </Link>
      </div>
    );
  }

  if (job?.status === "failed") {
    return (
      <div className="text-center py-16 space-y-4">
        <div className="w-14 h-14 mx-auto rounded-full bg-red-50 flex items-center justify-center">
          <svg className="w-7 h-7 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        <p className="text-red-600 font-medium">Processing Failed</p>
        <p className="text-sm text-slate-500 max-w-md mx-auto">{job.error_message || "An unknown error occurred during processing."}</p>
        <Link to="/" className="inline-block text-sm text-blue-600 hover:underline mt-2">
          &larr; Try again
        </Link>
      </div>
    );
  }

  if (!job || job.status !== "completed") {
    return (
      <div>
        <div className="text-center mb-4">
          <h2 className="text-2xl font-semibold text-slate-800">Processing Audio</h2>
          <p className="text-sm text-slate-500 mt-1">
            Job <code className="text-xs bg-slate-100 px-1.5 py-0.5 rounded">{jobId}</code>
          </p>
        </div>
        <JobStatus status={job?.status || "pending"} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-slate-800">Results</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            {job.original_filename && <span>{job.original_filename} &middot; </span>}
            {job.duration_seconds != null && <span>{Math.round(job.duration_seconds)}s duration</span>}
          </p>
        </div>
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          New Recording
        </Link>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {transcript && <TranscriptView segments={transcript.segments} terms={terms?.terms} />}
        </div>
        <div>
          {terms && <TermsPanel terms={terms.terms} />}
        </div>
      </div>

      {report && <ReportView report={report} />}
    </div>
  );
}
