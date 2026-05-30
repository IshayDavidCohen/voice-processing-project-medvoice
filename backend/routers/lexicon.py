from __future__ import annotations

import json

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from backend.database import get_db
from backend.models import LexiconTerm
from backend.schemas import (
    LexiconCreateResponse,
    LexiconListResponse,
    LexiconTermCreate,
    LexiconTermOut,
)
from backend.services.lexicon_matcher import normalize

router = APIRouter(prefix="/api/lexicon", tags=["lexicon"])


def _term_to_out(row: LexiconTerm) -> LexiconTermOut:
    aliases: list[str] | None = None
    if row.aliases:
        try:
            aliases = json.loads(row.aliases)
        except (json.JSONDecodeError, TypeError):
            pass
    return LexiconTermOut(
        id=row.id,
        term=row.term,
        language=row.language,
        category=row.category,
        definition=row.definition,
        aliases=aliases,
    )


@router.get("", response_model=LexiconListResponse)
def list_lexicon(
    category: str | None = Query(None),
    language: str | None = Query(None),
    db: Session = Depends(get_db),
):
    query = db.query(LexiconTerm)
    if category:
        query = query.filter(LexiconTerm.category == category)
    if language:
        query = query.filter(LexiconTerm.language == language)
    rows = query.order_by(LexiconTerm.term).all()
    return LexiconListResponse(terms=[_term_to_out(r) for r in rows])


@router.post("", response_model=LexiconCreateResponse, status_code=201)
def create_lexicon_term(
    body: LexiconTermCreate,
    db: Session = Depends(get_db),
):
    aliases_json = json.dumps(body.aliases, ensure_ascii=False) if body.aliases else None
    term = LexiconTerm(
        term=body.term,
        normalized_term=normalize(body.term),
        language=body.language,
        category=body.category,
        definition=body.definition,
        aliases=aliases_json,
    )
    db.add(term)
    db.commit()
    db.refresh(term)
    return LexiconCreateResponse(id=term.id, term=term.term)


@router.delete("/{term_id}", status_code=204)
def delete_lexicon_term(term_id: int, db: Session = Depends(get_db)):
    term = db.query(LexiconTerm).filter(LexiconTerm.id == term_id).first()
    if not term:
        raise HTTPException(status_code=404, detail="Lexicon term not found")
    db.delete(term)
    db.commit()
