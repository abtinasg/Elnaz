#!/usr/bin/env python3
"""
Create Admin User Script
Run this script to create an admin user for the dashboard
"""

import sys
import os

# Add parent directory to path to allow both direct execution and module import
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from backend.database import init_db
from backend.models import Admin

def create_admin():
    """Create a new admin user"""
    print("=" * 60)
    print("CREATE ADMIN USER")
    print("=" * 60)
    print()

    # Initialize database
    init_db()

    # Get admin details
    username = input("Enter username: ").strip()
    if not username:
        print("❌ Username is required!")
        return

    email = input("Enter email (optional): ").strip() or None

    password = input("Enter password: ").strip()
    if not password:
        print("❌ Password is required!")
        return

    confirm_password = input("Confirm password: ").strip()
    if password != confirm_password:
        print("❌ Passwords do not match!")
        return

    # Create admin
    admin_id = Admin.create(username, password, email)

    if admin_id:
        print()
        print("✅ Admin user created successfully!")
        print(f"   Username: {username}")
        print(f"   Email: {email or 'N/A'}")
        print()
        print("You can now login at: http://localhost:5000/admin.html")
        print()
    else:
        print()
        print("❌ Failed to create admin user!")
        print("   Username might already exist.")
        print()

if __name__ == '__main__':
    try:
        create_admin()
    except KeyboardInterrupt:
        print("\n\n❌ Operation cancelled by user.")
        sys.exit(1)
    except Exception as e:
        print(f"\n❌ Error: {e}")
        sys.exit(1)
