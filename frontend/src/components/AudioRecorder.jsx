import { useState, useEffect, useRef, useCallback } from "react";

export default function AudioRecorder({ onRecorded }) {
  const [devices, setDevices] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState("");
  const [recording, setRecording] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const mediaRecorder = useRef(null);
  const chunks = useRef([]);
  const timerRef = useRef(null);
  const startTime = useRef(0);

  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then(() => navigator.mediaDevices.enumerateDevices())
      .then((devs) => {
        const mics = devs.filter((d) => d.kind === "audioinput");
        setDevices(mics);
        if (mics.length > 0) setSelectedDevice(mics[0].deviceId);
      })
      .catch(() => {});
  }, []);

  const start = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: selectedDevice ? { deviceId: { exact: selectedDevice } } : true,
      });

      const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : "audio/webm";

      const recorder = new MediaRecorder(stream, { mimeType });
      chunks.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.current.push(e.data);
      };

      recorder.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
        clearInterval(timerRef.current);
        const blob = new Blob(chunks.current, { type: mimeType });
        onRecorded(blob);
      };

      recorder.start(250);
      mediaRecorder.current = recorder;
      startTime.current = Date.now();
      setElapsed(0);
      setRecording(true);

      timerRef.current = setInterval(() => {
        setElapsed(Math.floor((Date.now() - startTime.current) / 1000));
      }, 250);
    } catch {
      /* mic permission denied */
    }
  }, [selectedDevice, onRecorded]);

  const stop = useCallback(() => {
    if (mediaRecorder.current?.state === "recording") {
      mediaRecorder.current.stop();
    }
    setRecording(false);
  }, []);

  const mm = String(Math.floor(elapsed / 60)).padStart(2, "0");
  const ss = String(elapsed % 60).padStart(2, "0");

  return (
    <div className="flex flex-col items-center gap-5">
      <select
        value={selectedDevice}
        onChange={(e) => setSelectedDevice(e.target.value)}
        disabled={recording}
        className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-50"
      >
        {devices.length === 0 && <option>No microphones found</option>}
        {devices.map((d) => (
          <option key={d.deviceId} value={d.deviceId}>
            {d.label || `Microphone ${d.deviceId.slice(0, 8)}`}
          </option>
        ))}
      </select>

      <button
        onClick={recording ? stop : start}
        disabled={devices.length === 0}
        className="group relative w-20 h-20 rounded-full bg-white border-4 border-slate-200 hover:border-red-300 flex items-center justify-center transition-all disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
      >
        {recording ? (
          <>
            <span className="absolute inset-0 rounded-full bg-red-100 animate-ping opacity-30" />
            <span className="w-7 h-7 rounded-sm bg-red-500" />
          </>
        ) : (
          <span className="w-10 h-10 rounded-full bg-red-500 group-hover:bg-red-600 transition-colors" />
        )}
      </button>

      <span className={`font-mono text-2xl tabular-nums ${recording ? "text-red-600" : "text-slate-400"}`}>
        {mm}:{ss}
      </span>

      {recording && (
        <span className="flex items-center gap-2 text-sm text-red-500 font-medium">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          Recording…
        </span>
      )}
    </div>
  );
}
