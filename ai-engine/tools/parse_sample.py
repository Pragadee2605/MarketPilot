#!/usr/bin/env python3
"""Simple parse runner: load a SerpApi JSON file and print normalized results."""
import sys
import json
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from web_agent import parse_serpapi_response


def main():
    if len(sys.argv) < 2:
        print("Usage: parse_sample.py path/to/serpapi.json [output.json]")
        sys.exit(2)

    in_path = Path(sys.argv[1])
    if not in_path.exists():
        print(f"File not found: {in_path}")
        sys.exit(2)

    data = json.loads(in_path.read_text(encoding="utf-8"))
    parsed = parse_serpapi_response(data)

    out = parsed.get("results", parsed)
    if len(sys.argv) >= 3:
        out_path = Path(sys.argv[2])
        out_path.write_text(json.dumps(out, indent=2, ensure_ascii=False), encoding="utf-8")
        print(f"Wrote {len(out)} items to {out_path}")
    else:
        print(json.dumps(out, indent=2, ensure_ascii=False))


if __name__ == "__main__":
    main()
