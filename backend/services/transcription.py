from __future__ import annotations

import logging
from dataclasses import dataclass
from pathlib import Path

from faster_whisper import WhisperModel

from backend.config import settings

logger = logging.getLogger(__name__)

_model: WhisperModel | None = None


@dataclass
class Segment:
    start: float
    end: float
    text: str
    language: str | None = None
    confidence: float | None = None


def load_model() -> WhisperModel:
    global _model
    if _model is None:
        logger.info(
            "Loading faster-whisper model '%s' (compute_type=%s)…",
            settings.whisper_model_size,
            settings.whisper_compute_type,
        )
        _model = WhisperModel(
            settings.whisper_model_size,
            device="cpu",
            compute_type=settings.whisper_compute_type,
        )
        logger.info("Whisper model loaded.")
    return _model


def get_model() -> WhisperModel:
    if _model is None:
        raise RuntimeError("Whisper model not loaded — call load_model() first")
    return _model


def transcribe(audio_path: Path) -> tuple[list[Segment], str | None]:
    model = get_model()
    segments_gen, info = model.transcribe(
        str(audio_path),
        language=None,
        word_timestamps=True,
        vad_filter=True,
        initial_prompt="שלום, זה תיעוד רפואי. Medical documentation in Hebrew and English.",
    )

    detected_lang = getattr(info, "language", None)
    results: list[Segment] = []
    for seg in segments_gen:
        results.append(
            Segment(
                start=seg.start,
                end=seg.end,
                text=seg.text.strip(),
                language=detected_lang,
                confidence=seg.avg_logprob if hasattr(seg, "avg_logprob") else None,
            )
        )
    return results, detected_lang
