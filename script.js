'use strict';

// ==============================================
// GLOBAL VARIABLES & CONFIGURATIONS
// ==============================================
const CONFIG = {
    particleCount: 50,
    animationSpeed: 16, // ~60fps
    scrollThreshold: 150,
    typingSpeed: 80,
    particleCreateInterval: 3000,
    skillAnimationDelay: 500,
    notificationDuration: 5000
};

// ==============================================
// UTILITY FUNCTIONS
// ==============================================
const utils = {
    // Debounce function for performance optimization
    debounce: (func, wait) => {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    // Throttle function for scroll events
    throttle: (func, limit) => {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },

    // Check if element is in viewport
    isInViewport: (element, threshold = 0) => {
        const rect = element.getBoundingClientRect();
        return rect.top < window.innerHeight - threshold;
    },

    // Get random number between min and max
    random: (min, max) => Math.random() * (max - min) + min,

    // Validate email format
    isValidEmail: (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
};

// ==============================================
// DOM ELEMENTS CACHE
// ==============================================
const elements = {
    // Navigation
    navbar: document.getElementById('navbar'),
    navLinks: document.getElementById('navLinks'),
    navLinksItems: document.querySelectorAll('.nav-link'),
    mobileToggle: document.getElementById('mobileToggle'),
    
    // Theme
    themeToggle: document.getElementById('themeToggle'),
    themeSlider: document.querySelector('.theme-toggle-slider'),
    body: document.body,
    
    // Cursor
    cursor: document.querySelector('.cursor'),
    cursorFollower: document.querySelector('.cursor-follower'),
    
    // Particles
    particlesContainer: document.getElementById('particles'),
    
    // Sections
    sections: document.querySelectorAll('section[id]'),
    
    // Animations
    fadeElements: document.querySelectorAll('.fade-in, .slide-left, .slide-right'),
    skillCategories: document.querySelectorAll('.skill-category'),
    
    // Projects
    filterButtons: document.querySelectorAll('.filter-btn'),
    projectCards: document.querySelectorAll('.project-card'),
    
    // Contact form
    contactForm: document.getElementById('contactForm'),
    
    // FAB
    fab: document.getElementById('fab'),
    
    // Interactive elements
    interactiveElements: document.querySelectorAll('a, button, .skill-category, .project-card, .certificate-card, .friend-card')
};

// ==============================================
// CUSTOM CURSOR SYSTEM
// ==============================================
const cursor = {
    init() {
        if (window.innerWidth <= 768) return; // Disable on mobile
        
        this.bindEvents();
        this.setupInteractiveElements();
    },

    bindEvents() {
        document.addEventListener('mousemove', this.updatePosition.bind(this));
    },

    updatePosition(e) {
        if (!elements.cursor || !elements.cursorFollower) return;
        
        elements.cursor.style.left = e.clientX + 'px';
        elements.cursor.style.top = e.clientY + 'px';
        
        setTimeout(() => {
            elements.cursorFollower.style.left = e.clientX + 'px';
            elements.cursorFollower.style.top = e.clientY + 'px';
        }, 100);
    },

    setupInteractiveElements() {
        elements.interactiveElements.forEach(el => {
            el.addEventListener('mouseenter', this.onHover);
            el.addEventListener('mouseleave', this.onLeave);
        });
    },

    onHover() {
        if (elements.cursor) {
            elements.cursor.style.transform = 'scale(2)';
            elements.cursorFollower.style.transform = 'scale(1.5)';
            elements.cursorFollower.style.borderColor = 'var(--secondary)';
        }
    },

    onLeave() {
        if (elements.cursor) {
            elements.cursor.style.transform = 'scale(1)';
            elements.cursorFollower.style.transform = 'scale(1)';
            elements.cursorFollower.style.borderColor = 'var(--primary)';
        }
    }
};

// ==============================================
// PARTICLE SYSTEM
// ==============================================
const particles = {
    init() {
        this.createParticles();
        setInterval(() => {
            this.createParticles();
        }, CONFIG.particleCreateInterval);
    },

    createParticles() {
        if (!elements.particlesContainer) return;
        
        for (let i = 0; i < CONFIG.particleCount; i++) {
            setTimeout(() => {
                this.createSingleParticle();
            }, i * 100);
        }
    },

    createSingleParticle() {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.animationDuration = (utils.random(2, 5)) + 's';
        particle.style.animationDelay = Math.random() * 2 + 's';
        
        elements.particlesContainer.appendChild(particle);

        // Remove particle after animation
        setTimeout(() => {
            if (particle.parentNode) {
                particle.remove();
            }
        }, 5000);
    }
};

// ==============================================
// THEME SYSTEM
// ==============================================
const theme = {
    init() {
        this.loadSavedTheme();
        this.bindEvents();
    },

    bindEvents() {
        elements.themeToggle?.addEventListener('click', this.toggle.bind(this));
    },

    toggle() {
        const currentTheme = elements.body.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        this.setTheme(newTheme);
        this.updateSlider(newTheme);
        this.saveTheme(newTheme);
    },

    setTheme(theme) {
        elements.body.setAttribute('data-theme', theme);
    },

    updateSlider(theme) {
        if (elements.themeSlider) {
            elements.themeSlider.innerHTML = theme === 'dark' 
                ? '<i class="fas fa-moon"></i>' 
                : '<i class="fas fa-sun"></i>';
        }
    },

    saveTheme(theme) {
        localStorage.setItem('theme', theme);
    },

    loadSavedTheme() {
        const savedTheme = localStorage.getItem('theme') || 'dark';
        this.setTheme(savedTheme);
        this.updateSlider(savedTheme);
    }
};

// ==============================================
// NAVIGATION SYSTEM
// ==============================================
const navigation = {
    init() {
        this.bindEvents();
        this.setupSmoothScrolling();
    },

    bindEvents() {
        elements.mobileToggle?.addEventListener('click', this.toggleMobileMenu);
        window.addEventListener('scroll', utils.throttle(this.updateActiveNav.bind(this), 100));
    },

    toggleMobileMenu() {
        elements.navLinks?.classList.toggle('active');
        const icon = elements.mobileToggle?.querySelector('i');
        if (icon) {
            icon.classList.toggle('fa-bars');
            icon.classList.toggle('fa-times');
        }
    },

    setupSmoothScrolling() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                e.preventDefault();
                const href = this.getAttribute('href');
                const target = document.querySelector(href);
                
                if (target) {
                    // Special handling for chatbot toggle
                    if (href === '#chatbot-toggle') {
                        const chatbotContainer = document.getElementById('chatbot-container');
                        if (chatbotContainer) {
                            chatbotContainer.classList.remove('hidden');
                            // Focus on input after a short delay
                            setTimeout(() => {
                                const input = document.getElementById('chatbot-input');
                                if (input) input.focus();
                            }, 300);
                        }
                        return;
                    }
                    
                    // Regular smooth scrolling for other elements
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                    
                    // Close mobile menu
                    elements.navLinks?.classList.remove('active');
                    const icon = elements.mobileToggle?.querySelector('i');
                    if (icon) {
                        icon.classList.add('fa-bars');
                        icon.classList.remove('fa-times');
                    }
                }
            });
        });
    },

    updateActiveNav() {
        let current = '';
        
        elements.sections.forEach(section => {
            const sectionTop = section.offsetTop;
            if (window.scrollY >= sectionTop - 200) {
                current = section.getAttribute('id');
            }
        });

        elements.navLinksItems.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });
    }
};

// ==============================================
// SCROLL ANIMATIONS
// ==============================================
const scrollAnimations = {
    init() {
        this.observer = new IntersectionObserver(
            this.handleIntersection.bind(this),
            {
                threshold: 0.1,
                rootMargin: '0px 0px -50px 0px'
            }
        );

        this.bindElements();
        this.initSkillAnimations();
    },

    bindElements() {
        elements.fadeElements.forEach(el => {
            this.observer.observe(el);
        });
    },

    handleIntersection(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    },

    initSkillAnimations() {
        const skillObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.animateSkillBars(entry.target);
                }
            });
        }, { threshold: 0.3 });

        elements.skillCategories.forEach(category => {
            skillObserver.observe(category);
        });
    },

    animateSkillBars(category) {
        const progressBars = category.querySelectorAll('.skill-progress');
        progressBars.forEach((bar, index) => {
            if (!bar.classList.contains('animated')) {
                setTimeout(() => {
                    const width = bar.getAttribute('data-width');
                    bar.style.width = width + '%';
                    bar.classList.add('animated');
                }, index * 200);
            }
        });
    }
};

// ==============================================
// PROJECT FILTERING SYSTEM
// ==============================================
const projectFilter = {
    init() {
        this.bindEvents();
    },

    bindEvents() {
        elements.filterButtons.forEach(button => {
            button.addEventListener('click', this.handleFilter.bind(this));
        });
    },

    handleFilter(e) {
        const filter = e.target.getAttribute('data-filter');
        
        // Update active button
        elements.filterButtons.forEach(btn => btn.classList.remove('active'));
        e.target.classList.add('active');
        
        // Filter projects
        this.filterProjects(filter);
    },

    filterProjects(filter) {
        elements.projectCards.forEach((card, index) => {
            const categories = card.getAttribute('data-category')?.split(' ') || [];
            const shouldShow = filter === 'all' || categories.includes(filter);
            
            if (shouldShow) {
                this.showProject(card, index);
            } else {
                this.hideProject(card);
            }
        });
    },

    showProject(card, index) {
        card.style.display = 'block';
        setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, index * 50);
    },

    hideProject(card) {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        setTimeout(() => {
            card.style.display = 'none';
        }, 300);
    }
};

// ==============================================
// CONTACT FORM SYSTEM
// ==============================================
const contactForm = {
    init() {
        // Load EmailJS SDK dynamically
        this.loadEmailJSSDK().then(() => {
            // Initialize EmailJS with your Public Key
            emailjs.init('*********'); // Replace with your actual EmailJS Public Key
            this.bindEvents();
        }).catch(error => {
            console.error('Failed to load EmailJS SDK:', error);
            notifications.show('Failed to initialize contact form. Please try again later.', 'error');
        });
    },

    async loadEmailJSSDK() {
        return new Promise((resolve, reject) => {
            if (typeof emailjs !== 'undefined') {
                resolve();
                return;
            }
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/@emailjs/browser@3/dist/email.min.js';
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    },

    bindEvents() {
        elements.contactForm?.addEventListener('submit', this.handleSubmit.bind(this));
    },

    async handleSubmit(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData);
        
        // Validate form
        if (!this.validateForm(data)) {
            return;
        }

        const submitBtn = e.target.querySelector('button[type="submit"]');
        const originalHTML = submitBtn.innerHTML;
        
        try {
            // Show loading state
            this.setSubmitState(submitBtn, 'loading');
            
            // Send email using EmailJS
            await emailjs.send('********', '********', { //Replace With You Email Js Service and Template Id
                from_name: data.name,
                from_email: data.email,
                subject: data.subject,
                message: data.message
            });

            // Show success state
            this.setSubmitState(submitBtn, 'success');
            
            // Reset form and show notification
            setTimeout(() => {
                this.resetForm(e.target, submitBtn, originalHTML);
                notifications.show('Thank you! Your message has been sent successfully. I\'ll get back to you soon!', 'success');
            }, 2000);
            
        } catch (error) {
            console.error('EmailJS Error:', error);
            // Show error state
            this.setSubmitState(submitBtn, 'error');
            setTimeout(() => {
                this.resetForm(e.target, submitBtn, originalHTML);
                notifications.show('Sorry, there was an error sending your message. Please try again later.', 'error');
            }, 2000);
        }
    },

    validateForm(data) {
        const { name, email, subject, message } = data;
        
        if (!name || !email || !subject || !message) {
            notifications.show('Please fill in all fields.', 'error');
            return false;
        }
        
        if (!utils.isValidEmail(email)) {
            notifications.show('Please enter a valid email address.', 'error');
            return false;
        }
        
        if (name.length < 2) {
            notifications.show('Name must be at least 2 characters long.', 'error');
            return false;
        }
        
        if (subject.length < 3) {
            notifications.show('Subject must be at least 3 characters long.', 'error');
            return false;
        }
        
        if (message.length < 10) {
            notifications.show('Message must be at least 10 characters long.', 'error');
            return false;
        }
        
        return true;
    },

    setSubmitState(button, state) {
        const states = {
            loading: {
                html: '<i class="fas fa-spinner fa-spin"></i> Sending...',
                style: 'var(--gradient-main)'
            },
            success: {
                html: '<i class="fas fa-check"></i> Message Sent!',
                style: 'var(--success)'
            },
            error: {
                html: '<i class="fas fa-exclamation-triangle"></i> Error!',
                style: 'var(--error)'
            }
        };
        
        const currentState = states[state];
        button.innerHTML = currentState.html;
        button.style.background = currentState.style;
        button.disabled = state !== 'success';
    },

    resetForm(form, button, originalHTML) {
        form.reset();
        button.innerHTML = originalHTML;
        button.style.background = 'var(--gradient-main)';
        button.disabled = false;
        // Reset floating labels
        form.querySelectorAll('.form-input, .form-textarea').forEach(input => {
            input.classList.remove('filled');
        });
    }
};

// ==============================================
// NOTIFICATION SYSTEM
// ==============================================
const notifications = {
    show(message, type = 'info') {
        const notification = this.create(message, type);
        this.animate(notification);
        this.autoRemove(notification);
    },

    create(message, type) {
        const notification = document.createElement('div');
        const icons = {
            success: 'fas fa-check-circle',
            error: 'fas fa-exclamation-circle',
            info: 'fas fa-info-circle',
            warning: 'fas fa-exclamation-triangle'
        };
        
        notification.innerHTML = `
            <i class="${icons[type] || icons.info}"></i>
            <span>${message}</span>
        `;
        
        notification.className = `notification notification-${type}`;
        notification.style.cssText = this.getStyles(type);
        
        document.body.appendChild(notification);
        return notification;
    },

    getStyles(type) {
        const colors = {
            success: 'var(--success)',
            error: 'var(--error)',
            warning: 'var(--warning)',
            info: 'var(--primary)'
        };
        
        return `
            position: fixed;
            top: 100px;
            right: 20px;
            background: ${colors[type] || colors.info};
            color: white;
            padding: 16px 24px;
            border-radius: 12px;
            font-weight: 500;
            z-index: 10000;
            opacity: 0;
            transform: translateX(100px);
            transition: all 0.3s ease;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
            display: flex;
            align-items: center;
            gap: 12px;
            max-width: 350px;
            font-size: 14px;
        `;
    },

    animate(notification) {
        setTimeout(() => {
            notification.style.opacity = '1';
            notification.style.transform = 'translateX(0)';
        }, 100);
    },

    autoRemove(notification) {
        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateX(100px)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 300);
        }, CONFIG.notificationDuration);
    }
};

// ==============================================
// RIPPLE EFFECT SYSTEM
// ==============================================
const rippleEffect = {
    init() {
        this.bindEvents();
    },

    bindEvents() {
        document.querySelectorAll('.btn, .filter-btn, .project-link, .certificate-link').forEach(btn => {
            btn.addEventListener('click', this.createRipple.bind(this));
        });
    },

    createRipple(event) {
        const button = event.currentTarget;
        const rect = button.getBoundingClientRect();
        const circle = document.createElement('span');
        const diameter = Math.max(button.clientWidth, button.clientHeight);
        const radius = diameter / 2;

        circle.style.cssText = `
            position: absolute;
            left: ${event.clientX - rect.left - radius}px;
            top: ${event.clientY - rect.top - radius}px;
            width: ${diameter}px;
            height: ${diameter}px;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.3);
            transform: scale(0);
            animation: ripple 0.6s ease-out;
            pointer-events: none;
            z-index: 1;
        `;

        // Remove existing ripples
        const existingRipple = button.querySelector('.ripple-effect');
        if (existingRipple) {
            existingRipple.remove();
        }

        circle.classList.add('ripple-effect');
        button.style.position = 'relative';
        button.style.overflow = 'hidden';
        button.appendChild(circle);

        // Remove ripple after animation
        setTimeout(() => {
            if (circle.parentNode) {
                circle.remove();
            }
        }, 600);
    }
};

// ==============================================
// KEYBOARD SHORTCUTS & CONSOLE MESSAGES
// ==============================================
const shortcuts = {
    init() {
        this.initKeyboardShortcuts();
        this.initConsoleMessages();
    },

    initKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                const shortcuts = {
                    '1': 'home',
                    '2': 'about',
                    '3': 'skills',
                    '4': 'projects',
                    '5': 'contact'
                };

                const sectionId = shortcuts[e.key];
                if (sectionId) {
                    e.preventDefault();
                    const section = document.getElementById(sectionId);
                    section?.scrollIntoView({ behavior: 'smooth' });
                }
            }
        });
    },

    initConsoleMessages() {
        const messages = [
            { text: '🚀 Aditya Kumar - Portfolio Loaded Successfully!', color: '#00f5ff', size: '20px', weight: 'bold' },
            { text: '💡 Co-Founder of Inscipe | AI Innovator | Tech Entrepreneur', color: '#7c3aed', size: '14px' },
            { text: '🤖 Ask Delta AI Assistant anything about Aditya!', color: '#ff0080', size: '12px' },
            { text: '⚡ Keyboard Shortcuts: Ctrl/Cmd + 1-5 for quick navigation', color: '#10b981', size: '12px' },
            { text: '🌟 Built with passion, innovation, and endless possibilities!', color: '#f59e0b', weight: 'bold' }
        ];

        messages.forEach(msg => {
            const style = `color: ${msg.color}; font-size: ${msg.size}; ${msg.weight ? `font-weight: ${msg.weight};` : ''}`;
            console.log(`%c${msg.text}`, style);
        });

        // Performance stats
        if (performance.memory) {
            console.log('%cPerformance Stats:', 'color: #00f5ff; font-weight: bold;');
            console.log(`🧠 Memory Used: ${(performance.memory.usedJSHeapSize / 1024 / 1024).toFixed(2)} MB`);
            console.log(`⏱️ Load Time: ${(performance.timing.loadEventEnd - performance.timing.navigationStart)}ms`);
        }
    }
};

// ==============================================
// FLOATING ACTION BUTTON
// ==============================================
const fab = {
    init() {
        this.bindEvents();
    },

    bindEvents() {
        elements.fab?.addEventListener('click', () => {
            document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
        });
    }
};

// ==============================================
// PERFORMANCE MONITORING
// ==============================================
const performance_monitor = {
    init() {
        this.monitorFPS();
        this.optimizeAnimations();
    },

    monitorFPS() {
        let lastTime = performance.now();
        let frameCount = 0;

        const measureFPS = (currentTime) => {
            frameCount++;
            
            if (currentTime - lastTime >= 1000) {
                const fps = Math.round((frameCount * 1000) / (currentTime - lastTime));
                
                // Reduce animations if FPS is too low
                if (fps < 30) {
                    this.reducedMotionMode();
                }
                
                frameCount = 0;
                lastTime = currentTime;
            }
            
            requestAnimationFrame(measureFPS);
        };

        requestAnimationFrame(measureFPS);
    },

    reducedMotionMode() {
        document.documentElement.style.setProperty('--animation-speed', '0.1s');
        console.warn('🐌 Reduced motion mode activated due to low FPS');
    },

    optimizeAnimations() {
        // Reduce animations for users who prefer reduced motion
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
        
        if (prefersReducedMotion.matches) {
            document.documentElement.style.setProperty('--transition-normal', '0.01s');
            document.documentElement.style.setProperty('--transition-slow', '0.01s');
        }
    }
};

// ==============================================
// AI ASSISTANT (DELTA) - Enhanced
// ==============================================
const chatbot = {
    init() {
        this.bindEvents();
        this.setupSuggestions();
    },

    bindEvents() {
        const toggle = document.getElementById('chatbot-toggle');
        const container = document.getElementById('chatbot-container');
        const closeBtn = document.getElementById('chatbot-close');
        const minimizeBtn = document.getElementById('chatbot-minimize');
        const form = document.getElementById('chatbot-form');
        const input = document.getElementById('chatbot-input');

        if (!toggle || !container || !form) return;

        // Toggle chatbot
        toggle.addEventListener('click', () => {
            container.classList.toggle('hidden');
            if (!container.classList.contains('hidden')) {
                input.focus();
            }
        });

        // Close chatbot
        closeBtn.addEventListener('click', () => {
            container.classList.add('hidden');
        });

        // Minimize chatbot (for future implementation)
        minimizeBtn.addEventListener('click', () => {
            container.classList.add('hidden');
        });

        // Handle form submission
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const userMessage = input.value.trim();
            if (!userMessage) return;

            this.addMessage(userMessage, 'user');
            input.value = '';

            // Show typing indicator
            this.addMessage('Thinking...', 'bot');
            try {
                const response = await this.askAI(userMessage);
                this.addMessage(response, 'bot', true);
            } catch (error) {
                console.error('AI Error:', error);
                this.addMessage('❌ Sorry, I encountered an error. Please try again later.', 'bot', true);
            }
        });

        // Handle input key events
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                form.dispatchEvent(new Event('submit'));
            }
        });

        // Auto-resize input
        input.addEventListener('input', () => {
            input.style.height = 'auto';
            input.style.height = input.scrollHeight + 'px';
        });
    },

    setupSuggestions() {
        const suggestions = document.querySelectorAll('.ai-suggestion');
        const input = document.getElementById('chatbot-input');

        suggestions.forEach(suggestion => {
            suggestion.addEventListener('click', () => {
                const message = suggestion.getAttribute('data-message');
                input.value = message;
                input.focus();
                
                // Trigger form submission
                const form = document.getElementById('chatbot-form');
                form.dispatchEvent(new Event('submit'));
            });
        });
    },

    addMessage(text, sender, replaceLast = false) {
        const messages = document.getElementById('chatbot-messages');
        
        if (replaceLast && messages.lastChild && messages.lastChild.classList.contains('message')) {
            const messageContent = messages.lastChild.querySelector('.message-content p');
            if (messageContent) {
                messageContent.textContent = text;
            }
            return;
        }

        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}`;
        
        if (sender === 'bot') {
            messageDiv.innerHTML = `
                <div class="ai-avatar">
                    <i class="fas fa-robot"></i>
                </div>
                <div class="message-content">
                    <p>${text}</p>
                </div>
            `;
        } else {
            messageDiv.innerHTML = `
                <div class="message-content">
                    <p>${text}</p>
                </div>
            `;
        }
        
        messages.appendChild(messageDiv);
        messages.scrollTop = messages.scrollHeight;
    },

    async askAI(prompt) {
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": "Bearer ************",   // Replace With Your Api Key
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: "meta-llama/llama-3-8b-instruct",
                messages: [
                    {
                        role: "system",
                        content: `
// Here Add Your Own Prompt
                        `
                    },
                    { role: "user", content: prompt }
                ],
                max_tokens: 200,
                temperature: 0.7
            })
        });

        if (!response.ok) {
            throw new Error(`API Error: ${response.status}`);
        }

        const data = await response.json();
        return data.choices[0].message.content.trim();
    }
};

// ==============================================
// APPLICATION INITIALIZATION
// ==============================================
class Portfolio {
    constructor() {
        this.modules = [
            cursor,
            particles,
            theme,
            navigation,
            scrollAnimations,
            projectFilter,
            contactForm,
            notifications,
            rippleEffect,
            shortcuts,
            fab,
            performance_monitor,
            chatbot
        ];
    }

    init() {
        // Wait for DOM to be fully loaded
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.start());
        } else {
            this.start();
        }
    }

    start() {
        try {
            // Initialize all modules
            this.modules.forEach(module => {
                if (module && typeof module.init === 'function') {
                    module.init();
                }
            });

            // Trigger initial animations
            setTimeout(() => {
                this.triggerInitialAnimations();
            }, 500);

            console.log('✅ Portfolio initialized successfully!');
        } catch (error) {
            console.error('❌ Error initializing portfolio:', error);
        }
    }

    triggerInitialAnimations() {
        // Trigger scroll animations for elements already in view
        elements.fadeElements.forEach(element => {
            if (utils.isViewport(element, CONFIG.scrollThreshold)) {
                element.classList.add('visible');
            }
        });

        // Animate skill bars for visible categories
        elements.skillCategories.forEach(category => {
            if (utils.isViewport(category, 100)) {
                scrollAnimations.animateSkillBars(category);
            }
        });
    }
}

// ==============================================
// ERROR HANDLING
// ==============================================
window.addEventListener('error', (e) => {
    console.error('🔥 JavaScript Error:', e.error);
});

window.addEventListener('unhandledrejection', (e) => {
    console.error('🔥 Unhandled Promise Rejection:', e.reason);
});

// ==============================================
// INITIALIZE APPLICATION
// ==============================================
const app = new Portfolio();
app.init();

// Make app globally available for debugging

window.portfolioApp = app;
