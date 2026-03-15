// ========================================
// SavoMega Service Ky - Website Scripts
// ========================================

document.addEventListener('DOMContentLoaded', () => {
    initNavbar();
    initMobileNav();
    initScrollAnimations();
    initCounters();
    initContactForm();
    initParticles();
    initSmoothScroll();
});

// --- Navbar scroll effect ---
function initNavbar() {
    const navbar = document.getElementById('navbar');
    let lastScroll = 0;

    window.addEventListener('scroll', () => {
        const currentScroll = window.scrollY;

        if (currentScroll > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }

        lastScroll = currentScroll;
    }, { passive: true });
}

// --- Mobile navigation ---
function initMobileNav() {
    const toggle = document.getElementById('navToggle');
    const links = document.getElementById('navLinks');

    if (!toggle || !links) return;

    toggle.addEventListener('click', () => {
        toggle.classList.toggle('active');
        links.classList.toggle('active');
        document.body.style.overflow = links.classList.contains('active') ? 'hidden' : '';
    });

    // Close menu on link click
    links.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            toggle.classList.remove('active');
            links.classList.remove('active');
            document.body.style.overflow = '';
        });
    });
}

// --- Scroll animations ---
function initScrollAnimations() {
    const elements = document.querySelectorAll(
        '.service-card, .feature-item, .area-card, .testimonial-card, ' +
        '.contact-item, .section-header, .why-us-content, .why-us-visual, ' +
        '.contact-form-wrapper, .company-info, .cta-card'
    );

    elements.forEach(el => {
        el.classList.add('animate-on-scroll');
    });

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                // Stagger animation
                const delay = Array.from(entry.target.parentElement.children)
                    .indexOf(entry.target) * 100;

                setTimeout(() => {
                    entry.target.classList.add('visible');
                }, Math.min(delay, 400));

                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

    elements.forEach(el => observer.observe(el));
}

// --- Counter animation ---
function initCounters() {
    const counters = document.querySelectorAll('.stat-number[data-target]');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateCounter(entry.target);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    counters.forEach(counter => observer.observe(counter));
}

function animateCounter(element) {
    const target = parseInt(element.getAttribute('data-target'));
    const duration = 2000;
    const start = performance.now();

    function update(currentTime) {
        const elapsed = currentTime - start;
        const progress = Math.min(elapsed / duration, 1);

        // Ease-out cubic
        const eased = 1 - Math.pow(1 - progress, 3);
        const current = Math.round(eased * target);

        element.textContent = current;

        if (progress < 1) {
            requestAnimationFrame(update);
        }
    }

    requestAnimationFrame(update);
}

// --- Contact form ---
function initContactForm() {
    const form = document.getElementById('contactForm');
    if (!form) return;

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        // Validate
        const name = form.querySelector('#name').value.trim();
        const email = form.querySelector('#email').value.trim();
        const message = form.querySelector('#message').value.trim();
        const consent = form.querySelector('#consent').checked;

        if (!name || !email || !message) {
            showFormError('Täytä kaikki pakolliset kentät.');
            return;
        }

        if (!isValidEmail(email)) {
            showFormError('Tarkista sähköpostiosoite.');
            return;
        }

        if (!consent) {
            showFormError('Hyväksy tietojen käyttö yhteydenottoa varten.');
            return;
        }

        // Show success
        const wrapper = form.closest('.contact-form-wrapper');
        wrapper.innerHTML = `
            <div class="form-success">
                <div class="form-success-icon">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                </div>
                <h4>Kiitos yhteydenotostasi!</h4>
                <p>Olemme vastaanottaneet viestisi ja palaamme asiaan mahdollisimman pian, yleensä vuorokauden sisällä.</p>
            </div>
        `;
    });
}

function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function showFormError(message) {
    // Remove existing error
    const existing = document.querySelector('.form-error');
    if (existing) existing.remove();

    const error = document.createElement('div');
    error.className = 'form-error';
    error.style.cssText = `
        padding: 12px 16px;
        background: rgba(239, 68, 68, 0.1);
        border: 1px solid rgba(239, 68, 68, 0.3);
        border-radius: 8px;
        color: #fca5a5;
        font-size: 0.9rem;
        margin-bottom: 16px;
    `;
    error.textContent = message;

    const form = document.getElementById('contactForm');
    const submitBtn = form.querySelector('button[type="submit"]');
    form.insertBefore(error, submitBtn);

    setTimeout(() => {
        error.style.opacity = '0';
        error.style.transition = 'opacity 0.3s ease';
        setTimeout(() => error.remove(), 300);
    }, 4000);
}

// --- Particles ---
function initParticles() {
    const container = document.getElementById('particles');
    if (!container) return;

    const count = window.innerWidth < 768 ? 15 : 30;

    for (let i = 0; i < count; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';

        const size = Math.random() * 3 + 1;
        const x = Math.random() * 100;
        const duration = Math.random() * 15 + 10;
        const delay = Math.random() * 15;
        const opacity = Math.random() * 0.5 + 0.1;

        particle.style.cssText = `
            left: ${x}%;
            width: ${size}px;
            height: ${size}px;
            animation-duration: ${duration}s;
            animation-delay: ${delay}s;
            opacity: ${opacity};
        `;

        container.appendChild(particle);
    }
}

// --- Smooth scroll ---
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const offset = 80;
                const position = target.getBoundingClientRect().top + window.scrollY - offset;
                window.scrollTo({ top: position, behavior: 'smooth' });
            }
        });
    });
}
