from __future__ import annotations

import json
import logging
from datetime import datetime, timezone

from sqlalchemy.orm import Session

from backend.config import settings
from backend.models import DetectedTerm, Job, Report, TranscriptSegment

logger = logging.getLogger(__name__)


def _build_full_transcript(segments: list[TranscriptSegment]) -> str:
    lines: list[str] = []
    for seg in segments:
        ts = f"[{seg.start_time:.1f}s - {seg.end_time:.1f}s]"
        lines.append(f"{ts} {seg.text}")
    return "\n".join(lines)


def _build_terms_summary(detected: list[DetectedTerm]) -> list[dict]:
    summary: list[dict] = []
    for dt in detected:
        lt = dt.lexicon_term
        summary.append({
            "term": lt.term if lt else "unknown",
            "category": lt.category if lt else None,
            "language": lt.language if lt else None,
            "match_type": dt.match_type,
            "score": dt.match_score,
            "context": dt.context_snippet,
        })
    return summary


def _call_claude(transcript: str, terms_json: str) -> str | None:
    if not settings.anthropic_api_key:
        logger.info("No Anthropic API key configured — skipping AI summary.")
        return None

    try:
        import anthropic

        client = anthropic.Anthropic(api_key=settings.anthropic_api_key)
        prompt = (
            "You are a medical documentation assistant. "
            "Given the following multilingual medical transcript (Hebrew/English/Latin) "
            "and a list of detected medical terms, produce a concise 3-5 sentence "
            "clinical summary in English. Focus on key findings, procedures mentioned, "
            "and any notable observations.\n\n"
            f"--- TRANSCRIPT ---\n{transcript}\n\n"
            f"--- DETECTED MEDICAL TERMS ---\n{terms_json}\n\n"
            "--- SUMMARY ---"
        )

        message = client.messages.create(
            model="claude-sonnet-4-20250514",
            max_tokens=512,
            messages=[{"role": "user", "content": prompt}],
        )
        return message.content[0].text
    except Exception:
        logger.exception("Claude API call failed — skipping AI summary.")
        return None


def generate_report(job_id: str, db: Session) -> Report:
    segments = (
        db.query(TranscriptSegment)
        .filter(TranscriptSegment.job_id == job_id)
        .order_by(TranscriptSegment.segment_index)
        .all()
    )
    detected = (
        db.query(DetectedTerm)
        .filter(DetectedTerm.job_id == job_id)
        .all()
    )

    full_transcript = _build_full_transcript(segments)
    terms_summary = _build_terms_summary(detected)
    terms_json = json.dumps(terms_summary, ensure_ascii=False, indent=2)

    ai_summary = _call_claude(full_transcript, terms_json)

    metadata = {
        "model": "claude-sonnet-4-20250514" if ai_summary else None,
        "whisper_model": settings.whisper_model_size,
        "generated_at": datetime.now(timezone.utc).isoformat(),
    }

    report = Report(
        job_id=job_id,
        full_transcript=full_transcript,
        detected_terms_json=terms_json,
        ai_summary=ai_summary,
        report_metadata=json.dumps(metadata, ensure_ascii=False),
    )
    db.add(report)
    db.commit()
    db.refresh(report)
    return report
