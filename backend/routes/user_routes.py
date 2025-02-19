from flask import Blueprint
from controllers import user_controller

user_blueprint = Blueprint('user_blueprint',__name__)
user_blueprint.route('',methods=['POST'])(user_controller.user_create)

