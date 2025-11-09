"""
Admin Routes
Authentication and dashboard management endpoints
"""

from flask import Blueprint, request, jsonify
from ..models import Admin, Contact, ShopOrder, Newsletter
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
