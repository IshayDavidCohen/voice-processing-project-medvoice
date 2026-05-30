from datetime import datetime, timezone

from sqlalchemy import (
    Column,
    Float,
    ForeignKey,
    Index,
    Integer,
    String,
    Text,
)
from sqlalchemy.orm import relationship

from backend.database import Base


def _utcnow() -> datetime:
    return datetime.now(timezone.utc)


class Job(Base):
    __tablename__ = "jobs"

    id = Column(String, primary_key=True)
    status = Column(String, nullable=False, default="pending")
    original_filename = Column(String, nullable=True)
    audio_path = Column(String, nullable=False)
    duration_seconds = Column(Float, nullable=True)
    created_at = Column(String, nullable=False, default=lambda: _utcnow().isoformat())
    updated_at = Column(String, nullable=False, default=lambda: _utcnow().isoformat(), onupdate=lambda: _utcnow().isoformat())
    error_message = Column(Text, nullable=True)

    segments = relationship("TranscriptSegment", back_populates="job", cascade="all, delete-orphan")
    detected_terms = relationship("DetectedTerm", back_populates="job", cascade="all, delete-orphan")
    report = relationship("Report", back_populates="job", uselist=False, cascade="all, delete-orphan")


class TranscriptSegment(Base):
    __tablename__ = "transcript_segments"

    id = Column(Integer, primary_key=True, autoincrement=True)
    job_id = Column(String, ForeignKey("jobs.id"), nullable=False)
    segment_index = Column(Integer, nullable=False)
    start_time = Column(Float, nullable=False)
    end_time = Column(Float, nullable=False)
    text = Column(Text, nullable=False)
    detected_language = Column(String, nullable=True)
    confidence = Column(Float, nullable=True)

    job = relationship("Job", back_populates="segments")
    detected_terms = relationship("DetectedTerm", back_populates="segment", cascade="all, delete-orphan")

    __table_args__ = (Index("idx_segments_job", "job_id"),)


class LexiconTerm(Base):
    __tablename__ = "lexicon_terms"

    id = Column(Integer, primary_key=True, autoincrement=True)
    term = Column(String, nullable=False)
    normalized_term = Column(String, nullable=False)
    language = Column(String, nullable=False, default="la")
    category = Column(String, nullable=True)
    definition = Column(Text, nullable=True)
    aliases = Column(Text, nullable=True)  # JSON array

    detected = relationship("DetectedTerm", back_populates="lexicon_term")

    __table_args__ = (Index("idx_lexicon_norm", "normalized_term"),)


class DetectedTerm(Base):
    __tablename__ = "detected_terms"

    id = Column(Integer, primary_key=True, autoincrement=True)
    job_id = Column(String, ForeignKey("jobs.id"), nullable=False)
    lexicon_term_id = Column(Integer, ForeignKey("lexicon_terms.id"), nullable=False)
    segment_id = Column(Integer, ForeignKey("transcript_segments.id"), nullable=False)
    match_type = Column(String, default="exact")
    match_score = Column(Float, nullable=True)
    context_snippet = Column(Text, nullable=True)

    job = relationship("Job", back_populates="detected_terms")
    lexicon_term = relationship("LexiconTerm", back_populates="detected")
    segment = relationship("TranscriptSegment", back_populates="detected_terms")

    __table_args__ = (Index("idx_detected_job", "job_id"),)


class Report(Base):
    __tablename__ = "reports"

    id = Column(Integer, primary_key=True, autoincrement=True)
    job_id = Column(String, ForeignKey("jobs.id"), nullable=False, unique=True)
    full_transcript = Column(Text, nullable=False)
    detected_terms_json = Column(Text, nullable=False)
    ai_summary = Column(Text, nullable=True)
    report_metadata = Column(Text, nullable=True)  # JSON
    created_at = Column(String, nullable=False, default=lambda: _utcnow().isoformat())

    job = relationship("Job", back_populates="report")
