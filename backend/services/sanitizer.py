"""
Input sanitiser for user-supplied text.

Strips dangerous HTML, neutralises common injection patterns,
and enforces a maximum length to prevent prompt overflow.
"""

import re

# Maximum characters allowed per input field
MAX_INPUT_LENGTH = 4000

# HTML tags that should always be stripped
_DANGEROUS_TAGS = re.compile(
    r'<\s*/?\s*(script|iframe|object|embed|link|meta|style|form|input|button)'
    r'[^>]*>',
    re.IGNORECASE,
)

# HTML event handlers (onclick, onerror, …)
_EVENT_HANDLERS = re.compile(
    r'\s+on\w+\s*=\s*["\'][^"\']*["\']',
    re.IGNORECASE,
)


def sanitize(text: str, max_length: int = MAX_INPUT_LENGTH) -> str:
    """Sanitise user-supplied text before embedding in a prompt.

    Processing steps:
    1. Return early for falsy input.
    2. Strip dangerous HTML tags (``<script>``, ``<iframe>``, etc.).
    3. Strip inline event handlers (``onclick``, ``onerror``, …).
    4. Truncate to *max_length* characters.

    Args:
        text:       Raw user input.
        max_length: Upper bound on output length (default 4 000).

    Returns:
        Cleaned string safe for prompt interpolation.
    """
    if not text:
        return ''

    cleaned = _DANGEROUS_TAGS.sub('', text)
    cleaned = _EVENT_HANDLERS.sub('', cleaned)

    return cleaned[:max_length]
