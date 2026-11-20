"""Local account registration and cookie-based authentication."""

from __future__ import annotations

from datetime import UTC, datetime, timedelta

import jwt
from argon2 import PasswordHasher
from argon2.exceptions import InvalidHashError, VerificationError, VerifyMismatchError
from bson import ObjectId
from fastapi import APIRouter, Depends, Request, Response, status
from pymongo.asynchronous.database import AsyncDatabase
from pymongo.errors import DuplicateKeyError

from app.core.config import settings
from app.core.errors import AuthenticationRequired, Conflict
from app.database.mongo import get_database_from_request
from app.schemas.auth import LoginRequest, RegisterRequest, UserResponse

router = APIRouter(tags=["authentication"])
password_hasher = PasswordHasher()
SESSION_COOKIE = "chauleclips_session"
SESSION_COOKIE_PATH = "/api/v1/auth"


def _user_response(user: dict) -> UserResponse:
    return UserResponse(id=str(user["_id"]), full_name=user["full_name"], email=user["email"])


def _set_session(response: Response, user_id: str) -> None:
    now = datetime.now(UTC)
    token = jwt.encode(
        {"sub": user_id, "iat": now, "exp": now + timedelta(minutes=settings.jwt_access_token_expire_minutes)},
        settings.jwt_secret_key,
        algorithm=settings.jwt_algorithm,
    )
    response.set_cookie(
        SESSION_COOKIE,
        token,
        max_age=settings.jwt_access_token_expire_minutes * 60,
        httponly=True,
        secure=settings.app_env == "production",
        samesite="lax",
        path=SESSION_COOKIE_PATH,
    )


async def _current_user(request: Request, db: AsyncDatabase) -> dict:
    token = request.cookies.get(SESSION_COOKIE)
    if not token:
        raise AuthenticationRequired("Please sign in to continue.")
    try:
        payload = jwt.decode(token, settings.jwt_secret_key, algorithms=[settings.jwt_algorithm])
        user_id = payload.get("sub")
        if not isinstance(user_id, str) or not ObjectId.is_valid(user_id):
            raise ValueError("Invalid subject")
    except (jwt.InvalidTokenError, ValueError) as exc:
        raise AuthenticationRequired("Your session has expired. Please sign in again.") from exc

    user = await db["users"].find_one({"_id": ObjectId(user_id)})
    if user is None:
        raise AuthenticationRequired("Your account is no longer available. Please sign in again.")
    return user


@router.post("/auth/signup", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
@router.post("/auth/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED, include_in_schema=False)
async def register(
    body: RegisterRequest,
    response: Response,
    db: AsyncDatabase = Depends(get_database_from_request),
) -> UserResponse:
    users = db["users"]
    if await users.find_one({"email": body.email}, {"_id": 1}):
        raise Conflict("An account with this email already exists.", code="EMAIL_IN_USE")

    user = {
        "full_name": body.full_name,
        "email": body.email,
        "password_hash": password_hasher.hash(body.password),
        "created_at": datetime.now(UTC).replace(tzinfo=None),
    }
    try:
        result = await users.insert_one(user)
    except DuplicateKeyError as exc:
        raise Conflict("An account with this email already exists.", code="EMAIL_IN_USE") from exc
    user["_id"] = result.inserted_id
    _set_session(response, str(result.inserted_id))
    return _user_response(user)


@router.post("/auth/login", response_model=UserResponse)
async def login(
    body: LoginRequest,
    response: Response,
    db: AsyncDatabase = Depends(get_database_from_request),
) -> UserResponse:
    user = await db["users"].find_one({"email": body.email})
    valid = False
    if user:
        try:
            valid = password_hasher.verify(user["password_hash"], body.password)
        except (VerifyMismatchError, VerificationError, InvalidHashError, KeyError):
            valid = False
    if not valid or user is None:
        raise AuthenticationRequired("Email or password is incorrect.")
    _set_session(response, str(user["_id"]))
    return _user_response(user)


@router.get("/auth/me", response_model=UserResponse)
async def me(request: Request, db: AsyncDatabase = Depends(get_database_from_request)) -> UserResponse:
    return _user_response(await _current_user(request, db))


@router.post("/auth/logout", status_code=status.HTTP_204_NO_CONTENT)
async def logout(response: Response) -> Response:
    response.delete_cookie(SESSION_COOKIE, path=SESSION_COOKIE_PATH, httponly=True, samesite="lax")
    response.status_code = status.HTTP_204_NO_CONTENT
    return response

