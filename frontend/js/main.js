/**
 * Elnaz Ashrafi - Official Website
 * Main JavaScript File
 * Vanilla JS - No Dependencies
 */

// ================================
// CONFIGURATION
// ================================

const CONFIG = {
    API_BASE_URL: window.location.origin,
    ANIMATION_DURATION: 300,
    SCROLL_THRESHOLD: 300
};

// ================================
// NAVIGATION MANAGER
// ================================

class NavigationManager {
    constructor() {
        this.navbar = document.getElementById('navbar');
        this.mobileMenuBtn = document.getElementById('mobile-menu-btn');
        this.mobileMenu = document.getElementById('mobile-menu');
        this.init();
    }

    init() {
        this.setupScrollListener();
        this.setupMobileMenu();
        this.setupSmoothScroll();
    }

    setupScrollListener() {
        let lastScroll = 0;

        window.addEventListener('scroll', () => {
            const currentScroll = window.pageYOffset;

            // Add scrolled class
            if (currentScroll > 50) {
                this.navbar.classList.add('scrolled');
            } else {
                this.navbar.classList.remove('scrolled');
            }

            lastScroll = currentScroll;
        }, { passive: true });
    }

    setupMobileMenu() {
        if (!this.mobileMenuBtn || !this.mobileMenu) return;

        this.mobileMenuBtn.addEventListener('click', () => {
            this.mobileMenu.classList.toggle('hidden');
        });

        // Close menu when clicking a link
        const mobileLinks = this.mobileMenu.querySelectorAll('a');
        mobileLinks.forEach(link => {
            link.addEventListener('click', () => {
                this.mobileMenu.classList.add('hidden');
            });
        });

        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('#navbar')) {
                this.mobileMenu.classList.add('hidden');
            }
        });
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

// ================================
// GALLERY FILTER
// ================================

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
                item.classList.remove('hidden');
                setTimeout(() => {
                    item.style.opacity = '1';
                    item.style.transform = 'scale(1)';
                }, 10);
            } else {
                item.style.opacity = '0';
                item.style.transform = 'scale(0.9)';
                setTimeout(() => {
                    item.classList.add('hidden');
                }, CONFIG.ANIMATION_DURATION);
            }
        });
    }

    updateActiveButton(activeBtn) {
        this.filterBtns.forEach(btn => {
            btn.classList.toggle('active', btn === activeBtn);
        });
    }
}

// ================================
// CONTACT FORM HANDLER
// ================================

class ContactFormHandler {
    constructor() {
        this.form = document.getElementById('contact-form');
        this.messageDiv = document.getElementById('form-message');
        this.init();
    }

    init() {
        if (!this.form) return;

        this.form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleSubmit();
        });
    }

    async handleSubmit() {
        const formData = {
            name: document.getElementById('name').value,
            email: document.getElementById('email').value,
            subject: document.getElementById('subject').value,
            message: document.getElementById('message').value
        };

        const submitBtn = this.form.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;

        try {
            // Show loading state
            submitBtn.disabled = true;
            submitBtn.textContent = 'Sending...';
            this.form.classList.add('loading');

            // Send to API
            const response = await fetch(`${CONFIG.API_BASE_URL}/api/contact/submit`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (data.success) {
                this.showMessage(data.message, 'success');
                this.form.reset();
            } else {
                this.showMessage(data.message, 'error');
            }
        } catch (error) {
            this.showMessage('An error occurred. Please try again later.', 'error');
            console.error('Error:', error);
        } finally {
            // Reset button
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
            this.form.classList.remove('loading');
        }
    }

    showMessage(text, type) {
        this.messageDiv.className = `message ${type}`;
        this.messageDiv.textContent = text;

        setTimeout(() => {
            this.messageDiv.className = '';
            this.messageDiv.textContent = '';
        }, 5000);
    }
}

// ================================
// NEWSLETTER FORM HANDLER
// ================================

class NewsletterHandler {
    constructor() {
        this.form = document.getElementById('newsletter-form');
        this.messageDiv = document.getElementById('newsletter-message');
        this.init();
    }

    init() {
        if (!this.form) return;

        this.form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleSubmit();
        });
    }

    async handleSubmit() {
        const email = document.getElementById('newsletter-email').value;
        const submitBtn = this.form.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;

        try {
            submitBtn.disabled = true;
            submitBtn.textContent = 'Subscribing...';

            const response = await fetch(`${CONFIG.API_BASE_URL}/api/newsletter/subscribe`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email })
            });

            const data = await response.json();

            if (data.success) {
                this.showMessage(data.message, 'success');
                this.form.reset();
            } else {
                this.showMessage(data.message, 'error');
            }
        } catch (error) {
            this.showMessage('An error occurred. Please try again.', 'error');
            console.error('Error:', error);
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
        }
    }

    showMessage(text, type) {
        this.messageDiv.className = `message ${type}`;
        this.messageDiv.textContent = text;

        setTimeout(() => {
            this.messageDiv.className = '';
            this.messageDiv.textContent = '';
        }, 5000);
    }
}

// ================================
// SHOP INQUIRY HANDLER
// ================================

class ShopInquiryHandler {
    constructor() {
        this.modal = document.getElementById('inquiry-modal');
        this.form = document.getElementById('inquiry-form');
        this.messageDiv = document.getElementById('inquiry-message');
        this.closeBtn = document.getElementById('close-modal');
        this.init();
    }

    init() {
        if (!this.modal) return;

        // Setup inquiry buttons
        document.querySelectorAll('.inquire-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const productName = btn.dataset.product;
                this.openModal(productName);
            });
        });

        // Close modal
        this.closeBtn?.addEventListener('click', () => this.closeModal());
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.closeModal();
            }
        });

        // Form submission
        this.form?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleSubmit();
        });
    }

    openModal(productName) {
        document.getElementById('product-name').value = productName;
        this.modal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    }

    closeModal() {
        this.modal.classList.add('hidden');
        document.body.style.overflow = '';
        this.form.reset();
        this.messageDiv.textContent = '';
        this.messageDiv.className = '';
    }

    async handleSubmit() {
        const formData = {
            product_name: document.getElementById('product-name').value,
            customer_name: document.getElementById('inquiry-name').value,
            customer_email: document.getElementById('inquiry-email').value,
            customer_phone: document.getElementById('inquiry-phone').value,
            message: document.getElementById('inquiry-message').value
        };

        const submitBtn = this.form.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;

        try {
            submitBtn.disabled = true;
            submitBtn.textContent = 'Submitting...';

            const response = await fetch(`${CONFIG.API_BASE_URL}/api/shop/inquiry`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (data.success) {
                this.showMessage(data.message, 'success');
                setTimeout(() => {
                    this.closeModal();
                }, 2000);
            } else {
                this.showMessage(data.message, 'error');
            }
        } catch (error) {
            this.showMessage('An error occurred. Please try again.', 'error');
            console.error('Error:', error);
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
        }
    }

    showMessage(text, type) {
        this.messageDiv.className = `message ${type}`;
        this.messageDiv.textContent = text;
    }
}

// ================================
// BACK TO TOP BUTTON
// ================================

class BackToTop {
    constructor() {
        this.button = document.getElementById('back-to-top');
        this.init();
    }

    init() {
        if (!this.button) return;

        window.addEventListener('scroll', () => {
            this.toggleVisibility();
        }, { passive: true });

        this.button.addEventListener('click', () => {
            this.scrollToTop();
        });
    }

    toggleVisibility() {
        const scrolled = window.pageYOffset;
        if (scrolled > CONFIG.SCROLL_THRESHOLD) {
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

// ================================
// SCROLL ANIMATIONS
// ================================

class ScrollAnimations {
    constructor() {
        this.init();
    }

    init() {
        if (!('IntersectionObserver' in window)) return;

        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -100px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        // Observe elements
        const elementsToAnimate = document.querySelectorAll(`
            .gallery-item,
            .shop-card,
            .exhibition-card
        `);

        elementsToAnimate.forEach(el => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(30px)';
            el.style.transition = 'all 0.6s ease';
            observer.observe(el);
        });
    }
}

// ================================
// PARALLAX EFFECTS
// ================================

class ParallaxEffects {
    constructor() {
        this.init();
    }

    init() {
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            return;
        }

        window.addEventListener('scroll', () => {
            this.handleParallax();
        }, { passive: true });
    }

    handleParallax() {
        const scrolled = window.pageYOffset;

        // Parallax for hero section background
        const heroSection = document.querySelector('#home');
        if (heroSection) {
            const parallaxElements = heroSection.querySelectorAll('.parallax-slow');
            parallaxElements.forEach(el => {
                const speed = 0.5;
                el.style.transform = `translateY(${scrolled * speed}px)`;
            });
        }

        // Parallax for background decorations
        const decorations = document.querySelectorAll('.absolute.opacity-30, .absolute.opacity-10');
        decorations.forEach((el, index) => {
            const speed = 0.3 + (index * 0.1);
            el.style.transform = `translateY(${scrolled * speed}px)`;
        });
    }
}

// ================================
// STATS COUNTER ANIMATION
// ================================

class StatsCounter {
    constructor() {
        this.counters = document.querySelectorAll('.text-4xl');
        this.init();
    }

    init() {
        if (!('IntersectionObserver' in window)) return;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !entry.target.dataset.counted) {
                    this.animateCounter(entry.target);
                    entry.target.dataset.counted = 'true';
                }
            });
        }, { threshold: 0.5 });

        this.counters.forEach(counter => {
            // Only observe number elements in stats section
            if (counter.textContent.includes('+') && counter.closest('#about')) {
                observer.observe(counter);
            }
        });
    }

    animateCounter(element) {
        const text = element.textContent;
        const number = parseInt(text.match(/\d+/)?.[0] || 0);
        const duration = 2000;
        const steps = 60;
        const increment = number / steps;
        let current = 0;
        let step = 0;

        const timer = setInterval(() => {
            current += increment;
            step++;
            element.textContent = Math.floor(current) + '+';

            if (step >= steps) {
                element.textContent = text; // Restore original text
                clearInterval(timer);
            }
        }, duration / steps);
    }
}

// ================================
// ENHANCED CURSOR EFFECTS
// ================================

class CursorEffects {
    constructor() {
        this.init();
    }

    init() {
        // Add hover effects to interactive elements
        const interactiveElements = document.querySelectorAll(
            'a, button, .gallery-item, .shop-card, .exhibition-card, .testimonial-card'
        );

        interactiveElements.forEach(el => {
            el.addEventListener('mouseenter', () => {
                el.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
            });
        });
    }
}

// ================================
// SMOOTH REVEAL ON SCROLL
// ================================

class SmoothReveal {
    constructor() {
        this.init();
    }

    init() {
        if (!('IntersectionObserver' in window)) return;

        const observerOptions = {
            threshold: 0.15,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry, index) => {
                if (entry.isIntersecting) {
                    setTimeout(() => {
                        entry.target.style.opacity = '1';
                        entry.target.style.transform = 'translateY(0)';
                    }, index * 50); // Stagger effect
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        // Observe section titles and content blocks
        const elementsToReveal = document.querySelectorAll(`
            section h2,
            section p,
            .testimonial-card
        `);

        elementsToReveal.forEach(el => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(20px)';
            el.style.transition = 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)';
            observer.observe(el);
        });
    }
}

// ================================
// ENHANCED FORM VALIDATION
// ================================

class FormValidation {
    constructor() {
        this.init();
    }

    init() {
        const forms = document.querySelectorAll('form');

        forms.forEach(form => {
            const inputs = form.querySelectorAll('input, textarea');

            inputs.forEach(input => {
                input.addEventListener('blur', () => {
                    this.validateField(input);
                });

                input.addEventListener('input', () => {
                    if (input.classList.contains('invalid')) {
                        this.validateField(input);
                    }
                });
            });
        });
    }

    validateField(field) {
        const isValid = field.checkValidity();

        if (!isValid) {
            field.classList.add('invalid');
            field.style.borderColor = '#ef4444';
        } else {
            field.classList.remove('invalid');
            field.style.borderColor = '';
        }
    }
}

// ================================
// LOADING STATES
// ================================

class LoadingStates {
    constructor() {
        this.init();
    }

    init() {
        // Add loading states to buttons with data-loading attribute
        const buttons = document.querySelectorAll('button[type="submit"]');

        buttons.forEach(button => {
            const form = button.closest('form');
            if (form) {
                form.addEventListener('submit', () => {
                    this.showLoading(button);
                });
            }
        });
    }

    showLoading(button) {
        const originalText = button.textContent;
        button.dataset.originalText = originalText;
        button.innerHTML = `
            <span class="flex items-center justify-center">
                <span class="spinner mr-2"></span>
                <span>Loading...</span>
            </span>
        `;
        button.disabled = true;
    }

    hideLoading(button) {
        button.textContent = button.dataset.originalText || 'Submit';
        button.disabled = false;
    }
}

// ================================
// INITIALIZATION
// ================================

document.addEventListener('DOMContentLoaded', () => {
    // Initialize all components
    const navigationManager = new NavigationManager();
    const galleryFilter = new GalleryFilter();
    const contactFormHandler = new ContactFormHandler();
    const newsletterHandler = new NewsletterHandler();
    const shopInquiryHandler = new ShopInquiryHandler();
    const backToTop = new BackToTop();
    const scrollAnimations = new ScrollAnimations();
    const parallaxEffects = new ParallaxEffects();
    const statsCounter = new StatsCounter();
    const cursorEffects = new CursorEffects();
    const smoothReveal = new SmoothReveal();
    const formValidation = new FormValidation();
    const loadingStates = new LoadingStates();

    // Add page load animation
    document.body.style.opacity = '0';
    setTimeout(() => {
        document.body.style.transition = 'opacity 0.5s ease';
        document.body.style.opacity = '1';
    }, 100);

    console.log('✨ Elnaz Ashrafi Website initialized with enhanced features');
});

// ================================
// ERROR HANDLING
// ================================

window.addEventListener('error', (event) => {
    console.error('Error:', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
});
