import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import AudioRecorder from "../components/AudioRecorder";
import FileUploader from "../components/FileUploader";
import { createJob } from "../api";

export default function RecordPage() {
  const navigate = useNavigate();
  const [recordedBlob, setRecordedBlob] = useState(null);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const hasAudio = recordedBlob || uploadedFile;

  const handleRecorded = useCallback((blob) => {
    setRecordedBlob(blob);
    setUploadedFile(null);
    setError(null);
  }, []);

  const handleFileSelected = useCallback((file) => {
    setUploadedFile(file);
    setRecordedBlob(null);
    setError(null);
  }, []);

  async function handleSubmit() {
    if (!hasAudio || submitting) return;
    setSubmitting(true);
    setError(null);

    try {
      const blob = recordedBlob || uploadedFile;
      const filename = uploadedFile ? uploadedFile.name : "recording.webm";
      const data = await createJob(blob, filename);
      navigate(`/result/${data.job_id}`);
    } catch (err) {
      setError(err.message || "Failed to submit audio");
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-2xl font-semibold text-slate-800">New Recording</h2>
        <p className="text-sm text-slate-500 mt-1">Record or upload medical audio for analysis</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className={`bg-white rounded-xl border p-6 transition-shadow ${recordedBlob ? "border-blue-300 shadow-md shadow-blue-100" : "border-slate-200"}`}>
          <div className="flex items-center gap-2 mb-5">
            <div className="w-7 h-7 rounded-md bg-red-50 flex items-center justify-center">
              <svg className="w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            </div>
            <h3 className="text-sm font-semibold text-slate-700">Record Audio</h3>
          </div>
          <AudioRecorder onRecorded={handleRecorded} />
          {recordedBlob && (
            <div className="mt-4 flex items-center justify-center gap-2 text-sm text-green-600">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              Recording captured ({(recordedBlob.size / 1024).toFixed(0)} KB)
            </div>
          )}
        </div>

        <div className={`bg-white rounded-xl border p-6 transition-shadow ${uploadedFile ? "border-blue-300 shadow-md shadow-blue-100" : "border-slate-200"}`}>
          <div className="flex items-center gap-2 mb-5">
            <div className="w-7 h-7 rounded-md bg-blue-50 flex items-center justify-center">
              <svg className="w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
              </svg>
            </div>
            <h3 className="text-sm font-semibold text-slate-700">Upload File</h3>
          </div>
          <FileUploader onFileSelected={handleFileSelected} />
        </div>
      </div>

      <div className="text-center space-y-3">
        {error && (
          <p className="text-sm text-red-500 bg-red-50 rounded-lg px-4 py-2 inline-block">{error}</p>
        )}
        <div>
          <button
            onClick={handleSubmit}
            disabled={!hasAudio || submitting}
            className="inline-flex items-center gap-2 px-8 py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer shadow-lg shadow-blue-200"
          >
            {submitting ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Submitting…
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Analyze Audio
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
