import json
from typing import Any, Dict

from ai.ai_provider import AIProvider


SYSTEM_PROMPT = """You are the MarketPilot Autonomous Intelligence Agent.

Your mission is to perform deep, data-driven market synthesis exclusively using the live SerpApi evidence stream provided in the prompt.

CRITICAL EXECUTION MANDATES:
1. **Zero Generic Templates**: Every section (Executive Summary, Competitor Matrix, Regulatory Checklist, Launch Blueprint, Cost Breakdown, Vendor Directory) must dynamically adapt to the specific industry and location of the business idea using harvested SerpApi data.
2. **Dynamic B2B Vendor Directory (`vendor_sourcing`)**: Analyze the business idea and harvested evidence to generate a list of exact equipment, software, or machinery assets required to set up the company, along with recommended suppliers, regional addresses, price quotes, and evidence IDs.
3. **Dynamic AI Execution Roadmap**: Generate granular, time-bound operational milestone arrays for `day_30`, `day_60`, and `day_90` derived strictly from the evidence stream with zero hardcoded placeholders.
4. **Strict Evidence Grounding**: Reference real business names, ratings, prices, and sources found in the evidence stream.
5. **100% Budget Exhaustion**: Distribute and allocate 100% of the user's total specified capital budget across professional launch categories.
6. Return valid JSON only, no markdown.
"""


def _select_top_evidence(research_obj: Dict[str, Any], limit: int = 30) -> list[Dict[str, Any]]:
    evidence = []
    for key in ("evidence", "results", "processed_evidence"):
        value = research_obj.get(key)
        if isinstance(value, list):
            evidence.extend(value)
    if not evidence:
        return []

    scored = []
    request = research_obj.get("request") or {}
    idea = request.get("businessIdea", "")
    location = request.get("location", "")
    target = request.get("targetCustomer", "")

    for item in evidence:
        score = 0.0
        if isinstance(item, dict):
            from web_agent import score_evidence
            score = score_evidence(item, idea, location, target)
        scored.append((score, item))

    scored.sort(key=lambda pair: pair[0], reverse=True)
    return [item for _, item in scored[:limit]]


def generate_market_summary(provider: AIProvider, research_obj: Dict[str, Any]) -> Dict[str, Any]:
    """Generate a fully dynamic, evidence-driven market report tailored strictly to the harvested SerpApi stream."""
    tasks = research_obj.get("tasks") or []
    request = research_obj.get("request") or {}
    top_evidence = _select_top_evidence(research_obj)

    business_idea = request.get("businessIdea", "Business Concept")
    location = request.get("location", "Target Location")
    budget = request.get("budget", "500000")
    target = request.get("targetCustomer", "General Audience")

    payload = {
        "businessIdea": business_idea,
        "location": location,
        "targetCustomer": target,
        "budget": budget,
        "additionalRequirements": request.get("additionalRequirements"),
        "harvestedEvidenceStream": top_evidence,
    }

    prompt = (
        f"You are analyzing real-time SerpApi market data for the startup concept: '{business_idea}' in '{location}' "
        f"targeting '{target}' with a total capital budget of '₹{budget}'.\n\n"
        f"Examine the harvested evidence stream below. Every insight, competitor, cost breakdown, vendor sourcing entry, roadmap milestone, and risk mitigation MUST be dynamically derived from this live data:\n\n"
        f"{json.dumps(payload, ensure_ascii=False)}\n\n"
        "Return a strict JSON object with keys:\n"
        "- executive_summary (string synthesizing live findings)\n"
        "- market_summary (string)\n"
        "- competitor_snapshot (string)\n"
        "- pricing_benchmark (string)\n"
        "- opportunities (array of strings)\n"
        "- risks (array of objects with keys: risk_description, severity [High, Medium, Low], mitigation_strategy, evidence_ids)\n"
        "- unknowns (array of strings)\n"
        "- confidence_level (e.g. \"91%\")\n"
        "- confidence_score (integer 0-100)\n"
        "- viability_index (integer 0-100)\n"
        "- fact_inference_matrix (array of objects with keys: finding, plain_english_explanation, classification [VERIFIED_FACT, INFERRED_INSIGHT, UNKNOWN], evidence_ids)\n"
        "- competitor_matrix (array of objects with keys: competitor_name, pricing_tier, rating, review_count, key_offerings, source_url, evidence_id)\n"
        "- regulatory_compliance (array of detailed strings specifically tailored to licensing, permits, tax registrations, and statutory laws for this exact industry in {location})\n"
        "- business_launch_blueprint (object with keys: phase_1_legal [array of strings detailing legal incorporation & statutory registrations], phase_2_operations [array of strings detailing operational infrastructure, fleet/equipment, or tech setup], phase_3_marketing [array of strings detailing customer acquisition & local growth loops], vendor_sourcing [array of objects with keys: item, supplier, address, price, source_url, evidence_id], setup_steps [array of strings], promotion_strategy [array of strings], cost_breakdown [array of objects with keys: item, estimated_cost, source_explanation, evidence_id])\n"
        "- execution_roadmap (object with keys: day_30 [array of 3 detailed time-bound operational milestones for days 1-30 derived strictly from evidence], day_60 [array of 3 milestones for days 31-60], day_90 [array of 3 milestones for days 61-90])\n"
        "- evidence_ids (array of numbers/strings)\n\n"
        "Ensure the cost_breakdown sums up mathematically to the exact total budget (₹" + str(budget) + "). Return valid JSON only, no markdown."
    )

    response = provider.generate(prompt, system_prompt=SYSTEM_PROMPT, json_mode=True)

    try:
        parsed = json.loads(response)
    except json.JSONDecodeError:
        try:
            start = response.find("{")
            end = response.rfind("}")
            if start != -1 and end != -1 and end > start:
                parsed = json.loads(response[start : end + 1])
            else:
                raise ValueError("AI response did not contain JSON")
        except Exception as exc:
            raise RuntimeError(f"Unable to parse AI response as JSON: {exc}") from exc

    return parsed
