from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.deps import get_db
from app.models import User
from app.security import create_access_token, hash_password, verify_password, decode_token, new_totp_secret, totp_uri, verify_totp


router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/token")


class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UserOut(BaseModel):
    id: int
    email: str
    full_name: str
    is_admin: bool


def _get_user_by_email(db: Session, email: str) -> User | None:
    return db.scalar(select(User).where(User.email == email))


def _get_user_by_id(db: Session, user_id: int) -> User | None:
    return db.get(User, user_id)


def get_current_user(db: Session = Depends(get_db), token: str = Depends(oauth2_scheme)) -> User:
    try:
        payload = decode_token(token)
    except Exception:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
    sub = payload.get("sub")
    if not sub:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
    user = _get_user_by_id(db, int(sub))
    if not user or not user.is_active:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Inactive user")
    return user


@router.post("/token", response_model=TokenOut)
def token(form: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)) -> TokenOut:
    user = _get_user_by_email(db, form.username.lower().strip())
    if not user or not verify_password(form.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    if user.mfa_enabled:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="MFA required")
    return TokenOut(access_token=create_access_token(subject=str(user.id)))


@router.get("/me", response_model=UserOut)
def me(user: User = Depends(get_current_user)) -> UserOut:
    return UserOut(id=user.id, email=user.email, full_name=user.full_name, is_admin=user.is_admin)


@router.post("/seed-admin")
def seed_admin(db: Session = Depends(get_db)) -> dict:
    """
    Dev-only endpoint used by compose startup workflows.
    """
    email = "admin@budget.local"
    pwd = "Admin123!"
    existing = _get_user_by_email(db, email)
    if existing:
        return {"ok": True, "email": email}
    u = User(email=email, full_name="Admin", password_hash=hash_password(pwd), is_admin=True)
    db.add(u)
    db.commit()
    return {"ok": True, "email": email}


class MFASetupOut(BaseModel):
    secret: str
    otpauth_uri: str


class MFAVerifyIn(BaseModel):
    code: str


@router.post("/mfa/setup", response_model=MFASetupOut)
def mfa_setup(user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> MFASetupOut:
    if not user.mfa_secret:
        user.mfa_secret = new_totp_secret()
        db.add(user)
        db.commit()
        db.refresh(user)
    return MFASetupOut(secret=user.mfa_secret, otpauth_uri=totp_uri(email=user.email, secret=user.mfa_secret, issuer="Budget1"))


@router.post("/mfa/enable")
def mfa_enable(payload: MFAVerifyIn, user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> dict:
    if not user.mfa_secret:
        raise HTTPException(status_code=400, detail="MFA not setup")
    if not verify_totp(secret=user.mfa_secret, code=payload.code):
        raise HTTPException(status_code=400, detail="Invalid code")
    user.mfa_enabled = True
    db.add(user)
    db.commit()
    return {"ok": True, "mfa_enabled": True}


@router.post("/mfa/token", response_model=TokenOut)
def mfa_token(form: OAuth2PasswordRequestForm = Depends(), code: str = "", db: Session = Depends(get_db)) -> TokenOut:
    """
    Token endpoint compatible with MFA:
    - username/password + code (TOTP) if MFA enabled.
    """
    user = _get_user_by_email(db, form.username.lower().strip())
    if not user or not verify_password(form.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    if user.mfa_enabled:
        if not code or not verify_totp(secret=user.mfa_secret, code=code):
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid MFA code")
    return TokenOut(access_token=create_access_token(subject=str(user.id)))

