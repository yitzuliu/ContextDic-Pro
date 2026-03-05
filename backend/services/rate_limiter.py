"""
In-memory per-IP rate limiter.

Uses minute-granularity buckets. Thread-safe for the single-process
Flask dev server; for multi-process deployments swap this for Redis
or a shared-memory solution.
"""

import time

# Module-level state
_counters: dict[tuple[str, int], int] = {}


def check_rate_limit(ip: str, max_requests: int) -> bool:
    """Check whether *ip* has exceeded *max_requests* in the current minute.

    If the request is allowed, the counter is incremented and ``True`` is
    returned.  Otherwise ``False`` is returned and the caller should
    reject the request with HTTP 429.

    Args:
        ip:            Client IP address.
        max_requests:  Maximum requests per minute.

    Returns:
        ``True`` if within the limit, ``False`` if exceeded.
    """
    bucket = int(time.time() // 60)
    key = (ip, bucket)
    current = _counters.get(key, 0)

    if current >= max_requests:
        return False

    _counters[key] = current + 1

    # Periodic cleanup to prevent unbounded memory growth
    if len(_counters) > 5000:
        _prune(bucket)

    return True


def _prune(current_bucket: int) -> None:
    """Remove counters older than 2 minutes."""
    for key in list(_counters):
        if key[1] < current_bucket - 2:
            del _counters[key]


def get_counters() -> dict:
    """Expose internal counters for testing."""
    return _counters
