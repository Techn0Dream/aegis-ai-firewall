import re
import asyncio

INJECTION_PATTERNS = [
    r"ignore\s+(all\s+)?(previous\s+)?instructions",
    r"override\s+(all\s+)?rules",
    r"system\s+prompt",
    r"forget\s+(all\s+)?(previous\s+)?(rules|instructions)",
    r"you\s+are\s+now",
    r"new\s+role",
    r"do\s+anything\s+now",
    r"bypass\s+filters"
]

async def analyze(prompt: str) -> dict:
    """
    Analyzes prompt for classic prompt injection keywords and patterns.
    """
    await asyncio.sleep(0.05) # Simulate processing delay
    
    score = 0.0
    matches = []
    
    lower_prompt = prompt.lower()
    for pattern in INJECTION_PATTERNS:
        if re.search(pattern, lower_prompt):
            score += 35.0  # High penalty per injection phrase
            matches.append(pattern)
            
    if score > 0:
        return {
            "threat_type": "Prompt Injection",
            "score": min(score, 100.0),
            "description": "Instruction override or role-play manipulation detected."
        }
    
    return {"threat_type": "Prompt Injection", "score": 0.0, "description": "Clean"}
