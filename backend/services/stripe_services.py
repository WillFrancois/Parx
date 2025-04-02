import stripe
from flask import jsonify
import os
from dotenv import load_dotenv
from database_services import verify_db

load_dotenv()
stripe_publishable_key = os.getenv('STRIPE_PK')
stripe_secret_key = os.getenv('STRIPE_SK')
stripe.api_key = stripe_secret_key


def create_payment(amount,customer=None):
  customer = stripe.Customer.create()
  ephemeralKey = stripe.EphemeralKey.create(
    customer=customer['id'],
    stripe_version='2025-02-24.acacia',
  )

  paymentIntent = stripe.PaymentIntent.create(
    amount=amount,
    currency='usd',
    customer=customer['id'],
  )

  return jsonify(paymentIntent=paymentIntent.client_secret,
                 ephemeralKey=ephemeralKey.secret,
                 customer=customer.id,
                 publishableKey=stripe_publishable_key)



def get_orders(customer):
  pass