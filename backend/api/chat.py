"""
AI Chat Assistant Router
"""
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import List
import logging

from backend.auth.models import get_current_user
from backend.db.models import User
from backend.config import settings

router = APIRouter(prefix="/chat", tags=["chat"])
logger = logging.getLogger(__name__)

# Configure Gemini
model = None
try:
    import google.generativeai as genai
    if settings.GEMINI_API_KEY:
        genai.configure(api_key=settings.GEMINI_API_KEY)
        model = genai.GenerativeModel('gemini-2.5-flash')
        logger.info("Gemini Model initialized successfully.")
    else:
        logger.warning("GEMINI_API_KEY not set. Chat will use rule-based fallback.")
except ImportError:
    logger.warning("google-generativeai not installed. Chat will use rule-based fallback.")

class ChatRequest(BaseModel):
    message: str
    context: str = None

class ChatResponse(BaseModel):
    response: str
    role: str = "ai"

@router.post("/ask")
async def ask_assistant(
    request: ChatRequest,
    current_user: User = Depends(get_current_user)
):
    msg = request.message
    global model

    # Lazy init model if needed
    if model is None and settings.GEMINI_API_KEY:
        try:
            import google.generativeai as genai
            genai.configure(api_key=settings.GEMINI_API_KEY)
            model = genai.GenerativeModel('gemini-2.5-flash')
        except Exception as e:
            logger.error(f"Gemini init failed: {e}")

    if model:
        try:
            prompt = (
                f"You are the RIMN Study Assistant, an elite multimodal educational AI. "
                f"The student's name is {current_user.full_name.split()[0]}. "
                f"Provide extremely accurate, helpful, and concise educational guidance. "
                f"Use a professional, encouraging tone. Explain concepts clearly. "
                f"Focus on 11th and 12th standard (High School) level accuracy. "
                f"Student Query: {msg}"
            )
            response = model.generate_content(prompt)
            return {"response": response.text, "role": "ai"}
        except Exception as e:
            logger.error(f"Gemini API call failed: {e}")

    # Rule-based fallback for reliability
    msg_lower = msg.lower()
    if "free body diagram" in msg_lower or "fbd" in msg_lower:
        response = (
            "To break down a Free Body Diagram (FBD):\n\n"
            "1. **Isolate the object**: Treat it as a single point mass.\n"
            "2. **Identify all forces**: Weight (W=mg) acting down, Normal force (N) perpendicular to surface, "
            "Tension (T) along strings, and Friction (f) opposing motion.\n"
            "3. **Set up coordinates**: Align your x-axis with the direction of motion.\n"
            "4. **Resolve Vectors**: Use Fx = ma and Fy = 0 for equilibrium."
        )
    elif "newton" in msg_lower:
        response = (
            "Newton's Laws are the foundation of classical mechanics:\n"
            "- **1st Law**: Objects stay at rest or in motion unless acted upon by a net force.\n"
            "- **2nd Law**: Force = mass × acceleration (F=ma).\n"
            "- **3rd Law**: For every action, there is an equal and opposite reaction."
        )
    else:
        response = f"Hi {current_user.full_name.split()[0]}! I'm your RIMN Study Assistant. Could you please provide more context about your question so I can help you more accurately?"

    return {"response": response, "role": "ai"}
