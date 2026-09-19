# SERPAPI Data Model Mapping

This document maps the SerpApi JSON fields (example provided by the user) to MarketPilot's normalized Evidence model.

Top-level SerpApi sections observed:
- `search_metadata`: metadata about the search (id, status, json_endpoint, created_at, processed_at, google_url)
- `search_parameters`: request params (engine, q, location_requested/used, device)
- `search_information`: search stats (query_displayed, total_results, time_taken_displayed)
- `local_map`: general local map info (link, image, gps_coordinates)
- `local_results.places[]`: local business/place results (position, title, rating, reviews, price, description, thumbnail, place_id, gps_coordinates, address)
- `knowledge_graph`: knowledge panel data (title, type, description, sources)
- `immersive_products[]`: product cards (title, source, rating, reviews, price, extracted_price, original_price)
- `related_questions[]`: Q&A / featured snippets
- `organic_results[]`: standard organic search results (position, title, link, snippet, site links)
- `perspectives[]`: videos/posts/news items (author, title, source, link, date)
- `related_searches`, `refine_this_search`, `things_to_know`, `pagination`, `serpapi_pagination`

Normalized Evidence model (fields the parser should populate):
- `type`: one of `BUSINESS`, `PRODUCT`, `SEARCH_RESULT`, `KNOWLEDGE_PANEL`, `PERSPECTIVE`, `RELATED_QUESTION`, `OTHER`.
- `title`: human-friendly title or name
- `description`: snippet or short description
- `source`: origin label (e.g., `Google Maps`, `Google`, `Walmart`)
- `sourceUrl`: canonical URL or SerpApi link
- `sourceType`: e.g., `GOOGLE_MAPS`, `SERP_GOOGLE`, `SHOPPING`
- `rating`: numeric rating where available
- `reviewCount`: integer reviews count
- `price`: human-friendly price string
- `extracted_price`: numeric price when available
- `address`: street address
- `gps`: { latitude, longitude }
- `place_id`: for local places
- `thumbnail`: image URL
- `collected_at`: timestamp from `search_metadata.created_at`
- `raw`: the original JSON snippet for traceability

Parser responsibilities and notes:
- Map `local_results.places[]` -> `BUSINESS` evidence with `place_id`, `address`, `gps`.
- Map `immersive_products[]` -> `PRODUCT` evidence with `price` and `extracted_price`.
- Map `organic_results[]` -> `SEARCH_RESULT` evidence (include `sitelinks` where present).
- Map `related_questions[]` -> `RELATED_QUESTION` or `SEARCH_RESULT` depending on the type.
- Include `raw` field with the raw SerpApi sub-object for provenance.
- Normalize numbers (ratings/reviews/prices) and parse price floats when `extracted_price` exists.
- Preserve `search_metadata.id` and `search_parameters` in evidence `raw` for traceability.

Example: a local place evidence

{
  "type": "BUSINESS",
  "title": "Houndstooth Coffee",
  "description": "Cozy hangout for carefully sourced brews",
  "source": "Google Maps",
  "sourceUrl": "https://www.google.com/maps?...",
  "rating": 4.5,
  "reviewCount": 1200,
  "price": "$1–10",
  "address": "401 Congress Ave. #100c",
  "gps": { "latitude": 30.266216, "longitude": -97.743065 },
  "place_id": "11265938073076301333",
  "thumbnail": "https://...jpeg",
  "collected_at": "2026-01-03 14:20:00 UTC",
  "raw": { /* original place object */ }
}

This doc should guide `ai-engine/web_agent.py` parser functions.
NOTE: No SerpApi sample file found in the workspace yet.

When a SerpApi JSON response file is provided, this document will:

- Describe the actual response sections present in the sample
- List fields to support in the parser
- Map fields into the normalized Evidence model
- Mark future/optional sections

Please upload the supplied SerpApi JSON file (e.g., `serpapi_sample.json`), or place it under `docs/` so I can inspect it and complete this document.
