"""
Database Models
CRUD operations for Contact Forms, Shop Orders, Newsletter, Admin, Products, and Orders
"""

from .database import get_db, dict_from_row
from datetime import datetime, timedelta
import hashlib
import secrets
import random
import string

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


class Product:
    """Product Model for Shop"""

    @staticmethod
    def create(name_fa, price, name_en=None, description_fa=None, description_en=None,
               category=None, image_url=None, stock_quantity=0):
        """Create a new product"""
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute('''
                INSERT INTO products
                (name_fa, name_en, description_fa, description_en, price, category, image_url, stock_quantity)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            ''', (name_fa, name_en, description_fa, description_en, price, category, image_url, stock_quantity))
            return cursor.lastrowid

    @staticmethod
    def get_all(category=None, available_only=True):
        """Get all products with optional filtering"""
        with get_db() as conn:
            cursor = conn.cursor()
            query = 'SELECT * FROM products'
            conditions = []
            params = []

            if available_only:
                conditions.append('is_available = 1')

            if category:
                conditions.append('category = ?')
                params.append(category)

            if conditions:
                query += ' WHERE ' + ' AND '.join(conditions)

            query += ' ORDER BY created_at DESC'
            cursor.execute(query, params)
            return [dict_from_row(row) for row in cursor.fetchall()]

    @staticmethod
    def get_by_id(product_id):
        """Get product by ID"""
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute('SELECT * FROM products WHERE id = ?', (product_id,))
            row = cursor.fetchone()
            return dict_from_row(row) if row else None

    @staticmethod
    def update(product_id, **kwargs):
        """Update product fields"""
        with get_db() as conn:
            cursor = conn.cursor()
            allowed_fields = ['name_fa', 'name_en', 'description_fa', 'description_en',
                            'price', 'category', 'image_url', 'stock_quantity', 'is_available']

            updates = []
            values = []
            for field, value in kwargs.items():
                if field in allowed_fields:
                    updates.append(f'{field} = ?')
                    values.append(value)

            if updates:
                updates.append('updated_at = CURRENT_TIMESTAMP')
                values.append(product_id)
                query = f'UPDATE products SET {", ".join(updates)} WHERE id = ?'
                cursor.execute(query, values)
                return cursor.rowcount > 0
            return False

    @staticmethod
    def delete(product_id):
        """Delete product (soft delete by marking as unavailable)"""
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute('UPDATE products SET is_available = 0 WHERE id = ?', (product_id,))
            return cursor.rowcount > 0

    @staticmethod
    def get_categories():
        """Get all unique categories"""
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute('SELECT DISTINCT category FROM products WHERE category IS NOT NULL AND is_available = 1')
            return [row[0] for row in cursor.fetchall()]


class Order:
    """Order Model for Shop"""

    @staticmethod
    def generate_order_number():
        """Generate unique order number"""
        timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
        random_suffix = ''.join(random.choices(string.digits, k=4))
        return f'ORD-{timestamp}-{random_suffix}'

    @staticmethod
    def create(customer_name, customer_email, items, customer_phone=None,
               customer_address=None, payment_method='cash', notes=None):
        """Create a new order with items"""
        with get_db() as conn:
            cursor = conn.cursor()

            # Calculate total
            total_amount = sum(item['price'] * item['quantity'] for item in items)

            # Generate order number
            order_number = Order.generate_order_number()

            # Create order
            cursor.execute('''
                INSERT INTO orders
                (order_number, customer_name, customer_email, customer_phone,
                 customer_address, total_amount, payment_method, notes)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            ''', (order_number, customer_name, customer_email, customer_phone,
                  customer_address, total_amount, payment_method, notes))

            order_id = cursor.lastrowid

            # Create order items
            for item in items:
                cursor.execute('''
                    INSERT INTO order_items
                    (order_id, product_id, product_name, quantity, price)
                    VALUES (?, ?, ?, ?, ?)
                ''', (order_id, item['product_id'], item['product_name'],
                      item['quantity'], item['price']))

            return {
                'order_id': order_id,
                'order_number': order_number,
                'total_amount': total_amount
            }

    @staticmethod
    def get_all(limit=50, status=None):
        """Get all orders"""
        with get_db() as conn:
            cursor = conn.cursor()
            query = 'SELECT * FROM orders'

            if status:
                query += ' WHERE status = ?'
                cursor.execute(f'{query} ORDER BY created_at DESC LIMIT ?', (status, limit))
            else:
                cursor.execute(f'{query} ORDER BY created_at DESC LIMIT ?', (limit,))

            return [dict_from_row(row) for row in cursor.fetchall()]

    @staticmethod
    def get_by_id(order_id):
        """Get order by ID with items"""
        with get_db() as conn:
            cursor = conn.cursor()

            # Get order
            cursor.execute('SELECT * FROM orders WHERE id = ?', (order_id,))
            order_row = cursor.fetchone()

            if not order_row:
                return None

            order = dict_from_row(order_row)

            # Get order items
            cursor.execute('SELECT * FROM order_items WHERE order_id = ?', (order_id,))
            order['items'] = [dict_from_row(row) for row in cursor.fetchall()]

            return order

    @staticmethod
    def get_by_order_number(order_number):
        """Get order by order number"""
        with get_db() as conn:
            cursor = conn.cursor()

            # Get order
            cursor.execute('SELECT * FROM orders WHERE order_number = ?', (order_number,))
            order_row = cursor.fetchone()

            if not order_row:
                return None

            order = dict_from_row(order_row)

            # Get order items
            cursor.execute('SELECT * FROM order_items WHERE order_id = ?', (order['id'],))
            order['items'] = [dict_from_row(row) for row in cursor.fetchall()]

            return order

    @staticmethod
    def update_status(order_id, status):
        """Update order status"""
        valid_statuses = ['pending', 'processing', 'completed', 'cancelled']
        if status not in valid_statuses:
            return False

        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute('''
                UPDATE orders
                SET status = ?, updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
            ''', (status, order_id))
            return cursor.rowcount > 0


class ShopUser:
    """Shop User Model for customer authentication"""

    @staticmethod
    def hash_password(password):
        """Hash password using SHA256"""
        return hashlib.sha256(password.encode()).hexdigest()

    @staticmethod
    def create(full_name, email, password, phone=None, address=None):
        """Create a new shop user"""
        with get_db() as conn:
            cursor = conn.cursor()
            password_hash = ShopUser.hash_password(password)
            try:
                cursor.execute('''
                    INSERT INTO shop_users (full_name, email, password_hash, phone, address)
                    VALUES (?, ?, ?, ?, ?)
                ''', (full_name, email, password_hash, phone, address))
                return cursor.lastrowid
            except Exception as e:
                return None

    @staticmethod
    def authenticate(email, password):
        """Authenticate shop user"""
        with get_db() as conn:
            cursor = conn.cursor()
            password_hash = ShopUser.hash_password(password)
            cursor.execute('''
                SELECT * FROM shop_users
                WHERE email = ? AND password_hash = ? AND is_active = 1
            ''', (email, password_hash))
            row = cursor.fetchone()
            return dict_from_row(row) if row else None

    @staticmethod
    def get_by_id(user_id):
        """Get user by ID"""
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute('SELECT * FROM shop_users WHERE id = ?', (user_id,))
            row = cursor.fetchone()
            return dict_from_row(row) if row else None

    @staticmethod
    def get_by_email(email):
        """Get user by email"""
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute('SELECT * FROM shop_users WHERE email = ?', (email,))
            row = cursor.fetchone()
            return dict_from_row(row) if row else None

    @staticmethod
    def create_session(user_id):
        """Create a new session for user"""
        with get_db() as conn:
            cursor = conn.cursor()
            session_token = secrets.token_urlsafe(32)
            expires_at = datetime.now() + timedelta(days=7)  # 7 days for shop users

            cursor.execute('''
                INSERT INTO shop_user_sessions (user_id, session_token, expires_at)
                VALUES (?, ?, ?)
            ''', (user_id, session_token, expires_at.isoformat()))

            # Update last login
            cursor.execute('''
                UPDATE shop_users SET last_login = CURRENT_TIMESTAMP
                WHERE id = ?
            ''', (user_id,))

            return session_token

    @staticmethod
    def verify_session(session_token):
        """Verify user session token"""
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute('''
                SELECT u.*, s.user_id
                FROM shop_user_sessions s
                JOIN shop_users u ON s.user_id = u.id
                WHERE s.session_token = ?
                AND s.is_active = 1
                AND s.expires_at > datetime('now')
                AND u.is_active = 1
            ''', (session_token,))
            row = cursor.fetchone()
            return dict_from_row(row) if row else None

    @staticmethod
    def logout(session_token):
        """Invalidate session"""
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute('''
                UPDATE shop_user_sessions
                SET is_active = 0
                WHERE session_token = ?
            ''', (session_token,))
            return cursor.rowcount > 0

    @staticmethod
    def update_profile(user_id, **kwargs):
        """Update user profile"""
        with get_db() as conn:
            cursor = conn.cursor()
            allowed_fields = ['full_name', 'phone', 'address']

            updates = []
            values = []
            for field, value in kwargs.items():
                if field in allowed_fields:
                    updates.append(f'{field} = ?')
                    values.append(value)

            if updates:
                values.append(user_id)
                query = f'UPDATE shop_users SET {", ".join(updates)} WHERE id = ?'
                cursor.execute(query, values)
                return cursor.rowcount > 0
            return False


class ShopPage:
    """Shop Page Model for Contact and About pages"""

    @staticmethod
    def create_or_update(page_key, title_fa, content_fa, updated_by=None):
        """Create or update a shop page"""
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute('''
                INSERT INTO shop_pages (page_key, title_fa, content_fa, updated_by)
                VALUES (?, ?, ?, ?)
                ON CONFLICT(page_key) DO UPDATE SET
                    title_fa = excluded.title_fa,
                    content_fa = excluded.content_fa,
                    updated_by = excluded.updated_by,
                    updated_at = CURRENT_TIMESTAMP
            ''', (page_key, title_fa, content_fa, updated_by))
            return cursor.lastrowid

    @staticmethod
    def get_by_key(page_key):
        """Get page by key"""
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute('''
                SELECT * FROM shop_pages
                WHERE page_key = ? AND is_active = 1
            ''', (page_key,))
            row = cursor.fetchone()
            return dict_from_row(row) if row else None

    @staticmethod
    def get_all():
        """Get all shop pages"""
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute('''
                SELECT * FROM shop_pages
                WHERE is_active = 1
                ORDER BY page_key
            ''')
            return [dict_from_row(row) for row in cursor.fetchall()]

    @staticmethod
    def delete(page_key):
        """Delete (deactivate) a shop page"""
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute('''
                UPDATE shop_pages SET is_active = 0
                WHERE page_key = ?
            ''', (page_key,))
            return cursor.rowcount > 0

    @staticmethod
    def initialize_default_pages():
        """Initialize default Contact and About pages"""
        default_pages = [
            {
                'page_key': 'contact',
                'title_fa': 'تماس با ما',
                'content_fa': '''
                    <div class="contact-info">
                        <h2>راه‌های ارتباطی</h2>
                        <p>برای خرید، مشاوره یا هرگونه سوال در خصوص آثار هنری، می‌توانید با ما در ارتباط باشید.</p>

                        <div class="contact-methods">
                            <div class="contact-item">
                                <h3>ایمیل</h3>
                                <p>info@elnazashrafi.com</p>
                            </div>

                            <div class="contact-item">
                                <h3>تلفن</h3>
                                <p>۰۲۱-۱۲۳۴۵۶۷۸</p>
                            </div>

                            <div class="contact-item">
                                <h3>آدرس</h3>
                                <p>تهران، خیابان ولیعصر، نمایشگاه آثار هنری النازاشرفی</p>
                            </div>

                            <div class="contact-item">
                                <h3>ساعات کاری</h3>
                                <p>شنبه تا پنج‌شنبه: ۹ صبح تا ۶ عصر</p>
                            </div>
                        </div>
                    </div>
                '''
            },
            {
                'page_key': 'about',
                'title_fa': 'درباره فروشگاه',
                'content_fa': '''
                    <div class="about-content">
                        <h2>درباره فروشگاه آثار هنری</h2>
                        <p>فروشگاه آنلاین آثار هنری النازاشرفی با هدف عرضه مستقیم آثار اورجینال و چاپ‌های محدود به علاقه‌مندان هنر راه‌اندازی شده است.</p>

                        <h3>ویژگی‌های فروشگاه</h3>
                        <ul>
                            <li>تمامی آثار اورجینال و با گواهی اصالت</li>
                            <li>امکان خرید آنلاین با تحویل سریع</li>
                            <li>مشاوره رایگان برای انتخاب اثر مناسب</li>
                            <li>گارانتی بازگشت وجه در صورت عدم رضایت</li>
                            <li>پشتیبانی ۲۴ساعته</li>
                        </ul>

                        <h3>نحوه خرید</h3>
                        <p>برای خرید از فروشگاه، ابتدا باید ثبت‌نام کنید و سپس آثار مورد نظر خود را به سبد خرید اضافه نمایید. پس از تکمیل فرآیند خرید، کارشناسان ما جهت هماهنگی ارسال با شما تماس خواهند گرفت.</p>
                    </div>
                '''
            }
        ]

        for page in default_pages:
            ShopPage.create_or_update(
                page_key=page['page_key'],
                title_fa=page['title_fa'],
                content_fa=page['content_fa']
            )


class Coupon:
    """Coupon/Discount Model"""

    @staticmethod
    def create(code, discount_type, discount_value, description_fa=None,
               min_purchase=0, max_discount=None, usage_limit=None,
               valid_from=None, valid_until=None):
        """Create a new coupon"""
        with get_db() as conn:
            cursor = conn.cursor()
            try:
                cursor.execute('''
                    INSERT INTO coupons
                    (code, description_fa, discount_type, discount_value, min_purchase,
                     max_discount, usage_limit, valid_from, valid_until)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                ''', (code, description_fa, discount_type, discount_value, min_purchase,
                      max_discount, usage_limit, valid_from, valid_until))
                return cursor.lastrowid
            except Exception:
                return None

    @staticmethod
    def get_by_code(code):
        """Get coupon by code"""
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute('SELECT * FROM coupons WHERE code = ? AND is_active = 1', (code,))
            row = cursor.fetchone()
            return dict_from_row(row) if row else None

    @staticmethod
    def validate(code, purchase_amount):
        """Validate coupon and return discount amount"""
        coupon = Coupon.get_by_code(code)
        if not coupon:
            return {'valid': False, 'error': 'کد تخفیف نامعتبر است'}

        # Check if expired
        if coupon['valid_until']:
            from datetime import datetime
            if datetime.fromisoformat(coupon['valid_until']) < datetime.now():
                return {'valid': False, 'error': 'کد تخفیف منقضی شده است'}

        # Check minimum purchase
        if purchase_amount < coupon['min_purchase']:
            return {'valid': False, 'error': f'حداقل خرید برای این کد {coupon["min_purchase"]} تومان است'}

        # Check usage limit
        if coupon['usage_limit'] and coupon['used_count'] >= coupon['usage_limit']:
            return {'valid': False, 'error': 'ظرفیت استفاده از این کد تخفیف تمام شده است'}

        # Calculate discount
        if coupon['discount_type'] == 'percentage':
            discount = purchase_amount * (coupon['discount_value'] / 100)
            if coupon['max_discount']:
                discount = min(discount, coupon['max_discount'])
        else:  # fixed
            discount = coupon['discount_value']

        return {
            'valid': True,
            'discount_amount': discount,
            'final_amount': purchase_amount - discount
        }

    @staticmethod
    def use_coupon(code):
        """Increment usage count"""
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute('''
                UPDATE coupons SET used_count = used_count + 1
                WHERE code = ?
            ''', (code,))
            return cursor.rowcount > 0

    @staticmethod
    def get_all(active_only=True):
        """Get all coupons"""
        with get_db() as conn:
            cursor = conn.cursor()
            query = 'SELECT * FROM coupons'
            if active_only:
                query += ' WHERE is_active = 1'
            query += ' ORDER BY created_at DESC'
            cursor.execute(query)
            return [dict_from_row(row) for row in cursor.fetchall()]

    @staticmethod
    def update(coupon_id, **kwargs):
        """Update coupon"""
        with get_db() as conn:
            cursor = conn.cursor()
            allowed_fields = ['description_fa', 'discount_type', 'discount_value',
                            'min_purchase', 'max_discount', 'usage_limit',
                            'valid_from', 'valid_until', 'is_active']

            updates = []
            values = []
            for field, value in kwargs.items():
                if field in allowed_fields:
                    updates.append(f'{field} = ?')
                    values.append(value)

            if updates:
                values.append(coupon_id)
                query = f'UPDATE coupons SET {", ".join(updates)} WHERE id = ?'
                cursor.execute(query, values)
                return cursor.rowcount > 0
            return False

    @staticmethod
    def delete(coupon_id):
        """Deactivate coupon"""
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute('UPDATE coupons SET is_active = 0 WHERE id = ?', (coupon_id,))
            return cursor.rowcount > 0


class Inventory:
    """Inventory Management Model"""

    @staticmethod
    def record_change(product_id, quantity_change, change_type, previous_quantity,
                     reference_type=None, reference_id=None, notes=None, created_by=None):
        """Record inventory change"""
        with get_db() as conn:
            cursor = conn.cursor()
            new_quantity = previous_quantity + quantity_change
            cursor.execute('''
                INSERT INTO inventory_history
                (product_id, quantity_change, previous_quantity, new_quantity,
                 change_type, reference_type, reference_id, notes, created_by)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (product_id, quantity_change, previous_quantity, new_quantity,
                  change_type, reference_type, reference_id, notes, created_by))
            return cursor.lastrowid

    @staticmethod
    def get_product_history(product_id, limit=50):
        """Get inventory history for a product"""
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute('''
                SELECT * FROM inventory_history
                WHERE product_id = ?
                ORDER BY created_at DESC
                LIMIT ?
            ''', (product_id, limit))
            return [dict_from_row(row) for row in cursor.fetchall()]

    @staticmethod
    def adjust_stock(product_id, new_quantity, notes=None, created_by=None):
        """Adjust product stock with history tracking"""
        product = Product.get_by_id(product_id)
        if not product:
            return False

        previous_quantity = product['stock_quantity']
        quantity_change = new_quantity - previous_quantity

        with get_db() as conn:
            cursor = conn.cursor()

            # Update product stock
            cursor.execute('''
                UPDATE products SET stock_quantity = ?
                WHERE id = ?
            ''', (new_quantity, product_id))

            # Record history
            Inventory.record_change(
                product_id, quantity_change, 'adjustment',
                previous_quantity, notes=notes, created_by=created_by
            )

            return True

    @staticmethod
    def get_low_stock_products(threshold=10):
        """Get products with low stock"""
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute('''
                SELECT * FROM products
                WHERE stock_quantity <= ? AND is_available = 1
                ORDER BY stock_quantity ASC
            ''', (threshold,))
            return [dict_from_row(row) for row in cursor.fetchall()]

    @staticmethod
    def get_inventory_report():
        """Get comprehensive inventory report"""
        with get_db() as conn:
            cursor = conn.cursor()

            # Total products
            cursor.execute('SELECT COUNT(*) FROM products WHERE is_available = 1')
            total_products = cursor.fetchone()[0]

            # Total stock value
            cursor.execute('SELECT SUM(stock_quantity * price) FROM products WHERE is_available = 1')
            total_value = cursor.fetchone()[0] or 0

            # Low stock count
            cursor.execute('SELECT COUNT(*) FROM products WHERE stock_quantity <= 10 AND is_available = 1')
            low_stock_count = cursor.fetchone()[0]

            # Out of stock count
            cursor.execute('SELECT COUNT(*) FROM products WHERE stock_quantity = 0 AND is_available = 1')
            out_of_stock_count = cursor.fetchone()[0]

            return {
                'total_products': total_products,
                'total_stock_value': total_value,
                'low_stock_count': low_stock_count,
                'out_of_stock_count': out_of_stock_count
            }


class ProductAttribute:
    """Product Attributes/Variants Model"""

    @staticmethod
    def create(product_id, attribute_name_fa, attribute_value_fa,
               price_adjustment=0, stock_quantity=0, sku=None):
        """Create product attribute"""
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute('''
                INSERT INTO product_attributes
                (product_id, attribute_name_fa, attribute_value_fa, price_adjustment, stock_quantity, sku)
                VALUES (?, ?, ?, ?, ?, ?)
            ''', (product_id, attribute_name_fa, attribute_value_fa, price_adjustment, stock_quantity, sku))
            return cursor.lastrowid

    @staticmethod
    def get_by_product(product_id):
        """Get all attributes for a product"""
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute('''
                SELECT * FROM product_attributes
                WHERE product_id = ? AND is_available = 1
            ''', (product_id,))
            return [dict_from_row(row) for row in cursor.fetchall()]

    @staticmethod
    def update(attribute_id, **kwargs):
        """Update product attribute"""
        with get_db() as conn:
            cursor = conn.cursor()
            allowed_fields = ['attribute_name_fa', 'attribute_value_fa',
                            'price_adjustment', 'stock_quantity', 'sku', 'is_available']

            updates = []
            values = []
            for field, value in kwargs.items():
                if field in allowed_fields:
                    updates.append(f'{field} = ?')
                    values.append(value)

            if updates:
                values.append(attribute_id)
                query = f'UPDATE product_attributes SET {", ".join(updates)} WHERE id = ?'
                cursor.execute(query, values)
                return cursor.rowcount > 0
            return False

    @staticmethod
    def delete(attribute_id):
        """Delete product attribute"""
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute('UPDATE product_attributes SET is_available = 0 WHERE id = ?', (attribute_id,))
            return cursor.rowcount > 0
