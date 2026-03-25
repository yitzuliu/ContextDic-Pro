"""
In-memory per-IP rate limiter for FastAPI.
"""

import time
from fastapi import Request, HTTPException

_counters: dict[tuple[str, int], int] = {}

def check_rate_limit_fastapi(request: Request, max_requests: int):
    ip = request.client.host if request.client else "unknown"
    bucket = int(time.time() // 60)
    key = (ip, bucket)
    current = _counters.get(key, 0)

    if current >= max_requests:
        raise HTTPException(status_code=429, detail="Rate limit exceeded. Please wait and try again.")

    _counters[key] = current + 1

    if len(_counters) > 5000:
        _prune(bucket)

def _prune(current_bucket: int) -> None:
    for key in list(_counters):
        if key[1] < current_bucket - 2:
            del _counters[key]

def get_counters() -> dict:
    return _counters
