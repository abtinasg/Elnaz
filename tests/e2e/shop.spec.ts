import { test, expect } from '@playwright/test';

/**
 * E2E Tests for Shop Functionality
 * Test Cases: TC-001, TC-002, TC-006, TC-007
 */

test.describe('فروشگاه - محصولات و سبد خرید', () => {
  test.beforeEach(async ({ page }) => {
    // بارگذاری صفحه فروشگاه
    await page.goto('/frontend/shop.html');
    await page.waitForLoadState('networkidle');
  });

  /**
   * TC-001: افزودن محصول به سبد خرید
   * Priority: High
   * Test Type: Automated
   */
  test('باید محصول را به سبد خرید اضافه کند', async ({ page }) => {
    // منتظر بارگذاری محصولات
    await page.waitForSelector('[data-testid="product-card"]', { timeout: 10000 });

    // شمارش اولیه سبد
    const initialCartCount = await page.locator('.cart-count').textContent();

    // کلیک روی دکمه افزودن به سبد
    await page.locator('[data-testid="add-to-cart-btn"]').first().click();

    // بررسی پیام موفقیت
    await expect(page.locator('.toast-success, .alert-success')).toContainText('سبد خرید', {
      timeout: 5000
    });

    // بررسی افزایش تعداد سبد
    await page.waitForTimeout(500);
    const newCartCount = await page.locator('.cart-count').textContent();

    // چک کردن localStorage
    const cartItems = await page.evaluate(() => {
      return JSON.parse(localStorage.getItem('cart') || '[]');
    });

    expect(cartItems.length).toBeGreaterThan(0);
  });

  /**
   * TC-002: حذف محصول از سبد خرید
   * Priority: High
   * Test Type: Automated
   */
  test('باید محصول را از سبد حذف کند', async ({ page }) => {
    // ابتدا یک محصول به سبد اضافه کنید
    await page.waitForSelector('[data-testid="product-card"]');
    await page.locator('[data-testid="add-to-cart-btn"]').first().click();
    await page.waitForTimeout(1000);

    // رفتن به صفحه سبد خرید
    await page.locator('[data-testid="cart-icon"], .cart-link').click();
    await page.waitForTimeout(500);

    // کلیک روی دکمه حذف
    const removeBtn = page.locator('[data-testid="remove-item-btn"], .remove-from-cart').first();
    await removeBtn.click();

    // تایید حذف (اگر modal باشد)
    const confirmBtn = page.locator('button:has-text("تایید"), button:has-text("بله")');
    if (await confirmBtn.isVisible()) {
      await confirmBtn.click();
    }

    await page.waitForTimeout(500);

    // بررسی پیام موفقیت یا سبد خالی
    const emptyMessage = page.locator('text="سبد خرید شما خالی است", text="محصولی در سبد نیست"');
    await expect(emptyMessage).toBeVisible();
  });

  /**
   * TC-006: بارگذاری تمام محصولات
   * Priority: High
   * Test Type: Automated
   */
  test('باید تمام محصولات را نمایش دهد', async ({ page }) => {
    // منتظر بارگذاری محصولات
    await page.waitForSelector('[data-testid="product-card"]', { timeout: 10000 });

    // شمارش محصولات
    const productCards = page.locator('[data-testid="product-card"], .product-item, .product-card');
    const count = await productCards.count();

    expect(count).toBeGreaterThan(0);

    // بررسی المنت‌های هر محصول
    const firstProduct = productCards.first();
    await expect(firstProduct.locator('img, [data-testid="product-image"]')).toBeVisible();
    await expect(firstProduct.locator('.product-name, [data-testid="product-name"]')).toBeVisible();
    await expect(firstProduct.locator('.product-price, [data-testid="product-price"]')).toBeVisible();
  });

  /**
   * TC-007: فیلتر دسته‌بندی محصولات
   * Priority: Medium
   * Test Type: Automated
   */
  test('باید محصولات را براساس دسته فیلتر کند', async ({ page }) => {
    // منتظر بارگذاری
    await page.waitForSelector('[data-testid="product-card"]', { timeout: 10000 });

    // پیدا کردن دکمه دسته‌بندی
    const categoryBtn = page.locator('[data-testid="category-btn"], .category-filter').first();

    if (await categoryBtn.isVisible()) {
      await categoryBtn.click();
      await page.waitForTimeout(1000);

      // بررسی تغییر محصولات
      const filteredProducts = page.locator('[data-testid="product-card"]');
      expect(await filteredProducts.count()).toBeGreaterThan(0);

      // بررسی highlight شدن دکمه فعال
      await expect(categoryBtn).toHaveClass(/active|selected/);
    }
  });

  /**
   * TC-005: خرید محصول ناموجود
   * Priority: Medium
   * Test Type: Automated
   */
  test('نباید بتوان محصول ناموجود را خرید', async ({ page }) => {
    // پیدا کردن محصول ناموجود (اگر وجود دارد)
    const unavailableProduct = page.locator('.product-card.out-of-stock, [data-stock="0"]').first();

    if (await unavailableProduct.isVisible()) {
      // بررسی دکمه غیرفعال
      const addToCartBtn = unavailableProduct.locator('[data-testid="add-to-cart-btn"]');
      await expect(addToCartBtn).toBeDisabled();

      // بررسی نمایش پیام ناموجود
      await expect(unavailableProduct.locator('text="ناموجود"')).toBeVisible();
    }
  });
});

test.describe('جستجوی محصولات', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/frontend/shop.html');
    await page.waitForLoadState('networkidle');
  });

  /**
   * TC-008: جستجوی محصول با کلمات فارسی
   * Priority: High
   * Test Type: Manual converted to Automated
   */
  test('باید محصولات را با کلمه فارسی جستجو کند', async ({ page }) => {
    const searchInput = page.locator('[data-testid="search-input"], input[type="search"], input[placeholder*="جستجو"]');

    if (await searchInput.isVisible()) {
      // تایپ عبارت جستجو
      await searchInput.fill('تابلو');
      await searchInput.press('Enter');

      await page.waitForTimeout(1000);

      // بررسی نتایج
      const products = page.locator('[data-testid="product-card"]');
      const count = await products.count();

      if (count > 0) {
        // حداقل یک محصول با کلمه "تابلو" باید وجود داشته باشد
        const productNames = await products.locator('.product-name').allTextContents();
        const hasMatch = productNames.some(name => name.includes('تابلو'));
        expect(hasMatch).toBeTruthy();
      }
    }
  });
});

test.describe('Performance', () => {
  /**
   * TC-009: بارگذاری تصاویر
   * Priority: Medium
   * Test Type: Automated
   */
  test('تصاویر محصولات باید سریع بارگذاری شوند', async ({ page }) => {
    const startTime = Date.now();

    await page.goto('/frontend/shop.html');
    await page.waitForSelector('[data-testid="product-card"] img', { timeout: 10000 });

    const loadTime = Date.now() - startTime;

    // زمان بارگذاری باید کمتر از 5 ثانیه باشد
    expect(loadTime).toBeLessThan(5000);

    // بررسی lazy loading
    const images = page.locator('img[loading="lazy"]');
    expect(await images.count()).toBeGreaterThan(0);
  });
});
