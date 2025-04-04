import stripe
from flask import jsonify
import os
from dotenv import load_dotenv
from .database_services import verify_db, client

load_dotenv()
stripe_publishable_key = os.getenv('STRIPE_PK')
stripe_secret_key = os.getenv('STRIPE_SK')
stripe.api_key = stripe_secret_key

@verify_db
def set_customer(customer_id):
  print(customer_id)
  if customer_id:
    customer = client.collection("users").get_one(f"{customer_id}")
    if customer.customer_key:
      stripe_id = stripe.Customer.retrieve(customer.customer_key)
    else:
      stripe_id = stripe.Customer.create()
      client.collection("users").update(customer_id,{
        "customer_key":stripe_id["id"]
      })
  
  return stripe_id

  
  
def create_payment(amount,customer_id=None):
  
  customer = set_customer(customer_id)
  
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


