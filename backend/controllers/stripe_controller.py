from services.stripe_services import create_payment
from flask import request

def create():
    data = request.json
    return create_payment(data['amount'])