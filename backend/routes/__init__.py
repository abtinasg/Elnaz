"""
Routes Package
API endpoints for the application
"""

from routes.contact import contact_bp
from routes.shop import shop_bp
from routes.newsletter import newsletter_bp
from routes.admin import admin_bp

__all__ = ['contact_bp', 'shop_bp', 'newsletter_bp', 'admin_bp']
