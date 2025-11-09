"""
Shop Routes
API endpoints for products, cart, and orders
Persian language support with complete e-commerce functionality
"""

from flask import Blueprint, request, jsonify
from ..models import Product, Order, ShopOrder, ShopUser, ShopPage, Coupon, Inventory, ProductAttribute, ProductReview
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


# ==================== PRODUCT REVIEWS ====================

@shop_bp.route('/products/<int:product_id>/reviews', methods=['GET'])
def get_product_reviews(product_id):
    """Get all reviews for a product"""
    try:
        # Check if product exists
        product = Product.get_by_id(product_id)
        if not product:
            return jsonify({
                'success': False,
                'message': 'محصول یافت نشد'
            }), 404

        # Get reviews
        reviews = ProductReview.get_by_product(product_id, approved_only=True)

        # Get average rating
        rating_info = ProductReview.get_average_rating(product_id)

        return jsonify({
            'success': True,
            'reviews': reviews,
            'average_rating': rating_info['average_rating'],
            'review_count': rating_info['review_count']
        }), 200

    except Exception as e:
        return jsonify({
            'success': False,
            'message': 'خطا در دریافت نظرات'
        }), 500


@shop_bp.route('/products/<int:product_id>/reviews', methods=['POST'])
def create_product_review(product_id):
    """Create a new review for a product"""
    try:
        data = request.get_json()

        # Validation
        required_fields = ['customer_name', 'rating']
        for field in required_fields:
            if not data.get(field):
                return jsonify({
                    'success': False,
                    'message': f'فیلد {field} الزامی است'
                }), 400

        # Validate rating
        rating = int(data['rating'])
        if rating < 1 or rating > 5:
            return jsonify({
                'success': False,
                'message': 'امتیاز باید بین ۱ تا ۵ باشد'
            }), 400

        # Check if product exists
        product = Product.get_by_id(product_id)
        if not product:
            return jsonify({
                'success': False,
                'message': 'محصول یافت نشد'
            }), 404

        # Create review
        review_id = ProductReview.create(
            product_id=product_id,
            customer_name=data['customer_name'],
            rating=rating,
            review_text=data.get('review_text'),
            user_id=data.get('user_id')
        )

        return jsonify({
            'success': True,
            'message': 'نظر شما با موفقیت ثبت شد و پس از تایید نمایش داده خواهد شد',
            'review_id': review_id
        }), 201

    except Exception as e:
        return jsonify({
            'success': False,
            'message': 'خطا در ثبت نظر'
        }), 500


@shop_bp.route('/reviews/<int:review_id>/approve', methods=['PUT'])
def approve_review(review_id):
    """Approve a review (admin endpoint)"""
    try:
        success = ProductReview.approve(review_id)

        if not success:
            return jsonify({
                'success': False,
                'message': 'نظر یافت نشد'
            }), 404

        return jsonify({
            'success': True,
            'message': 'نظر با موفقیت تایید شد'
        }), 200

    except Exception as e:
        return jsonify({
            'success': False,
            'message': 'خطا در تایید نظر'
        }), 500


@shop_bp.route('/reviews/<int:review_id>', methods=['DELETE'])
def delete_review(review_id):
    """Delete a review (admin endpoint)"""
    try:
        success = ProductReview.delete(review_id)

        if not success:
            return jsonify({
                'success': False,
                'message': 'نظر یافت نشد'
            }), 404

        return jsonify({
            'success': True,
            'message': 'نظر با موفقیت حذف شد'
        }), 200

    except Exception as e:
        return jsonify({
            'success': False,
            'message': 'خطا در حذف نظر'
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


# ==================== COUPONS ====================

@shop_bp.route('/coupons', methods=['POST'])
def create_coupon():
    """Create new coupon (admin endpoint)"""
    try:
        data = request.get_json()

        # Validation
        required_fields = ['code', 'discount_type', 'discount_value']
        for field in required_fields:
            if not data.get(field):
                return jsonify({
                    'success': False,
                    'message': f'فیلد {field} الزامی است'
                }), 400

        coupon_id = Coupon.create(
            code=data['code'],
            discount_type=data['discount_type'],
            discount_value=float(data['discount_value']),
            description_fa=data.get('description_fa'),
            min_purchase=data.get('min_purchase', 0),
            max_discount=data.get('max_discount'),
            usage_limit=data.get('usage_limit'),
            valid_from=data.get('valid_from'),
            valid_until=data.get('valid_until')
        )

        if not coupon_id:
            return jsonify({
                'success': False,
                'message': 'کد تخفیف تکراری است'
            }), 400

        return jsonify({
            'success': True,
            'message': 'کد تخفیف با موفقیت ایجاد شد',
            'coupon_id': coupon_id
        }), 201

    except Exception as e:
        return jsonify({
            'success': False,
            'message': 'خطا در ایجاد کد تخفیف'
        }), 500


@shop_bp.route('/coupons', methods=['GET'])
def get_coupons():
    """Get all coupons (admin endpoint)"""
    try:
        active_only = request.args.get('active', 'true').lower() == 'true'
        coupons = Coupon.get_all(active_only=active_only)

        return jsonify({
            'success': True,
            'count': len(coupons),
            'coupons': coupons
        }), 200

    except Exception as e:
        return jsonify({
            'success': False,
            'message': 'خطا در دریافت کدهای تخفیف'
        }), 500


@shop_bp.route('/coupons/validate', methods=['POST'])
def validate_coupon():
    """Validate coupon code"""
    try:
        data = request.get_json()
        code = data.get('code')
        amount = data.get('amount')

        if not code or not amount:
            return jsonify({
                'success': False,
                'message': 'کد تخفیف و مبلغ الزامی است'
            }), 400

        result = Coupon.validate(code, float(amount))

        return jsonify({
            'success': result.get('valid', False),
            'data': result
        }), 200

    except Exception as e:
        return jsonify({
            'success': False,
            'message': 'خطا در اعتبارسنجی کد تخفیف'
        }), 500


@shop_bp.route('/coupons/<int:coupon_id>', methods=['PUT'])
def update_coupon(coupon_id):
    """Update coupon (admin endpoint)"""
    try:
        data = request.get_json()
        success = Coupon.update(coupon_id, **data)

        if not success:
            return jsonify({
                'success': False,
                'message': 'کد تخفیف یافت نشد'
            }), 404

        return jsonify({
            'success': True,
            'message': 'کد تخفیف با موفقیت به‌روزرسانی شد'
        }), 200

    except Exception as e:
        return jsonify({
            'success': False,
            'message': 'خطا در به‌روزرسانی کد تخفیف'
        }), 500


@shop_bp.route('/coupons/<int:coupon_id>', methods=['DELETE'])
def delete_coupon(coupon_id):
    """Delete/deactivate coupon (admin endpoint)"""
    try:
        success = Coupon.delete(coupon_id)

        if not success:
            return jsonify({
                'success': False,
                'message': 'کد تخفیف یافت نشد'
            }), 404

        return jsonify({
            'success': True,
            'message': 'کد تخفیف با موفقیت غیرفعال شد'
        }), 200

    except Exception as e:
        return jsonify({
            'success': False,
            'message': 'خطا در حذف کد تخفیف'
        }), 500


# ==================== INVENTORY ====================

@shop_bp.route('/inventory/report', methods=['GET'])
def get_inventory_report():
    """Get inventory report (admin endpoint)"""
    try:
        report = Inventory.get_inventory_report()

        return jsonify({
            'success': True,
            'data': report
        }), 200

    except Exception as e:
        return jsonify({
            'success': False,
            'message': 'خطا در دریافت گزارش انبار'
        }), 500


@shop_bp.route('/inventory/low-stock', methods=['GET'])
def get_low_stock():
    """Get low stock products (admin endpoint)"""
    try:
        threshold = request.args.get('threshold', 10, type=int)
        products = Inventory.get_low_stock_products(threshold)

        return jsonify({
            'success': True,
            'count': len(products),
            'products': products
        }), 200

    except Exception as e:
        return jsonify({
            'success': False,
            'message': 'خطا در دریافت محصولات کم موجودی'
        }), 500


@shop_bp.route('/inventory/history/<int:product_id>', methods=['GET'])
def get_inventory_history(product_id):
    """Get inventory history for a product (admin endpoint)"""
    try:
        limit = request.args.get('limit', 50, type=int)
        history = Inventory.get_product_history(product_id, limit)

        return jsonify({
            'success': True,
            'count': len(history),
            'history': history
        }), 200

    except Exception as e:
        return jsonify({
            'success': False,
            'message': 'خطا در دریافت تاریخچه موجودی'
        }), 500


@shop_bp.route('/inventory/adjust', methods=['POST'])
def adjust_inventory():
    """Adjust product inventory (admin endpoint)"""
    try:
        data = request.get_json()

        # Validation
        if 'product_id' not in data or 'quantity' not in data:
            return jsonify({
                'success': False,
                'message': 'شناسه محصول و تعداد الزامی است'
            }), 400

        success = Inventory.adjust_stock(
            product_id=data['product_id'],
            new_quantity=data['quantity'],
            notes=data.get('notes'),
            created_by=data.get('created_by')
        )

        if not success:
            return jsonify({
                'success': False,
                'message': 'محصول یافت نشد'
            }), 404

        return jsonify({
            'success': True,
            'message': 'موجودی با موفقیت تنظیم شد'
        }), 200

    except Exception as e:
        return jsonify({
            'success': False,
            'message': 'خطا در تنظیم موجودی'
        }), 500


# ==================== PRODUCT ATTRIBUTES ====================

@shop_bp.route('/products/<int:product_id>/attributes', methods=['GET'])
def get_product_attributes(product_id):
    """Get all attributes for a product"""
    try:
        attributes = ProductAttribute.get_by_product(product_id)

        return jsonify({
            'success': True,
            'count': len(attributes),
            'attributes': attributes
        }), 200

    except Exception as e:
        return jsonify({
            'success': False,
            'message': 'خطا در دریافت ویژگی‌ها'
        }), 500


@shop_bp.route('/products/<int:product_id>/attributes', methods=['POST'])
def create_product_attribute(product_id):
    """Create product attribute (admin endpoint)"""
    try:
        data = request.get_json()

        # Validation
        required_fields = ['attribute_name_fa', 'attribute_value_fa']
        for field in required_fields:
            if not data.get(field):
                return jsonify({
                    'success': False,
                    'message': f'فیلد {field} الزامی است'
                }), 400

        attribute_id = ProductAttribute.create(
            product_id=product_id,
            attribute_name_fa=data['attribute_name_fa'],
            attribute_value_fa=data['attribute_value_fa'],
            price_adjustment=data.get('price_adjustment', 0),
            stock_quantity=data.get('stock_quantity', 0),
            sku=data.get('sku')
        )

        return jsonify({
            'success': True,
            'message': 'ویژگی محصول با موفقیت ایجاد شد',
            'attribute_id': attribute_id
        }), 201

    except Exception as e:
        return jsonify({
            'success': False,
            'message': 'خطا در ایجاد ویژگی'
        }), 500


@shop_bp.route('/attributes/<int:attribute_id>', methods=['PUT'])
def update_product_attribute(attribute_id):
    """Update product attribute (admin endpoint)"""
    try:
        data = request.get_json()
        success = ProductAttribute.update(attribute_id, **data)

        if not success:
            return jsonify({
                'success': False,
                'message': 'ویژگی یافت نشد'
            }), 404

        return jsonify({
            'success': True,
            'message': 'ویژگی با موفقیت به‌روزرسانی شد'
        }), 200

    except Exception as e:
        return jsonify({
            'success': False,
            'message': 'خطا در به‌روزرسانی ویژگی'
        }), 500


@shop_bp.route('/attributes/<int:attribute_id>', methods=['DELETE'])
def delete_product_attribute(attribute_id):
    """Delete product attribute (admin endpoint)"""
    try:
        success = ProductAttribute.delete(attribute_id)

        if not success:
            return jsonify({
                'success': False,
                'message': 'ویژگی یافت نشد'
            }), 404

        return jsonify({
            'success': True,
            'message': 'ویژگی با موفقیت حذف شد'
        }), 200

    except Exception as e:
        return jsonify({
            'success': False,
            'message': 'خطا در حذف ویژگی'
        }), 500


# ==================== SALES REPORTS ====================

@shop_bp.route('/reports/sales', methods=['GET'])
def get_sales_report():
    """Get sales report (admin endpoint)"""
    try:
        from ..database import get_db
        from datetime import datetime, timedelta

        period = request.args.get('period', '30')  # days
        start_date = request.args.get('start_date')
        end_date = request.args.get('end_date')

        with get_db() as conn:
            cursor = conn.cursor()

            # Build query based on date range
            if start_date and end_date:
                date_filter = f"created_at BETWEEN '{start_date}' AND '{end_date}'"
            else:
                days_ago = datetime.now() - timedelta(days=int(period))
                date_filter = f"created_at >= '{days_ago.isoformat()}'"

            # Total sales
            cursor.execute(f'''
                SELECT COUNT(*) as total_orders, SUM(total_amount) as total_revenue
                FROM orders
                WHERE {date_filter}
            ''')
            sales_data = cursor.fetchone()

            # Sales by status
            cursor.execute(f'''
                SELECT status, COUNT(*) as count, SUM(total_amount) as revenue
                FROM orders
                WHERE {date_filter}
                GROUP BY status
            ''')
            status_breakdown = [{'status': row[0], 'count': row[1], 'revenue': row[2]}
                              for row in cursor.fetchall()]

            # Top selling products
            cursor.execute(f'''
                SELECT oi.product_name, SUM(oi.quantity) as total_sold,
                       SUM(oi.quantity * oi.price) as total_revenue
                FROM order_items oi
                JOIN orders o ON oi.order_id = o.id
                WHERE o.{date_filter}
                GROUP BY oi.product_name
                ORDER BY total_sold DESC
                LIMIT 10
            ''')
            top_products = [{'name': row[0], 'sold': row[1], 'revenue': row[2]}
                          for row in cursor.fetchall()]

            # Daily sales trend
            cursor.execute(f'''
                SELECT DATE(created_at) as date, COUNT(*) as orders, SUM(total_amount) as revenue
                FROM orders
                WHERE {date_filter}
                GROUP BY DATE(created_at)
                ORDER BY date DESC
                LIMIT 30
            ''')
            daily_trend = [{'date': row[0], 'orders': row[1], 'revenue': row[2]}
                         for row in cursor.fetchall()]

            return jsonify({
                'success': True,
                'data': {
                    'summary': {
                        'total_orders': sales_data[0] or 0,
                        'total_revenue': sales_data[1] or 0
                    },
                    'status_breakdown': status_breakdown,
                    'top_products': top_products,
                    'daily_trend': daily_trend
                }
            }), 200

    except Exception as e:
        print(f"Error in sales report: {str(e)}")
        return jsonify({
            'success': False,
            'message': 'خطا در دریافت گزارش فروش'
        }), 500


@shop_bp.route('/reports/customers', methods=['GET'])
def get_customer_report():
    """Get customer report (admin endpoint)"""
    try:
        from ..database import get_db

        with get_db() as conn:
            cursor = conn.cursor()

            # Total customers
            cursor.execute('SELECT COUNT(*) FROM shop_users WHERE is_active = 1')
            total_customers = cursor.fetchone()[0]

            # New customers this month
            cursor.execute('''
                SELECT COUNT(*) FROM shop_users
                WHERE is_active = 1 AND created_at >= date('now', 'start of month')
            ''')
            new_customers = cursor.fetchone()[0]

            # Top customers by order count
            cursor.execute('''
                SELECT o.customer_name, o.customer_email,
                       COUNT(*) as order_count, SUM(o.total_amount) as total_spent
                FROM orders o
                GROUP BY o.customer_email
                ORDER BY order_count DESC
                LIMIT 10
            ''')
            top_customers = [{'name': row[0], 'email': row[1],
                            'orders': row[2], 'spent': row[3]}
                           for row in cursor.fetchall()]

            return jsonify({
                'success': True,
                'data': {
                    'total_customers': total_customers,
                    'new_customers_this_month': new_customers,
                    'top_customers': top_customers
                }
            }), 200

    except Exception as e:
        return jsonify({
            'success': False,
            'message': 'خطا در دریافت گزارش مشتریان'
        }), 500
