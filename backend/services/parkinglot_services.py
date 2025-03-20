import pocketbase.errors
from .database_services import verify_db, client
from flask import jsonify

@verify_db
def set_city_recommended(user_id, parking_lot_id):
    try:
        # Get list of officials
        city_officials = list(filter(lambda x: x.city_official == True, client.collection("users").get_full_list()))
        
        # User is a city official
        if len(list(filter(lambda x: x.id == user_id, city_officials))) > 0:
            parking_lot_status = list(filter(lambda x: x.id == parking_lot_id, client.collection("parking_lots").get_full_list()))[0].city_recommended
            client.collection("parking_lots").update(parking_lot_id, {
                "city_recommended": not parking_lot_status
            })

        return jsonify({"status": "Successful"}, 200)

    except Exception as e:
        return jsonify({"status": str(e)}, 400)
