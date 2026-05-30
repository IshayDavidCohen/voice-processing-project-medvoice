from __future__ import annotations

import json
import unicodedata

from rapidfuzz import fuzz
from sqlalchemy.orm import Session

from backend.models import LexiconTerm


def _strip_diacritics(text: str) -> str:
    nfkd = unicodedata.normalize("NFKD", text)
    return "".join(c for c in nfkd if not unicodedata.combining(c))


def normalize(text: str) -> str:
    return _strip_diacritics(text).lower().strip()


def _load_terms(db: Session) -> list[dict]:
    rows = db.query(LexiconTerm).all()
    terms: list[dict] = []
    for r in rows:
        aliases_raw: list[str] = []
        if r.aliases:
            try:
                aliases_raw = json.loads(r.aliases)
            except (json.JSONDecodeError, TypeError):
                pass
        terms.append({
            "id": r.id,
            "term": r.term,
            "normalized_term": r.normalized_term,
            "category": r.category,
            "language": r.language,
            "definition": r.definition,
            "aliases_normalized": [normalize(a) for a in aliases_raw],
        })
    return terms


def match_terms(
    text: str,
    db: Session,
    threshold: int = 85,
) -> list[dict]:
    """Match lexicon terms against a transcript segment text.

    Returns a list of dicts with keys: term_id, term, category, language,
    definition, match_type, score, context_snippet.
    """
    lexicon = _load_terms(db)
    normalized_text = normalize(text)
    matches: list[dict] = []
    seen_term_ids: set[int] = set()

    for entry in lexicon:
        if entry["id"] in seen_term_ids:
            continue

        all_forms = [entry["normalized_term"]] + entry["aliases_normalized"]

        matched = False
        for form in all_forms:
            if not form:
                continue
            if form in normalized_text:
                matches.append({
                    "term_id": entry["id"],
                    "term": entry["term"],
                    "category": entry["category"],
                    "language": entry["language"],
                    "definition": entry["definition"],
                    "match_type": "exact",
                    "score": 1.0,
                    "context_snippet": text,
                })
                seen_term_ids.add(entry["id"])
                matched = True
                break

        if matched:
            continue

        words = normalized_text.split()
        for form in all_forms:
            if not form:
                continue
            for word in words:
                score = fuzz.ratio(word, form)
                if score >= threshold:
                    matches.append({
                        "term_id": entry["id"],
                        "term": entry["term"],
                        "category": entry["category"],
                        "language": entry["language"],
                        "definition": entry["definition"],
                        "match_type": "fuzzy",
                        "score": score / 100.0,
                        "context_snippet": text,
                    })
                    seen_term_ids.add(entry["id"])
                    matched = True
                    break
            if matched:
                break

    return matches
