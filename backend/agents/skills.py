class ContextAnalyzerSkill:
    """Skill to analyze the surrounding context to determine the tone and hidden meaning."""
    
    @staticmethod
    def analyze(context: str) -> str:
        if not context:
            return "No additional context provided."
        
        # In a real enterprise system, this might be a separate LLM call or advanced NLP.
        # For now, it provides a heuristic summary.
        return f"Context provided implies the surrounding text is: {context[:100]}..."

class GlossaryLookupSkill:
    """Skill to ensure consistent terminology for specific domains."""
    
    def __init__(self):
        self.glossary = {
            "API": "Application Programming Interface",
            "UI": "User Interface",
        }
        
    def get_terms(self, text: str) -> dict:
        found = {}
        for term, definition in self.glossary.items():
            if term in text:
                found[term] = definition
        return found
