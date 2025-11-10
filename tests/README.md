# راهنمای اجرای تست‌ها

## 📋 فهرست

1. [نصب ابزارها](#نصب-ابزارها)
2. [اجرای تست‌ها](#اجرای-تستها)
3. [ساختار تست‌ها](#ساختار-تستها)
4. [نوشتن تست جدید](#نوشتن-تست-جدید)

---

## نصب ابزارها

### پیش‌نیازها

- Node.js v18 یا بالاتر
- Python 3.10 یا بالاتر
- pip (Python package manager)

### 1. نصب وابستگی‌های Backend

```bash
cd backend
pip install -r requirements.txt
pip install pytest pytest-flask pytest-cov
```

### 2. نصب Playwright

```bash
npm install
npx playwright install --with-deps
```

### 3. نصب Lighthouse CI

```bash
npm install -g @lhci/cli
```

---

## اجرای تست‌ها

### Backend Tests (pytest)

```bash
# اجرای همه تست‌های API
cd tests/api
pytest -v

# اجرای با coverage report
pytest -v --cov=../../backend --cov-report=html

# اجرای یک فایل خاص
pytest test_shop_api.py -v

# اجرای یک تست خاص
pytest test_shop_api.py::TestProductAPI::test_get_all_products -v
```

### Frontend E2E Tests (Playwright)

```bash
# اجرای همه تست‌ها
npm test

# اجرای در یک مرورگر خاص
npm run test:chromium
npm run test:firefox
npm run test:webkit

# اجرای تست‌های موبایل
npm run test:mobile

# اجرای با UI mode (توصیه می‌شود)
npm run test:ui

# اجرای در حالت debug
npm run test:debug

# اجرای در حالت headed (مشاهده مرورگر)
npm run test:headed

# نمایش گزارش آخرین اجرا
npm run report
```

### Performance & SEO Tests (Lighthouse)

```bash
# اطمینان از اجرای backend
cd backend
python app.py &

# اجرای Lighthouse
npm run lighthouse

# یا با CLI
lhci autorun --config=.lighthouserc.json
```

---

## ساختار تست‌ها

```
tests/
├── e2e/                      # Playwright E2E tests
│   ├── shop.spec.ts          # تست محصولات و سبد خرید
│   ├── checkout.spec.ts      # تست فرآیند خرید
│   └── responsive.spec.ts    # تست واکنش‌گرایی
├── api/                      # pytest API tests
│   └── test_shop_api.py      # تست API های فروشگاه
├── unit/                     # Unit tests (future)
├── performance/              # Performance tests (future)
├── security/                 # Security tests (future)
└── README.md                 # این فایل
```

---

## نوشتن تست جدید

### Playwright Test (E2E)

```typescript
import { test, expect } from '@playwright/test';

test.describe('عنوان گروه تست', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/frontend/shop.html');
  });

  test('توضیح تست', async ({ page }) => {
    // Actions
    await page.click('[data-testid="button"]');

    // Assertions
    await expect(page.locator('.result')).toBeVisible();
  });
});
```

### pytest Test (API)

```python
def test_api_endpoint(client):
    """توضیح تست"""
    response = client.get('/api/shop/products')

    assert response.status_code == 200
    data = json.loads(response.data)
    assert 'products' in data
```

---

## نکات مهم

### 1. Data Test IDs

برای selectability بهتر، از `data-testid` استفاده کنید:

```html
<button data-testid="add-to-cart-btn">افزودن به سبد</button>
```

```typescript
await page.click('[data-testid="add-to-cart-btn"]');
```

### 2. Waiting Strategies

```typescript
// منتظر ماندن برای یک element
await page.waitForSelector('[data-testid="product-card"]');

// منتظر ماندن برای network
await page.waitForLoadState('networkidle');

// منتظر ماندن برای response
await page.waitForResponse(response =>
  response.url().includes('/api/shop/products')
);
```

### 3. Persian Text Testing

```typescript
// جستجوی متن فارسی
await expect(page.locator('text="سبد خرید"')).toBeVisible();

// استفاده از regex
await expect(page.locator('.message')).toContainText(/محصول.*اضافه شد/);
```

---

## CI/CD Integration

تست‌ها به صورت خودکار در GitHub Actions اجرا می‌شوند:

- ✅ Push به هر branch
- ✅ Pull Request ها
- ✅ Manual trigger (`workflow_dispatch`)

### مشاهده نتایج CI

1. به GitHub Repository بروید
2. تب "Actions" را باز کنید
3. آخرین workflow run را انتخاب کنید
4. گزارش‌های HTML را از Artifacts دانلود کنید

---

## Troubleshooting

### مشکل: Backend server start نمی‌شود

```bash
# بررسی port
lsof -i :5000

# kill process
kill -9 <PID>
```

### مشکل: Playwright browsers نصب نیستند

```bash
npx playwright install --with-deps
```

### مشکل: pytest module not found

```bash
pip install pytest pytest-flask
export PYTHONPATH="${PYTHONPATH}:$(pwd)"
```

---

## منابع

- [Playwright Documentation](https://playwright.dev)
- [pytest Documentation](https://docs.pytest.org)
- [Lighthouse CI](https://github.com/GoogleChrome/lighthouse-ci)

---

**نویسنده**: QA Team
**آخرین به‌روزرسانی**: 2025-01-10
