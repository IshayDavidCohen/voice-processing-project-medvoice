from __future__ import annotations

import json

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from backend.database import get_db
from backend.models import Job, Report
from backend.schemas import DetectedTermOut, ReportResponse

router = APIRouter(prefix="/api/jobs", tags=["reports"])


@router.get("/{job_id}/report", response_model=ReportResponse)
def get_report(job_id: str, db: Session = Depends(get_db)):
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    report = db.query(Report).filter(Report.job_id == job_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not yet generated")

    try:
        terms_data = json.loads(report.detected_terms_json)
    except (json.JSONDecodeError, TypeError):
        terms_data = []

    try:
        metadata = json.loads(report.report_metadata) if report.report_metadata else None
    except (json.JSONDecodeError, TypeError):
        metadata = None

    return ReportResponse(
        job_id=job_id,
        full_transcript=report.full_transcript,
        detected_terms=[
            DetectedTermOut(
                term=t.get("term", ""),
                category=t.get("category"),
                language=t.get("language"),
                definition=None,
                match_type=t.get("match_type", "exact"),
                score=t.get("score"),
                context=t.get("context"),
            )
            for t in terms_data
        ],
        summary=report.ai_summary,
        metadata=metadata,
        created_at=report.created_at,
    )
