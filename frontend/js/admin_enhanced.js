/**
 * Admin Dashboard Enhanced Features
 * AI Assistant, CMS, SEO, and Analytics functionality
 */

// Use dynamic API base URL to match the current origin
const ENHANCED_API_BASE = window.location.origin + '/api';

// AI Assistant functionality
const AIAssistant = {
    conversationHistory: [],

    init() {
        const aiSendBtn = document.getElementById('aiSendBtn');
        const aiInput = document.getElementById('aiInput');
        const quickActions = document.querySelectorAll('.btn-quick-action');

        if (aiSendBtn) {
            aiSendBtn.addEventListener('click', () => this.sendMessage());
        }

        if (aiInput) {
            aiInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' && e.ctrlKey) {
                    this.sendMessage();
                }
            });
        }

        quickActions.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const prompt = e.target.dataset.prompt;
                aiInput.value = prompt;
                this.sendMessage();
            });
        });
    },

    async sendMessage() {
        const aiInput = document.getElementById('aiInput');
        const message = aiInput.value.trim();

        if (!message) return;

        // Add user message to chat
        this.addMessage(message, 'user');
        aiInput.value = '';

        // Show loading
        this.addMessage('Thinking...', 'assistant', true);

        try {
            const response = await fetch(`${ENHANCED_API_BASE}/ai/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${state.token}`
                },
                body: JSON.stringify({
                    message: message,
                    history: this.conversationHistory
                })
            });

            const data = await response.json();

            // Remove loading message
            const messages = document.getElementById('aiChatMessages');
            const loadingMsg = messages.lastElementChild;
            if (loadingMsg && loadingMsg.classList.contains('loading')) {
                loadingMsg.remove();
            }

            if (response.ok) {
                this.addMessage(data.response, 'assistant');
                this.conversationHistory.push(
                    { role: 'user', content: message },
                    { role: 'assistant', content: data.response }
                );
            } else {
                this.addMessage(`Error: ${data.error || 'Failed to get response'}`, 'system');
            }
        } catch (error) {
            console.error('AI Chat error:', error);
            this.addMessage('Failed to connect to AI assistant. Please try again.', 'system');
        }
    },

    addMessage(text, type, isLoading = false) {
        const messages = document.getElementById('aiChatMessages');
        const messageDiv = document.createElement('div');
        messageDiv.className = `ai-message ai-message-${type}`;
        if (isLoading) messageDiv.classList.add('loading');

        const p = document.createElement('p');
        p.textContent = text;
        messageDiv.appendChild(p);

        messages.appendChild(messageDiv);
        messages.scrollTop = messages.scrollHeight;
    }
};

// Content Management System
const CMS = {
    init() {
        const addContentBtn = document.getElementById('addContentBtn');
        const cmsSectionFilter = document.getElementById('cmsSectionFilter');

        if (addContentBtn) {
            addContentBtn.addEventListener('click', () => this.showAddContentModal());
        }

        if (cmsSectionFilter) {
            cmsSectionFilter.addEventListener('change', () => this.loadContent());
        }

        this.loadContent();
    },

    async loadContent() {
        const section = document.getElementById('cmsSectionFilter')?.value || '';
        const tbody = document.getElementById('cmsTableBody');

        if (!tbody) return;

        tbody.innerHTML = '<tr><td colspan="6" class="loading">Loading...</td></tr>';

        try {
            const url = section ? `${ENHANCED_API_BASE}/cms/content?section=${section}` : `${ENHANCED_API_BASE}/cms/content`;
            const response = await fetch(url);
            const data = await response.json();

            if (response.ok && data.content) {
                this.renderContent(data.content);
            } else {
                tbody.innerHTML = '<tr><td colspan="6">Failed to load content</td></tr>';
            }
        } catch (error) {
            console.error('Load content error:', error);
            tbody.innerHTML = '<tr><td colspan="6">Error loading content</td></tr>';
        }
    },

    renderContent(items) {
        const tbody = document.getElementById('cmsTableBody');
        if (!tbody) return;

        if (items.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6">No content found</td></tr>';
            return;
        }

        tbody.innerHTML = items.map(item => `
            <tr>
                <td>${item.id}</td>
                <td>${item.section}</td>
                <td>${item.key}</td>
                <td>${item.type}</td>
                <td>${new Date(item.updated_at).toLocaleString()}</td>
                <td>
                    <button class="btn-action btn-edit" onclick="CMS.editContent(${item.id})">Edit</button>
                    <button class="btn-action btn-delete" onclick="CMS.deleteContent(${item.id})">Delete</button>
                </td>
            </tr>
        `).join('');
    },

    async editContent(id) {
        // TODO: Implement edit modal
        alert(`Edit content ${id} - Feature coming soon`);
    },

    async deleteContent(id) {
        if (!confirm('Are you sure you want to delete this content?')) return;

        try {
            const response = await fetch(`${ENHANCED_API_BASE}/cms/content/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${state.token}`
                }
            });

            if (response.ok) {
                alert('Content deleted successfully');
                this.loadContent();
            } else {
                const data = await response.json();
                alert(`Error: ${data.error || 'Failed to delete content'}`);
            }
        } catch (error) {
            console.error('Delete content error:', error);
            alert('Failed to delete content');
        }
    },

    showAddContentModal() {
        alert('Add content modal - Feature coming soon');
    }
};

// SEO Management
const SEO = {
    init() {
        const addSeoBtn = document.getElementById('addSeoBtn');

        if (addSeoBtn) {
            addSeoBtn.addEventListener('click', () => this.showAddSeoModal());
        }

        this.loadSEOSettings();
    },

    async loadSEOSettings() {
        const tbody = document.getElementById('seoTableBody');
        if (!tbody) return;

        tbody.innerHTML = '<tr><td colspan="6" class="loading">Loading...</td></tr>';

        try {
            const response = await fetch(`${ENHANCED_API_BASE}/seo/settings`, {
                headers: {
                    'Authorization': `Bearer ${state.token}`
                }
            });
            const data = await response.json();

            if (response.ok && data.settings) {
                this.renderSEOSettings(data.settings);
            } else {
                tbody.innerHTML = '<tr><td colspan="6">Failed to load SEO settings</td></tr>';
            }
        } catch (error) {
            console.error('Load SEO settings error:', error);
            tbody.innerHTML = '<tr><td colspan="6">Error loading SEO settings</td></tr>';
        }
    },

    renderSEOSettings(settings) {
        const tbody = document.getElementById('seoTableBody');
        if (!tbody) return;

        if (settings.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6">No SEO settings found</td></tr>';
            return;
        }

        tbody.innerHTML = settings.map(item => `
            <tr>
                <td>${item.page}</td>
                <td>${item.title || '-'}</td>
                <td>${item.description ? item.description.substring(0, 50) + '...' : '-'}</td>
                <td>${item.keywords || '-'}</td>
                <td>${new Date(item.updated_at).toLocaleString()}</td>
                <td>
                    <button class="btn-action btn-edit" onclick="SEO.editSettings(${item.id})">Edit</button>
                    <button class="btn-action btn-delete" onclick="SEO.deleteSettings(${item.id})">Delete</button>
                </td>
            </tr>
        `).join('');
    },

    async editSettings(id) {
        alert(`Edit SEO settings ${id} - Feature coming soon`);
    },

    async deleteSettings(id) {
        if (!confirm('Are you sure you want to delete these SEO settings?')) return;

        try {
            const response = await fetch(`${ENHANCED_API_BASE}/seo/settings/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${state.token}`
                }
            });

            if (response.ok) {
                alert('SEO settings deleted successfully');
                this.loadSEOSettings();
            } else {
                const data = await response.json();
                alert(`Error: ${data.error || 'Failed to delete SEO settings'}`);
            }
        } catch (error) {
            console.error('Delete SEO settings error:', error);
            alert('Failed to delete SEO settings');
        }
    },

    showAddSeoModal() {
        alert('Add SEO settings modal - Feature coming soon');
    }
};

// Analytics
const Analytics = {
    init() {
        const refreshBtn = document.getElementById('refreshAnalytics');
        const periodSelect = document.getElementById('analyticsPeriod');
        const getInsightsBtn = document.getElementById('getAIInsights');

        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => this.loadStats());
        }

        if (periodSelect) {
            periodSelect.addEventListener('change', () => this.loadStats());
        }

        if (getInsightsBtn) {
            getInsightsBtn.addEventListener('click', () => this.getAIInsights());
        }

        this.loadStats();
    },

    async loadStats() {
        const days = document.getElementById('analyticsPeriod')?.value || 30;

        try {
            const response = await fetch(`${ENHANCED_API_BASE}/analytics/stats?days=${days}`, {
                headers: {
                    'Authorization': `Bearer ${state.token}`
                }
            });
            const data = await response.json();

            if (response.ok) {
                this.renderStats(data);
            } else {
                console.error('Failed to load analytics:', data.error);
            }
        } catch (error) {
            console.error('Load analytics error:', error);
        }
    },

    renderStats(data) {
        // Update stat cards
        const totalEl = document.getElementById('analyticsTotal');
        const visitorsEl = document.getElementById('analyticsVisitors');
        const topEventEl = document.getElementById('analyticsTopEvent');

        if (totalEl) totalEl.textContent = data.total_events || 0;
        if (visitorsEl) visitorsEl.textContent = data.unique_visitors || 0;
        if (topEventEl) {
            const topEvent = data.events_by_type && data.events_by_type.length > 0
                ? data.events_by_type[0].event_type
                : '-';
            topEventEl.textContent = topEvent;
        }

        // Render events by type
        const eventsByTypeEl = document.getElementById('eventsByType');
        if (eventsByTypeEl && data.events_by_type) {
            if (data.events_by_type.length === 0) {
                eventsByTypeEl.innerHTML = '<p style="color: var(--text-secondary);">No events yet</p>';
            } else {
                eventsByTypeEl.innerHTML = data.events_by_type.map(item => `
                    <div class="chart-item">
                        <span class="chart-item-label">${item.event_type}</span>
                        <span class="chart-item-value">${item.count}</span>
                    </div>
                `).join('');
            }
        }

        // Render events by day
        const eventsByDayEl = document.getElementById('eventsByDay');
        if (eventsByDayEl && data.events_by_day) {
            if (data.events_by_day.length === 0) {
                eventsByDayEl.innerHTML = '<p style="color: var(--text-secondary);">No recent events</p>';
            } else {
                eventsByDayEl.innerHTML = data.events_by_day.map(item => `
                    <div class="chart-item">
                        <span class="chart-item-label">${item.date}</span>
                        <span class="chart-item-value">${item.count}</span>
                    </div>
                `).join('');
            }
        }
    },

    async getAIInsights() {
        const insightsContent = document.getElementById('aiInsightsContent');
        const btn = document.getElementById('getAIInsights');

        if (!insightsContent || !btn) return;

        btn.textContent = 'Generating insights...';
        btn.disabled = true;

        try {
            // First get current analytics data
            const days = document.getElementById('analyticsPeriod')?.value || 30;
            const statsResponse = await fetch(`${ENHANCED_API_BASE}/analytics/stats?days=${days}`, {
                headers: {
                    'Authorization': `Bearer ${state.token}`
                }
            });
            const statsData = await statsResponse.json();

            // Get AI insights
            const response = await fetch(`${ENHANCED_API_BASE}/ai/marketing-insights`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${state.token}`
                },
                body: JSON.stringify({
                    analytics: statsData
                })
            });

            const data = await response.json();

            if (response.ok) {
                insightsContent.textContent = data.insights;
                insightsContent.classList.add('active');
            } else {
                insightsContent.textContent = `Error: ${data.error || 'Failed to get insights'}`;
                insightsContent.classList.add('active');
            }
        } catch (error) {
            console.error('Get AI insights error:', error);
            insightsContent.textContent = 'Failed to get AI insights. Please try again.';
            insightsContent.classList.add('active');
        } finally {
            btn.textContent = 'Get AI Marketing Insights';
            btn.disabled = false;
        }
    }
};

// Global functions for SEO
window.saveSEOSettings = async function(page) {
    const title = document.getElementById('seoHomeTitle')?.value;
    const description = document.getElementById('seoHomeDesc')?.value;
    const keywords = document.getElementById('seoHomeKeywords')?.value;

    try {
        const response = await fetch(`${ENHANCED_API_BASE}/seo/settings`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${state.token}`
            },
            body: JSON.stringify({
                page: page,
                title: title,
                description: description,
                keywords: keywords
            })
        });

        const data = await response.json();

        if (response.ok) {
            alert('SEO settings saved successfully!');
            SEO.loadSEOSettings();
        } else {
            alert(`Error: ${data.error || 'Failed to save SEO settings'}`);
        }
    } catch (error) {
        console.error('Save SEO settings error:', error);
        alert('Failed to save SEO settings');
    }
};

window.getAISEOSuggestions = async function(page) {
    const btn = event.target;
    const originalText = btn.textContent;
    btn.textContent = 'Getting AI suggestions...';
    btn.disabled = true;

    try {
        const response = await fetch(`${ENHANCED_API_BASE}/ai/seo-suggestions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${state.token}`
            },
            body: JSON.stringify({
                content: document.body.innerText.substring(0, 2000),
                current_seo: {
                    title: document.getElementById('seoHomeTitle')?.value || '',
                    description: document.getElementById('seoHomeDesc')?.value || '',
                    keywords: document.getElementById('seoHomeKeywords')?.value || ''
                }
            })
        });

        const data = await response.json();

        if (response.ok) {
            alert(`AI SEO Suggestions:\n\n${data.suggestions}`);
        } else {
            alert(`Error: ${data.error || 'Failed to get suggestions'}`);
        }
    } catch (error) {
        console.error('Get AI SEO suggestions error:', error);
        alert('Failed to get AI suggestions');
    } finally {
        btn.textContent = originalText;
        btn.disabled = false;
    }
};

// Initialize enhanced features when dashboard loads
document.addEventListener('DOMContentLoaded', () => {
    // Wait for main admin.js to initialize
    setTimeout(() => {
        if (document.getElementById('dashboardScreen')?.style.display !== 'none') {
            AIAssistant.init();
            CMS.init();
            SEO.init();
            Analytics.init();
        }
    }, 1000);
});

// Add section switching support for new sections
const originalSwitchSection = window.switchSection;
window.switchSection = function(sectionName) {
    // Call original function if it exists
    if (originalSwitchSection) {
        originalSwitchSection(sectionName);
    }

    // Initialize specific section features
    switch(sectionName) {
        case 'ai-assistant':
            AIAssistant.init();
            break;
        case 'cms':
            CMS.init();
            break;
        case 'seo':
            SEO.init();
            break;
        case 'analytics':
            Analytics.init();
            break;
    }
};
