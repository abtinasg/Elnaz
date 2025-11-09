# راهنمای راه‌اندازی پروژه

## نصب وابستگی‌ها

ابتدا وابستگی‌های پایتون را نصب کنید:

```bash
pip install -r requirements.txt
```

## اجرای سرور

سه روش برای اجرای سرور وجود دارد:

### روش 1: استفاده از اسکریپت run_server.py (پیشنهادی)
```bash
python run_server.py
```

### روش 2: اجرای مستقیم به عنوان ماژول
```bash
python -m backend.app
```

### روش 3: اجرای با Flask CLI
```bash
export FLASK_APP=backend.app
flask run
```

## ایجاد کاربر مدیر (Admin)

برای ایجاد کاربر مدیر، اسکریپت زیر را اجرا کنید:

```bash
python backend/create_admin.py
```

## اضافه کردن محصولات نمونه

برای اضافه کردن محصولات نمونه به فروشگاه:

```bash
python add_sample_products.py
```

## ساختار پروژه

```
Elnaz/
├── backend/              # کد بک‌اند Flask
│   ├── app.py           # اپلیکیشن اصلی Flask
│   ├── database.py      # مدیریت دیتابیس
│   ├── models.py        # مدل‌های دیتابیس
│   ├── auth_utils.py    # ابزارهای احراز هویت
│   ├── create_admin.py  # اسکریپت ایجاد ادمین
│   └── routes/          # API endpoints
├── frontend/            # فایل‌های فرانت‌اند
├── database/            # فایل دیتابیس SQLite
├── run_server.py        # اسکریپت اجرای سرور
└── requirements.txt     # وابستگی‌های پایتون
```

## نکات مهم

- همه import های داخل پکیج `backend` از relative imports استفاده می‌کنند
- برای اجرای اسکریپت‌ها، حتماً از دایرکتوری root پروژه اجرا کنید
- دیتابیس به صورت خودکار در اولین اجرا ایجاد می‌شود
