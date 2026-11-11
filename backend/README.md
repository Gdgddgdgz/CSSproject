# 🔐 SecureAuth — Cryptography & System Security Practical Platform

**Experiments Suite: Experiment 6, Experiment 8, and Experiment 10**

SecureAuth is an enterprise-hardened full-stack practical demonstration platform covering authentication, transport layer security, and password attack mitigation.

---

## 📑 Practical Experiments Included

1. **Experiment 6: Mandatory Two-Factor Authentication (2FA)**
   - Username/Password authentication.
   - bcrypt-hashed password verification.
   - Cryptographically random 6-digit OTP generation (`secrets.randbelow`).
   - Real email dispatch via Gmail SMTP (`smtp.gmail.com:587`, STARTTLS).
   - Rate limiting, 2-minute OTP expiry, 5-attempt lockout, 30s resend cooldown.
   - Server-side authenticated session management with SHA-256 token hashing.

2. **Experiment 8: HTTP vs HTTPS Using TLS**
   - **HTTP Test:** Plaintext transmission demonstration (cleartext wire representation).
   - **HTTPS Test:** Genuine TLS-encrypted communication demonstration with TLS 1.3 parameters.
   - **Protocol Comparison:** Side-by-side matrix across confidentiality, integrity, port, and authentication.
   - **TLS & Wireshark Specs:** Handshake breakdown (ClientHello &rarr; Finished) and packet sniffing guide.

3. **Experiment 10: Password Strength Evaluation and Attack Simulation**
   - **Real-Time Evaluator:** Entropy calculation (bits), character set coverage, repetition and sequential detection.
   - **Controlled Dictionary Attack:** Offline wordlist attack simulation comparing plaintext speed vs bcrypt key-stretching.
   - **Controlled Brute-Force Simulator:** Combinatorial candidate search ($|\Sigma|^L$) with bounded search space and timeout protection.
   - **Attack vs Defense Matrix:** Side-by-side comparison of an unprotected login endpoint vs an enterprise-protected endpoint with bcrypt delays and 5-attempt/15s account lockout.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 19, Vite, JavaScript (JSX), Custom Cybersecurity Dark Theme |
| **Backend** | Python 3.13, FastAPI, SQLAlchemy, Uvicorn, SlowAPI |
| **Database** | SQLite (`secureauth.db`) |
| **Security / Crypto** | `bcrypt`, Python `secrets`, `cryptography` (X.509 TLS certs) |
| **Email Protocol** | Gmail SMTP (STARTTLS, Port 587) |

---

## 🚀 Execution Instructions

### 1. Backend Server Setup

Navigate to the `backend` directory:
```powershell
cd c:\Users\awwab\Desktop\CSS\Project\backend
```

Configure your `.env` file (if testing Experiment 6 Gmail OTP):
```env
SMTP_EMAIL=your_actual_email@gmail.com
SMTP_APP_PASSWORD=xxxx xxxx xxxx xxxx
```
*(If you only wish to test Experiment 8 and Experiment 10, no Gmail credentials are required).*

Start the FastAPI backend server (HTTP on port 8000):
```powershell
.\venv\Scripts\uvicorn.exe app.main:app --host 0.0.0.0 --port 8000 --reload
```

*(Optional)* Start the dedicated HTTPS server on port 8443 for Experiment 8 TLS testing:
```powershell
.\venv\Scripts\python.exe -m app.experiments.experiment8.https_service
```

### 2. Frontend Development Server Setup

Open a second terminal and navigate to `frontend`:
```powershell
cd c:\Users\awwab\Desktop\CSS\Project\frontend
npm run dev
```

Open your browser at:
👉 **`http://localhost:5173`**

Use the top navigation bar to seamlessly switch between **Exp 6**, **Exp 8**, and **Exp 10**.

---

## 🧪 Testing Verification Checklist

| Experiment | Component | Expected Outcome | Verified |
|---|---|---|---|
| **Exp 6** | User Registration | Validates inputs, stores bcrypt hash, rejects duplicates | ✅ |
| **Exp 6** | Login & OTP Verification | Rejects wrong password; sends real Gmail OTP; verifies 6-digit code | ✅ |
| **Exp 6** | Lockout & Expiry | 5 wrong attempts lock OTP; 2-minute timer invalidates OTP | ✅ |
| **Exp 8** | HTTP Insecure Demo | Cleartext inspection reveals unencrypted payload | ✅ |
| **Exp 8** | HTTPS TLS Demo | Verifies TLS 1.3 ciphertext record layer & parameter negotiation | ✅ |
| **Exp 8** | Comparison Matrix | Explains transport encryption, default ports, and certificate trust | ✅ |
| **Exp 10** | Password Strength | Live entropy rating, checklist criteria, and remediation advice | ✅ |
| **Exp 10** | Dictionary Attack | Discovers common passwords; demonstrates bcrypt offline cracking cost | ✅ |
| **Exp 10** | Brute-Force Simulation | Calculates $|\Sigma|^L$ search space; bounded search with safety cap | ✅ |
| **Exp 10** | Attack vs Defense | Unprotected endpoint allows unlimited brute-force; Protected enforces 5-attempt lockout | ✅ |
