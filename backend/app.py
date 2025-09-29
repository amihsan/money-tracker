from datetime import datetime
from flask import Flask, request, jsonify
from flask_cors import CORS
import boto3
import uuid
import os
from dotenv import load_dotenv
from auth import require_auth

load_dotenv()

app = Flask(__name__)
CORS(app)

# AWS clients
REGION = os.getenv("AWS_REGION")
dynamodb = boto3.resource("dynamodb", region_name=REGION)
transactions_table = dynamodb.Table(os.getenv("DYNAMODB_TABLE"))
users_table = dynamodb.Table(os.getenv("USERS_TABLE"))
messages_table = dynamodb.Table(os.getenv("CONTACT_TABLE"))
s3 = boto3.client("s3", region_name=REGION)
ses_client = boto3.client("ses", region_name=REGION)
S3_BUCKET = os.getenv("S3_BUCKET_NAME")


def get_user_from_header():
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        return None
    token = auth_header.split(" ")[1]
    try:
        return require_auth(token)
    except Exception as e:
        print("DEBUG: Auth error:", e)
        return None
    
# -----------------------
# Contact message route
# -----------------------
@app.route("/api/contact", methods=["POST"])
def submit_contact():
    # ---------- Auth check ----------
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        return jsonify({"error": "Unauthorized"}), 401
    token = auth_header.split(" ")[1]
    try:
        user = require_auth(token)  # returns user info if valid
    except Exception as e:
        print("DEBUG: Auth error:", e)
        return jsonify({"error": "Unauthorized"}), 401

    # ---------- Form data ----------
    data = request.json or {}
    name = data.get("name")
    email = data.get("email")
    message = data.get("message")

    if not name or not email or not message:
        return jsonify({"error": "All fields are required"}), 400

    message_id = str(uuid.uuid4())
    created_at = datetime.utcnow().isoformat()

    item = {
        "message_id": message_id,
        "user_id": user["sub"],
        "name": name,
        "email": email,
        "message": message,
        "created_at": created_at
    }

    try:
        # Save to DynamoDB
        messages_table.put_item(Item=item)

        # ---------- 1. Notify your support inbox ----------
        ses_client.send_email(
            Source="contact@moneytracker.me",  # verified in SES
            Destination={
                "ToAddresses": ["support@moneytracker.me"],
            },
            Message={
                "Subject": {"Data": f"New Contact Submission from {name}"},
                "Body": {
                    "Text": {
                        "Data": f"""
New contact form submission:

From: {name} <{email}>
Message:
{message}

Message ID: {message_id}
Time: {created_at}
                        """
                    },
                    "Html": {
                        "Data": f"""
<h3>New Contact Form Submission</h3>
<p><b>From:</b> {name} ({email})</p>
<p><b>Message:</b></p>
<p>{message}</p>
<hr/>
<p><i>Message ID:</i> {message_id}</p>
<p><i>Time:</i> {created_at}</p>
                        """
                    }
                }
            }
        )

        # ---------- 2. Send confirmation email to user ----------
        ses_client.send_email(
            Source="contact@moneytracker.me",
            Destination={"ToAddresses": [email]},  # user's email
            Message={
                "Subject": {"Data": "We received your message - MoneyTracker"},
                "Body": {
                    "Text": {
                        "Data": f"""
Hi {name},

Thank you for contacting us. We have received your message and our team will get back to you soon.

Your message:
{message}

Best regards,  
MoneyTracker Team
                        """
                    },
                    "Html": {
                        "Data": f"""
<p>Hi {name},</p>
<p>Thank you for contacting us. We have received your message and our team will get back to you soon.</p>
<p><b>Your message:</b></p>
<p>{message}</p>
<br/>
<p>Best regards,<br/>MoneyTracker Team</p>
                        """
                    }
                }
            }
        )

        return jsonify({"message": "Message submitted successfully"}), 201

    except Exception as e:
        print("DEBUG: Error:", e)
        return jsonify({"error": "Internal server error"}), 500
# @app.route("/api/contact", methods=["POST"])
# def submit_contact():
#     # ---------- Auth check ----------
#     auth_header = request.headers.get("Authorization")
#     if not auth_header or not auth_header.startswith("Bearer "):
#         return jsonify({"error": "Unauthorized"}), 401
#     token = auth_header.split(" ")[1]
#     try:
#         user = require_auth(token)  # returns user info if valid
#     except Exception as e:
#         print("DEBUG: Auth error:", e)
#         return jsonify({"error": "Unauthorized"}), 401

#     # ---------- Form data ----------
#     data = request.json or {}
#     name = data.get("name")
#     email = data.get("email")
#     message = data.get("message")

#     if not name or not email or not message:
#         return jsonify({"error": "All fields are required"}), 400

#     message_id = str(uuid.uuid4())
#     item = {
#         "message_id": message_id,
#         "user_id": user["sub"],   # store the user ID
#         "name": name,
#         "email": email,
#         "message": message,
#         "created_at": datetime.utcnow().isoformat()
#     }

#     try:
#         messages_table.put_item(Item=item)
#         return jsonify({"message": "Message submitted successfully"}), 201
#     except Exception as e:
#         print("DEBUG: Error saving message:", e)
#         return jsonify({"error": "Internal server error"}), 500


# =========================
# Profile routes
# =========================
@app.route("/api/profile", methods=["GET"])
def get_profile():
    user = get_user_from_header()
    if not user:
        return jsonify({"error": "Unauthorized"}), 401

    res = users_table.get_item(Key={"user_id": user["sub"]})
    profile = res.get("Item")
    if not profile:
        profile = {
            "user_id": user["sub"],
            "username": user.get("cognito:username") or "",
            "email": user.get("email") or "",
            "address": "",
            "avatar": ""
        }
        users_table.put_item(Item=profile)
    return jsonify(profile)


@app.route("/api/profile", methods=["PUT"])
def update_profile():
    user = get_user_from_header()
    if not user:
        return jsonify({"error": "Unauthorized"}), 401

    data = request.json or {}
    allowed = ["username", "email", "address"]
    to_set = {k: v for k, v in data.items() if k in allowed}
    if not to_set:
        return jsonify({"error": "No valid fields"}), 400

    update_expr = "SET " + ", ".join([f"{k} = :{k}" for k in to_set.keys()])
    expr_vals = {f":{k}": v for k, v in to_set.items()}

    users_table.update_item(
        Key={"user_id": user["sub"]},
        UpdateExpression=update_expr,
        ExpressionAttributeValues=expr_vals
    )
    updated = users_table.get_item(Key={"user_id": user["sub"]}).get("Item", {})
    return jsonify(updated)


@app.route("/api/profile/avatar", methods=["PUT"])
def upload_avatar():
    user = get_user_from_header()
    if not user:
        return jsonify({"error": "Unauthorized"}), 401

    if "avatar" not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    # Delete previous avatar if exists
    res = users_table.get_item(Key={"user_id": user["sub"]})
    old_avatar = res.get("Item", {}).get("avatar")
    if old_avatar:
        old_key = "/".join(old_avatar.split("/")[-2:])
        try:
            s3.delete_object(Bucket=S3_BUCKET, Key=old_key)
        except Exception as e:
            print("DEBUG: Could not delete old avatar:", e)

    # Upload new avatar
    file = request.files["avatar"]
    ext = (file.filename.rsplit(".", 1)[-1] or "jpg").lower()
    key = f"avatars/{user['sub']}_{uuid.uuid4()}.{ext}"

    s3.upload_fileobj(
        file,
        S3_BUCKET,
        key,
        ExtraArgs={"ContentType": file.content_type or "image/jpeg"}  # no ACL needed if bucket is public-read by default
    )
    avatar_url = f"https://{S3_BUCKET}.s3.{REGION}.amazonaws.com/{key}"

    # Update DynamoDB
    users_table.update_item(
        Key={"user_id": user["sub"]},
        UpdateExpression="SET avatar = :a",
        ExpressionAttributeValues={":a": avatar_url}
    )

    return jsonify({"avatar": avatar_url})


@app.route("/api/profile/avatar", methods=["DELETE"])
def delete_avatar():
    user = get_user_from_header()
    if not user:
        return jsonify({"error": "Unauthorized"}), 401

    res = users_table.get_item(Key={"user_id": user["sub"]})
    profile = res.get("Item") or {}
    url = profile.get("avatar")
    if not url:
        return jsonify({"error": "No avatar found"}), 400

    key = "/".join(url.split("/")[-2:])
    s3.delete_object(Bucket=S3_BUCKET, Key=key)
    users_table.update_item(
        Key={"user_id": user["sub"]},
        UpdateExpression="REMOVE avatar"
    )
    return jsonify({"message": "Avatar deleted"})


# =========================
# Transactions routes
# =========================
@app.route("/api/transactions", methods=["GET"])
def get_transactions():
    user = get_user_from_header()
    if not user:
        return jsonify({"error": "Unauthorized"}), 401

    response = transactions_table.query(
        KeyConditionExpression="user_id = :uid",
        ExpressionAttributeValues={":uid": user["sub"]}
    )
    return jsonify(response.get("Items", []))


@app.route("/api/transactions", methods=["POST"])
def add_transaction():
    user = get_user_from_header()
    if not user:
        return jsonify({"error": "Unauthorized"}), 401

    data = request.json or {}
    transaction_id = str(uuid.uuid4())
    item = {
        "user_id": user["sub"],
        "transaction_id": transaction_id,
        "type": data.get("type"),
        "person": data.get("person"),
        "amount": data.get("amount"),
        "currency": data.get("currency", "EUR"),
        "transactionDate": data.get("transactionDate"),
        "deadline": data.get("deadline"),
        "status": data.get("status", "unpaid"),
    }
    transactions_table.put_item(Item=item)
    return jsonify(item), 201


@app.route("/api/transactions/<transaction_id>", methods=["PUT"])
def update_transaction(transaction_id):
    user = get_user_from_header()
    if not user:
        return jsonify({"error": "Unauthorized"}), 401

    data = request.json or {}
    if not data:
        return jsonify({"error": "No update data provided"}), 400

    update_expr = "SET " + ", ".join([f"{k}=:{k}" for k in data.keys()])
    expr_vals = {f":{k}": v for k, v in data.items()}
    transactions_table.update_item(
        Key={"user_id": user["sub"], "transaction_id": transaction_id},
        UpdateExpression=update_expr,
        ExpressionAttributeValues=expr_vals
    )
    return jsonify({"message": "Transaction updated"})


@app.route("/api/transactions/<transaction_id>", methods=["DELETE"])
def delete_transaction(transaction_id):
    user = get_user_from_header()
    if not user:
        return jsonify({"error": "Unauthorized"}), 401

    transactions_table.delete_item(Key={"user_id": user["sub"], "transaction_id": transaction_id})
    return jsonify({"message": "Transaction deleted"})


@app.route("/api/transactions/<transaction_id>/mark-paid", methods=["PUT"])
def mark_paid(transaction_id):
    user = get_user_from_header()
    if not user:
        return jsonify({"error": "Unauthorized"}), 401

    transactions_table.update_item(
        Key={"user_id": user["sub"], "transaction_id": transaction_id},
        UpdateExpression="SET #s = :p",
        ExpressionAttributeNames={"#s": "status"},
        ExpressionAttributeValues={":p": "paid"}
    )
    updated = transactions_table.get_item(
        Key={"user_id": user["sub"], "transaction_id": transaction_id}
    ).get("Item", {})
    return jsonify(updated)


@app.route("/api/transactions/person/<string:person>", methods=["DELETE"])
def delete_transactions_by_person(person):
    user = get_user_from_header()
    if not user:
        return jsonify({"error": "Unauthorized"}), 401

    response = transactions_table.query(
        KeyConditionExpression="user_id = :uid",
        ExpressionAttributeValues={":uid": user["sub"]}
    )
    items = response.get("Items", [])
    person_items = [t for t in items if t.get("person") == person]

    deleted = 0
    with transactions_table.batch_writer() as batch:
        for t in person_items:
            batch.delete_item(Key={"user_id": user["sub"], "transaction_id": t["transaction_id"]})
            deleted += 1
    return jsonify({"deleted_count": deleted}), 200


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)


###########################################
# from flask import Flask, request, jsonify
# from flask_cors import CORS
# import boto3
# import uuid
# from auth import require_auth
# import os
# from dotenv import load_dotenv

# load_dotenv()

# app = Flask(__name__)
# CORS(app)

# # DynamoDB setup
# dynamodb = boto3.resource("dynamodb", region_name=os.getenv("AWS_REGION"))
# table = dynamodb.Table(os.getenv("DYNAMODB_TABLE"))  # Ensure table exists

# # -----------------------
# # Helper to get user from Authorization header
# # -----------------------
# def get_user_from_header():
#     auth_header = request.headers.get("Authorization")
#     if not auth_header or not auth_header.startswith("Bearer "):
#         return None
#     token = auth_header.split(" ")[1]
#     user = require_auth(token)
#     return user

# # -----------------------
# # Get all transactions
# # -----------------------
# @app.route("/api/transactions", methods=["GET"])
# def get_transactions():
#     user = get_user_from_header()
#     if not user:
#         return jsonify({"error": "Unauthorized"}), 401

#     try:
#         response = table.query(
#             KeyConditionExpression="user_id = :uid",
#             ExpressionAttributeValues={":uid": user["sub"]}
#         )
#         # Return all transaction attributes
#         return jsonify(response.get("Items", []))
#     except Exception as e:
#         print("DEBUG: Error querying DynamoDB:", e)
#         return jsonify({"error": "Internal server error"}), 500

# # -----------------------
# # Add a transaction
# # -----------------------
# @app.route("/api/transactions", methods=["POST"])
# def add_transaction():
#     user = get_user_from_header()
#     if not user:
#         return jsonify({"error": "Unauthorized"}), 401

#     data = request.json
#     print("DEBUG: Received data:", data)

#     try:
#         transaction_id = str(uuid.uuid4())
#         item = {
#             "user_id": user["sub"],
#             "transaction_id": transaction_id,
#             "type": data.get("type"),
#             "person": data.get("person"),
#             "amount": data.get("amount"),
#             "currency": "EUR",
#             "transactionDate": data.get("transactionDate"),
#             "deadline": data.get("deadline"),
#             "status": "unpaid"
#         }
#         print("DEBUG: Item to insert:", item)

#         table.put_item(Item=item)
#         return jsonify(item), 201
#     except Exception as e:
#         print("DEBUG: Error adding transaction:", e)
#         return jsonify({"error": str(e)}), 500

# # -----------------------
# # Update a transaction
# # -----------------------
# @app.route("/api/transactions/<transaction_id>", methods=["PUT"])
# def update_transaction(transaction_id):
#     user = get_user_from_header()
#     if not user:
#         return jsonify({"error": "Unauthorized"}), 401

#     data = request.json
#     if not data:
#         return jsonify({"error": "No update data provided"}), 400

#     try:
#         update_expr = "SET " + ", ".join([f"{k}=:{k}" for k in data.keys()])
#         expr_vals = {f":{k}": v for k, v in data.items()}

#         table.update_item(
#             Key={"user_id": user["sub"], "transaction_id": transaction_id},
#             UpdateExpression=update_expr,
#             ExpressionAttributeValues=expr_vals
#         )
#         return jsonify({"message": "Transaction updated"})
#     except Exception as e:
#         print("DEBUG: Error updating transaction:", e)
#         return jsonify({"error": "Internal server error"}), 500

# # -----------------------
# # Delete a transaction
# # -----------------------
# @app.route("/api/transactions/<transaction_id>", methods=["DELETE"])
# def delete_transaction(transaction_id):
#     user = get_user_from_header()
#     if not user:
#         return jsonify({"error": "Unauthorized"}), 401

#     try:
#         table.delete_item(
#             Key={"user_id": user["sub"], "transaction_id": transaction_id}
#         )
#         return jsonify({"message": "Transaction deleted"})
#     except Exception as e:
#         print("DEBUG: Error deleting transaction:", e)
#         return jsonify({"error": "Internal server error"}), 500

# # -----------------------
# # Mark transaction as paid
# # -----------------------
# @app.route("/api/transactions/<transaction_id>/mark-paid", methods=["PUT"])
# def mark_paid(transaction_id):
#     user = get_user_from_header()
#     if not user:
#         return jsonify({"error": "Unauthorized"}), 401

#     try:
#         table.update_item(
#             Key={"user_id": user["sub"], "transaction_id": transaction_id},
#             UpdateExpression="SET #s = :p",
#             ExpressionAttributeNames={"#s": "status"},
#             ExpressionAttributeValues={":p": "paid"}
#         )
#         # Return the updated transaction
#         updated = table.get_item(
#             Key={"user_id": user["sub"], "transaction_id": transaction_id}
#         ).get("Item", {})
#         return jsonify(updated)
#     except Exception as e:
#         print("DEBUG: Error marking transaction as paid:", e)
#         return jsonify({"error": "Internal server error"}), 500
    


# # -----------------------
# # Delete all transactions for a person (hard delete)
# # -----------------------
# @app.route("/api/transactions/person/<string:person>", methods=["DELETE"])
# def delete_transactions_by_person(person):
#     user = get_user_from_header()
#     if not user:
#         return jsonify({"error": "Unauthorized"}), 401

#     try:
#         # Query all transactions for this user & person
#         response = table.query(
#             KeyConditionExpression="user_id = :uid",
#             ExpressionAttributeValues={":uid": user["sub"]}
#         )
#         items = response.get("Items", [])

#         # Filter only the given person
#         person_items = [t for t in items if t.get("person") == person]

#         deleted = 0
#         with table.batch_writer() as batch:
#             for t in person_items:
#                 batch.delete_item(
#                     Key={
#                         "user_id": user["sub"],
#                         "transaction_id": t["transaction_id"],
#                     }
#                 )
#                 deleted += 1

#         return jsonify({"deleted_count": deleted}), 200
#     except Exception as e:
#         print("DEBUG: Error deleting transactions by person:", e)
#         return jsonify({"error": "Internal server error"}), 500


# if __name__ == "__main__":
#     app.run(debug=True)

