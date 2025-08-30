from fastapi import APIRouter, HTTPException,  Request, Response, status
from fastapi.responses import HTMLResponse
from ..config.database import add_jti_to_blocklist, user_collection, get_user_by_email
from ..model.user import LoginResponse, Token,  UserCreate,  UserResponse, UserRequest, LoginRequest, EmailModel, ForgotPasswordRequest, ResetPasswordRequest, PasswordResetResponse
from ..utils.auth import get_refresh_token_details, hashed_password, verify_password, create_token, create_url_safe_token, decode_url_safe_token
from ..schema.schema import user_serializer
from datetime import timedelta, datetime, timezone
from ..utils.mail import mail, create_message
from dotenv import load_dotenv
import os
# we can also use config instead of os

router = APIRouter(
    prefix='/auth',
    tags=['Auth'])

# Test router for mail


@router.post('/send_mail')
async def send_mail(emails: EmailModel):
    email = emails.addresses

    html = "<h1>Welcome to our Application</h1>"

    message = create_message(
        recipients=email,
        subject="Welcome",
        body=html
    )

    await mail.send_message(message)
    return {"message": "Email sent Successfully "}

# Register Route


@router.post("/register", response_model=UserResponse)
async def register(user: UserCreate):
    if await user_collection.find_one({"email": user.email}):
        raise HTTPException(status_code=400, detail="Email already registered")

    hashed_pw = hashed_password(user.password)
    user_data = {"username": user.username,
                 "email": user.email, "hashed_password": hashed_pw, "pub_key": user.pub_key, "priv_key": user.priv_key, "isVerified": False}
    result = await user_collection.insert_one(user_data)
    new_user = await user_collection.find_one({"_id": result.inserted_id})

    # for email verification
    token = create_url_safe_token({"email": user.email})
    load_dotenv()
    domain = os.getenv("DOMAIN", "localhost:8000")
    link = f"http://{domain}/auth/verify/{token}"
    html_message = f"""
    <h1>Verify Your Email</h1>
    <p> Please click this <a href="{link}" >Link</a> to verify your email</p>

    """
    message = create_message(
        recipients=[user.email],
        subject="Verify Your Email",
        body=html_message
    )

    await mail.send_message(message)
    user_data = user_serializer(new_user)
    return {"id": user_data["id"], "username": user_data["username"], "email": user_data["email"], "isVerified": user_data["isVerified"], "message": "Account Created", "priv_key": user_data["priv_key"]}


@router.get("/verify/{token}")
async def verify_email(token: str):
    try:
        token_data = decode_url_safe_token(token)
        user_email = token_data.get("email")

        if not user_email:
            raise HTTPException(status_code=400, detail="Invalid token")

        user = await get_user_by_email(user_email)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        # Update user verification status
        await user_collection.update_one(
            {"_id": user["_id"]},
            {"$set": {"isVerified": True}}
        )
        html_content = """
        <html>
            <head>
            <title>Email Verified</title>
        </head>
        <body>
            <h1>✅ Your email has been verified successfully!</h1>
        </body>
    </html>
    """

        return HTMLResponse(content=html_content, status_code=200)

    except Exception as e:
        raise HTTPException(
            status_code=400, detail="Invalid verification token")


@router.get("/check-verification/{email}")
async def check_verification_status(email: str):
    """Check if a user's email is verified"""
    try:
        user = await get_user_by_email(email)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        return {
            "email": user["email"],
            "isVerified": user.get("isVerified", False)
        }
    except Exception as e:
        raise HTTPException(
            status_code=400, detail="Error checking verification status")


@router.post("/forgot-password", response_model=PasswordResetResponse)
async def forgot_password(request: ForgotPasswordRequest):
    """Send password reset email"""

    try:
        user = await get_user_by_email(request.email)
        if not user:
            # Don't reveal if email exists or not for security
            return {"message": "If an account with that email exists, a password reset link has been sent"}

        # Generate password reset token
        reset_token = create_url_safe_token(
            {"email": request.email, "type": "password_reset"})

        # Create reset link
        load_dotenv()
        frontend_domain = os.getenv("FRONTEND_DOMAIN", "localhost:3000")
        reset_link = f"http://{frontend_domain}/reset-password?token={reset_token}"

        # Send password reset email
        html_message = f"""
        <h1>Password Reset Request</h1>
        <p>You requested a password reset for your account.</p>
        <p>Click the link below to reset your password:</p>
        <p><a href="{reset_link}">Reset Password</a></p>
        <p>If you didn't request this, please ignore this email.</p>
        <p>This link will expire in 1 hour.</p>
        """

        message = create_message(
            recipients=[request.email],
            subject="Password Reset Request",
            body=html_message
        )

        await mail.send_message(message)
        return {"message": "If an account with that email exists, a password reset link has been sent"}

    except Exception as e:
        print(f"Error in forgot password: {e}")
        return {"message": "If an account with that email exists, a password reset link has been sent"}


@router.post("/reset-password", response_model=PasswordResetResponse)
async def reset_password(request: ResetPasswordRequest):
    """Reset password using token"""
    try:
        # Decode the token
        token_data = decode_url_safe_token(request.token)

        if not token_data or token_data.get("type") != "password_reset":
            raise HTTPException(status_code=400, detail="Invalid reset token")

        email = token_data.get("email")
        if not email:
            raise HTTPException(status_code=400, detail="Invalid reset token")

        # Find user
        user = await get_user_by_email(email)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        # Hash new password
        new_hashed_password = hashed_password(request.new_password)

        # Update password
        await user_collection.update_one(
            {"email": email},
            {"$set": {"hashed_password": new_hashed_password}}
        )

        return {"message": "Password reset successfully"}

    except Exception as e:
        print(f"Error in reset password: {e}")
        raise HTTPException(
            status_code=400, detail="Invalid or expired reset token")


# Login Route


@router.post("/login", response_model=LoginResponse)
async def login(response: Response, form_data: UserRequest):

    user = await user_collection.find_one({"email": form_data.email})
    if not user:
        raise HTTPException(status_code=400, detail="Invalid credentials")

    if not verify_password(form_data.password, user["hashed_password"]):
        raise HTTPException(status_code=400, detail="Incorrect password")

    access_token = create_token(
        {"user_id": str(user["_id"])})
    refresh_token = create_token(
        {"user_id": str(user["_id"])}, refresh=True, expiry=timedelta(days=2))

    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        secure=True,
        samesite="none",
        expires=2 * 24 * 60 * 60,  # 2 days
        path="/",
    )
    return {"access_token": access_token, "token_type": "bearer", "pub_key": user['pub_key'], "priv_key": user['priv_key']}


@router.post("/refresh_token", response_model=Token)
async def refreshToken(request: Request):
    refresh_token = request.cookies.get("refresh_token")
    print("Refresh Token:", refresh_token)
    if not refresh_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="No refresh token")
    valid_refresh_token = await get_refresh_token_details(refresh_token)
    if valid_refresh_token.exp > datetime.now(timezone.utc):
        new_access_token = create_token(
            {
                "user_id": valid_refresh_token.user_id
            }
        )
        print(f"access_token:{new_access_token}")
        return {"access_token": new_access_token, "token_type": "bearer"}
    raise HTTPException(status_code=status.HTTP_403_FORBIDDEN,
                        detail="Invalid or expired token")


@router.post('/logout')
async def revoke_token(request: Request):
    refresh_token = request.cookies.get("refresh_token")
    if not refresh_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="No refresh token")
    valid_refresh_token = await get_refresh_token_details(refresh_token)
    jti = valid_refresh_token.jti
    await add_jti_to_blocklist(jti)

#     return {
#         "message": "Logged out successfully"
#     }
