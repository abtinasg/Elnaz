# Elnaz Ashrafi E-Commerce Codebase - Complete Architecture Analysis

## Project Overview
This is a **Persian e-commerce website** for artist Elnaz Ashrafi featuring a complete shop system with order management, product catalog, and admin dashboard. Built with Flask backend and vanilla JavaScript frontend.

**Repository**: `/home/user/Elnaz`
**Tech Stack**: Python Flask + SQLite + JavaScript + Tailwind CSS
**Language**: Persian (فارسی) with full RTL support

---

## 1. SHOP STRUCTURE & COMPONENTS

### Frontend Shop Pages
| File | Purpose | Lines | Status |
|------|---------|-------|--------|
| `/home/user/Elnaz/frontend/shop.html` | Main shop page with products, cart, checkout | 667 | Active |
| `/home/user/Elnaz/frontend/shop-contact.html` | Shop contact page (Persian) | 11,039 | Active |
| `/home/user/Elnaz/frontend/shop-about.html` | Shop about page (Persian) | 12,876 | Active |

### Shop UI Components
**Location**: `/home/user/Elnaz/frontend/js/shop.js` (200+ lines)

**Key Features**:
- Product catalog display
- Shopping cart management (localStorage)
- Wishlist functionality (localStorage)
- Category filtering
- Product search
- Cart quantity management
- Order checkout process
- Customer authentication (register/login)

**JavaScript Functions**:
```
- loadCart() / saveCart()
- loadWishlist() / saveWishlist()
- addToCart() / removeFromCart()
- updateQuantity()
- toggleWishlist()
- loadProducts() / loadCategories()
- renderProducts() / renderCartItems()
- checkAuth() / verifyAuth()
- submitOrder()
```

### Shop Styling
**Location**: `/home/user/Elnaz/frontend/css/style.css`
**Design System**:
- Dark theme: `#0A0A0A`, `#121212`, `#1A1A1A`
- Accent colors: Gold (`#D4AF37`) and Purple (`#9333EA`)
- Persian fonts: Vazir font family
- Tailwind CSS via CDN
- Responsive mobile-first design

---

## 2. ORDER MANAGEMENT SYSTEM

### Backend Order Models & CRUD

**Location**: `/home/user/Elnaz/backend/models.py`

#### Two Order Management Systems:

**A. Legacy Shop Orders Model** (ShopOrder class)
```python
class ShopOrder:
    - create(product_name, customer_name, customer_email, customer_phone, quantity, message)
    - get_all(limit=50, status=None)
    - get_by_id(order_id)
    - update_status(order_id, status)
    
Fields:
- id, product_name, customer_name, customer_email, customer_phone
- quantity, message, created_at
- status: 'pending', 'processing', 'completed', 'cancelled'
```

**B. New Enhanced Order Model** (Order class)
```python
class Order:
    - generate_order_number()  # Unique: ORD-{timestamp}-{random}
    - create(customer_name, customer_email, items, phone, address, payment_method, notes)
    - get_all(limit=50, status=None)
    - get_by_id(order_id) - Returns order with items
    - get_by_order_number(order_number) - For order tracking
    - update_status(order_id, status)
    
Fields:
- id, order_number (UNIQUE), customer_name, customer_email, customer_phone
- customer_address, total_amount, payment_method
- status: 'pending', 'processing', 'completed', 'cancelled'
- notes, created_at, updated_at
```

### Order API Endpoints

**Location**: `/home/user/Elnaz/backend/routes/shop.py` (Lines 177-333)

| Method | Endpoint | Purpose | Auth |
|--------|----------|---------|------|
| POST | `/api/shop/orders` | Create new order with items | No |
| GET | `/api/shop/orders` | Get all orders (filtered by status) | No |
| GET | `/api/shop/orders/<order_id>` | Get specific order with items | No |
| GET | `/api/shop/orders/track/<order_number>` | Track order by order number | No |
| PATCH | `/api/shop/orders/<order_id>/status` | Update order status | No |

**Admin Order Management**:
| Method | Endpoint | Purpose | Auth |
|--------|----------|---------|------|
| GET | `/api/admin/orders` | Get all orders with filtering | Yes |
| GET | `/api/admin/orders/<order_id>` | Get order details | Yes |
| PATCH | `/api/admin/orders/<order_id>/status` | Update order status | Yes |

### Related Tables
- **orders** - Main order records
- **order_items** - Line items per order (product_id, product_name, quantity, price)

---

## 3. PRODUCT MANAGEMENT FEATURES

### Product Model
**Location**: `/home/user/Elnaz/backend/models.py` (Lines 272-357)

```python
class Product:
    - create(name_fa, price, name_en, description_fa, description_en, category, image_url, stock_quantity)
    - get_all(category=None, available_only=True)
    - get_by_id(product_id)
    - update(product_id, **kwargs)  # Soft updates
    - delete(product_id)  # Soft delete (marks as unavailable)
    - get_categories()  # Returns unique categories
```

### Product Fields
| Field | Type | Description |
|-------|------|-------------|
| id | INT | Primary key |
| name_fa | TEXT | Persian product name |
| name_en | TEXT | English product name |
| description_fa | TEXT | Persian description |
| description_en | TEXT | English description |
| price | REAL | Product price |
| category | TEXT | Product category |
| image_url | TEXT | Product image URL |
| stock_quantity | INT | Available quantity |
| is_available | INT | Soft delete flag (0=deleted, 1=active) |
| created_at | TIMESTAMP | Creation date |
| updated_at | TIMESTAMP | Last update date |

### Product API Endpoints

**Location**: `/home/user/Elnaz/backend/routes/shop.py` (Lines 19-173)

| Method | Endpoint | Purpose | Auth |
|--------|----------|---------|------|
| GET | `/api/shop/products` | List all products (with category filter) | No |
| GET | `/api/shop/products/<product_id>` | Get product details | No |
| POST | `/api/shop/products` | Create new product | No |
| PUT | `/api/shop/products/<product_id>` | Update product | No |
| DELETE | `/api/shop/products/<product_id>` | Delete product (soft delete) | No |
| GET | `/api/shop/categories` | Get all unique categories | No |

### Legacy Inquiry Endpoint
```
POST /api/shop/inquiry
Purpose: Submit product inquiry (legacy system)
Fields: product_name, customer_name, customer_email, customer_phone, quantity, message
```

---

## 4. INVENTORY/WAREHOUSE MANAGEMENT

### Current Capabilities
- **Stock tracking**: `stock_quantity` field in products table
- **Availability status**: `is_available` boolean flag
- **Soft delete system**: Products marked unavailable instead of deleted
- **Category management**: Organize products by category

### Limitations (Not Fully Implemented)
- No automatic stock deduction on orders
- No low stock alerts
- No warehouse location tracking
- No inventory history/audit log
- No SKU management
- No bulk import/export

### Related Database Tables
```
products - Core product catalog
├── stock_quantity (INT)
├── is_available (INT - soft delete)
└── category (TEXT)
```

### Inventory Fields in Product Table
- `stock_quantity` - Current available quantity
- `is_available` - Boolean flag (0=delisted, 1=active)
- `price` - Current price point
- `category` - Product categorization

---

## 5. ADMIN PANEL STRUCTURE

### Admin Dashboard Files

**Frontend**:
| File | Purpose | Type |
|------|---------|------|
| `/home/user/Elnaz/frontend/admin.html` | Dashboard layout | HTML (480 lines) |
| `/home/user/Elnaz/frontend/js/admin.js` | Dashboard logic | JS (200+ lines) |
| `/home/user/Elnaz/frontend/js/admin_enhanced.js` | Advanced features | JS |
| `/home/user/Elnaz/frontend/css/admin.css` | Dashboard styles | CSS |

**Backend**:
| File | Purpose | Type |
|------|---------|------|
| `/home/user/Elnaz/backend/routes/admin.py` | Admin API routes | Python (389 lines) |
| `/home/user/Elnaz/backend/models.py` (Admin class) | Admin auth & sessions | Python (83 lines) |
| `/home/user/Elnaz/backend/auth_utils.py` | Auth decorator | Python |
| `/home/user/Elnaz/backend/create_admin.py` | Admin user creation | Python |

### Admin Dashboard Sections

#### 1. **Overview/Dashboard**
- Real-time statistics
- Total contacts (unread count)
- Total orders (pending count)
- Active newsletter subscribers
- Recent activity

#### 2. **Contact Management**
- View all contact form submissions
- Filter by status: `unread`, `read`, `replied`
- Update contact status
- Detailed view modal
- Email link for quick response

#### 3. **Order Management**
- View all shop orders
- Filter by status: `pending`, `processing`, `completed`, `cancelled`
- Update order status
- View customer details
- Order information modal

#### 4. **Subscriber Management**
- View newsletter subscribers
- Filter active/inactive
- Track subscription dates
- Export subscriber list

#### 5. **Shop Pages Management** (New)
- Manage Contact page (تماس با ما)
- Manage About page (درباره فروشگاه)
- Edit Persian content directly
- View update history

#### 6. **AI Assistant** (Advanced Feature)
- Chat with OpenAI
- SEO suggestions
- Marketing insights
- Content improvement
- Email response generation
- Conversation history

#### 7. **Content Management System (CMS)**
- Dynamic site content management
- Organize by sections
- Multiple content types (text, html, image, json)
- Edit without code

#### 8. **SEO Settings**
- Per-page SEO configuration
- Meta title, description, keywords
- Open Graph image
- AI-powered suggestions

#### 9. **Analytics Dashboard**
- Event tracking
- Visitor analytics
- Event breakdown by type
- Time-based statistics
- AI-powered insights

### Admin Authentication Flow

**Location**: `/home/user/Elnaz/backend/models.py` (Admin class)

```python
# 1. Login
POST /api/admin/login
├─ Admin.authenticate(username, password)
└─ Admin.create_session(admin_id) → session_token

# 2. Session Management
├─ Admin.verify_session(session_token) → admin object
└─ @require_auth decorator validates all protected routes

# 3. Security
├─ Password hashing: SHA256
├─ Session tokens: 32-byte URL-safe random
└─ Session expiry: 24 hours
```

### Admin Database Tables

```
admin_users
├── id (INT PRIMARY KEY)
├── username (TEXT UNIQUE)
├── password_hash (TEXT) - SHA256
├── email (TEXT)
├── created_at (TIMESTAMP)
└── last_login (TIMESTAMP)

admin_sessions
├── id (INT PRIMARY KEY)
├── admin_id (INT FOREIGN KEY)
├── session_token (TEXT UNIQUE)
├── created_at (TIMESTAMP)
├── expires_at (TIMESTAMP)
└── is_active (INT)
```

---

## 6. DATABASE MODELS FOR SHOP/ORDERS/PRODUCTS

### Complete Database Schema

**Location**: `/home/user/Elnaz/backend/database.py` & `/home/user/Elnaz/database/schema.sql`

### Core E-Commerce Tables

#### **products** Table
```sql
CREATE TABLE products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name_fa TEXT NOT NULL,
    name_en TEXT,
    description_fa TEXT,
    description_en TEXT,
    price REAL NOT NULL,
    category TEXT,
    image_url TEXT,
    stock_quantity INTEGER DEFAULT 0,
    is_available INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INDEX: idx_products_category ON products(category)
INDEX: idx_products_available ON products(is_available)
```

#### **orders** Table
```sql
CREATE TABLE orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_number TEXT UNIQUE NOT NULL,
    customer_name TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    customer_phone TEXT,
    customer_address TEXT,
    total_amount REAL NOT NULL,
    payment_method TEXT DEFAULT 'cash',
    status TEXT DEFAULT 'pending',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

Valid Statuses: pending, processing, completed, cancelled
INDEX: idx_orders_number ON orders(order_number)
INDEX: idx_orders_new_status ON orders(status)
```

#### **order_items** Table
```sql
CREATE TABLE order_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    product_name TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    price REAL NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id),
    FOREIGN KEY (product_id) REFERENCES products(id)
);

INDEX: idx_order_items_order ON order_items(order_id)
```

#### **shop_orders** Table (Legacy)
```sql
CREATE TABLE shop_orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_name TEXT NOT NULL,
    customer_name TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    customer_phone TEXT,
    quantity INTEGER DEFAULT 1,
    message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status TEXT DEFAULT 'pending'
);

Valid Statuses: pending, processing, completed, cancelled
INDEX: idx_orders_status ON shop_orders(status)
INDEX: idx_orders_created ON shop_orders(created_at DESC)
```

#### **shop_users** Table (Customer Accounts)
```sql
CREATE TABLE shop_users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    phone TEXT,
    password_hash TEXT NOT NULL,
    address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP,
    is_active INTEGER DEFAULT 1
);

INDEX: idx_shop_users_email ON shop_users(email)
```

#### **shop_user_sessions** Table
```sql
CREATE TABLE shop_user_sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    session_token TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL,
    is_active INTEGER DEFAULT 1,
    FOREIGN KEY (user_id) REFERENCES shop_users(id)
);

INDEX: idx_shop_user_sessions_token ON shop_user_sessions(session_token)
```

#### **shop_pages** Table (Contact/About Pages)
```sql
CREATE TABLE shop_pages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    page_key TEXT NOT NULL UNIQUE,
    title_fa TEXT NOT NULL,
    content_fa TEXT NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_by INTEGER,
    is_active INTEGER DEFAULT 1,
    FOREIGN KEY (updated_by) REFERENCES admin_users(id)
);

Pre-populated Pages: 'contact', 'about'
INDEX: idx_shop_pages_key ON shop_pages(page_key)
```

### Additional Tables

#### **contacts** Table
```sql
CREATE TABLE contacts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    subject TEXT,
    message TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status TEXT DEFAULT 'unread'
);

Valid Statuses: unread, read, replied
INDEX: idx_contacts_status, idx_contacts_created
```

#### **newsletter_subscribers** Table
```sql
CREATE TABLE newsletter_subscribers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL UNIQUE,
    subscribed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active INTEGER DEFAULT 1
);
```

#### **cart_items** Table (Session-based)
```sql
CREATE TABLE cart_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id TEXT NOT NULL,
    product_id INTEGER NOT NULL,
    quantity INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id)
);

INDEX: idx_cart_session ON cart_items(session_id)
```

#### **site_content** Table (CMS)
```sql
CREATE TABLE site_content (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    section TEXT NOT NULL,
    content_key TEXT NOT NULL,
    content_value TEXT,
    content_type TEXT DEFAULT 'text',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_by INTEGER,
    UNIQUE(section, content_key),
    FOREIGN KEY (updated_by) REFERENCES admin_users(id)
);
```

#### **analytics_events** Table
```sql
CREATE TABLE analytics_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    event_type TEXT NOT NULL,
    event_data TEXT,
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INDEX: idx_analytics_created
```

#### **ai_conversations** Table
```sql
CREATE TABLE ai_conversations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    admin_id INTEGER NOT NULL,
    message TEXT NOT NULL,
    response TEXT NOT NULL,
    model TEXT DEFAULT 'gpt-3.5-turbo',
    tokens_used INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (admin_id) REFERENCES admin_users(id)
);

INDEX: idx_ai_conversations_admin
```

#### **seo_settings** Table
```sql
CREATE TABLE seo_settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    page TEXT UNIQUE NOT NULL,
    title TEXT,
    description TEXT,
    keywords TEXT,
    og_image TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 7. API ENDPOINTS FOR E-COMMERCE

### Complete API Reference

**Base URL**: `/api`
**Authentication**: Bearer token in Authorization header (for protected endpoints)

### Shop Endpoints (Product & Order Management)

**Base**: `/api/shop`

#### Products
```
GET    /products              List all products (with optional category filter)
GET    /products/<id>         Get specific product
POST   /products              Create new product
PUT    /products/<id>         Update product
DELETE /products/<id>         Delete product (soft delete)
GET    /categories            Get all product categories
```

#### Orders (Enhanced System)
```
POST   /orders                Create new order with items
GET    /orders                List all orders (with status filter)
GET    /orders/<id>           Get order with items
GET    /orders/track/<number> Track order by order number
PATCH  /orders/<id>/status    Update order status
```

#### Legacy Inquiries
```
POST   /inquiry               Submit product inquiry (legacy)
```

#### Customer Authentication
```
POST   /auth/register         Register new customer
POST   /auth/login            Login customer
POST   /auth/logout           Logout customer
GET    /auth/verify           Verify session token
PUT    /auth/profile          Update customer profile
```

#### Shop Pages (Contact/About)
```
GET    /pages/<key>           Get page by key (contact, about)
GET    /pages                 Get all shop pages
```

### Admin Endpoints (Protected)

**Base**: `/api/admin`
**Authentication**: Required (Bearer token)

#### Authentication
```
POST   /login                 Admin login
POST   /logout                Admin logout (protected)
GET    /verify                Verify session (protected)
```

#### Dashboard
```
GET    /stats                 Get dashboard statistics
```

#### Contact Management
```
GET    /contacts              List all contacts (with filters)
GET    /contacts/<id>         Get specific contact
PATCH  /contacts/<id>/status  Update contact status
```

#### Order Management (Admin)
```
GET    /orders                List all orders (with filters)
GET    /orders/<id>           Get order details
PATCH  /orders/<id>/status    Update order status
```

#### Subscriber Management
```
GET    /subscribers           List newsletter subscribers
```

#### Shop Pages Management
```
GET    /shop-pages            List all shop pages
GET    /shop-pages/<key>      Get specific page
POST   /shop-pages            Create/update shop page
DELETE /shop-pages/<key>      Delete shop page
```

### Contact Form Endpoints

**Base**: `/api/contact`

```
POST   /submit                Submit contact form
GET    /list                  List contacts (admin)
GET    /<id>                  Get specific contact
PATCH  /<id>/status           Update contact status
```

### Newsletter Endpoints

**Base**: `/api/newsletter`

```
POST   /subscribe             Subscribe to newsletter
POST   /unsubscribe           Unsubscribe from newsletter
GET    /subscribers           List subscribers (admin)
```

### AI Endpoints (Protected)

**Base**: `/api/ai`
**Authentication**: Required

```
POST   /chat                  Chat with AI assistant
POST   /seo-suggestions       Get SEO suggestions
POST   /marketing-insights    Get marketing insights
POST   /content-improvement   Get content improvement suggestions
POST   /email-response        Generate email response
GET    /conversation-history  Get chat history
```

### CMS Endpoints (Protected)

**Base**: `/api/cms`
**Authentication**: Required (for POST/PUT/DELETE)

```
GET    /content               List all content
GET    /content/<id>          Get specific content
POST   /content               Create content
PUT    /content/<id>          Update content
DELETE /content/<id>          Delete content
GET    /sections              Get all sections
```

### SEO Endpoints (Protected)

**Base**: `/api/seo`
**Authentication**: Required (for POST/PUT/DELETE)

```
GET    /settings              List all SEO settings
GET    /settings/<page>       Get page SEO settings
POST   /settings              Create SEO settings
PUT    /settings/<id>         Update SEO settings
DELETE /settings/<id>         Delete SEO settings
```

### Analytics Endpoints

**Base**: `/api/analytics`

```
POST   /track                 Track event (no auth)
GET    /events                Get events (protected)
GET    /stats                 Get statistics (protected)
GET    /dashboard-stats       Get dashboard statistics (protected)
```

### Health Check
```
GET    /health                Server health check
```

---

## 8. PERSIAN LANGUAGE ELEMENTS

### Language Support
- **Site Language**: Persian (فارسی)
- **Text Direction**: RTL (Right-to-Left)
- **Font**: Vazir (Persian font)
- **Messages**: All error/success messages in Persian

### Persian Content Examples

#### Shop Pages (ShopPage model)
**Contact Page** (`page_key='contact'`):
```
Title: تماس با ما
Content: راه‌های ارتباطی
         ایمیل: info@elnazashrafi.com
         تلفن: ۰۲۱-۱۲۳۴۵۶۷۸
         ساعات کاری: شنبه تا پنج‌شنبه: ۹ صبح تا ۶ عصر
```

**About Page** (`page_key='about'`):
```
Title: درباره فروشگاه
Content: درباره فروشگاه آثار هنری
         تمامی آثار اورجینال و با گواهی اصالت
```

### Persian Error Messages
```
"محصول یافت نشد"              (Product not found)
"خطا در دریافت محصولات"        (Error fetching products)
"محصول به سبد خرید اضافه شد" (Product added to cart)
"سفارش شما با موفقیت ثبت شد"  (Order submitted successfully)
"ایمیل یا رمز عبور اشتباه است" (Invalid email or password)
"فیلد {field} الزامی است"     (Field is required)
```

### Persian Form Labels
- دسته‌بندی (Category)
- قیمت (Price)
- توضیحات (Description)
- تصویر (Image)
- تماس با ما (Contact Us)
- درباره ما (About Us)

---

## 9. PROJECT STATISTICS

### Codebase Metrics
- **Backend Files**: 21 Python files (~4000+ lines)
- **Frontend Files**: 11 HTML/JS files
- **API Endpoints**: 38+ total endpoints
- **Database Tables**: 14 tables with 20+ indexes
- **Models**: 8 Python model classes

### Directory Structure
```
/home/user/Elnaz/
├── backend/
│   ├── app.py                      (Flask application)
│   ├── models.py                   (8 models, 729 lines)
│   ├── database.py                 (DB management, 279 lines)
│   ├── auth_utils.py               (Auth decorator)
│   ├── ai_service.py               (OpenAI integration)
│   ├── create_admin.py             (Admin creation)
│   ├── requirements.txt
│   └── routes/
│       ├── admin.py                (389 lines, 11 endpoints)
│       ├── shop.py                 (650 lines, 14 endpoints)
│       ├── contact.py              (134 lines, 4 endpoints)
│       ├── newsletter.py           (107 lines, 3 endpoints)
│       ├── cms.py                  (191 lines, 5 endpoints)
│       ├── seo.py                  (151 lines, 5 endpoints)
│       ├── ai.py                   (170 lines, 6 endpoints)
│       └── analytics.py            (215 lines, 4 endpoints)
├── frontend/
│   ├── index.html                  (Main site)
│   ├── shop.html                   (667 lines, shop UI)
│   ├── admin.html                  (480 lines, admin UI)
│   ├── shop-contact.html
│   ├── shop-about.html
│   ├── js/
│   │   ├── main.js
│   │   ├── shop.js                 (200+ lines, shop logic)
│   │   ├── admin.js                (200+ lines, admin logic)
│   │   └── admin_enhanced.js       (Advanced features)
│   └── css/
│       ├── style.css
│       └── admin.css
├── database/
│   ├── elnaz_ashrafi.db            (SQLite database)
│   └── schema.sql                  (Schema definition)
└── Documentation
    ├── README.md
    ├── ADMIN_DASHBOARD.md
    └── AI_FEATURES.md
```

---

## 10. KEY ARCHITECTURAL PATTERNS

### Backend Architecture
- **Framework**: Flask (lightweight Python web framework)
- **Database**: SQLite (file-based, no server needed)
- **Authentication**: Token-based (session tokens)
- **API Style**: RESTful with JSON responses
- **Password Hashing**: SHA256 (with potential upgrade to bcrypt)

### Frontend Architecture
- **Framework**: Vanilla JavaScript (no dependencies)
- **State Management**: Client-side localStorage + in-memory variables
- **Styling**: Tailwind CSS via CDN
- **Responsive**: Mobile-first design approach
- **RTL Support**: Full Persian (RTL) support

### Database Design
- **Approach**: Relational (SQLite)
- **Foreign Keys**: Enabled for referential integrity
- **Indexes**: 20+ performance indexes
- **Soft Deletes**: Used for products and pages
- **Timestamps**: All tables have created_at/updated_at

### Security Measures
- **Input Validation**: Both frontend and backend
- **SQL Injection Protection**: Parameterized queries
- **Password Security**: SHA256 hashing (can upgrade to bcrypt)
- **Session Management**: Token-based with expiry
- **CORS**: Configured for API endpoints
- **Error Handling**: Generic error messages to users

---

## 11. NOTABLE FEATURES

### E-Commerce Specific
- Dual order management systems (legacy + new)
- Cart management with localStorage
- Wishlist functionality
- Product categories and filtering
- Order tracking by order number
- Stock quantity tracking
- Multiple payment methods support (cash, etc.)

### Admin Features
- Real-time dashboard statistics
- Contact/Order/Subscriber management
- Session-based authentication (24-hour expiry)
- Customer page editing (Contact/About)
- Bulk operations ready

### AI Features (Advanced)
- OpenAI ChatGPT integration
- SEO suggestions generation
- Marketing insights
- Email response generation
- Content improvement suggestions

### CMS Features
- Dynamic content management
- Multiple content types (text, html, image, json)
- Section-based organization
- Update history tracking

### Analytics
- Event tracking system
- Visitor analytics
- Event breakdown by type
- 7-day activity trends
- Unique visitor counting

---

## 12. CURRENT LIMITATIONS & FUTURE ENHANCEMENTS

### Limitations
1. **Inventory**: Stock not automatically deducted on orders
2. **Payment**: No actual payment processing (cash only)
3. **Email**: No automated email notifications
4. **Search**: Basic product filtering (no full-text search)
5. **Scalability**: SQLite suitable for small to medium scale only
6. **Security**: SHA256 hashing (should upgrade to bcrypt)
7. **Rate Limiting**: No rate limiting on API endpoints
8. **Admin Roles**: Single admin level (no role-based access)

### Recommended Enhancements
1. Upgrade to PostgreSQL for production
2. Implement real payment gateway (Stripe, PayPal)
3. Add email notification system (SendGrid, AWS SES)
4. Implement full-text search
5. Add multi-language support (currently Persian-only UI)
6. Implement role-based access control (RBAC)
7. Add order fulfillment workflow
8. Implement abandoned cart recovery
9. Add product reviews/ratings
10. Implement inventory management system

---

## Summary

This is a **comprehensive e-commerce system** for Elnaz Ashrafi's art shop with:
- ✓ Complete product catalog management
- ✓ Full order management system (2 implementations)
- ✓ Customer authentication (shop users)
- ✓ Admin dashboard with multiple management tools
- ✓ Contact form management
- ✓ Newsletter subscription
- ✓ AI-powered assistant for admins
- ✓ CMS for content management
- ✓ Analytics tracking
- ✓ SEO management
- ✓ Full Persian (RTL) support
- ✓ Responsive mobile design

**Current Status**: Fully functional Persian e-commerce platform with advanced admin features

**Database Size**: SQLite (lightweight, file-based)
**Total API Endpoints**: 38+
**User Types**: Customers (shop users) + Admin users
**Authentication**: Session-based (tokens)

