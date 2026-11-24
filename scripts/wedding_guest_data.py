"""Build an encrypted wedding guest bundle from the six guest sheets.

Only guest-related columns are used. Financial/vendor sheets are never processed.
The master password belongs in a GitHub Actions secret, not in source control.
"""
from __future__ import annotations

import base64
import hashlib
import json
import os
import re
from pathlib import Path

from cryptography.hazmat.primitives.ciphers.aead import AESGCM

SHEET_ID = "1OCFSNDby2mERyZKTqgHWO7M1m2RY3w_SZz4-epTNkC4"
SHEETS = [
    ("Keluarga Abi", "abi", "keluarga", 1, 2, 2),
    ("Keluarga Mama", "mama", "keluarga", 1, 2, 2),
    ("Tamu KAI", "kai", None, 1, 4, 2),
    ("Tamu ITS", "its", "senior", 1, 4, 2),
    ("Tamu Arin", "arin", "rekan", 1, 2, 2),
    ("Sheet2", "online", None, 1, None, 4),
]
BUNDLE_PATH = Path(__file__).resolve().parents[1] / "src/lib/guest-seed.encrypted.json"


def text_at(row: list, idx: int | None) -> str:
    if idx is None or len(row) <= idx or row[idx] is None:
        return ""
    return str(row[idx]).strip()


def normalize(sheet_rows: dict[str, list[list]]) -> list[dict]:
    guests: list[dict] = []
    for sheet, code, category, name_index, person_index, first_row in SHEETS:
        if sheet not in sheet_rows:
            raise ValueError(f"Sheet wajib tidak ditemukan: {sheet}")
        before = len(guests)
        for row_number, row in enumerate(sheet_rows[sheet], start=1):
            if row_number < first_row:
                continue
            raw_no = text_at(row, 0)
            raw_name = text_at(row, name_index)
            if not re.fullmatch(r"\d+(?:\.0)?", raw_no) or not raw_name:
                continue
            name = re.sub(r"\s+", " ", raw_name).strip()[:160]
            if not name:
                continue
            if code == "kai":
                jabatan = text_at(row, 2).lower()
                cat = "senior" if re.search(r"(?<!assistant )manager|vice president|kupt|kepala|direktur", jabatan) else "rekan"
                # Assistant Manager juga termasuk tamu senior.
                if "assistant manager" in jabatan:
                    cat = "senior"
                group = "Tamu KAI" + (" · " + text_at(row, 3) if text_at(row, 3) else "")
            elif code == "its":
                cat = "senior"
                group = "Tamu ITS" + (" · " + text_at(row, 3) if text_at(row, 3) else "")
            elif code == "online":
                cat = "keluarga" if re.search(r"^(trah|keluarga)\b", name, re.I) else "umum"
                group = "Undangan Online"
            else:
                cat = category
                group = sheet
            record: dict = {
                "id": f"xl-{code}-{row_number:03}",
                "name": name,
                "category": cat,
                "group": group,
            }
            if person_index is not None:
                person_text = text_at(row, person_index).replace(",", ".")
                try:
                    person_count = int(float(person_text))
                except ValueError:
                    person_count = 0
                if person_count > 0:
                    record["people"] = person_count
            guests.append(record)
        if len(guests) == before:
            raise ValueError(f"Sheet {sheet} tidak menghasilkan tamu. Cek struktur kolomnya.")
    ids = [guest["id"] for guest in guests]
    if len(ids) != len(set(ids)):
        raise ValueError("ID baris tamu duplikat")
    return guests


def encrypt_bundle(guests: list[dict], password: str, target: Path = BUNDLE_PATH) -> dict:
    if not password:
        raise ValueError("WEDDING_GUEST_MASTER_KEY wajib diisi")
    previous = json.loads(target.read_text()) if target.exists() else {}
    salt = base64.b64decode(previous["salt"]) if previous.get("salt") else os.urandom(16)
    iterations = int(previous.get("iterations", 210000))
    # Reuse PBKDF2 salt for the browser's non-extractable cached CryptoKey;
    # each encryption uses a fresh AES-GCM IV.
    key = hashlib.pbkdf2_hmac("sha256", password.encode(), salt, iterations, dklen=32)
    plaintext = json.dumps({"guests": guests}, ensure_ascii=False, separators=(",", ":")).encode()
    iv = os.urandom(12)
    encrypted = AESGCM(key).encrypt(iv, plaintext, None)
    bundle = {
        "salt": base64.b64encode(salt).decode(),
        "iv": base64.b64encode(iv).decode(),
        "iterations": iterations,
        "ciphertext": base64.b64encode(encrypted).decode(),
        "count": len(guests),
        "version": hashlib.sha256(plaintext).hexdigest()[:16],
        "peopleTotal": sum(int(g.get("people", 0)) for g in guests),
        "onlineCount": sum(g["id"].startswith("xl-online-") for g in guests),
    }
    target.write_text(json.dumps(bundle, ensure_ascii=False, separators=(",", ":")) + "\n")
    return {k: v for k, v in bundle.items() if k not in ("ciphertext", "salt", "iv")}
