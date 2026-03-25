import google.generativeai as genai
from backend.agents.models import TranslationResult
from backend.agents.subagents import TechnicalAgent, ColloquialAgent, FormalAgent, GeneralAgent

class Orchestrator:
    def __init__(self, model_name: str):
        self.model_name = model_name
        self.classifier_model = genai.GenerativeModel(model_name)
        
        # Instantiate subagents
        self.agents = {
            "technical": TechnicalAgent(model_name),
            "colloquial": ColloquialAgent(model_name),
            "formal": FormalAgent(model_name),
            "general": GeneralAgent(model_name)
        }

    async def _classify_domain(self, text: str, context: str) -> str:
        # In a highly optimized system, this could be a lighter model or rules-based heuristic.
        # We use a quick prompt to determine the domain.
        prompt = f"""
Classify the following text into ONE of these domains: 'technical', 'colloquial', 'formal', or 'general'.
Respond with exactly one word.

Text: {text}
Context: {context}
"""
        try:
            response = await self.classifier_model.generate_content_async(prompt)
            domain = response.text.strip().lower()
            if domain in self.agents:
                return domain
        except Exception:
            pass
        return "general"

    async def translate(self, text: str, target_language: str, context: str) -> TranslationResult:
        domain = await self._classify_domain(text, context)
        selected_agent = self.agents[domain]
        
        result = await selected_agent.translate(text, target_language, context)
        
        # Append routing info to notes for debugging/transparency
        result.notes = f"[Routed via {domain.capitalize()} Agent] {result.notes}".strip()
        return result
