# 🔐 SecureAuth — Cryptography & System Security Practical Platform

SecureAuth is an enterprise-grade cybersecurity web platform developed for the Cryptography & System Security (CSS) Laboratory. It integrates practical demonstrations of multi-factor authentication, transport layer cryptographic protocols, and password cryptanalysis with defense mechanisms.

---

## 🌟 Modules Included

### 1. 🔐 Experiment 6: Mandatory Two-Factor Authentication (2FA)
- **User Registration:** Validates credentials, enforces unique usernames/emails, and hashes passwords using `bcrypt` with salt (plaintext passwords are never stored).
- **Primary Authentication:** Authenticates username/password credentials against an SQLite database.
- **Cryptographic OTP Generation:** Generates a 6-digit one-time password using Python's cryptographically secure `secrets` library (`secrets.randbelow`).
- **Real Email Delivery:** Dispatches OTPs to user inboxes using Gmail SMTP (`smtp.gmail.com:587`, STARTTLS) with secure Gmail App Password credentials.
- **Backend Verification:** Validates the OTP against bcrypt-hashed tokens stored in the database.
- **Security Controls:**
  - 2-minute OTP expiry.
  - Maximum 5 incorrect attempt limit before OTP invalidation.
  - 30-second resend cooldown timer.
  - Per-IP rate limiting via `slowapi`.
  - 8-hour session expiration with SHA-256 hashed session tokens.
- **Protected Dashboard:** Restricted view accessible only after successful password and OTP verification.

### 2. 🌐 Experiment 8: HTTP vs HTTPS Transport Security (TLS)
- **Insecure HTTP Demo:** Demonstrates how HTTP transmits credentials and messages across the wire in plaintext, showing unencrypted packet visibility.
- **Secure HTTPS Demo:** Demonstrates end-to-end encrypted transmission over TLS 1.3 using an X.509 localhost certificate and authenticated cipher suites (`TLS_AES_256_GCM_SHA384`).
- **Protocol Comparison Matrix:** Side-by-side analysis of encryption, ports (80 vs 443), confidentiality, integrity protection (AEAD), and server certificate authentication.
- **Cryptographic Specifications & Wireshark Guide:** 1-RTT TLS 1.3 handshake breakdown and step-by-step instructions for inspecting loopback traffic in Wireshark.

### 3. 🛡️ Experiment 10: Password Strength & Attack Simulation
- **Real-Time Password Evaluator:** Computes Shannon entropy (bits), checks length, case diversity, digits, symbols, and flags repeating or sequential patterns.
- **Controlled Dictionary Attack:** Runs bounded offline dictionary attacks using an educational wordlist, comparing instant plaintext matching against bcrypt key-stretching delay.
- **Bounded Brute-Force Simulator:** Combinatorial candidate search ($|\Sigma|^L$) across digit, lowercase, alphanumeric, and mixed alphabets with attempt caps and safety timeouts.
- **Active Defense Comparison:** Side-by-side simulation comparing an unprotected endpoint (vulnerable to high-frequency automated guessing) against an enterprise-hardened endpoint with deliberate bcrypt hashing latency and a 5-attempt limit with a 15-second lockout.

---

## 🏗️ Architecture & Technology Stack

| Component | Technologies |
|---|---|
| **Frontend** | React 19, Vite, JavaScript (JSX), Custom Cybersecurity Dark UI |
| **Backend** | Python 3.13, FastAPI, SQLAlchemy, Uvicorn, SlowAPI |
| **Database** | SQLite (`secureauth.db`) |
| **Cryptography** | `bcrypt`, Python `secrets`, `cryptography` (X.509 certs), `hashlib` |
| **Email Protocol** | Gmail SMTP (Port 587, STARTTLS) |

---

## 📁 Project Structure

```
Project/
├── backend/
│   ├── app/
│   │   ├── experiments/
│   │   │   ├── experiment8/
│   │   │   │   ├── http_service.py     # HTTP/HTTPS demonstration endpoints
│   │   │   │   ├── https_service.py    # Dedicated TLS server runner
│   │   │   │   └── tls_config.py       # Self-signed X.509 cert generator
│   │   │   └── experiment10/
│   │   │       ├── brute_force_simulator.py # Combinatorial search
│   │   │       ├── defense.py          # Lockout & rate limit simulation
│   │   │       ├── dictionary_simulator.py # Educational dictionary attack
│   │   │       ├── router.py           # Experiment 10 API routes
│   │   │       └── strength_checker.py # Entropy & pattern evaluation
│   │   ├── auth.py                     # Password, OTP & session security
│   │   ├── config.py                   # Environment configuration loader
│   │   ├── database.py                 # SQLAlchemy engine & session factory
│   │   ├── email_service.py            # Gmail SMTP delivery service
│   │   ├── models.py                   # User, OTPRecord, Session ORM models
│   │   ├── schemas.py                  # Pydantic validation schemas
│   │   └── main.py                     # FastAPI application & route mounting
│   ├── .env.example                    # Sample environment template
│   └── requirements.txt                # Python dependencies
│
└── frontend/
    ├── src/
    │   ├── pages/
    │   │   ├── exp8/                   # Experiment 8 components
    │   │   ├── exp10/                  # Experiment 10 components
    │   │   ├── Dashboard.jsx           # Protected user dashboard
    │   │   ├── Experiment6.jsx         # 2FA container
    │   │   ├── Experiment8.jsx         # HTTP vs HTTPS container
    │   │   ├── Experiment10.jsx        # Password security container
    │   │   ├── ExperimentsPortal.jsx   # Central dashboard hub
    │   │   ├── Login.jsx               # Username/password sign-in
    │   │   ├── OTPVerify.jsx           # 6-box OTP entry & timer
    │   │   └── Register.jsx            # Account registration
    │   ├── api.js                      # Central API client
    │   ├── App.jsx                     # Top navigation & routing
    │   ├── App.css                     # Cybersecurity theme styles
    │   └── main.jsx                    # Vite app entry point
    ├── package.json
    └── vite.config.js
```

---

## ⚙️ Installation & Setup

### Prerequisites
- Python 3.10+
- Node.js 18+ and npm
- Gmail account with 2-Step Verification enabled (for Experiment 6 email OTP)

---

### Step 1: Clone the Repository
```bash
git clone https://github.com/Gdgddgdgz/CSSproject.git
cd CSSproject
```

---

### Step 2: Backend Setup

1. Open a terminal and navigate to `backend/`:
   ```bash
   cd backend
   ```

2. Create a virtual environment and activate it:
   - **Windows (PowerShell):**
     ```powershell
     python -m venv venv
     .\venv\Scripts\Activate.ps1
     ```
   - **Linux / macOS:**
     ```bash
     python3 -m venv venv
     source venv/bin/activate
     ```

3. Install backend dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Configure environment variables:
   Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

5. Update `backend/.env` with your Gmail SMTP credentials:
   ```env
   SMTP_EMAIL=your_email@gmail.com
   SMTP_APP_PASSWORD=xxxx xxxx xxxx xxxx
   ```
   > **Note:** To obtain a Gmail App Password:
   > 1. Go to [Google Account Security](https://myaccount.google.com/security).
   > 2. Ensure **2-Step Verification** is turned on.
   > 3. Go to [App Passwords](https://myaccount.google.com/apppasswords).
   > 4. Create an entry (e.g. `SecureAuth`) and copy the generated 16-character password into `.env`.

6. Run the FastAPI backend:
   ```bash
   uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
   ```
   The backend API will be live at `http://localhost:8000`.  
   Interactive Swagger documentation is available at `http://localhost:8000/docs`.

---

### Step 3: Frontend Setup

1. Open a second terminal and navigate to `frontend/`:
   ```bash
   cd frontend
   ```

2. Install Node dependencies:
   ```bash
   npm install
   ```

3. Start the Vite development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to:
   ```
   http://localhost:5173
   ```

---

## 🧪 Testing the Practical Experiments

1. **Experiment 6 (Two-Factor Authentication):**
   - Click **Launch 2FA Authentication Portal**.
   - Register a new user with a valid username and your real email address.
   - Log in using your username and password.
   - Check your inbox for the 6-digit OTP code and enter it to access the authenticated dashboard.
   - Test security controls: enter an invalid OTP (remaining attempts decrement), try after 2 minutes (expired OTP rejected), or click resend (30-second cooldown).

2. **Experiment 8 (HTTP vs HTTPS):**
   - Click **Launch Network Security Lab**.
   - Transmit sample credentials via HTTP to view the plaintext wire representation.
   - Transmit via HTTPS to observe TLS 1.3 ciphertext record headers and AEAD tag verification.
   - Switch to **Protocol Comparison** and **TLS & Wireshark Specs** for analysis.

3. **Experiment 10 (Password Attacks & Defense):**
   - Click **Launch Password Security Lab**.
   - **Strength Evaluator:** Enter passwords to see live Shannon entropy calculation and requirement checks.
   - **Dictionary Attack:** Test pre-configured passwords against the educational wordlist with and without bcrypt key-stretching.
   - **Brute-Force Attack:** Run bounded combinatorial search across selected alphabets.
   - **Attack vs Defense:** Submit automated guesses to compare an unprotected endpoint vs an enterprise-protected endpoint enforcing 5-attempt lockout.

---

## 🔒 Security Best Practices Implemented
- Plaintext passwords and OTPs are **never stored** in the database.
- OTPs are hashed using `bcrypt` and invalidated immediately upon first use.
- Session tokens are cryptographically random strings (`secrets.token_urlsafe(32)`) stored solely as SHA-256 hashes.
- Environment secrets (`.env`), SQLite databases, TLS keys, and build artifacts are strictly excluded via `.gitignore`.
