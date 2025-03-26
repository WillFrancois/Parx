import stripe
from flask import jsonify

def payment_sheet():
  customer = stripe.Customer.create()
  ephemeralKey = stripe.EphemeralKey.create(
    customer=customer['id'],
    stripe_version='2025-02-24.acacia',
  )

  paymentIntent = stripe.PaymentIntent.create(
    amount=1099,
    currency='eur',
    customer=customer['id'],
  )

  return jsonify(paymentIntent=paymentIntent.client_secret,
                 ephemeralKey=ephemeralKey.secret,
                 customer=customer.id,
                 publishableKey='pk_test_TYooMQauvdEDq54NiTphI7jx')