from services.parkinglot_services import set_city_recommended
from flask import request

def set_city_recommend():
    data = request.json
    return set_city_recommended(data['user_id'], data['parking_lot_id'])
