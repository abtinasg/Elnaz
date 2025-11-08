"""
Database Models
CRUD operations for Contact Forms, Shop Orders, and Newsletter
"""

from database import get_db, dict_from_row
from datetime import datetime

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
