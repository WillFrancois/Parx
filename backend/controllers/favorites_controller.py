from services.favorites_services import getFavorites, addFavorite, delFavorite
from flask import request

def get_favorites():
    data = request.json
    return getFavorites(data['id'])

def add_favorites():
    data = request.json
    return addFavorite(data['id'], data['parking_lot_id'])

def delete_favorites():
    data = request.json
    return delFavorite(data['id'], data['parking_lot_id'])
