import { test, expect } from '@playwright/test';

/**
 * E2E Tests for Checkout Process
 * Test Cases: TC-003, TC-004
 */

test.describe('فرآیند خرید و تسویه‌حساب', () => {
  test.beforeEach(async ({ page }) => {
    // افزودن محصول به سبد
    await page.goto('/frontend/shop.html');
    await page.waitForLoadState('networkidle');
    await page.waitForSelector('[data-testid="product-card"]', { timeout: 10000 });

    // افزودن یک محصول به سبد
    await page.locator('[data-testid="add-to-cart-btn"]').first().click();
    await page.waitForTimeout(1000);
  });

  /**
   * TC-003: تکمیل فرآیند پرداخت با اطلاعات صحیح
   * Priority: High
   * Test Type: Manual converted to Automated
   */
  test('باید سفارش را با اطلاعات صحیح ثبت کند', async ({ page }) => {
    // رفتن به صفحه checkout
    await page.locator('[data-testid="checkout-btn"], .checkout-button, button:has-text("تکمیل خرید")').click();
    await page.waitForTimeout(500);

    // پر کردن فرم
    await page.fill('[name="customer_name"], [data-testid="name-input"]', 'احمد محمدی');
    await page.fill('[name="customer_email"], [data-testid="email-input"]', 'ahmad@example.com');
    await page.fill('[name="customer_phone"], [data-testid="phone-input"]', '09123456789');
    await page.fill('[name="customer_address"], [data-testid="address-input"]', 'تهران، خیابان ولیعصر، پلاک 123');

    // انتخاب روش پرداخت (اگر وجود دارد)
    const paymentMethod = page.locator('[name="payment_method"]');
    if (await paymentMethod.isVisible()) {
      await paymentMethod.selectOption('cash');
    }

    // یادداشت (اختیاری)
    const notesField = page.locator('[name="notes"], [data-testid="notes-input"]');
    if (await notesField.isVisible()) {
      await notesField.fill('لطفا قبل از ارسال تماس بگیرید');
    }

    // ثبت سفارش
    await page.locator('[data-testid="submit-order-btn"], button:has-text("ثبت سفارش")').click();

    // منتظر پاسخ API
    await page.waitForResponse(response =>
      response.url().includes('/api/shop/orders') && response.status() === 200,
      { timeout: 10000 }
    );

    // بررسی پیام موفقیت
    await expect(page.locator('.success-message, .toast-success')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('text="سفارش شما با موفقیت ثبت شد"')).toBeVisible();

    // بررسی نمایش شماره پیگیری
    const orderNumber = page.locator('[data-testid="order-number"], .tracking-number');
    await expect(orderNumber).toBeVisible();

    const orderNumberText = await orderNumber.textContent();
    expect(orderNumberText).toMatch(/ORD-\d+-\w+/);

    // بررسی خالی شدن سبد
    const cartItems = await page.evaluate(() => {
      return JSON.parse(localStorage.getItem('cart') || '[]');
    });
    expect(cartItems.length).toBe(0);
  });

  /**
   * TC-004: ثبت سفارش با فیلدهای خالی
   * Priority: High
   * Test Type: Automated
   */
  test('نباید سفارش با فیلدهای خالی ثبت شود', async ({ page }) => {
    // رفتن به صفحه checkout
    await page.locator('[data-testid="checkout-btn"], .checkout-button, button:has-text("تکمیل خرید")').click();
    await page.waitForTimeout(500);

    // فرم را خالی نگه دارید و سعی کنید ثبت کنید
    await page.locator('[data-testid="submit-order-btn"], button:has-text("ثبت سفارش")').click();

    // بررسی پیام‌های خطا
    const nameError = page.locator('[data-error="customer_name"], .error-name');
    const emailError = page.locator('[data-error="customer_email"], .error-email');
    const phoneError = page.locator('[data-error="customer_phone"], .error-phone');

    // حداقل یکی از پیام‌های خطا باید نمایش داده شود
    const errorMessages = page.locator('.error-message, .field-error, .text-red-500');
    await expect(errorMessages.first()).toBeVisible({ timeout: 3000 });

    // فرم نباید submit شود (هنوز در صفحه checkout هستیم)
    await expect(page.locator('[data-testid="submit-order-btn"]')).toBeVisible();
  });

  /**
   * اعتبارسنجی ایمیل نامعتبر
   */
  test('نباید ایمیل نامعتبر را قبول کند', async ({ page }) => {
    await page.locator('[data-testid="checkout-btn"], button:has-text("تکمیل خرید")').click();
    await page.waitForTimeout(500);

    // وارد کردن ایمیل نامعتبر
    await page.fill('[name="customer_name"]', 'احمد محمدی');
    await page.fill('[name="customer_email"]', 'invalid-email');
    await page.fill('[name="customer_phone"]', '09123456789');
    await page.fill('[name="customer_address"]', 'تهران');

    await page.locator('button:has-text("ثبت سفارش")').click();

    // بررسی پیام خطای ایمیل
    const emailError = page.locator('[data-error="customer_email"], .error-email, text="ایمیل نامعتبر"');
    await expect(emailError).toBeVisible({ timeout: 3000 });
  });

  /**
   * اعتبارسنجی شماره تلفن نامعتبر
   */
  test('نباید شماره تلفن نامعتبر را قبول کند', async ({ page }) => {
    await page.locator('[data-testid="checkout-btn"], button:has-text("تکمیل خرید")').click();
    await page.waitForTimeout(500);

    await page.fill('[name="customer_name"]', 'احمد محمدی');
    await page.fill('[name="customer_email"]', 'ahmad@example.com');

    // شماره تلفن نامعتبر (کمتر از 11 رقم)
    await page.fill('[name="customer_phone"]', '091234');
    await page.fill('[name="customer_address"]', 'تهران');

    await page.locator('button:has-text("ثبت سفارش")').click();

    // بررسی پیام خطا
    const phoneError = page.locator('[data-error="customer_phone"], .error-phone, text="شماره تلفن نامعتبر"');
    await expect(phoneError).toBeVisible({ timeout: 3000 });
  });
});

test.describe('سبد خرید خالی', () => {
  /**
   * تست checkout با سبد خالی
   */
  test('نباید بتوان با سبد خالی به checkout رفت', async ({ page }) => {
    await page.goto('/frontend/shop.html');
    await page.waitForLoadState('networkidle');

    // پاک کردن سبد
    await page.evaluate(() => {
      localStorage.removeItem('cart');
    });

    await page.reload();
    await page.waitForTimeout(500);

    // سعی کنید به checkout بروید
    const checkoutBtn = page.locator('[data-testid="checkout-btn"], button:has-text("تکمیل خرید")');

    if (await checkoutBtn.isVisible()) {
      // دکمه باید غیرفعال باشد
      await expect(checkoutBtn).toBeDisabled();
    } else {
      // یا اصلاً نمایش داده نشود
      await expect(checkoutBtn).toBeHidden();
    }

    // پیام سبد خالی باید نمایش داده شود
    await expect(page.locator('text="سبد خرید شما خالی است"')).toBeVisible();
  });
});
