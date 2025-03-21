from flask import Blueprint
from controllers import review_controller

review_blueprint = Blueprint('review_blueprint',__name__)
review_blueprint.route('/create',methods=['POST'])(review_controller.review_create)
review_blueprint.route('/retrieve',methods=['POST'])(review_controller.reviews_retrieve)
