from abc import ABC, abstractmethod
import google.generativeai as genai
import json
from backend.services.prompt_builder import resolve_language_name
from backend.agents.models import TranslationResult
from backend.agents.skills import ContextAnalyzerSkill, GlossaryLookupSkill

class BaseAgent(ABC):
    def __init__(self, model_name: str):
        self.model = genai.GenerativeModel(model_name)
        self.context_skill = ContextAnalyzerSkill()
        self.glossary_skill = GlossaryLookupSkill()

    @abstractmethod
    def get_system_prompt(self) -> str:
        pass

    async def translate(self, text: str, target_language: str, context: str) -> TranslationResult:
        target_name = resolve_language_name(target_language)
        system_instruction = self.get_system_prompt()
        
        context_analysis = self.context_skill.analyze(context)
        glossary_terms = self.glossary_skill.get_terms(text)
        
        glossary_block = ""
        if glossary_terms:
            glossary_block = "Use these glossary terms if applicable:\n" + "\n".join([f"{k}: {v}" for k, v in glossary_terms.items()])

        prompt = f"""
{system_instruction}

Target Language: {target_name}

Context Analysis:
{context_analysis}
Original Context:
```
{context}
```

{glossary_block}

Text to translate:
```
{text}
```

Respond ONLY with a JSON object:
{{
  "translatedText": "...",
  "confidence": 0.95,
  "notes": "..."
}}
"""
        response = await self.model.generate_content_async(prompt)
        raw = getattr(response, 'text', '') or ''
        return self._parse_json(raw)

    def _parse_json(self, raw: str) -> TranslationResult:
        stripped = raw.strip()
        if stripped.startswith("```json"): stripped = stripped[7:]
        if stripped.startswith("```"): stripped = stripped[3:]
        if stripped.endswith("```"): stripped = stripped[:-3]
        stripped = stripped.strip()

        try:
            data = json.loads(stripped)
            return TranslationResult(
                translatedText=data.get('translatedText', data.get('translation', stripped)),
                confidence=float(data.get('confidence', 0.9)),
                notes=data.get('notes', '')
            )
        except json.JSONDecodeError:
            return TranslationResult(
                translatedText=stripped,
                confidence=0.5,
                notes="Failed to parse JSON output. Direct string fallback."
            )

class TechnicalAgent(BaseAgent):
    def get_system_prompt(self) -> str:
        return "You are an expert Technical Translator. Preserve variables, code snippets, markdown, and technical jargon exactly."

class ColloquialAgent(BaseAgent):
    def get_system_prompt(self) -> str:
        return "You are an expert in Colloquial and Slang translation. Maintain the original tone, translate idioms appropriately into the target language's equivalent idioms."

class FormalAgent(BaseAgent):
    def get_system_prompt(self) -> str:
        return "You are a Formal/Academic Translator. Use precise, professional, and sophisticated language. Maintain a formal tone."

class GeneralAgent(BaseAgent):
    def get_system_prompt(self) -> str:
        return "You are a professional, context-aware general translator. Provide accurate and natural-sounding translations."
