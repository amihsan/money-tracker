



from flask import Flask, request, jsonify
from flask_cors import CORS
import boto3
import uuid
from auth import require_auth
import os
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)

# DynamoDB setup
dynamodb = boto3.resource("dynamodb", region_name=os.getenv("AWS_REGION"))
table = dynamodb.Table(os.getenv("DYNAMODB_TABLE"))  # Ensure table exists

# -----------------------
# Helper to get user from Authorization header
# -----------------------
def get_user_from_header():
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        return None
    token = auth_header.split(" ")[1]
    user = require_auth(token)
    return user

# -----------------------
# Get all transactions
# -----------------------
@app.route("/transactions", methods=["GET"])
def get_transactions():
    user = get_user_from_header()
    if not user:
        return jsonify({"error": "Unauthorized"}), 401

    try:
        response = table.query(
            KeyConditionExpression="user_id = :uid",
            ExpressionAttributeValues={":uid": user["sub"]}
        )
        # Return all transaction attributes
        return jsonify(response.get("Items", []))
    except Exception as e:
        print("DEBUG: Error querying DynamoDB:", e)
        return jsonify({"error": "Internal server error"}), 500

# -----------------------
# Add a transaction
# -----------------------
@app.route("/transactions", methods=["POST"])
def add_transaction():
    user = get_user_from_header()
    if not user:
        return jsonify({"error": "Unauthorized"}), 401

    data = request.json
    print("DEBUG: Received data:", data)

    try:
        transaction_id = str(uuid.uuid4())
        item = {
            "user_id": user["sub"],
            "transaction_id": transaction_id,
            "type": data.get("type"),
            "person": data.get("person"),
            "amount": data.get("amount"),
            "currency": "EUR",
            "transactionDate": data.get("transactionDate"),
            "deadline": data.get("deadline"),
            "status": "unpaid"
        }
        print("DEBUG: Item to insert:", item)

        table.put_item(Item=item)
        return jsonify(item), 201
    except Exception as e:
        print("DEBUG: Error adding transaction:", e)
        return jsonify({"error": str(e)}), 500

# -----------------------
# Update a transaction
# -----------------------
@app.route("/transactions/<transaction_id>", methods=["PUT"])
def update_transaction(transaction_id):
    user = get_user_from_header()
    if not user:
        return jsonify({"error": "Unauthorized"}), 401

    data = request.json
    if not data:
        return jsonify({"error": "No update data provided"}), 400

    try:
        update_expr = "SET " + ", ".join([f"{k}=:{k}" for k in data.keys()])
        expr_vals = {f":{k}": v for k, v in data.items()}

        table.update_item(
            Key={"user_id": user["sub"], "transaction_id": transaction_id},
            UpdateExpression=update_expr,
            ExpressionAttributeValues=expr_vals
        )
        return jsonify({"message": "Transaction updated"})
    except Exception as e:
        print("DEBUG: Error updating transaction:", e)
        return jsonify({"error": "Internal server error"}), 500

# -----------------------
# Delete a transaction
# -----------------------
@app.route("/transactions/<transaction_id>", methods=["DELETE"])
def delete_transaction(transaction_id):
    user = get_user_from_header()
    if not user:
        return jsonify({"error": "Unauthorized"}), 401

    try:
        table.delete_item(
            Key={"user_id": user["sub"], "transaction_id": transaction_id}
        )
        return jsonify({"message": "Transaction deleted"})
    except Exception as e:
        print("DEBUG: Error deleting transaction:", e)
        return jsonify({"error": "Internal server error"}), 500

# -----------------------
# Mark transaction as paid
# -----------------------
@app.route("/transactions/<transaction_id>/mark-paid", methods=["PUT"])
def mark_paid(transaction_id):
    user = get_user_from_header()
    if not user:
        return jsonify({"error": "Unauthorized"}), 401

    try:
        table.update_item(
            Key={"user_id": user["sub"], "transaction_id": transaction_id},
            UpdateExpression="SET #s = :p",
            ExpressionAttributeNames={"#s": "status"},
            ExpressionAttributeValues={":p": "paid"}
        )
        # Return the updated transaction
        updated = table.get_item(
            Key={"user_id": user["sub"], "transaction_id": transaction_id}
        ).get("Item", {})
        return jsonify(updated)
    except Exception as e:
        print("DEBUG: Error marking transaction as paid:", e)
        return jsonify({"error": "Internal server error"}), 500
    


# -----------------------
# Delete all transactions for a person (hard delete)
# -----------------------
@app.route("/transactions/person/<string:person>", methods=["DELETE"])
def delete_transactions_by_person(person):
    user = get_user_from_header()
    if not user:
        return jsonify({"error": "Unauthorized"}), 401

    try:
        # Query all transactions for this user & person
        response = table.query(
            KeyConditionExpression="user_id = :uid",
            ExpressionAttributeValues={":uid": user["sub"]}
        )
        items = response.get("Items", [])

        # Filter only the given person
        person_items = [t for t in items if t.get("person") == person]

        deleted = 0
        with table.batch_writer() as batch:
            for t in person_items:
                batch.delete_item(
                    Key={
                        "user_id": user["sub"],
                        "transaction_id": t["transaction_id"],
                    }
                )
                deleted += 1

        return jsonify({"deleted_count": deleted}), 200
    except Exception as e:
        print("DEBUG: Error deleting transactions by person:", e)
        return jsonify({"error": "Internal server error"}), 500


if __name__ == "__main__":
    app.run(debug=True)

