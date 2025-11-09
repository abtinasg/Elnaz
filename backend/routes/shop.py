"""
Shop Routes
API endpoints for shop orders and inquiries
"""

from flask import Blueprint, request, jsonify
from backend.models import ShopOrder
import re

shop_bp = Blueprint('shop', __name__, url_prefix='/api/shop')

def validate_email(email):
    """Validate email format"""
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None

@shop_bp.route('/inquiry', methods=['POST'])
def submit_inquiry():
    """Handle shop product inquiry"""
    try:
        data = request.get_json()

        # Validation
        required_fields = ['product_name', 'customer_name', 'customer_email']
        for field in required_fields:
            if not data.get(field):
                return jsonify({
                    'success': False,
                    'message': f'{field.replace("_", " ").capitalize()} is required'
                }), 400

        # Validate email
        if not validate_email(data['customer_email']):
            return jsonify({
                'success': False,
                'message': 'Invalid email format'
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
            'message': 'Inquiry submitted successfully! We will contact you soon.',
            'order_id': order_id
        }), 201

    except Exception as e:
        return jsonify({
            'success': False,
            'message': 'An error occurred. Please try again later.'
        }), 500

@shop_bp.route('/orders', methods=['GET'])
def list_orders():
    """Get all shop orders (admin endpoint)"""
    try:
        limit = request.args.get('limit', 50, type=int)
        status = request.args.get('status')

        orders = ShopOrder.get_all(limit=limit, status=status)

        return jsonify({
            'success': True,
            'count': len(orders),
            'orders': orders
        }), 200

    except Exception as e:
        return jsonify({
            'success': False,
            'message': 'Failed to fetch orders'
        }), 500

@shop_bp.route('/orders/<int:order_id>', methods=['GET'])
def get_order(order_id):
    """Get specific order by ID"""
    try:
        order = ShopOrder.get_by_id(order_id)

        if not order:
            return jsonify({
                'success': False,
                'message': 'Order not found'
            }), 404

        return jsonify({
            'success': True,
            'order': order
        }), 200

    except Exception as e:
        return jsonify({
            'success': False,
            'message': 'Failed to fetch order'
        }), 500

@shop_bp.route('/orders/<int:order_id>/status', methods=['PATCH'])
def update_order_status(order_id):
    """Update order status (admin endpoint)"""
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
            'message': 'Status updated successfully'
        }), 200

    except Exception as e:
        return jsonify({
            'success': False,
            'message': 'Failed to update status'
        }), 500
