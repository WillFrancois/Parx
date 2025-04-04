from flask import Blueprint
from controllers import stripe_controller

stripe_blueprint = Blueprint('stripe_blueprint',__name__)
stripe_blueprint.route('/create',methods=['POST'])(stripe_controller.create)