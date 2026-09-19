import json
import os
from typing import Optional, List

import requests

from .ai_provider import AIProvider


class OpenRouterProvider(AIProvider):
    """OpenRouter cloud AI provider implementation with automatic multi-model free fallback chain."""

    def __init__(
        self,
        api_key: Optional[str] = None,
        model: Optional[str] = None,
        base_url: Optional[str] = None,
        timeout: int = 600,
    ):
        self.api_key = api_key or os.getenv("OPENROUTER_API_KEY")
        primary_model = model or os.getenv("OPENROUTER_MODEL", "openrouter/free")

        # Build resilient fallback chain of top free OpenRouter models
        self.models: List[str] = [
            primary_model,
            "openrouter/free",
            "mistralai/mistral-7b-instruct:free",
            "google/gemma-2-9b-it:free",
        ]
        # Deduplicate while preserving order
        seen = set()
        self.models = [m for m in self.models if not (m in seen or seen.add(m))]

        self.base_url = base_url or os.getenv("OPENROUTER_BASE_URL", "https://openrouter.ai/api/v1")
        self.timeout = timeout

        if not self.api_key:
            raise ValueError("OPENROUTER_API_KEY is not configured")

    def generate(self, prompt: str, system_prompt: str | None = None, json_mode: bool = False) -> str:
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
            "HTTP-Referer": "http://localhost:5173",
            "X-Title": "MarketPilot",
        }
        url = f"{self.base_url.rstrip('/')}/chat/completions"

        last_error = None
        for current_model in self.models:
            payload = {
                "model": current_model,
                "messages": [],
            }

            if system_prompt:
                payload["messages"].append({"role": "system", "content": system_prompt})

            payload["messages"].append({"role": "user", "content": prompt})

            if json_mode:
                payload["response_format"] = {"type": "json_object"}

            try:
                print(f"🤖 [OpenRouter Request] Trying model: '{current_model}'")
                response = requests.post(url, headers=headers, json=payload, timeout=self.timeout)

                if response.status_code == 200:
                    body = response.json()
                    choices = body.get("choices") or []
                    if choices:
                        message = choices[0].get("message") or {}
                        content = message.get("content")
                        if content:
                            if isinstance(content, list):
                                parts = [str(item.get("text")) for item in content if isinstance(item, dict) and item.get("text")]
                                content = "\n".join(parts)
                            print(f"✅ [OpenRouter Success] Model '{current_model}' responded successfully.")
                            return str(content).strip()

                # If 404, 429, or 5xx, try next fallback model
                last_error = f"HTTP {response.status_code}: {response.text[:200]}"
                print(f"⚠️ [OpenRouter Model {current_model} Failed] Status {response.status_code}. Trying next fallback...")
            except requests.exceptions.RequestException as exc:
                last_error = str(exc)
                print(f"⚠️ [OpenRouter Request Exception for {current_model}]: {exc}. Trying next fallback...")
                continue

        raise RuntimeError(f"All OpenRouter free models failed. Last error: {last_error}")
