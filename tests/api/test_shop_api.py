# -*- coding: utf-8 -*-
"""
API Tests for Shop Endpoints
Test Cases: TC-015, TC-016, TC-019
"""

import pytest
import json
import time
from flask import Flask


@pytest.fixture
def client():
    """ایجاد test client برای Flask app"""
    import sys
    sys.path.insert(0, './backend')

    from app import app
    app.config['TESTING'] = True

    with app.test_client() as client:
        yield client


class TestProductAPI:
    """تست‌های API محصولات"""

    def test_get_all_products(self, client):
        """TC-006: دریافت لیست تمام محصولات"""
        response = client.get('/api/shop/products')

        assert response.status_code == 200
        data = json.loads(response.data)

        assert 'products' in data
        assert isinstance(data['products'], list)
        assert len(data['products']) >= 0

    def test_get_single_product(self, client):
        """دریافت یک محصول خاص"""
        # ابتدا یک محصول ایجاد کنید
        new_product = {
            'name_fa': 'تابلوی تست',
            'name_en': 'Test Painting',
            'price': 1000000,
            'category': 'نقاشی',
            'stock_quantity': 10
        }

        create_response = client.post('/api/shop/products',
                                       data=json.dumps(new_product),
                                       content_type='application/json')

        assert create_response.status_code == 201
        created_data = json.loads(create_response.data)
        product_id = created_data['product']['id']

        # دریافت محصول
        response = client.get(f'/api/shop/products/{product_id}')

        assert response.status_code == 200
        data = json.loads(response.data)

        assert data['product']['name_fa'] == 'تابلوی تست'
        assert data['product']['price'] == 1000000

    def test_filter_by_category(self, client):
        """TC-007: فیلتر محصولات براساس دسته"""
        response = client.get('/api/shop/products?category=نقاشی')

        assert response.status_code == 200
        data = json.loads(response.data)

        # همه محصولات باید از دسته نقاشی باشند
        for product in data['products']:
            assert product['category'] == 'نقاشی'

    def test_unavailable_products_filtered(self, client):
        """TC-005: محصولات ناموجود نباید نمایش داده شوند"""
        response = client.get('/api/shop/products')

        assert response.status_code == 200
        data = json.loads(response.data)

        # همه محصولات باید is_available=1 باشند
        for product in data['products']:
            assert product.get('is_available', 1) == 1


class TestOrderAPI:
    """تست‌های API سفارش"""

    def test_create_order_success(self, client):
        """TC-003: ایجاد سفارش با اطلاعات صحیح"""
        order_data = {
            'customer_name': 'احمد محمدی',
            'customer_email': 'ahmad@example.com',
            'customer_phone': '09123456789',
            'customer_address': 'تهران، خیابان ولیعصر، پلاک 123',
            'items': [
                {
                    'product_id': 1,
                    'product_name': 'تابلوی انتزاعی',
                    'quantity': 1,
                    'price': 2500000
                }
            ],
            'total_amount': 2500000,
            'payment_method': 'cash',
            'notes': 'لطفا قبل از ارسال تماس بگیرید'
        }

        response = client.post('/api/shop/orders',
                                data=json.dumps(order_data),
                                content_type='application/json')

        assert response.status_code == 201
        data = json.loads(response.data)

        assert 'order' in data
        assert 'order_number' in data['order']
        assert data['order']['customer_name'] == 'احمد محمدی'
        assert data['order']['status'] == 'pending'

        # بررسی فرمت order_number
        order_number = data['order']['order_number']
        assert order_number.startswith('ORD-')

    def test_create_order_missing_fields(self, client):
        """TC-004: ایجاد سفارش با فیلدهای خالی"""
        order_data = {
            'customer_name': '',
            'customer_email': '',
            'items': []
        }

        response = client.post('/api/shop/orders',
                                data=json.dumps(order_data),
                                content_type='application/json')

        assert response.status_code == 400
        data = json.loads(response.data)

        assert 'error' in data
        # پیام خطا باید شامل validation error باشد

    def test_create_order_invalid_email(self, client):
        """ایجاد سفارش با ایمیل نامعتبر"""
        order_data = {
            'customer_name': 'احمد محمدی',
            'customer_email': 'invalid-email',
            'customer_phone': '09123456789',
            'items': [
                {'product_id': 1, 'quantity': 1, 'price': 1000}
            ],
            'total_amount': 1000
        }

        response = client.post('/api/shop/orders',
                                data=json.dumps(order_data),
                                content_type='application/json')

        # باید خطای validation برگردد
        assert response.status_code in [400, 422]

    def test_get_order_by_number(self, client):
        """دریافت سفارش با شماره پیگیری"""
        # ابتدا یک سفارش ایجاد کنید
        order_data = {
            'customer_name': 'احمد محمدی',
            'customer_email': 'ahmad@example.com',
            'customer_phone': '09123456789',
            'items': [
                {'product_id': 1, 'product_name': 'تست', 'quantity': 1, 'price': 1000}
            ],
            'total_amount': 1000
        }

        create_response = client.post('/api/shop/orders',
                                       data=json.dumps(order_data),
                                       content_type='application/json')

        created_data = json.loads(create_response.data)
        order_number = created_data['order']['order_number']

        # دریافت سفارش با شماره
        response = client.get(f'/api/shop/orders/track/{order_number}')

        assert response.status_code == 200
        data = json.loads(response.data)

        assert data['order']['order_number'] == order_number


class TestSecurityAPI:
    """تست‌های امنیتی API"""

    def test_sql_injection_protection(self, client):
        """TC-015: محافظت در برابر SQL Injection"""
        # تلاش برای SQL injection
        malicious_payloads = [
            "' OR '1'='1",
            "'; DROP TABLE products--",
            "' UNION SELECT * FROM admin_users--"
        ]

        for payload in malicious_payloads:
            response = client.get(f'/api/shop/products?category={payload}')

            # نباید خطای SQL برگردد
            assert response.status_code in [200, 400, 404]

            # نباید اطلاعات حساس leak شود
            data = response.get_data(as_text=True)
            assert 'admin_users' not in data.lower()
            assert 'password' not in data.lower()
            assert 'sqlite' not in data.lower()

    def test_xss_protection_in_orders(self, client):
        """TC-014: محافظت در برابر XSS"""
        xss_payload = '<script>alert("XSS")</script>'

        order_data = {
            'customer_name': xss_payload,
            'customer_email': 'test@example.com',
            'customer_phone': '09123456789',
            'items': [
                {'product_id': 1, 'product_name': 'تست', 'quantity': 1, 'price': 1000}
            ],
            'total_amount': 1000,
            'notes': xss_payload
        }

        response = client.post('/api/shop/orders',
                                data=json.dumps(order_data),
                                content_type='application/json')

        # اگر order ایجاد شد، XSS نباید اجرا شود
        if response.status_code == 201:
            data = json.loads(response.data)

            # بررسی escape شدن HTML entities
            assert '<script>' not in str(data)
            # یا اینکه rejected شود
        # یا اینکه request رد شود
        assert response.status_code in [201, 400, 422]

    def test_unauthorized_admin_access(self, client):
        """TC-016: دسترسی به پنل ادمین بدون لاگین"""
        # تلاش برای دسترسی به endpoint های admin بدون token
        admin_endpoints = [
            '/api/admin/orders',
            '/api/admin/contacts',
            '/api/admin/stats'
        ]

        for endpoint in admin_endpoints:
            response = client.get(endpoint)

            # باید 401 Unauthorized برگردد
            assert response.status_code == 401

            data = json.loads(response.data)
            assert 'error' in data or 'message' in data


class TestPerformanceAPI:
    """تست‌های Performance API"""

    def test_api_response_time(self, client):
        """TC-019: زمان پاسخ API کمتر از 500ms"""
        start_time = time.time()

        response = client.get('/api/shop/products')

        end_time = time.time()
        elapsed_time = (end_time - start_time) * 1000  # convert to ms

        assert response.status_code == 200
        assert elapsed_time < 500, f"API response time: {elapsed_time}ms (should be < 500ms)"

    def test_concurrent_requests(self, client):
        """تست همزمانی درخواست‌ها"""
        import concurrent.futures

        def make_request():
            return client.get('/api/shop/products')

        # 10 درخواست همزمان
        with concurrent.futures.ThreadPoolExecutor(max_workers=10) as executor:
            futures = [executor.submit(make_request) for _ in range(10)]
            results = [f.result() for f in concurrent.futures.as_completed(futures)]

        # همه درخواست‌ها باید موفق باشند
        for response in results:
            assert response.status_code == 200


class TestCategoriesAPI:
    """تست API دسته‌بندی‌ها"""

    def test_get_categories(self, client):
        """دریافت لیست دسته‌بندی‌ها"""
        response = client.get('/api/shop/categories')

        assert response.status_code == 200
        data = json.loads(response.data)

        assert 'categories' in data
        assert isinstance(data['categories'], list)


# اجرای تست‌ها
if __name__ == '__main__':
    pytest.main([__file__, '-v', '--tb=short'])
