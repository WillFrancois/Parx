from pocketbase import PocketBase as pb
from .database_services import verify_db, client
from flask import jsonify


#Returns IDs of favorited parking lots given a user ID. Parking lots do not have names yet, so no additional queries are being done.
@verify_db
def getFavorites(user_id):
    favoritesListFromDB = client.collection('favorites').get_full_list()
    favoritesList = list(filter(lambda x: x.user == user_id, favoritesListFromDB))
    favoritesList = list(map(lambda x: x.parking_lot, favoritesList))
    return jsonify(favoritesList)
