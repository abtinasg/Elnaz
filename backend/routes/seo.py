"""
SEO Routes
SEO management API endpoints
"""

from flask import Blueprint, request, jsonify
from backend.database import get_db
from backend.routes.admin import require_auth

seo_bp = Blueprint('seo', __name__, url_prefix='/api/seo')

@seo_bp.route('/settings', methods=['GET'])
def get_all_seo_settings():
    """Get SEO settings for all pages"""
    try:
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute('''
                SELECT id, page, title, description, keywords, og_image, updated_at
                FROM seo_settings
                ORDER BY page
            ''')

            settings = []
            for row in cursor.fetchall():
                settings.append({
                    'id': row['id'],
                    'page': row['page'],
                    'title': row['title'],
                    'description': row['description'],
                    'keywords': row['keywords'],
                    'og_image': row['og_image'],
                    'updated_at': row['updated_at']
                })

        return jsonify({'settings': settings})

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@seo_bp.route('/settings/<page>', methods=['GET'])
def get_seo_settings(page):
    """Get SEO settings for a specific page"""
    try:
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute('''
                SELECT id, page, title, description, keywords, og_image, updated_at
                FROM seo_settings
                WHERE page = ?
            ''', (page,))

            row = cursor.fetchone()
            if not row:
                return jsonify({'error': 'SEO settings not found for this page'}), 404

            settings = {
                'id': row['id'],
                'page': row['page'],
                'title': row['title'],
                'description': row['description'],
                'keywords': row['keywords'],
                'og_image': row['og_image'],
                'updated_at': row['updated_at']
            }

        return jsonify(settings)

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@seo_bp.route('/settings', methods=['POST'])
@require_auth
def create_seo_settings():
    """Create SEO settings for a page"""
    try:
        data = request.get_json()
        page = data.get('page')
        title = data.get('title')
        description = data.get('description')
        keywords = data.get('keywords')
        og_image = data.get('og_image')

        if not page:
            return jsonify({'error': 'Page is required'}), 400

        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute('''
                INSERT INTO seo_settings (page, title, description, keywords, og_image)
                VALUES (?, ?, ?, ?, ?)
            ''', (page, title, description, keywords, og_image))

            setting_id = cursor.lastrowid

        return jsonify({
            'message': 'SEO settings created successfully',
            'id': setting_id
        }), 201

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@seo_bp.route('/settings/<int:setting_id>', methods=['PUT', 'PATCH'])
@require_auth
def update_seo_settings(setting_id):
    """Update SEO settings"""
    try:
        data = request.get_json()
        title = data.get('title')
        description = data.get('description')
        keywords = data.get('keywords')
        og_image = data.get('og_image')

        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute('''
                UPDATE seo_settings
                SET title = COALESCE(?, title),
                    description = COALESCE(?, description),
                    keywords = COALESCE(?, keywords),
                    og_image = COALESCE(?, og_image),
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
            ''', (title, description, keywords, og_image, setting_id))

            if cursor.rowcount == 0:
                return jsonify({'error': 'SEO settings not found'}), 404

        return jsonify({'message': 'SEO settings updated successfully'})

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@seo_bp.route('/settings/<int:setting_id>', methods=['DELETE'])
@require_auth
def delete_seo_settings(setting_id):
    """Delete SEO settings"""
    try:
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute('DELETE FROM seo_settings WHERE id = ?', (setting_id,))

            if cursor.rowcount == 0:
                return jsonify({'error': 'SEO settings not found'}), 404

        return jsonify({'message': 'SEO settings deleted successfully'})

    except Exception as e:
        return jsonify({'error': str(e)}), 500
