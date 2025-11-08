"""
Contact Form Routes
API endpoints for contact form submissions
"""

from flask import request, jsonify
from routes import contact_bp
from models import Contact
import re

def validate_email(email):
    """Validate email format"""
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None

@contact_bp.route('/submit', methods=['POST'])
def submit_contact():
    """Handle contact form submission"""
    try:
        data = request.get_json()

        # Validation
        required_fields = ['name', 'email', 'message']
        for field in required_fields:
            if not data.get(field):
                return jsonify({
                    'success': False,
                    'message': f'{field.capitalize()} is required'
                }), 400

        # Validate email
        if not validate_email(data['email']):
            return jsonify({
                'success': False,
                'message': 'Invalid email format'
            }), 400

        # Create contact submission
        contact_id = Contact.create(
            name=data['name'],
            email=data['email'],
            subject=data.get('subject', ''),
            message=data['message']
        )

        return jsonify({
            'success': True,
            'message': 'Message sent successfully! We will get back to you soon.',
            'contact_id': contact_id
        }), 201

    except Exception as e:
        return jsonify({
            'success': False,
            'message': 'An error occurred. Please try again later.'
        }), 500

@contact_bp.route('/list', methods=['GET'])
def list_contacts():
    """Get all contact submissions (admin endpoint)"""
    try:
        limit = request.args.get('limit', 50, type=int)
        status = request.args.get('status')

        contacts = Contact.get_all(limit=limit, status=status)

        return jsonify({
            'success': True,
            'count': len(contacts),
            'contacts': contacts
        }), 200

    except Exception as e:
        return jsonify({
            'success': False,
            'message': 'Failed to fetch contacts'
        }), 500

@contact_bp.route('/<int:contact_id>', methods=['GET'])
def get_contact(contact_id):
    """Get specific contact by ID"""
    try:
        contact = Contact.get_by_id(contact_id)

        if not contact:
            return jsonify({
                'success': False,
                'message': 'Contact not found'
            }), 404

        return jsonify({
            'success': True,
            'contact': contact
        }), 200

    except Exception as e:
        return jsonify({
            'success': False,
            'message': 'Failed to fetch contact'
        }), 500

@contact_bp.route('/<int:contact_id>/status', methods=['PATCH'])
def update_contact_status(contact_id):
    """Update contact status (admin endpoint)"""
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
            'message': 'Status updated successfully'
        }), 200

    except Exception as e:
        return jsonify({
            'success': False,
            'message': 'Failed to update status'
        }), 500
