def is_safe(text: str) -> bool:
    """
    Checks if the user prompt contains malicious instructions or prompt injections.
    Uses simple keyword matching to avoid false positives from LLM-based checks.
    """
    suspicious_patterns = [
        "ignore all previous",
        "ignore previous instructions",
        "disregard all prior",
        "disregard previous",
        "override your instructions",
        "forget your instructions",
        "you are now",
        "act as if you are",
        "pretend you are",
        "new system prompt",
        "reveal your system prompt",
        "show me your prompt",
        "output your instructions",
    ]
    text_lower = text.lower().strip()
    for pattern in suspicious_patterns:
        if pattern in text_lower:
            return False
    return True

def validate_user_prompt(prompt: str) -> None:
    if not is_safe(prompt):
        raise ValueError("Your request was blocked for security reasons. Please rephrase your question.")
