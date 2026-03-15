// SAVOMEGA – Premium Interactive JS v2

document.addEventListener('DOMContentLoaded', () => {
    // === Scroll Animations ===
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                const siblings = entry.target.parentElement.querySelectorAll('[data-animate]');
                const idx = Array.from(siblings).indexOf(entry.target);
                setTimeout(() => entry.target.classList.add('visible'), idx * 120);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

    document.querySelectorAll('[data-animate]').forEach(el => observer.observe(el));

    // === Navbar Scroll ===
    const navbar = document.getElementById('navbar');
    window.addEventListener('scroll', () => {
        navbar.classList.toggle('scrolled', window.pageYOffset > 50);
    }, { passive: true });

    // === Mobile Menu ===
    const menuBtn = document.getElementById('mobileMenuBtn');
    const navLinks = document.getElementById('navLinks');
    if (menuBtn && navLinks) {
        menuBtn.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            const spans = menuBtn.querySelectorAll('span');
            const open = navLinks.classList.contains('active');
            spans[0].style.transform = open ? 'rotate(45deg) translate(5px, 5px)' : '';
            spans[1].style.opacity = open ? '0' : '1';
            spans[2].style.transform = open ? 'rotate(-45deg) translate(5px, -5px)' : '';
        });
        navLinks.querySelectorAll('a').forEach(a => {
            a.addEventListener('click', () => {
                navLinks.classList.remove('active');
                const spans = menuBtn.querySelectorAll('span');
                spans[0].style.transform = '';
                spans[1].style.opacity = '1';
                spans[2].style.transform = '';
            });
        });
    }

    // === Smooth Scroll ===
    document.querySelectorAll('a[href^="#"]').forEach(a => {
        a.addEventListener('click', function(e) {
            const target = document.querySelector(this.getAttribute('href'));
            if (target) { e.preventDefault(); target.scrollIntoView({ behavior: 'smooth' }); }
        });
    });

    // === Hero Particles ===
    const particlesContainer = document.getElementById('particles');
    if (particlesContainer) {
        for (let i = 0; i < 30; i++) {
            const p = document.createElement('div');
            p.className = 'particle';
            p.style.left = Math.random() * 100 + '%';
            p.style.top = Math.random() * 100 + '%';
            p.style.setProperty('--tx', (Math.random() - 0.5) * 200 + 'px');
            p.style.setProperty('--ty', (Math.random() - 0.5) * 200 + 'px');
            p.style.animationDelay = Math.random() * 8 + 's';
            p.style.animationDuration = (6 + Math.random() * 6) + 's';
            p.style.width = p.style.height = (2 + Math.random() * 4) + 'px';
            particlesContainer.appendChild(p);
        }
    }

    // === Parallax on Hero ===
    const hero = document.querySelector('.hero');
    if (hero && window.innerWidth > 768) {
        window.addEventListener('scroll', () => {
            const scroll = window.pageYOffset;
            const overlay = hero.querySelector('.hero-overlay');
            if (overlay && scroll < window.innerHeight) {
                overlay.style.opacity = 0.85 + (scroll / window.innerHeight) * 0.15;
            }
        }, { passive: true });
    }

    // === Active Nav Highlight ===
    const sections = document.querySelectorAll('section[id]');
    window.addEventListener('scroll', () => {
        const pos = window.scrollY + 150;
        sections.forEach(s => {
            const link = document.querySelector(`.nav-links a[href="#${s.id}"]`);
            if (link) {
                const active = pos >= s.offsetTop && pos < s.offsetTop + s.offsetHeight;
                link.style.color = active ? 'var(--cyan)' : '';
            }
        });
    }, { passive: true });

    // === Google Reviews Carousel ===
    const track = document.getElementById('reviewTrack');
    const prevBtn = document.getElementById('reviewPrev');
    const nextBtn = document.getElementById('reviewNext');
    if (track && prevBtn && nextBtn) {
        let pos = 0;
        const card = track.querySelector('.google-review-card');
        const getCardWidth = () => {
            if (!card) return 360;
            const style = window.getComputedStyle(track);
            const gap = parseFloat(style.gap) || 20;
            return card.offsetWidth + gap;
        };
        const getMaxPos = () => {
            const cards = track.querySelectorAll('.google-review-card');
            const wrapper = track.parentElement;
            const totalWidth = cards.length * getCardWidth();
            return Math.max(0, totalWidth - wrapper.offsetWidth);
        };
        const slide = (dir) => {
            const step = getCardWidth();
            const max = getMaxPos();
            pos = Math.max(0, Math.min(pos + dir * step, max));
            track.style.transform = `translateX(-${pos}px)`;
        };
        prevBtn.addEventListener('click', () => slide(-1));
        nextBtn.addEventListener('click', () => slide(1));

        // Touch/swipe support
        let startX = 0, startPos = 0, dragging = false;
        track.addEventListener('touchstart', (e) => { startX = e.touches[0].clientX; startPos = pos; dragging = true; }, { passive: true });
        track.addEventListener('touchmove', (e) => {
            if (!dragging) return;
            const diff = startX - e.touches[0].clientX;
            const max = getMaxPos();
            pos = Math.max(0, Math.min(startPos + diff, max));
            track.style.transition = 'none';
            track.style.transform = `translateX(-${pos}px)`;
        }, { passive: true });
        track.addEventListener('touchend', () => {
            dragging = false;
            track.style.transition = '';
            // Snap to nearest card
            const step = getCardWidth();
            pos = Math.round(pos / step) * step;
            pos = Math.max(0, Math.min(pos, getMaxPos()));
            track.style.transform = `translateX(-${pos}px)`;
        });
    }

    // === Contact Form ===
    const form = document.getElementById('contactForm');
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            const btn = form.querySelector('.btn-submit');
            const originalText = btn.innerHTML;
            btn.innerHTML = '<span>Kiitos! Olemme yhteydessä pian.</span>';
            btn.style.background = '#00C853';
            btn.disabled = true;
            setTimeout(() => {
                btn.innerHTML = originalText;
                btn.style.background = '';
                btn.disabled = false;
                form.reset();
            }, 3000);
        });
    }
});
