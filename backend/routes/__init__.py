"""
Routes Package
API endpoints for the application
"""

from .contact import contact_bp
from .shop import shop_bp
from .newsletter import newsletter_bp
from .admin import admin_bp

__all__ = ['contact_bp', 'shop_bp', 'newsletter_bp', 'admin_bp']
