from pocketbase import PocketBase as pb
import os
from dotenv import load_dotenv
from .authentication_services import hash_password, check_password_hash
from .database_services import verify_db, client
from flask import jsonify


@verify_db
def create_user(email,password,emailVisibility=False,verified=False,cityOfficial=False):
    password_hashed = hash_password(password).decode()
    result = client.collection("users").create(
        {
        "password": password_hashed,
        "passwordConfirm": password_hashed,
        "email": email,
        "emailVisibility": emailVisibility,
        "verified": verified,
        "cityOfficial": cityOfficial
    }
    )
    return jsonify({"id":result.id,"email":result.email}), 201



@verify_db
def verify_user(email, password):
    password_hashed = hash_password(password).decode()
    result = client.collection("users").auth_with_password(email, password_hashed)
    return jsonify({"isValid": result.is_valid, "token": result.token, "record": result.record.id})
