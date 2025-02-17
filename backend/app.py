from flask import Flask

def create_app():
    app = Flask(__name__)
    blueprint_config(app)
    return app

def blueprint_config(app):
    pass

app = create_app()