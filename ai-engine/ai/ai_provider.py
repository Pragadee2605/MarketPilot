from abc import ABC, abstractmethod


class AIProvider(ABC):
    """Abstract provider interface. Each provider implements generate()."""

    @abstractmethod
    def generate(self, prompt: str, system_prompt: str | None = None, json_mode: bool = False) -> str:
        raise NotImplementedError
