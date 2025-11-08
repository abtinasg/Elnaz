/**
 * Admin Dashboard JavaScript
 * Handles authentication, data fetching, and UI interactions
 */

// API Configuration
const API_BASE = window.location.origin + '/api';
const ADMIN_API = API_BASE + '/admin';

// State Management
const state = {
    token: localStorage.getItem('adminToken'),
    currentSection: 'overview',
    admin: null,
    stats: null,
    contacts: [],
    orders: [],
    subscribers: []
};

// DOM Elements
const loginScreen = document.getElementById('loginScreen');
const dashboardScreen = document.getElementById('dashboardScreen');
const loginForm = document.getElementById('loginForm');
const loginError = document.getElementById('loginError');
const logoutBtn = document.getElementById('logoutBtn');
const refreshBtn = document.getElementById('refreshBtn');
const adminUsername = document.getElementById('adminUsername');
const sectionTitle = document.getElementById('sectionTitle');
const navItems = document.querySelectorAll('.nav-item');
const detailModal = document.getElementById('detailModal');

// Utility Functions
function showError(element, message) {
    element.textContent = message;
    element.classList.add('show');
    setTimeout(() => {
        element.classList.remove('show');
    }, 5000);
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function truncate(str, length = 50) {
    if (!str) return '';
    return str.length > length ? str.substring(0, length) + '...' : str;
}

// API Functions
async function apiRequest(endpoint, options = {}) {
    const defaultOptions = {
        headers: {
            'Content-Type': 'application/json'
        }
    };

    if (state.token) {
        defaultOptions.headers['Authorization'] = `Bearer ${state.token}`;
    }

    const response = await fetch(endpoint, { ...defaultOptions, ...options });
    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || 'Request failed');
    }

    return data;
}

// Authentication Functions
async function login(username, password) {
    try {
        const data = await apiRequest(`${ADMIN_API}/login`, {
            method: 'POST',
            body: JSON.stringify({ username, password })
        });

        state.token = data.data.token;
        state.admin = data.data;
        localStorage.setItem('adminToken', data.data.token);

        showDashboard();
    } catch (error) {
        showError(loginError, error.message);
    }
}

async function logout() {
    try {
        await apiRequest(`${ADMIN_API}/logout`, {
            method: 'POST'
        });
    } catch (error) {
        console.error('Logout error:', error);
    } finally {
        state.token = null;
        state.admin = null;
        localStorage.removeItem('adminToken');
        showLogin();
    }
}

async function verifySession() {
    if (!state.token) {
        showLogin();
        return false;
    }

    try {
        const data = await apiRequest(`${ADMIN_API}/verify`);
        state.admin = data.data;
        return true;
    } catch (error) {
        console.error('Session verification failed:', error);
        logout();
        return false;
    }
}

// Dashboard Functions
async function loadStats() {
    try {
        const data = await apiRequest(`${ADMIN_API}/stats`);
        state.stats = data.data;
        updateStatsUI();
    } catch (error) {
        console.error('Failed to load stats:', error);
    }
}

async function loadContacts(status = '') {
    try {
        const url = status
            ? `${ADMIN_API}/contacts?status=${status}`
            : `${ADMIN_API}/contacts`;
        const data = await apiRequest(url);
        state.contacts = data.data;
        updateContactsTable();
    } catch (error) {
        console.error('Failed to load contacts:', error);
    }
}

async function loadOrders(status = '') {
    try {
        const url = status
            ? `${ADMIN_API}/orders?status=${status}`
            : `${ADMIN_API}/orders`;
        const data = await apiRequest(url);
        state.orders = data.data;
        updateOrdersTable();
    } catch (error) {
        console.error('Failed to load orders:', error);
    }
}

async function loadSubscribers(activeOnly = 'true') {
    try {
        const data = await apiRequest(`${ADMIN_API}/subscribers?active_only=${activeOnly}`);
        state.subscribers = data.data;
        updateSubscribersTable();
    } catch (error) {
        console.error('Failed to load subscribers:', error);
    }
}

async function updateContactStatus(contactId, status) {
    try {
        await apiRequest(`${ADMIN_API}/contacts/${contactId}/status`, {
            method: 'PATCH',
            body: JSON.stringify({ status })
        });
        await loadContacts(document.getElementById('contactFilter').value);
        await loadStats();
    } catch (error) {
        console.error('Failed to update contact status:', error);
        alert('Failed to update status: ' + error.message);
    }
}

async function updateOrderStatus(orderId, status) {
    try {
        await apiRequest(`${ADMIN_API}/orders/${orderId}/status`, {
            method: 'PATCH',
            body: JSON.stringify({ status })
        });
        await loadOrders(document.getElementById('orderFilter').value);
        await loadStats();
    } catch (error) {
        console.error('Failed to update order status:', error);
        alert('Failed to update status: ' + error.message);
    }
}

// UI Update Functions
function updateStatsUI() {
    if (!state.stats) return;

    document.getElementById('statTotalContacts').textContent = state.stats.contacts.total;
    document.getElementById('statUnreadContacts').textContent = state.stats.contacts.unread;
    document.getElementById('contactsBadge').textContent = state.stats.contacts.unread;

    document.getElementById('statTotalOrders').textContent = state.stats.orders.total;
    document.getElementById('statPendingOrders').textContent = state.stats.orders.pending;
    document.getElementById('ordersBadge').textContent = state.stats.orders.pending;

    document.getElementById('statTotalSubscribers').textContent = state.stats.subscribers.total;
}

function updateContactsTable() {
    const tbody = document.getElementById('contactsTableBody');

    if (state.contacts.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" class="loading">No contacts found</td></tr>';
        return;
    }

    tbody.innerHTML = state.contacts.map(contact => `
        <tr>
            <td>${contact.id}</td>
            <td>${contact.name}</td>
            <td>${contact.email}</td>
            <td>${truncate(contact.subject || 'N/A', 30)}</td>
            <td>${truncate(contact.message, 40)}</td>
            <td>${formatDate(contact.created_at)}</td>
            <td><span class="status-badge status-${contact.status}">${contact.status}</span></td>
            <td>
                <div class="action-buttons">
                    <button class="btn btn-sm btn-secondary" onclick="viewContactDetails(${contact.id})">View</button>
                    <select onchange="updateContactStatus(${contact.id}, this.value); this.selectedIndex=0;" class="btn btn-sm">
                        <option value="">Status</option>
                        <option value="read">Mark Read</option>
                        <option value="replied">Mark Replied</option>
                    </select>
                </div>
            </td>
        </tr>
    `).join('');
}

function updateOrdersTable() {
    const tbody = document.getElementById('ordersTableBody');

    if (state.orders.length === 0) {
        tbody.innerHTML = '<tr><td colspan="9" class="loading">No orders found</td></tr>';
        return;
    }

    tbody.innerHTML = state.orders.map(order => `
        <tr>
            <td>${order.id}</td>
            <td>${truncate(order.product_name, 30)}</td>
            <td>${order.customer_name}</td>
            <td>${order.customer_email}</td>
            <td>${order.customer_phone || 'N/A'}</td>
            <td>${order.quantity}</td>
            <td>${formatDate(order.created_at)}</td>
            <td><span class="status-badge status-${order.status}">${order.status}</span></td>
            <td>
                <div class="action-buttons">
                    <button class="btn btn-sm btn-secondary" onclick="viewOrderDetails(${order.id})">View</button>
                    <select onchange="updateOrderStatus(${order.id}, this.value); this.selectedIndex=0;" class="btn btn-sm">
                        <option value="">Status</option>
                        <option value="processing">Processing</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                    </select>
                </div>
            </td>
        </tr>
    `).join('');
}

function updateSubscribersTable() {
    const tbody = document.getElementById('subscribersTableBody');

    if (state.subscribers.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" class="loading">No subscribers found</td></tr>';
        return;
    }

    tbody.innerHTML = state.subscribers.map(subscriber => `
        <tr>
            <td>${subscriber.id}</td>
            <td>${subscriber.email}</td>
            <td>${formatDate(subscriber.subscribed_at)}</td>
            <td><span class="status-badge status-${subscriber.is_active ? 'active' : 'inactive'}">${subscriber.is_active ? 'Active' : 'Inactive'}</span></td>
        </tr>
    `).join('');
}

// Detail View Functions
function viewContactDetails(contactId) {
    const contact = state.contacts.find(c => c.id === contactId);
    if (!contact) return;

    document.getElementById('modalTitle').textContent = 'Contact Details';
    document.getElementById('modalBody').innerHTML = `
        <div class="detail-item">
            <label>ID</label>
            <p>${contact.id}</p>
        </div>
        <div class="detail-item">
            <label>Name</label>
            <p>${contact.name}</p>
        </div>
        <div class="detail-item">
            <label>Email</label>
            <p><a href="mailto:${contact.email}">${contact.email}</a></p>
        </div>
        <div class="detail-item">
            <label>Subject</label>
            <p>${contact.subject || 'N/A'}</p>
        </div>
        <div class="detail-item message">
            <label>Message</label>
            <p>${contact.message}</p>
        </div>
        <div class="detail-item">
            <label>Date</label>
            <p>${formatDate(contact.created_at)}</p>
        </div>
        <div class="detail-item">
            <label>Status</label>
            <p><span class="status-badge status-${contact.status}">${contact.status}</span></p>
        </div>
    `;
    detailModal.classList.add('show');
}

function viewOrderDetails(orderId) {
    const order = state.orders.find(o => o.id === orderId);
    if (!order) return;

    document.getElementById('modalTitle').textContent = 'Order Details';
    document.getElementById('modalBody').innerHTML = `
        <div class="detail-item">
            <label>Order ID</label>
            <p>${order.id}</p>
        </div>
        <div class="detail-item">
            <label>Product Name</label>
            <p>${order.product_name}</p>
        </div>
        <div class="detail-item">
            <label>Customer Name</label>
            <p>${order.customer_name}</p>
        </div>
        <div class="detail-item">
            <label>Email</label>
            <p><a href="mailto:${order.customer_email}">${order.customer_email}</a></p>
        </div>
        <div class="detail-item">
            <label>Phone</label>
            <p>${order.customer_phone || 'N/A'}</p>
        </div>
        <div class="detail-item">
            <label>Quantity</label>
            <p>${order.quantity}</p>
        </div>
        ${order.message ? `
        <div class="detail-item message">
            <label>Message</label>
            <p>${order.message}</p>
        </div>
        ` : ''}
        <div class="detail-item">
            <label>Order Date</label>
            <p>${formatDate(order.created_at)}</p>
        </div>
        <div class="detail-item">
            <label>Status</label>
            <p><span class="status-badge status-${order.status}">${order.status}</span></p>
        </div>
    `;
    detailModal.classList.add('show');
}

// Screen Management
function showLogin() {
    loginScreen.style.display = 'flex';
    dashboardScreen.style.display = 'none';
}

function showDashboard() {
    loginScreen.style.display = 'none';
    dashboardScreen.style.display = 'flex';
    adminUsername.textContent = state.admin.username;
    initDashboard();
}

async function initDashboard() {
    await loadStats();
    switchSection('overview');
}

function switchSection(section) {
    state.currentSection = section;

    // Update navigation
    navItems.forEach(item => {
        if (item.dataset.section === section) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });

    // Update content sections
    document.querySelectorAll('.content-section').forEach(sec => {
        sec.classList.remove('active');
    });
    document.getElementById(section + 'Section').classList.add('active');

    // Update title
    const titles = {
        overview: 'Overview',
        contacts: 'Contacts',
        orders: 'Orders',
        subscribers: 'Subscribers'
    };
    sectionTitle.textContent = titles[section];

    // Load data for the section
    loadSectionData(section);
}

async function loadSectionData(section) {
    switch (section) {
        case 'contacts':
            await loadContacts();
            break;
        case 'orders':
            await loadOrders();
            break;
        case 'subscribers':
            await loadSubscribers();
            break;
    }
}

async function refresh() {
    refreshBtn.disabled = true;
    refreshBtn.textContent = '⟳';
    refreshBtn.classList.add('loading-spinner');

    await loadStats();
    await loadSectionData(state.currentSection);

    setTimeout(() => {
        refreshBtn.disabled = false;
        refreshBtn.textContent = '🔄';
        refreshBtn.classList.remove('loading-spinner');
    }, 500);
}

// Event Listeners
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    await login(username, password);
});

logoutBtn.addEventListener('click', logout);

refreshBtn.addEventListener('click', refresh);

navItems.forEach(item => {
    item.addEventListener('click', (e) => {
        e.preventDefault();
        switchSection(item.dataset.section);
    });
});

// Filter Events
document.getElementById('contactFilter').addEventListener('change', (e) => {
    loadContacts(e.target.value);
});

document.getElementById('orderFilter').addEventListener('change', (e) => {
    loadOrders(e.target.value);
});

document.getElementById('subscriberFilter').addEventListener('change', (e) => {
    loadSubscribers(e.target.value);
});

// Modal Events
document.querySelector('.modal-close').addEventListener('click', () => {
    detailModal.classList.remove('show');
});

detailModal.addEventListener('click', (e) => {
    if (e.target === detailModal) {
        detailModal.classList.remove('show');
    }
});

// Make functions globally available
window.viewContactDetails = viewContactDetails;
window.viewOrderDetails = viewOrderDetails;
window.updateContactStatus = updateContactStatus;
window.updateOrderStatus = updateOrderStatus;

// Initialize on page load
document.addEventListener('DOMContentLoaded', async () => {
    const isAuthenticated = await verifySession();
    if (isAuthenticated) {
        showDashboard();
    } else {
        showLogin();
    }
});
