# Elnaz Ashrafi - Official Website

A modern, minimalist, dark-themed portfolio website for contemporary artist Elnaz Ashrafi.

## 🎨 Features

- **Dark Minimal Design**: Inspired by modern portfolio templates
- **Fully Responsive**: Optimized for all devices (mobile, tablet, desktop)
- **Full Stack Application**: Complete frontend and backend integration
- **Contact Form**: Visitors can send inquiries directly
- **Shop System**: Product inquiry and order management
- **Newsletter**: Email subscription functionality
- **SQLite Database**: Lightweight database for data storage
- **REST API**: Clean API endpoints for all features

## 🛠️ Tech Stack

### Frontend
- HTML5
- Tailwind CSS (via CDN)
- Vanilla JavaScript (No dependencies)

### Backend
- Python 3.x
- Flask (Web framework)
- SQLite (Database)

## 📁 Project Structure

```
Elnaz/
├── backend/
│   ├── app.py              # Flask application
│   ├── database.py         # Database connection & initialization
│   ├── models.py           # Database models
│   ├── requirements.txt    # Python dependencies
│   └── routes/
│       ├── __init__.py
│       ├── contact.py      # Contact form endpoints
│       ├── shop.py         # Shop inquiry endpoints
│       └── newsletter.py   # Newsletter endpoints
├── frontend/
│   ├── index.html          # Main HTML file
│   ├── css/
│   │   └── style.css       # Custom styles
│   ├── js/
│   │   └── main.js         # JavaScript functionality
│   └── assets/
│       └── images/         # Image assets
├── database/
│   └── elnaz_ashrafi.db    # SQLite database (auto-generated)
├── .gitignore
└── README.md
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

### Step 3: Initialize Database
The database will be automatically created when you first run the application.

### Step 4: Run the Application
```bash
cd backend
python app.py
```

The server will start at: **http://127.0.0.1:5000**

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
6. Add authentication for admin endpoints

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
