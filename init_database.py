#!/usr/bin/env python3
"""
Initialize the database with all required tables
and create default shop pages
"""

import sys
import os

# Add backend to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'backend'))

from backend.database import init_db
from backend.models import ShopPage

def main():
    print("🚀 Initializing database...")

    # Create all tables
    init_db()

    print("\n📄 Creating default shop pages...")

    # Initialize default shop pages
    ShopPage.initialize_default_pages()

    print("\n✅ Database initialization completed successfully!")
    print("\nDefault shop pages created:")
    print("  - Contact (تماس با ما)")
    print("  - About (درباره فروشگاه)")
    print("\nYou can now:")
    print("  1. Start the server with: python3 backend/app.py")
    print("  2. Access shop at: http://localhost:5000/shop.html")
    print("  3. Access admin at: http://localhost:5000/admin.html")

if __name__ == '__main__':
    main()
