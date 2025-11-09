"""
Analytics Routes
Analytics tracking and insights API endpoints
"""

from flask import Blueprint, request, jsonify
from ..database import get_db
from ..auth_utils import require_auth
from datetime import datetime, timedelta
import json

analytics_bp = Blueprint('analytics', __name__, url_prefix='/api/analytics')

@analytics_bp.route('/track', methods=['POST'])
def track_event():
    """Track an analytics event"""
    try:
        data = request.get_json()
        event_type = data.get('event_type')
        event_data = data.get('event_data', {})
        ip_address = request.remote_addr
        user_agent = request.headers.get('User-Agent', '')

        if not event_type:
            return jsonify({'error': 'Event type is required'}), 400

        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute('''
                INSERT INTO analytics_events (event_type, event_data, ip_address, user_agent)
                VALUES (?, ?, ?, ?)
            ''', (event_type, json.dumps(event_data), ip_address, user_agent))

        return jsonify({'message': 'Event tracked successfully'}), 201

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@analytics_bp.route('/events', methods=['GET'])
@require_auth
def get_events():
    """Get analytics events"""
    try:
        limit = request.args.get('limit', 100, type=int)
        event_type = request.args.get('type')
        days = request.args.get('days', 30, type=int)

        # Calculate date threshold
        date_threshold = datetime.now() - timedelta(days=days)

        with get_db() as conn:
            cursor = conn.cursor()

            if event_type:
                cursor.execute('''
                    SELECT id, event_type, event_data, ip_address, user_agent, created_at
                    FROM analytics_events
                    WHERE event_type = ? AND created_at >= ?
                    ORDER BY created_at DESC
                    LIMIT ?
                ''', (event_type, date_threshold, limit))
            else:
                cursor.execute('''
                    SELECT id, event_type, event_data, ip_address, user_agent, created_at
                    FROM analytics_events
                    WHERE created_at >= ?
                    ORDER BY created_at DESC
                    LIMIT ?
                ''', (date_threshold, limit))

            events = []
            for row in cursor.fetchall():
                try:
                    event_data = json.loads(row['event_data']) if row['event_data'] else {}
                except:
                    event_data = {}

                events.append({
                    'id': row['id'],
                    'event_type': row['event_type'],
                    'event_data': event_data,
                    'ip_address': row['ip_address'],
                    'user_agent': row['user_agent'],
                    'created_at': row['created_at']
                })

        return jsonify({'events': events})

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@analytics_bp.route('/stats', methods=['GET'])
@require_auth
def get_stats():
    """Get analytics statistics"""
    try:
        days = request.args.get('days', 30, type=int)
        date_threshold = datetime.now() - timedelta(days=days)

        with get_db() as conn:
            cursor = conn.cursor()

            # Total events
            cursor.execute('''
                SELECT COUNT(*) as total
                FROM analytics_events
                WHERE created_at >= ?
            ''', (date_threshold,))
            total_events = cursor.fetchone()['total']

            # Events by type
            cursor.execute('''
                SELECT event_type, COUNT(*) as count
                FROM analytics_events
                WHERE created_at >= ?
                GROUP BY event_type
                ORDER BY count DESC
            ''', (date_threshold,))

            events_by_type = []
            for row in cursor.fetchall():
                events_by_type.append({
                    'event_type': row['event_type'],
                    'count': row['count']
                })

            # Events by day (last 7 days)
            cursor.execute('''
                SELECT DATE(created_at) as date, COUNT(*) as count
                FROM analytics_events
                WHERE created_at >= ?
                GROUP BY DATE(created_at)
                ORDER BY date DESC
                LIMIT 7
            ''', (datetime.now() - timedelta(days=7),))

            events_by_day = []
            for row in cursor.fetchall():
                events_by_day.append({
                    'date': row['date'],
                    'count': row['count']
                })

            # Unique visitors (by IP)
            cursor.execute('''
                SELECT COUNT(DISTINCT ip_address) as unique_visitors
                FROM analytics_events
                WHERE created_at >= ?
            ''', (date_threshold,))
            unique_visitors = cursor.fetchone()['unique_visitors']

        return jsonify({
            'total_events': total_events,
            'unique_visitors': unique_visitors,
            'events_by_type': events_by_type,
            'events_by_day': events_by_day,
            'period_days': days
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@analytics_bp.route('/dashboard-stats', methods=['GET'])
@require_auth
def get_dashboard_stats():
    """Get comprehensive dashboard statistics"""
    try:
        with get_db() as conn:
            cursor = conn.cursor()

            # Contacts stats
            cursor.execute('SELECT COUNT(*) as total FROM contacts')
            total_contacts = cursor.fetchone()['total']

            cursor.execute("SELECT COUNT(*) as unread FROM contacts WHERE status = 'unread'")
            unread_contacts = cursor.fetchone()['unread']

            # Orders stats
            cursor.execute('SELECT COUNT(*) as total FROM shop_orders')
            total_orders = cursor.fetchone()['total']

            cursor.execute("SELECT COUNT(*) as pending FROM shop_orders WHERE status = 'pending'")
            pending_orders = cursor.fetchone()['pending']

            # Subscribers stats
            cursor.execute('SELECT COUNT(*) as total FROM newsletter_subscribers WHERE is_active = 1')
            active_subscribers = cursor.fetchone()['total']

            # Recent activity (last 7 days)
            date_threshold = datetime.now() - timedelta(days=7)
            cursor.execute('SELECT COUNT(*) as recent FROM contacts WHERE created_at >= ?', (date_threshold,))
            recent_contacts = cursor.fetchone()['recent']

            cursor.execute('SELECT COUNT(*) as recent FROM shop_orders WHERE created_at >= ?', (date_threshold,))
            recent_orders = cursor.fetchone()['recent']

        return jsonify({
            'contacts': {
                'total': total_contacts,
                'unread': unread_contacts,
                'recent': recent_contacts
            },
            'orders': {
                'total': total_orders,
                'pending': pending_orders,
                'recent': recent_orders
            },
            'subscribers': {
                'active': active_subscribers
            }
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500
