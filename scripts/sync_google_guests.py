"""GitHub Actions: read a PRIVATE Google Sheet and refresh the encrypted bundle.

Requirements:
  GSHEET_SERVICE_ACCOUNT_JSON: full service-account JSON in a GitHub secret
  WEDDING_GUEST_MASTER_KEY: existing guest-master passphrase in a GitHub secret
Share the Google Sheet with the service account's client_email (Viewer).
"""
from __future__ import annotations

import json
import os
from urllib.parse import urlencode
from urllib.request import Request, urlopen

from google.auth.transport.requests import Request as GoogleAuthRequest
from google.oauth2 import service_account
from wedding_guest_data import SHEET_ID, SHEETS, encrypt_bundle, normalize


def main() -> None:
    service_account_json = os.environ.get("GSHEET_SERVICE_ACCOUNT_JSON", "")
    password = os.environ.get("WEDDING_GUEST_MASTER_KEY", "")
    if not service_account_json or not password:
        raise SystemExit("Google Sheet sync skipped: required secrets missing")
    credentials = service_account.Credentials.from_service_account_info(
        json.loads(service_account_json),
        scopes=["https://www.googleapis.com/auth/spreadsheets.readonly"],
    )
    credentials.refresh(GoogleAuthRequest())
    ranges = [f"'{sheet}'!A1:F2000" for sheet, *_ in SHEETS]
    query = urlencode({"ranges": ranges, "valueRenderOption": "FORMATTED_VALUE"}, doseq=True)
    url = f"https://sheets.googleapis.com/v4/spreadsheets/{SHEET_ID}/values:batchGet?{query}"
    req = Request(url, headers={"Authorization": f"Bearer {credentials.token}"})
    with urlopen(req, timeout=40) as response:
        result = json.load(response)
    entries = result.get("valueRanges", [])
    if len(entries) != len(SHEETS):
        raise ValueError("Tidak semua sheet yang dibutuhkan tersedia atau dapat dibaca")
    sheets = {config[0]: entries[i].get("values", []) for i, config in enumerate(SHEETS)}
    guests = normalize(sheets)
    summary = encrypt_bundle(guests, password)
    print(f"Google Sheet sync: {summary['count']} penerima; "
          f"{summary['peopleTotal']} estimasi orang; "
          f"{summary['onlineCount']} online; version={summary['version']}")


if __name__ == "__main__":
    main()
