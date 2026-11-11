"""Experiment 10 – Defense simulation: Rate limiting, account lockout, and bcrypt impact.

Simulates and compares unprotected vs protected authentication mechanisms.
"""

import time
import bcrypt


class DefenseSimulator:
    def __init__(self):
        # Simulated in-memory database for educational testing
        self.max_attempts = 5
        self.lockout_seconds = 15
        self.failed_attempts = {}  # ip/user -> count
        self.locked_until = {}     # ip/user -> timestamp

    def reset(self):
        self.failed_attempts.clear()
        self.locked_until.clear()

    def simulate_unprotected_login(self, target_password: str, candidate_password: str) -> dict:
        """Unprotected: plain comparison, no rate limit, no lockout."""
        start = time.perf_counter()
        success = (target_password == candidate_password)
        elapsed = time.perf_counter() - start
        return {
            "status": "success" if success else "failed",
            "time_taken_ms": round(elapsed * 1000, 3),
            "mechanism": "Unprotected (Plaintext match, no delay/lockout)",
            "message": "Login successful" if success else "Invalid credentials"
        }

    def simulate_protected_login(self, client_id: str, target_hash: str, candidate_password: str) -> dict:
        """
        Protected:
        - Checks lockout
        - Uses bcrypt verification (computationally expensive)
        - Tracks failed attempts and locks out if limit exceeded
        """
        now = time.time()
        
        # 1. Lockout check
        if client_id in self.locked_until:
            if now < self.locked_until[client_id]:
                remaining = int(self.locked_until[client_id] - now)
                return {
                    "status": "locked",
                    "time_taken_ms": 0.05,
                    "mechanism": "Account Lockout Active",
                    "remaining_lockout_seconds": remaining,
                    "message": f"Account temporarily locked due to excessive failed attempts. Try again in {remaining}s."
                }
            else:
                # Lockout expired
                del self.locked_until[client_id]
                self.failed_attempts[client_id] = 0

        # 2. Authenticate with bcrypt
        start = time.perf_counter()
        try:
            success = bcrypt.checkpw(candidate_password.encode('utf-8'), target_hash.encode('utf-8'))
        except Exception:
            success = False
        elapsed = time.perf_counter() - start

        # 3. Handle result & attempts
        if success:
            self.failed_attempts[client_id] = 0
            return {
                "status": "success",
                "time_taken_ms": round(elapsed * 1000, 2),
                "mechanism": "Protected (bcrypt hash + lockout monitoring)",
                "attempts_remaining": self.max_attempts,
                "message": "Login successful."
            }
        else:
            current_failures = self.failed_attempts.get(client_id, 0) + 1
            self.failed_attempts[client_id] = current_failures
            
            if current_failures >= self.max_attempts:
                self.locked_until[client_id] = now + self.lockout_seconds
                return {
                    "status": "locked",
                    "time_taken_ms": round(elapsed * 1000, 2),
                    "mechanism": "Account Lockout Triggered",
                    "remaining_lockout_seconds": self.lockout_seconds,
                    "message": f"Maximum 5 failed attempts reached! Account locked for {self.lockout_seconds} seconds."
                }
            
            remaining = self.max_attempts - current_failures
            return {
                "status": "failed",
                "time_taken_ms": round(elapsed * 1000, 2),
                "mechanism": "Protected (bcrypt hash + lockout monitoring)",
                "attempts_remaining": remaining,
                "message": f"Invalid password. {remaining} attempt(s) remaining before temporary lockout."
            }


defense_service = DefenseSimulator()

