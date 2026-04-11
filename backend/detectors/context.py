import asyncio
from collections import defaultdict
import time

# Simple in-memory session store for tracking multi-turn attacks
# Format: { session_id: [ {"text": str, "timestamp": float, "suspicion": float} ] }
session_history = defaultdict(list)

# Keywords that build suspicion over time
MANIPULATION_KEYWORDS = [
    "what if",
    "let's play a game",
    "hypothetically",
    "pretend",
    "assume",
    "rule",
    "developer"
]

async def analyze(prompt: str, session_id: str = None) -> dict:
    """
    Analyzes prompt history for gradual contextual manipulation.
    """
    await asyncio.sleep(0.05)
    
    if not session_id:
        return {"threat_type": "Context Manipulation", "score": 0.0, "description": "Clean (No Session)"}
        
    lower_prompt = prompt.lower()
    suspicion_bump = 0.0
    
    for kw in MANIPULATION_KEYWORDS:
        if kw in lower_prompt:
            suspicion_bump += 10.0
            
    # Record history
    history = session_history[session_id]
    history.append({
        "text": prompt,
        "timestamp": time.time(),
        "suspicion": suspicion_bump
    })
    
    # Analyze trajectory
    total_suspicion = sum(turn["suspicion"] for turn in history[-5:]) # Look at last 5 turns
    
    if total_suspicion > 30.0:
        return {
            "threat_type": "Context Manipulation",
            "score": min(total_suspicion * 1.5, 100.0), # Escalate score for sustained manipulation
            "description": "Multi-turn manipulation sequence detected: User is gradually attempting to subvert AI."
        }
        
    return {"threat_type": "Context Manipulation", "score": total_suspicion, "description": "Clean/Low Risk"}
