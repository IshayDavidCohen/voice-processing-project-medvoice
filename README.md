# MedVoice

Multilingual medical voice processing system. Upload or record audio of medical speech in Hebrew, English, or mixed, and get back a timestamped transcript, detected medical terminology, and an optional clinical summary.

## How it works

1. Audio is uploaded or recorded in the browser
2. The backend converts it to 16 kHz mono WAV and runs it through [faster-whisper](https://github.com/SYSTRAN/faster-whisper) for multilingual transcription
3. Transcript segments are matched against a medical lexicon (exact + fuzzy matching via [rapidfuzz](https://github.com/rapidfuzz/RapidFuzz))
4. A structured report is generated, optionally with a clinical summary from the Anthropic Claude API

## Project structure

```
medvoice/
├── backend/
│   ├── main.py                 # FastAPI app, CORS, startup
│   ├── config.py               # Settings (env vars, model size, paths)
│   ├── database.py             # SQLAlchemy engine + session
│   ├── models.py               # ORM models (jobs, segments, lexicon, reports)
│   ├── schemas.py              # Pydantic request/response models
│   ├── seed_lexicon.py         # Populates ~50 medical terms
│   ├── routers/
│   │   ├── jobs.py             # POST /api/jobs, GET status/transcript/terms
│   │   ├── reports.py          # GET /api/jobs/{id}/report
│   │   └── lexicon.py          # CRUD /api/lexicon
│   └── services/
│       ├── audio_ingestion.py  # Validate + save uploaded audio
│       ├── audio_processing.py # Convert to Whisper-compatible format
│       ├── transcription.py    # faster-whisper model loading + transcribe
│       ├── lexicon_matcher.py  # Post-ASR term detection
│       └── report_generator.py # Assemble report + Claude API summary
├── frontend/
│   ├── src/
│   │   ├── api.js              # Backend API client
│   │   ├── App.jsx             # Router + layout
│   │   ├── pages/              # RecordPage, ResultPage
│   │   └── components/         # AudioRecorder, FileUploader, TranscriptView, etc.
│   └── package.json
└── MedVoice_Architecture.md    # Detailed design document
```

## Prerequisites

- **Python 3.11+**
- **Node.js 18+**
- **FFmpeg** on your PATH (required by pydub for audio conversion)

## Setup

### Backend

```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate
# macOS/Linux
source venv/bin/activate

pip install -r requirements.txt
```

Create a `.env` file in the project root (optional):

```
WHISPER_MODEL_SIZE=medium
ANTHROPIC_API_KEY=sk-ant-your-key-here
```

| Variable | Default | Description |
|---|---|---|
| `WHISPER_MODEL_SIZE` | `medium` | Whisper model size (`tiny`, `small`, `medium`, `large-v3`) |
| `WHISPER_COMPUTE_TYPE` | `int8` | Quantization type for faster-whisper |
| `ANTHROPIC_API_KEY` | *(empty)* | Enables the Claude-powered clinical summary. Without it, reports are still generated but without the summary. |
| `FUZZY_MATCH_THRESHOLD` | `85` | Minimum similarity score (0–100) for fuzzy lexicon matching |
| `MAX_AUDIO_SIZE_MB` | `50` | Maximum upload size in megabytes |

Seed the medical lexicon and start the server:

```bash
# From the project root
python -m backend.seed_lexicon
uvicorn backend.main:app --reload --port 8000
```

The first startup downloads the Whisper model (~1.5 GB for `medium`). Subsequent starts load from cache.

API docs are available at http://localhost:8000/docs

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Opens at http://localhost:5173

## API endpoints

| Method | Path | Description |
|---|---|---|
| `POST` | `/api/jobs` | Upload audio (multipart), starts processing pipeline |
| `GET` | `/api/jobs/{id}` | Poll job status (`pending` → `processing` → `completed`) |
| `GET` | `/api/jobs/{id}/transcript` | Timestamped transcript segments |
| `GET` | `/api/jobs/{id}/terms` | Detected medical terms with match scores |
| `GET` | `/api/jobs/{id}/report` | Full report with optional clinical summary |
| `GET` | `/api/lexicon` | List lexicon terms (filterable by `?category=` and `?language=`) |
| `POST` | `/api/lexicon` | Add a lexicon term |
| `DELETE` | `/api/lexicon/{id}` | Remove a lexicon term |

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite, Tailwind CSS v4 |
| Backend | Python, FastAPI, SQLAlchemy 2.x |
| ASR | faster-whisper (CTranslate2) |
| Lexicon matching | rapidfuzz |
| Database | SQLite |
| Summary (optional) | Anthropic Claude API |
