"""
CMS Routes
Content Management System API endpoints
"""

from flask import Blueprint, request, jsonify
from backend.database import get_db
from backend.routes.admin import require_auth
from datetime import datetime

cms_bp = Blueprint('cms', __name__, url_prefix='/api/cms')

@cms_bp.route('/content', methods=['GET'])
def get_content():
    """Get all site content or filter by section"""
    try:
        section = request.args.get('section')

        with get_db() as conn:
            cursor = conn.cursor()
            if section:
                cursor.execute('''
                    SELECT id, section, content_key, content_value, content_type, updated_at
                    FROM site_content
                    WHERE section = ?
                    ORDER BY content_key
                ''', (section,))
            else:
                cursor.execute('''
                    SELECT id, section, content_key, content_value, content_type, updated_at
                    FROM site_content
                    ORDER BY section, content_key
                ''')

            content_items = []
            for row in cursor.fetchall():
                content_items.append({
                    'id': row['id'],
                    'section': row['section'],
                    'key': row['content_key'],
                    'value': row['content_value'],
                    'type': row['content_type'],
                    'updated_at': row['updated_at']
                })

        return jsonify({'content': content_items})

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@cms_bp.route('/content/<int:content_id>', methods=['GET'])
def get_content_item(content_id):
    """Get specific content item"""
    try:
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute('''
                SELECT id, section, content_key, content_value, content_type, updated_at
                FROM site_content
                WHERE id = ?
            ''', (content_id,))

            row = cursor.fetchone()
            if not row:
                return jsonify({'error': 'Content not found'}), 404

            content = {
                'id': row['id'],
                'section': row['section'],
                'key': row['content_key'],
                'value': row['content_value'],
                'type': row['content_type'],
                'updated_at': row['updated_at']
            }

        return jsonify(content)

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@cms_bp.route('/content', methods=['POST'])
@require_auth
def create_content():
    """Create new content item"""
    try:
        data = request.get_json()
        section = data.get('section')
        content_key = data.get('key')
        content_value = data.get('value')
        content_type = data.get('type', 'text')
        admin_id = request.admin_id

        if not all([section, content_key, content_value]):
            return jsonify({'error': 'Section, key, and value are required'}), 400

        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute('''
                INSERT INTO site_content (section, content_key, content_value, content_type, updated_by)
                VALUES (?, ?, ?, ?, ?)
            ''', (section, content_key, content_value, content_type, admin_id))

            content_id = cursor.lastrowid

        return jsonify({
            'message': 'Content created successfully',
            'id': content_id
        }), 201

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@cms_bp.route('/content/<int:content_id>', methods=['PUT', 'PATCH'])
@require_auth
def update_content(content_id):
    """Update existing content item"""
    try:
        data = request.get_json()
        content_value = data.get('value')
        content_type = data.get('type')
        admin_id = request.admin_id

        if not content_value:
            return jsonify({'error': 'Value is required'}), 400

        with get_db() as conn:
            cursor = conn.cursor()

            if content_type:
                cursor.execute('''
                    UPDATE site_content
                    SET content_value = ?, content_type = ?, updated_at = CURRENT_TIMESTAMP, updated_by = ?
                    WHERE id = ?
                ''', (content_value, content_type, admin_id, content_id))
            else:
                cursor.execute('''
                    UPDATE site_content
                    SET content_value = ?, updated_at = CURRENT_TIMESTAMP, updated_by = ?
                    WHERE id = ?
                ''', (content_value, admin_id, content_id))

            if cursor.rowcount == 0:
                return jsonify({'error': 'Content not found'}), 404

        return jsonify({'message': 'Content updated successfully'})

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@cms_bp.route('/content/<int:content_id>', methods=['DELETE'])
@require_auth
def delete_content(content_id):
    """Delete content item"""
    try:
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute('DELETE FROM site_content WHERE id = ?', (content_id,))

            if cursor.rowcount == 0:
                return jsonify({'error': 'Content not found'}), 404

        return jsonify({'message': 'Content deleted successfully'})

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@cms_bp.route('/sections', methods=['GET'])
def get_sections():
    """Get all content sections"""
    try:
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute('''
                SELECT DISTINCT section, COUNT(*) as item_count
                FROM site_content
                GROUP BY section
                ORDER BY section
            ''')

            sections = []
            for row in cursor.fetchall():
                sections.append({
                    'section': row['section'],
                    'item_count': row['item_count']
                })

        return jsonify({'sections': sections})

    except Exception as e:
        return jsonify({'error': str(e)}), 500
