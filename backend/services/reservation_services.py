import pocketbase.errors
import datetime
from datetime import timedelta
from .database_services import verify_db, client
from flask import jsonify

# time_requested format is YYYY-MM-DD HH:MM:SS
@verify_db
def add_reservation(plate_number, time_requested, parking_lot_id):
    parking_lot = client.collection("parking_lots").get_one(f'{parking_lot_id}')
    total_spaces = parking_lot.total_spaces
    filled_spaces = parking_lot.filled_spaces

    if total_spaces > filled_spaces:
        try:
            result = client.collection("reservations").create({
                "licensePlateNumber": plate_number,
                "timeRequested": time_requested,
                "timeEnd": str(datetime.datetime.strptime(time_requested, "%Y-%m-%d %H:%M:%S") + timedelta(hours=1)),
                "location": parking_lot_id
            })

            return jsonify({"verification_code": result.verification_code})

        except Exception as e:
            return jsonify({"Status": f"Failed. {e}"})

    else:
        return jsonify({"Status": "Failed. Parking lot is already full."})

@verify_db
def view_reservation(plate_number):
    collection = client.collection("reservations").get_full_list()
    row = list(filter(lambda records: records.license_plate_number == plate_number, collection))[0]
    return jsonify(
        {
            "timeRequested": row.time_requested,
            "timeEnd": row.time_end,
            "location": row.location,
            "verification_code": row.verification_code
        }
    ), 200
