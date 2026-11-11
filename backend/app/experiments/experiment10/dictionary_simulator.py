"""Experiment 10 – Educational dictionary attack simulator.

Operates ONLY on locally generated test credentials.
Never targets real accounts or external endpoints.
"""

import time
import bcrypt

# ── Educational wordlist (locally stored, no external downloads) ────────────
WORDLIST = [
    "password", "123456", "12345678", "qwerty", "abc123", "monkey",
    "letmein", "dragon", "baseball", "iloveyou", "master", "sunshine",
    "princess", "welcome", "shadow", "superman", "michael", "football",
    "password1", "password123", "admin", "login", "hello", "charlie",
    "donald", "passw0rd", "123456789", "trustno1", "qwerty123", "love",
    "secret", "test", "pass", "guest", "user", "root", "toor", "alpine",
    "changeme", "default", "1234", "12345", "1234567", "654321",
    "111111", "000000", "7777777", "1q2w3e", "1qaz2wsx", "zaq12wsx",
]


def run_dictionary_attack(target_password: str, use_hash: bool = False) -> dict:
    """
    Simulate a dictionary attack against a locally supplied test password.
    
    Args:
        target_password: The test password to attack (plain text for simulation).
        use_hash: If True, simulate attacking a bcrypt-hashed credential to show
                  the cost difference.
    
    Returns:
        Dict with attempt count, elapsed time, and whether the password was found.
    """
    start = time.perf_counter()
    attempts = 0
    found = False
    found_at = None

    if use_hash:
        # Hash the target to simulate offline hash cracking
        target_hash = bcrypt.hashpw(target_password.encode(), bcrypt.gensalt(rounds=4)).decode()

        for candidate in WORDLIST:
            attempts += 1
            if bcrypt.checkpw(candidate.encode(), target_hash.encode()):
                found = True
                found_at = candidate
                break
    else:
        # Plain comparison (simulates unprotected storage)
        for candidate in WORDLIST:
            attempts += 1
            if candidate == target_password:
                found = True
                found_at = candidate
                break

    elapsed = round(time.perf_counter() - start, 4)

    return {
        "mode": "bcrypt_hash" if use_hash else "plaintext",
        "wordlist_size": len(WORDLIST),
        "attempts": attempts,
        "elapsed_seconds": elapsed,
        "found": found,
        "matched_word": found_at,
        "target_in_wordlist": target_password in WORDLIST,
        "security_note": (
            "bcrypt adds significant per-attempt cost to offline cracking."
            if use_hash
            else "Plain-text comparison is instant – never store passwords in plaintext."
        ),
    }


def get_wordlist() -> list:
    return WORDLIST

