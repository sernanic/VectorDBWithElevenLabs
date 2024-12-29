from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import Optional

security = HTTPBearer()

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> dict:
    """
    Validate the authorization token and return the current user.
    This is a simplified version - you should implement proper token validation.
    """
    try:
        # Here you would typically validate the token and extract user information
        # For now, we'll just return a basic user object
        return {
            "id": "1",
            "email": "admin@example.com",
            "is_admin": True
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
