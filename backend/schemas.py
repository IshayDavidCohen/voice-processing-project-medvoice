from pydantic import BaseModel


class JobCreateResponse(BaseModel):
    job_id: str
    status: str = "pending"


class JobStatusResponse(BaseModel):
    job_id: str
    status: str
    original_filename: str | None = None
    duration_seconds: float | None = None
    created_at: str
    updated_at: str
    error_message: str | None = None


class TranscriptSegmentOut(BaseModel):
    index: int
    start: float
    end: float
    text: str
    language: str | None = None
    confidence: float | None = None


class TranscriptResponse(BaseModel):
    job_id: str
    segments: list[TranscriptSegmentOut]


class DetectedTermOut(BaseModel):
    term: str
    category: str | None = None
    language: str | None = None
    definition: str | None = None
    match_type: str
    score: float | None = None
    context: str | None = None
    segment_index: int | None = None


class DetectedTermsResponse(BaseModel):
    job_id: str
    terms: list[DetectedTermOut]


class ReportResponse(BaseModel):
    job_id: str
    full_transcript: str
    detected_terms: list[DetectedTermOut]
    summary: str | None = None
    metadata: dict | None = None
    created_at: str


class LexiconTermCreate(BaseModel):
    term: str
    language: str = "la"
    category: str | None = None
    definition: str | None = None
    aliases: list[str] | None = None


class LexiconTermOut(BaseModel):
    id: int
    term: str
    language: str
    category: str | None = None
    definition: str | None = None
    aliases: list[str] | None = None


class LexiconListResponse(BaseModel):
    terms: list[LexiconTermOut]


class LexiconCreateResponse(BaseModel):
    id: int
    term: str
