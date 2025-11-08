"""
Database Models
CRUD operations for Contact Forms, Shop Orders, Newsletter, and Admin
"""

from database import get_db, dict_from_row
from datetime import datetime, timedelta
import hashlib
import secrets

class Contact:
    """Contact Form Model"""

    @staticmethod
    def create(name, email, subject, message):
        """Create a new contact submission"""
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute('''
                INSERT INTO contacts (name, email, subject, message)
                VALUES (?, ?, ?, ?)
            ''', (name, email, subject, message))
            return cursor.lastrowid

    @staticmethod
    def get_all(limit=50, status=None):
        """Get all contact submissions"""
        with get_db() as conn:
            cursor = conn.cursor()
            query = 'SELECT * FROM contacts'
            if status:
                query += f' WHERE status = ?'
                cursor.execute(f'{query} ORDER BY created_at DESC LIMIT ?', (status, limit))
            else:
                cursor.execute(f'{query} ORDER BY created_at DESC LIMIT ?', (limit,))
            return [dict_from_row(row) for row in cursor.fetchall()]

    @staticmethod
    def get_by_id(contact_id):
        """Get contact by ID"""
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute('SELECT * FROM contacts WHERE id = ?', (contact_id,))
            row = cursor.fetchone()
            return dict_from_row(row) if row else None

    @staticmethod
    def update_status(contact_id, status):
        """Update contact status"""
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute('UPDATE contacts SET status = ? WHERE id = ?', (status, contact_id))
            return cursor.rowcount > 0


class ShopOrder:
    """Shop Order Model"""

    @staticmethod
    def create(product_name, customer_name, customer_email, customer_phone=None, quantity=1, message=None):
        """Create a new shop order"""
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute('''
                INSERT INTO shop_orders
                (product_name, customer_name, customer_email, customer_phone, quantity, message)
                VALUES (?, ?, ?, ?, ?, ?)
            ''', (product_name, customer_name, customer_email, customer_phone, quantity, message))
            return cursor.lastrowid

    @staticmethod
    def get_all(limit=50, status=None):
        """Get all shop orders"""
        with get_db() as conn:
            cursor = conn.cursor()
            query = 'SELECT * FROM shop_orders'
            if status:
                query += f' WHERE status = ?'
                cursor.execute(f'{query} ORDER BY created_at DESC LIMIT ?', (status, limit))
            else:
                cursor.execute(f'{query} ORDER BY created_at DESC LIMIT ?', (limit,))
            return [dict_from_row(row) for row in cursor.fetchall()]

    @staticmethod
    def get_by_id(order_id):
        """Get order by ID"""
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute('SELECT * FROM shop_orders WHERE id = ?', (order_id,))
            row = cursor.fetchone()
            return dict_from_row(row) if row else None

    @staticmethod
    def update_status(order_id, status):
        """Update order status"""
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute('UPDATE shop_orders SET status = ? WHERE id = ?', (status, order_id))
            return cursor.rowcount > 0


class Newsletter:
    """Newsletter Subscription Model"""

    @staticmethod
    def subscribe(email):
        """Subscribe to newsletter"""
        with get_db() as conn:
            cursor = conn.cursor()
            try:
                cursor.execute('''
                    INSERT INTO newsletter_subscribers (email)
                    VALUES (?)
                ''', (email,))
                return cursor.lastrowid
            except Exception as e:
                # Email already exists
                return None

    @staticmethod
    def unsubscribe(email):
        """Unsubscribe from newsletter"""
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute('''
                UPDATE newsletter_subscribers
                SET is_active = 0
                WHERE email = ?
            ''', (email,))
            return cursor.rowcount > 0

    @staticmethod
    def get_all(active_only=True):
        """Get all subscribers"""
        with get_db() as conn:
            cursor = conn.cursor()
            query = 'SELECT * FROM newsletter_subscribers'
            if active_only:
                query += ' WHERE is_active = 1'
            cursor.execute(f'{query} ORDER BY subscribed_at DESC')
            return [dict_from_row(row) for row in cursor.fetchall()]


class Admin:
    """Admin User Model"""

    @staticmethod
    def hash_password(password):
        """Hash password using SHA256"""
        return hashlib.sha256(password.encode()).hexdigest()

    @staticmethod
    def create(username, password, email=None):
        """Create a new admin user"""
        with get_db() as conn:
            cursor = conn.cursor()
            password_hash = Admin.hash_password(password)
            try:
                cursor.execute('''
                    INSERT INTO admin_users (username, password_hash, email)
                    VALUES (?, ?, ?)
                ''', (username, password_hash, email))
                return cursor.lastrowid
            except Exception as e:
                return None

    @staticmethod
    def authenticate(username, password):
        """Authenticate admin user"""
        with get_db() as conn:
            cursor = conn.cursor()
            password_hash = Admin.hash_password(password)
            cursor.execute('''
                SELECT * FROM admin_users
                WHERE username = ? AND password_hash = ?
            ''', (username, password_hash))
            row = cursor.fetchone()
            return dict_from_row(row) if row else None

    @staticmethod
    def create_session(admin_id):
        """Create a new session for admin"""
        with get_db() as conn:
            cursor = conn.cursor()
            session_token = secrets.token_urlsafe(32)
            expires_at = datetime.now() + timedelta(hours=24)

            cursor.execute('''
                INSERT INTO admin_sessions (admin_id, session_token, expires_at)
                VALUES (?, ?, ?)
            ''', (admin_id, session_token, expires_at.isoformat()))

            # Update last login
            cursor.execute('''
                UPDATE admin_users SET last_login = CURRENT_TIMESTAMP
                WHERE id = ?
            ''', (admin_id,))

            return session_token

    @staticmethod
    def verify_session(session_token):
        """Verify admin session token"""
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute('''
                SELECT a.*, s.admin_id
                FROM admin_sessions s
                JOIN admin_users a ON s.admin_id = a.id
                WHERE s.session_token = ?
                AND s.is_active = 1
                AND s.expires_at > datetime('now')
            ''', (session_token,))
            row = cursor.fetchone()
            return dict_from_row(row) if row else None

    @staticmethod
    def logout(session_token):
        """Invalidate session"""
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute('''
                UPDATE admin_sessions
                SET is_active = 0
                WHERE session_token = ?
            ''', (session_token,))
            return cursor.rowcount > 0

    @staticmethod
    def get_stats():
        """Get dashboard statistics"""
        with get_db() as conn:
            cursor = conn.cursor()

            # Total contacts
            cursor.execute('SELECT COUNT(*) as total FROM contacts')
            total_contacts = cursor.fetchone()[0]

            # Unread contacts
            cursor.execute("SELECT COUNT(*) as unread FROM contacts WHERE status = 'unread'")
            unread_contacts = cursor.fetchone()[0]

            # Total orders
            cursor.execute('SELECT COUNT(*) as total FROM shop_orders')
            total_orders = cursor.fetchone()[0]

            # Pending orders
            cursor.execute("SELECT COUNT(*) as pending FROM shop_orders WHERE status = 'pending'")
            pending_orders = cursor.fetchone()[0]

            # Total subscribers
            cursor.execute('SELECT COUNT(*) as total FROM newsletter_subscribers WHERE is_active = 1')
            total_subscribers = cursor.fetchone()[0]

            return {
                'contacts': {
                    'total': total_contacts,
                    'unread': unread_contacts
                },
                'orders': {
                    'total': total_orders,
                    'pending': pending_orders
                },
                'subscribers': {
                    'total': total_subscribers
                }
            }
