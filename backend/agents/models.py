from pydantic import BaseModel

class TranslationResult(BaseModel):
    translatedText: str
    confidence: float
    notes: str
