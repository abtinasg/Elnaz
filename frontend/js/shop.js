/**
 * Shop Page JavaScript
 * Persian E-commerce functionality with LocalStorage cart
 */

// API Base URL
const API_URL = window.location.origin + '/api/shop';

// Shopping Cart State
let cart = [];
let products = [];

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    loadCart();
    loadProducts();
    loadCategories();
    initEventListeners();
    updateCartUI();
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
            <div class="flex items-center gap-4 p-4 bg-gray-50 rounded-xl mb-3">
                <div class="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center text-3xl">
                    ${item.image_url ? `<img src="${item.image_url}" class="w-full h-full object-cover rounded-lg" />` : '🖼️'}
                </div>
                <div class="flex-1">
                    <h4 class="font-semibold mb-1">${item.name_fa}</h4>
                    <p class="text-sm text-gray-600">${formatPrice(item.price)} تومان</p>
                </div>
                <div class="flex items-center gap-3">
                    <button onclick="updateQuantity(${item.id}, -1)" class="w-8 h-8 bg-gray-200 rounded-full hover:bg-gray-300 transition">-</button>
                    <span class="w-8 text-center font-semibold">${item.quantity}</span>
                    <button onclick="updateQuantity(${item.id}, 1)" class="w-8 h-8 bg-primary text-white rounded-full hover:bg-secondary transition">+</button>
                </div>
                <button onclick="removeFromCart(${item.id})" class="p-2 text-red-500 hover:bg-red-50 rounded-lg transition">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                    </svg>
                </button>
            </div>
        `;
    }).join('');

    cartTotal.textContent = formatPrice(total) + ' تومان';
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

    grid.innerHTML = productsList.map(product => `
        <div class="product-card bg-white rounded-2xl overflow-hidden shadow-lg">
            <div class="aspect-square bg-gray-200 flex items-center justify-center text-6xl">
                ${product.image_url ? `<img src="${product.image_url}" class="w-full h-full object-cover" />` : '🖼️'}
            </div>
            <div class="p-6">
                <h3 class="text-xl font-bold mb-2">${product.name_fa}</h3>
                ${product.description_fa ? `<p class="text-gray-600 text-sm mb-4 line-clamp-2">${product.description_fa}</p>` : ''}
                ${product.category ? `<span class="inline-block px-3 py-1 bg-gray-100 text-gray-600 text-xs rounded-full mb-4">${product.category}</span>` : ''}

                <div class="flex items-center justify-between mt-4">
                    <div class="price-tag px-4 py-2 rounded-lg">
                        <span class="text-white font-bold text-lg">${formatPrice(product.price)} تومان</span>
                    </div>
                    <button onclick='addToCart(${JSON.stringify(product).replace(/'/g, "&apos;")})'
                            class="p-3 bg-primary text-white rounded-full hover:bg-secondary transition">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/>
                        </svg>
                    </button>
                </div>

                ${product.stock_quantity !== undefined && product.stock_quantity <= 5 ?
                    `<p class="text-red-500 text-xs mt-2">تنها ${product.stock_quantity} عدد موجود</p>` : ''}
            </div>
        </div>
    `).join('');
}

async function loadCategories() {
    try {
        const response = await fetch(`${API_URL}/categories`);
        const data = await response.json();

        if (data.success && data.categories.length > 0) {
            const categoriesList = document.getElementById('categories-list');
            categoriesList.innerHTML = data.categories.map(category => `
                <button class="category-filter px-6 py-2 rounded-full bg-gray-100 hover:bg-primary hover:text-white transition"
                        data-category="${category}">
                    ${category}
                </button>
            `).join('');

            // Add click handlers
            document.querySelectorAll('.category-filter').forEach(btn => {
                btn.addEventListener('click', () => {
                    document.querySelectorAll('.category-filter').forEach(b => {
                        b.classList.remove('active', 'bg-primary', 'text-white');
                        b.classList.add('bg-gray-100');
                    });
                    btn.classList.add('active', 'bg-primary', 'text-white');
                    btn.classList.remove('bg-gray-100');
                    loadProducts(btn.dataset.category);
                });
            });
        }
    } catch (error) {
        console.error('Error loading categories:', error);
    }
}

// ==================== CHECKOUT ====================

async function submitOrder(formData) {
    const submitBtn = document.getElementById('submit-order-btn');
    const originalText = submitBtn.innerHTML;

    try {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span class="loading"></span> در حال ثبت...';

        // Prepare order items
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

        const response = await fetch(`${API_URL}/orders`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(orderData)
        });

        const data = await response.json();

        if (data.success) {
            // Show success modal
            document.getElementById('order-number').textContent = data.order.order_number;
            document.getElementById('checkout-modal').classList.add('hidden');
            document.getElementById('success-modal').classList.remove('hidden');

            // Clear cart
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

    // Checkout button
    document.getElementById('checkout-btn').addEventListener('click', () => {
        if (cart.length === 0) {
            showNotification('سبد خرید خالی است', 'error');
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

    // Close modals on backdrop click
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.add('hidden');
            }
        });
    });
}

// ==================== UTILITY FUNCTIONS ====================

function formatPrice(price) {
    return new Intl.NumberFormat('fa-IR').format(price);
}

function showNotification(message, type = 'success') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `fixed top-4 left-1/2 transform -translate-x-1/2 px-6 py-4 rounded-lg shadow-lg z-50 transition-all ${
        type === 'success' ? 'bg-green-500' : 'bg-red-500'
    } text-white`;
    notification.textContent = message;

    document.body.appendChild(notification);

    // Animate in
    setTimeout(() => {
        notification.style.top = '24px';
    }, 10);

    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.opacity = '0';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}
