from __future__ import annotations

import json
import logging
from pathlib import Path

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session

from backend.config import settings
from backend.database import get_db
from backend.models import DetectedTerm, Job, TranscriptSegment
from backend.schemas import (
    DetectedTermOut,
    DetectedTermsResponse,
    JobCreateResponse,
    JobStatusResponse,
    TranscriptResponse,
    TranscriptSegmentOut,
)
from backend.services import audio_ingestion, audio_processing, lexicon_matcher, transcription
from backend.services.report_generator import generate_report

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/jobs", tags=["jobs"])


def _run_pipeline(job_id: str, audio_path: Path) -> None:
    from backend.database import SessionLocal

    db = SessionLocal()
    try:
        job = db.query(Job).filter(Job.id == job_id).first()
        if not job:
            return
        job.status = "processing"
        db.commit()

        processed_path = audio_processing.convert_to_whisper_format(audio_path)
        segments, detected_lang = transcription.transcribe(processed_path, job_id=job_id)

        for i, seg in enumerate(segments):
            db.add(TranscriptSegment(
                job_id=job_id,
                segment_index=i,
                start_time=seg.start,
                end_time=seg.end,
                text=seg.text,
                detected_language=seg.language,
                confidence=seg.confidence,
            ))
        db.commit()

        if segments:
            job.duration_seconds = segments[-1].end

        db_segments = (
            db.query(TranscriptSegment)
            .filter(TranscriptSegment.job_id == job_id)
            .order_by(TranscriptSegment.segment_index)
            .all()
        )
        for db_seg in db_segments:
            matches = lexicon_matcher.match_terms(
                db_seg.text, db, threshold=settings.fuzzy_match_threshold
            )
            for m in matches:
                db.add(DetectedTerm(
                    job_id=job_id,
                    lexicon_term_id=m["term_id"],
                    segment_id=db_seg.id,
                    match_type=m["match_type"],
                    match_score=m["score"],
                    context_snippet=m["context_snippet"],
                ))
        db.commit()

        generate_report(job_id, db)

        job.status = "completed"
        db.commit()

    except Exception:
        logger.exception("Pipeline failed for job %s", job_id)
        job = db.query(Job).filter(Job.id == job_id).first()
        if job:
            job.status = "failed"
            import traceback
            job.error_message = traceback.format_exc()[-500:]
            db.commit()
    finally:
        db.close()


@router.post("", response_model=JobCreateResponse)
async def create_job(
    background_tasks: BackgroundTasks,
    audio: UploadFile = File(...),
    source: str = Form("upload"),
    db: Session = Depends(get_db),
):
    job_id, saved_path = await audio_ingestion.validate_and_save(audio)

    job = Job(
        id=job_id,
        status="pending",
        original_filename=audio.filename,
        audio_path=str(saved_path),
    )
    db.add(job)
    db.commit()

    background_tasks.add_task(_run_pipeline, job_id, saved_path)

    return JobCreateResponse(job_id=job_id, status="pending")


@router.get("/{job_id}", response_model=JobStatusResponse)
def get_job(job_id: str, db: Session = Depends(get_db)):
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return JobStatusResponse(
        job_id=job.id,
        status=job.status,
        original_filename=job.original_filename,
        duration_seconds=job.duration_seconds,
        created_at=job.created_at,
        updated_at=job.updated_at,
        error_message=job.error_message,
    )


@router.get("/{job_id}/transcript", response_model=TranscriptResponse)
def get_transcript(job_id: str, db: Session = Depends(get_db)):
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    segments = (
        db.query(TranscriptSegment)
        .filter(TranscriptSegment.job_id == job_id)
        .order_by(TranscriptSegment.segment_index)
        .all()
    )
    return TranscriptResponse(
        job_id=job_id,
        segments=[
            TranscriptSegmentOut(
                index=s.segment_index,
                start=s.start_time,
                end=s.end_time,
                text=s.text,
                language=s.detected_language,
                confidence=s.confidence,
            )
            for s in segments
        ],
    )


@router.get("/{job_id}/terms", response_model=DetectedTermsResponse)
def get_terms(job_id: str, db: Session = Depends(get_db)):
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    detected = (
        db.query(DetectedTerm)
        .filter(DetectedTerm.job_id == job_id)
        .all()
    )
    return DetectedTermsResponse(
        job_id=job_id,
        terms=[
            DetectedTermOut(
                term=d.lexicon_term.term if d.lexicon_term else "unknown",
                category=d.lexicon_term.category if d.lexicon_term else None,
                language=d.lexicon_term.language if d.lexicon_term else None,
                definition=d.lexicon_term.definition if d.lexicon_term else None,
                match_type=d.match_type,
                score=d.match_score,
                context=d.context_snippet,
                segment_index=d.segment.segment_index if d.segment else None,
            )
            for d in detected
        ],
    )
