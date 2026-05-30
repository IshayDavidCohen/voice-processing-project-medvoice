"""Populate the lexicon_terms table with ~50 medical terms.

Run:  python -m backend.seed_lexicon
"""

from __future__ import annotations

import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from backend.database import Base, SessionLocal, engine
from backend.models import LexiconTerm
from backend.services.lexicon_matcher import normalize

SEED_TERMS: list[dict] = [
    {"term": "anterior", "lang": "la", "cat": "anatomy",
     "definition": "Front side of the body or structure",
     "aliases": ["anteriorly"]},
    {"term": "posterior", "lang": "la", "cat": "anatomy",
     "definition": "Back side of the body or structure",
     "aliases": ["posteriorly"]},
    {"term": "lateral", "lang": "la", "cat": "anatomy",
     "definition": "Side of the body, away from the midline",
     "aliases": ["laterally"]},
    {"term": "medial", "lang": "la", "cat": "anatomy",
     "definition": "Toward the midline of the body",
     "aliases": ["medially"]},
    {"term": "superior", "lang": "la", "cat": "anatomy",
     "definition": "Upper or above"},
    {"term": "inferior", "lang": "la", "cat": "anatomy",
     "definition": "Lower or below"},
    {"term": "proximal", "lang": "la", "cat": "anatomy",
     "definition": "Closer to the point of attachment or trunk"},
    {"term": "distal", "lang": "la", "cat": "anatomy",
     "definition": "Farther from the point of attachment or trunk"},
    {"term": "cranial", "lang": "la", "cat": "anatomy",
     "definition": "Toward the head"},
    {"term": "abdomen", "lang": "la", "cat": "anatomy",
     "definition": "The belly region between thorax and pelvis",
     "aliases": ["abdominal"]},
    {"term": "thorax", "lang": "la", "cat": "anatomy",
     "definition": "The chest region",
     "aliases": ["thoracic"]},
    {"term": "femur", "lang": "la", "cat": "anatomy",
     "definition": "Thigh bone, longest bone in the body",
     "aliases": ["femoral"]},
    {"term": "tibia", "lang": "la", "cat": "anatomy",
     "definition": "Shinbone, medial bone of the lower leg",
     "aliases": ["tibial"]},
    {"term": "peritoneum", "lang": "la", "cat": "anatomy",
     "definition": "Membrane lining the abdominal cavity",
     "aliases": ["peritoneal"]},

    {"term": "suture", "lang": "la", "cat": "procedure",
     "definition": "Surgical stitching to close a wound",
     "aliases": ["suturing", "sutures"]},
    {"term": "laparoscopy", "lang": "la", "cat": "procedure",
     "definition": "Minimally invasive abdominal surgery using a camera",
     "aliases": ["laparoscopic"]},
    {"term": "laparotomy", "lang": "la", "cat": "procedure",
     "definition": "Open surgical incision into the abdominal cavity"},
    {"term": "anastomosis", "lang": "la", "cat": "procedure",
     "definition": "Surgical connection between two tubular structures",
     "aliases": ["anastomoses"]},
    {"term": "biopsy", "lang": "en", "cat": "procedure",
     "definition": "Removal of tissue for diagnostic examination"},
    {"term": "intubation", "lang": "en", "cat": "procedure",
     "definition": "Insertion of a tube into the trachea for ventilation",
     "aliases": ["intubate", "intubated"]},
    {"term": "excision", "lang": "la", "cat": "procedure",
     "definition": "Surgical removal of tissue or an organ"},
    {"term": "debridement", "lang": "en", "cat": "procedure",
     "definition": "Removal of dead or contaminated tissue from a wound"},
    {"term": "catheterization", "lang": "en", "cat": "procedure",
     "definition": "Insertion of a catheter into the body",
     "aliases": ["catheterize", "catheter"]},
    {"term": "cholecystectomy", "lang": "la", "cat": "procedure",
     "definition": "Surgical removal of the gallbladder"},
    {"term": "appendectomy", "lang": "la", "cat": "procedure",
     "definition": "Surgical removal of the appendix"},

    {"term": "hemorrhage", "lang": "la", "cat": "condition",
     "definition": "Excessive bleeding",
     "aliases": ["haemorrhage", "hemorrhaging"]},
    {"term": "infection", "lang": "en", "cat": "condition",
     "definition": "Invasion and multiplication of pathogens in body tissue"},
    {"term": "inflammation", "lang": "en", "cat": "condition",
     "definition": "Body's immune response causing redness, swelling, heat, pain"},
    {"term": "necrosis", "lang": "la", "cat": "condition",
     "definition": "Death of body tissue",
     "aliases": ["necrotic"]},
    {"term": "edema", "lang": "la", "cat": "condition",
     "definition": "Swelling caused by excess fluid in tissues",
     "aliases": ["oedema"]},
    {"term": "stenosis", "lang": "la", "cat": "condition",
     "definition": "Abnormal narrowing of a passage in the body"},
    {"term": "fracture", "lang": "en", "cat": "condition",
     "definition": "A break in a bone",
     "aliases": ["fractured"]},
    {"term": "abscess", "lang": "la", "cat": "condition",
     "definition": "Localized collection of pus in tissues"},
    {"term": "adhesion", "lang": "en", "cat": "condition",
     "definition": "Bands of scar-like tissue forming between organs",
     "aliases": ["adhesions"]},
    {"term": "ischemia", "lang": "la", "cat": "condition",
     "definition": "Inadequate blood supply to tissue",
     "aliases": ["ischaemia", "ischemic"]},

    {"term": "scalpel", "lang": "en", "cat": "instrument",
     "definition": "Small sharp surgical cutting knife"},
    {"term": "forceps", "lang": "en", "cat": "instrument",
     "definition": "Handheld hinged instrument for grasping"},
    {"term": "retractor", "lang": "en", "cat": "instrument",
     "definition": "Instrument for holding back tissue during surgery",
     "aliases": ["retractors"]},
    {"term": "clamp", "lang": "en", "cat": "instrument",
     "definition": "Instrument for compressing a structure",
     "aliases": ["clamps"]},
    {"term": "trocar", "lang": "en", "cat": "instrument",
     "definition": "Pointed instrument used with a cannula for laparoscopic access",
     "aliases": ["trocars"]},
    {"term": "endoscope", "lang": "en", "cat": "instrument",
     "definition": "Flexible tube with camera for internal examination",
     "aliases": ["endoscopy", "endoscopic"]},
    {"term": "cannula", "lang": "la", "cat": "instrument",
     "definition": "Thin tube inserted into the body for delivery or removal of fluid"},
    {"term": "stapler", "lang": "en", "cat": "instrument",
     "definition": "Surgical instrument for wound closure with staples",
     "aliases": ["surgical stapler"]},

    {"term": "דימום", "lang": "he", "cat": "condition",
     "definition": "Bleeding (Hebrew)",
     "aliases": ["מדמם"]},
    {"term": "תפר", "lang": "he", "cat": "procedure",
     "definition": "Suture (Hebrew)",
     "aliases": ["תפירה", "תפרים"]},
    {"term": "אנסטומוזה", "lang": "he", "cat": "procedure",
     "definition": "Anastomosis — surgical connection (Hebrew)"},
    {"term": "ניתוח", "lang": "he", "cat": "procedure",
     "definition": "Surgery / operation (Hebrew)",
     "aliases": ["ניתוחים"]},
    {"term": "דלקת", "lang": "he", "cat": "condition",
     "definition": "Inflammation / infection (Hebrew)"},
    {"term": "שבר", "lang": "he", "cat": "condition",
     "definition": "Fracture (Hebrew)",
     "aliases": ["שברים"]},
    {"term": "בטן", "lang": "he", "cat": "anatomy",
     "definition": "Abdomen (Hebrew)"},
    {"term": "חזה", "lang": "he", "cat": "anatomy",
     "definition": "Chest / thorax (Hebrew)"},
    {"term": "צנתר", "lang": "he", "cat": "instrument",
     "definition": "Catheter (Hebrew)",
     "aliases": ["צנתור"]},
    {"term": "אולר", "lang": "he", "cat": "instrument",
     "definition": "Scalpel (Hebrew)"},
]


def seed(clear_existing: bool = False) -> int:
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        if clear_existing:
            db.query(LexiconTerm).delete()
            db.commit()

        existing = {row.normalized_term for row in db.query(LexiconTerm.normalized_term).all()}
        added = 0
        for entry in SEED_TERMS:
            norm = normalize(entry["term"])
            if norm in existing:
                continue
            aliases = entry.get("aliases")
            db.add(LexiconTerm(
                term=entry["term"],
                normalized_term=norm,
                language=entry["lang"],
                category=entry["cat"],
                definition=entry.get("definition"),
                aliases=json.dumps(aliases, ensure_ascii=False) if aliases else None,
            ))
            existing.add(norm)
            added += 1
        db.commit()
        return added
    finally:
        db.close()


if __name__ == "__main__":
    clear = "--clear" in sys.argv
    count = seed(clear_existing=clear)
    print(f"Seeded {count} new lexicon terms (total in DB: {count + len(SEED_TERMS) - count}).")
