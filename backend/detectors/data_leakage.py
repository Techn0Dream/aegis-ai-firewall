import re
import asyncio

# Basic regex patterns for PII / Secrets
PATTERNS = {
    "SSN": r"\b\d{3}-\d{2}-\d{4}\b",
    "Credit Card": r"\b(?:\d[ -]*?){13,16}\b",
    "AWS Key": r"AKIA[0-9A-Z]{16}",
    "Generic API Key": r"(?i)(api[_-]?key|secret|token)[\s:=]+[\"']?[0-9a-zA-Z]{16,}[\"']?"
}

async def analyze(prompt: str) -> dict:
    """
    Analyzes prompt for PII and API Secrets data leakage.
    """
    await asyncio.sleep(0.06)
    
    score = 0.0
    detected_types = []
    
    for leak_type, pattern in PATTERNS.items():
        if re.search(pattern, prompt):
            # Data leakage is a critical threat, auto-high score
            score += 80.0
            detected_types.append(leak_type)
            
    if score > 0:
        return {
            "threat_type": "Data Leakage",
            "score": min(score, 100.0),
            "description": f"Sensitive data detected: {', '.join(detected_types)}"
        }
    
    return {"threat_type": "Data Leakage", "score": 0.0, "description": "Clean"}
