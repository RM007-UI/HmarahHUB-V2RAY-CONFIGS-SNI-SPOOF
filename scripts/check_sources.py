#!/usr/bin/env python3
"""Check availability of listed upstream source URLs without downloading their contents."""
from __future__ import annotations

import json
import os
import urllib.error
import urllib.request
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SOURCES_FILE = ROOT / "sources.json"
OUTPUT_FILE = ROOT / "sources-status.json"
TIMEOUT = 15


def check(url: str) -> dict:
    request = urllib.request.Request(
        url,
        method="HEAD",
        headers={"User-Agent": "HmarahHUB-Source-Monitor/1.0"},
    )
    try:
        with urllib.request.urlopen(request, timeout=TIMEOUT) as response:
            return {"url": url, "available": 200 <= response.status < 400,
                    "http_status": response.status, "checked_at": datetime.now(timezone.utc).isoformat()}
    except urllib.error.HTTPError as exc:
        return {"url": url, "available": False, "http_status": exc.code,
                "checked_at": datetime.now(timezone.utc).isoformat()}
    except Exception as exc:
        return {"url": url, "available": False, "error": type(exc).__name__,
                "checked_at": datetime.now(timezone.utc).isoformat()}


def main() -> None:
    source_data = json.loads(SOURCES_FILE.read_text(encoding="utf-8"))
    results = []
    for source in source_data.get("sources", []):
        outputs = []
        for output in source.get("outputs", []):
            url = output.get("url", "")
            if url.startswith("https://"):
                result = check(url)
                result["label"] = output.get("label", "")
                outputs.append(result)
        results.append({
            "id": source.get("id"),
            "name": source.get("name"),
            "repo": source.get("repo"),
            "outputs": outputs,
            "available": sum(item["available"] for item in outputs),
            "total": len(outputs),
        })

    payload = {
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "mode": "metadata-only; HEAD requests; no source contents downloaded",
        "sources": results,
    }
    OUTPUT_FILE.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


if __name__ == "__main__":
    main()
