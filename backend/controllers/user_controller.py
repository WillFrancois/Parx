from services.user_services import create_user
from flask import request

def user_create():
    data = request.json
    return create_user(data['email'],data['password'])
