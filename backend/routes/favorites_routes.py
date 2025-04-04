from flask import Blueprint
from controllers import favorites_controller

favorite_blueprint = Blueprint('favorite_blueprint', __name__)
favorite_blueprint.route('',methods=['POST'])(favorites_controller.get_favorites)
favorite_blueprint.route('add', methods=['POST'])(favorites_controller.add_favorites)
favorite_blueprint.route('delete', methods=['POST'])(favorites_controller.delete_favorites)
