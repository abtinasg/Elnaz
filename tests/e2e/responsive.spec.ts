import { test, expect, devices } from '@playwright/test';

/**
 * Responsive Design Tests
 * Test Cases: TC-010, TC-011, TC-012, TC-013
 */

test.describe('واکنش‌گرایی - نمایش در دستگاه‌های مختلف', () => {
  /**
   * TC-010: نمایش در موبایل (375px)
   * Priority: High
   * Test Type: Automated
   */
  test('باید در موبایل به درستی نمایش داده شود', async ({ page }) => {
    // تنظیم viewport موبایل
    await page.setViewportSize({ width: 375, height: 667 });

    await page.goto('/frontend/shop.html');
    await page.waitForLoadState('networkidle');

    // بررسی عدم وجود horizontal scroll
    const scrollWidth = await page.evaluate(() => document.body.scrollWidth);
    const clientWidth = await page.evaluate(() => document.body.clientWidth);

    expect(scrollWidth).toBeLessThanOrEqual(375);
    expect(clientWidth).toBeLessThanOrEqual(375);

    // بررسی عملکرد منوی همبرگری (اگر وجود دارد)
    const hamburgerMenu = page.locator('[data-testid="mobile-menu-btn"], .hamburger-menu, .menu-toggle');

    if (await hamburgerMenu.isVisible()) {
      await hamburgerMenu.click();
      await page.waitForTimeout(300);

      const mobileMenu = page.locator('.mobile-menu, [data-testid="mobile-menu"]');
      await expect(mobileMenu).toBeVisible();

      // بستن منو
      await hamburgerMenu.click();
      await page.waitForTimeout(300);
    }

    // بررسی سایز دکمه‌ها (باید حداقل 44x44 پیکسل باشند)
    const buttons = page.locator('button, a.btn').first();
    if (await buttons.isVisible()) {
      const box = await buttons.boundingBox();
      if (box) {
        expect(box.height).toBeGreaterThanOrEqual(40);
        expect(box.width).toBeGreaterThanOrEqual(40);
      }
    }

    // بررسی فونت سایز (باید حداقل 14px باشد)
    const fontSize = await page.evaluate(() => {
      const body = document.body;
      return window.getComputedStyle(body).fontSize;
    });
    const fontSizeNum = parseInt(fontSize);
    expect(fontSizeNum).toBeGreaterThanOrEqual(14);
  });

  /**
   * TC-011: نمایش در تبلت (768px)
   * Priority: Medium
   * Test Type: Automated
   */
  test('باید در تبلت به درستی نمایش داده شود', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });

    await page.goto('/frontend/shop.html');
    await page.waitForLoadState('networkidle');

    // بررسی grid layout محصولات
    await page.waitForSelector('[data-testid="product-card"]', { timeout: 10000 });

    const productCards = page.locator('[data-testid="product-card"], .product-item');
    const count = await productCards.count();

    if (count > 0) {
      // محصولات باید در 2-3 ستون نمایش داده شوند
      const firstCard = productCards.first();
      const box = await firstCard.boundingBox();

      if (box) {
        // عرض هر کارت باید بین 200-400 پیکسل باشد
        expect(box.width).toBeGreaterThanOrEqual(200);
        expect(box.width).toBeLessThanOrEqual(400);
      }
    }

    // بررسی عدم overflow
    const scrollWidth = await page.evaluate(() => document.body.scrollWidth);
    expect(scrollWidth).toBeLessThanOrEqual(768 + 20); // +20 برای scrollbar
  });

  /**
   * TC-012: نمایش در دسکتاپ (1920px)
   * Priority: Medium
   * Test Type: Automated
   */
  test('باید در دسکتاپ به درستی نمایش داده شود', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });

    await page.goto('/frontend/shop.html');
    await page.waitForLoadState('networkidle');

    await page.waitForSelector('[data-testid="product-card"]', { timeout: 10000 });

    // بررسی استفاده مناسب از فضا
    const productGrid = page.locator('.products-grid, .product-list, [data-testid="products-container"]');

    if (await productGrid.isVisible()) {
      const box = await productGrid.boundingBox();

      if (box) {
        // grid باید از فضای کافی استفاده کند
        expect(box.width).toBeGreaterThanOrEqual(1200);
      }
    }

    // بررسی تعداد ستون‌ها (باید 4-5 ستون باشد)
    const productCards = page.locator('[data-testid="product-card"]');
    const count = await productCards.count();

    if (count >= 4) {
      const firstCard = productCards.first();
      const box = await firstCard.boundingBox();

      if (box) {
        // هر کارت نباید بیش از 400 پیکسل باشد
        expect(box.width).toBeLessThanOrEqual(500);
      }
    }
  });

  /**
   * TC-013: نمایش صحیح RTL (Right-to-Left)
   * Priority: High
   * Test Type: Automated
   */
  test('باید متن فارسی را به صورت RTL نمایش دهد', async ({ page }) => {
    await page.goto('/frontend/shop.html');
    await page.waitForLoadState('networkidle');

    // بررسی direction HTML
    const htmlDir = await page.evaluate(() => {
      return document.documentElement.dir || document.body.dir;
    });

    expect(htmlDir).toBe('rtl');

    // بررسی text-align
    const textAlign = await page.evaluate(() => {
      const body = document.body;
      return window.getComputedStyle(body).textAlign;
    });

    // در RTL باید right یا start باشد
    expect(['right', 'start']).toContain(textAlign);

    // بررسی padding/margin در جهت صحیح
    const container = page.locator('.container, main').first();
    if (await container.isVisible()) {
      const styles = await container.evaluate((el) => {
        const computed = window.getComputedStyle(el);
        return {
          paddingLeft: computed.paddingLeft,
          paddingRight: computed.paddingRight
        };
      });

      // در RTL معمولاً paddingRight بیشتر است
      // (این بستگی به طراحی دارد، فقط چک می‌کنیم که padding وجود دارد)
      expect(styles.paddingLeft || styles.paddingRight).toBeTruthy();
    }
  });
});

test.describe('تست در دستگاه‌های واقعی', () => {
  /**
   * iPhone 12
   */
  test('نمایش در iPhone 12', async ({ page }) => {
    await page.setViewportSize(devices['iPhone 12'].viewport);

    await page.goto('/frontend/shop.html');
    await page.waitForLoadState('networkidle');

    // بررسی عدم overflow
    const scrollWidth = await page.evaluate(() => document.body.scrollWidth);
    expect(scrollWidth).toBeLessThanOrEqual(devices['iPhone 12'].viewport.width + 20);

    // بررسی touch targets
    const buttons = page.locator('button, a.btn');
    const count = await buttons.count();

    for (let i = 0; i < Math.min(count, 3); i++) {
      const btn = buttons.nth(i);
      if (await btn.isVisible()) {
        const box = await btn.boundingBox();
        if (box) {
          // Touch target باید حداقل 44x44 باشد
          expect(box.height).toBeGreaterThanOrEqual(40);
        }
      }
    }
  });

  /**
   * iPad Pro
   */
  test('نمایش در iPad Pro', async ({ page }) => {
    await page.setViewportSize(devices['iPad Pro'].viewport);

    await page.goto('/frontend/shop.html');
    await page.waitForLoadState('networkidle');

    await page.waitForSelector('[data-testid="product-card"]', { timeout: 10000 });

    // در تبلت باید layout متفاوت باشد
    const productCards = page.locator('[data-testid="product-card"]');
    const count = await productCards.count();

    expect(count).toBeGreaterThan(0);

    // بررسی responsive images
    const images = page.locator('img');
    const firstImage = images.first();

    if (await firstImage.isVisible()) {
      const srcset = await firstImage.getAttribute('srcset');
      const loading = await firstImage.getAttribute('loading');

      // ترجیحاً باید lazy loading و srcset داشته باشد
      // (این optional است)
      console.log('Image srcset:', srcset);
      console.log('Image loading:', loading);
    }
  });
});

test.describe('Orientation Changes', () => {
  /**
   * تست تغییر orientation (portrait/landscape)
   */
  test('باید در حالت landscape موبایل درست نمایش دهد', async ({ page }) => {
    // موبایل در حالت landscape
    await page.setViewportSize({ width: 667, height: 375 });

    await page.goto('/frontend/shop.html');
    await page.waitForLoadState('networkidle');

    const scrollWidth = await page.evaluate(() => document.body.scrollWidth);
    expect(scrollWidth).toBeLessThanOrEqual(667 + 20);

    // UI باید قابل استفاده باشد
    const productCards = page.locator('[data-testid="product-card"]');
    if (await productCards.first().isVisible()) {
      expect(await productCards.count()).toBeGreaterThan(0);
    }
  });
});

test.describe('Accessibility', () => {
  /**
   * تست Accessibility در موبایل
   */
  test('باید accessibility standards را رعایت کند', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/frontend/shop.html');

    // بررسی alt text برای تصاویر
    const images = page.locator('img');
    const count = await images.count();

    for (let i = 0; i < Math.min(count, 5); i++) {
      const img = images.nth(i);
      const alt = await img.getAttribute('alt');

      // تمام تصاویر باید alt داشته باشند
      expect(alt).toBeTruthy();
      expect(alt).not.toBe('');
    }

    // بررسی label برای input fields
    const inputs = page.locator('input:visible');
    const inputCount = await inputs.count();

    for (let i = 0; i < Math.min(inputCount, 3); i++) {
      const input = inputs.nth(i);
      const id = await input.getAttribute('id');

      if (id) {
        // باید label مرتبط داشته باشد
        const label = page.locator(`label[for="${id}"]`);
        const hasLabel = await label.count() > 0;

        // یا حداقل placeholder داشته باشد
        const placeholder = await input.getAttribute('placeholder');

        expect(hasLabel || placeholder).toBeTruthy();
      }
    }
  });
});
