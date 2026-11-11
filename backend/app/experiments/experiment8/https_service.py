"""Experiment 8 – HTTPS background runner service (optional/auxiliary if running standalone HTTPS server on 8443)."""

import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.experiments.experiment8.http_service import router as exp8_router
from app.experiments.experiment8.tls_config import ensure_tls_certificates

https_app = FastAPI(title="SecureAuth HTTPS Demo Server")

https_app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

https_app.include_router(exp8_router)


def run_https_server():
    cert_file, key_file = ensure_tls_certificates()
    if not cert_file or not key_file:
        print("TLS Certificates could not be loaded/created.")
        return

    uvicorn.run(
        https_app,
        host="0.0.0.0",
        port=8443,
        ssl_certfile=cert_file,
        ssl_keyfile=key_file,
    )


if __name__ == "__main__":
    run_https_server()

