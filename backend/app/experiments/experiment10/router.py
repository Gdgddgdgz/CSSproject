"""API Router for Experiment 10 (Password Strength, Dictionary, Brute Force, Defense)."""

from fastapi import APIRouter
from pydantic import BaseModel, Field
import bcrypt

from app.experiments.experiment10.strength_checker import check_strength
from app.experiments.experiment10.dictionary_simulator import run_dictionary_attack, get_wordlist
from app.experiments.experiment10.brute_force_simulator import run_brute_force, get_charsets
from app.experiments.experiment10.defense import defense_service

router = APIRouter(prefix="/exp10", tags=["Experiment 10"])


class StrengthRequest(BaseModel):
    password: str = Field(..., max_length=128)


class DictionaryAttackRequest(BaseModel):
    target_password: str = Field(..., max_length=64)
    use_hash: bool = False


class BruteForceRequest(BaseModel):
    target_password: str = Field(..., max_length=8)
    charset_name: str = "alphanumeric"
    max_length: int = 4


class DefenseTestRequest(BaseModel):
    target_password: str = Field(..., max_length=64)
    candidate_password: str = Field(..., max_length=64)
    mode: str = "protected"  # "unprotected" or "protected"
    client_id: str = "test-client-ip"


@router.post("/check-strength")
async def evaluate_password(body: StrengthRequest):
    """Evaluates password strength and returns entropy, criteria checks, and recommendations."""
    return check_strength(body.password)


@router.get("/wordlist")
async def fetch_wordlist():
    """Returns educational local wordlist samples."""
    return {"wordlist": get_wordlist()}


@router.post("/dictionary-attack")
async def simulate_dictionary_attack(body: DictionaryAttackRequest):
    """Runs a controlled educational dictionary attack against local test input."""
    return run_dictionary_attack(body.target_password, body.use_hash)


@router.get("/charsets")
async def fetch_charsets():
    """Returns available character sets for brute force simulation."""
    return {"charsets": get_charsets()}


@router.post("/brute-force")
async def simulate_brute_force(body: BruteForceRequest):
    """Runs a controlled bounded brute force simulation against local test input."""
    return run_brute_force(
        target_password=body.target_password,
        charset_name=body.charset_name,
        max_length=body.max_length,
    )


@router.post("/defense-test")
async def test_defense(body: DefenseTestRequest):
    """Simulates login attempt under unprotected vs protected defense configurations."""
    if body.mode == "unprotected":
        return defense_service.simulate_unprotected_login(
            target_password=body.target_password,
            candidate_password=body.candidate_password
        )
    else:
        # Generate bcrypt hash of target password for protected test
        target_hash = bcrypt.hashpw(body.target_password.encode('utf-8'), bcrypt.gensalt(rounds=10)).decode('utf-8')
        return defense_service.simulate_protected_login(
            client_id=body.client_id,
            target_hash=target_hash,
            candidate_password=body.candidate_password
        )


@router.post("/defense-reset")
async def reset_defense():
    """Resets defense simulator lockout and failed attempt counters."""
    defense_service.reset()
    return {"message": "Defense counter and lockout state reset successfully."}

