from fastapi_mail import FastMail, MessageSchema, ConnectionConfig
from fastapi import BackgroundTasks
from .config import settings
import random
import string
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from . import models, schemas

# Email configuration
conf = ConnectionConfig(
    MAIL_USERNAME=settings.MAIL_USERNAME,
    MAIL_PASSWORD=settings.MAIL_PASSWORD,
    MAIL_FROM=settings.MAIL_FROM,
    MAIL_PORT=settings.MAIL_PORT,
    MAIL_SERVER=settings.MAIL_SERVER,
    MAIL_FROM_NAME=settings.MAIL_FROM_NAME,
    MAIL_STARTTLS=settings.MAIL_STARTTLS,
    MAIL_SSL_TLS=settings.MAIL_SSL_TLS,
    USE_CREDENTIALS=settings.USE_CREDENTIALS,
    TEMPLATE_FOLDER='./templates/email'
)

# Initialize FastMail
fm = FastMail(conf)

# OTP Generation and Management
def generate_otp(length: int = settings.OTP_LENGTH) -> str:
    """Generate a random OTP of specified length"""
    return ''.join(random.choices(string.digits, k=length))

def create_otp(db: Session, email: str, otp_type: str = "verification") -> models.OTP:
    """Create and store a new OTP in the database"""
    # Delete any existing OTPs for this email and type
    db.query(models.OTP).filter(
        models.OTP.email == email,
        models.OTP.otp_type == otp_type
    ).delete()
    
    # Generate new OTP
    otp_code = generate_otp()
    expires_at = datetime.utcnow() + timedelta(minutes=settings.OTP_EXPIRE_MINUTES)
    
    # Store in database
    db_otp = models.OTP(
        email=email,
        otp=otp_code,
        otp_type=otp_type,
        expires_at=expires_at
    )
    db.add(db_otp)
    db.commit()
    db.refresh(db_otp)
    
    return db_otp

def verify_otp(db: Session, email: str, otp: str, otp_type: str = "verification") -> bool:
    """Verify if the provided OTP is valid"""
    db_otp = db.query(models.OTP).filter(
        models.OTP.email == email,
        models.OTP.otp == otp,
        models.OTP.otp_type == otp_type,
        models.OTP.is_used == False,
        models.OTP.expires_at > datetime.utcnow()
    ).first()
    
    if not db_otp:
        return False
    
    # Mark OTP as used
    db_otp.is_used = True
    db_otp.used_at = datetime.utcnow()
    db.commit()
    
    return True

# Email Templates
async def send_verification_email(background_tasks: BackgroundTasks, email: str, otp: str):
    """Send verification email with OTP"""
    subject = "Verify Your Email Address"
    body = f"""
    <html>
        <body>
            <h2>Welcome to SafeNavi!</h2>
            <p>Thank you for registering. Please use the following OTP to verify your email address:</p>
            <h1 style="font-size: 36px; letter-spacing: 5px; color: #4a6cf7;">{otp}</h1>
            <p>This OTP will expire in {settings.OTP_EXPIRE_MINUTES} minutes.</p>
            <p>If you didn't request this, please ignore this email.</p>
            <p>Best regards,<br>SafeNavi Team</p>
        </body>
    </html>
    """
    
    message = MessageSchema(
        subject=subject,
        recipients=[email],
        body=body,
        subtype="html"
    )
    
    # Send email in background
    background_tasks.add_task(fm.send_message, message)

async def send_password_reset_email(background_tasks: BackgroundTasks, email: str, reset_token: str):
    """Send password reset email with reset link"""
    reset_url = f"{settings.FRONTEND_URL}/reset-password?token={reset_token}"
    
    subject = "Password Reset Request"
    body = f"""
    <html>
        <body>
            <h2>Reset Your Password</h2>
            <p>We received a request to reset your password. Click the button below to proceed:</p>
            <a href="{reset_url}" style="
                display: inline-block;
                padding: 10px 20px;
                background-color: #4a6cf7;
                color: white;
                text-decoration: none;
                border-radius: 5px;
                margin: 10px 0;
            ">Reset Password</a>
            <p>Or copy and paste this link into your browser:</p>
            <p>{reset_url}</p>
            <p>This link will expire in 1 hour.</p>
            <p>If you didn't request a password reset, please ignore this email.</p>
            <p>Best regards,<br>SafeNavi Team</p>
        </body>
    </html>
    """
    
    message = MessageSchema(
        subject=subject,
        recipients=[email],
        body=body,
        subtype="html"
    )
    
    # Send email in background
    background_tasks.add_task(fm.send_message, message)
