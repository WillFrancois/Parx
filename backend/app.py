from flask import Flask # type: ignore
from flask_cors import CORS # type: ignore
from routes.user_routes import user_blueprint


def create_app():
    app = Flask(__name__)
    CORS(app, resources={r"/*": {"origins": "*"}})
    blueprint_config(app)
    return app

def blueprint_config(app):
    app.register_blueprint(user_blueprint,url_prefix='/user')

@user_blueprint.route('', methods=['OPTIONS'])
def options():
    return '', 200

app = create_app()
app.run(host="0.0.0.0", port=5000, debug=True)