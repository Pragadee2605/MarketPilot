from typing import Dict, List


def _get_vendor_query_for_idea(idea: str, location: str) -> str:
    """Intelligently determine precise equipment and vendor queries based on the specific industry."""
    idea_lower = idea.lower()
    if any(k in idea_lower for k in ["coffee", "cafe", "roastery", "tea", "bakery", "food", "restaurant", "meal"]):
        return f"commercial espresso machine baking equipment supplier dealer {location}"
    elif any(k in idea_lower for k in ["courier", "delivery", "logistics", "shipping", "parcel", "transport"]):
        return f"cargo electric bicycle delivery bag GPS tracker supplier {location}"
    elif any(k in idea_lower for k in ["ai", "it", "software", "cloud", "agency", "consulting", "devops"]):
        return f"enterprise cloud server software license development workstations vendor {location}"
    elif any(k in idea_lower for k in ["coaching", "neet", "jee", "school", "education", "institute"]):
        return f"smart interactive whiteboard classroom projector furniture supplier {location}"
    elif any(k in idea_lower for k in ["supermarket", "grocery", "store", "retail", "mart"]):
        return f"commercial refrigerator POS billing machine display shelving rack supplier {location}"
    else:
        return f"wholesale equipment machinery suppliers dealers {idea} {location}"


def plan_tasks(investigation: Dict) -> List[Dict]:
    """Generate intelligent, conditionally-routed research plan targeting official government portals and exact statutory fees."""
    idea = investigation.get('businessIdea', '').strip()
    location = investigation.get('location', '').strip()
    target = investigation.get('targetCustomer', '').strip()

    idea_lower = idea.lower()
    queries = []

    if idea and location:
        # Core universally valuable research tasks
        queries.append({
            "type": "COMPETITOR_SEARCH",
            "query": f"{idea} in {location} local top competitors stores brands",
            "max_pages": 2,
        })
        queries.append({
            "type": "LOCAL_SEARCH",
            "query": f"best {idea} services in {location} local providers",
            "max_pages": 2,
        })
        queries.append({
            "type": "PRICING_SEARCH",
            "query": f"{idea} subscription price cost in {location} INR",
            "max_pages": 2,
        })
        queries.append({
            "type": "PRICING_SEARCH",
            "query": f"legal registration cost trade license filing fees setup cost in {location} INR",
            "max_pages": 1,
        })

        # Smart Industry-Specific Vendor Sourcing
        vendor_q = _get_vendor_query_for_idea(idea, location)
        queries.append({
            "type": "VENDOR_SOURCING",
            "query": vendor_q,
            "max_pages": 2,
        })

        queries.append({
            "type": "REVIEWS_SEARCH",
            "query": f"{idea} {location} customer reviews complaints ratings",
            "max_pages": 2,
        })

        # High-Precision Official Government Portal & Statutory Fee Search
        queries.append({
            "type": "REGULATORY_SEARCH",
            "query": f"official government portal registration license fee {idea} {location}",
            "max_pages": 2,
        })

        # CONDITIONAL ROUTING: Only trigger specialized SerpApi engines when strictly required by business domain
        if any(k in idea_lower for k in ["patent", "hardware", "solar", "device", "invention", "biotech"]):
            queries.append({
                "type": "PATENT_SEARCH",
                "query": idea,
                "max_pages": 1,
            })

        if any(k in idea_lower for k in ["app", "saas", "platform", "mobile app", "ios", "android"]):
            queries.append({
                "type": "APP_STORE_SEARCH",
                "query": idea,
                "max_pages": 1,
            })

        if any(k in idea_lower for k in ["hotel", "hospitality", "resort", "stay", "co-living", "accommodation", "homestay"]):
            queries.append({
                "type": "HOSPITALITY_SEARCH",
                "query": idea,
                "max_pages": 1,
            })

        # General intelligence signal boosters
        queries.append({
            "type": "TRENDS_SEARCH",
            "query": f"{idea} market demand growth {location}",
            "max_pages": 1,
        })
        queries.append({
            "type": "JOBS_SEARCH",
            "query": f"{idea} hiring jobs {location}",
            "max_pages": 1,
        })
        queries.append({
            "type": "YOUTUBE_TRANSCRIPT_SEARCH",
            "query": f"{idea} {location} review experience",
            "max_pages": 1,
        })

    if target:
        queries.append({
            "type": "DEMAND_SIGNAL",
            "query": f"{idea} {location} {target} demand market size",
            "max_pages": 2,
        })

    if not queries:
        queries.append({
            "type": "GENERAL_SEARCH",
            "query": f"{idea} {location} {target}",
            "max_pages": 2,
        })

    return queries
