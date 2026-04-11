import re
import asyncio

JAILBREAK_PATTERNS = [
    r"DAN",  # Do Anything Now
    r"act\s+as\s+an?\s+unrestricted",
    r"developer\s+mode",
    r"god\s+mode",
    r"without\s+limits",
    r"ignore\s+moderation",
    r"break\s+the\s+rules",
    r"pretend\s+you\s+are",
    r"hypothetical\s+scenario"
]

async def analyze(prompt: str) -> dict:
    """
    Analyzes prompt for jailbreak personas and hypothetical rule-breaking scenarios.
    """
    await asyncio.sleep(0.08) # Simulate processing delay
    
    score = 0.0
    lower_prompt = prompt.lower()
    
    for pattern in JAILBREAK_PATTERNS:
        if re.search(pattern, lower_prompt):
            score += 40.0
            
    if score > 0:
        return {
            "threat_type": "Jailbreak",
            "score": min(score, 100.0),
            "description": "Known jailbreak persona or hypothetical exploit attempt detected."
        }
    
    return {"threat_type": "Jailbreak", "score": 0.0, "description": "Clean"}
