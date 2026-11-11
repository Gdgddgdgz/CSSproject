"""Experiment 10 – Educational brute-force simulator.

Restricted to short passwords and small character sets.
Always enforced with a maximum attempt cap and time limit.
"""

import itertools
import string
import time

MAX_ATTEMPTS = 500_000
MAX_SECONDS = 10.0

CHARSETS = {
    "digits": string.digits,                              # 10 chars
    "lowercase": string.ascii_lowercase,                 # 26 chars
    "alphanumeric": string.ascii_lowercase + string.digits,  # 36 chars
    "mixed": string.ascii_letters + string.digits,      # 62 chars
}


def search_space(charset_size: int, max_length: int) -> int:
    """Total candidates for all lengths from 1 to max_length."""
    total = 0
    for l in range(1, max_length + 1):
        total += charset_size ** l
    return total


def run_brute_force(
    target_password: str,
    charset_name: str = "alphanumeric",
    max_length: int = 4,
) -> dict:
    """
    Simulate a brute-force search for target_password within the given charset
    and length constraints.

    Hard limits: MAX_ATTEMPTS attempts or MAX_SECONDS seconds.
    Never targets external services.
    """
    charset = CHARSETS.get(charset_name, CHARSETS["alphanumeric"])
    charset_size = len(charset)
    space = search_space(charset_size, max_length)

    start = time.perf_counter()
    attempts = 0
    found = False
    found_candidate = None
    stopped_reason = "not_found"

    outer_break = False
    for length in range(1, max_length + 1):
        if outer_break:
            break
        for combo in itertools.product(charset, repeat=length):
            candidate = "".join(combo)
            attempts += 1

            if candidate == target_password:
                found = True
                found_candidate = candidate
                stopped_reason = "found"
                outer_break = True
                break

            elapsed_check = time.perf_counter() - start
            if attempts >= MAX_ATTEMPTS:
                stopped_reason = "attempt_limit"
                outer_break = True
                break
            if elapsed_check >= MAX_SECONDS:
                stopped_reason = "time_limit"
                outer_break = True
                break

    elapsed = round(time.perf_counter() - start, 4)

    return {
        "charset_name": charset_name,
        "charset_size": charset_size,
        "max_length": max_length,
        "search_space": space,
        "attempts": attempts,
        "elapsed_seconds": elapsed,
        "found": found,
        "matched": found_candidate,
        "stopped_reason": stopped_reason,
        "security_note": (
            f"Search space for up to {max_length} chars from {charset_size}-char set: "
            f"{space:,} candidates. "
            "Longer passwords and larger character sets grow the search space exponentially."
        ),
    }


def get_charsets() -> dict:
    return {k: len(v) for k, v in CHARSETS.items()}

