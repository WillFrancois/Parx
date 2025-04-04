from pocketbase import PocketBase as pb
from .database_services import verify_db, client
from flask import jsonify


#Returns IDs of favorited parking lots given a user ID. Parking lots do not have names yet, so no additional queries are being done.
@verify_db
def getFavorites(user_id):
    favoritesListFromDB = client.collection('favorites').get_full_list()
    favoritesList = list(filter(lambda x: x.user == user_id, favoritesListFromDB))
    favoritesList = list(map(lambda x: x.parking_lot, favoritesList))
    return jsonify(favoritesList), 200

@verify_db
def addFavorite(user_id, parking_lot_id):
    result = client.collection('favorites').create({
        "user": user_id,
        "parkingLot": parking_lot_id
    })

    return jsonify({"status": "success"}), 201

@verify_db
def delFavorite(user_id, parking_lot_id):
    collection = client.collection('favorites').get_full_list()
    row = list(filter(lambda record: record.user == user_id and record.parking_lot == parking_lot_id, collection))[0]
    print(dir(row))
    result = client.collection('favorites').delete(row.id)
    return jsonify({"status": "success"}), 200
