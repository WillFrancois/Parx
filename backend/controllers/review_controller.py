from services.review_services import create_review, retrieve_reviews
from flask import request

def review_create():
    data = request.json
    return create_review(data['user_id'], data['parking_lot_id'], data['review_score'])

def reviews_retrieve():
    data = request.json
    return retrieve_reviews(data['user_id'])
