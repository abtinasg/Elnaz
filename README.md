# Elnaz Ashrafi - Official Website

A modern, minimalist, dark-themed portfolio website for contemporary artist Elnaz Ashrafi.

## 🎨 Features

- **Dark Minimal Design**: Inspired by modern portfolio templates
- **Fully Responsive**: Optimized for all devices (mobile, tablet, desktop)
- **Full Stack Application**: Complete frontend and backend integration
- **Contact Form**: Visitors can send inquiries directly
- **Shop System**: Product inquiry and order management
- **Newsletter**: Email subscription functionality
- **Admin Dashboard**: Secure control panel for managing site content
- **SQLite Database**: Lightweight database for data storage
- **REST API**: Clean API endpoints for all features

### ✨ NEW: AI-Powered Features
- **🤖 AI Assistant**: OpenAI-powered chatbot for SEO, marketing, and content help
- **📝 Content Management System**: Full CMS for dynamic site content
- **🔍 SEO Management**: Per-page SEO settings with AI suggestions
- **📈 Analytics Dashboard**: Track events and get AI-powered marketing insights
- **💡 Smart Suggestions**: AI-driven content improvement and email responses

See [AI_FEATURES.md](AI_FEATURES.md) for detailed documentation.

## 🛠️ Tech Stack

### Frontend
- HTML5
- Tailwind CSS (via CDN)
- Vanilla JavaScript (No dependencies)

### Backend
- Python 3.x
- Flask (Web framework)
- SQLite (Database)
- OpenAI API (AI features)
- tiktoken (Token management)

## 📁 Project Structure

```
Elnaz/
├── backend/
│   ├── app.py              # Flask application
│   ├── database.py         # Database connection & initialization
│   ├── models.py           # Database models (Contact, Shop, Newsletter, Admin)
│   ├── ai_service.py       # OpenAI integration service
│   ├── create_admin.py     # Admin user creation script
│   ├── requirements.txt    # Python dependencies
│   └── routes/
│       ├── __init__.py
│       ├── contact.py      # Contact form endpoints
│       ├── shop.py         # Shop inquiry endpoints
│       ├── newsletter.py   # Newsletter endpoints
│       ├── admin.py        # Admin dashboard endpoints
│       ├── ai.py           # AI assistant endpoints
│       ├── cms.py          # Content management endpoints
│       ├── seo.py          # SEO management endpoints
│       └── analytics.py    # Analytics endpoints
├── frontend/
│   ├── index.html          # Main HTML file
│   ├── admin.html          # Admin dashboard (enhanced)
│   ├── css/
│   │   ├── style.css       # Main site styles
│   │   └── admin.css       # Admin dashboard styles (enhanced)
│   ├── js/
│   │   ├── main.js         # Main site JavaScript
│   │   ├── admin.js        # Admin dashboard JavaScript
│   │   └── admin_enhanced.js # AI, CMS, SEO, Analytics features
│   └── assets/
│       └── images/         # Image assets
├── database/
│   ├── elnaz_ashrafi.db    # SQLite database (auto-generated)
│   ├── schema.sql          # Database schema definition
│   ├── README.md           # Database documentation
│   ├── migrations/         # Database migrations
│   └── backups/           # Database backups
├── .env.example           # Environment variables template
├── .gitignore
├── README.md
├── ADMIN_DASHBOARD.md     # Admin dashboard documentation
└── AI_FEATURES.md         # AI features documentation
```

## 🚀 Installation & Setup

### Prerequisites
- Python 3.8 or higher
- pip (Python package manager)

### Step 1: Clone the Repository
```bash
git clone <repository-url>
cd Elnaz
```

### Step 2: Install Python Dependencies
```bash
cd backend
pip install -r requirements.txt
```

### Step 2.5: Configure Environment Variables (NEW)
```bash
cp .env.example .env
# Edit .env and add your OpenAI API key
```

Required environment variables:
- `OPENAI_API_KEY` - Your OpenAI API key
- `OPENAI_MODEL` - Model to use (default: gpt-3.5-turbo)
- `OPENAI_MAX_TOKENS` - Max tokens per request (default: 1000)

### Step 3: Initialize Database
The database will be automatically created when you first run the application.

### Step 4: Create Admin User (Optional)
```bash
cd backend
python create_admin.py
```

Follow the prompts to create an admin user for the dashboard.

### Step 5: Run the Application
```bash
cd backend
python app.py
```

The server will start at: **http://127.0.0.1:5000**

**Access Points:**
- Main Website: http://127.0.0.1:5000
- Admin Dashboard: http://127.0.0.1:5000/admin.html

## 📡 API Endpoints

### Contact Form
- `POST /api/contact/submit` - Submit contact form
- `GET /api/contact/list` - List all contacts (admin)
- `GET /api/contact/<id>` - Get specific contact
- `PATCH /api/contact/<id>/status` - Update contact status

### Shop
- `POST /api/shop/inquiry` - Submit product inquiry
- `GET /api/shop/orders` - List all orders (admin)
- `GET /api/shop/orders/<id>` - Get specific order
- `PATCH /api/shop/orders/<id>/status` - Update order status

### Newsletter
- `POST /api/newsletter/subscribe` - Subscribe to newsletter
- `POST /api/newsletter/unsubscribe` - Unsubscribe
- `GET /api/newsletter/subscribers` - List subscribers (admin)

### Admin Dashboard (Protected)
- `POST /api/admin/login` - Admin login
- `POST /api/admin/logout` - Admin logout
- `GET /api/admin/verify` - Verify session
- `GET /api/admin/stats` - Get dashboard statistics
- `GET /api/admin/contacts` - Get all contacts (with filters)
- `GET /api/admin/contacts/<id>` - Get specific contact
- `PATCH /api/admin/contacts/<id>/status` - Update contact status
- `GET /api/admin/orders` - Get all orders (with filters)
- `GET /api/admin/orders/<id>` - Get specific order
- `PATCH /api/admin/orders/<id>/status` - Update order status
- `GET /api/admin/subscribers` - Get all subscribers

### AI Assistant (Protected - NEW)
- `POST /api/ai/chat` - Chat with AI assistant
- `POST /api/ai/seo-suggestions` - Get SEO suggestions
- `POST /api/ai/marketing-insights` - Get marketing insights
- `POST /api/ai/content-improvement` - Get content suggestions
- `POST /api/ai/email-response` - Generate email responses
- `GET /api/ai/conversation-history` - Get chat history

### Content Management (Protected - NEW)
- `GET /api/cms/content` - List all content
- `GET /api/cms/content/<id>` - Get specific content
- `POST /api/cms/content` - Create content
- `PUT /api/cms/content/<id>` - Update content
- `DELETE /api/cms/content/<id>` - Delete content
- `GET /api/cms/sections` - Get all sections

### SEO Management (Protected - NEW)
- `GET /api/seo/settings` - List all SEO settings
- `GET /api/seo/settings/<page>` - Get page SEO settings
- `POST /api/seo/settings` - Create SEO settings
- `PUT /api/seo/settings/<id>` - Update SEO settings
- `DELETE /api/seo/settings/<id>` - Delete SEO settings

### Analytics (Protected - NEW)
- `POST /api/analytics/track` - Track event
- `GET /api/analytics/events` - Get events
- `GET /api/analytics/stats` - Get statistics
- `GET /api/analytics/dashboard-stats` - Dashboard overview

### Health Check
- `GET /api/health` - Server health check

## 🗄️ Database Schema

### Contacts Table
- id (INTEGER PRIMARY KEY)
- name (TEXT)
- email (TEXT)
- subject (TEXT)
- message (TEXT)
- created_at (TIMESTAMP)
- status (TEXT: unread, read, replied)

### Shop Orders Table
- id (INTEGER PRIMARY KEY)
- product_name (TEXT)
- customer_name (TEXT)
- customer_email (TEXT)
- customer_phone (TEXT)
- quantity (INTEGER)
- message (TEXT)
- created_at (TIMESTAMP)
- status (TEXT: pending, processing, completed, cancelled)

### Newsletter Subscribers Table
- id (INTEGER PRIMARY KEY)
- email (TEXT UNIQUE)
- subscribed_at (TIMESTAMP)
- is_active (INTEGER)

### Admin Users Table
- id (INTEGER PRIMARY KEY)
- username (TEXT UNIQUE)
- password_hash (TEXT)
- email (TEXT)
- created_at (TIMESTAMP)
- last_login (TIMESTAMP)

### Admin Sessions Table
- id (INTEGER PRIMARY KEY)
- admin_id (INTEGER FOREIGN KEY)
- session_token (TEXT UNIQUE)
- created_at (TIMESTAMP)
- expires_at (TIMESTAMP)
- is_active (INTEGER)

### NEW TABLES

### Site Content Table (CMS)
- id (INTEGER PRIMARY KEY)
- section (TEXT)
- content_key (TEXT)
- content_value (TEXT)
- content_type (TEXT)
- updated_at (TIMESTAMP)
- updated_by (INTEGER FOREIGN KEY)

### Analytics Events Table
- id (INTEGER PRIMARY KEY)
- event_type (TEXT)
- event_data (TEXT)
- ip_address (TEXT)
- user_agent (TEXT)
- created_at (TIMESTAMP)

### AI Conversations Table
- id (INTEGER PRIMARY KEY)
- admin_id (INTEGER FOREIGN KEY)
- message (TEXT)
- response (TEXT)
- model (TEXT)
- tokens_used (INTEGER)
- created_at (TIMESTAMP)

### SEO Settings Table
- id (INTEGER PRIMARY KEY)
- page (TEXT UNIQUE)
- title (TEXT)
- description (TEXT)
- keywords (TEXT)
- og_image (TEXT)
- updated_at (TIMESTAMP)

## 🎯 Features Breakdown

### Hero Section
- Eye-catching headline
- Call-to-action buttons
- Smooth scroll indicator

### About Section
- Artist biography
- Statistics showcase
- Visual presentation

### Gallery
- Filterable portfolio grid
- Hover effects
- Category filtering (All, Paintings, Sculptures, Digital Art)

### Exhibitions
- Recent and upcoming shows
- Status indicators (Ongoing, Completed, Upcoming)

### Shop
- Product showcase
- Inquiry modal
- Dynamic product information

### Contact Form
- Name, email, subject, message fields
- Backend validation
- Success/error messaging

### Newsletter
- Email subscription
- Duplicate prevention
- Confirmation messaging

### Admin Dashboard
- Secure authentication with session management
- Overview statistics (contacts, orders, subscribers)
- Contact management (view, filter, update status)
- Order management (view, filter, update status)
- Subscriber management (view, filter)
- **NEW: 🤖 AI Assistant** - Chat with AI for SEO, marketing, and content help
- **NEW: 📝 Content Manager** - Manage site content dynamically
- **NEW: 🔍 SEO Settings** - Per-page SEO optimization with AI suggestions
- **NEW: 📈 Analytics** - Track events and get AI-powered insights
- Responsive design for all devices
- Real-time data updates

See [ADMIN_DASHBOARD.md](ADMIN_DASHBOARD.md) and [AI_FEATURES.md](AI_FEATURES.md) for detailed documentation.

## 🎨 Design System

### Colors
- Background Primary: `#0A0A0A`
- Background Secondary: `#121212`
- Background Card: `#1A1A1A`
- Text Primary: `#FFFFFF`
- Text Secondary: `#999999`

### Typography
- Display Font: Playfair Display (serif)
- Body Font: Inter (sans-serif)

### Spacing
- Mobile-first responsive design
- Consistent spacing system
- Fluid typography

## 🔒 Security Considerations

- Input validation on both frontend and backend
- SQL injection protection via parameterized queries
- Password hashing (SHA256) for admin users
- Token-based authentication for admin dashboard
- Session management with 24-hour expiry
- Protected admin API endpoints
- CORS configuration for API endpoints
- Error handling for all routes

## 📱 Responsive Design

The website is fully responsive with breakpoints:
- Mobile: 0-768px
- Tablet: 768px-1024px
- Desktop: 1024px+

## 🚢 Deployment

### Production Checklist
1. Set `debug=False` in `app.py`
2. Use production WSGI server (Gunicorn, uWSGI)
3. Configure proper database backups
4. Set up SSL/HTTPS
5. Configure environment variables
6. Change default admin credentials
7. Use stronger password hashing (e.g., bcrypt)
8. Implement rate limiting for login attempts
9. Enable HTTPS-only sessions

### Example Gunicorn Deployment
```bash
pip install gunicorn
gunicorn -w 4 -b 0.0.0.0:8000 app:app
```

## 📄 License

© 2024 Elnaz Ashrafi. All rights reserved.

## 👨‍💻 Development

Built with ❤️ using modern web technologies and best practices.

For development inquiries or support, please use the contact form on the website.

---

**Note**: Replace placeholder images with actual artwork images in the `frontend/assets/images/` directory.
