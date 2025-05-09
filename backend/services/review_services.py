import pocketbase.errors
from .database_services import verify_db, client
from flask import jsonify

@verify_db
def create_review(user_id, parking_lot_id, review_score):
    try:
        result = client.collection("reviews").create({
            "user": user_id,
            "parkingLot": parking_lot_id,
            "rating": review_score
        })

        return jsonify({"id": result.id}, 201)

    except pocketbase.errors.ClientResponseError:
        existingRow = client.collection("reviews").get_list(1, 1, {
            filter: f'user.id = "{user_id}" && parkingLot.id = "{parking_lot_id}"'
        })

        print(existingRow.items[0].id)

        result = client.collection("reviews").update(existingRow.items[0].id, {
            "rating": review_score
        })

        return jsonify({"id": result.id}, 200)

@verify_db
def retrieve_reviews(user_id):
    result = client.collection("reviews").get_full_list()
    filtered = [{"parking_lot_id": x.parking_lot, "rating": x.rating} for x in result if x.user == user_id]
    return jsonify(filtered, 200)
