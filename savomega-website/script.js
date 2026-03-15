// ========================================
// SavoMega Service Ky — Premium Scripts
// ========================================

document.addEventListener('DOMContentLoaded', () => {
    initCursorGlow();
    initNavbar();
    initMobileNav();
    initScrollAnimations();
    initCounters();
    initContactForm();
    initSmoothScroll();
    initElectricCanvas();
    initParallaxShowcase();
});

// --- Cursor glow that follows mouse ---
function initCursorGlow() {
    const glow = document.getElementById('cursorGlow');
    if (!glow || window.innerWidth < 1024) return;

    let mouseX = 0, mouseY = 0;
    let glowX = 0, glowY = 0;

    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    }, { passive: true });

    function animate() {
        glowX += (mouseX - glowX) * 0.08;
        glowY += (mouseY - glowY) * 0.08;
        glow.style.left = glowX + 'px';
        glow.style.top = glowY + 'px';
        requestAnimationFrame(animate);
    }
    animate();
}

// --- Electric canvas effect in hero ---
function initElectricCanvas() {
    const canvas = document.getElementById('electricCanvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let width, height;
    let bolts = [];
    let particles = [];

    function resize() {
        width = canvas.width = canvas.offsetWidth;
        height = canvas.height = canvas.offsetHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    // Particle class
    class Particle {
        constructor() {
            this.reset();
        }
        reset() {
            this.x = Math.random() * width;
            this.y = Math.random() * height;
            this.size = Math.random() * 2 + 0.5;
            this.speedX = (Math.random() - 0.5) * 0.3;
            this.speedY = (Math.random() - 0.5) * 0.3;
            this.opacity = Math.random() * 0.3 + 0.05;
            this.life = Math.random() * 300 + 200;
            this.age = 0;
        }
        update() {
            this.x += this.speedX;
            this.y += this.speedY;
            this.age++;
            if (this.age > this.life || this.x < 0 || this.x > width || this.y < 0 || this.y > height) {
                this.reset();
            }
        }
        draw() {
            const fade = 1 - (this.age / this.life);
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(59, 130, 246, ${this.opacity * fade})`;
            ctx.fill();
        }
    }

    // Create particles
    const particleCount = Math.min(60, Math.floor(width / 25));
    for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
    }

    // Lightning bolt
    function createBolt() {
        const startX = Math.random() * width;
        const startY = 0;
        const points = [{ x: startX, y: startY }];
        let x = startX;
        let y = startY;
        const targetY = Math.random() * height * 0.7 + height * 0.3;

        while (y < targetY) {
            x += (Math.random() - 0.5) * 80;
            y += Math.random() * 40 + 20;
            points.push({ x, y });
        }

        return {
            points,
            opacity: 0.15 + Math.random() * 0.1,
            life: 8 + Math.random() * 8,
            age: 0,
            width: Math.random() * 1.5 + 0.5
        };
    }

    // Main loop
    function animate() {
        ctx.clearRect(0, 0, width, height);

        // Update and draw particles
        particles.forEach(p => {
            p.update();
            p.draw();
        });

        // Draw connections between close particles
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 120) {
                    const opacity = (1 - dist / 120) * 0.06;
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.strokeStyle = `rgba(59, 130, 246, ${opacity})`;
                    ctx.lineWidth = 0.5;
                    ctx.stroke();
                }
            }
        }

        // Random lightning bolts
        if (Math.random() < 0.008) {
            bolts.push(createBolt());
        }

        // Draw bolts
        bolts = bolts.filter(bolt => {
            bolt.age++;
            if (bolt.age > bolt.life) return false;

            const fade = 1 - (bolt.age / bolt.life);
            ctx.beginPath();
            ctx.moveTo(bolt.points[0].x, bolt.points[0].y);
            for (let i = 1; i < bolt.points.length; i++) {
                ctx.lineTo(bolt.points[i].x, bolt.points[i].y);
            }
            ctx.strokeStyle = `rgba(96, 165, 250, ${bolt.opacity * fade})`;
            ctx.lineWidth = bolt.width * fade;
            ctx.stroke();

            // Glow
            ctx.strokeStyle = `rgba(37, 99, 235, ${bolt.opacity * fade * 0.3})`;
            ctx.lineWidth = bolt.width * fade * 4;
            ctx.stroke();

            return true;
        });

        requestAnimationFrame(animate);
    }
    animate();
}

// --- Navbar scroll effect ---
function initNavbar() {
    const navbar = document.getElementById('navbar');
    window.addEventListener('scroll', () => {
        navbar.classList.toggle('scrolled', window.scrollY > 60);
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
        '.service-card, .service-featured, .why-card, .process-step, ' +
        '.testimonial-card, .contact-card-item, .section-header, ' +
        '.why-us-content, .why-us-cards, .contact-form-wrapper, ' +
        '.company-info-box, .cta-card, .area-layout, .trust-bar-inner'
    );

    elements.forEach(el => el.classList.add('animate-on-scroll'));

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const siblings = entry.target.parentElement.children;
                const index = Array.from(siblings).indexOf(entry.target);
                const delay = Math.min(index * 80, 320);

                setTimeout(() => {
                    entry.target.classList.add('visible');
                }, delay);

                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.08,
        rootMargin: '0px 0px -60px 0px'
    });

    elements.forEach(el => observer.observe(el));
}

// --- Counter animation ---
function initCounters() {
    const counters = document.querySelectorAll('.trust-bar-number[data-target]');

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
    const duration = 2200;
    const start = performance.now();

    function update(currentTime) {
        const elapsed = currentTime - start;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 4);
        element.textContent = Math.round(eased * target);
        if (progress < 1) requestAnimationFrame(update);
    }
    requestAnimationFrame(update);
}

// --- Contact form ---
function initContactForm() {
    const form = document.getElementById('contactForm');
    if (!form) return;

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const name = form.querySelector('#name').value.trim();
        const email = form.querySelector('#email').value.trim();
        const message = form.querySelector('#message').value.trim();
        const consent = form.querySelector('#consent').checked;

        if (!name || !email || !message) { showFormError('Täytä kaikki pakolliset kentät.'); return; }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { showFormError('Tarkista sähköpostiosoite.'); return; }
        if (!consent) { showFormError('Hyväksy tietojen käyttö yhteydenottoa varten.'); return; }

        const wrapper = form.closest('.contact-form-wrapper');
        wrapper.innerHTML = `
            <div class="form-success">
                <div class="form-success-icon">
                    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                </div>
                <h4>Kiitos yhteydenotostasi!</h4>
                <p>Olemme vastaanottaneet viestisi ja palaamme asiaan mahdollisimman pian.</p>
            </div>`;
    });
}

function showFormError(message) {
    const existing = document.querySelector('.form-error');
    if (existing) existing.remove();

    const error = document.createElement('div');
    error.className = 'form-error';
    error.style.cssText = `
        padding: 14px 18px; margin-bottom: 16px;
        background: rgba(239, 68, 68, 0.08);
        border: 1px solid rgba(239, 68, 68, 0.2);
        border-radius: 12px; color: #fca5a5;
        font-size: 0.9rem;
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

// --- Parallax-like showcase movement ---
function initParallaxShowcase() {
    const showcase = document.querySelector('.hero-showcase');
    if (!showcase || window.innerWidth < 1024) return;

    document.addEventListener('mousemove', (e) => {
        const xRatio = (e.clientX / window.innerWidth - 0.5) * 2;
        const yRatio = (e.clientY / window.innerHeight - 0.5) * 2;

        const cards = showcase.querySelectorAll('.showcase-card');
        cards.forEach((card, i) => {
            const depth = (i + 1) * 4;
            const moveX = xRatio * depth;
            const moveY = yRatio * depth;
            card.style.transform = `translate(${moveX}px, ${moveY}px)`;
        });

        const statCard = showcase.querySelector('.showcase-stat-card');
        if (statCard) {
            statCard.style.transform = `translate(${xRatio * 8}px, ${yRatio * 8}px)`;
        }
    }, { passive: true });
}
