from services.favorites_services import getFavorites
from flask import request

def get_favorites():
    data = request.json
    return getFavorites(data['id'])
