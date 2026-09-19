import os
import requests
from typing import Any, Dict

from web_agent import simple_search

BACKEND_URL = os.getenv("BACKEND_URL", "http://localhost:8080").rstrip("/")


def normalize_search_result(result: Dict[str, Any]) -> Dict[str, Any]:
    normalized = {
        "type": result.get("type", "SEARCH_RESULT"),
        "title": result.get("title") or result.get("name") or result.get("query"),
        "description": result.get("description") or result.get("snippet") or "",
        "source": result.get("source"),
        "sourceUrl": result.get("sourceUrl") or result.get("link") or result.get("url"),
        "sourceType": result.get("sourceType"),
        "rating": result.get("rating"),
        "reviewCount": result.get("reviewCount"),
        "price": result.get("price"),
        "extracted_price": result.get("extracted_price"),
        "address": result.get("address"),
        "gps": result.get("gps"),
        "place_id": result.get("place_id"),
        "thumbnail": result.get("thumbnail"),
        "raw": result.get("raw") or result,
    }
    return {k: v for k, v in normalized.items() if v is not None}


def process_research(research_obj: Dict) -> Dict:
    research_id = research_obj.get("id")
    if not research_id:
        raise ValueError("research object must contain id")

    tasks = research_obj.get("tasks", [])
    summary = {"research_id": research_id, "tasks_processed": 0, "evidence_count": 0}

    for task in tasks:
        q = task.get("query")
        try:
            call_kwargs = {"max_pages": task.get("max_pages", 1)}
            task_type = task.get("type")
            location = research_obj.get("request", {}).get("location")
            if task_type or location:
                call_kwargs["task_type"] = task_type
                call_kwargs["location"] = location
            results = simple_search(q, **call_kwargs)
        except Exception:
            results = {"results": []}

        hits = results.get("results", [])
        posted = 0
        for item in hits:
            ev = normalize_search_result(item)
            ev.setdefault("collected_by", "serpapi")
            ev.setdefault("collected_from_search_id", research_obj.get("search_metadata", {}).get("id") if research_obj.get("search_metadata") else None)
            try:
                resp = requests.post(
                    f"{BACKEND_URL}/api/investigations/{research_obj.get('original_investigation_id')}/evidence",
                    json=ev,
                    timeout=10,
                )
                if resp.status_code in (200, 201):
                    posted += 1
            except requests.RequestException:
                pass

        summary["tasks_processed"] += 1
        summary["evidence_count"] += posted

    return summary
