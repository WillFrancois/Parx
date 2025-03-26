from flask import Flask # type: ignore
from flask_cors import CORS # type: ignore
from routes.user_routes import user_blueprint
from routes.favorites_routes import favorite_blueprint
from routes.review_routes import review_blueprint
from routes.parkinglot_routes import parkinglot_blueprint
from routes.reservation_routes import reservation_blueprint


def create_app():
    app = Flask(__name__)
    CORS(app, resources={r"/*": {"origins": "*"}})
    blueprint_config(app)
    return app

def blueprint_config(app):
    app.register_blueprint(user_blueprint,url_prefix='/user')
    app.register_blueprint(favorite_blueprint, url_prefix='/favorites')
    app.register_blueprint(review_blueprint, url_prefix='/review')
    app.register_blueprint(parkinglot_blueprint, url_prefix='/parkinglot')
    app.register_blueprint(reservation_blueprint, url_prefix='/reservation')

@user_blueprint.route('', methods=['OPTIONS'])
def options():
    return '', 200

app = create_app()
app.run(host="0.0.0.0", port=5000, debug=True)
