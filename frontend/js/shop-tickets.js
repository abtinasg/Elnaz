/**
 * Shop Tickets - Support Ticket System
 * Manages customer support tickets
 */

const API_BASE = 'http://localhost:5000/api/shop';
let currentUser = null;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    loadTickets();
    setupEventListeners();
});

// Check authentication
function checkAuth() {
    const token = localStorage.getItem('shop_token');
    const user = localStorage.getItem('shop_user');

    if (token && user) {
        currentUser = JSON.parse(user);
    }
}

// Setup event listeners
function setupEventListeners() {
    // New ticket buttons
    document.getElementById('new-ticket-btn')?.addEventListener('click', openNewTicketModal);
    document.getElementById('new-ticket-btn-empty')?.addEventListener('click', openNewTicketModal);

    // Modal close buttons
    document.getElementById('close-new-ticket')?.addEventListener('click', closeNewTicketModal);
    document.getElementById('cancel-new-ticket')?.addEventListener('click', closeNewTicketModal);
    document.getElementById('close-ticket-detail')?.addEventListener('click', closeTicketDetailModal);

    // Forms
    document.getElementById('new-ticket-form')?.addEventListener('submit', handleNewTicket);
    document.getElementById('ticket-reply-form')?.addEventListener('submit', handleTicketReply);

    // Close modals on backdrop click
    document.getElementById('new-ticket-modal')?.addEventListener('click', (e) => {
        if (e.target.id === 'new-ticket-modal') closeNewTicketModal();
    });
    document.getElementById('ticket-detail-modal')?.addEventListener('click', (e) => {
        if (e.target.id === 'ticket-detail-modal') closeTicketDetailModal();
    });
}

// Load tickets
async function loadTickets() {
    const loadingEl = document.getElementById('tickets-loading');
    const listEl = document.getElementById('tickets-list');
    const emptyEl = document.getElementById('tickets-empty');

    try {
        loadingEl?.classList.remove('hidden');
        listEl?.classList.add('hidden');
        emptyEl?.classList.add('hidden');

        const params = new URLSearchParams();
        if (currentUser) {
            params.append('user_id', currentUser.id);
        }

        const response = await fetch(`${API_BASE}/tickets?${params}`);
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
    const listEl = document.getElementById('tickets-list');
    if (!listEl) return;

    listEl.innerHTML = tickets.map(ticket => `
        <div class="ticket-card glass-effect rounded-xl p-6 cursor-pointer" onclick="openTicketDetail(${ticket.id})">
            <div class="flex items-start justify-between mb-3">
                <div class="flex-1">
                    <h3 class="font-bold text-lg mb-2">${ticket.subject}</h3>
                    <p class="text-sm text-accent-secondary">شماره تیکت: ${ticket.ticket_number}</p>
                </div>
                <span class="status-badge status-${ticket.status}">
                    ${getStatusText(ticket.status)}
                </span>
            </div>
            <div class="flex items-center gap-4 text-sm text-accent-secondary">
                <span>📅 ${formatDate(ticket.created_at)}</span>
                <span>•</span>
                <span>📁 ${getCategoryText(ticket.category)}</span>
            </div>
        </div>
    `).join('');
}

// Open new ticket modal
function openNewTicketModal() {
    const modal = document.getElementById('new-ticket-modal');
    modal?.classList.remove('hidden');
    document.getElementById('new-ticket-form')?.reset();
    document.getElementById('new-ticket-error')?.classList.add('hidden');
}

// Close new ticket modal
function closeNewTicketModal() {
    const modal = document.getElementById('new-ticket-modal');
    modal?.classList.add('hidden');
}

// Handle new ticket submission
async function handleNewTicket(e) {
    e.preventDefault();
    const form = e.target;
    const errorEl = document.getElementById('new-ticket-error');
    const submitBtn = form.querySelector('button[type="submit"]');

    try {
        submitBtn.disabled = true;
        submitBtn.textContent = 'در حال ارسال...';
        errorEl?.classList.add('hidden');

        const formData = new FormData(form);
        const data = {
            subject: formData.get('subject'),
            category: formData.get('category'),
            message: formData.get('message'),
            customer_name: currentUser?.full_name || 'مهمان',
            customer_email: currentUser?.email || '',
            user_id: currentUser?.id
        };

        // If no user logged in, need email
        if (!currentUser) {
            const email = prompt('لطفاً ایمیل خود را وارد کنید:');
            if (!email) {
                throw new Error('ایمیل الزامی است');
            }
            data.customer_email = email;
            const name = prompt('نام و نام خانوادگی:');
            if (name) data.customer_name = name;
        }

        const response = await fetch(`${API_BASE}/tickets`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        const result = await response.json();

        if (result.success) {
            closeNewTicketModal();
            showSuccess('تیکت شما با موفقیت ثبت شد!');
            loadTickets();
        } else {
            throw new Error(result.message || 'خطا در ثبت تیکت');
        }
    } catch (error) {
        console.error('Error creating ticket:', error);
        if (errorEl) {
            errorEl.textContent = error.message;
            errorEl.classList.remove('hidden');
        }
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'ارسال تیکت';
    }
}

// Open ticket detail
async function openTicketDetail(ticketId) {
    const modal = document.getElementById('ticket-detail-modal');

    try {
        const response = await fetch(`${API_BASE}/tickets/${ticketId}`);
        const data = await response.json();

        if (data.success) {
            renderTicketDetail(data.ticket, data.messages);
            modal?.classList.remove('hidden');
        }
    } catch (error) {
        console.error('Error loading ticket:', error);
        alert('خطا در بارگذاری تیکت');
    }
}

// Render ticket detail
function renderTicketDetail(ticket, messages) {
    document.getElementById('ticket-detail-subject').textContent = ticket.subject;
    document.getElementById('ticket-detail-number').textContent = `شماره تیکت: ${ticket.ticket_number}`;
    document.getElementById('ticket-detail-status').textContent = getStatusText(ticket.status);
    document.getElementById('ticket-detail-status').className = `status-badge status-${ticket.status}`;
    document.getElementById('ticket-detail-date').textContent = formatDate(ticket.created_at);

    const messagesContainer = document.getElementById('ticket-messages');
    messagesContainer.innerHTML = messages.map(msg => `
        <div class="${msg.is_staff_reply ? 'bg-accent-gold/10 border-r-4 border-accent-gold' : 'bg-dark-700'} rounded-lg p-4">
            <div class="flex items-center justify-between mb-2">
                <span class="font-semibold ${msg.is_staff_reply ? 'text-accent-gold' : ''}">
                    ${msg.is_staff_reply ? '🎧 پشتیبانی' : '👤 ' + (msg.user_name || ticket.customer_name)}
                </span>
                <span class="text-sm text-accent-secondary">${formatDate(msg.created_at)}</span>
            </div>
            <p class="text-accent-primary leading-relaxed">${msg.message}</p>
        </div>
    `).join('');

    // Setup reply form
    const replyForm = document.getElementById('ticket-reply-form');
    replyForm.onsubmit = (e) => handleTicketReply(e, ticket.id);

    // Hide reply section if ticket is closed
    const replySection = document.getElementById('ticket-reply-section');
    if (ticket.status === 'closed') {
        replySection?.classList.add('hidden');
    } else {
        replySection?.classList.remove('hidden');
    }
}

// Handle ticket reply
async function handleTicketReply(e, ticketId) {
    e.preventDefault();
    const form = e.target;
    const submitBtn = form.querySelector('button[type="submit"]');

    try {
        submitBtn.disabled = true;
        submitBtn.textContent = 'در حال ارسال...';

        const formData = new FormData(form);
        const data = {
            message: formData.get('reply'),
            user_id: currentUser?.id,
            is_staff_reply: false
        };

        const response = await fetch(`${API_BASE}/tickets/${ticketId}/messages`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        const result = await response.json();

        if (result.success) {
            form.reset();
            showSuccess('پیام شما ارسال شد');
            // Reload ticket detail
            openTicketDetail(ticketId);
        } else {
            throw new Error(result.message || 'خطا در ارسال پیام');
        }
    } catch (error) {
        console.error('Error sending reply:', error);
        alert(error.message);
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'ارسال پاسخ';
    }
}

// Close ticket detail modal
function closeTicketDetailModal() {
    const modal = document.getElementById('ticket-detail-modal');
    modal?.classList.add('hidden');
}

// Helper functions
function getStatusText(status) {
    const statuses = {
        'open': 'باز',
        'answered': 'پاسخ داده شده',
        'closed': 'بسته شده'
    };
    return statuses[status] || status;
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
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function showSuccess(message) {
    alert(message);
}

// Make functions globally accessible
window.openTicketDetail = openTicketDetail;
