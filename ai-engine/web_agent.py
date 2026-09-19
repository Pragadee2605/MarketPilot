import os
import time
from typing import Any, Dict, List

import requests


def _safe_int(v):
    try:
        return int(v)
    except Exception:
        return None


def _safe_float(v):
    try:
        return float(v)
    except Exception:
        return None


def _sanitize_query(query: str) -> str:
    """Condense long conversational business descriptions into punchy, browser-like Google search keywords."""
    if not query:
        return ""
    fillers = {"company", "companies", "service", "services", "product", "products", "building", "providing", "focusing", "on", "a", "an", "the", "and", "for", "with", "to", "of", "in", "on", "at", "by", "from", "as", "is", "are", "that", "this"}
    words = query.split()
    filtered = [w for w in words if w.lower() not in fillers]
    keywords = filtered if len(filtered) >= 2 else words
    sanitized = " ".join(keywords[:5])
    return sanitized if sanitized else query


def _sanitize_local_query(query: str) -> str:
    """Format queries specifically for Google Maps (google_local) so Google Maps can resolve physical local entities without 503 errors."""
    if not query:
        return ""
    q_lower = query.lower()
    if any(k in q_lower for k in ["vulnerability", "scanner", "cloud", "saas", "software", "billing", "inventory", "ai", "it", "agency"]):
        if "security" in q_lower or "vulnerability" in q_lower or "scanner" in q_lower:
            return "cybersecurity company"
        if "billing" in q_lower or "inventory" in q_lower or "pos" in q_lower:
            return "software development company"
        if "ai" in q_lower or "cloud" in q_lower or "it" in q_lower:
            return "IT consulting agency"
        return "software company"
    return _sanitize_query(query)


def call_serpapi(query: str, serpapi_key: str = None, params: Dict[str, Any] = None, timeout: int = 600) -> Dict[str, Any]:
    """Call SerpApi JSON endpoint and return parsed JSON in real-time with resilient error handling and smart query tokenization."""
    key = serpapi_key or os.environ.get("SERPAPI_KEY")
    if not key:
        raise RuntimeError("SERPAPI_KEY not provided via arg or environment")

    # Tokenize/sanitize long sentences into browser-like search queries to prevent 503 server errors
    if len(query.split()) > 5:
        query = _sanitize_query(query)

    base = "https://serpapi.com/search.json"
    qp = {"q": query, "engine": "google", "google_domain": "google.com"}
    if params:
        qp.update(params)
    qp["api_key"] = key

    # Maps-aware query formatting for google_local
    if qp.get("engine") == "google_local":
        qp["q"] = _sanitize_local_query(qp.get("q", query))

    loc = qp.get("location", "Global/Default")
    engine = qp.get("engine", "google")
    print(f"🌐 [SerpApi Realtime Call] Engine: '{engine}' | Location: '{loc}' | Query: '{query}'")

    for attempt in range(3):
        try:
            response = requests.get(base, params=qp, timeout=timeout)
            response.raise_for_status()
            data = response.json()
            print(f"✅ [SerpApi Success] Engine '{engine}' returned results for: '{query}'")
            return data
        except requests.HTTPError as he:
            status_code = he.response.status_code if he.response is not None else 'unknown'
            print(f"⚠️ [SerpApi HTTP {status_code}] Engine '{engine}' returned error for query: '{query}' (skipping gracefully)")
            return {}
        except requests.RequestException as e:
            print(f"⚠️ [SerpApi Attempt {attempt+1} Failed] Query: '{query}' | Error: {e}")
            if attempt == 2:
                return {}
            time.sleep(1 + attempt)


def _dedupe_results(items: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    seen = set()
    deduped = []
    for item in items:
        key = None
        if item.get("place_id"):
            key = ("place_id", item.get("place_id"))
        elif item.get("sourceUrl"):
            key = ("sourceUrl", item.get("sourceUrl"))
        elif item.get("title"):
            key = ("title", item.get("title"))

        if key and key in seen:
            continue
        if key:
            seen.add(key)
        deduped.append(item)
    return deduped


def _normalize_text(value: Any) -> str:
    if value is None:
        return ""
    return str(value).lower().strip()


def get_authority_weight(source_type: str) -> float:
    weights = {
        "GOOGLE_MAPS": 1.25,
        "SHOPPING": 1.20,
        "GOOGLE_NEWS": 1.15,
        "SERP_GOOGLE": 1.00,
        "KNOWLEDGE_PANEL": 1.20,
    }
    return weights.get(source_type, 1.0)


def score_evidence(item: Dict[str, Any], business_idea: str, location: str, target_customer: str = "") -> float:
    """Rank evidence by business relevance, local match, signal strength, and source authority trust weighting."""
    text = " ".join([
        _normalize_text(item.get("title")),
        _normalize_text(item.get("description")),
        _normalize_text(item.get("source")),
        _normalize_text(item.get("address")),
        _normalize_text(item.get("price")),
        _normalize_text(item.get("sourceType")),
    ])
    idea_text = _normalize_text(business_idea)
    location_text = _normalize_text(location)
    target_text = _normalize_text(target_customer)

    score = 0.0
    source_type = item.get("sourceType")
    if item.get("type") == "BUSINESS":
        score += 20
    if source_type in {"GOOGLE_MAPS", "SHOPPING"}:
        score += 15
    if source_type == "SERP_GOOGLE":
        score += 5

    if location_text and location_text in text:
        score += 25
    if idea_text:
        idea_tokens = [token for token in idea_text.split() if len(token) >= 4]
        overlap = sum(1 for token in idea_tokens if token in text)
        score += min(20, overlap * 5)
    if target_text:
        target_tokens = [token for token in target_text.split() if len(token) >= 4]
        overlap = sum(1 for token in target_tokens if token in text)
        score += min(10, overlap * 4)

    rating = item.get("rating")
    if isinstance(rating, (int, float)):
        score += min(12, float(rating) * 3)

    review_count = item.get("reviewCount")
    if isinstance(review_count, int):
        score += min(10, review_count / 25)

    if item.get("price"):
        score += 5
    if item.get("sourceUrl"):
        score += 3

    # Apply Trust & Authority Weighting
    authority_multiplier = get_authority_weight(source_type)
    score = score * authority_multiplier

    return round(score, 2)


def parse_serpapi_response(resp: Dict[str, Any], max_pages: int = 1) -> Dict[str, Any]:
    """Parse a SerpApi JSON response into a normalized list of result items.

    Returns: { "results": [ ... ], "raw": resp }
    """
    if not isinstance(resp, dict):
        return {"results": [], "raw": resp}

    results: List[Dict[str, Any]] = []
    current = resp
    pages = 0

    while current and pages < max_pages:
        pages += 1
        created_at = current.get("search_metadata", {}).get("created_at")

        # Handle local_results as list or dict with places
        local_res = current.get("local_results")
        places_list = []
        if isinstance(local_res, list):
            places_list = local_res
        elif isinstance(local_res, dict):
            places_list = local_res.get("places") or []

        for place in places_list:
            item = {
                "type": "BUSINESS",
                "title": place.get("title") or place.get("name"),
                "description": place.get("description"),
                "source": "Google Maps / Local",
                "sourceUrl": place.get("website") or place.get("links", {}).get("website") or place.get("link") or place.get("place_id_search"),
                "sourceType": "GOOGLE_MAPS",
                "rating": _safe_float(place.get("rating")),
                "reviewCount": _safe_int(place.get("reviews")),
                "price": place.get("price"),
                "address": place.get("address"),
                "gps": place.get("gps_coordinates"),
                "place_id": place.get("place_id"),
                "thumbnail": place.get("thumbnail"),
                "position": place.get("position"),
                "collected_at": created_at,
                "raw": place,
            }
            results.append(item)

        # Handle news_results
        for news in (current.get("news_results") or []):
            source_info = news.get("source") or {}
            source_name = source_info.get("name") if isinstance(source_info, dict) else str(source_info)
            item = {
                "type": "NEWS",
                "title": news.get("title"),
                "description": news.get("snippet"),
                "source": source_name,
                "sourceUrl": news.get("link"),
                "sourceType": "GOOGLE_NEWS",
                "date": news.get("date") or news.get("iso_date"),
                "thumbnail": news.get("thumbnail"),
                "collected_at": created_at,
                "raw": news,
            }
            results.append(item)

        # Handle youtube_video page structure
        if current.get("youtube_video_url") or current.get("search_parameters", {}).get("engine") == "youtube_video":
            channel_info = current.get("channel") or {}
            desc_content = current.get("description")
            if isinstance(desc_content, dict):
                desc_content = desc_content.get("content")
            item = {
                "type": "YOUTUBE_VIDEO",
                "title": current.get("title"),
                "description": desc_content,
                "source": channel_info.get("name") or "YouTube",
                "sourceUrl": current.get("youtube_video_url"),
                "sourceType": "YOUTUBE",
                "rating": None,
                "reviewCount": current.get("extracted_views"),
                "collected_at": created_at,
                "raw": current,
            }
            results.append(item)

        for product in (current.get("immersive_products") or []):
            item = {
                "type": "PRODUCT",
                "title": product.get("title"),
                "description": None,
                "source": product.get("source"),
                "sourceUrl": None,
                "sourceType": "SHOPPING",
                "rating": _safe_float(product.get("rating")),
                "reviewCount": _safe_int(product.get("reviews")),
                "price": product.get("price"),
                "extracted_price": _safe_float(product.get("extracted_price")),
                "original_price": product.get("original_price"),
                "extracted_original_price": _safe_float(product.get("extracted_original_price")),
                "thumbnail": product.get("thumbnail"),
                "location": product.get("location"),
                "collected_at": created_at,
                "raw": product,
            }
            results.append(item)

        for organic in (current.get("organic_results") or []):
            item = {
                "type": "SEARCH_RESULT",
                "title": organic.get("title"),
                "description": organic.get("snippet"),
                "source": organic.get("source") or None,
                "sourceUrl": organic.get("link"),
                "sourceType": "SERP_GOOGLE",
                "thumbnail": organic.get("thumbnail"),
                "sitelinks": organic.get("sitelinks"),
                "position": organic.get("position"),
                "collected_at": created_at,
                "raw": organic,
            }
            results.append(item)

        for question in (current.get("related_questions") or []):
            item = {
                "type": "RELATED_QUESTION",
                "title": question.get("question") or question.get("title"),
                "description": question.get("snippet") or question.get("text_blocks") or None,
                "source": None,
                "sourceUrl": question.get("link"),
                "sourceType": "SERP_GOOGLE",
                "collected_at": created_at,
                "raw": question,
            }
            results.append(item)

        for perspective in (current.get("perspectives") or []):
            item = {
                "type": "PERSPECTIVE",
                "title": perspective.get("title"),
                "description": None,
                "author": perspective.get("author"),
                "source": perspective.get("source"),
                "sourceUrl": perspective.get("link"),
                "date": perspective.get("date"),
                "thumbnail": (perspective.get("thumbnails") or [None])[0],
                "collected_at": created_at,
                "raw": perspective,
            }
            results.append(item)

        knowledge_graph = current.get("knowledge_graph")
        if knowledge_graph:
            item = {
                "type": "KNOWLEDGE_PANEL",
                "title": knowledge_graph.get("title"),
                "description": knowledge_graph.get("description"),
                "source": (knowledge_graph.get("source") or {}).get("name"),
                "sourceUrl": (knowledge_graph.get("source") or {}).get("link"),
                "header_images": knowledge_graph.get("header_images"),
                "collected_at": created_at,
                "raw": knowledge_graph,
            }
            results.append(item)

        for job in (current.get("jobs_results") or []):
            item = {
                "type": "JOB_MARKET_SIGNAL",
                "title": job.get("title"),
                "description": job.get("description"),
                "source": job.get("company_name"),
                "sourceUrl": None,
                "sourceType": "GOOGLE_JOBS",
                "location": job.get("location"),
                "collected_at": created_at,
                "raw": job,
            }
            results.append(item)

        for video in (current.get("video_results") or current.get("inline_videos") or []):
            item = {
                "type": "VIDEO_SIGNAL",
                "title": video.get("title"),
                "description": video.get("snippet") or video.get("description"),
                "source": video.get("channel") or video.get("source"),
                "sourceUrl": video.get("link"),
                "sourceType": "YOUTUBE",
                "collected_at": created_at,
                "raw": video,
            }
            results.append(item)

        # Handle google_patents
        if current.get("search_parameters", {}).get("engine") == "google_patents":
            for patent in (current.get("organic_results") or []):
                p_items = patent.get("items") if isinstance(patent.get("items"), list) else [patent]
                for p in p_items:
                    item = {
                        "type": "PATENT_SIGNAL",
                        "title": p.get("title"),
                        "description": p.get("snippet"),
                        "source": f"Google Patents ({p.get('assignee', 'Patent')})",
                        "sourceUrl": p.get("patent_link") or p.get("pdf"),
                        "sourceType": "GOOGLE_PATENTS",
                        "collected_at": created_at,
                        "raw": p,
                    }
                    results.append(item)

        # Handle google_play
        if current.get("search_parameters", {}).get("engine") == "google_play":
            for category in (current.get("organic_results") or []):
                for app in (category.get("items") or []):
                    item = {
                        "type": "APP_STORE_SIGNAL",
                        "title": app.get("title"),
                        "description": app.get("description"),
                        "source": f"Google Play ({app.get('author', 'App')})",
                        "sourceUrl": app.get("link"),
                        "sourceType": "GOOGLE_PLAY",
                        "rating": _safe_float(app.get("rating")),
                        "collected_at": created_at,
                        "raw": app,
                    }
                    results.append(item)

        # Handle google_hotels_reviews
        if current.get("search_parameters", {}).get("engine") == "google_hotels_reviews":
            for rev in (current.get("reviews") or []):
                user_info = rev.get("user") or {}
                item = {
                    "type": "HOSPITALITY_REVIEW",
                    "title": f"Review by {user_info.get('name', 'Guest')}",
                    "description": rev.get("snippet"),
                    "source": rev.get("source") or "Google Hotels",
                    "sourceUrl": user_info.get("link"),
                    "sourceType": "GOOGLE_HOTELS",
                    "rating": _safe_float(rev.get("rating")),
                    "collected_at": created_at,
                    "raw": rev,
                }
                results.append(item)

        for timeline in (current.get("interest_over_time", {}).get("timeline_data") or []):
            item = {
                "type": "TRENDS_SIGNAL",
                "title": "Google Search Interest Trend",
                "description": str(timeline.get("values")),
                "source": "Google Trends",
                "sourceUrl": None,
                "sourceType": "GOOGLE_TRENDS",
                "collected_at": created_at,
                "raw": timeline,
            }
            results.append(item)

        next_link = None
        serpapi_pagination = current.get("serpapi_pagination") or {}
        if isinstance(serpapi_pagination, dict):
            next_link = serpapi_pagination.get("next") or serpapi_pagination.get("next_link")
        if not next_link or pages >= max_pages:
            break
        # Follow next page only when max_pages > 1 and there is a usable next URL.
        try:
            next_response = requests.get(next_link, timeout=10)
            next_response.raise_for_status()
            current = next_response.json()
        except Exception:
            break

    deduped = _dedupe_results(results)
    return {"results": deduped, "raw": resp}


def _engine_for_task(task_type: str | None) -> list[str]:
    mapping = {
        "COMPETITOR_SEARCH": ["google", "google_local"],
        "LOCAL_SEARCH": ["google_local", "google"],
        "PRICING_SEARCH": ["google_shopping", "google"],
        "VENDOR_SOURCING": ["google_shopping", "google_local", "google"],
        "PATENT_SEARCH": ["google_patents", "google"],
        "APP_STORE_SEARCH": ["google_play", "google"],
        "HOSPITALITY_SEARCH": ["google_hotels_reviews", "google_local", "google"],
        "REVIEWS_SEARCH": ["google", "google_local"],
        "TRENDS_SEARCH": ["google_trends"],
        "JOBS_SEARCH": ["google_jobs", "google"],
        "YOUTUBE_TRANSCRIPT_SEARCH": ["youtube", "google_videos"],
        "REGULATORY_SEARCH": ["google", "google_news"],
        "TREND_SEARCH": ["google_news", "google"],
        "DEMAND_SIGNAL": ["google"],
    }
    return mapping.get(task_type or "", ["google"])


def _get_localization_params(location: str) -> Dict[str, str]:
    loc_lower = location.lower()
    params = {
        "location": location,
        "hl": "en",
        "gl": "us",
        "google_domain": "google.com"
    }

    if any(k in loc_lower for k in ["india", "chennai", "mumbai", "bangalore", "delhi", "hyderabad", "pune", "kolkata", "ahmedabad", "jaipur"]):
        params["gl"] = "in"
        params["google_domain"] = "google.co.in"
    elif any(k in loc_lower for k in ["uk", "united kingdom", "london", "manchester", "birmingham", "edinburgh"]):
        params["gl"] = "uk"
        params["google_domain"] = "google.co.uk"
    elif any(k in loc_lower for k in ["canada", "toronto", "vancouver", "montreal", "ottawa"]):
        params["gl"] = "ca"
        params["google_domain"] = "google.ca"
    elif any(k in loc_lower for k in ["australia", "sydney", "melbourne", "brisbane", "perth"]):
        params["gl"] = "au"
        params["google_domain"] = "google.com.au"
    elif any(k in loc_lower for k in ["germany", "berlin", "munich", "frankfurt"]):
        params["gl"] = "de"
        params["google_domain"] = "google.de"
    elif any(k in loc_lower for k in ["france", "paris", "lyon", "marseille"]):
        params["gl"] = "fr"
        params["google_domain"] = "google.fr"
    elif any(k in loc_lower for k in ["japan", "tokyo", "osaka", "kyoto"]):
        params["gl"] = "jp"
        params["google_domain"] = "google.co.jp"

    return params


def search_task_bundle(query: str, task_type: str | None = None, location: str | None = None, serpapi_key: str | None = None, max_pages: int = 1):
    """Run a small multi-engine SerpApi bundle for a task with universal multi-country dynamic localization parameters."""
    engine_list = _engine_for_task(task_type)
    all_results = []
    for engine in engine_list:
        params: Dict[str, Any] = {"q": query, "engine": engine}

        if location:
            loc_params = _get_localization_params(location)
            params.update(loc_params)
        else:
            params["google_domain"] = "google.com"
            params["hl"] = "en"
            params["gl"] = "us"

        if engine == "google_trends":
            params["data_type"] = "TIMESERIES"
            words = query.split()
            params["q"] = " ".join(words[:3]) if len(words) > 3 else query
            if location:
                loc_params = _get_localization_params(location)
                params["geo"] = loc_params.get("gl", "US").upper()
        elif engine == "youtube":
            params["search_query"] = query
            params.pop("q", None)
        elif engine == "google_play":
            params["store"] = "apps"
        elif engine == "google_hotels_reviews":
            params.pop("q", None)
            params["property_token"] = query if query.startswith("Chc") else "ChcI9uq9hrWO2OtjGgsvZy8xMjJ0YzFteBAB"

        try:
            payload = call_serpapi(query, serpapi_key=serpapi_key, params=params, timeout=100)
            parsed = parse_serpapi_response(payload, max_pages=max_pages)
            all_results.extend(parsed.get("results", []))
        except Exception:
            continue

    deduped = _dedupe_results(all_results)
    return {"query": query, "results": deduped, "engines": engine_list}


def simple_search(query, serpapi_key=None, max_pages=1, task_type=None, location=None):
    """Search helper; if passed a SerpApi dict, parse it; else return a ready-to-use shape."""
    if isinstance(query, dict) and ("search_metadata" in query or "organic_results" in query):
        return parse_serpapi_response(query, max_pages=max_pages)
    if not query:
        return {"query": query, "results": []}
    if task_type or location:
        return search_task_bundle(query, task_type=task_type, location=location, serpapi_key=serpapi_key, max_pages=max_pages)
    try:
        payload = call_serpapi(query, serpapi_key=serpapi_key, params={"location": "Austin, Texas, United States"})
        return parse_serpapi_response(payload, max_pages=max_pages)
    except Exception:
        return {"query": query, "results": []}
