import uuid
from pathlib import Path

from fastapi import UploadFile, HTTPException

from backend.config import settings

ALLOWED_CONTENT_TYPES = {
    "audio/wav",
    "audio/x-wav",
    "audio/wave",
    "audio/webm",
    "audio/mpeg",
    "audio/mp3",
    "audio/ogg",
    "audio/flac",
    "audio/mp4",
    "audio/x-m4a",
    "video/webm",  # browser MediaRecorder often uses this MIME
}

MAX_BYTES = settings.max_audio_size_mb * 1024 * 1024


async def validate_and_save(upload: UploadFile) -> tuple[str, Path]:
    content_type = (upload.content_type or "").lower()
    base_type = content_type.split(";")[0].strip()
    if base_type not in ALLOWED_CONTENT_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported audio type '{content_type}'. "
                   f"Accepted: {', '.join(sorted(ALLOWED_CONTENT_TYPES))}",
        )

    data = await upload.read()
    if len(data) > MAX_BYTES:
        raise HTTPException(
            status_code=400,
            detail=f"File too large ({len(data) / 1024 / 1024:.1f} MB). "
                   f"Max allowed: {settings.max_audio_size_mb} MB.",
        )

    job_id = uuid.uuid4().hex
    dest = settings.upload_dir / f"{job_id}.wav"
    dest.write_bytes(data)
    return job_id, dest
