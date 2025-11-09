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

    # Products Table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS products (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name_fa TEXT NOT NULL,
            name_en TEXT,
            description_fa TEXT,
            description_en TEXT,
            price REAL NOT NULL,
            category TEXT,
            image_url TEXT,
            stock_quantity INTEGER DEFAULT 0,
            is_available INTEGER DEFAULT 1,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')

    # Cart Items Table (session-based)
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS cart_items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            session_id TEXT NOT NULL,
            product_id INTEGER NOT NULL,
            quantity INTEGER DEFAULT 1,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (product_id) REFERENCES products(id)
        )
    ''')

    # Update shop_orders table to include more details
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS orders (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            order_number TEXT UNIQUE NOT NULL,
            customer_name TEXT NOT NULL,
            customer_email TEXT NOT NULL,
            customer_phone TEXT,
            customer_address TEXT,
            total_amount REAL NOT NULL,
            discount_amount REAL DEFAULT 0,
            coupon_code TEXT,
            payment_method TEXT DEFAULT 'cash',
            payment_status TEXT DEFAULT 'pending',
            status TEXT DEFAULT 'pending',
            notes TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')

    # Add columns to existing orders table if they don't exist (migration)
    try:
        cursor.execute("SELECT discount_amount FROM orders LIMIT 1")
    except:
        cursor.execute("ALTER TABLE orders ADD COLUMN discount_amount REAL DEFAULT 0")

    try:
        cursor.execute("SELECT coupon_code FROM orders LIMIT 1")
    except:
        cursor.execute("ALTER TABLE orders ADD COLUMN coupon_code TEXT")

    try:
        cursor.execute("SELECT payment_status FROM orders LIMIT 1")
    except:
        cursor.execute("ALTER TABLE orders ADD COLUMN payment_status TEXT DEFAULT 'pending'")

    # Order Items Table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS order_items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            order_id INTEGER NOT NULL,
            product_id INTEGER NOT NULL,
            product_name TEXT NOT NULL,
            quantity INTEGER NOT NULL,
            price REAL NOT NULL,
            FOREIGN KEY (order_id) REFERENCES orders(id),
            FOREIGN KEY (product_id) REFERENCES products(id)
        )
    ''')

    # Shop Users Table (for customer authentication)
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS shop_users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            full_name TEXT NOT NULL,
            email TEXT NOT NULL UNIQUE,
            phone TEXT,
            password_hash TEXT NOT NULL,
            address TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            last_login TIMESTAMP,
            is_active INTEGER DEFAULT 1
        )
    ''')

    # Shop User Sessions Table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS shop_user_sessions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            session_token TEXT NOT NULL UNIQUE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            expires_at TIMESTAMP NOT NULL,
            is_active INTEGER DEFAULT 1,
            FOREIGN KEY (user_id) REFERENCES shop_users (id)
        )
    ''')

    # Shop Pages Table (for Contact and About pages content)
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS shop_pages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            page_key TEXT NOT NULL UNIQUE,
            title_fa TEXT NOT NULL,
            content_fa TEXT NOT NULL,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_by INTEGER,
            is_active INTEGER DEFAULT 1,
            FOREIGN KEY (updated_by) REFERENCES admin_users(id)
        )
    ''')

    # Coupons Table (for discounts)
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS coupons (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            code TEXT NOT NULL UNIQUE,
            description_fa TEXT,
            discount_type TEXT DEFAULT 'percentage' CHECK(discount_type IN ('percentage', 'fixed')),
            discount_value REAL NOT NULL,
            min_purchase REAL DEFAULT 0,
            max_discount REAL,
            usage_limit INTEGER,
            used_count INTEGER DEFAULT 0,
            valid_from TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            valid_until TIMESTAMP,
            is_active INTEGER DEFAULT 1,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')

    # Inventory History Table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS inventory_history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            product_id INTEGER NOT NULL,
            quantity_change INTEGER NOT NULL,
            previous_quantity INTEGER NOT NULL,
            new_quantity INTEGER NOT NULL,
            change_type TEXT CHECK(change_type IN ('purchase', 'sale', 'return', 'adjustment', 'initial')),
            reference_type TEXT,
            reference_id INTEGER,
            notes TEXT,
            created_by INTEGER,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (product_id) REFERENCES products(id),
            FOREIGN KEY (created_by) REFERENCES admin_users(id)
        )
    ''')

    # Product Attributes Table (for variants like size, color)
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS product_attributes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            product_id INTEGER NOT NULL,
            attribute_name_fa TEXT NOT NULL,
            attribute_value_fa TEXT NOT NULL,
            price_adjustment REAL DEFAULT 0,
            stock_quantity INTEGER DEFAULT 0,
            sku TEXT,
            is_available INTEGER DEFAULT 1,
            FOREIGN KEY (product_id) REFERENCES products(id)
        )
    ''')

    # Product Reviews Table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS product_reviews (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            product_id INTEGER NOT NULL,
            user_id INTEGER,
            customer_name TEXT NOT NULL,
            rating INTEGER NOT NULL CHECK(rating >= 1 AND rating <= 5),
            review_text TEXT,
            is_verified INTEGER DEFAULT 0,
            is_approved INTEGER DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (product_id) REFERENCES products(id),
            FOREIGN KEY (user_id) REFERENCES shop_users(id)
        )
    ''')

    # Order Status History Table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS order_status_history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            order_id INTEGER NOT NULL,
            old_status TEXT,
            new_status TEXT NOT NULL,
            notes TEXT,
            changed_by INTEGER,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (order_id) REFERENCES orders(id),
            FOREIGN KEY (changed_by) REFERENCES admin_users(id)
        )
    ''')

    # Product Images Table (multiple images per product)
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS product_images (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            product_id INTEGER NOT NULL,
            image_url TEXT NOT NULL,
            is_primary INTEGER DEFAULT 0,
            display_order INTEGER DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (product_id) REFERENCES products(id)
        )
    ''')

    # Wishlist Table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS wishlists (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            product_id INTEGER NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES shop_users(id),
            FOREIGN KEY (product_id) REFERENCES products(id),
            UNIQUE(user_id, product_id)
        )
    ''')

    # Customer Addresses Table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS customer_addresses (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            address_title TEXT,
            full_address TEXT NOT NULL,
            city TEXT,
            postal_code TEXT,
            phone TEXT,
            is_default INTEGER DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES shop_users(id)
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
    cursor.execute('CREATE INDEX IF NOT EXISTS idx_products_category ON products(category)')
    cursor.execute('CREATE INDEX IF NOT EXISTS idx_products_available ON products(is_available)')
    cursor.execute('CREATE INDEX IF NOT EXISTS idx_cart_session ON cart_items(session_id)')
    cursor.execute('CREATE INDEX IF NOT EXISTS idx_orders_number ON orders(order_number)')
    cursor.execute('CREATE INDEX IF NOT EXISTS idx_orders_new_status ON orders(status)')
    cursor.execute('CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id)')
    cursor.execute('CREATE INDEX IF NOT EXISTS idx_shop_users_email ON shop_users(email)')
    cursor.execute('CREATE INDEX IF NOT EXISTS idx_shop_user_sessions_token ON shop_user_sessions(session_token)')
    cursor.execute('CREATE INDEX IF NOT EXISTS idx_shop_pages_key ON shop_pages(page_key)')
    cursor.execute('CREATE INDEX IF NOT EXISTS idx_coupons_code ON coupons(code)')
    cursor.execute('CREATE INDEX IF NOT EXISTS idx_coupons_active ON coupons(is_active)')
    cursor.execute('CREATE INDEX IF NOT EXISTS idx_inventory_history_product ON inventory_history(product_id, created_at DESC)')
    cursor.execute('CREATE INDEX IF NOT EXISTS idx_product_attributes_product ON product_attributes(product_id)')
    cursor.execute('CREATE INDEX IF NOT EXISTS idx_product_reviews_product ON product_reviews(product_id)')
    cursor.execute('CREATE INDEX IF NOT EXISTS idx_product_reviews_approved ON product_reviews(is_approved)')
    cursor.execute('CREATE INDEX IF NOT EXISTS idx_order_status_history_order ON order_status_history(order_id, created_at DESC)')
    cursor.execute('CREATE INDEX IF NOT EXISTS idx_product_images_product ON product_images(product_id, display_order)')
    cursor.execute('CREATE INDEX IF NOT EXISTS idx_wishlists_user ON wishlists(user_id)')
    cursor.execute('CREATE INDEX IF NOT EXISTS idx_customer_addresses_user ON customer_addresses(user_id)')

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
