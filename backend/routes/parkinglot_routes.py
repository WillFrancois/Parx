from flask import Blueprint
from controllers import parkinglot_controller

parkinglot_blueprint = Blueprint('parkinglot_blueprint',__name__)
parkinglot_blueprint.route('/recommend',methods=['POST'])(parkinglot_controller.set_city_recommend)
