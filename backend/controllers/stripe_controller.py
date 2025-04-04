from services.stripe_services import create_payment
from flask import request

def create():
    data = request.json
    try:
        return create_payment(data['amount'],data['user_id'])
    except:
        return create_payment(data['amount'])