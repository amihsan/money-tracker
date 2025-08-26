import os
import requests
from jose import jwt
from dotenv import load_dotenv

# Load environment variables from .env
load_dotenv()

COGNITO_REGION = os.getenv("AWS_REGION")
USER_POOL_ID = os.getenv("COGNITO_USER_POOL_ID")
APP_CLIENT_ID = os.getenv("COGNITO_CLIENT_ID")

# Download JWKS (public keys for Cognito)
keys_url = f"https://cognito-idp.{COGNITO_REGION}.amazonaws.com/{USER_POOL_ID}/.well-known/jwks.json"
response = requests.get(keys_url)
jwks = response.json()["keys"]

def require_auth(token: str):
    """
    Verifies the Cognito ID token.
    Returns decoded payload if valid, else None.
    """
    try:
        # Decode JWT header
        header = jwt.get_unverified_header(token)
        key = next(k for k in jwks if k["kid"] == header["kid"])

        # Decode and verify token
        payload = jwt.decode(
            token,
            key,
            algorithms=["RS256"],
            audience=APP_CLIENT_ID
        )
        return payload
    except Exception as e:
        print("Auth error:", e)
        return None


