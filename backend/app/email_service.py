"""Gmail SMTP email delivery for OTP messages."""

import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

from app.config import settings


def send_otp_email(recipient_email: str, username: str, otp: str) -> None:
    """
    Send the OTP to *recipient_email* via Gmail SMTP with STARTTLS.

    Raises:
        RuntimeError: if SMTP credentials are not configured.
        smtplib.SMTPException: on any SMTP-level failure.
    """
    if not settings.SMTP_EMAIL or not settings.SMTP_APP_PASSWORD:
        raise RuntimeError(
            "SMTP credentials are not configured. "
            "Set SMTP_EMAIL and SMTP_APP_PASSWORD in your .env file."
        )

    subject = "SecureAuth – Your One-Time Password"
    html_body = f"""
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <style>
    body {{ font-family: Arial, sans-serif; background: #0d1117; color: #e6edf3; margin: 0; padding: 0; }}
    .container {{ max-width: 520px; margin: 40px auto; background: #161b22; border-radius: 12px; overflow: hidden; }}
    .header {{ background: linear-gradient(135deg, #1a3a5c 0%, #0d2137 100%); padding: 32px 40px; text-align: center; }}
    .header h1 {{ margin: 0; font-size: 26px; color: #60a5fa; letter-spacing: 2px; }}
    .body {{ padding: 36px 40px; }}
    .body p {{ color: #8b949e; line-height: 1.6; }}
    .otp-box {{ text-align: center; margin: 28px 0; }}
    .otp-code {{ display: inline-block; font-size: 38px; font-weight: bold; letter-spacing: 10px;
                 color: #60a5fa; background: #0d1117; padding: 16px 32px; border-radius: 10px;
                 border: 1px solid #30363d; }}
    .expiry {{ text-align: center; color: #f59e0b; font-size: 13px; margin-top: -8px; }}
    .footer {{ border-top: 1px solid #30363d; padding: 20px 40px; text-align: center;
               font-size: 12px; color #484f58; }}
    .footer span {{ color: #484f58; }}
  </style>
</head>
<body>
  <div class="container">
    <div class="header"><h1>🔐 SecureAuth</h1></div>
    <div class="body">
      <p>Hello <strong style="color:#e6edf3">{username}</strong>,</p>
      <p>Your two-factor authentication code is:</p>
      <div class="otp-box">
        <span class="otp-code">{otp}</span>
      </div>
      <p class="expiry">⏱ This code expires in <strong>2 minutes</strong>.</p>
      <p>If you did not request this code, please ignore this email. Your account remains secure.</p>
    </div>
    <div class="footer">
      <span>© 2024 SecureAuth · Do not reply to this email</span>
    </div>
  </div>
</body>
</html>
"""

    plain_body = (
        f"Hello {username},\n\n"
        f"Your SecureAuth one-time password is: {otp}\n\n"
        f"This code expires in 2 minutes.\n\n"
        f"If you did not request this code, ignore this email."
    )

    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"] = f"SecureAuth <{settings.SMTP_EMAIL}>"
    msg["To"] = recipient_email

    msg.attach(MIMEText(plain_body, "plain"))
    msg.attach(MIMEText(html_body, "html"))

    with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT) as server:
        server.ehlo()
        server.starttls()
        server.ehlo()
        server.login(settings.SMTP_EMAIL, settings.SMTP_APP_PASSWORD)
        server.sendmail(settings.SMTP_EMAIL, recipient_email, msg.as_string())

