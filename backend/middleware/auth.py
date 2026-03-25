"""
FastAPI dependencies for ContextDic Pro.
"""

from fastapi import Header, HTTPException
import os
from dotenv import load_dotenv

load_dotenv()
API_SECRET = os.getenv('API_SECRET', '')

async def verify_api_secret(x_api_secret: str = Header(default='')):
    """Verify the X-API-Secret header."""
    if not API_SECRET:
        # No secret configured → skip auth (dev mode)
        return x_api_secret
    if x_api_secret != API_SECRET:
        raise HTTPException(status_code=403, detail="Unauthorized: invalid or missing API secret.")
    return x_api_secret
