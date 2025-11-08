# Admin Dashboard Documentation

## Overview

The Admin Dashboard is a secure control panel for managing the Elnaz Ashrafi website. It provides comprehensive tools for managing contacts, shop orders, and newsletter subscribers.

## Features

### Authentication
- Secure login system with session management
- Password hashing (SHA256)
- Token-based authentication
- 24-hour session expiry
- Protected API endpoints

### Dashboard Sections

#### 1. Overview
- Real-time statistics display
- Total contacts with unread count
- Total orders with pending count
- Active newsletter subscribers count

#### 2. Contacts Management
- View all contact form submissions
- Filter by status (unread, read, replied)
- Update contact status
- View detailed contact information
- Email links for quick response

#### 3. Orders Management
- View all shop orders
- Filter by status (pending, processing, completed, cancelled)
- Update order status
- View detailed order information
- Customer contact details

#### 4. Subscribers Management
- View newsletter subscribers
- Filter active/inactive subscribers
- Track subscription dates
- Monitor subscriber status

## Installation & Setup

### 1. Database Initialization

The admin tables are automatically created when the application starts. The following tables are added:

- `admin_users` - Stores admin credentials
- `admin_sessions` - Manages login sessions

### 2. Create Admin User

Run the admin creation script:

```bash
cd backend
python create_admin.py
```

You'll be prompted to enter:
- Username
- Email (optional)
- Password
- Password confirmation

Example:
```
Enter username: admin
Enter email (optional): admin@example.com
Enter password: ********
Confirm password: ********

✅ Admin user created successfully!
   Username: admin
   Email: admin@example.com

You can now login at: http://localhost:5000/admin.html
```

### 3. Start the Server

```bash
cd backend
python app.py
```

The server will run on `http://localhost:5000`

### 4. Access the Dashboard

Navigate to: `http://localhost:5000/admin.html`

## Usage Guide

### Logging In

1. Navigate to `/admin.html`
2. Enter your username and password
3. Click "Login"
4. You'll be redirected to the dashboard

### Managing Contacts

1. Click "Contacts" in the sidebar
2. Use the filter dropdown to filter by status
3. Click "View" to see full contact details
4. Use the status dropdown to update contact status:
   - Mark as Read
   - Mark as Replied

### Managing Orders

1. Click "Orders" in the sidebar
2. Use the filter dropdown to filter by status
3. Click "View" to see full order details
4. Use the status dropdown to update order status:
   - Processing
   - Completed
   - Cancelled

### Managing Subscribers

1. Click "Subscribers" in the sidebar
2. Use the filter to show active or all subscribers
3. View subscriber emails and subscription dates

### Refreshing Data

Click the refresh button (🔄) in the header to reload the current section's data.

### Logging Out

Click the "Logout" button in the sidebar footer to end your session.

## API Endpoints

### Authentication

```
POST /api/admin/login
Body: { "username": "string", "password": "string" }
Response: { "success": true, "data": { "token": "string", "username": "string", "email": "string" } }
```

```
POST /api/admin/logout
Headers: Authorization: Bearer {token}
Response: { "success": true, "message": "Logout successful" }
```

```
GET /api/admin/verify
Headers: Authorization: Bearer {token}
Response: { "success": true, "data": { "username": "string", "email": "string" } }
```

### Statistics

```
GET /api/admin/stats
Headers: Authorization: Bearer {token}
Response: {
  "success": true,
  "data": {
    "contacts": { "total": 0, "unread": 0 },
    "orders": { "total": 0, "pending": 0 },
    "subscribers": { "total": 0 }
  }
}
```

### Contacts

```
GET /api/admin/contacts?status={status}&limit={limit}
Headers: Authorization: Bearer {token}
Response: { "success": true, "data": [...] }
```

```
PATCH /api/admin/contacts/{id}/status
Headers: Authorization: Bearer {token}
Body: { "status": "read|replied|unread" }
Response: { "success": true, "message": "Status updated" }
```

### Orders

```
GET /api/admin/orders?status={status}&limit={limit}
Headers: Authorization: Bearer {token}
Response: { "success": true, "data": [...] }
```

```
PATCH /api/admin/orders/{id}/status
Headers: Authorization: Bearer {token}
Body: { "status": "pending|processing|completed|cancelled" }
Response: { "success": true, "message": "Status updated" }
```

### Subscribers

```
GET /api/admin/subscribers?active_only={true|false}
Headers: Authorization: Bearer {token}
Response: { "success": true, "data": [...] }
```

## Security Features

- **Password Hashing**: All passwords are hashed using SHA256
- **Session Tokens**: Secure random tokens for session management
- **Token Expiry**: Sessions expire after 24 hours
- **Protected Routes**: All admin endpoints require authentication
- **Local Storage**: Tokens stored securely in browser localStorage

## File Structure

```
backend/
├── app.py                 # Main Flask application
├── database.py            # Database configuration and initialization
├── models.py              # Database models (including Admin)
├── create_admin.py        # Admin user creation script
└── routes/
    ├── __init__.py        # Route package initialization
    ├── admin.py           # Admin API routes
    ├── contact.py         # Contact form routes
    ├── shop.py            # Shop order routes
    └── newsletter.py      # Newsletter routes

frontend/
├── admin.html             # Admin dashboard HTML
├── css/
│   └── admin.css          # Admin dashboard styles
└── js/
    └── admin.js           # Admin dashboard functionality
```

## Troubleshooting

### Cannot Login
- Verify admin user exists (run `create_admin.py` again)
- Check browser console for errors
- Verify server is running
- Clear browser localStorage and try again

### Session Expired
- Sessions expire after 24 hours
- Simply login again
- Check your system time is correct

### Data Not Loading
- Check browser console for API errors
- Verify authentication token is present
- Click the refresh button
- Check server logs for errors

### Database Errors
- Stop the server
- Delete the database file if needed (backup first!)
- Restart the server to recreate tables
- Run `create_admin.py` to create admin user

## Browser Support

The dashboard is tested and supported on:
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Mobile Responsive

The dashboard is fully responsive and works on:
- Desktop (1920px+)
- Laptop (1366px+)
- Tablet (768px+)
- Mobile (375px+)

## Future Enhancements

Potential features for future versions:
- Multiple admin roles (super admin, editor, viewer)
- Email notifications for new contacts/orders
- Export data to CSV/Excel
- Advanced filtering and search
- Dashboard analytics and charts
- Bulk actions for contacts/orders
- Admin activity logging

## Support

For issues or questions:
1. Check this documentation
2. Review server logs
3. Check browser console
4. Contact the development team

---

**Version**: 1.0.0
**Last Updated**: 2025-11-08
