"""
Newsletter Routes
API endpoints for newsletter subscriptions
"""

from flask import Blueprint, request, jsonify
from backend.models import Newsletter
import re

newsletter_bp = Blueprint('newsletter', __name__, url_prefix='/api/newsletter')

def validate_email(email):
    """Validate email format"""
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None

@newsletter_bp.route('/subscribe', methods=['POST'])
def subscribe():
    """Subscribe to newsletter"""
    try:
        data = request.get_json()
        email = data.get('email')

        if not email:
            return jsonify({
                'success': False,
                'message': 'Email is required'
            }), 400

        # Validate email
        if not validate_email(email):
            return jsonify({
                'success': False,
                'message': 'Invalid email format'
            }), 400

        # Subscribe
        subscriber_id = Newsletter.subscribe(email)

        if subscriber_id is None:
            return jsonify({
                'success': False,
                'message': 'This email is already subscribed'
            }), 409

        return jsonify({
            'success': True,
            'message': 'Successfully subscribed to newsletter!'
        }), 201

    except Exception as e:
        return jsonify({
            'success': False,
            'message': 'An error occurred. Please try again later.'
        }), 500

@newsletter_bp.route('/unsubscribe', methods=['POST'])
def unsubscribe():
    """Unsubscribe from newsletter"""
    try:
        data = request.get_json()
        email = data.get('email')

        if not email:
            return jsonify({
                'success': False,
                'message': 'Email is required'
            }), 400

        success = Newsletter.unsubscribe(email)

        if not success:
            return jsonify({
                'success': False,
                'message': 'Email not found'
            }), 404

        return jsonify({
            'success': True,
            'message': 'Successfully unsubscribed'
        }), 200

    except Exception as e:
        return jsonify({
            'success': False,
            'message': 'An error occurred. Please try again later.'
        }), 500

@newsletter_bp.route('/subscribers', methods=['GET'])
def list_subscribers():
    """Get all newsletter subscribers (admin endpoint)"""
    try:
        active_only = request.args.get('active', 'true').lower() == 'true'
        subscribers = Newsletter.get_all(active_only=active_only)

        return jsonify({
            'success': True,
            'count': len(subscribers),
            'subscribers': subscribers
        }), 200

    except Exception as e:
        return jsonify({
            'success': False,
            'message': 'Failed to fetch subscribers'
        }), 500
