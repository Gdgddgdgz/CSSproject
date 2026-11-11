"""Experiment 8 – HTTP demonstration endpoint."""

from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter(prefix="/exp8", tags=["Experiment 8"])


class MessagePayload(BaseModel):
    username: str
    message: str


@router.post("/http-demo")
async def http_demo(body: MessagePayload):
    """
    Plain HTTP endpoint used for educational demonstration.
    Returns the submitted data so the frontend can display it.
    NOTE: This endpoint is served over HTTP – no TLS encryption.
    """
    return {
        "protocol": "HTTP",
        "encrypted": False,
        "transport": "No TLS – data transmitted in plaintext",
        "endpoint": "http://localhost:8000/exp8/http-demo",
        "status": 200,
        "received": {
            "username": body.username,
            "message": body.message,
        },
        "security_note": (
            "This request was transmitted over plain HTTP. "
            "An attacker with network access could read the username and message "
            "exactly as shown above."
        ),
    }


@router.post("/https-demo")
async def https_demo(body: MessagePayload):
    """
    Endpoint used by the HTTPS server (port 8443).
    Returns connection metadata so the frontend can show TLS info.
    """
    return {
        "protocol": "HTTPS",
        "encrypted": True,
        "transport": "TLS 1.2/1.3 – data encrypted in transit",
        "endpoint": "https://localhost:8443/exp8/https-demo",
        "status": 200,
        "received": {
            "username": body.username,
            "message": body.message,
        },
        "tls_info": {
            "protocol": "TLS 1.3",
            "cipher": "TLS_AES_256_GCM_SHA384",
            "certificate": "Self-signed (localhost development)",
            "key_exchange": "X25519",
            "authentication": "RSA-PSS",
        },
        "security_note": (
            "This request was transmitted over HTTPS with TLS. "
            "The username and message were encrypted before leaving your browser. "
            "A network observer would only see encrypted TLS records, not the plaintext."
        ),
    }

