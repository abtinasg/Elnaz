/**
 * Shop Profile - Customer Dashboard
 * Manages customer profile, orders, and tickets
 */

const API_BASE = 'http://localhost:5000/api/shop';
let currentUser = null;
let currentTab = 'orders';

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    setupEventListeners();
    loadUserData();
    loadStats();
    loadTabContent('orders');
});

// Check authentication
function checkAuth() {
    const token = localStorage.getItem('shop_token');
    const user = localStorage.getItem('shop_user');

    if (!token || !user) {
        // Redirect to shop page if not logged in
        window.location.href = 'shop.html';
        return;
    }

    currentUser = JSON.parse(user);
}

// Setup event listeners
function setupEventListeners() {
    // Logout button
    document.getElementById('logout-btn')?.addEventListener('click', handleLogout);

    // Tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const tab = e.target.getAttribute('data-tab');
            switchTab(tab);
        });
    });

    // Profile form
    document.getElementById('profile-form')?.addEventListener('submit', handleProfileUpdate);
}

// Load user data
function loadUserData() {
    if (!currentUser) return;

    // Display user info in header
    document.getElementById('user-name-display').textContent = currentUser.full_name;
    document.getElementById('user-email-display').textContent = currentUser.email;

    // Set user avatar
    const avatar = currentUser.full_name.charAt(0).toUpperCase();
    document.getElementById('user-avatar').textContent = avatar;

    // Fill profile form
    document.getElementById('profile-full-name').value = currentUser.full_name || '';
    document.getElementById('profile-email').value = currentUser.email || '';
    document.getElementById('profile-phone').value = currentUser.phone || '';
    document.getElementById('profile-address').value = currentUser.address || '';
}

// Load statistics
async function loadStats() {
    try {
        // Load orders count
        const ordersResponse = await fetch(`${API_BASE}/orders?limit=1000`);
        const ordersData = await ordersResponse.json();

        if (ordersData.success) {
            const userOrders = ordersData.orders.filter(o =>
                o.customer_email === currentUser.email
            );
            document.getElementById('stat-orders').textContent = userOrders.length;

            // Calculate total spent
            const totalSpent = userOrders.reduce((sum, order) => sum + (order.total_amount || 0), 0);
            document.getElementById('stat-spent').textContent = totalSpent.toLocaleString('fa-IR');
        }

        // Load tickets count
        const ticketsResponse = await fetch(`${API_BASE}/tickets?user_id=${currentUser.id}`);
        const ticketsData = await ticketsResponse.json();

        if (ticketsData.success) {
            const activeTickets = ticketsData.tickets.filter(t => t.status !== 'closed');
            document.getElementById('stat-tickets').textContent = activeTickets.length;
        }
    } catch (error) {
        console.error('Error loading stats:', error);
    }
}

// Switch tab
function switchTab(tab) {
    currentTab = tab;

    // Update tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.getAttribute('data-tab') === tab) {
            btn.classList.add('active');
        }
    });

    // Update tab content
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.add('hidden');
    });
    document.getElementById(`tab-content-${tab}`)?.classList.remove('hidden');

    // Load content for the selected tab
    loadTabContent(tab);
}

// Load tab content
async function loadTabContent(tab) {
    switch (tab) {
        case 'orders':
            await loadOrders();
            break;
        case 'tickets':
            await loadTickets();
            break;
        case 'profile':
            // Profile form is already loaded
            break;
    }
}

// Load orders
async function loadOrders() {
    const loadingEl = document.getElementById('orders-loading');
    const listEl = document.getElementById('orders-list');
    const emptyEl = document.getElementById('orders-empty');

    try {
        loadingEl?.classList.remove('hidden');
        listEl?.classList.add('hidden');
        emptyEl?.classList.add('hidden');

        const response = await fetch(`${API_BASE}/orders?limit=100`);
        const data = await response.json();

        if (data.success) {
            // Filter orders by current user's email
            const userOrders = data.orders.filter(order =>
                order.customer_email === currentUser.email
            );

            if (userOrders.length > 0) {
                renderOrders(userOrders);
                listEl?.classList.remove('hidden');
            } else {
                emptyEl?.classList.remove('hidden');
            }
        } else {
            emptyEl?.classList.remove('hidden');
        }
    } catch (error) {
        console.error('Error loading orders:', error);
        emptyEl?.classList.remove('hidden');
    } finally {
        loadingEl?.classList.add('hidden');
    }
}

// Render orders
function renderOrders(orders) {
    const listEl = document.getElementById('orders-list');
    if (!listEl) return;

    listEl.innerHTML = orders.map(order => `
        <div class="glass-effect rounded-xl p-6">
            <div class="flex items-start justify-between mb-4">
                <div>
                    <h3 class="font-bold text-lg mb-1">سفارش #${order.order_number || order.id}</h3>
                    <p class="text-sm text-accent-secondary">${formatDate(order.created_at)}</p>
                </div>
                <span class="px-3 py-1 rounded-full text-sm font-semibold ${getOrderStatusClass(order.status)}">
                    ${getOrderStatusText(order.status)}
                </span>
            </div>

            <div class="border-t border-dark-600 pt-4 mt-4">
                <div class="flex items-center justify-between">
                    <span class="text-accent-secondary">مبلغ کل:</span>
                    <span class="font-bold text-accent-gold text-lg">
                        ${parseInt(order.total_amount).toLocaleString('fa-IR')} تومان
                    </span>
                </div>
            </div>
        </div>
    `).join('');
}

// Load tickets
async function loadTickets() {
    const loadingEl = document.getElementById('profile-tickets-loading');
    const listEl = document.getElementById('profile-tickets-list');
    const emptyEl = document.getElementById('profile-tickets-empty');

    try {
        loadingEl?.classList.remove('hidden');
        listEl?.classList.add('hidden');
        emptyEl?.classList.add('hidden');

        const response = await fetch(`${API_BASE}/tickets?user_id=${currentUser.id}`);
        const data = await response.json();

        if (data.success && data.tickets.length > 0) {
            renderTickets(data.tickets);
            listEl?.classList.remove('hidden');
        } else {
            emptyEl?.classList.remove('hidden');
        }
    } catch (error) {
        console.error('Error loading tickets:', error);
        emptyEl?.classList.remove('hidden');
    } finally {
        loadingEl?.classList.add('hidden');
    }
}

// Render tickets
function renderTickets(tickets) {
    const listEl = document.getElementById('profile-tickets-list');
    if (!listEl) return;

    listEl.innerHTML = tickets.map(ticket => `
        <div class="glass-effect rounded-xl p-6">
            <div class="flex items-start justify-between mb-3">
                <div class="flex-1">
                    <h3 class="font-bold text-lg mb-2">${ticket.subject}</h3>
                    <p class="text-sm text-accent-secondary">شماره: ${ticket.ticket_number}</p>
                </div>
                <span class="px-3 py-1 rounded-full text-sm font-semibold ${getTicketStatusClass(ticket.status)}">
                    ${getTicketStatusText(ticket.status)}
                </span>
            </div>
            <div class="flex items-center gap-4 text-sm text-accent-secondary">
                <span>📅 ${formatDate(ticket.created_at)}</span>
                <span>•</span>
                <span>📁 ${getCategoryText(ticket.category)}</span>
            </div>
            <div class="mt-4">
                <a href="shop-tickets.html" class="text-accent-gold hover:underline text-sm">
                    مشاهده جزئیات →
                </a>
            </div>
        </div>
    `).join('');
}

// Handle profile update
async function handleProfileUpdate(e) {
    e.preventDefault();
    const form = e.target;
    const errorEl = document.getElementById('profile-error');
    const successEl = document.getElementById('profile-success');
    const submitBtn = form.querySelector('button[type="submit"]');

    try {
        submitBtn.disabled = true;
        submitBtn.textContent = 'در حال ذخیره...';
        errorEl?.classList.add('hidden');
        successEl?.classList.add('hidden');

        const formData = new FormData(form);
        const data = {
            full_name: formData.get('full_name'),
            phone: formData.get('phone'),
            address: formData.get('address')
        };

        const token = localStorage.getItem('shop_token');
        const response = await fetch(`${API_BASE}/auth/profile`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(data)
        });

        const result = await response.json();

        if (result.success) {
            // Update local storage
            const updatedUser = { ...currentUser, ...data };
            localStorage.setItem('shop_user', JSON.stringify(updatedUser));
            currentUser = updatedUser;

            // Update display
            loadUserData();

            if (successEl) {
                successEl.textContent = 'اطلاعات با موفقیت ذخیره شد';
                successEl.classList.remove('hidden');
            }

            setTimeout(() => {
                successEl?.classList.add('hidden');
            }, 3000);
        } else {
            throw new Error(result.message || 'خطا در ذخیره اطلاعات');
        }
    } catch (error) {
        console.error('Error updating profile:', error);
        if (errorEl) {
            errorEl.textContent = error.message;
            errorEl.classList.remove('hidden');
        }
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'ذخیره تغییرات';
    }
}

// Handle logout
function handleLogout() {
    if (confirm('آیا مطمئن هستید که می‌خواهید خارج شوید؟')) {
        localStorage.removeItem('shop_token');
        localStorage.removeItem('shop_user');
        window.location.href = 'shop.html';
    }
}

// Helper functions
function getOrderStatusText(status) {
    const statuses = {
        'pending': 'در انتظار پرداخت',
        'processing': 'در حال پردازش',
        'shipped': 'ارسال شده',
        'delivered': 'تحویل داده شده',
        'cancelled': 'لغو شده'
    };
    return statuses[status] || status;
}

function getOrderStatusClass(status) {
    const classes = {
        'pending': 'bg-yellow-500/20 text-yellow-400',
        'processing': 'bg-blue-500/20 text-blue-400',
        'shipped': 'bg-purple-500/20 text-purple-400',
        'delivered': 'bg-green-500/20 text-green-400',
        'cancelled': 'bg-red-500/20 text-red-400'
    };
    return classes[status] || 'bg-accent-secondary/20 text-accent-secondary';
}

function getTicketStatusText(status) {
    const statuses = {
        'open': 'باز',
        'answered': 'پاسخ داده شده',
        'closed': 'بسته شده'
    };
    return statuses[status] || status;
}

function getTicketStatusClass(status) {
    const classes = {
        'open': 'bg-purple-500/20 text-purple-400',
        'answered': 'bg-accent-gold/20 text-accent-gold',
        'closed': 'bg-accent-secondary/20 text-accent-secondary'
    };
    return classes[status] || 'bg-accent-secondary/20 text-accent-secondary';
}

function getCategoryText(category) {
    const categories = {
        'support': 'پشتیبانی عمومی',
        'order': 'پیگیری سفارش',
        'product': 'سوال درباره محصول',
        'payment': 'مشکل پرداخت',
        'other': 'سایر موارد'
    };
    return categories[category] || category;
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('fa-IR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}
