const BASE = "http://localhost:8000/api";

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, options);
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`API ${res.status}: ${body}`);
  }
  if (res.status === 204) return null;
  return res.json();
}

export function createJob(audioBlob, filename = "recording.webm") {
  const form = new FormData();
  form.append("audio", audioBlob, filename);
  form.append("source", filename === "recording.webm" ? "mic" : "upload");
  return request("/jobs", { method: "POST", body: form });
}

export function getJob(jobId) {
  return request(`/jobs/${jobId}`);
}

export function getTranscript(jobId) {
  return request(`/jobs/${jobId}/transcript`);
}

export function getTerms(jobId) {
  return request(`/jobs/${jobId}/terms`);
}

export function getReport(jobId) {
  return request(`/jobs/${jobId}/report`);
}

export function getLexicon(category, language) {
  const params = new URLSearchParams();
  if (category) params.set("category", category);
  if (language) params.set("language", language);
  const qs = params.toString();
  return request(`/lexicon${qs ? `?${qs}` : ""}`);
}
