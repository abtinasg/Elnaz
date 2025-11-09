#!/usr/bin/env python3
"""
Server Runner Script
Run this script to start the Flask development server
"""

from backend.app import app

if __name__ == '__main__':
    print("\n" + "="*60)
    print("🎨 ELNAZ ASHRAFI - OFFICIAL WEBSITE")
    print("="*60)
    print("📍 Server running at: http://127.0.0.1:5000")
    print("📁 Frontend directory: frontend/")
    print("💾 Database: database/elnaz_ashrafi.db")
    print("="*60 + "\n")

    app.run(
        host='0.0.0.0',
        port=5000,
        debug=True
    )
