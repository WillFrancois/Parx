from flask import Blueprint
from controllers import reservation_controller

reservation_blueprint = Blueprint('reservation_controller',__name__)
reservation_blueprint.route('',methods=['POST'])(reservation_controller.reservation_add)
reservation_blueprint.route('view',methods=['POST'])(reservation_controller.reservation_view)
