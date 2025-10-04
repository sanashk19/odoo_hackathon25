from pydantic import BaseModel, EmailStr, Field, validator
from typing import Optional
from datetime import datetime
import re

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

class UserBase(BaseModel):
    email: EmailStr
    full_name: Optional[str] = None

class UserCreate(UserBase):
    password: str = Field(..., min_length=8)
    company_name: str
    country: str = "United States"  # Default country
    
    @validator('password')
    def password_strength(cls, v):
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters long')
        if not re.search("[A-Z]", v):
            raise ValueError('Password must contain at least one uppercase letter')
        if not re.search("[a-z]", v):
            raise ValueError('Password must contain at least one lowercase letter')
        if not re.search("\d", v):
            raise ValueError('Password must contain at least one number')
        if not re.search("[!@#$%^&*(),.?\":{}|<>]", v):
            raise ValueError('Password must contain at least one special character')
        return v

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserInDB(UserBase):
    id: int
    is_active: bool
    created_at: datetime
    company_id: int

    class Config:
        orm_mode = True

class CompanyBase(BaseModel):
    name: str
    country: str
    currency: str = "USD"

class CompanyCreate(CompanyBase):
    pass

class CompanyInDB(CompanyBase):
    id: int
    created_at: datetime

    class Config:
        orm_mode = True

class UserWithCompany(UserInDB):
    company: CompanyInDB
