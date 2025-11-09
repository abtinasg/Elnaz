"""
AI Routes
API endpoints for AI-powered features
"""

from flask import Blueprint, request, jsonify
from backend.ai_service import ai_service
from backend.database import get_db
from backend.auth_utils import require_auth
from datetime import datetime

ai_bp = Blueprint('ai', __name__, url_prefix='/api/ai')

@ai_bp.route('/chat', methods=['POST'])
@require_auth
def chat():
    """Chat with AI assistant"""
    try:
        data = request.get_json()
        message = data.get('message')
        conversation_history = data.get('history', [])
        admin_id = request.admin['id']

        if not message:
            return jsonify({'error': 'Message is required'}), 400

        # Get AI response
        response = ai_service.chat(message, conversation_history)

        if 'error' in response and response['error']:
            return jsonify({'error': response['error']}), 500

        # Save conversation to database
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute('''
                INSERT INTO ai_conversations (admin_id, message, response, model, tokens_used)
                VALUES (?, ?, ?, ?, ?)
            ''', (admin_id, message, response['text'], response['model'], response.get('tokens_used', 0)))

        return jsonify({
            'response': response['text'],
            'tokens_used': response.get('tokens_used', 0),
            'model': response['model']
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@ai_bp.route('/seo-suggestions', methods=['POST'])
@require_auth
def seo_suggestions():
    """Generate SEO suggestions"""
    try:
        data = request.get_json()
        page_content = data.get('content', '')
        current_seo = data.get('current_seo', {})

        response = ai_service.generate_seo_suggestions(page_content, current_seo)

        if 'error' in response and response['error']:
            return jsonify({'error': response['error']}), 500

        return jsonify({
            'suggestions': response['text'],
            'tokens_used': response.get('tokens_used', 0)
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@ai_bp.route('/marketing-insights', methods=['POST'])
@require_auth
def marketing_insights():
    """Generate marketing insights"""
    try:
        data = request.get_json()
        analytics_data = data.get('analytics', {})

        response = ai_service.generate_marketing_insights(analytics_data)

        if 'error' in response and response['error']:
            return jsonify({'error': response['error']}), 500

        return jsonify({
            'insights': response['text'],
            'tokens_used': response.get('tokens_used', 0)
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@ai_bp.route('/content-improvement', methods=['POST'])
@require_auth
def content_improvement():
    """Suggest content improvements"""
    try:
        data = request.get_json()
        content = data.get('content', '')
        content_type = data.get('type', 'general')

        response = ai_service.suggest_content_improvements(content, content_type)

        if 'error' in response and response['error']:
            return jsonify({'error': response['error']}), 500

        return jsonify({
            'suggestions': response['text'],
            'tokens_used': response.get('tokens_used', 0)
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@ai_bp.route('/email-response', methods=['POST'])
@require_auth
def email_response():
    """Generate email response"""
    try:
        data = request.get_json()
        customer_message = data.get('message', '')
        context = data.get('context', 'general')

        response = ai_service.generate_email_response(customer_message, context)

        if 'error' in response and response['error']:
            return jsonify({'error': response['error']}), 500

        return jsonify({
            'response': response['text'],
            'tokens_used': response.get('tokens_used', 0)
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@ai_bp.route('/conversation-history', methods=['GET'])
@require_auth
def conversation_history():
    """Get AI conversation history"""
    try:
        admin_id = request.admin['id']
        limit = request.args.get('limit', 50, type=int)

        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute('''
                SELECT id, message, response, model, tokens_used, created_at
                FROM ai_conversations
                WHERE admin_id = ?
                ORDER BY created_at DESC
                LIMIT ?
            ''', (admin_id, limit))

            conversations = []
            for row in cursor.fetchall():
                conversations.append({
                    'id': row['id'],
                    'message': row['message'],
                    'response': row['response'],
                    'model': row['model'],
                    'tokens_used': row['tokens_used'],
                    'created_at': row['created_at']
                })

        return jsonify({'conversations': conversations})

    except Exception as e:
        return jsonify({'error': str(e)}), 500
