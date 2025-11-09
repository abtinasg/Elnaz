"""
Admin Routes
Authentication and dashboard management endpoints
"""

from flask import Blueprint, request, jsonify
from ..models import Admin, Contact, ShopOrder, Newsletter, ShopPage, ShopUser
from ..auth_utils import require_auth

admin_bp = Blueprint('admin', __name__, url_prefix='/api/admin')


@admin_bp.route('/login', methods=['POST'])
def login():
    """Admin login"""
    try:
        data = request.get_json()
        username = data.get('username')
        password = data.get('password')

        if not username or not password:
            return jsonify({
                'success': False,
                'message': 'Username and password required'
            }), 400

        admin = Admin.authenticate(username, password)

        if not admin:
            return jsonify({
                'success': False,
                'message': 'Invalid credentials'
            }), 401

        # Create session
        session_token = Admin.create_session(admin['id'])

        return jsonify({
            'success': True,
            'message': 'Login successful',
            'data': {
                'token': session_token,
                'username': admin['username'],
                'email': admin['email']
            }
        }), 200

    except Exception as e:
        return jsonify({
            'success': False,
            'message': str(e)
        }), 500


@admin_bp.route('/logout', methods=['POST'])
@require_auth
def logout():
    """Admin logout"""
    try:
        auth_header = request.headers.get('Authorization')
        token = auth_header.split(' ')[1]
        Admin.logout(token)

        return jsonify({
            'success': True,
            'message': 'Logout successful'
        }), 200

    except Exception as e:
        return jsonify({
            'success': False,
            'message': str(e)
        }), 500


@admin_bp.route('/verify', methods=['GET'])
@require_auth
def verify():
    """Verify session"""
    return jsonify({
        'success': True,
        'message': 'Session valid',
        'data': {
            'username': request.admin['username'],
            'email': request.admin['email']
        }
    }), 200


@admin_bp.route('/stats', methods=['GET'])
@require_auth
def get_stats():
    """Get dashboard statistics"""
    try:
        stats = Admin.get_stats()
        return jsonify({
            'success': True,
            'data': stats
        }), 200

    except Exception as e:
        return jsonify({
            'success': False,
            'message': str(e)
        }), 500


# Contact Management
@admin_bp.route('/contacts', methods=['GET'])
@require_auth
def get_contacts():
    """Get all contacts"""
    try:
        limit = request.args.get('limit', 50, type=int)
        status = request.args.get('status')
        contacts = Contact.get_all(limit=limit, status=status)

        return jsonify({
            'success': True,
            'data': contacts
        }), 200

    except Exception as e:
        return jsonify({
            'success': False,
            'message': str(e)
        }), 500


@admin_bp.route('/contacts/<int:contact_id>', methods=['GET'])
@require_auth
def get_contact(contact_id):
    """Get contact by ID"""
    try:
        contact = Contact.get_by_id(contact_id)
        if not contact:
            return jsonify({
                'success': False,
                'message': 'Contact not found'
            }), 404

        return jsonify({
            'success': True,
            'data': contact
        }), 200

    except Exception as e:
        return jsonify({
            'success': False,
            'message': str(e)
        }), 500


@admin_bp.route('/contacts/<int:contact_id>/status', methods=['PATCH'])
@require_auth
def update_contact_status(contact_id):
    """Update contact status"""
    try:
        data = request.get_json()
        status = data.get('status')

        if not status or status not in ['unread', 'read', 'replied']:
            return jsonify({
                'success': False,
                'message': 'Invalid status'
            }), 400

        success = Contact.update_status(contact_id, status)

        if not success:
            return jsonify({
                'success': False,
                'message': 'Contact not found'
            }), 404

        return jsonify({
            'success': True,
            'message': 'Status updated'
        }), 200

    except Exception as e:
        return jsonify({
            'success': False,
            'message': str(e)
        }), 500


# Shop Order Management
@admin_bp.route('/orders', methods=['GET'])
@require_auth
def get_orders():
    """Get all orders"""
    try:
        limit = request.args.get('limit', 50, type=int)
        status = request.args.get('status')
        orders = ShopOrder.get_all(limit=limit, status=status)

        return jsonify({
            'success': True,
            'data': orders
        }), 200

    except Exception as e:
        return jsonify({
            'success': False,
            'message': str(e)
        }), 500


@admin_bp.route('/orders/<int:order_id>', methods=['GET'])
@require_auth
def get_order(order_id):
    """Get order by ID"""
    try:
        order = ShopOrder.get_by_id(order_id)
        if not order:
            return jsonify({
                'success': False,
                'message': 'Order not found'
            }), 404

        return jsonify({
            'success': True,
            'data': order
        }), 200

    except Exception as e:
        return jsonify({
            'success': False,
            'message': str(e)
        }), 500


@admin_bp.route('/orders/<int:order_id>/status', methods=['PATCH'])
@require_auth
def update_order_status(order_id):
    """Update order status"""
    try:
        data = request.get_json()
        status = data.get('status')

        if not status or status not in ['pending', 'processing', 'completed', 'cancelled']:
            return jsonify({
                'success': False,
                'message': 'Invalid status'
            }), 400

        success = ShopOrder.update_status(order_id, status)

        if not success:
            return jsonify({
                'success': False,
                'message': 'Order not found'
            }), 404

        return jsonify({
            'success': True,
            'message': 'Status updated'
        }), 200

    except Exception as e:
        return jsonify({
            'success': False,
            'message': str(e)
        }), 500


# Newsletter Management
@admin_bp.route('/subscribers', methods=['GET'])
@require_auth
def get_subscribers():
    """Get all newsletter subscribers"""
    try:
        active_only = request.args.get('active_only', 'true').lower() == 'true'
        subscribers = Newsletter.get_all(active_only=active_only)

        return jsonify({
            'success': True,
            'data': subscribers
        }), 200

    except Exception as e:
        return jsonify({
            'success': False,
            'message': str(e)
        }), 500


# Shop Pages Management
@admin_bp.route('/shop-pages', methods=['GET'])
@require_auth
def get_shop_pages():
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
            'message': str(e)
        }), 500


@admin_bp.route('/shop-pages/<page_key>', methods=['GET'])
@require_auth
def get_shop_page(page_key):
    """Get shop page by key"""
    try:
        page = ShopPage.get_by_key(page_key)
        if not page:
            return jsonify({
                'success': False,
                'message': 'Page not found'
            }), 404

        return jsonify({
            'success': True,
            'data': page
        }), 200

    except Exception as e:
        return jsonify({
            'success': False,
            'message': str(e)
        }), 500


@admin_bp.route('/shop-pages', methods=['POST'])
@require_auth
def create_or_update_shop_page():
    """Create or update shop page"""
    try:
        data = request.get_json()

        if not data.get('page_key') or not data.get('title_fa') or not data.get('content_fa'):
            return jsonify({
                'success': False,
                'message': 'page_key, title_fa, and content_fa are required'
            }), 400

        admin_id = request.admin['id']
        page_id = ShopPage.create_or_update(
            page_key=data['page_key'],
            title_fa=data['title_fa'],
            content_fa=data['content_fa'],
            updated_by=admin_id
        )

        return jsonify({
            'success': True,
            'message': 'Page updated successfully',
            'page_id': page_id
        }), 200

    except Exception as e:
        return jsonify({
            'success': False,
            'message': str(e)
        }), 500


@admin_bp.route('/shop-pages/<page_key>', methods=['DELETE'])
@require_auth
def delete_shop_page(page_key):
    """Delete shop page"""
    try:
        success = ShopPage.delete(page_key)

        if not success:
            return jsonify({
                'success': False,
                'message': 'Page not found'
            }), 404

        return jsonify({
            'success': True,
            'message': 'Page deleted successfully'
        }), 200

    except Exception as e:
        return jsonify({
            'success': False,
            'message': str(e)
        }), 500
