"""
Routes Package
API endpoints for the application
"""

from backend.routes.contact import contact_bp
from backend.routes.shop import shop_bp
from backend.routes.newsletter import newsletter_bp
from backend.routes.admin import admin_bp

__all__ = ['contact_bp', 'shop_bp', 'newsletter_bp', 'admin_bp']
