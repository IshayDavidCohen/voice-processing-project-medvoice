import { useState, useRef, useCallback } from "react";

const ACCEPTED = ".wav,.mp3,.webm,.ogg,.m4a,.flac,.mp4";
const ACCEPTED_SET = new Set(["wav", "mp3", "webm", "ogg", "m4a", "flac", "mp4"]);

export default function FileUploader({ onFileSelected }) {
  const [dragOver, setDragOver] = useState(false);
  const [fileName, setFileName] = useState(null);
  const [error, setError] = useState(null);
  const inputRef = useRef(null);

  const handleFile = useCallback(
    (file) => {
      if (!file) return;
      const ext = file.name.split(".").pop()?.toLowerCase();
      if (!ACCEPTED_SET.has(ext)) {
        setError(`Unsupported file type: .${ext}`);
        setFileName(null);
        onFileSelected(null);
        return;
      }
      setError(null);
      setFileName(file.name);
      onFileSelected(file);
    },
    [onFileSelected]
  );

  const onDrop = useCallback(
    (e) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer?.files?.[0];
      handleFile(file);
    },
    [handleFile]
  );

  return (
    <div className="flex flex-col items-center gap-4">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
        className={`w-full border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all ${
          dragOver
            ? "border-blue-400 bg-blue-50"
            : "border-slate-200 hover:border-blue-300 hover:bg-slate-50"
        }`}
      >
        <svg className="w-10 h-10 mx-auto text-slate-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
        </svg>
        <p className="text-sm text-slate-500">
          <span className="font-medium text-blue-600">Click to browse</span> or drag & drop
        </p>
        <p className="text-xs text-slate-400 mt-1">WAV, MP3, WebM, OGG, M4A, FLAC</p>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED}
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />

      {fileName && (
        <div className="flex items-center gap-2 text-sm text-slate-600 bg-blue-50 rounded-lg px-4 py-2 w-full">
          <svg className="w-4 h-4 text-blue-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="truncate">{fileName}</span>
        </div>
      )}

      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}
    </div>
  );
}
