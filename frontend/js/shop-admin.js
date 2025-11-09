/**
 * Shop Admin Panel - Complete Management System
 * Persian RTL Support with Advanced Features
 */

const API_BASE = '/api';
let currentTab = 'dashboard';
let adminToken = null;
let adminUser = null;

// ==================== INITIALIZATION ====================

document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
});

function checkAuth() {
    adminToken = localStorage.getItem('adminToken');
    if (!adminToken) {
        window.location.href = '/admin.html';
        return;
    }

    // Verify token
    fetch(`${API_BASE}/admin/verify`, {
        headers: {
            'Authorization': `Bearer ${adminToken}`
        }
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            adminUser = data.data;
            document.getElementById('adminName').textContent = adminUser.username;
            initializeDashboard();
        } else {
            localStorage.removeItem('adminToken');
            window.location.href = '/admin.html';
        }
    })
    .catch(() => {
        localStorage.removeItem('adminToken');
        window.location.href = '/admin.html';
    });
}

function logout() {
    localStorage.removeItem('adminToken');
    window.location.href = '/admin.html';
}

// ==================== TAB MANAGEMENT ====================

function switchTab(tabName) {
    // Hide all tabs
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.style.display = 'none';
    });

    // Remove active class from all tab buttons
    document.querySelectorAll('[id^="tab-"]').forEach(btn => {
        btn.classList.remove('tab-active');
        btn.classList.add('tab-inactive');
    });

    // Show selected tab
    document.getElementById(`content-${tabName}`).style.display = 'block';
    document.getElementById(`tab-${tabName}`).classList.add('tab-active');
    document.getElementById(`tab-${tabName}`).classList.remove('tab-inactive');

    currentTab = tabName;

    // Load tab data
    loadTabData(tabName);
}

function loadTabData(tabName) {
    switch(tabName) {
        case 'dashboard':
            loadDashboard();
            break;
        case 'products':
            loadProducts();
            break;
        case 'orders':
            loadOrders();
            break;
        case 'inventory':
            loadInventory();
            break;
        case 'coupons':
            loadCoupons();
            break;
        case 'customers':
            loadCustomers();
            break;
        case 'reports':
            loadReports();
            break;
    }
}

// ==================== DASHBOARD ====================

function initializeDashboard() {
    loadDashboard();
}

async function loadDashboard() {
    try {
        // Load statistics
        const [productsRes, ordersRes, inventoryRes, customersRes] = await Promise.all([
            fetch(`${API_BASE}/shop/products`, { headers: { 'Authorization': `Bearer ${adminToken}` }}),
            fetch(`${API_BASE}/shop/orders`, { headers: { 'Authorization': `Bearer ${adminToken}` }}),
            fetch(`${API_BASE}/shop/inventory/report`, { headers: { 'Authorization': `Bearer ${adminToken}` }}),
            fetch(`${API_BASE}/shop/reports/customers`, { headers: { 'Authorization': `Bearer ${adminToken}` }})
        ]);

        const products = await productsRes.json();
        const orders = await ordersRes.json();
        const inventory = await inventoryRes.json();
        const customers = await customersRes.json();

        // Update stats
        if (products.success) {
            document.getElementById('stat-products').textContent = products.count;
        }

        if (orders.success) {
            document.getElementById('stat-orders').textContent = orders.count;
        }

        if (inventory.success) {
            document.getElementById('stat-inventory').textContent =
                formatCurrency(inventory.data.total_stock_value);
        }

        if (customers.success) {
            document.getElementById('stat-customers').textContent =
                customers.data.total_customers;
        }

        // Load alerts
        await loadDashboardAlerts();
    } catch (error) {
        console.error('Error loading dashboard:', error);
        showNotification('خطا در بارگذاری داشبورد', 'error');
    }
}

async function loadDashboardAlerts() {
    try {
        const res = await fetch(`${API_BASE}/shop/inventory/low-stock`, {
            headers: { 'Authorization': `Bearer ${adminToken}` }
        });
        const data = await res.json();

        const alertsContainer = document.getElementById('dashboard-alerts');

        if (data.success && data.products.length > 0) {
            alertsContainer.innerHTML = data.products.map(product => `
                <div class="flex items-center gap-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <svg class="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                    </svg>
                    <div class="flex-1">
                        <p class="font-medium text-yellow-800">${product.name_fa}</p>
                        <p class="text-sm text-yellow-700">موجودی: ${product.stock_quantity}</p>
                    </div>
                </div>
            `).join('');
        } else {
            alertsContainer.innerHTML = '<div class="text-center text-green-600 py-4">✓ همه چیز عالی است!</div>';
        }
    } catch (error) {
        console.error('Error loading alerts:', error);
    }
}

// ==================== PRODUCTS MANAGEMENT ====================

let allProducts = [];

async function loadProducts() {
    try {
        const res = await fetch(`${API_BASE}/shop/products?available=false`, {
            headers: { 'Authorization': `Bearer ${adminToken}` }
        });
        const data = await res.json();

        if (data.success) {
            allProducts = data.products;
            displayProducts(allProducts);
            loadProductCategories();
        }
    } catch (error) {
        console.error('Error loading products:', error);
        showNotification('خطا در بارگذاری محصولات', 'error');
    }
}

function displayProducts(products) {
    const tbody = document.getElementById('products-table-body');

    if (products.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="text-center py-8 text-gray-500">محصولی یافت نشد</td></tr>';
        return;
    }

    tbody.innerHTML = products.map(product => `
        <tr>
            <td>${product.id}</td>
            <td>${product.name_fa}</td>
            <td>${product.category || '-'}</td>
            <td>${formatCurrency(product.price)}</td>
            <td>${product.stock_quantity}</td>
            <td>
                <span class="badge ${product.is_available ? 'badge-success' : 'badge-danger'}">
                    ${product.is_available ? 'فعال' : 'غیرفعال'}
                </span>
            </td>
            <td>
                <button onclick="editProduct(${product.id})" class="text-blue-600 hover:text-blue-800 ml-3">ویرایش</button>
                <button onclick="deleteProduct(${product.id})" class="text-red-600 hover:text-red-800">حذف</button>
            </td>
        </tr>
    `).join('');
}

async function loadProductCategories() {
    try {
        const res = await fetch(`${API_BASE}/shop/categories`);
        const data = await res.json();

        if (data.success) {
            const select = document.getElementById('product-category-filter');
            select.innerHTML = '<option value="">همه دسته‌بندی‌ها</option>' +
                data.categories.map(cat => `<option value="${cat}">${cat}</option>`).join('');
        }
    } catch (error) {
        console.error('Error loading categories:', error);
    }
}

function showAddProductModal() {
    const modal = createModal('افزودن محصول جدید', `
        <form id="add-product-form" class="space-y-4">
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">نام فارسی *</label>
                <input type="text" name="name_fa" required
                       class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">نام انگلیسی</label>
                <input type="text" name="name_en"
                       class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">قیمت (تومان) *</label>
                <input type="number" name="price" required
                       class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">دسته‌بندی</label>
                <input type="text" name="category"
                       class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">موجودی</label>
                <input type="number" name="stock_quantity" value="0"
                       class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">توضیحات فارسی</label>
                <textarea name="description_fa" rows="3"
                          class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"></textarea>
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">URL تصویر</label>
                <input type="url" name="image_url"
                       class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
            </div>
            <div class="flex gap-3 pt-4">
                <button type="submit" class="flex-1 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
                    ذخیره
                </button>
                <button type="button" onclick="closeModal()" class="flex-1 px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400">
                    انصراف
                </button>
            </div>
        </form>
    `);

    document.getElementById('add-product-form').onsubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const productData = Object.fromEntries(formData);

        try {
            const res = await fetch(`${API_BASE}/shop/products`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${adminToken}`
                },
                body: JSON.stringify(productData)
            });

            const data = await res.json();

            if (data.success) {
                showNotification('محصول با موفقیت اضافه شد', 'success');
                closeModal();
                loadProducts();
            } else {
                showNotification(data.message || 'خطا در افزودن محصول', 'error');
            }
        } catch (error) {
            showNotification('خطا در افزودن محصول', 'error');
        }
    };
}

async function editProduct(id) {
    try {
        const res = await fetch(`${API_BASE}/shop/products/${id}`);
        const data = await res.json();

        if (!data.success) {
            showNotification('محصول یافت نشد', 'error');
            return;
        }

        const product = data.product;
        const modal = createModal('ویرایش محصول', `
            <form id="edit-product-form" class="space-y-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">نام فارسی *</label>
                    <input type="text" name="name_fa" value="${product.name_fa || ''}" required
                           class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">قیمت (تومان) *</label>
                    <input type="number" name="price" value="${product.price || 0}" required
                           class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">دسته‌بندی</label>
                    <input type="text" name="category" value="${product.category || ''}"
                           class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">موجودی</label>
                    <input type="number" name="stock_quantity" value="${product.stock_quantity || 0}"
                           class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">وضعیت</label>
                    <select name="is_available" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option value="1" ${product.is_available ? 'selected' : ''}>فعال</option>
                        <option value="0" ${!product.is_available ? 'selected' : ''}>غیرفعال</option>
                    </select>
                </div>
                <div class="flex gap-3 pt-4">
                    <button type="submit" class="flex-1 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
                        ذخیره
                    </button>
                    <button type="button" onclick="closeModal()" class="flex-1 px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400">
                        انصراف
                    </button>
                </div>
            </form>
        `);

        document.getElementById('edit-product-form').onsubmit = async (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const productData = Object.fromEntries(formData);

            try {
                const res = await fetch(`${API_BASE}/shop/products/${id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${adminToken}`
                    },
                    body: JSON.stringify(productData)
                });

                const data = await res.json();

                if (data.success) {
                    showNotification('محصول با موفقیت به‌روزرسانی شد', 'success');
                    closeModal();
                    loadProducts();
                } else {
                    showNotification(data.message || 'خطا در به‌روزرسانی محصول', 'error');
                }
            } catch (error) {
                showNotification('خطا در به‌روزرسانی محصول', 'error');
            }
        };
    } catch (error) {
        showNotification('خطا در بارگذاری اطلاعات محصول', 'error');
    }
}

async function deleteProduct(id) {
    if (!confirm('آیا از حذف این محصول اطمینان دارید؟')) return;

    try {
        const res = await fetch(`${API_BASE}/shop/products/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${adminToken}`
            }
        });

        const data = await res.json();

        if (data.success) {
            showNotification('محصول با موفقیت حذف شد', 'success');
            loadProducts();
        } else {
            showNotification(data.message || 'خطا در حذف محصول', 'error');
        }
    } catch (error) {
        showNotification('خطا در حذف محصول', 'error');
    }
}

// ==================== ORDERS MANAGEMENT ====================

let allOrders = [];
let currentOrderFilter = 'all';

async function loadOrders(status = null) {
    try {
        const url = status ? `${API_BASE}/shop/orders?status=${status}` : `${API_BASE}/shop/orders`;
        const res = await fetch(url, {
            headers: { 'Authorization': `Bearer ${adminToken}` }
        });
        const data = await res.json();

        if (data.success) {
            allOrders = data.orders;
            displayOrders(allOrders);
        }
    } catch (error) {
        console.error('Error loading orders:', error);
        showNotification('خطا در بارگذاری سفارشات', 'error');
    }
}

function displayOrders(orders) {
    const tbody = document.getElementById('orders-table-body');

    if (orders.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center py-8 text-gray-500">سفارشی یافت نشد</td></tr>';
        return;
    }

    tbody.innerHTML = orders.map(order => `
        <tr>
            <td class="font-mono">${order.order_number}</td>
            <td>${order.customer_name}</td>
            <td>${new Date(order.created_at).toLocaleDateString('fa-IR')}</td>
            <td>${formatCurrency(order.total_amount)}</td>
            <td>
                <span class="badge ${getStatusBadgeClass(order.status)}">
                    ${getStatusText(order.status)}
                </span>
            </td>
            <td>
                <button onclick="viewOrder(${order.id})" class="text-blue-600 hover:text-blue-800 ml-3">جزئیات</button>
                <button onclick="updateOrderStatus(${order.id})" class="text-green-600 hover:text-green-800">تغییر وضعیت</button>
            </td>
        </tr>
    `).join('');
}

function filterOrders(status) {
    // Update button styles
    document.querySelectorAll('[id^="filter-"]').forEach(btn => {
        btn.classList.remove('bg-blue-500', 'text-white');
        btn.classList.add('bg-gray-200', 'text-gray-700');
    });

    document.getElementById(`filter-${status}`).classList.remove('bg-gray-200', 'text-gray-700');
    document.getElementById(`filter-${status}`).classList.add('bg-blue-500', 'text-white');

    currentOrderFilter = status;
    loadOrders(status === 'all' ? null : status);
}

async function viewOrder(id) {
    try {
        const res = await fetch(`${API_BASE}/shop/orders/${id}`, {
            headers: { 'Authorization': `Bearer ${adminToken}` }
        });
        const data = await res.json();

        if (!data.success) {
            showNotification('سفارش یافت نشد', 'error');
            return;
        }

        const order = data.order;
        const modal = createModal('جزئیات سفارش', `
            <div class="space-y-4">
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <p class="text-sm text-gray-600">شماره سفارش</p>
                        <p class="font-bold">${order.order_number}</p>
                    </div>
                    <div>
                        <p class="text-sm text-gray-600">وضعیت</p>
                        <p class="badge ${getStatusBadgeClass(order.status)}">${getStatusText(order.status)}</p>
                    </div>
                </div>
                <hr>
                <div>
                    <p class="text-sm text-gray-600">مشتری</p>
                    <p class="font-medium">${order.customer_name}</p>
                    <p class="text-sm">${order.customer_email}</p>
                    <p class="text-sm">${order.customer_phone || '-'}</p>
                </div>
                <hr>
                <div>
                    <p class="text-sm text-gray-600 mb-2">محصولات</p>
                    <div class="space-y-2">
                        ${order.items.map(item => `
                            <div class="flex justify-between p-2 bg-gray-50 rounded">
                                <span>${item.product_name}</span>
                                <span>${item.quantity} × ${formatCurrency(item.price)} = ${formatCurrency(item.quantity * item.price)}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
                <hr>
                <div class="flex justify-between font-bold text-lg">
                    <span>جمع کل</span>
                    <span>${formatCurrency(order.total_amount)}</span>
                </div>
                <button onclick="closeModal()" class="w-full px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400">
                    بستن
                </button>
            </div>
        `);
    } catch (error) {
        showNotification('خطا در بارگذاری جزئیات سفارش', 'error');
    }
}

async function updateOrderStatus(id) {
    const modal = createModal('تغییر وضعیت سفارش', `
        <form id="update-status-form" class="space-y-4">
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">وضعیت جدید</label>
                <select name="status" required class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="pending">در انتظار</option>
                    <option value="processing">در حال پردازش</option>
                    <option value="completed">تکمیل شده</option>
                    <option value="cancelled">لغو شده</option>
                </select>
            </div>
            <div class="flex gap-3 pt-4">
                <button type="submit" class="flex-1 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
                    ذخیره
                </button>
                <button type="button" onclick="closeModal()" class="flex-1 px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400">
                    انصراف
                </button>
            </div>
        </form>
    `);

    document.getElementById('update-status-form').onsubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const status = formData.get('status');

        try {
            const res = await fetch(`${API_BASE}/shop/orders/${id}/status`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${adminToken}`
                },
                body: JSON.stringify({ status })
            });

            const data = await res.json();

            if (data.success) {
                showNotification('وضعیت سفارش با موفقیت به‌روزرسانی شد', 'success');
                closeModal();
                loadOrders(currentOrderFilter === 'all' ? null : currentOrderFilter);
            } else {
                showNotification(data.message || 'خطا در به‌روزرسانی وضعیت', 'error');
            }
        } catch (error) {
            showNotification('خطا در به‌روزرسانی وضعیت', 'error');
        }
    };
}

// ==================== INVENTORY MANAGEMENT ====================

async function loadInventory() {
    try {
        const [reportRes, lowStockRes] = await Promise.all([
            fetch(`${API_BASE}/shop/inventory/report`, { headers: { 'Authorization': `Bearer ${adminToken}` }}),
            fetch(`${API_BASE}/shop/inventory/low-stock`, { headers: { 'Authorization': `Bearer ${adminToken}` }})
        ]);

        const report = await reportRes.json();
        const lowStock = await lowStockRes.json();

        if (report.success) {
            document.getElementById('inv-total').textContent = report.data.total_products;
            document.getElementById('inv-value').textContent = formatCurrency(report.data.total_stock_value);
            document.getElementById('inv-low').textContent = report.data.low_stock_count;
            document.getElementById('inv-out').textContent = report.data.out_of_stock_count;
        }

        if (lowStock.success) {
            displayLowStockProducts(lowStock.products);
        }
    } catch (error) {
        console.error('Error loading inventory:', error);
        showNotification('خطا در بارگذاری گزارش انبار', 'error');
    }
}

function displayLowStockProducts(products) {
    const tbody = document.getElementById('low-stock-table');

    if (products.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" class="text-center py-8 text-gray-500">همه محصولات موجودی کافی دارند</td></tr>';
        return;
    }

    tbody.innerHTML = products.map(product => `
        <tr>
            <td>${product.name_fa}</td>
            <td><span class="badge badge-warning">${product.stock_quantity}</span></td>
            <td>${formatCurrency(product.price)}</td>
            <td>
                <button onclick="adjustInventory(${product.id}, '${product.name_fa}', ${product.stock_quantity})"
                        class="text-blue-600 hover:text-blue-800">
                    تنظیم موجودی
                </button>
            </td>
        </tr>
    `).join('');
}

function adjustInventory(productId, productName, currentStock) {
    const modal = createModal('تنظیم موجودی', `
        <form id="adjust-inventory-form" class="space-y-4">
            <div>
                <p class="text-sm text-gray-600">محصول</p>
                <p class="font-medium">${productName}</p>
            </div>
            <div>
                <p class="text-sm text-gray-600">موجودی فعلی</p>
                <p class="font-bold text-xl">${currentStock}</p>
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">موجودی جدید</label>
                <input type="number" name="quantity" value="${currentStock}" required
                       class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">یادداشت</label>
                <textarea name="notes" rows="2"
                          class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"></textarea>
            </div>
            <div class="flex gap-3 pt-4">
                <button type="submit" class="flex-1 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
                    ذخیره
                </button>
                <button type="button" onclick="closeModal()" class="flex-1 px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400">
                    انصراف
                </button>
            </div>
        </form>
    `);

    document.getElementById('adjust-inventory-form').onsubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);

        try {
            const res = await fetch(`${API_BASE}/shop/inventory/adjust`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${adminToken}`
                },
                body: JSON.stringify({
                    product_id: productId,
                    quantity: parseInt(formData.get('quantity')),
                    notes: formData.get('notes')
                })
            });

            const data = await res.json();

            if (data.success) {
                showNotification('موجودی با موفقیت تنظیم شد', 'success');
                closeModal();
                loadInventory();
            } else {
                showNotification(data.message || 'خطا در تنظیم موجودی', 'error');
            }
        } catch (error) {
            showNotification('خطا در تنظیم موجودی', 'error');
        }
    };
}

// ==================== COUPONS MANAGEMENT ====================

async function loadCoupons() {
    try {
        const res = await fetch(`${API_BASE}/shop/coupons`, {
            headers: { 'Authorization': `Bearer ${adminToken}` }
        });
        const data = await res.json();

        if (data.success) {
            displayCoupons(data.coupons);
        }
    } catch (error) {
        console.error('Error loading coupons:', error);
        showNotification('خطا در بارگذاری کوپن‌ها', 'error');
    }
}

function displayCoupons(coupons) {
    const tbody = document.getElementById('coupons-table-body');

    if (coupons.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="text-center py-8 text-gray-500">کوپنی یافت نشد</td></tr>';
        return;
    }

    tbody.innerHTML = coupons.map(coupon => `
        <tr>
            <td class="font-mono font-bold">${coupon.code}</td>
            <td>${coupon.description_fa || '-'}</td>
            <td>${coupon.discount_type === 'percentage' ? 'درصدی' : 'مبلغ ثابت'}</td>
            <td>${coupon.discount_type === 'percentage' ? coupon.discount_value + '%' : formatCurrency(coupon.discount_value)}</td>
            <td>${coupon.used_count} / ${coupon.usage_limit || '∞'}</td>
            <td>
                <span class="badge ${coupon.is_active ? 'badge-success' : 'badge-danger'}">
                    ${coupon.is_active ? 'فعال' : 'غیرفعال'}
                </span>
            </td>
            <td>
                <button onclick="editCoupon(${coupon.id})" class="text-blue-600 hover:text-blue-800 ml-3">ویرایش</button>
                <button onclick="deleteCoupon(${coupon.id})" class="text-red-600 hover:text-red-800">حذف</button>
            </td>
        </tr>
    `).join('');
}

function showAddCouponModal() {
    const modal = createModal('ایجاد کوپن تخفیف', `
        <form id="add-coupon-form" class="space-y-4">
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">کد تخفیف *</label>
                <input type="text" name="code" required
                       class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">توضیحات</label>
                <input type="text" name="description_fa"
                       class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">نوع تخفیف *</label>
                <select name="discount_type" required onchange="toggleDiscountType(this)"
                        class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="percentage">درصدی</option>
                    <option value="fixed">مبلغ ثابت</option>
                </select>
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">مقدار تخفیف *</label>
                <input type="number" name="discount_value" required
                       class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">حداقل خرید (تومان)</label>
                <input type="number" name="min_purchase" value="0"
                       class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">تعداد استفاده</label>
                <input type="number" name="usage_limit"
                       class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
            </div>
            <div class="flex gap-3 pt-4">
                <button type="submit" class="flex-1 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
                    ذخیره
                </button>
                <button type="button" onclick="closeModal()" class="flex-1 px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400">
                    انصراف
                </button>
            </div>
        </form>
    `);

    document.getElementById('add-coupon-form').onsubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const couponData = Object.fromEntries(formData);

        try {
            const res = await fetch(`${API_BASE}/shop/coupons`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${adminToken}`
                },
                body: JSON.stringify(couponData)
            });

            const data = await res.json();

            if (data.success) {
                showNotification('کوپن با موفقیت ایجاد شد', 'success');
                closeModal();
                loadCoupons();
            } else {
                showNotification(data.message || 'خطا در ایجاد کوپن', 'error');
            }
        } catch (error) {
            showNotification('خطا در ایجاد کوپن', 'error');
        }
    };
}

async function editCoupon(id) {
    showNotification('قابلیت ویرایش کوپن به زودی اضافه می‌شود', 'info');
}

async function deleteCoupon(id) {
    if (!confirm('آیا از غیرفعال کردن این کوپن اطمینان دارید؟')) return;

    try {
        const res = await fetch(`${API_BASE}/shop/coupons/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${adminToken}`
            }
        });

        const data = await res.json();

        if (data.success) {
            showNotification('کوپن با موفقیت غیرفعال شد', 'success');
            loadCoupons();
        } else {
            showNotification(data.message || 'خطا در غیرفعال کردن کوپن', 'error');
        }
    } catch (error) {
        showNotification('خطا در غیرفعال کردن کوپن', 'error');
    }
}

// ==================== CUSTOMERS MANAGEMENT ====================

async function loadCustomers() {
    try {
        const res = await fetch(`${API_BASE}/shop/reports/customers`, {
            headers: { 'Authorization': `Bearer ${adminToken}` }
        });
        const data = await res.json();

        if (data.success) {
            displayCustomers(data.data);
        }
    } catch (error) {
        console.error('Error loading customers:', error);
        showNotification('خطا در بارگذاری مشتریان', 'error');
    }
}

function displayCustomers(data) {
    const container = document.getElementById('customers-content');

    container.innerHTML = `
        <div class="space-y-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="bg-blue-50 rounded-lg p-4">
                    <p class="text-sm text-gray-600">کل مشتریان</p>
                    <p class="text-3xl font-bold text-blue-600">${data.total_customers}</p>
                </div>
                <div class="bg-green-50 rounded-lg p-4">
                    <p class="text-sm text-gray-600">مشتریان جدید این ماه</p>
                    <p class="text-3xl font-bold text-green-600">${data.new_customers_this_month}</p>
                </div>
            </div>

            <div>
                <h3 class="text-lg font-bold text-gray-800 mb-4">مشتریان برتر</h3>
                <div class="space-y-3">
                    ${data.top_customers.map((customer, index) => `
                        <div class="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                            <div class="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold">
                                ${index + 1}
                            </div>
                            <div class="flex-1">
                                <p class="font-medium">${customer.name}</p>
                                <p class="text-sm text-gray-600">${customer.email}</p>
                            </div>
                            <div class="text-left">
                                <p class="font-bold">${customer.orders} سفارش</p>
                                <p class="text-sm text-green-600">${formatCurrency(customer.spent)}</p>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>
    `;
}

// ==================== REPORTS ====================

async function loadReports() {
    try {
        const period = document.getElementById('report-period')?.value || '30';
        const res = await fetch(`${API_BASE}/shop/reports/sales?period=${period}`, {
            headers: { 'Authorization': `Bearer ${adminToken}` }
        });
        const data = await res.json();

        if (data.success) {
            displayReports(data.data);
        }
    } catch (error) {
        console.error('Error loading reports:', error);
        showNotification('خطا در بارگذاری گزارشات', 'error');
    }
}

function displayReports(data) {
    document.getElementById('report-orders').textContent = data.summary.total_orders;
    document.getElementById('report-revenue').textContent = formatCurrency(data.summary.total_revenue);

    // Top Products
    const topProductsList = document.getElementById('top-products-list');
    if (data.top_products.length === 0) {
        topProductsList.innerHTML = '<div class="text-center text-gray-500 py-4">داده‌ای یافت نشد</div>';
    } else {
        topProductsList.innerHTML = data.top_products.map((product, index) => `
            <div class="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                <div class="w-8 h-8 bg-purple-500 text-white rounded-full flex items-center justify-center font-bold">
                    ${index + 1}
                </div>
                <div class="flex-1">
                    <p class="font-medium">${product.name}</p>
                </div>
                <div class="text-left">
                    <p class="font-bold">${product.sold} عدد</p>
                    <p class="text-sm text-green-600">${formatCurrency(product.revenue)}</p>
                </div>
            </div>
        `).join('');
    }
}

// ==================== UTILITIES ====================

function formatCurrency(amount) {
    if (!amount && amount !== 0) return '0 تومان';
    return new Intl.NumberFormat('fa-IR').format(amount) + ' تومان';
}

function getStatusText(status) {
    const statusMap = {
        'pending': 'در انتظار',
        'processing': 'در حال پردازش',
        'completed': 'تکمیل شده',
        'cancelled': 'لغو شده'
    };
    return statusMap[status] || status;
}

function getStatusBadgeClass(status) {
    const classMap = {
        'pending': 'badge-warning',
        'processing': 'badge-info',
        'completed': 'badge-success',
        'cancelled': 'badge-danger'
    };
    return classMap[status] || 'badge-info';
}

function showNotification(message, type = 'success') {
    const container = document.getElementById('notificationContainer');
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;

    container.appendChild(notification);

    setTimeout(() => {
        notification.remove();
    }, 3000);
}

function createModal(title, content) {
    const existingModal = document.querySelector('.modal');
    if (existingModal) {
        existingModal.remove();
    }

    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="flex justify-between items-center mb-4">
                <h2 class="text-xl font-bold text-gray-800">${title}</h2>
                <button onclick="closeModal()" class="text-gray-500 hover:text-gray-700">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                </button>
            </div>
            ${content}
        </div>
    `;

    document.body.appendChild(modal);

    // Close on background click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });

    return modal;
}

function closeModal() {
    const modal = document.querySelector('.modal');
    if (modal) {
        modal.remove();
    }
}
