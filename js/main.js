/**
 * ELNAZ ASHRAFI PORTFOLIO
 * Professional Artist Website
 * Enhanced Multilingual & Currency Support
 */

// ========================================
// CURRENCY DATA
// ========================================

const CURRENCY_DATA = {
    en: {
        code: 'USD',
        symbol: '$',
        format: (amount) => `$${amount.toLocaleString('en-US')}`
    },
    fa: {
        code: 'IRR',
        symbol: 'تومان',
        format: (amount) => `${amount.toLocaleString('fa-IR')} تومان`
    },
    ar: {
        code: 'AED',
        symbol: 'د.إ',
        format: (amount) => `د.إ ${amount.toLocaleString('ar-AE')}`
    }
};

// ========================================
// LANGUAGE MANAGER
// ========================================

class LanguageManager {
    constructor() {
        this.currentLang = localStorage.getItem('language') || 'en';
        this.init();
    }

    init() {
        this.setLanguage(this.currentLang);
        this.setupEventListeners();
    }

    setupEventListeners() {
        document.querySelectorAll('.lang-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.setLanguage(btn.dataset.lang);
            });
        });
    }

    setLanguage(lang) {
        this.currentLang = lang;
        localStorage.setItem('language', lang);

        // Update HTML attributes
        document.documentElement.lang = lang;
        document.documentElement.dir = (lang === 'fa' || lang === 'ar') ? 'rtl' : 'ltr';

        // Update text content
        this.updateContent(lang);
        
        // Update prices
        this.updatePrices(lang);
        
        // Update placeholders
        this.updatePlaceholders(lang);
        
        // Update active button
        this.updateActiveButton(lang);
    }

    updateContent(lang) {
        document.querySelectorAll('[data-en][data-fa][data-ar]').forEach(element => {
            const content = element.dataset[lang];
            if (content) {
                if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                    // Skip inputs/textareas - handled by updatePlaceholders
                } else {
                    element.innerHTML = content;
                }
            }
        });
    }

    updatePrices(lang) {
        document.querySelectorAll('[data-currency-usd]').forEach(element => {
            const currencyKey = `currency${lang === 'en' ? 'Usd' : lang === 'fa' ? 'Irr' : 'Aed'}`;
            const priceData = element.dataset[currencyKey];
            if (priceData) {
                element.textContent = priceData;
            }
        });
    }

    updatePlaceholders(lang) {
        document.querySelectorAll('[data-placeholder-en]').forEach(element => {
            const placeholderKey = `placeholder${lang.charAt(0).toUpperCase() + lang.slice(1)}`;
            const placeholder = element.dataset[placeholderKey];
            if (placeholder) {
                element.placeholder = placeholder;
            }
        });
    }

    updateActiveButton(lang) {
        document.querySelectorAll('.lang-btn').forEach(btn => {
            btn.classList.toggle('lang-btn--active', btn.dataset.lang === lang);
        });
    }
}

// ========================================
// NAVIGATION MANAGER
// ========================================

class NavigationManager {
    constructor() {
        this.navbar = document.querySelector('.navbar');
        this.hamburger = document.querySelector('.hamburger');
        this.menu = document.querySelector('.nav-menu');
        this.init();
    }

    init() {
        this.setupScrollListener();
        this.setupHamburger();
        this.setupSmoothScroll();
    }

    setupScrollListener() {
        let lastScroll = 0;
        
        window.addEventListener('scroll', () => {
            const currentScroll = window.pageYOffset;
            
            // Add/remove scrolled class
            if (currentScroll > 50) {
                this.navbar.classList.add('navbar--scrolled');
            } else {
                this.navbar.classList.remove('navbar--scrolled');
            }
            
            lastScroll = currentScroll;
        }, { passive: true });
    }

    setupHamburger() {
        if (!this.hamburger || !this.menu) return;

        this.hamburger.addEventListener('click', () => {
            this.toggleMenu();
        });

        // Close menu when clicking a link
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                this.closeMenu();
            });
        });

        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.navbar')) {
                this.closeMenu();
            }
        });
    }

    toggleMenu() {
        this.menu.classList.toggle('nav-menu--active');
        this.hamburger.classList.toggle('hamburger--active');
    }

    closeMenu() {
        this.menu.classList.remove('nav-menu--active');
        this.hamburger.classList.remove('hamburger--active');
    }

    setupSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                const href = anchor.getAttribute('href');
                if (href !== '#' && href.length > 1) {
                    e.preventDefault();
                    const target = document.querySelector(href);
                    if (target) {
                        const offsetTop = target.offsetTop - 80;
                        window.scrollTo({
                            top: offsetTop,
                            behavior: 'smooth'
                        });
                    }
                }
            });
        });
    }
}

// ========================================
// GALLERY FILTER
// ========================================

class GalleryFilter {
    constructor() {
        this.filterBtns = document.querySelectorAll('.filter-btn');
        this.galleryItems = document.querySelectorAll('.gallery-item');
        this.init();
    }

    init() {
        if (!this.filterBtns.length) return;

        this.filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                this.filterGallery(btn.dataset.filter);
                this.updateActiveButton(btn);
            });
        });
    }

    filterGallery(filter) {
        this.galleryItems.forEach(item => {
            const category = item.dataset.category;
            const shouldShow = filter === 'all' || category === filter;
            
            if (shouldShow) {
                item.style.display = '';
                setTimeout(() => {
                    item.style.opacity = '1';
                    item.style.transform = 'scale(1)';
                }, 10);
            } else {
                item.style.opacity = '0';
                item.style.transform = 'scale(0.9)';
                setTimeout(() => {
                    item.style.display = 'none';
                }, 300);
            }
        });
    }

    updateActiveButton(activeBtn) {
        this.filterBtns.forEach(btn => {
            btn.classList.toggle('filter-btn--active', btn === activeBtn);
        });
    }
}

// ========================================
// INTERSECTION OBSERVER
// ========================================

class ScrollAnimations {
    constructor() {
        this.init();
    }

    init() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -100px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('fade-in');
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        // Observe sections and cards
        const elementsToObserve = document.querySelectorAll(`
            section,
            .gallery-item,
            .shop-card,
            .exhibition-card,
            .stat-item
        `);

        elementsToObserve.forEach(el => {
            observer.observe(el);
        });
    }
}

// ========================================
// FORM HANDLER
// ========================================

class FormHandler {
    constructor() {
        this.form = document.querySelector('.contact-form');
        this.init();
    }

    init() {
        if (!this.form) return;

        this.form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleSubmit();
        });

        // Real-time validation
        const inputs = this.form.querySelectorAll('input, textarea');
        inputs.forEach(input => {
            input.addEventListener('blur', () => this.validateField(input));
        });
    }

    validateField(field) {
        const value = field.value.trim();
        let isValid = true;

        if (field.type === 'email') {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            isValid = emailRegex.test(value);
        } else {
            isValid = value.length > 0;
        }

        if (isValid) {
            field.style.borderColor = 'var(--color-border)';
        } else {
            field.style.borderColor = 'var(--color-primary)';
        }

        return isValid;
    }

    handleSubmit() {
        const inputs = this.form.querySelectorAll('input, textarea');
        let isFormValid = true;

        inputs.forEach(input => {
            if (!this.validateField(input)) {
                isFormValid = false;
            }
        });

        if (!isFormValid) return;

        const submitBtn = this.form.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;

        // Simulate sending
        submitBtn.disabled = true;
        submitBtn.textContent = submitBtn.dataset.sending || 'Sending...';

        setTimeout(() => {
            submitBtn.textContent = submitBtn.dataset.sent || 'Message Sent!';
            
            // Reset form
            this.form.reset();
            
            // Reset button
            setTimeout(() => {
                submitBtn.disabled = false;
                submitBtn.textContent = originalText;
            }, 2500);
        }, 1500);
    }
}

// ========================================
// PARALLAX EFFECT
// ========================================

class ParallaxEffect {
    constructor() {
        this.init();
    }

    init() {
        const heroVisual = document.querySelector('.hero-visual');
        
        if (!heroVisual) return;

        window.addEventListener('scroll', () => {
            const scrolled = window.pageYOffset;
            if (scrolled < window.innerHeight) {
                heroVisual.style.transform = `translateY(${scrolled * 0.3}px)`;
            }
        }, { passive: true });
    }
}

// ========================================
// LAZY LOADING
// ========================================

class LazyLoader {
    constructor() {
        this.init();
    }

    init() {
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        if (img.dataset.src) {
                            img.src = img.dataset.src;
                            img.classList.remove('lazy');
                            imageObserver.unobserve(img);
                        }
                    }
                });
            });

            document.querySelectorAll('img[data-src]').forEach(img => {
                imageObserver.observe(img);
            });
        }
    }
}

// ========================================
// SHOP INTERACTIONS
// ========================================

class ShopManager {
    constructor() {
        this.init();
    }

    init() {
        const shopBtns = document.querySelectorAll('.shop-btn:not(.shop-btn--disabled)');
        
        shopBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleInquiry(btn);
            });
        });
    }

    handleInquiry(btn) {
        const card = btn.closest('.shop-card');
        const title = card.querySelector('h3').textContent;
        const price = card.querySelector('.price').textContent;
        
        const originalText = btn.textContent;
        btn.textContent = '✓ Request Sent';
        btn.disabled = true;
        
        setTimeout(() => {
            btn.textContent = originalText;
            btn.disabled = false;
        }, 2000);
        
        console.log(`Inquiry sent for: ${title} - ${price}`);
    }
}

// ========================================
// PERFORMANCE UTILITIES
// ========================================

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// ========================================
// KEYBOARD NAVIGATION
// ========================================

class KeyboardNavigation {
    constructor() {
        this.init();
    }

    init() {
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                document.body.classList.add('keyboard-navigation');
            }
        });

        document.addEventListener('mousedown', () => {
            document.body.classList.remove('keyboard-navigation');
        });
    }
}

// ========================================
// INITIALIZATION
// ========================================

document.addEventListener('DOMContentLoaded', () => {
    // Initialize all components
    const languageManager = new LanguageManager();
    const navigationManager = new NavigationManager();
    const scrollAnimations = new ScrollAnimations();
    const galleryFilter = new GalleryFilter();
    const formHandler = new FormHandler();
    const parallaxEffect = new ParallaxEffect();
    const lazyLoader = new LazyLoader();
    const shopManager = new ShopManager();
    const keyboardNavigation = new KeyboardNavigation();

    console.log('✨ Elnaz Ashrafi Portfolio initialized');
});

// ========================================
// ERROR HANDLING
// ========================================

window.addEventListener('error', (event) => {
    console.error('Error:', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
});

// ========================================
// SERVICE WORKER (Optional PWA)
// ========================================

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').catch(err => {
            console.log('Service Worker registration failed:', err);
        });
    });
}
// ========================================
// BACK TO TOP BUTTON
// ========================================

class BackToTop {
    constructor() {
        this.button = document.querySelector('.back-to-top');
        this.init();
    }

    init() {
        if (!this.button) return;

        window.addEventListener('scroll', throttle(() => {
            this.toggleVisibility();
        }, 200), { passive: true });

        this.button.addEventListener('click', () => {
            this.scrollToTop();
        });
    }

    toggleVisibility() {
        const scrolled = window.pageYOffset;
        if (scrolled > CONFIG.scrollThreshold) {
            this.button.classList.add('visible');
        } else {
            this.button.classList.remove('visible');
        }
    }

    scrollToTop() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }
}

// ========================================
// NEWSLETTER HANDLER
// ========================================

class NewsletterHandler {
    constructor() {
        this.form = document.querySelector('.newsletter-form');
        this.init();
    }

    init() {
        if (!this.form) return;

        this.form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleSubmit();
        });
    }

    handleSubmit() {
        const input = this.form.querySelector('input[type="email"]');
        const button = this.form.querySelector('button');
        const email = input.value.trim();

        if (!this.validateEmail(email)) {
            this.showMessage('Please enter a valid email', 'error');
            return;
        }

        const originalText = button.textContent;
        button.disabled = true;
        button.textContent = 'Subscribing...';

        // Simulate API call
        setTimeout(() => {
            button.textContent = '✓ Subscribed!';
            input.value = '';
            
            setTimeout(() => {
                button.disabled = false;
                button.textContent = originalText;
            }, 2500);

            this.showMessage('Successfully subscribed to newsletter!', 'success');
        }, 1000);
    }

    validateEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    showMessage(text, type) {
        const message = document.createElement('div');
        message.className = `toast toast--${type}`;
        message.textContent = text;
        message.style.cssText = `
            position: fixed;
            bottom: 2rem;
            right: 2rem;
            background: ${type === 'success' ? '#10b981' : '#ef4444'};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 0.5rem;
            box-shadow: 0 10px 25px rgba(0,0,0,0.2);
            z-index: 10000;
            animation: slideIn 0.3s ease;
        `;

        document.body.appendChild(message);

        setTimeout(() => {
            message.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => message.remove(), 300);
        }, 3000);
    }
}

// ========================================
// ENHANCED SCROLL ANIMATIONS
// ========================================

class EnhancedScrollAnimations {
    constructor() {
        this.init();
    }

    init() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -100px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const delay = entry.target.dataset.delay || 0;
                    setTimeout(() => {
                        entry.target.classList.add('fade-in');
                    }, delay);
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        // Observe sections and cards with stagger effect
        const elementsToObserve = document.querySelectorAll(`
            section,
            .gallery-item,
            .shop-card,
            .exhibition-card,
            .stat-item,
            .bio-section,
            .resume-item
        `);

        elementsToObserve.forEach((el, index) => {
            el.dataset.delay = (index % 4) * 100; // Stagger animation
            observer.observe(el);
        });
    }
}

// ========================================
// IMAGE LAZY LOADING WITH BLUR EFFECT
// ========================================

class EnhancedLazyLoader {
    constructor() {
        this.init();
    }

    init() {
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        this.loadImage(img);
                        imageObserver.unobserve(img);
                    }
                });
            }, {
                rootMargin: '50px'
            });

            document.querySelectorAll('img[data-src]').forEach(img => {
                imageObserver.observe(img);
            });
        }
    }

    loadImage(img) {
        const src = img.dataset.src;
        if (!src) return;

        const tempImg = new Image();
        tempImg.onload = () => {
            img.src = src;
            img.classList.add('loaded');
            img.classList.remove('lazy');
        };
        tempImg.src = src;
    }
}

// ========================================
// PERFORMANCE MONITOR (DEV ONLY)
// ========================================

class PerformanceMonitor {
    constructor() {
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            this.init();
        }
    }

    init() {
        if ('PerformanceObserver' in window) {
            const observer = new PerformanceObserver((list) => {
                for (const entry of list.getEntries()) {
                    console.log(`⚡ ${entry.name}: ${entry.duration.toFixed(2)}ms`);
                }
            });

            observer.observe({ entryTypes: ['measure', 'navigation'] });
        }

        window.addEventListener('load', () => {
            const perfData = performance.getEntriesByType('navigation')[0];
            console.log('📊 Performance Metrics:');
            console.log(`   DOM Content Loaded: ${perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart}ms`);
            console.log(`   Load Complete: ${perfData.loadEventEnd - perfData.loadEventStart}ms`);
            console.log(`   Total Page Load: ${perfData.loadEventEnd - perfData.fetchStart}ms`);
        });
    }
}

// ========================================
// ENHANCED INITIALIZATION
// ========================================

document.addEventListener('DOMContentLoaded', () => {
    // Core functionality
    const loadingManager = new LoadingManager();
    const languageManager = new LanguageManager();
    const navigationManager = new NavigationManager();
    const smoothScroller = new SmoothScroller();
    
    // Enhanced features
    const backToTop = new BackToTop();
    const newsletterHandler = new NewsletterHandler();
    const enhancedScrollAnimations = new EnhancedScrollAnimations();
    
    // Gallery and Shop
    const galleryFilter = new GalleryFilter();
    const shopManager = new ShopManager();
    
    // Form handling
    const formHandler = new FormHandler();
    
    // Visual effects
    const parallaxEffect = new ParallaxEffect();
    const enhancedLazyLoader = new EnhancedLazyLoader();
    
    // Accessibility
    const keyboardNavigation = new KeyboardNavigation();
    
    // Development tools
    const performanceMonitor = new PerformanceMonitor();

    console.log('✨ Elnaz Ashrafi Portfolio - Expert Edition initialized');
    console.log('📱 Language:', languageManager.currentLang);
    console.log('🎨 Theme: Dark Mode (Artist Portfolio)');
});

// ========================================
// ADDITIONAL CSS FOR ANIMATIONS
// ========================================

const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }

    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }

    .sr-only {
        position: absolute;
        width: 1px;
        height: 1px;
        padding: 0;
        margin: -1px;
        overflow: hidden;
        clip: rect(0, 0, 0, 0);
        white-space: nowrap;
        border-width: 0;
    }

    img.lazy {
        filter: blur(10px);
        transition: filter 0.3s;
    }

    img.loaded {
        filter: blur(0);
    }
`;
document.head.appendChild(style);