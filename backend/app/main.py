from fastapi import FastAPI, Depends, HTTPException, status, BackgroundTasks, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import timedelta
from typing import List, Optional
import uvicorn

from . import models, schemas, auth, email_service
from .database import SessionLocal, engine
from .config import settings

# Create database tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="SafeNavi API", version="1.0.0")

# Test endpoint
@app.get("/test")
async def test_endpoint():
    return {"message": "Server is running!"}

@app.get("/test-email")
async def test_email(background_tasks: BackgroundTasks):
    test_email = "jiyahaldankar777@gmail.com"
    test_otp = "123456"  # For testing only
    
    # This will print the OTP to the console
    print(f"\n=== TEST MODE ===")
    print(f"If emails were configured, an OTP would be sent to: {test_email}")
    print(f"Test OTP: {test_otp}")
    print("================\n")
    
    # If you want to try sending a real email, uncomment this:
    # await email_service.send_verification_email(background_tasks, test_email, test_otp)
    
    return {
        "message": "Check your terminal for the test OTP. Uncomment the email line in the code to send real emails.",
        "test_email": test_email,
        "test_otp": test_otp
    }

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Routes
@app.post("/register", response_model=schemas.UserResponse)
async def register(
    user_data: schemas.UserCreate, 
    background_tasks: BackgroundTasks, 
    db: Session = Depends(get_db)
):
    # Check if user already exists
    db_user = db.query(models.User).filter(models.User.email == user_data.email).first()
    if db_user:
        if db_user.is_verified:
            raise HTTPException(status_code=400, detail="Email already registered")
        # If user exists but not verified, delete the old user
        db.delete(db_user)
        db.commit()
    
    # Create company
    company = models.Company(
        name=user_data.company_name,
        country=user_data.country,
        currency="USD"  # Default, can be updated based on country
    )
    db.add(company)
    db.commit()
    db.refresh(company)
    
    # Create user
    hashed_password = auth.get_password_hash(user_data.password)
    db_user = models.User(
        email=user_data.email,
        hashed_password=hashed_password,
        full_name=user_data.full_name,
        company_id=company.id,
        is_active=False,  # Will be activated after email verification
        is_verified=False
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    # Generate and send verification OTP
    otp = email_service.create_otp(db, user_data.email, "verification")
    await email_service.send_verification_email(background_tasks, user_data.email, otp.otp)
    
    return {
        "id": db_user.id,
        "email": db_user.email,
        "full_name": db_user.full_name,
        "is_active": db_user.is_active,
        "is_verified": db_user.is_verified,
        "company": {
            "id": company.id,
            "name": company.name,
            "country": company.country,
            "currency": company.currency
        }
    }

@app.post("/verify-email")
async def verify_email(
    verify_data: schemas.VerifyEmail,
    db: Session = Depends(get_db)
):
    # Verify OTP
    is_valid = email_service.verify_otp(db, verify_data.email, verify_data.otp, "verification")
    if not is_valid:
        raise HTTPException(status_code=400, detail="Invalid or expired OTP")
    
    # Update user as verified
    user = db.query(models.User).filter(models.User.email == verify_data.email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    user.is_verified = True
    user.is_active = True
    db.commit()
    
    return {"message": "Email verified successfully"}

@app.post("/resend-verification")
async def resend_verification(
    email_data: schemas.EmailRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    user = db.query(models.User).filter(models.User.email == email_data.email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if user.is_verified:
        return {"message": "Email already verified"}
    
    # Generate and send new OTP
    otp = email_service.create_otp(db, email_data.email, "verification")
    await email_service.send_verification_email(background_tasks, email_data.email, otp.otp)
    
    return {"message": "Verification email sent"}

@app.post("/token", response_model=schemas.Token)
async def login_for_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    user = auth.authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not user.is_verified:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Please verify your email first",
        )
    
    # Update last login
    user.last_login = datetime.utcnow()
    db.commit()
    
    # Generate access token
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = auth.create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/users/me", response_model=schemas.UserResponse)
async def read_users_me(current_user: models.User = Depends(auth.get_current_active_user)):
    return {
        "id": current_user.id,
        "email": current_user.email,
        "full_name": current_user.full_name,
        "is_active": current_user.is_active,
        "is_verified": current_user.is_verified,
        "company": {
            "id": current_user.company.id,
            "name": current_user.company.name,
            "country": current_user.company.country,
            "currency": current_user.company.currency
        }
    }

@app.post("/forgot-password")
async def forgot_password(
    email_data: schemas.EmailRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    user = db.query(models.User).filter(models.User.email == email_data.email).first()
    if user:
        # Generate and send password reset OTP
        otp = email_service.create_otp(db, email_data.email, "password_reset")
        await email_service.send_password_reset_email(background_tasks, email_data.email, otp.otp)
    
    # Always return success to prevent email enumeration
    return {"message": "If your email is registered, you will receive a password reset link"}

@app.post("/reset-password")
async def reset_password(
    reset_data: schemas.ResetPassword,
    db: Session = Depends(get_db)
):
    # Verify OTP
    is_valid = email_service.verify_otp(db, reset_data.email, reset_data.otp, "password_reset")
    if not is_valid:
        raise HTTPException(status_code=400, detail="Invalid or expired OTP")
    
    # Update password
    user = db.query(models.User).filter(models.User.email == reset_data.email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    user.hashed_password = auth.get_password_hash(reset_data.new_password)
    db.commit()
    
    return {"message": "Password updated successfully"}

@app.post("/change-password")
async def change_password(
    change_data: schemas.ChangePassword,
    current_user: models.User = Depends(auth.get_current_active_user),
    db: Session = Depends(get_db)
):
    # Verify current password
    if not auth.verify_password(change_data.current_password, current_user.hashed_password):
        raise HTTPException(status_code=400, detail="Incorrect current password")
    
    # Update password
    current_user.hashed_password = auth.get_password_hash(change_data.new_password)
    db.commit()
    
    return {"message": "Password updated successfully"}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
