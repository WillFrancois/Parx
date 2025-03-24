from services.reservation_services import add_reservation, view_reservation
from flask import request

def reservation_add():
    data = request.json
    return add_reservation(data['plate_number'], data['time_requested'], data['parking_lot_id'])

def reservation_view():
    data = request.json
    return view_reservation(data['plate_number'])
