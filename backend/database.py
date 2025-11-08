"""
Database Connection Manager
SQLite database configuration and initialization
"""

import sqlite3
import os
from contextlib import contextmanager

# Database file path
DB_PATH = os.path.join(os.path.dirname(__file__), '..', 'database', 'elnaz_ashrafi.db')

def init_db():
    """Initialize database with required tables"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    # Contact Form Table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS contacts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT NOT NULL,
            subject TEXT,
            message TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            status TEXT DEFAULT 'unread'
        )
    ''')

    # Shop Orders Table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS shop_orders (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            product_name TEXT NOT NULL,
            customer_name TEXT NOT NULL,
            customer_email TEXT NOT NULL,
            customer_phone TEXT,
            quantity INTEGER DEFAULT 1,
            message TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            status TEXT DEFAULT 'pending'
        )
    ''')

    # Newsletter Subscribers Table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS newsletter_subscribers (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT NOT NULL UNIQUE,
            subscribed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            is_active INTEGER DEFAULT 1
        )
    ''')

    # Admin Users Table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS admin_users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT NOT NULL UNIQUE,
            password_hash TEXT NOT NULL,
            email TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            last_login TIMESTAMP
        )
    ''')

    # Admin Sessions Table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS admin_sessions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            admin_id INTEGER NOT NULL,
            session_token TEXT NOT NULL UNIQUE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            expires_at TIMESTAMP NOT NULL,
            is_active INTEGER DEFAULT 1,
            FOREIGN KEY (admin_id) REFERENCES admin_users (id)
        )
    ''')

    # Site Content Table (CMS)
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS site_content (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            section TEXT NOT NULL,
            content_key TEXT NOT NULL,
            content_value TEXT,
            content_type TEXT DEFAULT 'text',
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_by INTEGER,
            UNIQUE(section, content_key),
            FOREIGN KEY (updated_by) REFERENCES admin_users(id)
        )
    ''')

    # Analytics Events Table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS analytics_events (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            event_type TEXT NOT NULL,
            event_data TEXT,
            ip_address TEXT,
            user_agent TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')

    # AI Conversations Table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS ai_conversations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            admin_id INTEGER NOT NULL,
            message TEXT NOT NULL,
            response TEXT NOT NULL,
            model TEXT DEFAULT 'gpt-3.5-turbo',
            tokens_used INTEGER,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (admin_id) REFERENCES admin_users(id)
        )
    ''')

    # SEO Settings Table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS seo_settings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            page TEXT UNIQUE NOT NULL,
            title TEXT,
            description TEXT,
            keywords TEXT,
            og_image TEXT,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')

    # Create indexes for performance
    cursor.execute('CREATE INDEX IF NOT EXISTS idx_contacts_status ON contacts(status)')
    cursor.execute('CREATE INDEX IF NOT EXISTS idx_contacts_created ON contacts(created_at DESC)')
    cursor.execute('CREATE INDEX IF NOT EXISTS idx_orders_status ON shop_orders(status)')
    cursor.execute('CREATE INDEX IF NOT EXISTS idx_orders_created ON shop_orders(created_at DESC)')
    cursor.execute('CREATE INDEX IF NOT EXISTS idx_sessions_token ON admin_sessions(session_token)')
    cursor.execute('CREATE INDEX IF NOT EXISTS idx_sessions_active ON admin_sessions(is_active, expires_at)')
    cursor.execute('CREATE INDEX IF NOT EXISTS idx_analytics_created ON analytics_events(created_at DESC)')
    cursor.execute('CREATE INDEX IF NOT EXISTS idx_ai_conversations_admin ON ai_conversations(admin_id, created_at DESC)')

    conn.commit()
    conn.close()
    print("✅ Database initialized successfully!")

@contextmanager
def get_db():
    """Context manager for database connections"""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row  # Return rows as dictionaries
    try:
        yield conn
        conn.commit()
    except Exception as e:
        conn.rollback()
        raise e
    finally:
        conn.close()

def dict_from_row(row):
    """Convert sqlite3.Row to dictionary"""
    return {key: row[key] for key in row.keys()}
