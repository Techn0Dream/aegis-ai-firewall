import os
from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import asyncio
import hashlib
import json
from datetime import datetime

# Rate limiting
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

import schemas
from detectors import prompt_injection, jailbreak, data_leakage, context
from firebase_client import firebase_client
from adaptive_engine import adaptive_engine
from llm_generator import generate_attacks

# Initialization
limiter = Limiter(key_func=get_remote_address)
app = FastAPI(title="Aegis AI Firewall - Cloud SOC", version="2.1.0")
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory session cache for serverless fallback (cleared on cold start)
MEMORY_LOG_CACHE = []

@app.get("/")
def health_check():
    return {"status": "ACTIVE", "engine": "Gemini-Adaptive-Serverless"}

@app.get("/api/v1/generate")
@limiter.limit("5/minute")
def get_generated_prompts(request: Request):
    """Fetches ML-generated adversarial attacks from Gemini."""
    return generate_attacks()

@app.post("/api/v1/scan", response_model=schemas.ScanResponse)
@limiter.limit("60/minute")
async def scan_prompt(request: Request, scan_req: schemas.ScanRequest):
    prompt = scan_req.prompt
    
    # Run detectors in parallel
    detector_tasks = [
        prompt_injection.analyze(prompt),
        jailbreak.analyze(prompt),
        data_leakage.analyze(prompt),
        context.analyze(prompt, scan_req.session_id)
    ]
    results = await asyncio.gather(*detector_tasks)
    
    threats = [res for res in results if res is not None and res["score"] > 0]
    max_score = max([t["score"] for t in threats]) if threats else 0.0
    has_override = any(t["threat_type"] == "Data Leakage" for t in threats)
    
    # Decision Engine Logic
    if has_override:
        max_score = 100.0
        severity = "CRITICAL"
        decision = "BLOCK"
        reason = "Data Exfiltration Zero-Trust Override Triggered."
    elif max_score >= 60:
        severity = "HIGH"
        decision = "BLOCK"
        reason = "Threat score exceeds maximum allowable threshold."
    elif max_score >= 30:
        severity = "MEDIUM"
        if any(t["threat_type"] == "Prompt Injection" for t in threats):
            decision = "SANITIZED"
            reason = "Instruction override pattern neutralized. Safe execution permitted."
        else:
            decision = "WARN"
            reason = "Suspicious signatures detected. Proceed with caution."
    else:
        severity = "LOW"
        decision = "ALLOW"
        reason = "Request passed heuristic screening."

    # Adaptive Semantic Logic Layer
    adaptive_mods = adaptive_engine.analyze(prompt, max_score, decision)
    if adaptive_mods:
        if adaptive_mods.get("escalate_to"):
            decision = adaptive_mods["escalate_to"]
            severity = "HIGH" if decision == "BLOCK" else severity
            reason = f"Adaptive Engine escalated due to semantic similarity: {adaptive_mods['classification']}"
        elif adaptive_mods.get("classification") == "Unknown Pattern (Emerging Threat)":
            reason = f"Heuristics Warned. Adaptive Engine flagged as Novel/Zero-day pattern."
            threats.append({
                "threat_type": "Emerging Zero-Day", 
                "score": max_score, 
                "description": "Unrecognized semantic pattern.", 
                "intelligence": {"signature_id": "AEGIS-TI-UNKNOWN", "attack_class": "Zero-Day", "frequency": "LOW"}
            })

    # Forensic Hash
    event_payload = json.dumps({"prompt": prompt, "decision": decision, "score": max_score, "timestamp": datetime.utcnow().timestamp()})
    event_hash = hashlib.sha256(event_payload.encode()).hexdigest()
    
    # Firebase Real-time SOC Streaming
    log_data = {
         "session_id": scan_req.session_id,
         "user_id": scan_req.user_id,
         "prompt": prompt[:200] + "..." if len(prompt) > 200 else prompt,
         "decision": decision,
         "risk_score": max_score,
         "severity_level": severity,
         "threat_types": ", ".join([t["threat_type"] for t in threats]) if threats else "None",
         "reason": reason,
         "event_hash": event_hash,
         "created_at": datetime.utcnow().isoformat()
    }
    firebase_client.log_scan_event(log_data)
    
    # Update local cache (ephemeral)
    MEMORY_LOG_CACHE.insert(0, log_data)
    if len(MEMORY_LOG_CACHE) > 100:
        MEMORY_LOG_CACHE.pop()

    return schemas.ScanResponse(
        event_id=event_hash,
        decision=decision,
        risk_score=max_score,
        severity_level=severity,
        reason=reason,
        threats=threats
    )

@app.get("/api/v1/logs", response_model=list[dict])
async def get_logs(limit: int = 50):
    """Returns the ephemeral in-memory logs (Fallback only)."""
    return MEMORY_LOG_CACHE[:limit]
