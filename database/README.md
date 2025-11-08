# Database Documentation

## Overview
This folder contains the SQLite database and related files for the Elnaz Ashrafi website.

## Structure
```
database/
├── schema.sql          # Database schema definition
├── elnaz_ashrafi.db   # SQLite database file (auto-generated)
├── migrations/        # Database migration scripts
├── backups/          # Database backup files
└── README.md         # This file
```

## Tables

### Core Tables
- **admin_users**: Administrator accounts
- **admin_sessions**: Active admin sessions with token-based auth
- **contacts**: Contact form submissions
- **shop_orders**: Product inquiry submissions
- **newsletter_subscribers**: Email newsletter subscriptions

### New Tables (Enhanced Features)
- **site_content**: CMS content management
- **analytics_events**: Marketing analytics tracking
- **ai_conversations**: OpenAI chat history
- **seo_settings**: SEO metadata per page

## Database File
- **Location**: `database/elnaz_ashrafi.db`
- **Type**: SQLite3
- **Auto-initialization**: Yes (on first app run)

## Backup Strategy
Regular backups should be stored in the `backups/` directory with timestamp naming:
```
elnaz_ashrafi_backup_YYYYMMDD_HHMMSS.db
```

## Migrations
Database migration scripts are stored in `migrations/` directory.

## Security Notes
- Password hashes use SHA256 (consider upgrading to bcrypt for production)
- Session tokens are UUID-based with 24-hour expiry
- The database file should be excluded from version control (.gitignore)
- Regular backups are recommended

## Access
The database is accessed through the `database.py` and `models.py` modules in the backend.
