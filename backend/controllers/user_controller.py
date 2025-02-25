from services.user_services import create_user, verify_user
from flask import request

def user_create():
    data = request.json
    return create_user(data['email'],data['password'])

def user_verify():
    data = request.json
    print(data['email'], data['password'])
    return verify_user(data['email'], data['password'])
