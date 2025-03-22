from services.reservation_services import add_reservation, find_reservation
from flask import request

def reservation_add():
    data = request.json
    return add_reservation(data['plate_number'], data['time_requested'], data['parking_lot_id'])

