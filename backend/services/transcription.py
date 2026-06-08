from __future__ import annotations

import logging
import re
from dataclasses import dataclass
from pathlib import Path

from faster_whisper import WhisperModel

from backend.config import settings

logger = logging.getLogger(__name__)

_model: WhisperModel | None = None
_HEBREW_RE = re.compile(r"[\u0590-\u05FF]")


@dataclass
class Segment:
    start: float
    end: float
    text: str
    language: str | None = None
    confidence: float | None = None


def _detect_segment_language(text: str) -> str:
    hebrew_chars = len(_HEBREW_RE.findall(text))
    alpha_chars = sum(1 for c in text if c.isalpha())
    if alpha_chars == 0:
        return "en"
    return "he" if hebrew_chars / alpha_chars > 0.3 else "en"


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


def transcribe(audio_path: Path, job_id: str | None = None) -> tuple[list[Segment], str | None]:
    model = get_model()
    segments_gen, info = model.transcribe(
        str(audio_path),
        language=None,
        word_timestamps=True,
        vad_filter=True,
        initial_prompt="שלום, זה תיעוד רפואי. Medical documentation in Hebrew and English.",
    )

    detected_lang = getattr(info, "language", None)
    lang_prob = getattr(info, "language_probability", None)

    results: list[Segment] = []
    for seg in segments_gen:
        text = seg.text.strip()
        results.append(
            Segment(
                start=seg.start,
                end=seg.end,
                text=text,
                language=_detect_segment_language(text),
                confidence=seg.avg_logprob if hasattr(seg, "avg_logprob") else None,
            )
        )

    for i, s in enumerate(results):
        logger.info(
            "[%d] %.1fs - %.1fs | lang=%s | \"%s\"",
            i, s.start, s.end, s.language, s.text,
        )
    logger.info(
        "Overall: language='%s' probability=%.3f, %d segments",
        detected_lang, lang_prob or 0.0, len(results),
    )

    if job_id:
        log_path = settings.upload_dir / f"{job_id}_segments.txt"
        with open(log_path, "w", encoding="utf-8") as f:
            for i, s in enumerate(results):
                f.write(f'[{i}] {s.start:.1f}s - {s.end:.1f}s | lang={s.language} | "{s.text}"\n')
            f.write(f"\nOverall: language='{detected_lang}' probability={lang_prob or 0.0:.3f}\n")

    return results, detected_lang
