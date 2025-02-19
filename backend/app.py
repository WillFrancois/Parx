from flask import Flask
from routes.user_routes import user_blueprint


def create_app():
    app = Flask(__name__)
    blueprint_config(app)
    return app

def blueprint_config(app):
    app.register_blueprint(user_blueprint,url_prefix='/user')

app = create_app()
app.run(debug=True)