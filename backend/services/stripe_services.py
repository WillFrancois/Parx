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
  if customer_id:
    customer = client.collection("users").get_one(f'{customer_id}') 
    stripe_id = customer.customerKey
  if stripe_id:
    return stripe.Customer.retrieve(stripe_id)
  else:
    customer = stripe.Customer.create()
    client.collection('users').update(customer_id,{
      "customerKey": f"{customer['id']}"
    })
    return customer
  
@verify_db
def check_customer(customer_id):
  customer = client.collection('user').get_one(customer_id)
  return customer.customerKey


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



def get_orders(customer_id):
  pass
