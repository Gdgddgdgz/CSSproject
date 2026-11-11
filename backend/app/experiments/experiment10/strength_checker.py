"""Experiment 10 – Password strength checker logic."""

import re
import string


# Common weak passwords (educational sample)
COMMON_PASSWORDS = {
    "password", "123456", "12345678", "qwerty", "abc123", "monkey",
    "1234567", "letmein", "trustno1", "dragon", "baseball", "iloveyou",
    "master", "sunshine", "princess", "welcome", "shadow", "superman",
    "michael", "football", "password1", "password123", "admin", "login",
    "hello", "qwerty123", "charlie", "donald", "passw0rd", "123456789",
}

SEQUENTIAL_PATTERNS = [
    "abcdefghijklmnopqrstuvwxyz",
    "01234567890",
    "qwertyuiop",
    "asdfghjkl",
    "zxcvbnm",
]


def check_strength(password: str) -> dict:
    """Evaluate password strength and return a detailed analysis."""
    if not password:
        return {"score": 0, "level": "None", "checks": {}, "suggestions": []}

    length = len(password)
    has_upper = bool(re.search(r"[A-Z]", password))
    has_lower = bool(re.search(r"[a-z]", password))
    has_digit = bool(re.search(r"\d", password))
    has_special = bool(re.search(r"[^A-Za-z0-9]", password))

    # Repeated chars (e.g. "aaa")
    has_repeats = bool(re.search(r"(.)\1{2,}", password))

    # Sequential patterns
    pw_lower = password.lower()
    has_sequential = any(
        pat[i : i + 3] in pw_lower
        for pat in SEQUENTIAL_PATTERNS
        for i in range(len(pat) - 2)
    )

    is_common = password.lower() in COMMON_PASSWORDS

    # Score: 0–100
    score = 0
    if length >= 8:
        score += 15
    if length >= 12:
        score += 15
    if length >= 16:
        score += 10
    if has_upper:
        score += 15
    if has_lower:
        score += 10
    if has_digit:
        score += 15
    if has_special:
        score += 20
    if has_repeats:
        score -= 10
    if has_sequential:
        score -= 10
    if is_common:
        score -= 30
    score = max(0, min(100, score))

    if score < 25:
        level = "Weak"
    elif score < 50:
        level = "Medium"
    elif score < 75:
        level = "Strong"
    else:
        level = "Very Strong"

    # Suggestions
    suggestions = []
    if length < 12:
        suggestions.append("Use at least 12 characters.")
    if not has_upper:
        suggestions.append("Add uppercase letters (A–Z).")
    if not has_lower:
        suggestions.append("Add lowercase letters (a–z).")
    if not has_digit:
        suggestions.append("Include numbers (0–9).")
    if not has_special:
        suggestions.append("Add special characters (!@#$%^&*).")
    if has_repeats:
        suggestions.append("Avoid repeating the same character 3+ times.")
    if has_sequential:
        suggestions.append("Avoid sequential patterns (abc, 123, qwerty).")
    if is_common:
        suggestions.append("This is a commonly used password – choose something unique.")

    # Entropy estimate (bits)
    charset = 0
    if has_lower:
        charset += 26
    if has_upper:
        charset += 26
    if has_digit:
        charset += 10
    if has_special:
        charset += 32
    if charset == 0:
        charset = 26
    import math
    entropy = round(length * math.log2(charset), 1)

    return {
        "score": score,
        "level": level,
        "entropy_bits": entropy,
        "checks": {
            "length_ok": length >= 8,
            "length_12": length >= 12,
            "has_uppercase": has_upper,
            "has_lowercase": has_lower,
            "has_digit": has_digit,
            "has_special": has_special,
            "no_repeats": not has_repeats,
            "no_sequential": not has_sequential,
            "not_common": not is_common,
        },
        "details": {
            "length": length,
            "charset_size": charset,
        },
        "suggestions": suggestions,
    }

