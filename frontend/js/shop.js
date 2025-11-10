/**
 * Enhanced Shop Page JavaScript
 * Professional E-commerce functionality with advanced features
 */

// API Base URL
const API_URL = window.location.origin + '/api/shop';

// State Management
let cart = [];
let wishlist = [];
let products = [];
let filteredProducts = [];
let currentUser = null;
let authToken = null;

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    loadCart();
    loadWishlist();
    loadProducts();
    loadCategories();
    initEventListeners();
    updateCartUI();
    updateWishlistUI();
});

// ==================== CART MANAGEMENT ====================

function loadCart() {
    const savedCart = localStorage.getItem('shop_cart');
    if (savedCart) {
        try {
            cart = JSON.parse(savedCart);
        } catch (e) {
            cart = [];
        }
    }
}

function saveCart() {
    localStorage.setItem('shop_cart', JSON.stringify(cart));
    updateCartUI();
}

function addToCart(product) {
    const existingItem = cart.find(item => item.id === product.id);

    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            id: product.id,
            name_fa: product.name_fa,
            price: product.price,
            image_url: product.image_url,
            quantity: 1
        });
    }

    saveCart();
    showNotification('محصول به سبد خرید اضافه شد', 'success');
}

function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    saveCart();
    renderCartItems();
}

function updateQuantity(productId, change) {
    const item = cart.find(item => item.id === productId);
    if (item) {
        item.quantity += change;
        if (item.quantity <= 0) {
            removeFromCart(productId);
        } else {
            saveCart();
            renderCartItems();
        }
    }
}

function clearCart() {
    cart = [];
    saveCart();
    renderCartItems();
}

function updateCartUI() {
    const cartCount = document.getElementById('cart-count');
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

    if (totalItems > 0) {
        cartCount.textContent = totalItems;
        cartCount.classList.remove('hidden');
    } else {
        cartCount.classList.add('hidden');
    }
}

function renderCartItems() {
    const cartItems = document.getElementById('cart-items');
    const cartEmpty = document.getElementById('cart-empty');
    const cartFooter = document.getElementById('cart-footer');
    const cartTotal = document.getElementById('cart-total');

    if (cart.length === 0) {
        cartItems.innerHTML = '';
        cartEmpty.classList.remove('hidden');
        cartFooter.classList.add('hidden');
        return;
    }

    cartEmpty.classList.add('hidden');
    cartFooter.classList.remove('hidden');

    let total = 0;
    cartItems.innerHTML = cart.map(item => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;

        return `
            <div class="flex items-center gap-4 p-4 bg-dark-700 rounded-xl mb-3 border border-dark-600">
                <div class="w-20 h-20 bg-dark-600 rounded-lg flex items-center justify-center text-3xl overflow-hidden">
                    ${item.image_url ? `<img src="${item.image_url}" class="w-full h-full object-cover" />` : '🖼️'}
                </div>
                <div class="flex-1">
                    <h4 class="font-semibold mb-1">${item.name_fa}</h4>
                    <p class="text-sm text-accent-secondary">${formatPrice(item.price)} تومان</p>
                </div>
                <div class="flex items-center gap-3">
                    <button onclick="updateQuantity(${item.id}, -1)" class="w-8 h-8 bg-dark-600 rounded-full hover:bg-dark-500 transition">-</button>
                    <span class="w-8 text-center font-semibold">${item.quantity}</span>
                    <button onclick="updateQuantity(${item.id}, 1)" class="w-8 h-8 bg-gradient-to-r from-accent-gold to-accent-purple rounded-full transition">+</button>
                </div>
                <button onclick="removeFromCart(${item.id})" class="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                    </svg>
                </button>
            </div>
        `;
    }).join('');

    cartTotal.textContent = formatPrice(total) + ' تومان';
}

// ==================== WISHLIST MANAGEMENT ====================

function loadWishlist() {
    const savedWishlist = localStorage.getItem('shop_wishlist');
    if (savedWishlist) {
        try {
            wishlist = JSON.parse(savedWishlist);
        } catch (e) {
            wishlist = [];
        }
    }
}

function saveWishlist() {
    localStorage.setItem('shop_wishlist', JSON.stringify(wishlist));
    updateWishlistUI();
}

function toggleWishlist(product) {
    const index = wishlist.findIndex(item => item.id === product.id);

    if (index > -1) {
        wishlist.splice(index, 1);
        showNotification('محصول از علاقه‌مندی‌ها حذف شد', 'info');
    } else {
        wishlist.push({
            id: product.id,
            name_fa: product.name_fa,
            price: product.price,
            image_url: product.image_url,
            description_fa: product.description_fa,
            category: product.category
        });
        showNotification('محصول به علاقه‌مندی‌ها اضافه شد', 'success');
    }

    saveWishlist();
    renderProducts(filteredProducts);
    renderWishlistItems();
}

function updateWishlistUI() {
    const wishlistCount = document.getElementById('wishlist-count');

    if (wishlist.length > 0) {
        wishlistCount.textContent = wishlist.length;
        wishlistCount.classList.remove('hidden');
    } else {
        wishlistCount.classList.add('hidden');
    }
}

function renderWishlistItems() {
    const wishlistItems = document.getElementById('wishlist-items');
    const wishlistEmpty = document.getElementById('wishlist-empty');

    if (wishlist.length === 0) {
        wishlistItems.innerHTML = '';
        wishlistEmpty.classList.remove('hidden');
        return;
    }

    wishlistEmpty.classList.add('hidden');

    wishlistItems.innerHTML = wishlist.map(product => `
        <div class="bg-dark-700 rounded-xl overflow-hidden border border-dark-600 hover:border-accent-gold transition-all">
            <div class="aspect-square bg-dark-600 flex items-center justify-center text-6xl overflow-hidden">
                ${product.image_url ? `<img src="${product.image_url}" class="w-full h-full object-cover" />` : '🖼️'}
            </div>
            <div class="p-4">
                <h4 class="font-semibold mb-2">${product.name_fa}</h4>
                <div class="flex items-center justify-between">
                    <span class="text-accent-gold font-bold">${formatPrice(product.price)} تومان</span>
                    <div class="flex gap-2">
                        <button onclick='addToCart(${JSON.stringify(product).replace(/'/g, "&apos;")})'
                                class="p-2 bg-gradient-to-r from-accent-gold to-accent-purple rounded-lg hover:shadow-lg transition">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/>
                            </svg>
                        </button>
                        <button onclick='toggleWishlist(${JSON.stringify(product).replace(/'/g, "&apos;")})'
                                class="p-2 bg-red-500/20 text-red-500 rounded-lg hover:bg-red-500/30 transition">
                            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}

// ==================== PRODUCTS ====================

async function loadProducts(category = '') {
    const loadingEl = document.getElementById('loading-products');
    const gridEl = document.getElementById('products-grid');
    const emptyEl = document.getElementById('empty-products');

    try {
        loadingEl.classList.remove('hidden');
        gridEl.classList.add('hidden');
        emptyEl.classList.add('hidden');

        const url = category ? `${API_URL}/products?category=${category}` : `${API_URL}/products`;
        const response = await fetch(url);
        const data = await response.json();

        if (data.success && data.products.length > 0) {
            products = data.products;
            filteredProducts = products;
            renderProducts(data.products);
            gridEl.classList.remove('hidden');
        } else {
            emptyEl.classList.remove('hidden');
        }
    } catch (error) {
        console.error('Error loading products:', error);
        emptyEl.classList.remove('hidden');
    } finally {
        loadingEl.classList.add('hidden');
    }
}

function renderProducts(productsList) {
    const grid = document.getElementById('products-grid');

    grid.innerHTML = productsList.map(product => {
        const isInWishlist = wishlist.some(item => item.id === product.id);

        return `
        <div class="product-card bg-dark-800 rounded-2xl overflow-hidden border border-dark-700 hover:border-accent-gold transition-all">
            <div class="relative aspect-square bg-dark-700 flex items-center justify-center text-6xl overflow-hidden group">
                ${product.image_url ? `<img src="${product.image_url}" class="w-full h-full object-cover" />` : '🖼️'}

                <!-- Wishlist Button -->
                <button onclick='toggleWishlist(${JSON.stringify(product).replace(/'/g, "&apos;")})'
                        class="absolute top-4 left-4 p-2 glass-effect rounded-full hover:bg-white/20 transition-all z-10">
                    <svg class="w-6 h-6 ${isInWishlist ? 'fill-accent-gold' : ''}" fill="${isInWishlist ? 'currentColor' : 'none'}" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
                    </svg>
                </button>

                <!-- Action Buttons -->
                <div class="quick-view-btn absolute bottom-4 right-4 left-4 flex gap-2">
                    <button onclick='addToCart(${JSON.stringify(product).replace(/'/g, "&apos;")}); event.stopPropagation();'
                            class="flex-1 px-3 py-2 bg-gradient-to-r from-accent-gold to-accent-purple rounded-lg text-sm font-semibold hover:shadow-lg transition-all">
                        <svg class="w-4 h-4 inline-block ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/>
                        </svg>
                        خرید
                    </button>
                    <button onclick='toggleWishlist(${JSON.stringify(product).replace(/'/g, "&apos;")}); event.stopPropagation();'
                            class="px-3 py-2 glass-effect rounded-lg hover:bg-white/20 transition-all">
                        <svg class="w-5 h-5 ${wishlist.some(item => item.id === product.id) ? 'fill-accent-gold' : ''}" fill="${wishlist.some(item => item.id === product.id) ? 'currentColor' : 'none'}" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
                        </svg>
                    </button>
                </div>
            </div>

            <div class="p-6">
                <h3 class="text-xl font-serif font-semibold mb-2">${product.name_fa}</h3>
                ${product.description_fa ? `<p class="text-accent-secondary text-sm mb-4 line-clamp-2">${product.description_fa}</p>` : ''}
                ${product.category ? `<span class="inline-block px-3 py-1 glass-effect text-accent-primary text-xs rounded-full mb-4">${product.category}</span>` : ''}

                <div class="flex items-center justify-between mt-4">
                    <div class="price-tag px-4 py-2 rounded-lg">
                        <span class="text-white font-bold text-lg">${formatPrice(product.price)} تومان</span>
                    </div>
                    <button onclick='addToCart(${JSON.stringify(product).replace(/'/g, "&apos;")})'
                            class="p-3 bg-gradient-to-r from-accent-gold to-accent-purple rounded-full hover:shadow-lg hover:shadow-accent-purple/50 transition-all">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/>
                        </svg>
                    </button>
                </div>

                ${product.stock_quantity !== undefined && product.stock_quantity <= 5 ?
                    `<p class="text-red-500 text-xs mt-2">تنها ${product.stock_quantity} عدد موجود</p>` : ''}
            </div>
        </div>
    `;
    }).join('');
}

async function loadCategories() {
    try {
        const response = await fetch(`${API_URL}/categories`);
        const data = await response.json();

        if (data.success && data.categories.length > 0) {
            const categoriesList = document.getElementById('categories-list');
            categoriesList.innerHTML = data.categories.map(category => `
                <button class="filter-btn px-5 py-2 rounded-full text-sm whitespace-nowrap"
                        data-category="${category}">
                    ${category}
                </button>
            `).join('');

            // Add click handlers
            document.querySelectorAll('.filter-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    document.querySelectorAll('.filter-btn').forEach(b => {
                        b.classList.remove('active');
                    });
                    btn.classList.add('active');
                    loadProducts(btn.dataset.category);
                });
            });
        }
    } catch (error) {
        console.error('Error loading categories:', error);
    }
}

// ==================== QUICK VIEW ====================

function showQuickView(product) {
    const modal = document.getElementById('quickview-modal');
    const content = document.getElementById('quickview-content');
    const isInWishlist = wishlist.some(item => item.id === product.id);

    content.innerHTML = `
        <div class="grid md:grid-cols-2 gap-8">
            <div class="aspect-square bg-dark-700 rounded-xl flex items-center justify-center text-8xl overflow-hidden">
                ${product.image_url ? `<img src="${product.image_url}" class="w-full h-full object-cover" />` : '🖼️'}
            </div>

            <div class="space-y-6">
                <div>
                    <h3 class="text-3xl font-serif font-bold mb-2">${product.name_fa}</h3>
                    ${product.category ? `<span class="inline-block px-4 py-2 glass-effect text-accent-primary text-sm rounded-full">${product.category}</span>` : ''}
                </div>

                ${product.description_fa ? `
                    <div>
                        <h4 class="font-semibold mb-2 text-accent-primary">توضیحات:</h4>
                        <p class="text-accent-secondary leading-relaxed">${product.description_fa}</p>
                    </div>
                ` : ''}

                <div class="price-tag px-6 py-4 rounded-xl inline-block">
                    <span class="text-white font-bold text-2xl">${formatPrice(product.price)} تومان</span>
                </div>

                ${product.stock_quantity !== undefined ? `
                    <div>
                        <h4 class="font-semibold mb-2 text-accent-primary">موجودی:</h4>
                        <p class="text-accent-secondary">${product.stock_quantity} عدد</p>
                    </div>
                ` : ''}

                <div class="flex gap-4 pt-4">
                    <button onclick='addToCart(${JSON.stringify(product).replace(/'/g, "&apos;")}); closeQuickView();'
                            class="flex-1 px-6 py-4 bg-gradient-to-r from-accent-gold to-accent-purple rounded-xl font-bold hover:shadow-lg hover:shadow-accent-purple/50 transition-all">
                        افزودن به سبد خرید
                    </button>
                    <button onclick='toggleWishlist(${JSON.stringify(product).replace(/'/g, "&apos;")})'
                            class="px-6 py-4 glass-effect rounded-xl hover:bg-white/10 transition-all">
                        <svg class="w-6 h-6 ${isInWishlist ? 'fill-accent-gold' : ''}" fill="${isInWishlist ? 'currentColor' : 'none'}" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    `;

    modal.classList.remove('hidden');
}

function closeQuickView() {
    document.getElementById('quickview-modal').classList.add('hidden');
}

// ==================== SEARCH & FILTER ====================

function searchProducts(query) {
    const searchTerm = query.toLowerCase();

    if (!searchTerm) {
        filteredProducts = products;
    } else {
        filteredProducts = products.filter(product =>
            product.name_fa.toLowerCase().includes(searchTerm) ||
            (product.description_fa && product.description_fa.toLowerCase().includes(searchTerm)) ||
            (product.category && product.category.toLowerCase().includes(searchTerm))
        );
    }

    renderProducts(filteredProducts);

    const gridEl = document.getElementById('products-grid');
    const emptyEl = document.getElementById('empty-products');

    if (filteredProducts.length > 0) {
        gridEl.classList.remove('hidden');
        emptyEl.classList.add('hidden');
    } else {
        gridEl.classList.add('hidden');
        emptyEl.classList.remove('hidden');
    }
}

function sortProducts(sortBy) {
    let sorted = [...filteredProducts];

    switch(sortBy) {
        case 'price-asc':
            sorted.sort((a, b) => a.price - b.price);
            break;
        case 'price-desc':
            sorted.sort((a, b) => b.price - a.price);
            break;
        case 'newest':
            sorted.sort((a, b) => b.id - a.id);
            break;
        case 'popular':
            // Can be implemented based on sales data
            break;
    }

    renderProducts(sorted);
}

// ==================== CHECKOUT ====================

let appliedCoupon = null;

async function validateCoupon() {
    const couponInput = document.getElementById('coupon-input');
    const couponCode = couponInput.value.trim();
    const couponMessage = document.getElementById('coupon-message');
    const couponDiscount = document.getElementById('coupon-discount');
    const validateBtn = document.getElementById('validate-coupon-btn');

    if (!couponCode) {
        showCouponError('لطفا کد تخفیف را وارد کنید');
        return;
    }

    try {
        validateBtn.disabled = true;
        validateBtn.textContent = 'در حال بررسی...';

        const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

        const response = await fetch(`${API_URL}/coupons/validate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                code: couponCode,
                amount: cartTotal
            })
        });

        const data = await response.json();

        if (data.success && data.data.valid) {
            appliedCoupon = data.data;
            showCouponSuccess(`کد تخفیف با موفقیت اعمال شد! تخفیف: ${data.data.discount_amount.toLocaleString('fa-IR')} تومان`);
            couponInput.disabled = true;
            validateBtn.textContent = 'اعمال شد';
            showNotification('کد تخفیف اعمال شد', 'success');
        } else {
            showCouponError(data.data?.message || 'کد تخفیف نامعتبر است');
            appliedCoupon = null;
        }
    } catch (error) {
        console.error('Error validating coupon:', error);
        showCouponError('خطا در بررسی کد تخفیف');
        appliedCoupon = null;
    } finally {
        validateBtn.disabled = false;
        if (!appliedCoupon) {
            validateBtn.textContent = 'اعمال';
        }
    }
}

function showCouponSuccess(message) {
    const couponMessage = document.getElementById('coupon-message');
    const couponDiscount = document.getElementById('coupon-discount');

    couponMessage.classList.remove('hidden', 'text-red-400');
    couponMessage.classList.add('text-green-400');
    couponMessage.textContent = message;

    if (appliedCoupon) {
        couponDiscount.classList.remove('hidden');
        couponDiscount.textContent = `مبلغ پس از تخفیف: ${appliedCoupon.final_amount.toLocaleString('fa-IR')} تومان`;
    }
}

function showCouponError(message) {
    const couponMessage = document.getElementById('coupon-message');
    const couponDiscount = document.getElementById('coupon-discount');

    couponMessage.classList.remove('hidden', 'text-green-400');
    couponMessage.classList.add('text-red-400');
    couponMessage.textContent = message;
    couponDiscount.classList.add('hidden');
}

async function submitOrder(formData) {
    const submitBtn = document.getElementById('submit-order-btn');
    const originalText = submitBtn.innerHTML;

    try {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span class="loading"></span> در حال ثبت...';

        const items = cart.map(item => ({
            product_id: item.id,
            product_name: item.name_fa,
            quantity: item.quantity,
            price: item.price
        }));

        const orderData = {
            customer_name: formData.get('customer_name'),
            customer_email: formData.get('customer_email'),
            customer_phone: formData.get('customer_phone'),
            customer_address: formData.get('customer_address'),
            payment_method: formData.get('payment_method'),
            notes: formData.get('notes'),
            items: items
        };

        // Add coupon code if provided
        const couponCode = formData.get('coupon_code');
        if (couponCode && couponCode.trim()) {
            orderData.coupon_code = couponCode.trim();
        }

        const response = await fetch(`${API_URL}/orders`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(orderData)
        });

        const data = await response.json();

        if (data.success) {
            document.getElementById('order-number').textContent = data.order.order_number;
            document.getElementById('checkout-modal').classList.add('hidden');
            document.getElementById('success-modal').classList.remove('hidden');

            clearCart();
            document.getElementById('cart-modal').classList.add('hidden');
        } else {
            showNotification(data.message || 'خطا در ثبت سفارش', 'error');
        }
    } catch (error) {
        console.error('Error submitting order:', error);
        showNotification('خطا در ثبت سفارش. لطفا دوباره تلاش کنید', 'error');
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
    }
}

// ==================== EVENT LISTENERS ====================

function initEventListeners() {
    // Cart button
    document.getElementById('cart-btn').addEventListener('click', () => {
        renderCartItems();
        document.getElementById('cart-modal').classList.remove('hidden');
    });

    // Close cart
    document.getElementById('close-cart').addEventListener('click', () => {
        document.getElementById('cart-modal').classList.add('hidden');
    });

    // Wishlist button
    document.getElementById('wishlist-btn').addEventListener('click', () => {
        renderWishlistItems();
        document.getElementById('wishlist-modal').classList.remove('hidden');
    });

    // Close wishlist
    document.getElementById('close-wishlist').addEventListener('click', () => {
        document.getElementById('wishlist-modal').classList.add('hidden');
    });

    // Close quick view
    document.getElementById('close-quickview').addEventListener('click', closeQuickView);

    // Checkout button
    document.getElementById('checkout-btn').addEventListener('click', () => {
        if (cart.length === 0) {
            showNotification('سبد خرید خالی است', 'error');
            return;
        }

        // Check if user is logged in
        if (!currentUser || !authToken) {
            document.getElementById('cart-modal').classList.add('hidden');
            showNotification('برای خرید ابتدا وارد شوید یا ثبت‌نام کنید', 'info');
            openModal('login-modal');
            return;
        }

        document.getElementById('cart-modal').classList.add('hidden');
        document.getElementById('checkout-modal').classList.remove('hidden');
    });

    // Close checkout
    document.getElementById('close-checkout').addEventListener('click', () => {
        document.getElementById('checkout-modal').classList.add('hidden');
    });

    // Checkout form
    document.getElementById('checkout-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        submitOrder(formData);
    });

    // Close success modal
    document.getElementById('close-success').addEventListener('click', () => {
        document.getElementById('success-modal').classList.add('hidden');
        document.getElementById('checkout-form').reset();
    });

    // Tracking modal
    const trackingModal = document.getElementById('tracking-modal');
    if (trackingModal) {
        document.getElementById('close-tracking').addEventListener('click', closeTrackingModal);
        document.getElementById('tracking-form').addEventListener('submit', (e) => {
            e.preventDefault();
            const orderNumber = document.getElementById('order-number-input').value.trim();
            if (orderNumber) {
                trackOrder(orderNumber);
            }
        });
    }

    // Search input
    const searchInput = document.getElementById('search-input');
    let searchTimeout;
    searchInput.addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            searchProducts(e.target.value);
        }, 300);
    });

    // Sort select
    document.getElementById('sort-select').addEventListener('change', (e) => {
        sortProducts(e.target.value);
    });

    // Back to top button
    const backToTopBtn = document.getElementById('back-to-top');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) {
            backToTopBtn.style.opacity = '1';
            backToTopBtn.style.pointerEvents = 'auto';
        } else {
            backToTopBtn.style.opacity = '0';
            backToTopBtn.style.pointerEvents = 'none';
        }
    });

    backToTopBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    // Newsletter form
    document.getElementById('newsletter-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('newsletter-email').value;
        showNotification('ایمیل شما با موفقیت ثبت شد', 'success');
        e.target.reset();
    });

    // Authentication Event Listeners
    // Open Login Modal
    document.getElementById('login-btn').addEventListener('click', () => {
        openModal('login-modal');
    });

    // Open Register Modal
    document.getElementById('register-btn').addEventListener('click', () => {
        openModal('register-modal');
    });

    // Close Login Modal
    document.getElementById('close-login').addEventListener('click', () => {
        closeModal('login-modal');
    });

    // Close Register Modal
    document.getElementById('close-register').addEventListener('click', () => {
        closeModal('register-modal');
    });

    // Switch to Register
    document.getElementById('switch-to-register').addEventListener('click', () => {
        closeModal('login-modal');
        openModal('register-modal');
    });

    // Switch to Login
    document.getElementById('switch-to-login').addEventListener('click', () => {
        closeModal('register-modal');
        openModal('login-modal');
    });

    // Login Form Submit
    document.getElementById('login-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const email = formData.get('email');
        const password = formData.get('password');

        const errorDiv = document.getElementById('login-error');
        errorDiv.classList.add('hidden');

        const result = await handleLogin(email, password);

        if (result !== true) {
            errorDiv.textContent = result;
            errorDiv.classList.remove('hidden');
        }
    });

    // Register Form Submit
    document.getElementById('register-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = {
            full_name: formData.get('full_name'),
            email: formData.get('email'),
            phone: formData.get('phone'),
            password: formData.get('password')
        };

        const errorDiv = document.getElementById('register-error');
        errorDiv.classList.add('hidden');

        const result = await handleRegister(data);

        if (result !== true) {
            errorDiv.textContent = result;
            errorDiv.classList.remove('hidden');
        }
    });

    // Logout Button
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            logout();
        });
    }

    // Close modals on backdrop click
    document.querySelectorAll('.modal-backdrop').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.add('hidden');
            }
        });
    });

    // Profile dropdown toggle
    const profileBtn = document.getElementById('profile-btn');
    const profileDropdown = document.getElementById('profile-dropdown');
    if (profileBtn) {
        profileBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            profileDropdown.classList.toggle('hidden');
        });

        document.addEventListener('click', () => {
            profileDropdown.classList.add('hidden');
        });
    }
}

// ==================== AUTHENTICATION ====================

function checkAuth() {
    authToken = localStorage.getItem('shop_auth_token');

    if (authToken) {
        verifyAuth();
    } else {
        updateAuthUI(false);
    }
}

async function verifyAuth() {
    try {
        const response = await fetch(`${API_URL}/auth/verify`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });

        const data = await response.json();

        if (data.success && data.data.user) {
            currentUser = data.data.user;
            updateAuthUI(true);
        } else {
            logout();
        }
    } catch (error) {
        console.error('Error verifying auth:', error);
        logout();
    }
}

function updateAuthUI(isLoggedIn) {
    const authButtons = document.getElementById('auth-buttons');
    const userProfile = document.getElementById('user-profile');
    const userName = document.getElementById('user-name');

    if (isLoggedIn && currentUser) {
        authButtons.classList.add('hidden');
        userProfile.classList.remove('hidden');
        if (userName) {
            userName.textContent = currentUser.full_name || 'کاربر';
        }
    } else {
        authButtons.classList.remove('hidden');
        userProfile.classList.add('hidden');
    }
}

async function handleLogin(email, password) {
    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (data.success) {
            authToken = data.data.token;
            currentUser = data.data.user;
            localStorage.setItem('shop_auth_token', authToken);
            updateAuthUI(true);
            closeModal('login-modal');
            showNotification('خوش آمدید!', 'success');
            return true;
        } else {
            return data.message || 'خطا در ورود';
        }
    } catch (error) {
        console.error('Login error:', error);
        return 'خطا در ارتباط با سرور';
    }
}

async function handleRegister(formData) {
    try {
        const response = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        const data = await response.json();

        if (data.success) {
            authToken = data.data.token;
            currentUser = data.data.user;
            localStorage.setItem('shop_auth_token', authToken);
            updateAuthUI(true);
            closeModal('register-modal');
            showNotification('ثبت‌نام با موفقیت انجام شد!', 'success');
            return true;
        } else {
            return data.message || 'خطا در ثبت‌نام';
        }
    } catch (error) {
        console.error('Register error:', error);
        return 'خطا در ارتباط با سرور';
    }
}

function logout() {
    authToken = null;
    currentUser = null;
    localStorage.removeItem('shop_auth_token');
    updateAuthUI(false);
    showNotification('با موفقیت خارج شدید', 'info');
}

function openModal(modalId) {
    document.getElementById(modalId).classList.remove('hidden');
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.add('hidden');
}

// ==================== UTILITY FUNCTIONS ====================

function formatPrice(price) {
    return new Intl.NumberFormat('fa-IR').format(price);
}

function showNotification(message, type = 'success') {
    const notification = document.createElement('div');

    let bgColor = 'bg-gradient-to-r from-accent-gold to-accent-purple';
    if (type === 'error') bgColor = 'bg-gradient-to-r from-red-500 to-red-600';
    if (type === 'info') bgColor = 'bg-gradient-to-r from-blue-500 to-blue-600';

    notification.className = `fixed top-24 left-1/2 transform -translate-x-1/2 px-6 py-4 rounded-xl shadow-lg z-50 transition-all ${bgColor} text-white font-semibold`;
    notification.style.opacity = '0';
    notification.textContent = message;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.opacity = '1';
    }, 10);

    setTimeout(() => {
        notification.style.opacity = '0';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// ==================== ORDER TRACKING ====================

function openTrackingModal() {
    const modal = document.getElementById('tracking-modal');
    if (modal) {
        modal.classList.remove('hidden');
        document.getElementById('tracking-form').reset();
        document.getElementById('tracking-result').classList.add('hidden');
        document.getElementById('tracking-error').classList.add('hidden');
    }
}

function closeTrackingModal() {
    const modal = document.getElementById('tracking-modal');
    if (modal) {
        modal.classList.add('hidden');
    }
}

async function trackOrder(orderNumber) {
    const trackBtn = document.getElementById('track-order-btn');
    const originalText = trackBtn.innerHTML;
    const errorDiv = document.getElementById('tracking-error');
    const resultDiv = document.getElementById('tracking-result');

    try {
        trackBtn.disabled = true;
        trackBtn.innerHTML = '<span class="loading"></span> در حال جستجو...';
        errorDiv.classList.add('hidden');
        resultDiv.classList.add('hidden');

        const response = await fetch(`${API_URL}/orders/track/${orderNumber}`);
        const data = await response.json();

        if (data.success) {
            displayTrackingResult(data.order);
        } else {
            errorDiv.textContent = data.message || 'سفارش یافت نشد';
            errorDiv.classList.remove('hidden');
        }
    } catch (error) {
        console.error('Error tracking order:', error);
        errorDiv.textContent = 'خطا در پیگیری سفارش. لطفا دوباره تلاش کنید';
        errorDiv.classList.remove('hidden');
    } finally {
        trackBtn.disabled = false;
        trackBtn.innerHTML = originalText;
    }
}

function displayTrackingResult(order) {
    const resultDiv = document.getElementById('tracking-result');

    // Set order info
    document.getElementById('result-order-number').textContent = order.order_number;
    document.getElementById('result-date').textContent = new Date(order.created_at).toLocaleDateString('fa-IR');
    document.getElementById('result-amount').textContent = `${formatPrice(order.total_amount)} تومان`;

    // Set status badge
    const statusBadge = document.getElementById('result-status');
    const statusText = getOrderStatusLabel(order.status);
    const statusClass = getOrderStatusClass(order.status);

    statusBadge.textContent = statusText;
    statusBadge.className = `px-3 py-1 rounded-full text-xs font-semibold ${statusClass}`;

    // Set items
    const itemsDiv = document.getElementById('result-items');
    if (order.items && order.items.length > 0) {
        itemsDiv.innerHTML = order.items.map(item => `
            <div class="flex justify-between items-center text-sm">
                <span>${item.product_name}</span>
                <span class="text-accent-secondary">${item.quantity} × ${formatPrice(item.price)} تومان</span>
            </div>
        `).join('');
    } else {
        itemsDiv.innerHTML = '<p class="text-sm text-accent-secondary">اطلاعات اقلام در دسترس نیست</p>';
    }

    resultDiv.classList.remove('hidden');
}

function getOrderStatusLabel(status) {
    const labels = {
        'pending': 'در انتظار تایید',
        'processing': 'در حال پردازش',
        'completed': 'تکمیل شده',
        'cancelled': 'لغو شده'
    };
    return labels[status] || status;
}

function getOrderStatusClass(status) {
    const classes = {
        'pending': 'bg-yellow-500/20 text-yellow-400',
        'processing': 'bg-blue-500/20 text-blue-400',
        'completed': 'bg-green-500/20 text-green-400',
        'cancelled': 'bg-red-500/20 text-red-400'
    };
    return classes[status] || 'bg-gray-500/20 text-gray-400';
}
