"""
Elnaz Ashrafi Official Website - Backend Server
Flask application with SQLite database
"""

from flask import Flask, jsonify, send_from_directory
from flask_cors import CORS
import os
from .database import init_db
from .routes import contact_bp, shop_bp, newsletter_bp, admin_bp
from .routes.ai import ai_bp
from .routes.cms import cms_bp
from .routes.seo import seo_bp
from .routes.analytics import analytics_bp

# Initialize Flask app
app = Flask(__name__,
            static_folder='../frontend',
            static_url_path='')

# Enable CORS for API endpoints
CORS(app, resources={
    r"/api/*": {
        "origins": "*",
        "methods": ["GET", "POST", "PUT", "PATCH", "DELETE"],
        "allow_headers": ["Content-Type", "Authorization"]
    }
})

# Configuration
app.config['JSON_SORT_KEYS'] = False
app.config['JSONIFY_PRETTYPRINT_REGULAR'] = True

# Initialize database
init_db()

# Register blueprints
app.register_blueprint(contact_bp)
app.register_blueprint(shop_bp)
app.register_blueprint(newsletter_bp)
app.register_blueprint(admin_bp)
app.register_blueprint(ai_bp)
app.register_blueprint(cms_bp)
app.register_blueprint(seo_bp)
app.register_blueprint(analytics_bp)

# Serve frontend
@app.route('/')
def index():
    """Serve the main page"""
    return send_from_directory(app.static_folder, 'index.html')

@app.route('/<path:path>')
def serve_static(path):
    """Serve static files"""
    return send_from_directory(app.static_folder, path)

# Health check endpoint
@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'message': 'Server is running',
        'version': '1.0.0'
    }), 200

# Error handlers
@app.errorhandler(404)
def not_found(error):
    """Handle 404 errors"""
    return jsonify({
        'success': False,
        'message': 'Resource not found'
    }), 404

@app.errorhandler(500)
def internal_error(error):
    """Handle 500 errors"""
    return jsonify({
        'success': False,
        'message': 'Internal server error'
    }), 500

@app.errorhandler(405)
def method_not_allowed(error):
    """Handle 405 errors"""
    return jsonify({
        'success': False,
        'message': 'Method not allowed'
    }), 405

# Run the application (when running as module: python -m backend.app)
if __name__ == '__main__':
    print("\n" + "="*60)
    print("🎨 ELNAZ ASHRAFI - OFFICIAL WEBSITE")
    print("="*60)
    print("📍 Server running at: http://127.0.0.1:5000")
    print("📁 Frontend directory: ../frontend")
    print("💾 Database: ../database/elnaz_ashrafi.db")
    print("="*60 + "\n")
    print("💡 Tip: You can also run 'python run_server.py' from the root directory")
    print("="*60 + "\n")

    app.run(
        host='0.0.0.0',
        port=5000,
        debug=True
    )
