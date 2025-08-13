from flask import Flask, request, jsonify
import boto3
import jwt
import requests
from flask_cors import CORS
from dotenv import load_dotenv
import os
import uuid
from decimal import Decimal

# Load environment variables from .env file
load_dotenv()

app = Flask(__name__)
CORS(app)


USER_POOL_ID = os.getenv("USER_POOL_ID")
APP_CLIENT_ID = os.getenv("APP_CLIENT_ID")
REGION = os.getenv("AWS_REGION")
COGNITO_KEYS_URL = f"https://cognito-idp.{REGION}.amazonaws.com/{USER_POOL_ID}/.well-known/jwks.json"

AWS_ACCESS_KEY_ID = os.getenv("AWS_ACCESS_KEY_ID")
AWS_SECRET_ACCESS_KEY = os.getenv("AWS_SECRET_ACCESS_KEY")

# Get Cognito public keys for JWT verification
jwks = requests.get(COGNITO_KEYS_URL).json()

# Initialize DynamoDB resource
dynamodb = boto3.resource(
    "dynamodb",
    region_name=REGION,
    aws_access_key_id=AWS_ACCESS_KEY_ID,
    aws_secret_access_key=AWS_SECRET_ACCESS_KEY,
)

table = dynamodb.Table("MoneyTracker")

def verify_token(token):
    """Verify Cognito JWT token and return payload or None"""
    try:
        header = jwt.get_unverified_header(token)
        key = next((k for k in jwks["keys"] if k["kid"] == header["kid"]), None)
        if not key:
            return None
        public_key = jwt.algorithms.RSAAlgorithm.from_jwk(key)
        payload = jwt.decode(token, public_key, algorithms=["RS256"], audience=APP_CLIENT_ID)
        return payload
    except Exception:
        return None

@app.route("/api/transactions", methods=["GET"])
def get_transactions():
    auth_header = request.headers.get("Authorization", "")
    if not auth_header.startswith("Bearer "):
        return jsonify({"error": "Unauthorized"}), 401

    token = auth_header.split(" ")[1]
    claims = verify_token(token)
    if not claims:
        return jsonify({"error": "Unauthorized"}), 401

    # Query transactions by user_id (partition key)
    resp = table.query(
        KeyConditionExpression=boto3.dynamodb.conditions.Key("user_id").eq(claims["sub"])
    )
    return jsonify(resp.get("Items", []))

@app.route("/api/transactions", methods=["POST"])
def add_transaction():
    auth_header = request.headers.get("Authorization", "")
    if not auth_header.startswith("Bearer "):
        return jsonify({"error": "Unauthorized"}), 401

    token = auth_header.split(" ")[1]
    claims = verify_token(token)
    if not claims:
        return jsonify({"error": "Unauthorized"}), 401

    data = request.json
    # Required fields: type, amount, date; description optional
    if not data.get("type") or not data.get("amount") or not data.get("date"):
        return jsonify({"error": "Missing required fields"}), 400

    item = {
        "user_id": claims["sub"],                  # partition key
        "id": str(uuid.uuid4()),                    # unique transaction id (sort key)
        "type": data.get("type"),                   # borrow, loan, return
        "amount": Decimal(str(data.get("amount"))),
        "description": data.get("description", ""),
        "date": data.get("date"),                   # ISO date string "YYYY-MM-DD"
    }

    table.put_item(Item=item)
    return jsonify(item), 201

@app.route("/api/transactions/<id>", methods=["DELETE"])
def delete_transaction(id):
    auth_header = request.headers.get("Authorization", "")
    if not auth_header.startswith("Bearer "):
        return jsonify({"error": "Unauthorized"}), 401

    token = auth_header.split(" ")[1]
    claims = verify_token(token)
    if not claims:
        return jsonify({"error": "Unauthorized"}), 401

    try:
        table.delete_item(
            Key={
                "user_id": claims["sub"],
                "id": id
            }
        )
        return jsonify({"message": "Deleted"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    app.run(debug=True)



