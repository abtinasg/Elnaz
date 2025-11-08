"""
Routes Package
API endpoints for the application
"""

from flask import Blueprint

# Create blueprints
contact_bp = Blueprint('contact', __name__, url_prefix='/api/contact')
shop_bp = Blueprint('shop', __name__, url_prefix='/api/shop')
newsletter_bp = Blueprint('newsletter', __name__, url_prefix='/api/newsletter')

# Import routes after blueprint creation to avoid circular imports
from routes import contact, shop, newsletter
