"""
Shop Routes
API endpoints for products, cart, and orders
Persian language support with complete e-commerce functionality
"""

from flask import Blueprint, request, jsonify
from ..models import Product, Order, ShopOrder, ShopUser, ShopPage
import re

shop_bp = Blueprint('shop', __name__, url_prefix='/api/shop')

def validate_email(email):
    """Validate email format"""
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None


# ==================== PRODUCTS ====================

@shop_bp.route('/products', methods=['GET'])
def get_products():
    """Get all products with optional filtering"""
    try:
        category = request.args.get('category')
        available_only = request.args.get('available', 'true').lower() == 'true'

        products = Product.get_all(category=category, available_only=available_only)

        return jsonify({
            'success': True,
            'count': len(products),
            'products': products
        }), 200

    except Exception as e:
        return jsonify({
            'success': False,
            'message': 'خطا در دریافت محصولات'
        }), 500


@shop_bp.route('/products/<int:product_id>', methods=['GET'])
def get_product(product_id):
    """Get single product by ID"""
    try:
        product = Product.get_by_id(product_id)

        if not product:
            return jsonify({
                'success': False,
                'message': 'محصول یافت نشد'
            }), 404

        return jsonify({
            'success': True,
            'product': product
        }), 200

    except Exception as e:
        return jsonify({
            'success': False,
            'message': 'خطا در دریافت محصول'
        }), 500


@shop_bp.route('/products', methods=['POST'])
def create_product():
    """Create new product (admin endpoint)"""
    try:
        data = request.get_json()

        # Validation
        required_fields = ['name_fa', 'price']
        for field in required_fields:
            if not data.get(field):
                return jsonify({
                    'success': False,
                    'message': f'فیلد {field} الزامی است'
                }), 400

        # Create product
        product_id = Product.create(
            name_fa=data['name_fa'],
            price=float(data['price']),
            name_en=data.get('name_en'),
            description_fa=data.get('description_fa'),
            description_en=data.get('description_en'),
            category=data.get('category'),
            image_url=data.get('image_url'),
            stock_quantity=data.get('stock_quantity', 0)
        )

        return jsonify({
            'success': True,
            'message': 'محصول با موفقیت ایجاد شد',
            'product_id': product_id
        }), 201

    except Exception as e:
        return jsonify({
            'success': False,
            'message': 'خطا در ایجاد محصول'
        }), 500


@shop_bp.route('/products/<int:product_id>', methods=['PUT'])
def update_product(product_id):
    """Update product (admin endpoint)"""
    try:
        data = request.get_json()

        # Update product
        success = Product.update(product_id, **data)

        if not success:
            return jsonify({
                'success': False,
                'message': 'محصول یافت نشد'
            }), 404

        return jsonify({
            'success': True,
            'message': 'محصول با موفقیت به‌روزرسانی شد'
        }), 200

    except Exception as e:
        return jsonify({
            'success': False,
            'message': 'خطا در به‌روزرسانی محصول'
        }), 500


@shop_bp.route('/products/<int:product_id>', methods=['DELETE'])
def delete_product(product_id):
    """Delete product (admin endpoint - soft delete)"""
    try:
        success = Product.delete(product_id)

        if not success:
            return jsonify({
                'success': False,
                'message': 'محصول یافت نشد'
            }), 404

        return jsonify({
            'success': True,
            'message': 'محصول با موفقیت حذف شد'
        }), 200

    except Exception as e:
        return jsonify({
            'success': False,
            'message': 'خطا در حذف محصول'
        }), 500


@shop_bp.route('/categories', methods=['GET'])
def get_categories():
    """Get all product categories"""
    try:
        categories = Product.get_categories()

        return jsonify({
            'success': True,
            'categories': categories
        }), 200

    except Exception as e:
        return jsonify({
            'success': False,
            'message': 'خطا در دریافت دسته‌بندی‌ها'
        }), 500


# ==================== ORDERS ====================

@shop_bp.route('/orders', methods=['POST'])
def create_order():
    """Create new order"""
    try:
        data = request.get_json()

        # Validation
        required_fields = ['customer_name', 'customer_email', 'items']
        for field in required_fields:
            if not data.get(field):
                return jsonify({
                    'success': False,
                    'message': f'فیلد {field} الزامی است'
                }), 400

        # Validate email
        if not validate_email(data['customer_email']):
            return jsonify({
                'success': False,
                'message': 'فرمت ایمیل نامعتبر است'
            }), 400

        # Validate items
        if not isinstance(data['items'], list) or len(data['items']) == 0:
            return jsonify({
                'success': False,
                'message': 'سبد خرید خالی است'
            }), 400

        # Create order
        result = Order.create(
            customer_name=data['customer_name'],
            customer_email=data['customer_email'],
            items=data['items'],
            customer_phone=data.get('customer_phone'),
            customer_address=data.get('customer_address'),
            payment_method=data.get('payment_method', 'cash'),
            notes=data.get('notes')
        )

        return jsonify({
            'success': True,
            'message': 'سفارش شما با موفقیت ثبت شد',
            'order': result
        }), 201

    except Exception as e:
        print(f"Error creating order: {str(e)}")
        return jsonify({
            'success': False,
            'message': 'خطا در ثبت سفارش. لطفا دوباره تلاش کنید'
        }), 500


@shop_bp.route('/orders', methods=['GET'])
def get_orders():
    """Get all orders (admin endpoint)"""
    try:
        limit = request.args.get('limit', 50, type=int)
        status = request.args.get('status')

        orders = Order.get_all(limit=limit, status=status)

        return jsonify({
            'success': True,
            'count': len(orders),
            'orders': orders
        }), 200

    except Exception as e:
        return jsonify({
            'success': False,
            'message': 'خطا در دریافت سفارشات'
        }), 500


@shop_bp.route('/orders/<int:order_id>', methods=['GET'])
def get_order(order_id):
    """Get order by ID"""
    try:
        order = Order.get_by_id(order_id)

        if not order:
            return jsonify({
                'success': False,
                'message': 'سفارش یافت نشد'
            }), 404

        return jsonify({
            'success': True,
            'order': order
        }), 200

    except Exception as e:
        return jsonify({
            'success': False,
            'message': 'خطا در دریافت سفارش'
        }), 500


@shop_bp.route('/orders/track/<order_number>', methods=['GET'])
def track_order(order_number):
    """Track order by order number"""
    try:
        order = Order.get_by_order_number(order_number)

        if not order:
            return jsonify({
                'success': False,
                'message': 'سفارش یافت نشد'
            }), 404

        return jsonify({
            'success': True,
            'order': order
        }), 200

    except Exception as e:
        return jsonify({
            'success': False,
            'message': 'خطا در پیگیری سفارش'
        }), 500


@shop_bp.route('/orders/<int:order_id>/status', methods=['PATCH'])
def update_order_status(order_id):
    """Update order status (admin endpoint)"""
    try:
        data = request.get_json()
        status = data.get('status')

        if not status:
            return jsonify({
                'success': False,
                'message': 'وضعیت الزامی است'
            }), 400

        success = Order.update_status(order_id, status)

        if not success:
            return jsonify({
                'success': False,
                'message': 'سفارش یافت نشد یا وضعیت نامعتبر است'
            }), 404

        return jsonify({
            'success': True,
            'message': 'وضعیت سفارش با موفقیت به‌روزرسانی شد'
        }), 200

    except Exception as e:
        return jsonify({
            'success': False,
            'message': 'خطا در به‌روزرسانی وضعیت'
        }), 500


# ==================== LEGACY INQUIRY ENDPOINT ====================

@shop_bp.route('/inquiry', methods=['POST'])
def submit_inquiry():
    """Handle shop product inquiry (legacy endpoint)"""
    try:
        data = request.get_json()

        # Validation
        required_fields = ['product_name', 'customer_name', 'customer_email']
        for field in required_fields:
            if not data.get(field):
                return jsonify({
                    'success': False,
                    'message': f'{field.replace("_", " ").capitalize()} الزامی است'
                }), 400

        # Validate email
        if not validate_email(data['customer_email']):
            return jsonify({
                'success': False,
                'message': 'فرمت ایمیل نامعتبر است'
            }), 400

        # Create order
        order_id = ShopOrder.create(
            product_name=data['product_name'],
            customer_name=data['customer_name'],
            customer_email=data['customer_email'],
            customer_phone=data.get('customer_phone'),
            quantity=data.get('quantity', 1),
            message=data.get('message')
        )

        return jsonify({
            'success': True,
            'message': 'درخواست شما با موفقیت ثبت شد! به زودی با شما تماس خواهیم گرفت',
            'order_id': order_id
        }), 201

    except Exception as e:
        return jsonify({
            'success': False,
            'message': 'خطا در ثبت درخواست. لطفا دوباره تلاش کنید'
        }), 500


# ==================== USER AUTHENTICATION ====================

@shop_bp.route('/auth/register', methods=['POST'])
def register():
    """Register new shop user"""
    try:
        data = request.get_json()

        # Validation
        required_fields = ['full_name', 'email', 'password']
        for field in required_fields:
            if not data.get(field):
                return jsonify({
                    'success': False,
                    'message': f'فیلد {field} الزامی است'
                }), 400

        # Validate email
        if not validate_email(data['email']):
            return jsonify({
                'success': False,
                'message': 'فرمت ایمیل نامعتبر است'
            }), 400

        # Check if user already exists
        existing_user = ShopUser.get_by_email(data['email'])
        if existing_user:
            return jsonify({
                'success': False,
                'message': 'این ایمیل قبلا ثبت شده است'
            }), 400

        # Create user
        user_id = ShopUser.create(
            full_name=data['full_name'],
            email=data['email'],
            password=data['password'],
            phone=data.get('phone'),
            address=data.get('address')
        )

        if not user_id:
            return jsonify({
                'success': False,
                'message': 'خطا در ثبت‌نام. لطفا دوباره تلاش کنید'
            }), 500

        # Create session
        session_token = ShopUser.create_session(user_id)

        return jsonify({
            'success': True,
            'message': 'ثبت‌نام با موفقیت انجام شد',
            'data': {
                'token': session_token,
                'user': {
                    'id': user_id,
                    'full_name': data['full_name'],
                    'email': data['email']
                }
            }
        }), 201

    except Exception as e:
        print(f"Error in register: {str(e)}")
        return jsonify({
            'success': False,
            'message': 'خطا در ثبت‌نام. لطفا دوباره تلاش کنید'
        }), 500


@shop_bp.route('/auth/login', methods=['POST'])
def login():
    """Login shop user"""
    try:
        data = request.get_json()

        # Validation
        if not data.get('email') or not data.get('password'):
            return jsonify({
                'success': False,
                'message': 'ایمیل و رمز عبور الزامی است'
            }), 400

        # Authenticate user
        user = ShopUser.authenticate(data['email'], data['password'])

        if not user:
            return jsonify({
                'success': False,
                'message': 'ایمیل یا رمز عبور اشتباه است'
            }), 401

        # Create session
        session_token = ShopUser.create_session(user['id'])

        return jsonify({
            'success': True,
            'message': 'ورود با موفقیت انجام شد',
            'data': {
                'token': session_token,
                'user': {
                    'id': user['id'],
                    'full_name': user['full_name'],
                    'email': user['email'],
                    'phone': user.get('phone'),
                    'address': user.get('address')
                }
            }
        }), 200

    except Exception as e:
        print(f"Error in login: {str(e)}")
        return jsonify({
            'success': False,
            'message': 'خطا در ورود. لطفا دوباره تلاش کنید'
        }), 500


@shop_bp.route('/auth/logout', methods=['POST'])
def logout():
    """Logout shop user"""
    try:
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({
                'success': False,
                'message': 'توکن احراز هویت یافت نشد'
            }), 401

        token = auth_header.split(' ')[1]
        ShopUser.logout(token)

        return jsonify({
            'success': True,
            'message': 'خروج با موفقیت انجام شد'
        }), 200

    except Exception as e:
        return jsonify({
            'success': False,
            'message': 'خطا در خروج'
        }), 500


@shop_bp.route('/auth/verify', methods=['GET'])
def verify_auth():
    """Verify user session"""
    try:
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({
                'success': False,
                'message': 'توکن احراز هویت یافت نشد'
            }), 401

        token = auth_header.split(' ')[1]
        user = ShopUser.verify_session(token)

        if not user:
            return jsonify({
                'success': False,
                'message': 'نشست منقضی شده است'
            }), 401

        return jsonify({
            'success': True,
            'data': {
                'user': {
                    'id': user['id'],
                    'full_name': user['full_name'],
                    'email': user['email'],
                    'phone': user.get('phone'),
                    'address': user.get('address')
                }
            }
        }), 200

    except Exception as e:
        return jsonify({
            'success': False,
            'message': 'خطا در احراز هویت'
        }), 500


@shop_bp.route('/auth/profile', methods=['PUT'])
def update_profile():
    """Update user profile"""
    try:
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({
                'success': False,
                'message': 'توکن احراز هویت یافت نشد'
            }), 401

        token = auth_header.split(' ')[1]
        user = ShopUser.verify_session(token)

        if not user:
            return jsonify({
                'success': False,
                'message': 'نشست منقضی شده است'
            }), 401

        data = request.get_json()
        success = ShopUser.update_profile(user['id'], **data)

        if success:
            return jsonify({
                'success': True,
                'message': 'پروفایل با موفقیت به‌روزرسانی شد'
            }), 200
        else:
            return jsonify({
                'success': False,
                'message': 'خطا در به‌روزرسانی پروفایل'
            }), 400

    except Exception as e:
        return jsonify({
            'success': False,
            'message': 'خطا در به‌روزرسانی پروفایل'
        }), 500


# ==================== SHOP PAGES ====================

@shop_bp.route('/pages/<page_key>', methods=['GET'])
def get_page(page_key):
    """Get shop page (Contact, About) by key"""
    try:
        page = ShopPage.get_by_key(page_key)

        if not page:
            return jsonify({
                'success': False,
                'message': 'صفحه یافت نشد'
            }), 404

        return jsonify({
            'success': True,
            'data': page
        }), 200

    except Exception as e:
        return jsonify({
            'success': False,
            'message': 'خطا در دریافت صفحه'
        }), 500


@shop_bp.route('/pages', methods=['GET'])
def get_all_pages():
    """Get all shop pages"""
    try:
        pages = ShopPage.get_all()

        return jsonify({
            'success': True,
            'data': pages
        }), 200

    except Exception as e:
        return jsonify({
            'success': False,
            'message': 'خطا در دریافت صفحات'
        }), 500
